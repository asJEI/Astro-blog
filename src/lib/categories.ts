export const categoryIds = ["experience", "youwei", "observations"] as const;
export type CategoryId = (typeof categoryIds)[number];

export const categories = {
  experience: {
    label: "经历",
    href: "/blog/experience/",
    eyebrow: "Experience",
    description: "我经历了什么。记录个人经历、成长、学校、实习、城市生活和人生阶段。",
    featuredSlug: "university-01",
  },
  youwei: {
    label: "幽微",
    href: "/blog/youwei/",
    eyebrow: "Youwei",
    description: "我如何理解自己。以 AI、机器学习与技术概念为隐喻，讨论人的内心、自我认识和成长。",
    featuredSlug: "attention",
  },
  observations: {
    label: "观察",
    href: "/blog/observations/",
    eyebrow: "Observations",
    description: "我如何理解外部世界。从真实经历和问题出发，记录对 AI、产品、互联网、社区、Web3、商业和工作的观察与判断。",
    featuredSlug: "demo-to-product",
  },
} as const;
