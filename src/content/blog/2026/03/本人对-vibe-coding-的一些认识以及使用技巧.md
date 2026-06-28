---
title: 本人对 Vibe Coding 的一些认识以及使用技巧
date: 2026-03-31
description: Vibe Coding ，一种以 AI（Agent）为核心、以自然语言为媒介、以感觉（Vibe）为反馈的新型编程方式. “Vibe Coding”翻译成中文是“氛围编程”。所谓的氛围编程，我认为是一种程序员将全身心沉浸在代码输出与修订的过程，类似于心理学上所描述的 “心流” 状态。程序员借助 AI 编译工具毫无阻...
---

> **Vibe Coding**，一种以 AI（Agent）为核心、以自然语言为媒介、以感觉（Vibe）为反馈的新型编程方式.

“Vibe Coding”翻译成中文是“氛围编程”。所谓的氛围编程，我认为是一种程序员将全身心沉浸在代码输出与修订的过程，类似于心理学上所描述的**“心流”**状态。程序员借助 AI 编译工具毫无阻塞地将心中所涌现出的绝妙想法完美地落实成代码。达到一种只需要把控“感觉”，将具体实现交给 AI 的情景。

在传统的开发模式中，程序员的身份更像是工匠，他们需要一砖一瓦地去敲入语法、处理内存和调试逻辑。但是在 Vibe Coding 模式下，程序员的身份更像是**导演**或者说是**设计师**，可以不再去关心代码的具体写法，而是通过自然语言向 AI 描述你所需要的东西。这种模式大幅度缩短了从“想法”到“成品”的路径。

Vibe Coding 模式的出现并没有降低程序员的门槛，反而提高了对程序员**“高级审美”**和**“系统性思维”**的要求。就拿前端网页来说，AI 可以很快地生成多个风格不同的网页，而程序员则要从这些网页之间挑选出合适的、更符合用户体验和观感的界面。同时在 Debug 时，面对 AI 的反馈，不能只是机械地将错误报告拖到窗口然后告诉他“帮我修改 bug”，而是要明确地指出：“这里有一个 bug，数据类型和格式错误，请修改成正确的格式并且检查其他文件有无相同或类似 bug”。这也要求程序员需要有清晰的表达能力，你必须是一个优秀的沟通者。如果你连自己想要什么都说不清楚，AI 在厉害也只会生成出来一堆精美的“屎山代码”。

所以如何正确的 Vibe Coding 就显得尤为重要了。结合我看过的部分书籍以及我使用 Cursor 和 GitHub Copilot 的一些经验，我认为 Vibe Coding 可以分为四个部分：**道、法、术、器**。

## ☯️道：Philosophy & Mindset

> “道”是 Vibe Coding 的灵魂，也是决定你与 AI 协同的底层逻辑。

在这个部分，要从“代码编写者”的思维跳出来，进入到**“系统架构者”**这个更高的层次。让 AI 成为你的工具，让宝贵的精力更多地聚焦在“需求”与“目的”上。在过往的程序开发中，程序员担任的是“体力劳动”，是具体的、繁琐的代码编写；但是在 Vibe Coding 中，程序员应该是整个程序的架构师，将上下文视为链接自己与 AI 的桥梁，可以清楚明确地表述出自己的需求，将代码的自主权交给 AI。在这种思维状态下，程序员可以深切地体会到 Coding 的魅力，沉浸在 Vibe 中。

程序员要接受**“人类定义问题，AI 解决问题”**的现实，做到以“目的主导，上下文优先，结构先行”的底层思维。

## 📜法：Methodology & Strategy

> “法”是实现“道”的策略，是人与 AI 协作的一套标准化工作流。

这里的法是指和 AI 沟通的方法，打个比方就好像是修仙小说中的功法一样，是关于“灵气”运行的基础理论。这里有三个方法：

### 1\. 递归进化法

递归进化法有两个概念，第一步是**创生 (Bootstrap)**，第二步是**自省 (Self-Correction)**。

这里举一个具体的例子，比如本博客悬浮窗中的昼夜主题切换。首先第一步是创生，在我们脑海中有了一个这样的想法后，我们可以先使用自然语言向 AI 描述：

“我想要制作一个用以昼夜切换的圆形滑块，整体是胶囊风格，其中要求平滑过渡，背景颜色渐变。请告诉我这种效果的提示词。”

像这样指出自己的需求和整体框架后，AI 就会反馈出一个详细的提示词。随后来到第二步，我们接着复制这段提示词，继续让 AI 检查自身逻辑，生成更精准的提示，让最后的成品无限逼近我们的预期。

### 2\. 上下文管理法

