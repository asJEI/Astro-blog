import type { CollectionEntry } from "astro:content";

export type BlogPost = CollectionEntry<"blog">;

export const blogTagGroups = {
  tech: ["技术交流", "项目讲解"],
  life: ["日常分享", "其他"],
  moments: ["幽微"],
} as const;

export const sortPostsByDateDesc = (posts: BlogPost[]) =>
  [...posts].sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

export const hasAnyTag = (post: BlogPost, tags: readonly string[]) =>
  post.data.tags.some((tag) => tags.includes(tag));

export const getPostHref = (post: BlogPost) => `/blog/${post.id}/`;

export type AdjacentPosts = {
  prev: BlogPost | null;
  next: BlogPost | null;
};

/** 按发布时间：上一篇 = 更早的文章，下一篇 = 更新的文章 */
export const getAdjacentPosts = (post: BlogPost, posts: BlogPost[]): AdjacentPosts => {
  const sorted = sortPostsByDateDesc(posts);
  const index = sorted.findIndex((item) => item.id === post.id);

  if (index === -1) {
    return { prev: null, next: null };
  }

  return {
    prev: sorted[index + 1] ?? null,
    next: sorted[index - 1] ?? null,
  };
};
