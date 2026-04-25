#!/usr/bin/env python3
"""
Generate branded OpenSea cover thumbnails for each Ruby Wisdom Drop.
Uses the existing video thumbnail as a base and overlays collection framing.
Output: nft/wisdom-drops/art/1.png ... 10.png (square, 2000x2000)
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
VIDEOS = ROOT / "videos"
OUT = ROOT / "nft" / "wisdom-drops" / "art"
OUT.mkdir(parents=True, exist_ok=True)

DROPS = [
    ("01-credit-check-myth",  "Myth #1",          "The Soft Pull"),
    ("02-540-to-680",         "Before / After",   "540 → 680"),
    ("03-oldest-card",        "Warning",          "Do Not Close It"),
    ("04-utilization",        "The Rule",         "30% Is a Lie"),
    ("05-single-mom",         "For You",          "At Midnight"),
    ("06-pay-for-delete",     "Don't Pay",        "To Delete"),
    ("07-authority-pov",      "FTC Data",         "1 in 5 Reports"),
    ("08-dispute-receipts",   "Receipts",         "11 Days to Delete"),
    ("09-faith-finance",      "Stewardship",      "Is Spiritual"),
    ("10-usb-cliffhanger",    "Four Docs",        "One USB"),
]

GOLD = (201, 164, 73)
IVORY = (248, 244, 233)
CHARCOAL = (28, 28, 28)
RUBY = (155, 27, 48)


def find_font(hints: list[str], size: int) -> ImageFont.FreeTypeFont:
    for root in [Path("/usr/share/fonts"), Path("/usr/local/share/fonts")]:
        if not root.exists():
            continue
        for ttf in list(root.rglob("*.ttf")) + list(root.rglob("*.otf")):
            if any(h.lower() in ttf.name.lower() for h in hints):
                try:
                    return ImageFont.truetype(str(ttf), size)
                except Exception:
                    pass
    return ImageFont.load_default()


def render_drop_cover(idx: int, slug: str, kicker: str, title: str) -> Path:
    W = H = 2000
    base_png = VIDEOS / f"{slug}.png"
    if not base_png.exists():
        raise FileNotFoundError(f"video thumb missing: {base_png}")

    # Load vertical thumbnail (1080x1920) and convert to square by adding gradient side bars
    thumb = Image.open(base_png).convert("RGB")
    # Resize vertical thumb to fit within 2000 height keeping aspect
    ratio = 2000 / thumb.height
    new_w = int(thumb.width * ratio)
    thumb = thumb.resize((new_w, 2000), Image.LANCZOS)

    # Background: dark radial
    bg = Image.new("RGB", (W, H), (11, 4, 8))
    # Add ruby glow using blurred ellipse
    glow = Image.new("RGB", (W, H), (110, 15, 31))
    mask = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(mask)
    d.ellipse((-W // 3, -H // 3, W + W // 3, H // 2), fill=160)
    mask = mask.filter(ImageFilter.GaussianBlur(300))
    bg = Image.composite(glow, bg, mask)

    # Paste thumb centered
    x0 = (W - new_w) // 2
    bg.paste(thumb, (x0, 0))

    # Add gold vertical rules on left/right of the thumb area
    draw = ImageDraw.Draw(bg)
    draw.rectangle((x0 - 8, 0, x0 - 4, H), fill=GOLD)
    draw.rectangle((x0 + new_w + 4, 0, x0 + new_w + 8, H), fill=GOLD)

    # Top edition strip
    strip_h = 180
    draw.rectangle((0, 0, W, strip_h), fill=(11, 4, 8, 240))
    serif = find_font(["DejaVuSerif-Bold"], 72)
    mono = find_font(["DejaVuSansMono-Bold"], 50)
    sans_xs = find_font(["DejaVuSans-Bold"], 38)

    edition = f"WISDOM DROP  {idx:02d} / 10"
    ew = draw.textlength(edition, font=mono)
    draw.text(((W - ew) / 2, 60), edition, font=mono, fill=GOLD)

    # Bottom title strip
    bs_h = 320
    draw.rectangle((0, H - bs_h, W, H), fill=(11, 4, 8, 240))
    draw.rectangle((0, H - bs_h, W, H - bs_h + 4), fill=GOLD)

    kicker_u = kicker.upper()
    kw = draw.textlength(kicker_u, font=sans_xs)
    draw.text(((W - kw) / 2, H - bs_h + 40), kicker_u, font=sans_xs, fill=GOLD)

    tw = draw.textlength(title, font=serif)
    if tw > W - 120:
        # shrink
        size = serif.size
        while tw > W - 120 and size > 44:
            size -= 4
            f = find_font(["DejaVuSerif-Bold"], size)
            tw = draw.textlength(title, font=f)
        draw.text(((W - tw) / 2, H - bs_h + 110), title, font=f, fill=IVORY)
    else:
        draw.text(((W - tw) / 2, H - bs_h + 110), title, font=serif, fill=IVORY)

    brand = "ROYAL  RUBY  ·  royalruby.io"
    bw = draw.textlength(brand, font=mono)
    draw.text(((W - bw) / 2, H - 90), brand, font=mono, fill=GOLD)

    out = OUT / f"{idx}.png"
    bg.save(out, "PNG", optimize=True)
    return out


def main() -> int:
    for i, (slug, kicker, title) in enumerate(DROPS, start=1):
        p = render_drop_cover(i, slug, kicker, title)
        print(f"[drop] {p}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
