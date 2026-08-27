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
- 新增文章后跑 `pnpm build` 确保无断链、`astro check` 通过
- 回答用户时涉及主题功能，引用 https://github.com/radishzzz/astro-theme-retypeset 与 https://docs.astro.build
- 保持语言与站点一致（默认中文），代码注释可中英混合
- 不要在未确认时修改 `url`/`base` 等身份与路径配置

## 软链接说明

本仓库 `AGENTS.md` 为主文件，`CLAUDE.md` 为指向它的软链接（`ln -s AGENTS.md CLAUDE.md`），两者内容完全一致，适配 Pi / Claude Code 等不同 Agent 的加载规则。修改时只需编辑 `AGENTS.md`。
