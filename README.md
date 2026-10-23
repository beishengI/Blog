# 张栋栋 · 读片报告

> **Personal Reading Report**
> 让模型，在真实系统里跑起来。从一张切片，到一条产线。

这不是模板市场里的第 114514 号作品集，也不是简历的网页版。
7 个真实项目被排成一条能力链：**感知 → 理解 → 决策 → 执行 → 交付**。
版面借的是医院读片室那套语言——纸本报告负责可信，医学影像灯箱负责产品感；
半调肖像、切片框、朱印和三音扫描动机负责回答一个很朴素的问题：这个人是谁。

站点是纯静态的：没有后端、没有 CMS、没有微服务，
管理台和评论区都住在 `localStorage` 里，断电即遗忘，非常环保。

---

## 它是什么，不是什么

| 你可能以为 | 实际上是 |
|---|---|
| 简历网页版 | 简历只是其中一间房；隔壁还有 30 篇知识库和一条 48 秒的片子 |
| 又一个 Next.js 模板 | React 18 + Vite，无后端。部署 = 把 `dist/` 扔到任意静态服务器 |
| 复制粘贴就能用 | 文案全在 `src/data/*.ts`，改字不用碰组件；但它不会替你写简历 |
| 在线服务 | 离线可跑的静态站，断网也能 `npm run dev`（除非你手贱去点外链） |
| 一个正经开源项目 | 个人站。提 PR 前请先确认自己不是想改我的自拍 |

## 快速开始

```bash
npm install
npm run dev      # http://127.0.0.1:5173
npm run build    # gen:rss → tsc 类型检查 → vite 打包
npm run preview  # 看看 build 出来的是骡子是马
```

三步之内应该能看到首页。如果没看到，先确认 Node 版本，再确认自己没在 `new_blog/` 里执行命令——
那是上一版 Astro 实验，2026 年的考古现场，与本项目无关。

## 页面地图

| 路由 | 这页在干嘛 |
|---|---|
| `/` | 读片台：报告头、半调肖像、P-00 介绍片 + 7 个检查项、证据带、能力链、五章项目、扫描协议、经历、文献索引、报告签发 |
| `/work` | 检查列表：8 项（7 个项目 + 本站自己），按能力段分组 |
| `/work/:slug` | 单份检查报告：证据、指标、问题与判断、运行回放、决策与取舍、来源、相关阅读 |
| `/posts` | 文章目录：编辑式拼贴 Bento，7 篇按故事权重落位；搜索 / 分类 / 标签；用户新增文章进「增补」 |
| `/posts/:id` | 文章详情：三栏排版、左侧墨线目录、两个情绪锚点、页边批注、评论 / 上下篇 / 相关 |
| `/wiki` | 知识库：30 篇 / 四层 / 三条阅读路径 |
| `/wiki/:slug` | 单篇知识文档 |
| `/resume` | 个人报告：技能、实习、项目、教育、荣誉；内嵌一页版 PDF，另附 5 页完整版 |
| `/about` | 自述、工作原则、时间线、关于本站 |
| `/archive`、`/tags` | 归档 / 标签 |
| `/admin` | 本地管理台。功能保留，入口藏起来——毕竟没有后端，它管不了任何人 |

## 内容都在哪

改文案之前，先看这张表；看完你会发现组件里几乎没有字，全在数据里。

| 内容 | 文件 |
|---|---|
| 身份、导航、联系方式、功能开关 | `src/data/site.ts` |
| 7 个项目 + 本站元案例（角色/指标/证据/决策/来源） | `src/data/works.ts` |
| 技能、实习、项目、教育、荣誉、证书 | `src/data/resume.ts` |
| 首页证据带、能力链、技能证据、时间线、影片 meta | `src/data/showcase.ts` |
| 文章 | `src/data/posts.ts` |
| 编辑层：卡片权重 / 写作状态 / 章节锚点 / 页边批注 | `src/data/editorial.ts` |
| 知识库 | `src/content/wiki/` |

三条铁律，违反会被 `npm run check:content` 当场抓获：

1. **只写查得到的数字**。查不到就 `pending: true`，页面显示「待补充」——宁可承认不知道，也不编一个好看的数。
2. **客户一律匿名**：「某国企 / 某制造企业 / 某出行运营企业 / 某能源国企」。名字、logo、界面细节都不出现。
3. **每个项目至少一条证据**，`relatedWiki` / `relatedPosts` 必须存在；孤证不立，孤链会断。

