export const categoryIds = ["experience", "youwei", "observations"] as const;
export type CategoryId = (typeof categoryIds)[number];

export const categories = {
  experience: {
    label: "经历",
    href: "/blog/experience/",
    eyebrow: "Experience",
    description: "人生没有版本回退，所幸文字可以替我留下每一次提交。",
    featuredSlug: "university-01",
  },
  youwei: {
    label: "幽微",
    href: "/blog/youwei/",
    eyebrow: "Youwei",
    description: "以铜为镜，可以正衣冠；以人为镜，可以明得失；以史为镜，可以知兴亡；以算法为镜，可以照幽微。",
    featuredSlug: "attention",
  },
  observations: {
    label: "观察",
    href: "/blog/observations/",
    eyebrow: "Observations",
    description: "世界不断给出新的问题，而我仍在学习如何提问。",
    featuredSlug: "demo-to-product",
  },
} as const;
