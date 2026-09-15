import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";
import { categoryIds } from "./lib/categories";

const tagsSchema = z.preprocess((value) => {
  if (Array.isArray(value)) {
    return value.map((tag) => String(tag).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(/[,，]/)
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
}, z.array(z.string()));

const blog = defineCollection({
  loader: glob({
    base: "./src/content/blog",
    pattern: "**/*.{md,mdx}",
    generateId: ({ entry, data }) => data.slug ?? entry.replace(/\.(md|mdx)$/, ""),
  }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    slug: z.string(),
    description: z.string().optional(),
    category: z.enum(categoryIds).nullable(),
    tags: tagsSchema.default([]),
    draft: z.boolean().default(false),
    afterwords: z.array(z.object({
      date: z.coerce.date(),
      text: z.string(),
      heading: z.string().optional(),
    })).default([]),
    related: z.array(z.object({
      slug: z.string(),
      reason: z.string(),
    })).default([]),
  }),
});

export const collections = { blog };
