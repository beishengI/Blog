"""把 Lite-Mamba 的真实影像与预测打包成 Web 体切片图集。

输入（默认 D:/Lite_Mamba/可视化系统/data）：
  extracted/ASNR-MICCAI-BraTS2023-GLI-Challenge-TrainingData/<case>/<case>-t1c.nii.gz
  prediction_results/<experiment>_labelmap/<case>.nii.gz

输出（默认 public/showcase/volume）：
  brats-intensity.jpg  8x8 瓦片图集，灰度 = 归一化 T1c 强度（体积小，慢链路也能快速上屏）
  brats-labels.png     8x8 瓦片图集，灰度 = 标签 0/1/2/3（无损、NEAREST 采样）
  brats-atlas.json     体数据元信息（层数 / 网格 / 标签图例 / 来源）

约定：
  图集第 0 行第 0 列为第 0 层（最下层），切片沿轴向自下而上排列，
  着色器用 flipY=false 采样，保证体数据的方向与真实影像一致。
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

import nibabel as nib
import numpy as np
from PIL import Image

DEFAULT_ROOT = Path(r"D:\Lite_Mamba\可视化系统\data")
DEFAULT_EXPERIMENT = "E016_sparsebn_lite_v2_ws075_adamw_lr1e4_labelmap"
TILE = 128
SLICES = 64
GRID = 8


def load_volume(path: Path) -> np.ndarray:
    return np.asanyarray(nib.load(str(path)).dataobj).astype(np.float32)


def crop_bounds(mask: np.ndarray) -> tuple[slice, slice, slice]:
    """裁剪到脑组织包围盒；平面方向补成正方形，避免拉伸。"""
    xs, ys, zs = np.where(mask)
    x0, x1 = xs.min(), xs.max() + 1
    y0, y1 = ys.min(), ys.max() + 1
    side = max(x1 - x0, y1 - y0)
    cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
    x0 = max(0, cx - side // 2)
    y0 = max(0, cy - side // 2)
    x1, y1 = x0 + side, y0 + side
    limit = mask.shape[0]
    if x1 > limit:
        x0, x1 = limit - side, limit
    if y1 > limit:
        y0, y1 = limit - side, limit
    return slice(x0, x1), slice(y0, y1), slice(zs.min(), zs.max() + 1)


def resize_plane(plane: np.ndarray, size: int, nearest: bool) -> np.ndarray:
    mode = "F" if plane.dtype == np.float32 else "L"
    image = Image.fromarray(plane.astype(np.float32) if mode == "F" else plane.astype(np.uint8), mode=mode)
    image = image.resize((size, size), Image.NEAREST if nearest else Image.BILINEAR)
    return np.asarray(image)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", type=Path, default=DEFAULT_ROOT)
    parser.add_argument("--experiment", default=DEFAULT_EXPERIMENT)
    parser.add_argument("--case", default="BraTS-GLI-00300-000")
    parser.add_argument("--out", type=Path, default=Path("public/showcase/volume"))
    args = parser.parse_args()

    case_dir = args.root / "extracted" / "ASNR-MICCAI-BraTS2023-GLI-Challenge-TrainingData" / args.case
    t1c_path = case_dir / f"{args.case}-t1c.nii.gz"
    label_path = args.root / "prediction_results" / args.experiment / f"{args.case}.nii.gz"
    for path in (t1c_path, label_path):
        if not path.exists():
            raise SystemExit(f"[volume] 缺少输入：{path}")

    volume = load_volume(t1c_path)
    labels = load_volume(label_path)
    if volume.shape != labels.shape:
        raise SystemExit(f"[volume] 形状不一致：{volume.shape} vs {labels.shape}")

    brain = volume > 0
    if not brain.any():
        raise SystemExit("[volume] T1c 中没有脑组织体素")

    bx, by, bz = crop_bounds(brain)
    volume = volume[bx, by, bz]
    labels = np.rint(labels[bx, by, bz]).astype(np.uint8)
    depth = volume.shape[2]

    # 强度归一化：取脑组织 1%–99.5% 分位，避免个别高亮体素压扁动态范围
    values = volume[volume > 0]
    low, high = np.percentile(values, 1), np.percentile(values, 99.5)
    scale = 255.0 / max(1e-5, high - low)

    z_index = np.linspace(0, depth - 1, SLICES).round().astype(int)
    side = GRID * TILE
    intensity_atlas = np.zeros((side, side), dtype=np.uint8)
    label_atlas = np.zeros((side, side), dtype=np.uint8)
    tumor_slices = 0

    for index, z in enumerate(z_index):
        plane = np.clip((volume[:, :, z] - low) * scale, 0, 255)
        intensity = resize_plane(plane.astype(np.float32), TILE, nearest=False)
        label_plane = np.clip(resize_plane(labels[:, :, z], TILE, nearest=True), 0, 3)

        row, col = divmod(index, GRID)
        rows = slice(row * TILE, (row + 1) * TILE)
        cols = slice(col * TILE, (col + 1) * TILE)
        intensity_atlas[rows, cols] = np.clip(intensity, 0, 255).astype(np.uint8)
        label_atlas[rows, cols] = label_plane.astype(np.uint8)
        if label_plane.max() > 0:
            tumor_slices += 1

    args.out.mkdir(parents=True, exist_ok=True)
    intensity_path = args.out / "brats-intensity.jpg"
    labels_path = args.out / "brats-labels.png"
    Image.fromarray(intensity_atlas, mode="L").save(intensity_path, quality=88, subsampling=0, optimize=True)
    Image.fromarray(label_atlas, mode="L").save(labels_path, optimize=True)

    meta = {
        "dataset": "ASNR-MICCAI BraTS 2023 GLI Challenge TrainingData（公开研究数据集，已脱敏）",
        "case": args.case,
        "modality": "T1c",
        "labels": "Lite-Mamba 预测（" + args.experiment.replace("_labelmap", "") + "）",
        "slices": SLICES,
        "grid": GRID,
        "tile": TILE,
        "files": {"intensity": intensity_path.name, "labels": labels_path.name},
        "sourceShape": list(map(int, volume.shape)),
        "tumorSlices": tumor_slices,
        "tumorRatio": round(tumor_slices / SLICES, 3),
        "channels": {"intensity": "T1c 强度 uint8（JPEG）", "labels": "标签 0/1/2/3（PNG，NEAREST）"},
        "labelLegend": {"1": "NET 非增强肿瘤", "2": "ED 水肿", "3": "ET 增强肿瘤"},
    }
    (args.out / "brats-atlas.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    size_kb = (intensity_path.stat().st_size + labels_path.stat().st_size) / 1024
    print(f"[volume] case={args.case} depth={depth} -> {SLICES} 层，含肿瘤切片 {tumor_slices} 层")
    print(f"[volume] 图集 {GRID}x{GRID} · {TILE}px · 合计 {size_kb:.0f}KB -> {intensity_path.name} + {labels_path.name}")


if __name__ == "__main__":
    main()
