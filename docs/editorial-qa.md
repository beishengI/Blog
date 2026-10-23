# 《读片》VOL.07 改版 QA · 终检报告（strict）

- 时间：2026-10-18 08:44 → 08:50（Asia/Shanghai）
- 命令：`node scripts/qa-editorial.cjs --strict-content`（Playwright / Chrome headless，BASE=http://127.0.0.1:5173）
- 扫描范围：15 条路由 × 1440/1024/390 三视口 = 45 路由×视口；另加 768/640 窄视口全路由复核（30 路由×视口）
- 产物：`.verify/editorial/report.json`（终检 JSON）、129 张截图、`.verify/editorial/qa-final.log`
- **退出码：0；ERROR 0；WARN 0；WIP 0**

## 1. 终检结果

| 指标 | 结果 |
|---|---|
| 路由×视口（主） | 45，全部 pass（`{"pass":45,"warn":0,"wip":0,"fail":0}`） |
| 检查项 | 1073 |
| 交互检查 | 37 项全通过（检索/声音/日夜/移动菜单/面板对齐） |
| 暗色检查 | 20 个组合全部 darkOk（data-mode=dark、body 亮度 0.064、无纯白块、无溢出） |
| 窄视口 768/640 | 30 路由×视口全部 pass；横向溢出 0，footer 内部溢出 0 |
| console error / pageerror / 4xx / 请求失败 | 0 |
| 截图 | 129 张（45 视口 + 30 全页 + 20 暗色 + 30 窄视口 + 4 状态图） |
| 发行条 | height=44px、position=sticky、滚动后 top=0、`--ed-header-h=44px`（差 0px） |

## 2. 修复点逐项复核（全部通过）

| # | Lead 修复 | 终检证据 |
|---|---|---|
| 1 | 发行条锁 44px，搜索面板对齐 | `band:height-spec` pass「实测高度=44px vs --ed-header-h=44px（差 0px）」；`search:panel-offset` pass `{"bandBottom":44,"panelTop":44,"gap":0}`（1440/1024/390）；`menu:panel-offset` pass gap=0（390） |
| 2 | ≤1180 显示 VOL.07 | `band:edition-visible` pass：1024 可见文本「读片 VOL.07 00 读片台 01 项目…」；390 可见文本「读片 VOL.07 02 文章 检索 目录」 |
| 3 | 非导航路由移动端当前页 | `nav:mobile-current` pass：/archive→「归档」、/tags→「标签」、/tags/Agent→「标签」、/admin→「管理」，不再出现「00 读片台」 |
| 4 | 文章页 390 元信息去孤立分隔符 + chips/pills 渐隐 | `content:article-meta-sep` pass「≤620 元信息分隔符可见数量=0 / 3」；`ui:horizontal-fade` pass：`jp-filter__cats`（403/358）、`ja-pills__scroll`（707/358）均带 gradient mask |
| 5 | wiki 正文重复 H1 去掉 | `h1:single` pass：1440/1024/390 均为「h1 数量=1」 |
| 6 | footer 640–1023 溢出 | 窄视口 768/640 × 15 路由：`narrow:overflow-x` 全 pass、`narrow:footer-overflow` 全 pass；footer grid 实测 2 列（768：395.8px + 282.7px；640：327.1px + 233.7px），footer scrollWidth==clientWidth |

## 3. warnings 差异（第一轮 → 终检）

第一轮 29 条 warnings（5 类）→ 本轮 **0 条**：

| 第一轮 warning 类 | 数量（R1） | 本轮状态 |
|---|---|---|
| band:height-spec（45/45.3 vs 44） | 3 | 已修复 → pass（44 vs 44，差 0） |
| search:panel-offset（压 1–1.3px） | 3 | 已修复 → pass（gap 0） |
| menu:panel-offset（压 1px） | 1 | 已修复 → pass（gap 0） |
| band:mobile-edition（移动端无 VOL.07） | 12 | 已修复 → 新检查 band:edition-visible 全 pass |
| nav:mobile-current（回落 00 读片台） | 4 | 已修复 → pass（归档/标签/管理） |
| h1:single（wiki 双 H1） | 3 | 已修复 → pass（count=1） |

> 说明：终检前一轮曾出现 1 条 `ui:horizontal-fade` 警告，来源是文章页代码块 `hljs language-text`（626/324）被通用横滑检查误判；代码块横向滚动属正常设计，已在检查中排除 pre/code/hljs 容器后复跑，终检 WARN=0。

## 4. 终检关键截图索引

| 截图 | 内容 |
|---|---|
| `.verify/editorial/desktop-posts.png`（+ `-full.png`） | /posts 1440 终检 |
| `.verify/editorial/desktop-article-contract.png`（+ `-full.png`） | 文章页 1440 终检 |
| `.verify/editorial/mobile-article-contract.png`（+ `-full.png`） | 文章页 390 终检（无孤立分隔符） |
| `.verify/editorial/narrow-768-about.png` | /about 768 终检 |
| `.verify/editorial/narrow-640-about.png` | /about 640 终检 |
| `.verify/editorial/review-footer-768.png` / `review-footer-640.png` | footer 2 列、无溢出 |
| `.verify/editorial/desktop-wiki-context.png` | wiki 详情单 H1 |
| `.verify/editorial/mobile-home.png` / `mobile-posts.png` | 390 发行条「读片 VOL.07 …」 |
| `.verify/editorial/dark-desktop-*.png` / `dark-mobile-*.png` | 暗色 20 组合 |
| `.verify/editorial/state-*-search-open.png` / `state-mobile-menu-open.png` | 检索面板 / 移动目录 |

## 5. 结论

Lead 的 6 项修复全部通过终检；全站 strict 模式 **0 严重问题、0 警告、0 WIP**，无 console/网络/横向溢出问题，1440/1024/768/640/390 与暗色模式均未发现新回归。终检通过，可发布。
