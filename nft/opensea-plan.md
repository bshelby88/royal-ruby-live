# OpenSea portfolio plan — Royal Ruby universe

**The strategy:** turn every piece of existing content into an on-chain collectible. Not because NFTs are magic, but because they create a *secondary audience* of crypto-native buyers who would never touch Stripe or Gumroad. Every piece of content you already own becomes a second monetization surface with zero duplicated work.

## Three collections, not one

| Collection | Supply | Price | What each token is |
|---|---|---|---|
| **Ruby Dispute Vault Pass** | 500 | 0.019 ETH (~$47) | Holder key → unlocks the PDF + Kava club (already built, contract in `nft/RubyDisputeVaultPass.sol`) |
| **Ruby Wisdom Drops** | 10 editions × open | 0.0025 ETH (~$6) each | Each of the 10 TikTok videos becomes a collectible video NFT with the script as unlockable content |
| **Ruby Starter Seals** | 100 | 0.007 ETH (~$17) | Holder key → Starter Pack PDF + checklist + bonus worksheet |

The Dispute Vault Pass is the flagship. The Wisdom Drops are the loss-leader — cheap, high-volume, they put the brand in front of Farcaster/X/OpenSea browsers. The Starter Seals are the fiat-to-crypto bridge (same price as Stripe, same product, different rail).

## Collection 1 — Ruby Dispute Vault Pass ✅ BUILT

Already scaffolded in `nft/RubyDisputeVaultPass.sol`. Ready to deploy per `nft/DEPLOY.md`. Art generated in `nft/art/1.png`, `2.png`, `3.png` as samples. See that doc for the full deploy flow.

## Collection 2 — Ruby Wisdom Drops (the video NFTs)

This is the new collection. Each of your 10 rendered TikTok videos becomes an on-chain NFT with the MP4 as the image/animation and the script + transcript as unlockable content.

### Why this works

- **Cheap enough to mint impulsively.** ~$6 isn't a hard commitment for a crypto-native collector.
- **Evergreen.** The videos live in IPFS, not on TikTok — no algo, no ban risk.
- **Shareable.** Every holder becomes a distribution node — they post the OpenSea link, it carries your brand to their audience.
- **Multi-edition = multi-buyer.** Open-edition minting (no supply cap on a per-drop basis) means each video can have 50 or 500 holders.

### Technical setup

Two contract options:

**Option A — Manifold Creator contracts (no code).** Connect wallet → create custom collection → upload art → set price → done. Gas per mint is paid by the minter. Manifold takes no cut. This is the fastest path.

**Option B — Our own ERC-1155 contract.** More control, consistent branding across the whole universe. Written below.

For launch, **use Option A (Manifold)**. You can always migrate to ERC-1155 later.

### The 10 drops — ready to list

| Drop | Based on video | Title | Description | Price |
|---|---|---|---|---|
| 01 | `01-credit-check-myth.mp4` | Myth #1 — The Soft Pull | The first video in the Royal Ruby Wisdom series. A 26-second correction of the most common credit myth in America. Unlockable: the full script + a one-page handout you can print. | 0.0025 ETH |
| 02 | `02-540-to-680.mp4` | Before / After — 540 to 680 | The three-move credit reset Dr. Marigny walks his community through. Not theory, not aspiration — the exact sequence. Unlockable: the 90-day cadence calendar. | 0.0025 ETH |
| 03 | `03-oldest-card.mp4` | Do Not Close It | One of the top five quiet score killers. Unlockable: the "which card to keep alive" decision matrix. | 0.0025 ETH |
| 04 | `04-utilization.mp4` | The 30% Rule Is a Lie | Utilization gets graded randomly by lenders — and the fix takes 30 seconds. Unlockable: the statement-date tracker spreadsheet. | 0.0025 ETH |
| 05 | `05-single-mom.mp4` | To the One Watching at Midnight | A direct-address meditation on wealth, systems, and who gets taught this at the dinner table. Unlockable: a printable affirmation card. | 0.0025 ETH |
| 06 | `06-pay-for-delete.mp4` | Don't Pay to Delete | Why the pay-for-delete trap keeps people poor. Unlockable: the goodwill-letter template. | 0.0025 ETH |
| 07 | `07-authority-pov.mp4` | The 1-in-5 Report | The FTC's number, not mine. 1 in 5 credit reports have material errors. Unlockable: the three-bureau dispute cheat sheet. | 0.0025 ETH |
| 08 | `08-dispute-receipts.mp4` | Eleven Days to Delete | A real letter, a real collection, real receipts. Unlockable: the exact letter template (FCRA § 611). | 0.0025 ETH |
| 09 | `09-faith-finance.mp4` | Stewardship Is Spiritual | Why money is the most-mentioned topic in scripture. Unlockable: a one-page devotional on financial stewardship. | 0.0025 ETH |
| 10 | `10-usb-cliffhanger.mp4` | Four Documents, One USB | The minimum-viable financial legacy kit. Unlockable: the exact 4-document bundle (starter pack preview). | 0.0025 ETH |

