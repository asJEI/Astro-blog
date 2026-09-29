# Astro-blog

北海的个人博客，基于 [Astro](https://astro.build) + TypeScript 搭建，部署于 [Cloudflare Pages](https://pages.cloudflare.com)。

线上地址：[https://www.hokkai2005.online](https://www.hokkai2005.online)

## 简介

从 WordPress 迁移而来的静态博客，用来记录日常、计算机学习与 AI 产品实践。支持响应式布局、深色模式、文章检索与 SEO。

内容分类：

- **经历** (`experience`) — 我经历了什么：个人成长、学校、实习、城市生活与人生阶段。
- **幽微** (`youwei`) — 我如何理解自己：以 AI 与技术概念为隐喻，讨论内心、自我认识和成长。
- **观察** (`observations`) — 我如何理解外部世界：从真实经历与问题出发，形成对技术、产品、商业和工作的判断。

### 文章元数据

```yaml
title: 文章标题
date: 2026-09-15
slug: stable-article-slug
description: 文章摘要
category: experience
tags: ["工作与职业", "用户需求"]
draft: false
```

`category` 必填，为三个稳定英文标识之一；每篇文章只属于一个核心栏目。
6 篇历史或功能性存档显式使用 `category: null`，以 Archive 展示，仍收录在所有文章和搜索中。
新文章原则上选择核心栏目。`tags` 是长期主题，每篇 1—3 个，优先选择 1—2 个，可跨栏目复用。
默认词表：自我认知、成长与选择、人际关系、校园生活、工作与职业、写作与表达、AI 编程、AI 产品、产品设计、用户需求、Web3、技术趋势、商业思考。
先复用再新增；新增主题应能关联至少 2 篇文章，并有持续写作空间。不从标题自动提取算法、工具或活动名，不用栏目名、Archive 或“其他”等泛化标签。

栏目定义、首页各栏目精选文章集中维护于 `src/lib/categories.ts`。
栏目 URL 为 `/blog/experience/`、`/blog/youwei/`、`/blog/observations/`。
文章 URL 始终为 `/blog/{slug}/`，与栏目和存放目录无关；已发布文章不要修改 slug。

### 旧栏目重定向

`public/_redirects` 为 Cloudflare Pages 配置 HTTP 301，覆盖旧栏目地址有、无末尾斜杠两种形式：
`life → experience`、`moments → youwei`、`tech → observations`。
旧 Astro 页面同时保留跳转，静态预览使用 HTML 跳转；部署到 Pages 后由 `_redirects` 返回真正的 HTTP 301。
其他托管平台需要配置同等的服务端重定向。

## 技术栈

- Astro 7 + TypeScript
- React（局部交互）
- Tailwind CSS 4
- Cloudflare Pages 自动部署

## 项目结构

```text
/
├── public/                 # 静态资源（图片等）
├── src/
│   ├── components/         # 布局、首页、博客、关于页组件
│   ├── content/blog/       # Markdown 文章
│   ├── lib/                # 博客与 SEO 工具函数
│   ├── pages/              # 路由页面
│   │   ├── index.astro
│   │   ├── about.astro
│   │   └── blog/
│   └── styles/
├── astro.config.mjs
└── package.json
```

## 本地开发

需要 Node.js `>= 22.12.0`。

```sh
npm install
npm run dev
```

本地默认地址：`http://localhost:4321`

| 命令 | 说明 |
| :-- | :-- |
| `npm install` | 安装依赖 |
| `npm run dev` | 启动本地开发服务器 |
| `npm run build` | 构建生产站点到 `./dist/` |
| `npm run preview` | 预览构建结果 |
| `npm run astro ...` | 运行 Astro CLI 命令 |

## 动效

首页氛围叫「风起时」：微光、分层入场、桌面轻视差，以及经历 / 幽微 / 观察各自的悬停反馈。阅读页只保留短过渡。

- 参数：`src/lib/motion-config.ts`
- 节奏：`src/styles/motion.css`
- 首页角落可切换「动态：开 / 关」，选择记在本地。系统开启「减少动态效果」时，按钮显示「已遵循系统」，装饰运动停止。
- 若持续绘制影响性能，可把 `motion-config.ts` 里的 `particle.enabled` 或 `parallax.enabled` 设为 `false` 后重新构建。

## 相关链接

- 博客：[https://www.hokkai2005.online](https://www.hokkai2005.online)
- GitHub：[https://github.com/asJEI/Astro-blog](https://github.com/asJEI/Astro-blog)
- 关于页：[/about](https://www.hokkai2005.online/about)
