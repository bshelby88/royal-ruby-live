#!/usr/bin/env python3
"""
Royal Ruby — TikTok video engine
--------------------------------
Renders vertical 1080x1920 kinetic-typography videos from a JSON script file.

Usage:
    .venv/bin/python video-engine/render.py video-engine/scripts/01.json

Output:
    videos/<slug>.mp4     — the video (h264, aac-silent)
    videos/<slug>.png     — thumbnail (first beat)

Script JSON shape:
    {
      "slug": "01-credit-check-myth",
      "duration": 26,
      "bg_gradient": ["#0B0408", "#1C0A10"],
      "beats": [
        { "t": 0.0, "d": 3.0, "kicker": "MYTH",        "line": "Checking your own credit", "accent": "does NOT hurt your score." },
        { "t": 3.0, "d": 4.0, "kicker": "THE TRUTH",   "line": "A soft pull is",             "accent": "invisible to lenders." },
        { "t": 7.0, "d": 4.0, "kicker": "WHAT HURTS",  "line": "Hard pulls + high",          "accent": "utilization do." },
        { "t": 11.0,"d": 5.0, "kicker": "THE MOVE",    "line": "Pull all three reports.",    "accent": "Read them with me." },
        { "t": 16.0,"d": 5.0, "kicker": "FREE",        "line": "90-day reset checklist",     "accent": "royalruby.io/tt" },
        { "t": 21.0,"d": 5.0, "kicker": "DR. MARIGNY", "line": "You can't build wealth",     "accent": "on a broken foundation." }
      ]
    }
"""
from __future__ import annotations

import json
import os
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont
from moviepy.editor import (
    CompositeVideoClip,
    ImageClip,
    VideoClip,
)

ROOT = Path(__file__).resolve().parent.parent
VIDEOS = ROOT / "videos"
ENGINE = ROOT / "video-engine"
FONT_DIR = ENGINE / "fonts"

W, H = 1080, 1920
FPS = 30

# Brand palette (matches the site)
RUBY = "#9B1B30"
RUBY_DEEP = "#6E0F1F"
IVORY = "#F8F4E9"
CHARCOAL = "#1C1C1C"
GOLD = "#C9A449"


def _hex(c: str) -> tuple[int, int, int]:
    c = c.lstrip("#")
    return tuple(int(c[i : i + 2], 16) for i in (0, 2, 4))


def _find_font(preferred: list[str], size: int) -> ImageFont.FreeTypeFont:
    # Try bundled, then system fallback
    candidates: list[Path] = []
    for name in preferred:
        candidates.append(FONT_DIR / name)
    system_roots = [
        Path("/usr/share/fonts"),
        Path("/usr/local/share/fonts"),
        Path.home() / ".local/share/fonts",
        Path.home() / ".fonts",
    ]
    targets_lower = [p.lower() for p in preferred]
    for root in system_roots:
        if not root.exists():
            continue
        for ttf in root.rglob("*.ttf"):
            if any(t.split(".")[0] in ttf.name.lower() for t in targets_lower):
                candidates.append(ttf)
        for otf in root.rglob("*.otf"):
            if any(t.split(".")[0] in otf.name.lower() for t in targets_lower):
                candidates.append(otf)
    for p in candidates:
        try:
            if p.exists():
                return ImageFont.truetype(str(p), size)
        except Exception:
            pass
    # Last resort — default bitmap font scaled
    return ImageFont.load_default()


