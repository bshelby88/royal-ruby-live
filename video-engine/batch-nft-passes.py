#!/usr/bin/env python3
"""Generate all 500 Ruby Dispute Vault Pass editions + per-token metadata."""
import json
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parent))
from covers import render_nft_pass  # reuses the same generator

ROOT = Path(__file__).resolve().parent.parent
META = ROOT / "nft" / "metadata"
ART = ROOT / "nft" / "art"
META.mkdir(parents=True, exist_ok=True)
ART.mkdir(parents=True, exist_ok=True)

TOTAL = 500

# Tier assignment — first 50 are Founder, next 150 are Early, rest are Standard
def tier_for(token_id: int) -> str:
    if token_id <= 50:
        return "Founder"
    if token_id <= 200:
        return "Early"
    return "Standard"


def main() -> int:
    for i in range(1, TOTAL + 1):
        # Art (skip if already exists to speed up reruns)
        art_file = ART / f"{i}.png"
        if not art_file.exists():
            render_nft_pass(i)
        # Metadata
        tier = tier_for(i)
        meta = {
            "name": f"Ruby Dispute Vault Pass #{i}",
            "description": (
                f"Pass #{i} of 500. Holder unlocks the Ruby Dispute Vault (12 dispute letter "
                f"templates, FCRA § 611 playbook, certified-mail walkthrough) plus "
                f"auto-enrollment in the Diamond/Kava rewards club. "
                f"Educational content. Not legal or financial advice."
            ),
            "image": f"ipfs://REPLACE_WITH_IMAGE_CID/{i}.png",
            "external_url": "https://royalruby.co",
            "attributes": [
                {"trait_type": "Tier",        "value": tier},
                {"trait_type": "Edition",     "value": i},
                {"trait_type": "Vault",       "value": "Dispute"},
                {"trait_type": "Club Access", "value": "Diamond / Kava"},
                {"trait_type": "Drop",        "value": "Genesis"},
            ],
        }
        (META / f"{i}.json").write_text(json.dumps(meta, indent=2) + "\n")
        if i % 50 == 0:
            print(f"[batch] {i}/{TOTAL} passes generated")
    print(f"[batch] done — {TOTAL} metadata + art files")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
