# 《一份报告的旅行》· 网站宣传片设计包

> **A REPORT'S JOURNEY**
> 一份被退回的报告，缺一个受检者。
> 报告里的小读片员沿着网站去找这个人；它读完了所有证据，最后发现：报告可以自证，签名只能由本人落下。
>
> **60 秒 / 1920×1080 / 24fps / 一镜到底 / 14 镜 / 无旁白 / 中英字幕**

---

## 先看什么

| 顺序 | 文件 | 为什么 |
|---|---|---|
| 1 | [DESIGN.md](DESIGN.md) | 完整设计文档：创意、角色、世界、一镜到底规则、声音、视觉、制作 |
| 2 | [SHOOTING-SCRIPT.md](SHOOTING-SCRIPT.md) | 14 镜拍摄脚本：相机、动作、文字、声音、转场 |
| 3 | [character-sheet.png](character-sheet.png) | 角色设定：结构、动作库、眼睛、形态变化 |
| 4 | [storyboard-60s.png](storyboard-60s.png) | 60 秒分镜：14 个镜头节拍 |
| 5 | [camera-map-60s.png](camera-map-60s.png) | 一镜到底镜头图：空间、时间轴、运镜、批注、滚转 |
| 6 | [subtitles/](subtitles/) | 中文 / 英文 / 中英双语 SRT |

可编辑源文件：`character-sheet.html`、`storyboard-60s.html`、`camera-map-60s.html`（浏览器直接打开；无外部依赖）。

---

## 一句话

**把网站当成一栋可以走进去的读片室，让网站自己的符号当导游，最后让作者的手写把镜头收住。**

- **主角**：小片 / S-00，站点「切片框」符号活过来的读片员。方框、左上红角、扫描线眼睛、两条纸腿、一个收集印章的挎包。
- **故事**：一份缺受检者的报告，沿着网站去找作者；它盖了满满一包章，却找不到一张脸。最后它在「自述」看见一张闭着眼的半调肖像；肖像睁眼，插画纸手接住它，一行手写出现：「别找了。我在这儿。」
- **结构**：封面 → 读片台 → 检查所见 → 能力链 → 文献索引 → 文章 → 简历 → 自述 → 签发 → 片尾。
- **一镜到底**：14 个镜头节拍，0 个剪辑点；所有转场都是「穿过一个物体」；小片自己展开成门。
- **无旁白**：报告批注是叙述者，冷静、第三人称；第 45 秒，手写出现，这是全片唯一的「我」。笔尖就是人声。
- **片尾**：报告看完了。接下来，读我。

---

## 本轮已确认

| 项 | 决定 |
|---|---|
| 片名 | 《一份报告的旅行》/ A REPORT'S JOURNEY |
| 主角 | 小片 / S-00 |
| 旁白 | **无旁白**；报告批注 + 手写 |
| 时长 | **60 秒**（90 秒版归档） |
| 结尾 | 插画纸手，不用实拍手 |
| 字幕 | 中文 + 英文 + 中英双语 SRT |
| 二维码 | 墨色版，已用 pyzbar 实测可扫 |

---

## 关键数字

| 项 | 值 |
|---|---|
| 主片 | 60s / 1920×1080 / 24fps |
| 镜头 | 14 个节拍 / 0 剪辑点 / 10 个空间 |
| 旁白 | 无；画面文字约 18 条；手写 3 处 |
| 角色 | 8cm 高 / 84×84 框 / 20×20 红角 / 48×4 扫描线眼睛 |
| 红线 | 0 → 5m；从红角抽出，最后系住印章 |
| 交付 | 60s、30s 竖版、15s teaser、海报、中英字幕、HyperFrames 工程 |

---

## 制作状态

- [x] 60 秒结构、14 镜脚本
- [x] 角色设定图、60s 分镜、60s 镜头图
- [x] 中 / 英 / 双语字幕
- [x] 墨色二维码（可扫）
- [x] **60s / 30s 黑白 animatic（无音 / 中英字幕参考）**
- [x] HyperFrames 工程 / draft 渲染
- [x] 角色 SVG rig / 动作库
- [x] 音乐 / 音效 / 笔尖声
- [x] 60s 最终输出（30s / 15s 待出）

> 本包是**设计文档 + 60s 成片 + animatic**。60s 主片已出；30s 竖版 / 15s teaser 待出。设计取舍见 `DESIGN.md` 末尾。

### 成片（v7 · 75s 慢版 · 动作 / 镜头 / 声音 / 字幕修正）

