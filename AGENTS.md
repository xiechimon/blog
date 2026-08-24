# Blog - Xiechimon 个人博客

> Astro + Typography 主题，部署于 GitHub Pages。AI 协作请遵循本文件约定。

## 项目概览

- **主题**: [astro-theme-typography](https://github.com/moeyua/astro-theme-typography)（中文「活版印字」移植版）
- **站点**: `https://xiechimon.github.io/blog`（`site` + `base: "/blog"`，GitHub Pages project pages）
- **技术栈**: Node.js 22 + Astro 5 + TypeScript + UnoCSS + pnpm
- **语言/时区**: `zh-cn`（`src/.config/user.ts` 中 `appearance.locale`）
- **作者**: xiechimon（GitHub `xiechimon`，邮箱 `xiechimon@qq.com`）
- **备份**: 旧 Chirpy 主题在 `backup-chirpy` 分支
- **许可证**: MIT

## 技术栈

- pnpm 10 管理依赖（`pnpm-lock.yaml` 锁定）
- 构建: `astro build`（含 `astro check` 类型检查），输出到 `dist/`（已 gitignore）
- 样式: UnoCSS（`uno.config.js`），支持暗色模式
- 评论: 可选 Disqus / Giscus / Twikoo（`src/components/comments/`，配置在 `user.ts`）
- SEO/RSS: 内置 sitemap / atom.xml / robots.txt

## 目录结构

```
.
├── astro.config.ts        # Astro 配置（site、base、mdx、Katex、swup 等）
├── package.json           # 脚本与依赖
├── uno.config.js          # UnoCSS 配置
├── src/
│   ├── .config/           # 主题配置
│   │   ├── default.ts     # 主题默认配置（勿改）
│   │   ├── user.ts        # ⚠️ 站点级配置（title/社交/导航/主题色等），所有个性化配置都改这里
│   │   └── index.ts       # 合并逻辑
│   ├── content/
│   │   ├── posts/         # ⚠️ 博文: frontmatter 含 title/pubDate/categories/description/pin 等
│   │   └── spec/          # 特殊页面（如 about.md）
│   ├── pages/             # 路由: [...page].astro 首页 / archive / categories / about / atom.xml.ts
│   ├── layouts/           # LayoutDefault / LayoutPost / LayoutPostList
│   ├── components/        # 导航、页脚、评论、SEO 等组件
│   ├── styles/global.css  # 全局样式
│   ├── i18n.ts            # 多语言文案
│   └── utils/             # 文章/分类工具
├── public/                # 静态资源（favicon.svg、placeholder 等）
├── scripts/               # 主题辅助脚本（create-post 等）
├── .github/workflows/pages-deploy.yml  # GitHub Pages 构建部署
└── AGENTS.md              # 本文件（CLAUDE.md 为软链接）
```

## 常用命令

```bash
pnpm install            # 安装依赖（首次 / package.json 变更后）
pnpm dev                # 本地开发 http://localhost:4321（base 已设为 /blog，预览走 /blog/...）
pnpm build              # 类型检查(astro check) + 构建到 dist/
pnpm preview            # 预览构建产物
pnpm lint               # ESLint 检查
pnpm astro build --base /    # 临时以根路径构建（仅本地预览用，勿提交）
```

> 本地预览注意：`base` 为 `/blog`，开发服务器会以 `/blog/...` 提供页面；若想以根路径看，可用 `--base /` 覆盖（改 `astro.config.ts` 也行，构建/推送前记得还原）。

## 写作规范

### 新建文章

文件名: `src/content/posts/<slug>.md`，frontmatter 遵循 [schema](src/content.config.ts)：

```yaml
---
title: "标题"
pubDate: 2026-08-24 15:30:00+08:00   # 发布日期（必填）；modDate 为可选更新时间
categories: ["学习"]                  # 必填，数组；会生成 /categories/<名称>/ 归档页
description: "SEO 描述"               # 可选
pin: true                             # 可选，置顶
draft: true                           # 可选，草稿（构建时不发布）
banner: 图片路径                        # 可选，文章头图（宽高 ≤ 4096px）
---
```

- **该主题无 Tags**，如需分类用 `categories`
- 分类名是中文时，URL 会走 `src/utils/getPathFromCategory` + `categoryMap`（见 `user.ts`，可配置 `{ name: '学习', path: 'study' }` 自定义拼音路径）
- 图片放 `public/` 或引用相对/绝对路径，`banner` 尺寸限制宽高 ≤ 4096
- 支持数学公式（`remark-math` + `rehype-katex`，`user.ts` 中 `latex.katex: true` 开启）

### 主题配置

所有站点级配置写在 `src/.config/user.ts`（`site` / `appearance` / `seo` / `comments` / `analytics` / `latex` / `rss`），会深度合并进 `default.ts`。修改后需重启 dev server；社交图标名使用 [Material Design Icons](https://pictogrammers.com/library/mdi/)。

## 部署

- 推送 `main`/`master` 自动触发 `.github/workflows/pages-deploy.yml`：`checkout` → `setup-node 22` + `pnpm` → `pnpm install --frozen-lockfile` → `pnpm build` → `upload-pages-artifact`(dist) → `deploy-pages`
- 部署目标: GitHub Pages（`permissions: pages: write, id-token: write`）
- 本地验证：`pnpm build` 通过再推送
- GitHub Pages 只部署 `main`；`backup-chirpy` 为旧主题备份分支，不会发布

## 开发约束

- 保持 `astro.config.ts` 中 `base: "/blog"` 与 `user.ts` 中 `site.website: "https://xiechimon.github.io/blog"` 一致（影响线上路径与 sitemap/feed）
- `pnpm-lock.yaml` 需随 `package.json` 一起提交；CI 用 `--frozen-lockfile`，锁文件更新后要一起推
- 不要提交 `dist/`、`node_modules/`（已 gitignore）
- 构建后页面链接、feed（`atom.xml`）确认带 `/blog` 前缀（`@astrojs/rss` 对相对链接不感知 base，已在 `src/pages/atom.xml.ts` 用 `import.meta.env.BASE_URL` 修复）
- 提交信息简洁中文或英文，关联博文更新时注明 slug

## 给 AI Agent 的协作约定

- 优先用 `pnpm dev` / `pnpm build` 验证，而非手写 astro 参数
- 修改 `astro.config.ts` / `src/.config/user.ts` 后务必 `pnpm build` 验证
- 新增文章后跑 `pnpm build` 确保无断链、`astro check` 通过
- 回答用户时涉及主题功能，引用 https://github.com/moeyua/astro-theme-typography 与 https://docs.astro.build
- 保持语言与站点一致（默认中文），代码注释可中英混合
- 不要在未确认时修改 `url`/`base`/`site.website` 等身份与路径配置

## 软链接说明

本仓库 `AGENTS.md` 为主文件，`CLAUDE.md` 为指向它的软链接（`ln -s AGENTS.md CLAUDE.md`），两者内容完全一致，适配 Pi / Claude Code 等不同 Agent 的加载规则。修改时只需编辑 `AGENTS.md`。
