# OpenSea Collection Setup & Listing Runbook — historical draft

> **NOT VERIFIED OR ACTIVE:** Retained planning material. Do not execute, list, purchase, or publish coordinates and claims below without independent on-chain verification. Customer surfaces remain Coming Soon at `royalruby.io`.
=============================================================================

This operational runbook provides the exact steps for Bryant Shelby to connect the Deployer Wallet, brand the **Ruby Wisdom Drops** on-chain collection on **Base mainnet**, and list the first 3–5 items to activate secondary trading and indexing on OpenSea.

---

## 📋 Collection Coordinates & Assets

*   **Deployer Wallet Address**: `0x6bDea25c368c32eeCb31054dd4766Fc8125e4e02`
*   **Contract Target**: **RubyWisdomDrops** (ERC-1155 on Base Mainnet)
*   **Collection Logo**: `/home/sprit/roxue88/brand/icon-512.png` *(70.2 KB)*
*   **Collection Banner**: `/home/sprit/Royal-Ruby-Live/og-nft.png` *(718.7 KB)*
*   **Default Item Price**: `0.0025 ETH` (~$6–$8 USD)

---

## 🚶‍♂️ Step-by-Step Execution Plan

### Step 1: Connect the Deployer Wallet on OpenSea
1. Open your browser and navigate to **[OpenSea](https://opensea.io/)**.
2. Click **Login** or the **Wallet Icon** in the top right corner.
3. Select your wallet provider (MetaMask, Coinbase Wallet, or Rainbow) and connect using the **Deployer Wallet** `0x6bDea25c368c32eeCb31054dd4766Fc8125e4e02`.
   > [!WARNING]
   > Ensure you are connected to the **Base mainnet** network in your wallet interface. If your wallet is on Ethereum or Sepolia, switch it to Base.

### Step 2: Import & Claim the Deployed Contract
1. Navigate to your OpenSea Studio: **[OpenSea Studio - Collections](https://opensea.io/studio/collections)**.
2. If the contract was deployed through Foundry (`forge create`), OpenSea will automatically detect the contract owned by your wallet under **Created Collections**.
3. If it does not appear immediately:
   - Go to `https://opensea.io/assets/base/<CONTRACT_ADDRESS>/1` (replace `<CONTRACT_ADDRESS>` with the actual contract address printed during your mainnet deployment in `nft/DEPLOY.md`).
   - Click the **Refresh Metadata** button in the top-right of the item view. This forces OpenSea's indexer to crawl the contract, after which it will display in your Studio.

### Step 3: Brand the Collection
In the OpenSea Studio panel, click on your collection and click **Edit Collection** or **Collection Settings**:

1. **Logo Image**: Upload `/home/sprit/roxue88/brand/icon-512.png`.
2. **Featured Image**: Upload `/home/sprit/Royal-Ruby-Live/og-nft.png`.
3. **Banner Image**: Upload `/home/sprit/Royal-Ruby-Live/og-nft.png`.
4. **Collection Name**: `Ruby Wisdom Drops`
5. **Description**:
   ```text
   The Royal Ruby Wisdom Drops are a premium series of on-chain collectibles turning elite financial discipline, credit repair frameworks, and wealth-building mechanics into permanent, accessible artifacts on the Base network. Curated by Bryant Shelby & Dr. Herman Marigny III. Greater Wisdom. On-chain.
   ```
6. **URL Slug**: `ruby-wisdom-drops`
7. **Category**: `Utility` or `Virtual Worlds`

### Step 4: Configure Creator Royalties
OpenSea supports the ERC-2981 royalty standard (which is hardcoded to 5% in our Solidity contract), but you must configure your payout address on OpenSea to capture secondary market sales correctly:

1. In **Earnings** or **Royalties** settings:
2. Set the percentage fee to `5.0%`.
3. Set the payout recipient address to your treasury or deployer wallet: `0x6bDea25c368c32eeCb31054dd4766Fc8125e4e02`.

### Step 5: Enable Unlockable Content
For each of your token IDs (1 through 10), configure the **Unlockable Content** to reward collectors with downloadable resources (the scripts, cheat sheets, and templates):

1. Go to the collection page on OpenSea.
2. For **Token ID 1 (Myth #1 — The Soft Pull)**:
   - Click **Edit Item**.
   - Enable **Unlockable Content**.
   - Paste the download/access link: `https://royalruby.co/read?product=ruby-starter-pack` (or your private secure document download URL).
3. Repeat this process for the remaining active drops (IDs 2 through 10) using the corresponding resources listed in `nft/opensea-plan.md`.

### Step 6: List Floor Price Items (3–5 Drops)
To kickstart indexing, organically boost search presence, and allow open purchases, list **3–5 items** for sale:

1. Navigate to the item page for **Token ID 1**.
2. Click **List for Sale**.
3. Select **Fixed Price**.
4. Set the price to `0.0025 ETH`.
5. Set the duration to **6 months** or **No Expiration**.
6. Click **Complete Listing** and sign the message in your wallet.
7. Repeat for **Token ID 2** and **Token ID 3** (and up to ID 5) to establish an active floor.

---

## 🛡️ Verification Check

Once listed, verify everything is correct:
1. Visit `https://opensea.io/collection/ruby-wisdom-drops`.
2. Ensure the logo, description, and banner images render crisply without compression artifacts.
3. Verify that the listed items show a price of `0.0025 ETH` on the Base network.
4. Attempt a test purchase or have a community member mint one to confirm that the **Unlockable Content** becomes visible and accessible to the buyer.
