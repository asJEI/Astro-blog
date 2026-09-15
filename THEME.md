# 北海 · 未完成时

## 主题入口

- 视觉规则：`src/styles/notebook.css`。
- 首页编排与推荐语：`src/components/home/MainContent.astro`。
- 首页背景与标题：`src/components/home/Hero.astro`。
- 作品摘要：`src/pages/portfolio.astro`；原完整作品集仍在 `public/portfolio/product-portfolio.html`。

## 为旧文章增加后记

在文章顶部 YAML 中添加以下字段。这里的日期和文字仅为格式示例，应替换成真实的写作日期与内容。

```yaml
afterwords:
  - date: 2026-09-15
    heading: 再读时的补充
    text: |
      写下今天的新理解。
      原文保持不变。
```

后记显示在正文后，可展开、收起。未填写时不显示空模块。

## 手动关联文章

```yaml
related:
  - slug: pre-training
    reason: 这篇文章从 Pre-training 留下的问题继续展开。
```

关联只会显示已存在且非草稿的文章，不会链接到当前文章本身。显式填写的关联优先于 `src/lib/reading-trails.ts` 中的默认阅读路径。

## 验证与预览

- `npm run build`
- `npm run dev -- --background`
- `npm run astro -- dev status`

音乐默认暂停、播放列表默认收起；用户主动播放后可继续跨页收听。日夜模式保留选择，减少动态效果遵循系统偏好。
