import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

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
  }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    description: z.string().optional(),
    tags: tagsSchema.default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
