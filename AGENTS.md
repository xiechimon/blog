# Blog - Xiechimon 个人博客

> Astro + Retypeset 主题，部署于 VPS（Cloudflare Tunnel 暴露为 xmon.me）。AI 协作请遵循本文件约定。

## 项目概览

- **主题**: [astro-theme-retypeset](https://github.com/radishzzz/astro-theme-retypeset)（中文「重新编排」，以 Typography 为设计灵感）
- **站点**: `https://xmon.me`（`base: "/"`，VPS nginx 托管，经 Cloudflare Tunnel 暴露；旧域名 blog.xmon.me 301 跳转至此，www 同）
- **技术栈**: Node.js（lts）+ Astro 6 + TypeScript + UnoCSS + pnpm 10
- **语言/时区**: `zh`（`src/config.ts` 中 `global.locale`，仅中文，`moreLocales` 为空）
- **作者**: xiechimon（GitHub `xiechimon`，邮箱 `xiechimon@qq.com`）
- **备份**: 旧 Chirpy 主题在 `backup-chirpy` 分支
- **许可证**: MIT

## 技术栈

- pnpm 10 管理依赖（`pnpm-lock.yaml` 锁定）
- 构建: `astro build`（含 `astro check` 类型检查 + `apply-lqip` 图片占位处理），输出到 `dist/`（已 gitignore）
- 样式: UnoCSS（`uno.config.ts`），支持暗色模式
- 评论: 可选 Giscus / Twikoo / Waline（`src/components/Comment/`，配置在 `config.ts` 的 `comment` 段，当前关闭）
- SEO/RSS: 内置 sitemap / atom.xml / rss.xml / robots.txt / OG 图

## 目录结构

```
.
├── astro.config.ts        # Astro 配置（site、base、mdx、Katex、mermaid、partytown、compress 等）
├── package.json           # 脚本与依赖
├── uno.config.ts          # UnoCSS 配置
├── src/
│   ├── config.ts          # ⚠️ 站点级配置（title/社交/主题色/语言/评论/SEO/footer 等），所有个性化配置都改这里
│   ├── content.config.ts  # 内容 schema（posts / about）
│   ├── content/
│   │   ├── posts/         # ⚠️ 博文: frontmatter 含 title/published/tags/description/pin 等
│   │   └── about/         # 关于页（about-zh.md 等，按 lang 区分）
│   ├── pages/             # 路由: [...lang]/index 首页 / posts/[slug] / tags / about / atom.xml.ts / rss.xml.ts
│   ├── layouts/           # 布局组件
│   ├── components/        # 导航、页脚、评论、Widgets 等组件
│   ├── styles/            # 全局样式 + 字体
│   ├── i18n/              # 多语言文案（config/lang/path/ui）
│   ├── plugins/           # rehype/remark 插件（代码复制、图片处理、阅读时长等）
│   └── utils/             # 工具函数
├── public/                # 静态资源（favicon、字体、图标、音效等）
├── scripts/               # 辅助脚本（new-post、apply-lqip、deploy-vps 等）
└── AGENTS.md              # 本文件（CLAUDE.md 为软链接）
```

## 常用命令

```bash
pnpm install            # 安装依赖（首次 / package.json 变更后）
pnpm dev                # 本地开发 http://localhost:4321
pnpm build              # 类型检查(astro check) + 构建 + LQIP 处理
pnpm preview            # 预览构建产物
pnpm deploy:vps         # 构建 + rsync dist/ 到 VPS（xmon.me）
pnpm lint               # ESLint 检查
pnpm new-post           # 交互式新建文章
```

## 写作规范

### 新建文章

文件名: `src/content/posts/<slug>.md`，frontmatter 遵循 [schema](src/content.config.ts)：

```yaml
---
title: "标题"
published: 2026-08-24 15:30:00+08:00   # 发布日期（必填）；updated 为可选更新时间
tags: ["学习"]                          # 可选，标签数组；会生成 /tags/<名称>/ 归档页
description: "SEO 描述"                 # 可选
pin: 1                                  # 可选，置顶（数字 0-99，越大越靠前）
draft: true                             # 可选，草稿（构建时不发布）
toc: true                               # 可选，是否显示目录
lang: ""                                # 可选，文章语言（默认跟随站点 zh）
---
```

- **主题用 Tags 而非 Categories**，分类用 `tags`
- 支持数学公式（`remark-math` + `rehype-katex`）、mermaid 图、代码块复制按钮、图片 LQIP 占位
- 图片放 `public/` 或引用相对/绝对路径
- **正文禁止一级标题**：`title` 已由 `src/pages/[...lang]/posts/[slug].astro` 渲染为唯一 `<h1>`，正文一律从 `##` 开始，禁止再写 `# 标题`（否则出现两个大标题）
- **参考统一用 `## 参考`**：不用 `## 参考链接` / `参考文献`，与 `claude-pi-slash-commands-guide` / `herdr-tutorial` 保持一致，TOC 可收录

### 主题配置

所有站点级配置写在 `src/config.ts`（`site` / `global` / `color` / `comment` / `seo` / `footer` / `preload`）。修改后需重启 dev server；站点多语言文案在 `src/i18n/ui.ts`。

**文案分工**：`i18nTitle: true` 时，标签页标题/副标题/SEO 描述的生效值在 `src/i18n/ui.ts` 的 `zh` 段（连同「文章/归档/标签」等导航词）；`config.ts` 里同名三项仅为后备，改它不生效。「关于」页正文在 `src/content/about/about-zh.md`，与配置无联动。

## 部署

- 部署目标: VPS（`ssh pqy`，nginx 托管 `/var/www/blog/`，经 Cloudflare Tunnel 暴露为 `https://xmon.me`）
- 命令: `pnpm deploy:vps`（= `astro build` + `rsync dist/` 到 `pqy:/var/www/blog/`）
- 本地验证: `pnpm build` 通过后再部署

## 开发约束

- 保持 `src/config.ts` 中 `site.base: "/"` 与 `site.url: "https://xmon.me"` 一致（影响线上路径与 sitemap/feed/OG）
- `pnpm-lock.yaml` 需随 `package.json` 一起提交
- 不要提交 `dist/`、`node_modules/`（已 gitignore）
- 提交信息遵循 conventional 格式：`type(scope): 简洁中文`（如 `feat(lightbox): ...`、`fix(dev): ...`、`style(icons): ...`、`docs/chore/test` 同理），关联博文更新时注明 slug

## 给 AI Agent 的协作约定

- 优先用 `pnpm dev` / `pnpm build` 验证，而非手写 astro 参数
- 修改 `src/config.ts` / `astro.config.ts` 后务必 `pnpm build` 验证
- 新增/修改文章后务必 `pnpm build` 验证：检查 `dist/posts/<slug>/index.html` 中 `<h1` 仅 1 个（`post-title`）、`## 参考` 存在且无 `# 标题` 残留、`astro check` 通过
- 回答用户时涉及主题功能，引用 https://github.com/radishzzz/astro-theme-retypeset 与 https://docs.astro.build
- 保持语言与站点一致（默认中文），代码注释可中英混合
- 不要在未确认时修改 `url`/`base` 等身份与路径配置

### 写作 DNA 自动调用 SOP

**触发条件**：用户提到"写文章"/"重写"/"润色"/"改写"/"扩写"/"翻译"/"编译"/"按 XX 风格写"/"帮我写"/"帮我改"等动作。

**前置条件**：
- DNA 产物存在：`/Users/xmon/.claude/skills/writing-dna-skill/authors/<作者>/Writing-DNA.md`
- **新作者**：先 `/writing-dna-skill` 蒸馏（Step 1-7），再用 DNA 写

**输入确认**（不确定时用 AskUserQuestion；默认场景 A / 作者阮一峰）：
- **场景**：A 原创深度文（默认）/ B 周刊 / C 编译
- **作者**：阮一峰（默认）/ 其他已蒸馏作者
- **新写 vs 重写**已有文章

**Step-by-step 流程**：
0. **调研主题内容**（新写时必做；重写时可读目标文章全文、跳过外部调研）：
   - **通用网页**：`WebFetch` 直接抓取 / `agent-reach`（15 平台路由器）
   - **复杂单页**（X 长文/付费墙/JS 渲染/需登录）：`baoyu-url-to-markdown`（Chrome CDP + 适配器）
   - **深度调研**：派 `research` skill 或 `general-purpose` Agent 抓 ≥5 篇原文 + 综合分析报告（输出到 `/tmp/<主题>-research.md`）
   - **代码相关**：`code-graph` 探索 / 直接 Read 源码
   - **浏览器交互**：`ego-browser`（需登录态、JS 渲染、截图）
   - **架构类**：写架构文时用 `archify` 出图
1. **读 DNA 速查版**：`Writing-DNA.md`（≤4000 字，按场景 A/B/C 应用）
2. **读 5 篇 raw 校准语感**：
   - 从 `raw/` 下选同 `article_type` 的最近 5 篇
   - Read 全文，注意句长/标点/列举格式/段落节奏
3. **按场景应用写作规则**：
   - **场景 A**：设问开篇 + 服务承诺 + 段落 2-3 句 + `**（1）**` 列举 + （完）
   - **场景 B**：固定开头 + 主题文章 + 列表板块 + 无评价纯推荐
   - **场景 C**：忠实原文（纯翻译）或强烈个人立场（编译+评论）
4. **写文章**：保持原内容事实（如果是润色），只换写法
5. **配图（必选）**：
   - **首选**：`baoyu-danger-gemini-web`（Gemini 逆向 Web API，质量优先）
   - **兜底**：`baoyu-image-gen`（OpenAI/Azure/Google/OpenRouter/DashScope 等官方 API）
   - **专项工具**（按需）：
     - 封面 → `baoyu-cover-image`（5 维 × 11 调色板 × 7 渲染风格）
     - 正文插图分析（位置识别 + 批量生成）→ `baoyu-article-illustrator`
6. **build 验证**：`pnpm build` 必须通过

**Checklist（写完后逐项检查）**：
- [ ] 开头用设问或场景（场景 A）/ 固定开头（场景 B）
- [ ] 段落 2-3 句（场景 A）或列表项 1-2 句（场景 B）
- [ ] 列举用 `**（1）**` 编号（场景 A）
- [ ] 加粗 3-8 处，仅核心概念
- [ ] 无 AI 警示词（显然/无疑/值得注意的是/不可否认）
- [ ] 不用分隔线、彩色文字
- [ ] 截图配"上图/下图/下面是"引导（如有图）
- [ ] 结尾用"（完）"
- [ ] 翻译标注来源 URL（场景 C）/ 编译区分「直接引用」与「据 X 提炼」（见 L7）
- [ ] 场景 C 纯翻译：忠实原文，不套用场景 A 的设问/列举格式
- [ ] 引用用 `>` 块（场景 C 编译）
- [ ] `pnpm build` 通过（h1 仅 1 个、## 参考 存在、无 # 标题残留、astro check 0 errors）

**异常处理**：
- DNA 产物不存在 → 触发 `/writing-dna-skill` 蒸馏新作者
- 校准 raw 不足 5 篇 → 减少到 3 篇并标注
- 用户场景不明 → 默认场景 A
- 用户没指定作者 → 默认阮一峰
- build 失败 → 先判断根因（文章问题 vs 环境/依赖问题）；文章问题修正后重 build（最多重试 2 次，总计 ≤3 次构建）；**3 次仍失败或非文章原因 → 停止并如实告知用户**（遵循 L7 报忧规则）

**退出条件**：
- 文章已写入 `src/content/posts/`（新建或覆盖）
- `pnpm build` 通过

### new-post.md 自动重命名

完成文章写作并 `pnpm build` 验证通过后，自动将 `src/content/posts/new-post.md` 重命名为合适的 slug 文件名：

- 基于 `frontmatter.title` 提取 slug；命名规范 `YYYY-MM-DD-<slug>.md`（`published` 缺失则用当天日期）
- slug 转换：小写、空格转 `-`、去除特殊字符（：`、`、`、`.`、`？`、`/` 等）
- 英文标题直接用 kebab-case；中文标题**优先英文翻译**（兼容 SEO/链接）；用户已在 title 里写英文（如 "matt-pocock skill"）则保留英文 + 拼音补充
- 重命名前确认不与现有文件冲突；如冲突加 `-2`、`-3` 后缀
- 用 `git mv` 保留历史，不要删除重建
- 示例：`matt-pocock skill 详解` → `matt-pocock-skills-explained.md`

### L7 坦诚与来源（强制规则）

写作过程中遇到以下情况，**必须立刻跟用户说，不要默默替代或跳过**：

- **强登录态内容**（牛客/知乎/小红书/公众号/朋友圈/Reddit 等）：**先问"需要登录态，你能提供吗？"**，不要尝试 WebFetch 后默默用二手汇总替代（如 GitCode 汇总替代牛客原帖）
- **抓取失败 / 部分失败**：明确标注 "X 个 URL 失败 / 失败原因"，不要用 "成功抓取 X 篇" 的模糊表述
- **AI 综合提炼 vs 直接引用**：行业内容（面经/数据/事件）必须区分 "直接 quote" 和 "据 X 提炼"，不要把综合提炼的"原话"标成"X 公司面试官原题"
- **AI 倾向"报喜不报忧"**：每次汇报前问自己 "有没有隐瞒失败？"
- **来源真实性**：副标题/导语里的来源描述必须和实际素材一致（如 "基于牛客 20 篇" 但实际是 GitCode 二手汇总，必须修正，不能凑数）
- **用户给了登录态后**：用 `ego-browser` 抓真实原帖（macOS），不能用二手替代品糊弄
- **先 curl 试一下**：很多公开内容（牛客面经 HTML 等）不用登录态就能拿到，能拿到就不需要登录态和 ego-browser

## 软链接说明

本仓库 `AGENTS.md` 为主文件，`CLAUDE.md` 为指向它的软链接（`ln -s AGENTS.md CLAUDE.md`），两者内容完全一致，适配 Pi / Claude Code 等不同 Agent 的加载规则。修改时只需编辑 `AGENTS.md`。
