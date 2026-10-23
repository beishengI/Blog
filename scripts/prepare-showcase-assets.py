# -*- coding: utf-8 -*-
"""
Prepare public showcase assets from local project sources.

Rules:
- Never copy raw client screenshots. Crop/redact first; keep a manifest.
- Never read .env / credentials / customer data.
- Rerun after replacing a source file; outputs are deterministic.

Usage:
  python -X utf8 scripts/prepare-showcase-assets.py
"""
from __future__ import annotations

import json
import shutil
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "showcase"
PROJ = OUT / "projects"
OUT.mkdir(parents=True, exist_ok=True)
PROJ.mkdir(parents=True, exist_ok=True)

SOURCES = {
    "contract": Path(r"D:\contract_pre_agent\docs\superpowers\specs\contract-audit-report-mockup.jpg"),
    "lite": Path(r"D:\Lite_Mamba\6_18\results_v2\lite_dice_boost\ablation_4loo\test_wo_agd_ws075_thr32768\vis_png\BraTS-GLI-00006-000.png"),
    "mes": Path(r"D:\dev-mes\workbench-transfer.png"),
    "scp": Path(r"D:\RPA+Dify\SCP技术架构图.svg"),
    "taxi": Path(r"D:\jiayu\docs\images\ch2-layered-architecture.svg"),
    "avatar": ROOT / "public" / "avatar.jpeg",
}

MANIFEST: list[dict] = []


def font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    candidates = [
        r"C:\Windows\Fonts\simhei.ttf",
        r"C:\Windows\Fonts\msyhbd.ttc" if bold else r"C:\Windows\Fonts\msyh.ttc",
        r"C:\Windows\Fonts\simsun.ttc",
    ]
    for candidate in candidates:
        try:
            return ImageFont.truetype(candidate, size)
        except OSError:
            continue
    return ImageFont.load_default()


def save_jpg(img: Image.Image, path: Path, quality: int = 84) -> None:
    img.convert("RGB").save(path, "JPEG", quality=quality, optimize=True, progressive=True)
    MANIFEST.append({"output": str(path.relative_to(ROOT)).replace("\\", "/"), "bytes": path.stat().st_size})


def save_webp(img: Image.Image, path: Path, quality: int = 82) -> None:
    img.save(path, "WEBP", quality=quality, method=6)
    MANIFEST.append({"output": str(path.relative_to(ROOT)).replace("\\", "/"), "bytes": path.stat().st_size})


def cover_resize(img: Image.Image, size: tuple[int, int]) -> Image.Image:
    return ImageOps.fit(img.convert("RGB"), size, method=Image.Resampling.LANCZOS, centering=(0.5, 0.5))