## 设计系统：纸、墨、朱砂，以及一点执念

- 令牌：`src/styles/design/tokens.css`（纸 / 墨 / 朱砂 / 玉 / 石墨，日间与夜间两套）
- 组件与页面：`src/styles/design/report.css`
- 编辑层（2026）：`editorial.css`（发行信息条 / 手写批注 / 纸张）、`posts-editorial.css`、`article-editorial.css`
- 规格：`docs/brand-and-ia.md`；资产台账：`docs/asset-ledger.md`；内容来源：`docs/content-sources.md`

几个执念级符号：

- **切片框 Slice Mark**：方框 + 红角 + 扫描线。页头、章节、文章、页脚，四次出现，像 CT 定位线。
- **半调肖像**：9px 网点 + 纸/墨双色 + 套准角。证件照的尊严，印刷工人的浪漫。
- **朱印**：张栋栋 / 北省。两枚，不多不少。
- **三音扫描动机**：声音默认关闭，只在切换检查项或打开影片时响一下——像一个克制到极点的开机音。
- **印刷色条 / 套准线**：报告头和首页。它们不承担任何功能，只负责让你相信这张纸是印出来的。

## 2026 编辑式改版

- **全局发行信息条**：44px sticky，替代原大 logo 导航；`00 读片台 / 01 项目 / 02 文章 / 03 知识库 / 04 简历 / 05 关于` + 检索 / 声音 / 日夜。移动端折行，只留当前栏目和 `VOL.07`。
- **`/posts`**：非对称 Bento 拼贴目录，7 篇按故事权重落位；搜索 / 分类 / 标签走 URL 参数，可分享；新文章进「增补 / NEW ENTRIES」。标题字符躲避、拍立得、手写盖章、边角料索引卡抽屉——装饰很多，但它们都有 `aria-hidden`。
- **`/posts/:id`**：三栏（页边 / 正文 / 页边批注），左侧墨线目录；两个情绪锚点，暖灰 40–50% 和石墨 84–92%；Spotlight 手电、隐藏铅笔涂鸦；阅读数、评论、上下篇、相关文章一个不少。
- **无障碍与降级**：滚动动画走 CSS scroll-driven + IntersectionObserver，不监听 `window.onScroll`；`prefers-reduced-motion` 一开，视差、光斑、字符躲避全关，信息一条不丢；390 宽仍有 2 处斜置叠压，且没有横向滚动。
- **终检**：15 路由 × 1440/1024/390，外加 768/640，strict 模式 0 error / 0 warn，报告在 [`docs/editorial-qa.md`](docs/editorial-qa.md)。
- 设计稿、分镜、可交互原型放在本地 `design/`（65MB，不进仓库，理由见「隐私」一节）；站点实拍在 [`docs/screenshots/`](docs/screenshots/)。

## 影片（HyperFrames）

成品在本仓库：`public/showcase/profile-film.mp4`（1920×1080 / 24fps / H.264 + AAC / 48.0s / 3.5MB），
外加 `poster.jpg`、`narration.m4a`、`transcript.md`、`captions.srt`。

渲染工程 `video/profile-film/` 留在本地，不随仓库发布——它带着 node_modules 和一整个渲染农场的梦想，体量比站点大 10 倍。想复现：

```bash
cd video/profile-film
npm install
npx hyperframes preview --background
npx hyperframes render --quality delivery --output renders/profile-film.mp4
```

转成网页版：

```bash
ffmpeg -i renders/profile-film.mp4 \
  -c:v libx264 -crf 23 -preset slow -pix_fmt yuv420p \
  -c:a aac -b:a 128k -movflags +faststart \
  ../../public/showcase/profile-film.mp4
```

`src/data/showcase.ts` 里 `film.available` 已是 `true`：首页可播放、可暂停、可全屏，附文字稿和音频版。
不自动播放，不阻塞首屏——视频是彩蛋，不是路障。

## 隐私：这个仓库里没有我的手机号

写代码可以浪，隐私不能浪。以下几条是硬约束：

