#!/usr/bin/env python3
"""Generate 10 Manifold Creator drop.json files for the Ruby Wisdom Drops."""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "nft" / "manifold"
OUT.mkdir(parents=True, exist_ok=True)

DROPS = [
    {
        "n": 1,
        "slug": "01-credit-check-myth",
        "name": "Myth #1 — The Soft Pull",
        "description": "The first video in the Ruby Wisdom series. A 26-second correction of the most common credit myth in America. Checking your own credit does NOT hurt your score — it's a soft pull, invisible to lenders.",
        "unlockable": "**Full script + printable one-page handout**\n\nDownload: https://royalruby.co/unlock/01\n\nNotes for sharing: Feel free to repost the video with attribution to Royal Ruby + @drherman_marigny.",
    },
    {
        "n": 2,
        "slug": "02-540-to-680",
        "name": "Before/After — 540 to 680",
        "description": "The three-move credit reset Dr. Marigny walks his community through. Not theory — the exact sequence that works.",
        "unlockable": "**90-day cadence calendar (PDF) + week-by-week checklist**\n\nDownload: https://royalruby.co/unlock/02",
    },
    {
        "n": 3,
        "slug": "03-oldest-card",
        "name": "Do Not Close It",
        "description": "One of the five quiet score killers — closing your oldest credit card shortens your average history and drops your score overnight.",
        "unlockable": "**'Which card to keep alive' decision matrix + small-recurring-charge setup guide**\n\nDownload: https://royalruby.co/unlock/03",
    },
    {
        "n": 4,
        "slug": "04-utilization",
        "name": "The 30% Rule Is a Lie",
        "description": "Utilization is 30% of your FICO and most people get the timing wrong. Here's what actually moves the score.",
        "unlockable": "**Statement-date tracker spreadsheet (Google Sheet template)**\n\nCopy: https://royalruby.co/unlock/04",
    },
    {
        "n": 5,
        "slug": "05-single-mom",
        "name": "To the One Watching at Midnight",
        "description": "A direct-address meditation on wealth, systems, and who gets taught this at the dinner table.",
        "unlockable": "**Printable affirmation card designed by Royal Ruby**\n\nDownload: https://royalruby.co/unlock/05",
    },
    {
        "n": 6,
        "slug": "06-pay-for-delete",
        "name": "Don't Pay to Delete",
        "description": "Why the pay-for-delete trap keeps people poor — and what actually works instead.",
        "unlockable": "**Goodwill-letter template + negotiation playbook**\n\nDownload: https://royalruby.co/unlock/06",
    },
    {
        "n": 7,
        "slug": "07-authority-pov",
        "name": "The 1-in-5 Report",
        "description": "The FTC's number, not mine. One in five credit reports has a material error.",
        "unlockable": "**Three-bureau dispute cheat sheet + AnnualCreditReport.com walkthrough**\n\nDownload: https://royalruby.co/unlock/07",
    },
    {
        "n": 8,
        "slug": "08-dispute-receipts",
        "name": "Eleven Days to Delete",
        "description": "Real letter, real 6-year-old collection, real eleven-day deletion. The three moves that made it work.",
        "unlockable": "**Exact FCRA § 611 verification request template**\n\nDownload: https://royalruby.co/unlock/08",
    },
    {
        "n": 9,
        "slug": "09-faith-finance",
        "name": "Stewardship Is Spiritual",
        "description": "The Bible talks about money more than faith and prayer combined. There's a reason.",
        "unlockable": "**One-page devotional on financial stewardship + Luke 16:10 study guide**\n\nDownload: https://royalruby.co/unlock/09",
    },
    {
        "n": 10,
        "slug": "10-usb-cliffhanger",
        "name": "Four Documents, One USB",
        "description": "The minimum-viable financial legacy kit every family should have on a single USB drive.",
        "unlockable": "**Preview of the Ruby Starter Pack + 4-document bundle template**\n\nDownload: https://royalruby.co/unlock/10",
    },
]

for drop in DROPS:
    n = drop["n"]
    data = {
        "contract": {
            "type": "ERC1155Claim",
            "name": "Ruby Wisdom Drops",
            "symbol": "RWD",
            "network": "base",
        },
        "token": {
            "tokenId": n,
            "name": drop["name"],
            "description": drop["description"],
            "image": f"ipfs://REPLACE_WITH_ART_CID/{n}.png",
            "animation_url": f"ipfs://REPLACE_WITH_VIDEO_CID/{drop['slug']}.mp4",
            "external_url": "https://royalruby.co/nft",
        },
        "claim": {
            "type": "open",
            "price": "0.0025",
            "currency": "ETH",
            "startDate": None,
            "endDate": None,
            "walletMax": 10,
            "royaltyBps": 500
        },
        "unlockableContent": drop["unlockable"],
        "attributes": [
            {"trait_type": "Series",     "value": "Wisdom Drops"},
            {"trait_type": "Drop",       "value": f"#{n:02d}"},
            {"trait_type": "Chain",      "value": "Base"},
            {"trait_type": "Unlockable", "value": "Yes"}
        ]
    }
    out_file = OUT / f"drop-{n:02d}.json"
    out_file.write_text(json.dumps(data, indent=2) + "\n")
    print(f"wrote {out_file}")

print(f"\n{len(DROPS)} Manifold drop templates written to {OUT}")