def _make_gradient_bg(colors: list[str]) -> np.ndarray:
    top = np.array(_hex(colors[0]), dtype=np.float32)
    bot = np.array(_hex(colors[1]), dtype=np.float32)
    t = np.linspace(0.0, 1.0, H).reshape(H, 1, 1)
    grad = top * (1 - t) + bot * t
    img = np.broadcast_to(grad, (H, W, 3)).astype(np.uint8).copy()
    # Add a soft ruby glow in the upper third
    pil = Image.fromarray(img, "RGB")
    glow = Image.new("RGB", (W, H), _hex(RUBY_DEEP))
    mask = Image.new("L", (W, H), 0)
    draw = ImageDraw.Draw(mask)
    draw.ellipse((-W // 3, -H // 3, W + W // 3, H // 2), fill=120)
    mask = mask.filter(ImageFilter.GaussianBlur(160))
    pil = Image.composite(glow, pil, mask)
    # Film grain
    noise = (np.random.rand(H, W, 1) * 18).astype(np.int16) - 9
    out = np.clip(np.array(pil, dtype=np.int16) + noise, 0, 255).astype(np.uint8)
    return out


def _wrap_text(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont, max_w: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    line = ""
    for w in words:
        trial = f"{line} {w}".strip()
        if draw.textlength(trial, font=font) <= max_w:
            line = trial
        else:
            if line:
                lines.append(line)
            line = w
    if line:
        lines.append(line)
    return lines


def _render_beat_frame(
    base: np.ndarray,
    kicker: str,
    line: str,
    accent: str,
    serif: ImageFont.FreeTypeFont,
    sans: ImageFont.FreeTypeFont,
    sans_bold: ImageFont.FreeTypeFont,
    small: ImageFont.FreeTypeFont,
) -> np.ndarray:
    pil = Image.fromarray(base, "RGB").copy()
    draw = ImageDraw.Draw(pil)

    # Top kicker pill
    kick_txt = kicker.upper()
    kick_w = draw.textlength(kick_txt, font=small) + 56
    kick_h = 64
    kx = (W - kick_w) / 2
    ky = 220
    draw.rounded_rectangle(
        (kx, ky, kx + kick_w, ky + kick_h),
        radius=32,
        fill=_hex(GOLD),
    )
    draw.text(
        (kx + 28, ky + 14),
        kick_txt,
        font=small,
        fill=_hex(CHARCOAL),
    )

    # Main serif line — white
    body_top = 560
    max_w = W - 180
    lines = _wrap_text(draw, line, serif, max_w)
    y = body_top
    for l in lines:
        tw = draw.textlength(l, font=serif)
        draw.text(((W - tw) / 2, y), l, font=serif, fill=(248, 244, 233))
        y += serif.size + 18

    # Accent line — gold italic-ish (use serif)
    y += 24
    accent_lines = _wrap_text(draw, accent, sans_bold, max_w)
    for l in accent_lines:
        tw = draw.textlength(l, font=sans_bold)
        draw.text(((W - tw) / 2, y), l, font=sans_bold, fill=_hex(GOLD))
        y += sans_bold.size + 12

    # Bottom brand bar
    draw.rectangle((0, H - 180, W, H - 180 + 4), fill=_hex(GOLD))
    brand = "ROYAL  RUBY"
    bw = draw.textlength(brand, font=small)
    draw.text(((W - bw) / 2, H - 140), brand, font=small, fill=(248, 244, 233))
    sub = "royalruby.io"
    sw = draw.textlength(sub, font=small)
    draw.text(((W - sw) / 2, H - 90), sub, font=small, fill=_hex(GOLD))

    return np.array(pil, dtype=np.uint8)


def render_video(script_path: Path) -> Path:
    with script_path.open("r") as f:
        spec = json.load(f)

    slug: str = spec["slug"]
    duration: float = float(spec["duration"])
    bg_colors: list[str] = spec.get("bg_gradient", [CHARCOAL, RUBY_DEEP])
    beats = spec["beats"]

    print(f"[render] {slug}  {duration}s  {len(beats)} beats")

    # Fonts — try to find Playfair / Inter on the system, else fall back
    serif = _find_font(["Playfair", "Georgia", "DejaVuSerif-Bold"], 108)
    sans = _find_font(["Inter", "DejaVuSans"], 54)
    sans_bold = _find_font(["Inter-Bold", "DejaVuSans-Bold", "DejaVuSans"], 62)
    small = _find_font(["Inter", "DejaVuSans-Bold", "DejaVuSans"], 34)

    bg = _make_gradient_bg(bg_colors)

    # Pre-render one still per beat (fast — 6 frames not 720)
    beat_frames = []
    for b in beats:
        frame = _render_beat_frame(
            bg,
            b.get("kicker", ""),
            b.get("line", ""),
            b.get("accent", ""),
            serif,
            sans,
            sans_bold,
            small,
        )
        beat_frames.append((float(b["t"]), float(b["d"]), frame))

    def make_frame(t: float) -> np.ndarray:
        # Find active beat
        active = None
        for start, dur, frame in beat_frames:
            if start <= t < start + dur:
                active = (start, dur, frame)
                break
        if active is None:
            return bg.copy()
        start, dur, frame = active
        local = t - start
        # Ease in/out
        fade_in = min(1.0, local / 0.45)
        fade_out = min(1.0, (dur - local) / 0.45)
        alpha = max(0.0, min(1.0, fade_in * fade_out))
        # Subtle zoom — tiny scale through the beat for movement
        scale = 1.0 + 0.02 * (local / dur)
        blended = (bg.astype(np.float32) * (1 - alpha) + frame.astype(np.float32) * alpha)
        if scale != 1.0:
            h2 = int(H * scale)
            w2 = int(W * scale)
            pil = Image.fromarray(blended.astype(np.uint8)).resize((w2, h2), Image.LANCZOS)
            x0 = (w2 - W) // 2
            y0 = (h2 - H) // 2
            blended = np.array(pil.crop((x0, y0, x0 + W, y0 + H)), dtype=np.float32)
        return np.clip(blended, 0, 255).astype(np.uint8)

    clip = VideoClip(make_frame, duration=duration).set_fps(FPS)

    VIDEOS.mkdir(parents=True, exist_ok=True)
    out_mp4 = VIDEOS / f"{slug}.mp4"
    out_png = VIDEOS / f"{slug}.png"

    # Thumbnail = first beat frame (full alpha)
    Image.fromarray(beat_frames[0][2], "RGB").save(out_png, "PNG")

    print(f"[render] writing {out_mp4}")
    clip.write_videofile(
        str(out_mp4),
        codec="libx264",
        audio=False,
        preset="medium",
        threads=4,
        fps=FPS,
        logger=None,
        ffmpeg_params=["-pix_fmt", "yuv420p", "-movflags", "+faststart"],
    )
    return out_mp4


def main() -> int:
    if len(sys.argv) < 2:
        print("usage: render.py <script.json> [more.json ...]", file=sys.stderr)
        return 2
    for arg in sys.argv[1:]:
        path = Path(arg)
        if not path.exists():
            print(f"[render] missing: {path}", file=sys.stderr)
            continue
        render_video(path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
