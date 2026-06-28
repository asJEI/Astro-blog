import type { CollectionEntry } from "astro:content";

export type BlogPost = CollectionEntry<"blog">;

export const blogTagGroups = {
  tech: ["技术交流", "项目讲解"],
  life: ["日常分享", "其他"],
  moments: ["幽微"],
} as const;

export const sortPostsByDateDesc = (posts: BlogPost[]) =>
  posts.sort((a, b) => b.data.date.getTime() - a.data.date.getTime());

export const hasAnyTag = (post: BlogPost, tags: readonly string[]) =>
  post.data.tags.some((tag) => tags.includes(tag));
