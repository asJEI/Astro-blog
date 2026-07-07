---
title: Web3 Day2 学习记录：从第一次编写合约到成功部署
date: 2026-07-07
slug: web3-notes-03
description: Monad Builder Camp Day 2，用 AI 生成 Onchain Todo 合约并完成人工审查，随后在 Remix 编译、部署到 Monad Testnet，完成 read / write 交互与浏览器验证。
tags: ["技术交流", "经验分享"]
---

## 引言

[Day 1](/blog/web3-notes-02) 跑通了钱包、测试网和第一笔转账。Day 2 要做两件事：**用 AI 出合约初稿并自己审查**，以及**把合约部署到 Monad Testnet 并完成交互**。

我选的方向是 **Onchain Todo**——有明确的 read / write 函数，逻辑够简单，又够练部署。

完整链路：

```text
Prompt → 合约初稿 → 人工检查 → Remix 编译 → 部署 → read / write → Explorer 验证
```

---

## 一、用 AI 生成合约

### 1. Prompt

```
我正在学习 Solidity，请帮我生成一个最小可运行的 Onchain Todo 合约。

要求：

Solidity ^0.8.20
每个地址维护自己的 Todo 列表
Todo 包含 text、completed、createdAt
提供 addTodo()
toggleTodo()
getTodos()
不要使用复杂库
添加完整的注释
保证 Remix 可以直接编译
```

写 Prompt 时我刻意锁死了三件事：版本（`^0.8.20`）、数据模型（按地址隔离 + 三个字段）、函数清单（只要三个入口）。最后一句「Remix 可直接编译」是为了防止 AI 输出 Hardhat 配置或带 import 的写法。

### 2. AI 输出的合约

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title OnchainTodo
 * @author Web3-Todo
 * @notice 链上待办事项合约 —— 每个钱包地址拥有独立的 Todo 列表
 * @dev 设计目标：最小可运行、无外部依赖、可直接在 Remix 中编译部署
 *
 * 核心功能：
 * - addTodo()    添加一条待办
 * - toggleTodo() 切换某条待办的完成状态
 * - getTodos()   查询当前调用者的全部待办
 */
contract OnchainTodo {
    struct Todo {
        string text;
        bool completed;
        uint256 createdAt;
    }

    mapping(address => Todo[]) private todosByOwner;

    event TodoAdded(
        address indexed owner,
        uint256 indexed index,
        string text,
        uint256 createdAt
    );

    event TodoToggled(
        address indexed owner,
        uint256 indexed index,
        bool completed
    );

    function addTodo(string calldata text) external {
        require(bytes(text).length > 0, "Todo text cannot be empty");

        Todo[] storage list = todosByOwner[msg.sender];
        uint256 index = list.length;

        list.push(
            Todo({
                text: text,
                completed: false,
                createdAt: block.timestamp
            })
        );

        emit TodoAdded(msg.sender, index, text, block.timestamp);
    }

    function toggleTodo(uint256 index) external {
        Todo[] storage list = todosByOwner[msg.sender];
        require(index < list.length, "Todo index out of bounds");

        list[index].completed = !list[index].completed;

        emit TodoToggled(msg.sender, index, list[index].completed);
    }

    function getTodos() external view returns (Todo[] memory) {
        return todosByOwner[msg.sender];
    }
}
```

### 3. 让 AI 解释，然后自己核对

拿到代码后我又追问了一句：

```
请不要修改代码，而是逐行解释：

