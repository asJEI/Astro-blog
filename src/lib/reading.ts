const CODE_FENCE = /```[\s\S]*?```/g;
const INLINE_CODE = /`[^`]*`/g;
const HTML_TAG = /<[^>]+>/g;
const MARKDOWN_URL = /\]\([^)]*\)/g;
const CJK = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/g;
const LATIN_WORD = /[A-Za-z0-9]+/g;

/** Rough CJK-aware length and reading time for a markdown body. */
export function readingStats(body: string, wordsPerMinute = 400) {
  const plain = body
    .replace(CODE_FENCE, "")
    .replace(INLINE_CODE, "")
    .replace(HTML_TAG, "")
    .replace(MARKDOWN_URL, "]");

  const words = (plain.match(CJK)?.length ?? 0) + (plain.match(LATIN_WORD)?.length ?? 0);

  return {
    words,
    minutes: Math.max(1, Math.round(words / wordsPerMinute)),
  };
}
