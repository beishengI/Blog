# -*- coding: utf-8 -*-
r"""
Turn the supplied blog portrait into a print-halftone "case-file plate".

Source: D:\大学期间\证件照\Blog.jpeg (user-provided avatar)
Output: public/portrait-halftone.webp + public/portrait-halftone.jpg

No external services; deterministic. The page adds the frame, labels and red marks.
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public"
SRC = Path(r"D:\大学期间\证件照\Blog.jpeg")
FALLBACK = ROOT / "public" / "avatar.jpeg"

PAPER = (243, 235, 221)
INK = (27, 24, 19)


def main() -> None:
    source = SRC if SRC.exists() else FALLBACK
    if not source.exists():
        raise SystemExit("portrait source not found")
    image = Image.open(source).convert("RGB")
    # 4:5 portrait crop, keeping the face/upper body.
    width, height = image.size
    target_ratio = 4 / 5
    crop_h = height
    crop_w = round(height * target_ratio)
    if crop_w > width:
        crop_w = width
        crop_h = round(width / target_ratio)
    left = (width - crop_w) // 2
    top = max(0, round((height - crop_h) * 0.08))
    image = image.crop((left, top, left + crop_w, top + crop_h))

    # Work at 2x, halftone, then downsample for smoother dots.
    work_size = (1200, 1500)
    image = ImageOps.fit(image, work_size, method=Image.Resampling.LANCZOS)
    gray = ImageOps.grayscale(image)
    gray = ImageEnhance.Contrast(gray).enhance(1.18)
    gray = gray.filter(ImageFilter.GaussianBlur(0.6))

    cell = 9
    cols = work_size[0] // cell
    rows = work_size[1] // cell
    canvas = Image.new("RGB", work_size, PAPER)
    draw = ImageDraw.Draw(canvas)
    pixels = gray.load()
    for row in range(rows):
        for col in range(cols):
            x0 = col * cell
            y0 = row * cell
            total = 0
            for yy in range(y0, min(y0 + cell, work_size[1])):
                for xx in range(x0, min(x0 + cell, work_size[0])):
                    total += pixels[xx, yy]
            average = total / (cell * cell)
            darkness = 1 - average / 255
            radius = darkness * cell * 0.72
            if radius < 0.4:
                continue
            cx = x0 + cell / 2
            cy = y0 + cell / 2
            draw.ellipse((cx - radius, cy - radius, cx + radius, cy + radius), fill=INK)

    final = canvas.resize((800, 1000), Image.Resampling.LANCZOS)
    # Subtle registration marks in the artwork itself (page also draws corners).
    d = ImageDraw.Draw(final)
    d.line((26, 18, 26, 58), fill=(178, 58, 42), width=2)
    d.line((18, 26, 58, 26), fill=(178, 58, 42), width=2)
    d.line((774, 982, 774, 942), fill=(178, 58, 42), width=2)
    d.line((782, 974, 742, 974), fill=(178, 58, 42), width=2)

    final.save(OUT / "portrait-halftone.webp", "WEBP", quality=88, method=6)
    final.save(OUT / "portrait-halftone.jpg", "JPEG", quality=86, optimize=True, progressive=True)

    # Small header avatar: same halftone, 4:5, light enough for the sticky header.
    avatar = final.resize((120, 150), Image.Resampling.LANCZOS)
    avatar.save(OUT / "portrait-avatar.webp", "WEBP", quality=86, method=6)
    avatar.save(OUT / "portrait-avatar.jpg", "JPEG", quality=84, optimize=True, progressive=True)
    print("wrote", OUT / "portrait-halftone.webp", (OUT / "portrait-halftone.webp").stat().st_size)
    print("wrote", OUT / "portrait-halftone.jpg", (OUT / "portrait-halftone.jpg").stat().st_size)


if __name__ == "__main__":
    main()
