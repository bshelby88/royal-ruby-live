#!/usr/bin/env python3
"""
Generate OpenSea-compatible metadata JSON for Ruby Wisdom Drops.
Each file points at an IPFS-hosted MP4 + PNG thumbnail that you'll upload separately.
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "nft" / "wisdom-drops" / "metadata"
OUT.mkdir(parents=True, exist_ok=True)

# Replace these with real CIDs after uploading to web3.storage
PLACEHOLDER_VIDEO_CID = "REPLACE_WITH_VIDEO_FOLDER_CID"
PLACEHOLDER_IMAGE_CID = "REPLACE_WITH_THUMBNAIL_FOLDER_CID"

DROPS = [
    {
        "slug": "01-credit-check-myth",
        "name": "Myth #1 — The Soft Pull",
        "description": "The first video in the Royal Ruby Wisdom series. A 26-second correction of the most common credit myth in America. Checking your own credit does NOT hurt your score — it's a soft pull, invisible to lenders. Unlockable content: the full script, a one-page printable handout, and access to the Royal Ruby mailing list.\n\nEducational content only. Not legal or financial advice.",
        "tier": "Genesis",
    },
    {
        "slug": "02-540-to-680",
        "name": "Before / After — 540 to 680",
        "description": "The three-move credit reset Dr. Marigny walks his community through. Pull all three reports. Dispute every error in writing. Get utilization under 30%. Unlockable: the 90-day cadence calendar and the exact week-by-week checklist.\n\nEducational content only. Not legal or financial advice.",
        "tier": "Genesis",
    },
    {
        "slug": "03-oldest-card",
        "name": "Do Not Close It",
        "description": "One of the five quiet score killers — closing your oldest credit card. Fifteen percent of your FICO is length of history, and closing the oldest account shortens your average overnight. Unlockable: the 'which card to keep alive' decision matrix and a small-recurring-charge automation guide.\n\nEducational content only.",
        "tier": "Genesis",
    },
    {
        "slug": "04-utilization",
        "name": "The 30% Rule Is a Lie",
        "description": "Utilization is 30% of your FICO and most people get the timing wrong. The bureaus snapshot your balance whenever the lender reports — not on the due date. Fix: pay down before the statement closes, not after. Unlockable: the statement-date tracker spreadsheet.\n\nEducational content only.",
        "tier": "Genesis",
    },
    {
        "slug": "05-single-mom",
        "name": "To the One Watching at Midnight",
        "description": "A direct-address meditation on wealth, systems, and who gets taught this at the dinner table. You're not behind — you're under-equipped. Unlockable: a printable affirmation card designed by Royal Ruby.\n\nEducational content only.",
        "tier": "Genesis",
    },
    {
        "slug": "06-pay-for-delete",
        "name": "Don't Pay to Delete",
        "description": "Why the pay-for-delete trap keeps people poor. Collection agencies can't legally promise deletion, and a 'paid' collection sits on your report for seven years from the original delinquency date. Unlockable: the goodwill-letter template and the negotiation playbook.\n\nEducational content only.",
        "tier": "Genesis",
    },
    {
        "slug": "07-authority-pov",
        "name": "The 1-in-5 Report",
        "description": "The FTC's number, not ours. One in five credit reports has a material error — and the errors live in the reports you're not watching. Unlockable: the three-bureau dispute cheat sheet and AnnualCreditReport.com walkthrough.\n\nEducational content only.",
        "tier": "Genesis",
    },
    {
        "slug": "08-dispute-receipts",
        "name": "Eleven Days to Delete",
        "description": "Real letter, real 6-year-old collection, real eleven-day deletion. Three moves make it work: cite the specific FCRA section, demand method of verification, send certified mail. Unlockable: the exact letter template used (FCRA § 611 verification request).\n\nEducational content only.",
        "tier": "Genesis",
    },
    {
        "slug": "09-faith-finance",
        "name": "Stewardship Is Spiritual",
        "description": "The Bible talks about money more than faith and prayer combined — there's a reason. Stewardship is the test, not the trap. Unlockable: a one-page devotional on financial stewardship, plus the Luke 16:10 study guide.\n\nEducational content only.",
        "tier": "Genesis",
    },
    {
        "slug": "10-usb-cliffhanger",
        "name": "Four Documents, One USB",
        "description": "The minimum-viable financial legacy kit every family should have on a single USB drive. Three-bureau report, dispute letter template, one-page budget, and a debt payoff plan ranked by interest — not balance. Unlockable: a preview of the Ruby Starter Pack.\n\nEducational content only.",
        "tier": "Genesis",
    },
]

for i, drop in enumerate(DROPS, start=1):
    token = {
        "name": f"Ruby Wisdom Drop #{i:02d} — {drop['name']}",
        "description": drop["description"],
        "image": f"ipfs://{PLACEHOLDER_IMAGE_CID}/{drop['slug']}.png",
        "animation_url": f"ipfs://{PLACEHOLDER_VIDEO_CID}/{drop['slug']}.mp4",
        "external_url": "https://royalruby.io",
        "attributes": [
            {"trait_type": "Series",      "value": "Wisdom Drops"},
            {"trait_type": "Drop",        "value": f"#{i:02d}"},
            {"trait_type": "Tier",        "value": drop["tier"]},
            {"trait_type": "Length",      "value": "Short-form"},
            {"trait_type": "Unlockable",  "value": "Yes"},
            {"trait_type": "Chain",       "value": "Base"},
        ],
    }
    out_file = OUT / f"{i}.json"
    out_file.write_text(json.dumps(token, indent=2) + "\n")
    print(f"wrote {out_file}")

# Collection-level metadata
collection = {
    "name": "Ruby Wisdom Drops",
    "description": "Ten short-form credit-education video NFTs from Dr. Herman Marigny III and Royal Ruby. Each drop is a 20–30 second wisdom reel — a single myth, mistake, or move — with unlockable content including scripts, worksheets, and printables. Open-edition minting on Base. Holders get auto-enrollment in the Diamond/Kava community and early access to future Ruby drops.\n\nEducational content only. Not legal or financial advice.",
    "image": f"ipfs://{PLACEHOLDER_IMAGE_CID}/cover.png",
    "external_link": "https://royalruby.io",
    "seller_fee_basis_points": 500,
    "fee_recipient": "REPLACE_WITH_TREASURY_ADDRESS"
}
(OUT / "collection.json").write_text(json.dumps(collection, indent=2) + "\n")
print(f"wrote {OUT / 'collection.json'}")
print(f"\nTotal: {len(DROPS) + 1} metadata files in {OUT}")
