// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/*
 * Ruby Wisdom Drops — ERC-1155
 * ----------------------------
 * Open-edition multi-token collection. Each tokenId is one video drop.
 * Ten drops total, matched to the 10 TikTok video NFTs.
 *
 * Pricing: 0.0025 ETH per mint (~$6 at launch).
 * Supply: open edition, optional per-drop cap via `setCap`.
 * Minting window: per-drop toggle via `setOpen`.
 *
 * Royalty: 5% via ERC-2981 to the collection owner (wire to Splitter later).
 *
 * Deploy steps are identical to Dispute Vault Pass — see nft/DEPLOY.md.
 */

import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol";
import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract RubyWisdomDrops is ERC1155Supply, Ownable, IERC2981 {
    using Strings for uint256;

    uint256 public constant TOTAL_DROPS = 10;
    uint256 public mintPrice = 0.0025 ether;

    // Per-drop state
    mapping(uint256 => bool) public dropOpen;
    mapping(uint256 => uint256) public dropCap; // 0 = no cap (open edition)

    string private _baseTokenURI;

    event DropMinted(address indexed to, uint256 indexed tokenId, uint256 quantity);
    event DropToggled(uint256 indexed tokenId, bool open);
    event BaseURIUpdated(string baseURI);

    constructor(string memory initialBaseURI, address initialOwner)
        ERC1155(string(abi.encodePacked(initialBaseURI, "{id}.json")))
        Ownable(initialOwner)
    {
        _baseTokenURI = initialBaseURI;
    }

    // --------------------------------------------------------------------
    // Minting
    // --------------------------------------------------------------------
    function mint(uint256 tokenId, uint256 quantity) external payable {
        require(tokenId >= 1 && tokenId <= TOTAL_DROPS, "bad drop");
        require(dropOpen[tokenId], "drop closed");
        require(quantity > 0 && quantity <= 20, "bad qty");
        require(msg.value >= mintPrice * quantity, "underpaid");

        uint256 cap = dropCap[tokenId];
        if (cap > 0) {
            require(totalSupply(tokenId) + quantity <= cap, "sold out");
        }

        _mint(msg.sender, tokenId, quantity, "");
        emit DropMinted(msg.sender, tokenId, quantity);

        uint256 overpay = msg.value - (mintPrice * quantity);
        if (overpay > 0) {
            (bool ok, ) = msg.sender.call{value: overpay}("");
            require(ok, "refund failed");
        }
    }

    function ownerMint(address to, uint256 tokenId, uint256 quantity) external onlyOwner {
        require(tokenId >= 1 && tokenId <= TOTAL_DROPS, "bad drop");
        _mint(to, tokenId, quantity, "");
    }

    // --------------------------------------------------------------------
    // Admin
    // --------------------------------------------------------------------
    function setOpen(uint256 tokenId, bool open) external onlyOwner {
        require(tokenId >= 1 && tokenId <= TOTAL_DROPS, "bad drop");
        dropOpen[tokenId] = open;
        emit DropToggled(tokenId, open);
    }

    function setAllOpen(bool open) external onlyOwner {
        for (uint256 i = 1; i <= TOTAL_DROPS; ++i) {
            dropOpen[i] = open;
            emit DropToggled(i, open);
        }
    }

    function setCap(uint256 tokenId, uint256 cap) external onlyOwner {
        require(tokenId >= 1 && tokenId <= TOTAL_DROPS, "bad drop");
        dropCap[tokenId] = cap;
    }

    function setMintPrice(uint256 newPrice) external onlyOwner {
        mintPrice = newPrice;
    }

    function setBaseURI(string calldata baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
        _setURI(string(abi.encodePacked(baseURI, "{id}.json")));
        emit BaseURIUpdated(baseURI);
    }

    function withdraw(address payable to) external onlyOwner {
        uint256 bal = address(this).balance;
        (bool ok, ) = to.call{value: bal}("");
        require(ok, "withdraw failed");
    }

    // --------------------------------------------------------------------
    // Metadata
    // --------------------------------------------------------------------
    function uri(uint256 tokenId) public view override returns (string memory) {
        require(tokenId >= 1 && tokenId <= TOTAL_DROPS, "bad drop");
        return string(abi.encodePacked(_baseTokenURI, tokenId.toString(), ".json"));
    }

    // --------------------------------------------------------------------
    // ERC-2981 royalty
    // --------------------------------------------------------------------
    function royaltyInfo(uint256, uint256 salePrice)
        external
        view
        override
        returns (address, uint256)
    {
        return (owner(), (salePrice * 500) / 10_000);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC1155)
        returns (bool)
    {
        return interfaceId == type(IERC2981).interfaceId || super.supportsInterface(interfaceId);
    }
}
