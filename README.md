# Astro-blog

北海的个人博客，基于 [Astro](https://astro.build) + TypeScript 搭建，部署于 [Cloudflare Pages](https://pages.cloudflare.com)。

线上地址：[https://www.hokkai2005.online](https://www.hokkai2005.online)

## 简介

从 WordPress 迁移而来的静态博客，用来记录日常、计算机学习与 AI 产品实践。支持响应式布局、深色模式、文章检索与 SEO。

内容分类：

- **技术** — AI / 工程 / 产品思考
- **生活** — 日常与随笔
- **幽微** — 更碎片的记录

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

## 相关链接

- 博客：[https://www.hokkai2005.online](https://www.hokkai2005.online)
- GitHub：[https://github.com/asJEI/Astro-blog](https://github.com/asJEI/Astro-blog)
- 关于页：[/about](https://www.hokkai2005.online/about)