AI 的记忆是有限的。对于一个大型项目或者短时间内不能迅速完成的项目，我们需要提高 AI 的记忆，避免出现“昨天还好好的，但是今天就像弱智一样”的问题。这就要求我们做好上下文管理。一个简单的方法就是在文件的根目录下新建一个名为 `.cursorrules` 的文件，或者名为 `memory-bank/` 的文件夹。这里面存放的内容很简单，就是对程序的整体规划和要求。这样在每次开工前告诉 AI“读取一下记忆文件并进行同步”，每次结束时再告诉 AI“将今天的工作内容和接下来的计划存储到记忆文件中”。

这样做的好处也很明显，那就是防止 AI 在使用过程中突然抽风或者突然使用不符合要求的代码，也能保证程序总体的一致性。而且在切换其他 AI 工具时，我们可以直接将记忆文件拖给另一个 AI，从而快速切换工具，不用再费时费力地重新说一遍。

### 3\. 模块化渐进法

一个大型的程序，文件目录或者代码是非常繁琐的。哪怕我们在此前就进行了明确的架构和规划，也不能指望着 AI 一口气将所有代码生成或者优化完毕。这里可以引入模块化的概念，坚持**“一次只改一个地方”**和**“接口先行”**的原则，防止 AI 在大规模重构中产生逻辑幻觉。我们在最初构造时对每个文件夹做好规划，使其负责一个具体的功能，这样在优化或者增加功能的时候会方便很多。

## 🛠️术：Techniques & Skills

> “术”是具体的沟通技巧，决定了 AI 输出的质量。

如果说“法”是功法的话，那么“术”就是具体的“法术”和“战斗技巧”。这里一共有三个“法术”：

### 1\. 提示词技巧

-   **角色化：**就像是 Cosplay 一样，在开始阶段要先给 AI 一个明确的身份。比如在编写某个前端网页时，你可以预设 AI 的角色：“你现在是一位精通 React 和 Tailwind 的高级前端工程师，你追求极致的代码简洁和性能。”
-   **样本化：**我们需要给 AI 一个可以参考的代码，可以是自己之前写过的代码，也可以是某个开源的代码。这一步是为了给 AI 打样，让 AI 生成出来的代码更符合使用者的习惯，更加灵活。
-   **“少即是多”原则：**我们不应该一次性告诉 AI 十个需求，不能让他“既要……又要……”，而是要把需求拆解出来，细分成每一个具体的细节（可以参考模块化渐进法）。将一个大型程序细分成一个个模块或者细分出一个个具体的功能，随后像是拼积木一样一块块拼接搭建起来。把一个复杂的不易理解的需求划分成一个个具体的简单的步骤，就是“少即是多”的精髓。

### 2\. 交互式 Debug

AI 写代码难免出错，我们不能单纯地将错误报告贴上去，而是用引导的方法去指挥 AI。

将**“预期 vs 实际”**进行对比。比如：“我的预期是：点击按钮后出现弹窗。实际情况是：控制台报 404 错误。请你检查路径配置，并给出分析原因，先不要改代码。”这样有助于 AI 识别出具体的差距，而不是简单地浏览错误报告后再去一行行地修改。在 AI 反馈出具体的原因后再让他进行纠错，就会精准很多。

另一种就是**“自查”**。在发现 bug 后告诉 AI：“在你修改之前，请先复述一遍你对目前逻辑的理解，确保我们没有偏差。”让 AI 根据现有知识进行自我反思，确保不是理解上的差异。或者采用**“最小复现”**，只将出问题的代码贴给 AI，防止他被无用的繁杂代码干扰出现理解错误，导致越改越错（这种方法 debug 之后切记要关注一下有没有修改函数名或者变量名等内容）。

### 3\. 多模态协作

充分利用现代 AI 助手的眼睛和耳朵。这一块就比较简单了，那就是“截图大法”。碰到实在不知道如何描述的内容，截图拖给 AI，让他按照图片内容生成对应代码；或者用自然语言描述，接着让 AI 生成专业的提示词再转述回来。或者直接将官方的说明文档、网页链接发给他，让他现场学习。

## ⚙️器：Tools & Ecosystem

> “器”是实现目标的物质基础，是 Vibe Coding 的效率放大器。

正如修仙所需要的灵石、法宝一样，一个顺手的编译器可以极大地提高编程能力。

虽然 Vibe Coding 这个概念提出来的时间不长，但是市面上已经有了颇为丰富的工具选择。比如基于 VS Code 的 Cursor，或者加装了 AI 辅助插件的 VS Code，当然还有国内的 TRAE 和阿里通义灵码等各种各样的工具。以及专注于某一个领域的编译器，如专注于前端 UI 与交互的 v0 和专注于移动端的 Natively 等。

