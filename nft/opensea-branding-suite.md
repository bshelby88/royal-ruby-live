# 🎨 OpenSea Creator Branding Suite — Royal Ruby Collections

This document provides copy-paste ready metadata, images, and step-by-step procedures to turn your raw, unbranded smart contracts on Base Mainnet into premium, high-converting OpenSea collections.

---

## 💎 Collection 1: Ruby Wisdom Drops (ERC-1155)
* **Contract Address (Base Mainnet):** `0xf582ac875d3e19e3adec7eb7548fe89b3b77cb6b`
* **Creator / Admin Wallet:** `0x6bDea25c368c32eeCb31054dd4766Fc8125e4e02`
* **Royalty Setup:** 5% routed to `0x9e6A0CE78Bb2915d0758cc6A1cE8eA77f1B71770`

### 📝 Brand Profile & Copy-Paste Metadata
* **Collection Name:** `Royal Ruby Wisdom Drops`
* **Token Symbol:** `RUBYWD`
* **Custom URL Slug:** `royal-ruby-wisdom-drops`
* **Short Description (Social Bios):**
  > Ten on-chain video collectibles unpacking the hidden rules of credit, leverage, and spiritual stewardship. Deployed on Base.
* **Long Description (OpenSea Collection Page):**
  > Deployed on Base by Dr. Herman Marigny III and the Royal Ruby team, the **Royal Ruby Wisdom Drops** are a collection of ten on-chain video collectibles. Each drop tackles a fundamental credit myth or wealth principle with rigorous accuracy, moving beyond generic finance advice into genuine, action-oriented stewardship. 
  > 
  > **Unlockable Utility:** Holders of each Drop receive direct access to high-resolution downloads, interactive spreadsheets, action decision matrices, and priority early-access lists for the upcoming flagship **Ruby Dispute Vault Pass**.
  > 
  > *Stewardship is spiritual. Own your assets. Reclaim your leverage.*

### 🖼️ Visual Assets (Generate or Locate)
* **Logo Image (500 x 500 px):** Use `/home/sprit/royal-ruby-live/favicon.svg` or a cropped circular version of `/home/sprit/royal-ruby-live/og.png`.
* **Featured Image (600 x 400 px):** Use `/home/sprit/royal-ruby-live/og-nft.webp`.
* **Banner Image (1400 x 400 px):** Elegant deep-crimson-to-gold-deep gradient matching the brand palette.

---

## 🎟️ Collection 2: Diamond Genesis Drops (ERC-1155)
* **Contract Address (Base Mainnet):** `0xc771263915cbE17d0f2835319347De279532E253`
* **Creator / Admin Wallet:** `0x6bDea25c368c32eeCb31054dd4766Fc8125e4e02`
* **Royalty Setup:** 5% routed to `0x9e6A0CE78Bb2915d0758cc6A1cE8eA77f1B71770`

### 📝 Brand Profile & Copy-Paste Metadata
* **Collection Name:** `Diamond Genesis Drops`
* **Token Symbol:** `DGD`
* **Custom URL Slug:** `diamond-genesis-drops`
* **Short Description (Social Bios):**
  > Flagship genesis passes unlocking the Diamond-Kava club, custom financial vaults, and exclusive co-creation portals on Base.
* **Long Description (OpenSea Collection Page):**
  > The **Diamond Genesis Drops** represent the highest tier of agentic membership in the Royal Ruby ecosystem. Designed for builders, field techs, and finance developers, this collection serves as a cryptographic key unlocking advanced automations and premier group channels.
  > 
  > **Unlockable Utility:** 
  > - Instant integration with local LLM evaluators (ClawMode sandbox)
  > - Dynamic access to the Diamond/Kava exclusive discussion rooms
  > - Multi-sig community governance rights and future treasury allocation voting
  > 
  > *Constructed for extreme technical resilience and durable wealth.*

### 🖼️ Visual Assets
* **Logo Image (500 x 500 px):** Clean metallic emblem with obsidian and gold-leaf accents.
* **Featured Image (600 x 400 px):** `/home/sprit/royal-ruby-live/images/products/ruby-dispute-vault-cover.png`.
* **Banner Image (1400 x 400 px):** Deep charcoal slate texture with gold laser-etched lines.

---

## 🛠️ Step-by-Step OpenSea Branding Instructions

To apply these brand descriptions and assets, perform the following steps with the deployer wallet connected:

1. **Connect & Login:**
   - Go to [OpenSea Studio](https://opensea.io/studio).
   - Click **Connect wallet** in the top-right corner.
   - Choose MetaMask, Coinbase Wallet, or Rainbow, and connect with the **Admin/Deployer Wallet** (`0x6bDea25c368c32eeCb31054dd4766Fc8125e4e02`).

2. **Locate Existing Collections:**
   - In the OpenSea Studio Dashboard, click **Created Collections** or **Import an existing contract**.
   - Paste the smart contract address (`0xf582...` or `0xc771...`) if it is not automatically displayed. OpenSea will scan the Base network and bind the contract to your profile.

3. **Configure Settings:**
   - Click **Edit details** on the collection card.
   - **Upload Images:** Drop the Logo, Featured Image, and Banner into their respective slots.
   - **Enter Metadata:** Paste the Collection Name, Custom URL Slug, and Description from this document.
   - **Set Category:** Choose `Art` or `Utility` / `Memberships`.

4. **Set Royalties (Creator Earnings):**
   - Navigate to the **Earnings** or **Royalties** tab.
   - Click **Add payout address**.
   - Input the **Receive Address**: `0x9e6A0CE78Bb2915d0758cc6A1cE8eA77f1B71770`.
   - Set the percentage to `5.00%`.
   - Click **Save**. This ensures any secondary sale on OpenSea automatically routes 5% royalty to your active receive wallet!

5. **List Your First NFT Items:**
   - Under the collection's item manager, click on individual token IDs (0 to 9).
   - Click **List for sale**.
   - Choose **Fixed price** and set the listing to `0.0025 ETH`.
   - Sign the listing request in your wallet (listing is gas-free on OpenSea).
