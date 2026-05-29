#!/usr/bin/env python3
"""
Royal Ruby — product cover + OG image generator
Uses the same brand system as the video engine. Writes PNGs for:
  - Each product cover (Starter Pack, Dispute Vault, Credit Stacker)
  - og.png (site-wide Open Graph image, 1200x630)
  - og-nft.png (NFT page OG image)

Usage:
    .venv/bin/python video-engine/covers.py
"""
from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent

RUBY = "#9B1B30"
RUBY_DEEP = "#6E0F1F"
IVORY = "#F8F4E9"
CHARCOAL = "#1C1C1C"
GOLD = "#C9A449"


def hx(c: str) -> tuple[int, int, int]:
    c = c.lstrip("#")
    return tuple(int(c[i : i + 2], 16) for i in (0, 2, 4))


def find_font(name_hints: list[str], size: int) -> ImageFont.FreeTypeFont:
    roots = [
        Path("/usr/share/fonts"),
        Path("/usr/local/share/fonts"),
        Path.home() / ".local/share/fonts",
        Path.home() / ".fonts",
    ]
    for root in roots:
        if not root.exists():
            continue
        for ttf in list(root.rglob("*.ttf")) + list(root.rglob("*.otf")):
            name = ttf.name.lower()
            if any(h.lower() in name for h in name_hints):
                try:
                    return ImageFont.truetype(str(ttf), size)
                except Exception:
                    pass
    return ImageFont.load_default()