| 文件 | 说明 |
|---|---|
| [report-journey-60s.mp4](../../video/report-journey/renders/report-journey-60s.mp4) | 1920×1080 / 24fps / 60s / H.264 + AAC / 干净版 |
| [report-journey-60s-softsub.mp4](../../video/report-journey/renders/report-journey-60s-softsub.mp4) | 同上 + mov_text 软字幕（默认关闭） |
| [contact-60s.jpg](../../video/report-journey/renders/contact-60s.jpg) | 16 帧接触印样 |
| [handwriting-46.4-47.4.jpg](../../video/report-journey/renders/handwriting-46.4-47.4.jpg) | 手写起笔 / 中段 / 完成 |
| [poster-16x9.png](../../video/report-journey/posters/poster-16x9.png) | 16:9 主海报 |
| [poster-4x5.png](../../video/report-journey/posters/poster-4x5.png) | 4:5 社交海报 |
| [poster-9x16.png](../../video/report-journey/posters/poster-9x16.png) | 9:16 竖版海报 |
| [subtitles/](subtitles/) | 中 / 英 / 中英双语 SRT |

v6 修掉了跳跃段小片透明度被误设为 0 的缺帧，重做了有动机的「保持构图 → 推入出口」运镜，把音效收敛为稀疏的纸步 / 界面 / 印章 / 笔尖，并把中英双语字幕直接烧进主片。v7 按「节奏太快」的反馈把整条时间线等比例放慢 25%（60s → 75s）：section、GSAP tween、音频 atempo、字幕时间码同步 ×1.25，仍为 24fps 逐帧渲染；60s v6 保留为快版对照。工程与渲染说明见 [`video/report-journey/README.md`](../../video/report-journey/README.md)。

### Animatic（v1）

| 文件 | 说明 |
|---|---|
| [animatic-60s-draft.mp4](../../video/report-journey-animatic/renders/animatic-60s-draft.mp4) | 1920×1080 / 24fps / 60s / 无音 / 14 镜 |
| [animatic-30s-vertical-draft.mp4](../../video/report-journey-animatic/renders/animatic-30s-vertical-draft.mp4) | 1080×1920 / 24fps / 30s / 无音 / 8 场竖版 |
| [contact-60s.jpg](../../video/report-journey-animatic/renders/contact-60s.jpg) | 60s 接触印样 |
| [contact-30s-vertical.jpg](../../video/report-journey-animatic/renders/contact-30s-vertical.jpg) | 30s 竖版接触印样 |
| [handwriting-46.4-47.4.jpg](../../video/report-journey-animatic/renders/handwriting-46.4-47.4.jpg) | 60s 手写三帧：起笔 / 中段 / 完成 |
| [handwriting-vertical-24.4-25.3.jpg](../../video/report-journey-animatic/renders/handwriting-vertical-24.4-25.3.jpg) | 30s 竖版手写三帧 |

评审重点：14 镜节奏、叠化是否像一镜到底、**0:46.4–0:47.4 手写起笔到完成**、30 秒竖版是否讲完「缺人 → 找 → 见人 → 签发」。

---

## 设计原则

1. **不另造吉祥物**：小片就是每个页面左上角的切片框；品牌一致，形态自由。
2. **一镜到底不是炫技**：镜头从封面读到签名，观众把报告读完；每次运镜都由小片的动作触发。
3. **无旁白也能讲故事**：等宽批注负责信息，手写负责「我」；笔尖声是唯一的人声。
4. **数字必须可查**：7 / 2 / 30 / 1 与所有指标来自 `works.ts`、`resume.ts`、README 与简历 PDF；没有出处的数字不进片。
5. **隐私是底线**：不出现完整手机号、客户名、GPA / 排名；截图脱敏。

---

## 目录

```
docs/promo-film/
├─ README.md                 本文件
├─ DESIGN.md                 完整设计文档（60s 主版）
├─ SHOOTING-SCRIPT.md        14 镜拍摄脚本
├─ character-sheet.html      角色设定（可编辑）
├─ character-sheet.png       角色设定（成图）
├─ storyboard-60s.html       60s 分镜（可编辑）
├─ storyboard-60s.png        60s 分镜（成图）
├─ camera-map-60s.html       60s 镜头图（可编辑）
├─ camera-map-60s.png        60s 镜头图（成图）
├─ subtitles/
│  ├─ zh.srt                 中文
│  ├─ en.srt                 英文
│  └─ bilingual.srt          中英双语
├─ assets/
│  └─ wechat-qr-ink.png      墨色二维码（可扫）
├─ scripts/
│  └─ make_qr_ink.py         二维码墨色化 + 可扫验证
├─ archive/90s/              90 秒扩展版（旧设计、脚本、分镜、镜头图）
└─ render.mjs                用 Playwright 重渲染 PNG
```

重新渲染（PowerShell）：

```powershell
$env:NODE_PATH='C:\Users\86138\AppData\Roaming\npm\node_modules\@playwright\cli\node_modules'
node docs/promo-film/render.mjs
```

---

*设计：张栋栋 × DSH / 2026-10-23 · 设计单一事实源：DESIGN.md · 执行以 SHOOTING-SCRIPT.md 为准*
*90 秒扩展版：`archive/90s/`*