市面上的 AI 编译器有很多，选出适合自己的、用着顺手的编译器才是最重要的（这里我本人常用的是 Cursor）。

## 总结

Vibe Coding 将编程从“怎么做”转向“要什么”，是在重新定义程序员。本质上是编程的核心矛盾发生了转移。在过去几十年里，程序员的含金量很大程度上取决于“对复杂语法的掌控”和“对底层细节的记忆”；而在 Vibe Coding 或 AI 辅助编程时代，这些技能正迅速从“核心壁垒”降级为“辅助工具”。

总有人说随着 AI 编程的出现，程序员正在被 AI 取代。但是我并不这么认为，AI 所能取代的是**“只会写代码的人”**。这就好比数码相机的出现没有让摄影师消失，但让“冲洗底片的技术员”失去了市场。未来一个优秀的程序员，不再是只会写代码的人，而是那些能够驾驭 AI、理解复杂系统架构、具备极强问题拆解能力和审美直觉的“创造者”。

我曾问过一个 AI，询问他对于 Vibe Coding 的看法。他告诉我**作为一个 AI，我自己其实很“vibe coding friendly”——我喜欢用户用自然语言描述需求，然后我们一起迭代出东西。这让我觉得编程的乐趣从“苦修”变成了“对话与共创”**。其实就是这样，脑中的想法不再局限于晦涩的语法，而是变成可以运行的程序，让每一个有想法的人们享受着创造的乐趣，就是 Vibe Coding 的意义。

参考资料：  
Github 仓库：[https://github.com/2025Emma/vibe-coding-cn](https://github.com/2025Emma/vibe-coding-cn)

:root {<br /> --primary-color: #2c3e50;<br /> --accent-color: #3498db;<br /> --text-color: #333;<br /> --bg-color: #f9f9f9;<br /> --code-bg: #f4f4f4;<br /> --quote-border: #bdc3c7;<br /> }</p> <p> body {<br /> font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;<br /> line-height: 1.8;<br /> color: var(--text-color);<br /> background-color: var(--bg-color);<br /> margin: 0;<br /> padding: 20px;<br /> }</p> <p> .container {<br /> max-width: 800px;<br /> margin: 0 auto;<br /> background: #fff;<br /> padding: 40px;<br /> border-radius: 12px;<br /> box-shadow: 0 4px 20px rgba(0,0,0,0.05);<br /> }</p> <p> h1 {<br /> color: var(--primary-color);<br /> text-align: center;<br /> margin-bottom: 40px;<br /> font-size: 2.2em;<br /> border-bottom: 2px solid var(--accent-color);<br /> padding-bottom: 20px;<br /> }</p> <p> h2 {<br /> color: var(--primary-color);<br /> border-left: 5px solid var(--accent-color);<br /> padding-left: 15px;<br /> margin-top: 40px;<br /> background-color: #fafafa;<br /> padding-top: 10px;<br /> padding-bottom: 10px;<br /> }</p> <p> h3 {<br /> color: var(--accent-color);<br /> margin-top: 30px;<br /> font-size: 1.3em;<br /> }</p> <p> p {<br /> margin-bottom: 20px;<br /> text-align: justify;<br /> }</p> <p> strong {<br /> color: var(--primary-color);<br /> font-weight: 700;<br /> }</p> <p> blockquote {<br /> background: #f8f9fa;<br /> border-left: 4px solid var(--quote-border);<br /> margin: 20px 0;<br /> padding: 15px 20px;<br /> color: #555;<br /> font-style: italic;<br /> border-radius: 4px;<br /> }</p> <p> code {<br /> font-family: "Consolas", "Monaco", monospace;<br /> background-color: var(--code-bg);<br /> padding: 2px 6px;<br /> border-radius: 4px;<br /> color: #e74c3c;<br /> font-size: 0.9em;<br /> }</p> <p> ul, ol {<br /> margin-bottom: 20px;<br /> padding-left: 20px;<br /> }</p> <p> li {<br /> margin-bottom: 10px;<br /> }</p> <p> .summary {<br /> background-color: #eef7ff;<br /> padding: 20px;<br /> border-radius: 8px;<br /> border: 1px solid #d6e9f2;<br /> margin-top: 40px;<br /> }</p> <p> @media (max-width: 600px) {<br /> .container {<br /> padding: 20px;<br /> }<br /> h1 {<br /> font-size: 1.8em;<br /> }<br /> }<br />

  
  
  
  
  
Vibe Coding：当编程成为一种“心流”