def make_gradient_bg(w: int, h: int, top: str, bot: str) -> Image.Image:
    t = np.array(hx(top), dtype=np.float32)
    b = np.array(hx(bot), dtype=np.float32)
    alpha = np.linspace(0, 1, h).reshape(h, 1, 1)
    grad = t * (1 - alpha) + b * alpha
    arr = np.broadcast_to(grad, (h, w, 3)).astype(np.uint8).copy()
    img = Image.fromarray(arr, "RGB")
    # Ruby glow upper third
    glow = Image.new("RGB", (w, h), hx(RUBY_DEEP))
    mask = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(mask)
    d.ellipse((-w // 3, -h // 3, w + w // 3, h // 2), fill=140)
    mask = mask.filter(ImageFilter.GaussianBlur(int(w * 0.15)))
    img = Image.composite(glow, img, mask)
    # Grain
    grain = (np.random.rand(h, w, 1) * 18).astype(np.int16) - 9
    out = np.clip(np.array(img, dtype=np.int16) + grain, 0, 255).astype(np.uint8)
    return Image.fromarray(out, "RGB")


def draw_brand_mark(img: Image.Image, font: ImageFont.FreeTypeFont, color=(248, 244, 233), anchor="bl", pad=40) -> None:
    d = ImageDraw.Draw(img)
    text = "ROYAL  RUBY"
    tw = d.textlength(text, font=font)
    x, y = pad, img.height - pad - font.size
    if anchor == "br":
        x = img.width - tw - pad
    elif anchor == "tr":
        x = img.width - tw - pad
        y = pad
    elif anchor == "tl":
        x = pad
        y = pad
    # Subtle rule above
    d.rectangle((x, y - 14, x + tw, y - 10), fill=hx(GOLD))
    d.text((x, y), text, font=font, fill=color)


def kicker_pill(draw: ImageDraw.ImageDraw, text: str, x: int, y: int, font: ImageFont.FreeTypeFont, bg=GOLD, fg=CHARCOAL) -> tuple[int, int]:
    padx, pady = 28, 14
    w = int(draw.textlength(text, font=font)) + padx * 2
    h = font.size + pady * 2
    draw.rounded_rectangle((x, y, x + w, y + h), radius=h // 2, fill=hx(bg))
    draw.text((x + padx, y + pady), text, font=font, fill=hx(fg))
    return (w, h)


# ---------- product cover (1080x1920 portrait for Stripe + Gumroad) ----------

def render_product_cover(slug: str, kicker: str, title: str, sub: str, price: int, bullets: list[str]) -> Path:
    w, h = 1080, 1920
    img = make_gradient_bg(w, h, "#0B0408", "#1C0A10")
    draw = ImageDraw.Draw(img)

    serif_xl = find_font(["DejaVuSerif-Bold", "DejaVuSerif"], 128)
    serif_lg = find_font(["DejaVuSerif-Bold", "DejaVuSerif"], 80)
    sans_md = find_font(["DejaVuSans-Bold", "DejaVuSans"], 44)
    sans_sm = find_font(["DejaVuSans", "DejaVuSans-Bold"], 34)
    sans_xs = find_font(["DejaVuSans-Bold", "DejaVuSans"], 28)
    mono_md = find_font(["DejaVuSansMono-Bold", "DejaVuSansMono"], 40)

    # Top ruler
    draw.rectangle((80, 200, w - 80, 204), fill=hx(GOLD))

    # Kicker pill
    kicker_pill(draw, kicker.upper(), 80, 260, sans_xs)

    # Title
    y = 420
    for line in title.split("\n"):
        tw = draw.textlength(line, font=serif_xl)
        if tw > w - 160:
            # shrink
            size = serif_xl.size
            while tw > w - 160 and size > 60:
                size -= 6
                f = find_font(["DejaVuSerif-Bold"], size)
                tw = draw.textlength(line, font=f)
            draw.text((80, y), line, font=f, fill=hx(IVORY))
            y += size + 14
        else:
            draw.text((80, y), line, font=serif_xl, fill=hx(IVORY))
            y += serif_xl.size + 14

    # Subtitle
    y += 10
    for l in sub.split("\n"):
        draw.text((80, y), l, font=sans_md, fill=(201, 164, 73))
        y += sans_md.size + 8

    # Price block
    y += 50
    price_text = f"${price}"
    pw = draw.textlength(price_text, font=serif_xl)
    draw.text((80, y), price_text, font=serif_xl, fill=hx(GOLD))
    draw.text((80 + pw + 24, y + 40), "one-time · lifetime access", font=sans_sm, fill=(248, 244, 233, 180))

    # Bullets
    y += serif_xl.size + 60
    draw.rectangle((80, y, w - 80, y + 2), fill=(201, 164, 73, 100))
    y += 30
    for b in bullets:
        draw.text((80, y), "✓", font=sans_md, fill=hx(GOLD))
        draw.text((140, y), b, font=sans_sm, fill=(248, 244, 233))
        y += 60

    # Bottom brand + url
    draw.rectangle((80, h - 240, w - 80, h - 236), fill=hx(GOLD))
    draw.text((80, h - 200), "ROYAL  RUBY", font=sans_md, fill=hx(IVORY))
    draw.text((80, h - 140), "royalruby.co", font=mono_md, fill=hx(GOLD))
    draw.text((80, h - 80), "Educational content only — not legal or financial advice.", font=sans_xs, fill=(248, 244, 233, 100))

    out = ROOT / "images" / "products" / f"{slug}-cover.png"
    out.parent.mkdir(parents=True, exist_ok=True)
    img.save(out, "PNG", optimize=True)
    print(f"[cover] {out}")
    return out


# ---------- OG image (1200x630 horizontal) ----------

def render_og(slug: str, kicker: str, title: str, sub: str) -> Path:
    w, h = 1200, 630
    img = make_gradient_bg(w, h, "#0B0408", "#1C0A10")
    draw = ImageDraw.Draw(img)

    serif_xl = find_font(["DejaVuSerif-Bold"], 80)
    sans_md = find_font(["DejaVuSans-Bold"], 30)
    sans_sm = find_font(["DejaVuSans"], 24)
    sans_xs = find_font(["DejaVuSans-Bold"], 22)
    mono_md = find_font(["DejaVuSansMono-Bold"], 28)

    # Left rule
    draw.rectangle((60, 60, 64, h - 60), fill=hx(GOLD))

    # Kicker
    kicker_pill(draw, kicker.upper(), 110, 80, sans_xs)

    # Title — wrap
    y = 180
    words = title.split()
    line = ""
    max_w = w - 200
    for word in words:
        trial = (line + " " + word).strip()
        if draw.textlength(trial, font=serif_xl) > max_w:
            draw.text((110, y), line, font=serif_xl, fill=hx(IVORY))
            y += serif_xl.size + 6
            line = word
        else:
            line = trial
    if line:
        draw.text((110, y), line, font=serif_xl, fill=hx(IVORY))
        y += serif_xl.size + 6

    # Subtitle
    y += 20
    draw.text((110, y), sub, font=sans_md, fill=hx(GOLD))

    # Bottom brand + url
    draw.text((110, h - 80), "ROYAL  RUBY", font=sans_md, fill=hx(IVORY))
    draw.text((110, h - 45), "royalruby.co", font=mono_md, fill=hx(GOLD))

    out = ROOT / f"og-{slug}.png" if slug != "site" else ROOT / "og.png"
    img.save(out, "PNG", optimize=True)
    print(f"[og]    {out}")
    return out


# ---------- NFT pass art (2000x2000 square) ----------

def render_nft_pass(token_id: int) -> Path:
    w = h = 2000
    img = make_gradient_bg(w, h, "#0B0408", "#1C0A10")
    draw = ImageDraw.Draw(img)

    # Gold frame
    draw.rectangle((80, 80, w - 80, h - 80), outline=hx(GOLD), width=6)
    draw.rectangle((110, 110, w - 110, h - 110), outline=(201, 164, 73, 120), width=2)

    serif_huge = find_font(["DejaVuSerif-Bold"], 180)
    serif_lg = find_font(["DejaVuSerif-Bold"], 110)
    sans_md = find_font(["DejaVuSans-Bold"], 54)
    mono = find_font(["DejaVuSansMono-Bold"], 60)
    mono_sm = find_font(["DejaVuSansMono"], 40)
    sans_xs = find_font(["DejaVuSans-Bold"], 36)

    # Top mark
    draw.text((w // 2 - 220, 260), "R U B Y", font=serif_huge, fill=hx(GOLD))

    # Center name
    draw.text((w // 2 - 620, 700), "Dispute Vault", font=serif_lg, fill=hx(IVORY))
    draw.text((w // 2 - 200, 840), "PASS", font=serif_lg, fill=hx(GOLD))

    # Diamond glyph
    cx, cy = w // 2, 1200
    size = 160
    draw.polygon(
        [(cx, cy - size), (cx + size, cy), (cx, cy + size), (cx - size, cy)],
        outline=hx(GOLD),
        width=6,
    )
    draw.line([(cx - size, cy), (cx + size, cy)], fill=hx(GOLD), width=3)
    draw.line([(cx, cy - size), (cx, cy + size)], fill=hx(GOLD), width=3)

    # Edition number
    edition = f"#{token_id:03d} / 500"
    ew = draw.textlength(edition, font=mono)
    draw.text(((w - ew) / 2, 1500), edition, font=mono, fill=hx(GOLD))

    # Chain
    chain = "BASE · ERC-721 · ROYAL RUBY"
    cw = draw.textlength(chain, font=mono_sm)
    draw.text(((w - cw) / 2, 1590), chain, font=mono_sm, fill=(201, 164, 73, 180))

    # Bottom text
    foot = "EDUCATIONAL CONTENT ONLY"
    fw = draw.textlength(foot, font=sans_xs)
    draw.text(((w - fw) / 2, h - 200), foot, font=sans_xs, fill=(248, 244, 233, 100))

    out = ROOT / "nft" / "art" / f"{token_id}.png"
    out.parent.mkdir(parents=True, exist_ok=True)
    img.save(out, "PNG", optimize=True)
    print(f"[nft]   {out}")
    return out


# ---------- main ----------

def main() -> int:
    (ROOT / "images" / "products").mkdir(parents=True, exist_ok=True)

    # Product covers
    render_product_cover(
        slug="ruby-starter-pack",
        kicker="Rung One",
        title="Ruby\nStarter Pack",
        sub="90-Day Credit Reset Toolkit\nby Dr. Herman Marigny III",
        price=17,
        bullets=[
            "5-page credit reset checklist",
            "90-day budget builder",
            "Debt destroyer spreadsheet",
            "3 dispute letter templates",
            "Lifetime access · instant delivery",
        ],
    )

    render_product_cover(
        slug="ruby-dispute-vault",
        kicker="Rung Two",
        title="Ruby\nDispute Vault",
        sub="12 Letters · FCRA Playbook\ncertified-mail walkthrough",
        price=47,
        bullets=[
            "12 battle-tested dispute letters",
            "FCRA § 611 verification script",
            "Certified mail tracking sheet",
            "30-day follow-up cadence",
            "Goodwill + pay-for-delete scripts",
        ],
    )

    render_product_cover(
        slug="ruby-credit-stacker",
        kicker="Rung Three",
        title="Ruby\nCredit Stacker",
        sub="Advanced Credit Building\n90 pages · lifetime",
        price=97,
        bullets=[
            "Secured card ladder protocol",
            "Tradeline strategy — without scams",
            "Business credit separation",
            "720-club milestone roadmap",
            "Live update included",
        ],
    )

    # OG images
    render_og(
        slug="site",
        kicker="ROYAL RUBY",
        title="Unlock your credit. Build real wealth.",
        sub="Free 90-day reset checklist · royalruby.co",
    )
    render_og(
        slug="nft",
        kicker="MINT ON BASE",
        title="Ruby Dispute Vault Pass — 500 editions",
        sub="Unlocks the Vault + Diamond/Kava club",
    )

    # NFT pass art — a genesis edition so you have something to show
    render_nft_pass(1)
    render_nft_pass(2)
    render_nft_pass(3)

    print("\nAll assets written.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