contract 是什么
struct 为什么这样设计
mapping 的作用
addTodo 做了什么
toggleTodo 做了什么
getTodos 为什么是 view
storage 和 memory 有什么区别
```

AI 解释完，我用几句话对照了一遍：

- **`mapping(address => Todo[])`** 实现「每个地址维护自己的列表」——权限不靠 `onlyOwner`，而是靠 `msg.sender` 当键。
- **`addTodo` / `toggleTodo`** 是 write，改的是链上 storage，要签名、付 Gas。
- **`getTodos`** 是 view，Remix 里静态调用不耗 Gas，返回当前地址的全部 todo。
- **边界**：空 `text` 或 `index` 越界会 revert；列表为空时 `getTodos` 返回 `[]`。

AI 多加了 `TodoAdded` / `TodoToggled` 两个 Event，Prompt 里没要求，我保留了——Explorer 里看 Logs 更方便。

### 4. 人工检查（部署前必做）

- [ ] Remix 能编译通过
- [ ] 三个函数与 Prompt 一致（`getTodos` 整表返回，不是按 id 单查）
- [ ] 权限模型符合预期：只能动自己的列表
- [ ] 没有不必要的库、继承或复杂逻辑
- [ ] 变量命名和注释读得懂

我最终**没有改代码**，与 AI 初稿一致。

---

## 二、Remix 编译

1. 打开 [Remix IDE](https://remix.ethereum.org)，**Create** 新建工作区，把合约粘贴到 `contracts/OnchainTodo.sol`。

![Remix 中新建 Web3-Todo 工作区并粘贴 OnchainTodo.sol](/images/blog/07/image-3.png)

2. 左侧点 **Solidity Compiler**（S 图标），编译器选 `0.8.20+`，点击 **Compile OnchainTodo.sol**。

![Remix Solidity Compiler 面板，选择编译器并点击 Compile](/images/blog/07/image-4.png)

3. 图标出现绿色对号，编译通过。

![Remix 编译成功，Solidity Compiler 图标显示绿色对号](/images/blog/07/image-5.png)

---

## 三、部署到 Monad Testnet

### 1. 连接钱包并部署

前提与 Day 1 相同：Rabby 已添加 **Monad Testnet**（Chain ID `10143`），账户里有测试 MON。网络配置见 [Day 1 记录](/blog/web3-notes-02#二添加-monad-testnet-网络)。

1. 编译通过后，左侧点 **Deploy & Run Transactions**，选 **Browser Extension**。

   ![Remix Deploy 面板，Environment 选择 Browser Extension](/images/blog/07/image-6.png)

2. 右侧第二个下拉框选你的钱包插件（我用的是 **Rabby Wallet**；MetaMask 等浏览器扩展同理，会显示对应名称）。

   ![Browser Extension 下选择 Rabby Wallet](/images/blog/07/image-7.png)

3. 确认面板顶部出现 **Monad Testnet (10143)**，**Contract** 选 `OnchainTodo`（带 Compiled 绿标），无需 constructor 参数，直接点 **Deploy**。

   ![连接 Rabby 后显示 Monad Testnet，OnchainTodo 已编译就绪](/images/blog/07/image-8.png)

4. Rabby 弹出「部署合约」确认窗，核对网络为 Monad Testnet，点 **签名并提交**。

   ![Rabby 部署合约签名确认](/images/blog/07/image-9.png)

5. 回到 Remix 底部终端，出现绿色对号即部署成功。记下 **transaction hash** 和 **contract address**——后者就是合约在链上的地址。

   ![Remix 终端显示部署成功及 Contract Address](/images/blog/07/image-10.png)

**我的部署结果：**

```
合约地址：     0x57A55353E44DE57E2b1F5DD11dF12A2cdCa1CdC6
部署 tx hash： 0x7f6ebc580981badc5105beedc11cf49b6ecd31a18e7a86491555f61a4770222b
```

终端里每一行的含义（对照 Day 1 那笔转账收据来读，思路是一样的）：

| 字段 | 含义 | 我这笔部署的值 |
| ---- | ---- | -------------- |
| **status** | 交易是否成功执行 | `1 Transaction mined and execution completed` ✅ |
| **transaction hash** | 这笔交易的唯一 ID，Explorer 搜它 | `0x7f6e...7222b` |
| **block number** | 被打包进哪个区块 | `42931286` |
| **contract address** | 合约部署后在链上的地址——以后交互都找它 | `0x57A5...CdC6` |
| **from** | 谁发起并付了 Gas（我的 Rabby 账户） | `0x240e0b16297C9F738260866B0934fb99CBC33e7E` |
| **to** | 部署时 To 显示 `OnchainTodo.(constructor)`，表示在创建新合约，不是转给某个钱包 | — |
| **transaction cost** | 部署消耗的 Gas 总量 | `1144787 gas` |
| **decoded input** | 传给 constructor 的参数；这份合约无参，所以是 `{}` | `{}` |
| **logs** | 交易触发的事件；constructor 阶段没有 Event，所以为空 | `[]` |

顶行摘要里的 `value: 0 wei` 表示部署时没有随交易发送 MON；`data: 0x608...` 是编译后的合约字节码，节点靠它创建链上合约实例。

在 [Monad Explorer](https://testnet.monadexplorer.com) 搜部署 hash → [查看这笔交易](https://testnet.monadexplorer.com/tx/0x7f6ebc580981badc5105beedc11cf49b6ecd31a18e7a86491555f61a4770222b)，应能看到 Contract Creation；再搜 [合约地址](https://testnet.monadexplorer.com/address/0x57A55353E44DE57E2b1F5DD11dF12A2cdCa1CdC6) 可查看后续交互。

#### 忘了保存合约地址怎么办？

Remix 终端关了就找不回地址的话，可以反过来从**部署者钱包**查：

1. 打开 [Monad Explorer](https://testnet.monadexplorer.com)，搜索部署时用的钱包地址（我的是 `0x240e0b16297C9F738260866B0934fb99CBC33e7E`）。在交易列表里找 **OUT** 方向、Method 为 `0x60806040`、Amount 为 `0` 的记录——这就是合约部署交易。我部署了两次，所以能看到两条。

   ![Explorer 钱包页：OUT 方向的部署交易](/images/blog/07/image-11.png)

2. 点击该笔交易的 **Txn Hash**，进入交易详情页。

   ![交易详情页 Overview](/images/blog/07/image-12.png)

3. 在第二块卡片找到 **To** 一行。如果显示 `[Contract 0x57A5...CdC6 created]`，说明这笔交易创建了新合约——`0x57A5...CdC6` 就是合约地址（点链接可复制完整地址）。

   ![To 行显示 Contract created，即合约地址](/images/blog/07/image-13.png)

4. 把完整合约地址粘贴回 Explorer 搜索，即可进入合约页，查看 Creator、Creation Txn 等信息。刚部署完时 Transaction 列表为空是正常的，还没人调用过合约函数。

   ![合约地址页：Contract Info 与 0 Txns](/images/blog/07/image-14.png)

### 2. Read 调用与 Write 调用

部署成功后，Remix 左侧 **Deployed Contracts** 会出现 `OnchainTodo` 实例，地址应与 Explorer 上一致（`0x57A5...CdC6`），网络标签为 **Monad Testnet**。

![Remix 已部署的 OnchainTodo 合约实例](/images/blog/07/image-15.png)

Remix 用圆点颜色区分函数类型：**蓝色** = read（`view`，只读）；**橙色** = write（改链上状态，要签名付 Gas）。

#### Read：第一次查列表（应为空）

1. 展开函数列表，选 **`getTodos`**（蓝点），点 **call**。
2. 底部终端出现 `CALL`，`to` 显示 `OnchainTodo.getTodos()`。
3. 看 **decoded output**：此时应为空的 `tuple(string,bool,uint256)[]`——说明链上还没有 todo。

   ![选择 getTodos 函数](/images/blog/07/image-16.png)

   ![终端 CALL 结果，decoded output 为空数组](/images/blog/07/image-17.png)

#### Write：添加一条待办

1. 选 **`addTodo string`**（橙点），输入 `"完成今日 web3 的学习"`，点 **transact**。
2. Rabby 弹出确认窗，核对网络为 Monad Testnet，点 **签名并提交**。

   ![addTodo 输入内容并 Transact，Rabby 弹窗确认](/images/blog/07/image-18.png)

3. 回到 [Monad Explorer](https://testnet.monadexplorer.com) 搜合约地址，Transaction 列表会多出一条 **AddTodo** 记录，Status 为绿色对号——说明 write 已成功写入链上。

   ![Explorer 合约页出现 AddTodo 交易记录](/images/blog/07/image-19.png)

#### Read：再次查询（应有新数据）

再调一次 **`getTodos` → call**。这次 **decoded output** 里应出现一条记录，格式为 `(text, completed, createdAt)`，例如：

```
"完成今日 web3 的学习", false, 1723408389
```

分别对应待办内容、是否完成（刚添加为 `false`）、创建时间戳。

![再次 getTodos，decoded output 出现新 todo](/images/blog/07/image-20.png)

> **read vs write 的区别**：`getTodos` 是 `call`，本地模拟、不改链上状态；`addTodo` 是 `transact`，会发交易、消耗 Gas，并在 Explorer 留下永久记录。

---

## 四、合约 README（作业整理）

> 可直接复制提交。完整操作步骤见上文第三节。

### OnchainTodo

链上待办清单练习合约。每个钱包地址拥有独立 Todo 列表，数据按 `msg.sender` 隔离——没有 admin，也没有跨地址读写。

| 函数 | 类型 | 说明 |
| ---- | ---- | ---- |
| `addTodo(string text)` | write | 添加待办，`completed` 默认 `false` |
| `toggleTodo(uint256 index)` | write | 切换下标 `index` 的完成状态 |
| `getTodos()` | read | 返回当前调用者的全部 todo |

### 网络与部署信息

- **网络**：Monad Testnet（Chain ID `10143`）
- **合约地址**：`0x57A55353E44DE57E2b1F5DD11dF12A2cdCa1CdC6`
- **部署 tx**：[0x7f6e...7222b](https://testnet.monadexplorer.com/tx/0x7f6ebc580981badc5105beedc11cf49b6ecd31a18e7a86491555f61a4770222b)
- **部署者**：`0x240e0b16297C9F738260866B0934fb99CBC33e7E`

### 如何部署

Remix 新建 `OnchainTodo.sol` → 编译 `0.8.20` → **Deploy & Run Transactions** → Browser Extension 连 Rabby → 选 Monad Testnet → Deploy。

### 如何交互

Remix **Deployed Contracts** 里：蓝点函数 **call**（如 `getTodos`），橙点函数 **transact**（如 `addTodo`）。Write 后在 [Explorer](https://testnet.monadexplorer.com/address/0x57A55353E44DE57E2b1F5DD11dF12A2cdCa1CdC6) 确认交易 Status 为 Success。

Gas 不足 → [faucet.monad.xyz](https://faucet.monad.xyz/)

⚠️ 仅用于课程练习，不可直接用于生产。

---

## 小结

Day 1 学会了「钱包转账 + Explorer 查收据」，Day 2 把中间缺的一环补上了：**合约**。

今天实际走通的链路：

```text
AI 生成初稿 → 人工审查 → Remix 编译 → Rabby 部署 → getTodos（空）→ addTodo（write）→ Explorer 验证 → getTodos（有数据）
```

几个带走的东西：

1. **AI 写草稿，人做判断**——Prompt 要具体；编译、权限、函数语义必须自己核对。
2. **部署 ≠ 转账**——To 从钱包变成了合约地址；改状态靠的是调函数，不是 `value` 字段。
3. **read / write 是两套逻辑**——`call` 本地读、`transact` 签名写；后者才上链、才留 tx、才付 Gas。

如果 Day 1 是学会在链上「走路」，Day 2 就是第一次自己写并运行一段链上程序。`toggleTodo` 和前端连接留到后面再做也来得及。

---

**参考资料**

- [Remix IDE](https://remix.ethereum.org)
- [Monad Testnet 文档](https://docs.monad.xyz/)
- [Monad Testnet Explorer](https://testnet.monadexplorer.com)
- [Solidity 官方文档](https://docs.soliditylang.org/)
