"""Generate an ink-on-paper version of the WeChat QR code.

Source: public/wechat-qr.png (green modules, white background, center logo).
Output: docs/promo-film/assets/wechat-qr-ink.png

The QR is recolored to the site palette (ink #1B1813 on paper #F3EBDD) and
verified with pyzbar. Do not crop the quiet zone.
"""
from pathlib import Path
from PIL import Image
from pyzbar.pyzbar import decode

ROOT = Path(__file__).resolve().parents[3]
SRC = ROOT / "public" / "wechat-qr.png"
OUT = ROOT / "docs" / "promo-film" / "assets" / "wechat-qr-ink.png"
INK = (27, 24, 19)       # #1B1813
PAPER = (243, 235, 221)  # #F3EBDD

im = Image.open(SRC).convert("RGB")
w, h = im.size
px = im.load()

best = None
for threshold in (200, 210, 220, 225, 230, 235, 240):
    out = Image.new("RGB", (w, h), PAPER)
    op = out.load()
    for y in range(h):
        for x in range(w):
            r, g, b = px[x, y]
            # Any non-near-white pixel becomes ink. The green modules and the
            # center logo become solid ink; the white background stays paper.
            if min(r, g, b) < threshold:
                op[x, y] = INK
    # quiet zone
    for margin in (24, 32, 40):
        canvas = Image.new("RGB", (w + margin * 2, h + margin * 2), PAPER)
        canvas.paste(out, (margin, margin))
        decoded = decode(canvas)
        ok = any(d.type == "QRCODE" and d.data for d in decoded)
        print(f"threshold={threshold} margin={margin} decode={ok} count={len(decoded)}")
        if ok and best is None:
            best = canvas
        if ok:
            break

if best is None:
    raise SystemExit("No scannable variant found; adjust threshold / margin.")

OUT.parent.mkdir(parents=True, exist_ok=True)
best.save(OUT, "PNG")
print("saved", OUT, best.size)
