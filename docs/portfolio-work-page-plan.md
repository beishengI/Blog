# 作品展示页（/work）设计方案 —— 灵感落地

> 参考来源：Rauno Freiberg / Henry Heffernan / Maggie Appleton / Bruno Simon /
> Paco Coursey / Emil Kowalski / Josh Comeau / Mark Progano（均已人工核对）。
> 本文把这些参考转译为本项目（React 18 + Vite + Tailwind，无 framer-motion）可执行的方案。

## 0. 核心判断

这个博客的内容底盘是 **Agent / LLM 工程**（30+ 篇 wiki、AI 主题布局、TerminalHome 等），
最好的"标志性交互"不是抄一个 3D 世界，而是**让访客现场"运行"一个作品**。
这是 Josh Comeau（可玩的解释）× Rauno（交互即作品）× Maggie（内容成网）三者的交点，
而且与站内既有内容天然一致——审美和自己做的东西一致，这才是个人表达。

组合公式（采纳外部评审结论）：
**Paco 的清晰结构 ＋ Rauno 的交互作品区 ＋ Maggie 的内容关联 ＋ 一个属于 Agent 作者的签名交互。**

## 1. 参考 → 可借鉴点速查

| 参考 | 本质 | 落地到本项目 |
|---|---|---|
| Rauno /craft | 小交互单独成作品（morph、blur reveal、精度滑块） | 作品详情拆成"决策小节"；作品墙 hover 即演示 |
| Henry 复古电脑 | 导航隐喻化、世界观一致 | 2D 工作台隐喻（抽屉/图纸），借世界观不借 3D |
| Maggie 知识花园 | 个人辨识度与内容绑定 | 作品 ↔ 30+ 篇 wiki ↔ 博文互相连线 |
| Bruno 开车世界 | 一句话可描述的概念 | 只要"一句话能记住"，体验是加分项不是门槛 |
| Paco | 克制结构 + 项目选择即品味 | /work 的信息架构底座；Now / Craft 分栏 |
| Emil | 讲取舍（"You Don't Need Animations"） | 详情页写"为什么没做 X"；动画只做在交互上 |
| Josh | 演示不是附件，是内容本身 | 作品内嵌 live demo / 交互回放 |
| Mark Progano | Builder/Bridge/Craft 定位叙事 | About/Resume 的定位文案，避免技术栈清单 |

## 2. 路由与数据层

- 新增路由：`/work`（作品墙）与 `/work/:slug`（作品详情），注册进 `App.tsx` 与 Header 导航。
- 数据层：`src/data/works.ts`，模式仿照 `posts.ts`。字段建议：

```ts
interface Work {
  slug: string;
  title: string;
  tagline: string;          // 一句话，像 Bruno 那种能被转述的句子
  why: string;              // 为什么做（why > what）
  status: 'live' | 'archived' | 'exploring';
  demo?: { kind: 'iframe' | 'replay' | 'gif'; src: string }; // 现场运行区
  decisions: { title: string; body: string }[];  // Rauno 式决策小节
  tradeoffs?: string;       // Emil 式取舍/没做什么
  relatedWiki: string[];    // 关联 src/content/wiki 的条目 slug（Maggie 连线）
  relatedPosts: string[];   // 关联博文 id
  links: { label: string; url: string }[];
  date: string;
}
```

- `src/data/resume.ts` 已存在：作品与简历经历互链，Mark Progano 式"经历→作品"闭环。

## 3. 作品墙（/work）——三种候选概念

按"与 Agent 作者身份契合度"排序：

### A. Agent Console（推荐）
入口是一个可输入的迷你 agent 控制台：输入 `/works` 列出作品，`/open <slug>`
以**流式打字 + 工具调用状态**展开作品卡片（对接真实数据，不是假动画）。
- 记忆点："那个能用 agent 逛的作品集"。
- 兼容底线：控制台下方始终保留普通列表入口，探索是加分项不是门槛（Bruno 教训）。
- 复用：TerminalHome 的终端质感、站内的 Agent 叙事。

### B. 工作台桌面（Henry-lite，2D）
桌面俯视图：图纸（文档类作品）、终端窗口（工具类）、相框（设计类），点击摊开成详情。
纯 CSS 分层 + 少量拖拽，不做 3D。

### C. 索引卡物理墙（Rauno 式）
卡片 hover 时内嵌 micro-demo 实时播放，点击卡片 morph 展开为详情页。
最克制、最好维护，但记忆点弱于 A。

