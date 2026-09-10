#!/usr/bin/env python3
"""Render the PWA / touch / Open Graph icons from the Open Sync logo geometry.

Run inside the project venv:  python scripts/render-icons.py
Outputs public/icons/{icon-192,icon-512,icon-512-maskable,apple-touch-icon,og-image}.png

The logo is the same two-arc ring used by the SVG favicon and the app shell:
a teal left half (carrier L), an amber right half broken at the right (carrier
R + the beat "gap"), and an amber tick — drawn with supersampling so edges
stay crisp at every size.
"""
from __future__ import annotations

import pathlib
import sys

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError:  # pragma: no cover
    sys.exit("Pillow is required: `uv pip install pillow` (inside .venv)")

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "icons"
INK = (11, 12, 13, 255)
TEAL = (79, 140, 130, 255)
AMBER = (217, 164, 65, 255)
TEXT = (233, 229, 220, 255)
TEXT2 = (168, 163, 153, 255)


def logo(size: int, pad_frac: float = 0.16, bg: tuple[int, int, int, int] = INK, rounded: bool = True) -> Image.Image:
    ss = 4
    s = size * ss
    im = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    if rounded:
        d.rounded_rectangle((0, 0, s - 1, s - 1), radius=int(s * 0.18), fill=bg)
    else:
        d.rectangle((0, 0, s - 1, s - 1), fill=bg)
    pad = s * pad_frac
    box = (pad, pad, s - pad, s - pad)
    w = max(2, int(s * 0.055))
    # teal left half: 90° → 270° (Pillow angles run clockwise from 3 o'clock)
    d.arc(box, start=90, end=270, fill=TEAL, width=w)
    # amber right half in two pieces, leaving the gap on the right
    d.arc(box, start=270, end=330, fill=AMBER, width=w)
    d.arc(box, start=30, end=90, fill=AMBER, width=w)
    # amber tick at the gap
    cx = s - pad + w * 0.35
    cy = s / 2
    th = s * 0.11
    d.rounded_rectangle((cx - w * 0.6, cy - th / 2, cx + w * 0.6, cy + th / 2), radius=w * 0.3, fill=AMBER)
    return im.resize((size, size), Image.LANCZOS)


def og_image() -> Image.Image:
    W, H = 1200, 630
    im = Image.new("RGB", (W, H), INK[:3])
    d = ImageDraw.Draw(im)
    for x in range(0, W, 48):
        d.line((x, 0, x, H), fill=(38, 43, 47))
    for y in range(0, H, 48):
        d.line((0, y, W, y), fill=(38, 43, 47))
    mark = logo(300, pad_frac=0.14, rounded=False, bg=(11, 12, 13, 0))
    im.paste(mark, (80, 165), mark)
    try:
        big = ImageFont.truetype("DejaVuSans-Bold.ttf", 64)
        small = ImageFont.truetype("DejaVuSans.ttf", 30)
        mono = ImageFont.truetype("DejaVuSansMono.ttf", 26)
    except OSError:
        big = small = mono = ImageFont.load_default()
    d.text((430, 190), "Open Sync", font=big, fill=TEXT)
    d.text((430, 275), "Evidence-honest brainwave audio lab", font=small, fill=TEXT2)
    d.text((430, 340), "BINAURAL · MONAURAL · ISOCHRONIC", font=mono, fill=AMBER)
    d.text((430, 385), "A–D EVIDENCE GRADES · BLINDED N-OF-1 · OPEN SOURCE", font=mono, fill=TEAL)
    return im


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    logo(192).save(OUT / "icon-192.png")
    logo(512).save(OUT / "icon-512.png")
    # maskable: safe zone is the central 80 %, so pad more and keep square corners
    logo(512, pad_frac=0.24, rounded=False).save(OUT / "icon-512-maskable.png")
    logo(180, rounded=False).save(OUT / "apple-touch-icon.png")
    og_image().save(OUT / "og-image.png", optimize=True)
    for f in sorted(OUT.iterdir()):
        print(f"{f.relative_to(ROOT)}  {f.stat().st_size:,} bytes")


if __name__ == "__main__":
    main()
