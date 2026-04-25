# Manifold Creator — no-code drop path

If you want to skip deploying Solidity yourself, **Manifold Studio** is the best no-code path for Base-chain NFT drops. It's what most credential creators use for limited-edition drops without writing a contract.

## Why Manifold

- **Zero Solidity.** Connect wallet → upload art → set price → publish.
- **Your own contract.** Unlike OpenSea drops, Manifold deploys *your* contract under *your* ownership. You keep the royalties and the upgrade path.
- **Unlockable content** supported natively.
- **No platform fees on mints** (they earn on reveals + optional SaaS tier — free for this use case).
- **Base chain supported** as of late 2024.
- **Warpcast Frame support** built-in for Farcaster distribution.

## What you're listing

Use Manifold to launch **Ruby Wisdom Drops** — the 10 video NFTs. For the Dispute Vault Pass flagship, we still recommend deploying the hardened ERC-721 in `nft/RubyDisputeVaultPass.sol` for full control (we already wrote it, so why not use it). But Wisdom Drops is the perfect Manifold use case: 10 separate drops, each an open edition, each with unlockable content.

## Step-by-step

### 1. Sign up at Manifold
- Go to [studio.manifold.xyz](https://studio.manifold.xyz)
- Connect the wallet you'll use as creator (same wallet that owns royalty rights)
- Choose **Base** as your primary chain

### 2. Create a new claim contract
- Studio → **New Claim Page**
- Contract type: **ERC-1155 Claim Page**
- Name: `Ruby Wisdom Drops`
- Symbol: `RWD`
- Base: ✅

### 3. For each of 10 drops:
Click **+ New Token** and fill in from the matching `drop-N.json` file in this folder.

Each file has:
- `name`
- `description`
- `price` (0.0025 ETH)
- `image` (point at `../wisdom-drops/art/N.png`)
- `animation_url` (point at `../../videos/SLUG.mp4`)
- `unlockable` (the script + worksheet)

### 4. Configure the drop per token
- **Mint type:** Open edition
- **Duration:** Start immediately, no end (or 72-hour rolling window if you prefer urgency)
- **Per-wallet cap:** 10 (prevents one whale hoarding)
- **Price:** 0.0025 ETH
- **Royalties:** 5% to creator wallet (or to Treasury Splitter once deployed)

### 5. Upload unlockable content
In Manifold's unlockable content field, paste:
- A link to a hidden Gumroad download for the script/worksheet, OR
- A password-protected page URL on `royalruby.io/unlock/<slug>`, OR
- Direct text content (Manifold supports rich-text unlockables)

### 6. Publish
Each drop goes live the moment you click publish. Share the Manifold page URL or cross-post to OpenSea (Manifold auto-syncs the contract).

## Drop files — ready to copy

Each JSON below is a complete Manifold drop definition.

- [drop-01.json](./drop-01.json) — Myth #1: The Soft Pull
- [drop-02.json](./drop-02.json) — Before/After: 540 to 680
- [drop-03.json](./drop-03.json) — Do Not Close It
- [drop-04.json](./drop-04.json) — The 30% Rule Is a Lie
- [drop-05.json](./drop-05.json) — To the One Watching at Midnight
- [drop-06.json](./drop-06.json) — Don't Pay to Delete
- [drop-07.json](./drop-07.json) — The 1-in-5 Report
- [drop-08.json](./drop-08.json) — Eleven Days to Delete
- [drop-09.json](./drop-09.json) — Stewardship Is Spiritual
- [drop-10.json](./drop-10.json) — Four Documents, One USB
