# Ruby Dispute Vault Pass — Base network deploy guide

End-to-end: from zero to minted NFT + listed on OpenSea. ~45 min the first time, 5 min for every drop after that.

## Prerequisites

- [ ] A wallet (MetaMask, Coinbase Wallet, or Rainbow) with a **seed phrase you control**
- [ ] ~$5 USD of ETH on **Base mainnet** (bridge from mainnet via [bridge.base.org](https://bridge.base.org) or buy directly on Coinbase → withdraw to Base)
- [ ] A free [web3.storage](https://web3.storage) account (IPFS pinning, generous free tier)
- [ ] Foundry installed: `curl -L https://foundry.paradigm.xyz | bash && foundryup`
- [ ] Basescan API key (free at [basescan.org](https://basescan.org/myapikey)) — for contract verification
- [ ] 30 minutes uninterrupted

---

## Step 1 — Project setup

```bash
cd ~/Desktop/Royal-Ruby-Live/nft
forge init rdvp --no-git
cd rdvp
forge install OpenZeppelin/openzeppelin-contracts --no-commit
cp ../RubyDisputeVaultPass.sol src/RubyDisputeVaultPass.sol
rm src/Counter.sol test/Counter.t.sol  # remove template files
```

Add to `foundry.toml`:

```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
solc_version = "0.8.24"
optimizer = true
optimizer_runs = 200
remappings = [
  "@openzeppelin/=lib/openzeppelin-contracts/"
]

[rpc_endpoints]
base = "https://mainnet.base.org"
base_sepolia = "https://sepolia.base.org"

[etherscan]
base = { key = "${BASESCAN_API_KEY}", url = "https://api.basescan.org/api" }
```

Build it:

```bash
forge build
```

You should see: `Compiler run successful!`

---

## Step 2 — Testnet dry run (Base Sepolia)

Get free Base Sepolia ETH from [coinbase.com/faucets/base-ethereum-sepolia-faucet](https://coinbase.com/faucets/base-ethereum-sepolia-faucet).

```bash
export WALLET_PRIVATE_KEY=0x...your_test_wallet_key
export DEPLOYER_ADDRESS=0x...same_wallet
export BASESCAN_API_KEY=your_key_here

forge create src/RubyDisputeVaultPass.sol:RubyDisputeVaultPass \
  --rpc-url base_sepolia \
  --private-key $WALLET_PRIVATE_KEY \
  --broadcast \
  --verify \
  --constructor-args "ipfs://PLACEHOLDER_CID/" $DEPLOYER_ADDRESS
```

**You should never paste a mainnet private key into any command line. Use a hardware wallet + `--ledger` flag for mainnet.**

---

## Step 3 — Upload art + metadata to IPFS

1. Generate or commission 500 PNG images sized 2000×2000 (or 1 master image + 500 numbered variants — simpler for a pass NFT)
2. Upload the image folder to [web3.storage](https://web3.storage) → copy the folder CID
3. Edit every `metadata/N.json` file:
   - Replace `ipfs://REPLACE_WITH_IMAGE_CID/` with `ipfs://<your-folder-cid>/`
4. Upload the `metadata` folder to web3.storage → copy the folder CID
5. Your base URI is now `ipfs://<metadata-folder-cid>/`

**Unlockable content (the actual PDF):** OpenSea has a per-item "unlockable content" field. After mint, edit the collection on OpenSea and paste the secret download link (a Gumroad hidden product URL or a password-protected page on royalruby.io). Only the current holder can see it.

---

## Step 4 — Mainnet deploy (Base)

**Use a hardware wallet.** Replace `--private-key` with `--ledger` or `--trezor`. The deployer address becomes the contract owner — keep it safe.

```bash
forge create src/RubyDisputeVaultPass.sol:RubyDisputeVaultPass \
  --rpc-url base \
  --ledger \
  --broadcast \
  --verify \
  --constructor-args "ipfs://<metadata-folder-cid>/" <your-treasury-address>
```

Note the deployed contract address from the output.

---

## Step 5 — Open minting + list on OpenSea

```bash
# Open minting
cast send <CONTRACT_ADDRESS> "setMintOpen(bool)" true \
  --rpc-url base --ledger

# (Optional) adjust price — default is 0.019 ETH (~$47)
cast send <CONTRACT_ADDRESS> "setMintPrice(uint256)" 19000000000000000 \
  --rpc-url base --ledger
```

OpenSea auto-indexes new Base contracts within ~10 minutes. To speed things up:

1. Go to `https://opensea.io/assets/base/<CONTRACT_ADDRESS>/1`
2. Click **Refresh metadata** on one token — it pulls in the whole collection
3. Go to the collection page → **Edit collection** → set royalties (already hard-coded at 5%), banner, description, social links
4. Enable **Unlockable content** on each item → paste the PDF download link

---

## Step 6 — Wire the mint UI (optional, site-hosted)

Two options:

**Option A — OpenSea only.** Cheapest. Buyers go to `https://opensea.io/collection/ruby-dispute-vault-pass` and mint directly. No custom UI. Done.

**Option B — Branded mint page on royalruby.io.** Use `thirdweb` or `wagmi + RainbowKit` to build a simple "Connect wallet → Mint" button on a new page `/nft.html`. Walk-me-through files live in `nft/mint-page/` (not generated yet — ask when ready).

For launch, go with A. It's instant and free.

---

## Step 7 — Promote the mint in content

In the TikTok batch, the "Ruby Dispute Vault" CTA points to `royalruby.io/tt`. Update it to also mention the NFT drop for the crypto-curious audience. Suggested overlay on one video: **"500 passes. Base network. Link in bio."**

Add a new button on the site landing page: **"Hold a Pass → Unlock the Vault + join Diamond Kava"**. I can wire this when you have the contract address.

---

## Fulfillment reality check

The PDF is what buyers actually want. The NFT is the delivery + community key.

| Buyer type | Rail | What happens |
|---|---|---|
| Fiat / cautious | Stripe Payment Link | Pays $47, immediate download link on confirmation page |
| Creator / affiliate | Gumroad | Pays $47, Gumroad delivers, affiliate gets 30% |
| Crypto-native | OpenSea / Base mint | Mints pass ~$47 ETH, unlocks PDF + Diamond Kava club access |

All three are available in parallel. The NFT rail is *additive*, not a replacement.

---

## Costs

| Item | One-time | Ongoing |
|---|---|---|
| Base mainnet deploy gas | ~$2–5 USD | — |
| OpenZeppelin contracts | free | free |
| IPFS pinning (web3.storage) | free | free up to 5 GB |
| Basescan verification | free | free |
| OpenSea listing | free | 2.5% of each sale |
| Unlockable content feature | free | free |
| **Total to go live** | **~$5** | **2.5% of sales + 5% royalty back to you** |
