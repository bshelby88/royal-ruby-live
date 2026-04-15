# Royal Ruby — OpenSea portfolio manifest

Everything Royal Ruby could list on OpenSea tomorrow, organized by collection, priced, ready to mint. This is the master checklist.

**Total mintable assets right now: 29**

---

## Collection 1 — Ruby Wisdom Drops (ERC-1155, Base)

**Contract:** `nft/RubyWisdomDrops.sol`
**Supply model:** Open edition per drop, 0.0025 ETH (~$6) mint
**Status:** 🟢 Art rendered. Metadata generated. Contract ready.

| # | Asset | Art | Metadata | Video | Ready? |
|---|---|---|---|---|---|
| 1 | Myth #1 — The Soft Pull | `nft/wisdom-drops/art/1.png` | `nft/wisdom-drops/metadata/1.json` | `videos/01-credit-check-myth.mp4` | ✅ |
| 2 | Before/After — 540 to 680 | `nft/wisdom-drops/art/2.png` | `nft/wisdom-drops/metadata/2.json` | `videos/02-540-to-680.mp4` | ✅ |
| 3 | Do Not Close It | `nft/wisdom-drops/art/3.png` | `nft/wisdom-drops/metadata/3.json` | `videos/03-oldest-card.mp4` | ✅ |
| 4 | The 30% Rule Is a Lie | `nft/wisdom-drops/art/4.png` | `nft/wisdom-drops/metadata/4.json` | `videos/04-utilization.mp4` | ✅ |
| 5 | To the One Watching at Midnight | `nft/wisdom-drops/art/5.png` | `nft/wisdom-drops/metadata/5.json` | `videos/05-single-mom.mp4` | ✅ |
| 6 | Don't Pay to Delete | `nft/wisdom-drops/art/6.png` | `nft/wisdom-drops/metadata/6.json` | `videos/06-pay-for-delete.mp4` | ✅ |
| 7 | The 1-in-5 Report | `nft/wisdom-drops/art/7.png` | `nft/wisdom-drops/metadata/7.json` | `videos/07-authority-pov.mp4` | ✅ |
| 8 | Eleven Days to Delete | `nft/wisdom-drops/art/8.png` | `nft/wisdom-drops/metadata/8.json` | `videos/08-dispute-receipts.mp4` | ✅ |
| 9 | Stewardship Is Spiritual | `nft/wisdom-drops/art/9.png` | `nft/wisdom-drops/metadata/9.json` | `videos/09-faith-finance.mp4` | ✅ |
| 10 | Four Documents, One USB | `nft/wisdom-drops/art/10.png` | `nft/wisdom-drops/metadata/10.json` | `videos/10-usb-cliffhanger.mp4` | ✅ |

## Collection 2 — Ruby Dispute Vault Pass (ERC-721, Base)

**Contract:** `nft/RubyDisputeVaultPass.sol`
**Supply:** 500 editions, 0.019 ETH (~$47) mint
**Status:** 🟢 Contract ready. Metadata ready. Art sample generated.

| # | Asset | Ready? |
|---|---|---|
| 1 | Pass #001 Genesis Founder | ✅ Art sample rendered at `nft/art/1.png` |
| 2 | Pass #002 | ✅ |
| 3 | Pass #003 | ✅ |
| ... | Passes 4-500 | 🟡 Need batch art generation (same template, varying edition number) |

To generate 497 more Pass variants: run `video-engine/covers.py` with a loop on `render_nft_pass()`.

## Collection 3 — Ruby Starter Seals (ERC-721, Base)

**Contract:** Clone of Dispute Vault Pass with renamed name/symbol
**Supply:** 100 editions, 0.007 ETH (~$17) mint
**Status:** 🟡 Contract template exists. Art template exists. Needs 1 deploy + art variant.

| # | Asset | Ready? |
|---|---|---|
| 1–100 | Starter Seal editions | 🟡 Reuse NFT pass template with "STARTER SEAL" overlay |

---

## Bonus assets — not NFTs, but brand pieces ready to cross-promote

| Asset | Location | Use case |
|---|---|---|
| Royal Ruby landing OG image | `og.png` | All social shares of the root URL |
| NFT page OG image | `og-nft.png` | All shares of `/nft` |
| Starter Pack cover | `images/products/ruby-starter-pack-cover.png` | Stripe, Gumroad, social |
| Dispute Vault cover | `images/products/ruby-dispute-vault-cover.png` | Stripe, Gumroad, social |
| Credit Stacker cover | `images/products/ruby-credit-stacker-cover.png` | Stripe, Gumroad, social |

---

## Launch order (recommended)

1. **Week 1 — Wisdom Drops** (10 drops, 1/day). Cheapest risk. Proves the minting flow. Builds a holder list.
2. **Week 2 — Dispute Vault Pass flagship**. Higher price. Wisdom Drop holders get 24-hour early access.
3. **Week 3 — Starter Seals**. Cheaper "gateway" pass for the fiat-adjacent audience.
4. **Week 4 — Retrospective + Kava treasury onboarding**. Holders get added to the Diamond/Kava club roster.

---

## What I need from you to actually ship

1. **Install Foundry** — `curl -L https://foundry.paradigm.xyz | bash && foundryup`
2. **Hardware wallet with ~$10 ETH on Base** — Ledger or Trezor (NEVER software wallet for mainnet deploy)
3. **OpenSea account** linked to the deployer wallet — free
4. **web3.storage account** for IPFS pinning — free
5. **Basescan API key** for contract verification — free

Once you have those 5 things, deploy takes ~30 minutes per collection. I walk you through it end-to-end.