def main() -> None:
    # ---- P-01 contract report mockup (already generic, no client data) ----
    if SOURCES["contract"].exists():
        img = Image.open(SOURCES["contract"])
        img = cover_resize(img, (1600, 900))
        save_jpg(img, PROJ / "contract-report.jpg", 85)

    # ---- P-02 Lite-Mamba MRI plate (public BraTS imagery; keep 3 panels) ----
    if SOURCES["lite"].exists():
        img = Image.open(SOURCES["lite"]).convert("RGB")
        target_w = 1600
        target_h = round(img.height * target_w / img.width)
        img = img.resize((target_w, target_h), Image.Resampling.LANCZOS)
        save_webp(img, PROJ / "lite-mamba.webp", 84)

    # ---- P-04 MES: crop out brand header and left menu, keep form content ----
    if SOURCES["mes"].exists():
        img = Image.open(SOURCES["mes"]).convert("RGB")
        # 1600x1000 source: header y<55, sidebar x<190. Keep only the workbench content.
        crop = img.crop((190, 58, min(img.width, 1596), min(img.height, 978)))
        crop = cover_resize(crop, (1400, 900))
        # Light unsharp so text stays readable after scaling.
        crop = crop.filter(ImageFilter.SHARPEN)
        save_jpg(crop, PROJ / "mes-workbench.jpg", 84)

    # ---- P-05 taxi: architecture SVG, replace client name ----
    if SOURCES["taxi"].exists():
        svg = SOURCES["taxi"].read_text(encoding="utf-8", errors="ignore")
        svg = svg.replace("佳裕", "某出行运营企业").replace("十堰", "某市")
        (PROJ / "taxi-architecture.svg").write_text(svg, encoding="utf-8")
        MANIFEST.append({"output": "public/showcase/projects/taxi-architecture.svg", "bytes": (PROJ / "taxi-architecture.svg").stat().st_size})

    # ---- P-07 SCP: architecture SVG (no client name found; keep generic) ----
    if SOURCES["scp"].exists():
        svg = SOURCES["scp"].read_text(encoding="utf-8", errors="ignore")
        for name in ("荆门石油", "荆门"):
            svg = svg.replace(name, "某能源国企")
        (PROJ / "scp-architecture.svg").write_text(svg, encoding="utf-8")
        MANIFEST.append({"output": "public/showcase/projects/scp-architecture.svg", "bytes": (PROJ / "scp-architecture.svg").stat().st_size})

    # ---- avatar: 800px square, jpeg ----
    if SOURCES["avatar"].exists():
        img = Image.open(SOURCES["avatar"])
        img = cover_resize(img, (800, 800))
        save_jpg(img, ROOT / "public" / "avatar-800.jpg", 86)

    # ---- poster: a clean lightbox plate for the hero (no title text; overlay carries it) ----
    poster = Image.new("RGB", (1600, 900), "#12100D")
    draw = ImageDraw.Draw(poster)
    lite_out = PROJ / "lite-mamba.webp"
    if lite_out.exists():
        mri = Image.open(lite_out).convert("L")
        mri = ImageOps.fit(mri, (1360, 560), method=Image.Resampling.LANCZOS)
        mri = ImageOps.colorize(mri, black="#0B0907", white="#D8D1C2")
        poster.paste(mri, (120, 170))
    draw.rectangle((80, 90, 84, 810), fill="#B23A2A")
    draw.rectangle((120, 170, 1480, 730), outline="#3A3227", width=2)
    # Keep the poster image-only: the player overlay carries title / duration / labels.
    save_jpg(poster, OUT / "poster.jpg", 88)

    # ---- OG cover 1200x630: designed for link previews ----
    og = Image.new("RGB", (1200, 630), "#12100D")
    og_draw = ImageDraw.Draw(og)
    if lite_out.exists():
        mri = Image.open(lite_out).convert("L")
        mri = ImageOps.fit(mri, (520, 400), method=Image.Resampling.LANCZOS)
        mri = ImageOps.colorize(mri, black="#0B0907", white="#D8D1C2")
        og.paste(mri, (640, 120))
    og_draw.rectangle((60, 70, 63, 560), fill="#B23A2A")
    og_draw.text((95, 100), "PERSONAL READING REPORT / 2026", font=font(15, True), fill="#B23A2A")
    og_draw.text((95, 180), "从一张切片", font=font(54, True), fill="#F3EBDD")
    og_draw.text((95, 250), "到一条产线。", font=font(54, True), fill="#F3EBDD")
    og_draw.text((95, 360), "让模型，在真实系统里跑起来。", font=font(22), fill="#CFC3AE")
    og_draw.text((95, 470), "张栋栋  /  全栈开发 · AI 应用", font=font(20), fill="#EDE4D3")
    og_draw.text((95, 510), "7 项作品 · 2 套企业系统 · 30 篇知识文档", font=font(15), fill="#9C8F7A")
    og_draw.rectangle((640, 120, 1160, 520), outline="#3A3227", width=2)
    save_jpg(og, OUT / "og-cover.jpg", 84)

    # ---- favicon: BS seal ----
    favicon = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="8" fill="#12100D"/>
  <rect x="6" y="6" width="52" height="52" rx="4" fill="none" stroke="#B23A2A" stroke-width="2"/>
  <text x="32" y="41" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="24" font-weight="700" fill="#F3EBDD">BS</text>
</svg>
"""
    (ROOT / "public" / "favicon.svg").write_text(favicon, encoding="utf-8")
    MANIFEST.append({"output": "public/favicon.svg", "bytes": (ROOT / "public" / "favicon.svg").stat().st_size})

    (OUT / "MANIFEST.json").write_text(json.dumps(MANIFEST, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(MANIFEST, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
