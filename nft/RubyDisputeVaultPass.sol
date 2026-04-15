// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/*
 * Ruby Dispute Vault Pass — ERC-721
 * ---------------------------------
 * A gated pass NFT for Royal Ruby holders.
 * Holders unlock:
 *   - The Ruby Dispute Vault PDF (unlockable content on OpenSea)
 *   - Auto-enrollment in the Diamond/Kava rewards club
 *   - Future drops (templates, cohort access, recorded sessions)
 *
 * Designed for Base mainnet. Uses OpenZeppelin Contracts v5.
 * Total supply capped. Per-wallet cap. Price in ETH.
 *
 * Deploy path:
 *   1. Install Foundry (curl -L https://foundry.paradigm.xyz | bash && foundryup)
 *   2. forge init royal-ruby-nft --no-git
 *   3. Drop this file into src/RubyDisputeVaultPass.sol
 *   4. forge install OpenZeppelin/openzeppelin-contracts
 *   5. forge build
 *   6. forge create ... (see nft/DEPLOY.md)
 */

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract RubyDisputeVaultPass is ERC721Enumerable, Ownable {
    using Strings for uint256;

    // -----------------------------------------------------------------------
    // Immutable config
    // -----------------------------------------------------------------------
    uint256 public constant MAX_SUPPLY = 500;
    uint256 public constant MAX_PER_WALLET = 3;
    uint256 public mintPrice = 0.019 ether; // ~$47 at deploy; update via setMintPrice

    string private _baseTokenURI;
    bool public mintOpen = false;

    // -----------------------------------------------------------------------
    // Events
    // -----------------------------------------------------------------------
    event Minted(address indexed to, uint256 indexed tokenId);
    event MintOpened(bool open);
    event BaseURIUpdated(string baseURI);

    constructor(string memory initialBaseURI, address initialOwner)
        ERC721("Ruby Dispute Vault Pass", "RDVP")
        Ownable(initialOwner)
    {
        _baseTokenURI = initialBaseURI;
    }

    // -----------------------------------------------------------------------
    // Minting
    // -----------------------------------------------------------------------
    function mint(uint256 quantity) external payable {
        require(mintOpen, "mint closed");
        require(quantity > 0 && quantity <= MAX_PER_WALLET, "bad qty");
        require(balanceOf(msg.sender) + quantity <= MAX_PER_WALLET, "wallet cap");
        require(totalSupply() + quantity <= MAX_SUPPLY, "sold out");
        require(msg.value >= mintPrice * quantity, "underpaid");

        for (uint256 i; i < quantity; ++i) {
            uint256 tokenId = totalSupply() + 1;
            _safeMint(msg.sender, tokenId);
            emit Minted(msg.sender, tokenId);
        }

        // Refund overpayment
        uint256 overpay = msg.value - (mintPrice * quantity);
        if (overpay > 0) {
            (bool ok, ) = msg.sender.call{value: overpay}("");
            require(ok, "refund failed");
        }
    }

    function ownerMint(address to, uint256 quantity) external onlyOwner {
        require(totalSupply() + quantity <= MAX_SUPPLY, "exceeds cap");
        for (uint256 i; i < quantity; ++i) {
            _safeMint(to, totalSupply() + 1);
        }
    }

    // -----------------------------------------------------------------------
    // Admin
    // -----------------------------------------------------------------------
    function setMintOpen(bool open) external onlyOwner {
        mintOpen = open;
        emit MintOpened(open);
    }

    function setMintPrice(uint256 newPrice) external onlyOwner {
        mintPrice = newPrice;
    }

    function setBaseURI(string calldata baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
        emit BaseURIUpdated(baseURI);
    }

    function withdraw() external onlyOwner {
        uint256 bal = address(this).balance;
        (bool ok, ) = owner().call{value: bal}("");
        require(ok, "withdraw failed");
    }

    // -----------------------------------------------------------------------
    // Metadata
    // -----------------------------------------------------------------------
    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return string(abi.encodePacked(_baseTokenURI, tokenId.toString(), ".json"));
    }

    // -----------------------------------------------------------------------
    // Royalty hint for OpenSea — ERC-2981 style
    // Uses 5% creator royalty (500 bps).
    // -----------------------------------------------------------------------
    function royaltyInfo(uint256, uint256 salePrice)
        external
        view
        returns (address, uint256)
    {
        return (owner(), (salePrice * 500) / 10_000);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721Enumerable)
        returns (bool)
    {
        // ERC-2981 interface id
        return interfaceId == 0x2a55205a || super.supportsInterface(interfaceId);
    }
}