- **完整手机号从未进入本仓库**：源码、构建产物、公开 PDF 一律 `153****3881`。真想公开，自己在本地 `.env.local` 设 `VITE_PUBLIC_PHONE` 和 `VITE_SHOW_PUBLIC_PHONE=true` 再构建，风险自负。
- **原始简历不进仓库**：带电话、GPA、证件照的原件只作为面试材料。仓库里的两版 PDF 都已脱敏，元数据也重写过。
- **客户素材只放脱敏副本**：客户名称一律代号；`mes-workbench.jpg`、`taxi-architecture.svg`、`scp-architecture.svg` 三张仍标注「待客户授权」，**刻意没有入库**。所以：本地 dev 能看到图，刚 clone 下来访问对应项目会 404——这不是 bug，是授权还没到。
- **凭据不进门**：本地 Dify / 面板 / 测试账号之类的地址和密码写在本地文件里（如 `Dify DSL/`），已在 `.gitignore` 拉黑。分享仓库前，请先跑一遍下面的检查，并顺手把这些文件从聊天记录里也删掉。
- **证书编号 / 身份证号不公开**：默认只展示文字，需要缩略图就先遮编号。

自查：

```bash
$env:PRIVATE_PHONE='<完整手机号>'   # 只放在当前进程环境里，不写文件
npm run check:privacy
npm run check:content
```

`privacy-denylist.local.txt` 是本地客户词表（已 gitignore），一行一个词，别提交。

## 验证

```bash
npm run build         # 必须过；过不了别推
npm run build:pages   # 验证 /Blog/ 子路径
npm run check:content # 数据规则
npm run check:privacy # 手机号 / 密钥 / 客户词
```

本地视觉 QA（需要全局 Playwright + Chrome）：

```bash
$env:NODE_PATH="$env:APPDATA\npm\node_modules\@playwright\cli\node_modules"
node scripts/qa-shot.cjs http://127.0.0.1:5173/
node scripts/qa-editorial.cjs --strict-content
```

截图落在 `.verify/`（已 gitignore）。验收清单：

- 控制台无报错；桌面 / 移动端无横向滚动（含 640/768/1024 中间宽度）。
- `/posts` 7 篇全可见、可点入；文章页 6 个 H2 与两个锚点顺序正确。
- 发行条 `00–05`、搜索、声音、日夜、移动端菜单都能用。
- 移动端首屏 3s 内可见姓名、定位、CTA；视频不挡首屏。
- 7 个项目都有角色 / 栈 / 指标 / 证据，或诚实的「待补充」。
- 视频有 poster、字幕、文字稿、音频版、播放控制。
- 公开产物无完整手机号、无客户名、无密钥。

## 部署

```bash
npm run build:pages   # base=/Blog/
npm run deploy:pages  # 会真的推送，先确认
```

- 影片、字体、PDF 都在 `public/`，随静态站发布；影片建议 ≤20MB。
- `scripts/deploy-pages.mjs` 保留了 SPA fallback，刷新不会 404。
- **未确认前不要执行 `deploy:pages`**。这条说三遍：不要、不要、不要。

## 待确认

清单在 [`docs/pending-confirmations.md`](docs/pending-confirmations.md)。当前默认：

- 手机号脱敏，完整号不公开。
- 微信二维码留占位，不伪造。
- 客户截图用裁剪图 / 示意图，授权后再替换。
- 4C / SCP 的团队角色待确认。
- 合同项目不写具体模型型号。
- GPA / 排名 / 平均分已从公开页面移除。

## 目录

```
src/
  data/          site / works / resume / showcase / posts / editorial
  showcase/      首页与读片台组件
  components/    chrome / report / media / work / article / editorial
  pages/         路由页面
  styles/design/ tokens / report / editorial / posts-editorial / article-editorial
  content/wiki/  30 篇 Markdown
public/
  showcase/      项目证据、poster、影片、文字稿
  resume/        脱敏 PDF（一页版 + 五页完整版）
scripts/         资产处理、隐私与内容校验、PDF 打印、Playwright QA
docs/            品牌与信息架构、内容来源、资产台账、终检报告、待确认清单
```

本地保留、**不进仓库**：`design/`（设计稿与原型，65MB）、`video/`（HyperFrames 工程，125MB）、
`new_blog/`（上一版 Astro 实验）、`Dify DSL/`（含本地凭据）、`.dsh-vision-router/`（工具状态）。
它们都在 `.gitignore` 里，想单独发版就另开仓库。

## 最后一句

这个站点的全部野心，是让你在关掉标签页之前多停三秒——
如果你停了三秒，说明纸张的纹理、或某个数字的诚实，至少有一个起了作用。
