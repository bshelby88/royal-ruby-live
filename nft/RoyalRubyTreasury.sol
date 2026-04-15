// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/*
 * Royal Ruby Treasury Splitter
 * ----------------------------
 * A stateless splitter that routes incoming ETH and ERC-20s to three wallets:
 *   - 40% Bryant (founder / operations)
 *   - 35% Dr. Marigny (content authority)
 *   - 25% Diamond/Kava treasury (worker pay + future drops)
 *
 * Anyone can call `release()` to push accumulated balance out according to the split.
 * The splits are immutable at deploy. To change them, deploy a new splitter and
 * update the NFT contracts' withdraw destinations.
 *
 * This is an intentionally simple pattern — no governance, no multisig yet.
 * Upgrade path: replace with OpenZeppelin's PaymentSplitter once volume justifies
 * the gas overhead of per-call accounting, or wrap this with a Safe multisig.
 *
 * Deploy:
 *   forge create src/RoyalRubyTreasury.sol:RoyalRubyTreasury \
 *     --rpc-url base --ledger --broadcast --verify \
 *     --constructor-args <bryant_addr> <marigny_addr> <kava_addr>
 */

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract RoyalRubyTreasury {
    using SafeERC20 for IERC20;

    address public immutable bryant;
    address public immutable marigny;
    address public immutable kava;

    uint256 public constant BRYANT_BPS = 4000;  // 40%
    uint256 public constant MARIGNY_BPS = 3500; // 35%
    uint256 public constant KAVA_BPS = 2500;    // 25%
    uint256 public constant TOTAL_BPS = 10_000;

    event Received(address indexed from, uint256 amount);
    event Released(uint256 totalEth, uint256 bryantShare, uint256 marignyShare, uint256 kavaShare);
    event ERC20Released(address indexed token, uint256 total, uint256 bryantShare, uint256 marignyShare, uint256 kavaShare);

    constructor(address _bryant, address _marigny, address _kava) {
        require(_bryant != address(0) && _marigny != address(0) && _kava != address(0), "zero addr");
        bryant = _bryant;
        marigny = _marigny;
        kava = _kava;
    }

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    // -----------------------------------------------------------------
    // Release — anyone can call; routes current balance to beneficiaries
    // -----------------------------------------------------------------
    function release() external {
        uint256 bal = address(this).balance;
        require(bal > 0, "nothing to release");

        uint256 bShare = (bal * BRYANT_BPS) / TOTAL_BPS;
        uint256 mShare = (bal * MARIGNY_BPS) / TOTAL_BPS;
        uint256 kShare = bal - bShare - mShare; // avoid dust loss

        (bool ok1, ) = bryant.call{value: bShare}("");
        (bool ok2, ) = marigny.call{value: mShare}("");
        (bool ok3, ) = kava.call{value: kShare}("");
        require(ok1 && ok2 && ok3, "transfer failed");

        emit Released(bal, bShare, mShare, kShare);
    }

    // -----------------------------------------------------------------
    // Release ERC-20 (USDC, other tokens) held by this contract
    // -----------------------------------------------------------------
    function releaseToken(address token) external {
        IERC20 t = IERC20(token);
        uint256 bal = t.balanceOf(address(this));
        require(bal > 0, "nothing to release");

        uint256 bShare = (bal * BRYANT_BPS) / TOTAL_BPS;
        uint256 mShare = (bal * MARIGNY_BPS) / TOTAL_BPS;
        uint256 kShare = bal - bShare - mShare;

        t.safeTransfer(bryant, bShare);
        t.safeTransfer(marigny, mShare);
        t.safeTransfer(kava, kShare);

        emit ERC20Released(token, bal, bShare, mShare, kShare);
    }

    // View helpers
    function pendingEth() external view returns (uint256 bShare, uint256 mShare, uint256 kShare) {
        uint256 bal = address(this).balance;
        bShare = (bal * BRYANT_BPS) / TOTAL_BPS;
        mShare = (bal * MARIGNY_BPS) / TOTAL_BPS;
        kShare = bal - bShare - mShare;
    }
}
