/** Explicit editorial connections; frontmatter `related` takes priority. */
export const readingTrails: Record<string, { slug: string; reason: string }[]> = {
  "fine-tuning": [{ slug: "pre-training", reason: "思考的来路：这篇文章从 Pre-training 留下的问题继续展开。" }],
  "pre-training": [{ slug: "fine-tuning", reason: "继续往下读：当我们开始参与自己的训练，改变如何发生？" }],
  "weights": [{ slug: "overfitting", reason: "沿着文中的过拟合隐喻，继续理解过去如何影响今天。" }],
};