## 4. 详情页信息架构（Rauno × Josh × Maggie 混合）

1. **头部**：tagline + why（一段话，不写"本项目使用了 React"这种废话）；
2. **现场区**：live demo 或"交互回放播放器"（预录工具调用流，静态站可托管 JSON 事件序列前端播放）；
3. **决策小节**：3–5 个，每节一个具体设计/实现决策（Rauno craft 式）；
4. **取舍**：没做什么、为什么（Emil 式，最见品味）;
5. **知识连线**：相关 wiki 卡片 + 复盘文章（Maggie 花园；站内 30+ wiki 是现成弹药）；
6. 底部 PrevNextNav（复用现有组件）。

## 5. 风格护栏（防 AI slop）

- 禁止：紫蓝渐变、渐变裁切标题、满屏 backdrop-blur 玻璃卡、滚动进场大动画。
- 排版：等宽字体承载结构（与 Agent 主题一致）+ 一个显示字体做大标题；正文沿用主题字体。
- 颜色：跟随 ConfigContext 现有主题系统，作品页只加一个强调色语义（如"运行中"的琥珀色）。
- 动效预算：只给**交互反馈**做动画（hover/点击/展开），页面自身不做装饰性循环动画。
- 复用现有组件：Reveal、Magnetic、InkSplash 按需取用，不新造动画库。

## 6. 分期实施

| 期 | 内容 | 产出 |
|---|---|---|
| P1 | 数据层 + `/work` 基础墙 + 详情页骨架 + Header 入口 | 可部署的内容优先版本 |
| P2 | 详情页决策小节 + wiki/post 连线组件 | Maggie 式关联生效 |
| P3 | 签名交互（A/B/C 择一）+ demo 回放播放器 | 记忆点 |
| P4 | About/Resume 定位文案改写（Builder/Bridge/Craft 叙事） | 全站叙事一致 |

## 7. 决策记录（已拍板 · P1 已实施）

- [x] 签名交互：**A. Agent Console**（/works、/open <n|slug> 流式加载作品卡，列表兜底常在）
- [x] demo 形态：**预录交互回放**（works.ts 静态事件序列 + RunReplay 播放器，可暂停/续播/重播）
- [x] 首批作品 5 件：合同预审智能体 / Lite-Mamba / Qwen3 推理服务 / LLM 知识库（站内） / 出租车平台

P1 落地清单：`src/data/works.ts`、`src/components/AgentConsole.tsx`、`RunReplay.tsx`、
`TypedText.tsx`、`src/pages/WorkPage.tsx`、`WorkDetailPage.tsx`、路由与导航入口。
待办：P4 About/Resume 定位文案改写（Builder/Bridge/Craft 叙事）；作品数据文案由本人复核替换占位事实。

## 8. P2 · 世界观重塑「案卷档案室」（回应"要强烈个人审美"）

P1 被指出仍像"配置化博客的一页"。参考站真正的共同点是**世界观**而非单个交互
（Henry=电脑、Maggie=花园、Bruno=驾驶），故为 /work 造独立世界：

- **概念**：宣纸 × 宋体 × 朱砂印 × 等宽机录——"老纸的判词与机器的日志相遇"。
  身份合体：智能医学工程（病历案卷）× Agent 工程（run.log 时间戳）。
- **实现**：`.work-archive` 作用域重定义全部颜色/字体/圆角 CSS 变量，
  子树组件零改动自动进入案卷世界；**刻意不随主题预设换肤漂移**
  （先例：毛体幕布"作品独立于主题令牌"，globals.css 固定配色）。
  暗色模式=夜里的档案室（暗木台面×旧纸文字）。
- **语汇**：公文题头（双朱线）/ 毛笔大标「作品案卷」/ 全宗号·立卷人·卷号（壹贰叁…）
  / 朱印「北省之印」/ 状态戳（现行/在修/存卷）/ 案卷卡左缘红签条 / 卷号水印
  / 「机录」agent console（唯一等宽岛=纸与机器的接缝）/ 卷末「全卷完」收束。
- **详情页=卷宗**：案号 BS-001 → 题名 → 判词（朱杆）→ 立案缘由 → 机录回放
  → 数字账 → 设计判词（判壹/判贰…）→ 未做之事 → 引据（wiki/复盘连线）→ 相邻卷。