### Metadata generation

Run `video-engine/generate-nft-metadata.py` (new script) to produce `nft/wisdom-drops/metadata/1-10.json` files pointing at the MP4 + thumbnail IPFS CIDs. See that file for the full generator.

## Collection 3 — Ruby Starter Seals

Same shape as Dispute Vault Pass, different price, different unlockable.

| Field | Value |
|---|---|
| Supply | 100 |
| Price | 0.007 ETH (~$17) |
| Unlockable | Ruby Starter Pack PDF + checklist + bonus worksheet |
| Art | Reuse NFT pass template with "STARTER SEAL" branding |

Same contract pattern as Dispute Vault Pass — just rename + adjust supply/price on deploy. One Solidity file, two deployments.

---

## Marketing plan — 14 days, 4 platforms

Every drop gets the same 7-beat narrative spread across 4 platforms. Copy-paste ready.

### Day 0 — Foundation
- **Update social bios everywhere** with `royalruby.co/nft` as a secondary link
- **X (Twitter):** Pin a thread explaining the three collections (see `nft/marketing/pinned-thread.md`)
- **Farcaster:** Create a Royal Ruby channel, post a welcome cast
- **OpenSea:** Set up collection banners, descriptions, fee splits

### Day 1 — Wisdom Drop 01 launches (Myth #1)
- **X:** Thread — "I'm minting a 26-second credit truth on Base. Here's why it matters." + video embed + mint link
- **Warpcast:** Frame (see `api/frame-mint.js` — built below) — one-click mint
- **TikTok:** Post the same video on TikTok — caption ends with "Minted forever on Base — link in bio"
- **Instagram:** Reel — same, with "Onchain → link in bio"
- **Discord/Telegram (if any):** drop the mint link

### Day 2 → Day 10 — One drop per day
Follow the same template. Each day adds one video NFT to the wisdom drops collection. Each day the Royal Ruby brand appears on OpenSea's trending board for Base chain, X's algorithm, Farcaster's homepage.

### Day 11 — Dispute Vault Pass announcement
"The flagship drops in 3 days. 500 passes. Each unlocks the full Dispute Vault + Diamond/Kava club."

### Day 12 — Pre-sale for Wisdom Drop holders
Snapshot holders. They get 24 hours of early access to mint Dispute Vault Passes before the public window.

### Day 13 — Public mint opens
Tweet storm, Farcaster frame, email blast to checklist list, TikTok video #11 specifically about the mint.

### Day 14 — Retrospective + kava onboarding
Post the results. Add every holder to the Diamond/Kava club roster. Start the next content cycle.

---

## Metrics that matter

Track on OpenSea + Dune dashboard (if you want one, I can write the SQL):
- **Unique holders** across all three collections — brand reach
- **Secondary sales volume** — signal that you built something people trade
- **Floor price** — signal that demand outstrips supply
- **Treasury inflow** — $ value flowing into the multi-sig for Kava workers

---

## Other OpenSea accounts — what to do with them

Bryant, you mentioned "all my OpenSea accounts." A few questions I can't answer from here:

1. **How many wallets / accounts?**
2. **Do they hold your existing art/NFTs, or are they empty?**
3. **Do you want them consolidated under one Royal Ruby brand, or kept separate?**

Once you tell me wallet addresses (public only, never private keys), I can:
- Read the current holdings programmatically
- Draft a consolidation plan
- Write cross-listing metadata so each piece gets re-described in Royal Ruby voice
- Generate cross-promotional social posts that tie old portfolios to the new Royal Ruby drops

Drop the wallet addresses in chat when you're ready and I'll scan them.
