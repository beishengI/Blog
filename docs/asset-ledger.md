# 资产台账（公开版）

> 所有输出都在 `public/showcase/` 与 `public/`；客户原始截图不进入仓库，只保留裁剪/脱敏后的副本。  
> 公开台账使用代号，不在仓库写客户真实名称。

| 输出 | 来源（代号） | 处理 | 隐私标记 | 授权 |
|---|---|---|---|---|
| `public/portrait-halftone.webp` / `.jpg` | 用户提供 `Blog.jpeg` | 4:5 裁切 + 9px 半调网点 + 纸/墨双色 + 套准角 | 公开（用户提供） | 用户提供 |
| `public/avatar-800.jpg` | 同源旧头像 | 800×800 JPEG | 公开 | 用户提供 |
| `public/showcase/projects/contract-report.jpg` | 合同预审报告 mockup | 1600×900，干净设计稿 | 无客户数据 | 设计稿 |
| `public/showcase/projects/lite-mamba.webp` | BraTS2023 可视化三联图 | 1600px WebP，公开数据集 | 公开数据集，引用 BraTS | 公开数据集 |
| `public/showcase/projects/mes-workbench.jpg` | 制造企业 MES 载具工作台 | 裁掉品牌头/侧栏；1400×900 | 已裁剪，客户名不可见 | **待客户授权** |
| `public/showcase/projects/taxi-architecture.svg` | 出租车低代码分层架构 | 替换企业名/城市名 | 已替换 | **待客户授权** |
| `public/showcase/projects/scp-architecture.svg` | SCP 取数架构图 | 无企业名；保留方法示意 | 仅示意 | **待客户授权** |
| `public/showcase/poster.jpg` | 程序生成 + BraTS 三联图 | 1600×900，干净灯箱板 | 公开 | 自生成 |
| `public/showcase/og-cover.jpg` | 程序生成 | 1200×630 | 公开 | 自生成 |
| `public/resume/zhangdongdong-resume-2026-10.pdf` | 用户提供的 2026-10 一页简历 PDF | 1 页；电话脱敏为 153****3881；GPA/排名/平均分移除；证件照替换为半调肖像；PDF 元数据重写 | 公开脱敏版 | 用户提供 |
| `public/resume/zhangdongdong-resume-2026-10-preview.jpg` | 上述 PDF 第 1 页 160dpi 渲染 | 1100×1555 JPEG；用于 `/resume` 内嵌预览 | 公开脱敏版 | 用户提供 |
| `public/resume/zhangdongdong-resume.pdf` | 网页 `/resume` 打印 | 5 页；电话脱敏；无 GPA；无客户名；作为「完整版」保留 | 公开脱敏版 | 用户授权（待确认） |
| `public/favicon.svg` | 程序生成 BS 切片框 | — | 公开 | 自生成 |
| `public/showcase/profile-film.mp4` | HyperFrames 工程 | 48.0s；1920×1080；H.264 + AAC；3.5MB | 公开 | 已渲染 |

## 脱敏规则

- 客户名称、logo、项目代号、系统名：不出现在图片、SVG、字幕、旁白、页面文字、PDF。
- 人名、工号、手机号、车牌、身份证号、合同金额、单号、账号、IP：打码或裁掉。
- 证书：遮证书编号/身份证号；默认只展示脱敏缩略图或文字。
- 简历电话：只显示 `153****3881`；完整号码不进入源码/构建/公开 PDF。
- 简历公开版不展示 GPA / 排名 / 平均分，不使用证件照原件（以半调肖像替代）；带电话/GPA/证件照的原件只在面试材料中提供。
- 原始素材留在本地项目目录，不提交；`scripts/prepare-showcase-assets.py` 生成公开副本。

## 生成命令

```bash
python -X utf8 scripts/prepare-showcase-assets.py
python -X utf8 scripts/prepare-portrait.py
```

## 待确认

- 制造/出行/合同/能源四类客户截图的公开授权。
- 证书缩略图公开授权。
- 影片中真实界面片段的使用范围。
