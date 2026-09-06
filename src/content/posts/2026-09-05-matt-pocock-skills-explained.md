---
title: matt-pocock skill 详解
published: 2026-09-05 14:00:00+08:00
description: '把 aihero.dev/skills 那 25 个 skill 串起来：起步、主流程、塑形、维护、效率、底层分别在干什么'
tags:
  - 学习
draft: false
pin: 0
toc: true
lang: ''
abbrlink: ''
---

## 一、引言

最近，我在 Claude Code 里装了一套 skill 集合，来自 matt-pocock 那位 TypeScript 老师。

他把"AI 编码"这件事拆成了 25 个 skill，覆盖从想法到上线的整个流程。一篇文章里，我把它们串起来讲讲。

下面，我尽量用通俗的语言，解释这套 skill 在干什么、怎么用。

## 二、整体设计

整个体系的核心就一句话：**先对齐，再构建**。

matt-pocock 认为，AI 写代码的最大风险不是写不好，而是在错的前提下写。所以他把 50% 的精力花在"写代码之前"——澄清想法、对齐术语、记录决策。另一半才是执行。

25 个 skill 划成 6 类：

**（1）Getting Started**。一次性配置和导航。

**（2）The Main Flow**。主流程，从想法到上线。

**（3）Shaping**。探索开放式问题。

**（4）Upkeep**。维护代码库。

**（5）Productivity**。人用不写代码的流程。

**（6）Reference**。其他技能调用的底层能力。

划分的逻辑是使用频率加使用时机。一次性配置在最上面，高频流程放在主流程，偶尔用的辅助分支在旁边。

## 三、主流程：5 个 skill 串起来

matt-pocock 把"从想法到上线"分成 5 步，每步一个 skill，全是手动调用。

**（1）grill-with-docs：术语对齐**。

这是入口。运行它，会启动一个多轮面试，每轮只问前置已定的（frontier 上的）问题。查资料是它的事，拍板是你的事。

问出来的东西，会边问边写——**术语落地到 `CONTEXT.md`（词汇表），决策落地到 ADR（架构决策记录）**。CONTEXT.md 是项目自己的词，敲定一次，所有人都照它说话。ADR 是难反悔的决策才会写。

它依赖两个底层 skill：`grilling`（面试引擎）和 `domain-modeling`（词汇表管理）。必须同时装，否则只会提问不写文件。

**（2）to-spec：把对话收成 spec**。

grill-with-docs 聊完，决策都散在对话里。to-spec 不提问、不决策，只整理——把对话、代码、`CONTEXT.md` 和 ADR 综合起来，输出一份 spec。

spec 是为了"上下文窗口会清"这个硬约束设计的。所有聊过的东西必须落到一份能独立存在的文档里。

注意一个细节：**to-spec 和 to-tickets 必须在同一个上下文窗口里运行**，中间不能 clear 或 compact。

**（3）to-tickets：切成 tracer bullet**。

spec 是平的，工单是垂直的。

tracer bullet（示踪弹）是贯穿所有层的一条窄路径——schema、API、UI、测试，一刀切到底。能独立演示，能独立验证。

to-tickets 把 spec 切成 N 张工单，每张都是 tracer bullet，标注好阻塞关系。每张工单都能单会话做完。

**（4）implement：按工单写代码**。

拿一张工单，写代码。**默认 test-first，一次红绿只做一个行为**。跑完顺手调一次 code-review，对完再提交。

**（5）code-review：审查**。

收尾看两样：建得对不对（Standards），做的对不对（Spec）。仓库自己的规范说了算，ESLint 拦过的就不再报一遍。

## 四、辅助技能：按场景用

主流程之外，还有 14 个 skill 按场景分三类。

**Shaping（探索类）**：

想法很散、不知道用哪家的模型、知识库长什么样——这时不直接进主流程。

`wayfinder` 建 map。一个标 `wayfinder:map` 的 issue 当目录，底下挂 decision ticket。map 上记四样：Destination、Decisions so far、Not yet specified、Out of scope。能开干的叫 frontier，开了、没被堵、没人领。认领靠 assign。

`prototype` 拿不准就写段扔掉也行的代码，只回答一个问题。状态机顺不顺眼，页面长什么样，跑起来看看。不写测试，不做抽象，能跑就行。**结论合入主流程，代码挂在 `prototype/<name>` 分支留证据，不合并**。

`research` 只读一手来源。官方文档、源码、spec。输出一篇带引用的 Markdown 放仓库里，方便扔给下一个人接着用。

**Upkeep（维护类）**：

`improve-codebase-architecture` 只看不改，找出值得加深的模块。它先翻最近的改动记录，专挑天天动的地方。最后出一份 HTML 报告，再挑一张陪你 grill。

`diagnosing-bugs` 难缠的 bug 走六步：复现、最小化、排假设、加仪器、带回归测试修、清场。门槛只有一条，先有一条能变红变绿的命令。

`resolving-merge-conflicts` 收尾进行中的 merge 或 rebase，一个 hunk 一个 hunk 来。先查两边的 commit 信息和 PR，把意图对上再动手。不跑 `--abort`，最后跑通项目自己的检查再提交。

`triage` 处理外部扔进来的 issue。**只处理别人提交的，不处理自己创建的**——to-tickets 产出的工单已经 agent-ready，不需要再过一遍。

`wizard` 生成交互式 bash 向导脚本，引导人完成设置步骤（接第三方、配 secret 等）。agent 只写脚本，自己不跑。

**Productivity（不写代码）**：

`grill-me` 不需要工作目录，哪里都能跑——业务决定、写文章、下一步该做什么都行。它不写文件，只把脑中的想法磨清楚，再扔给 to-spec。

它的失败模式是**被动**：连答 40 个"同意"，出来的是 agent 写的、你点头的计划——感觉像在干活，其实啥都没定。

另外，有些问题 grill 不了——"一页还是三页"、"交互应该是什么感觉"——它们需要东西来反应。遇到这种就停，用 `prototype` 做个原型看一眼，再回来一句话答完。

`handoff` 把长会话压成一个文件放系统临时目录，带到新目录、新 harness 或同事手里。图的是能带走，不是压得小。`/compact` 更常用。

`to-questionnaire` 卡在别人脑子里的事用它。它不问主题，只问发送：发给谁，要回什么。输出一份问卷让对方填，回来喂给 grill 或 to-spec。

`teach` 一个 topic 学几周时用它，每次会话都累积。顺嘴问一句、换个说法这种事，别开它。

`wait-what` 上一句没听懂时敲它。agent 用 `CONTEXT.md` 里的词，换白话再讲一遍。整个 skill 就三行，故意不写长。

`writing-for-agents` 写给 agent 看的文档怎么写。看两笔账：常驻上下文吃掉多少窗口，几份文档要不要塞进同一份。

## 五、底层手艺

最底下的 4 个 skill 是其他技能的依赖。

**（1）grilling**。面试原语，多轮问到底。每轮问整条 frontier，答完重算下一轮。所有 grill 系列都跑在它上面。

**（2）domain-modeling**。管词。含糊的拎出来，重的拆开，难反悔的记成 ADR，让 `CONTEXT.md` 保持一份干净词汇表。

**（3）codebase-design**。管模块形状。认四条：深是接口的事，删掉看复杂度散不散，接口就是测试面，只有一个 adapter 就别急着切缝。

**（4）tdd**。红绿循环的规矩。**seam（缝合线）** 是核心——代码的可观察公开边界，测试只打在这条线上，不掏里面。绝对规则：不在未协商的 seam 上写测试。

另两条规矩：**mock 只用于系统边界**（外部 API、时间、随机性，有时是文件系统或数据库），不模拟你自己的模块；**浏览器/E2E 测试不要先写**——反馈循环太慢，红绿不值。

## 六、典型使用流程

不同场景下，5 个主流程 skill 的组合方式不同。

**场景 A：单会话修改**。

```
grill-with-docs → implement → code-review
```

整个改动能在一次会话里装下，直接 grill 完就写代码，不用 to-spec 和 to-tickets。

**场景 B：多会话功能**。

```
grill-with-docs → to-spec → to-tickets → [implement × N] → code-review
```

需要拆分。grill 完出 spec，切成 N 张工单，一张一张 implement。

**场景 C：大型项目**。

```
wayfinder → [grill-with-docs × N] → to-spec → to-tickets → [implement × N] → code-review
```

大到一次会话装不下。先 wayfinder 建 map，每个决策点单独 grill，最后才 collapse 成 spec。

**场景 D：纯想法打磨**。

```
grill-me → to-spec → to-tickets → ...
```

没有代码仓库，用 grill-me（无版本）打磨想法。聊出来是软件，再进入 B 流程。

**场景 E：外部工单流入**。

```
triage → [diagnosing-bugs] → implement
```

triage 走 5 状态状态机（needs-info / duplicate / wontfix / diagnosing-bugs / ready-for-agent），验证可复现性后进入 ready-for-agent，等 implement 拾取。

## 七、关键术语

**（1）tracer bullet**。贯穿所有层的一条窄路径，能独立演示。

**（2）frontier**。当前可以问的所有问题，前置都定了。

**（3）seam**。代码的可观察公开边界，测试只在这条线上。

**（4）ADR**。难反悔的决策记一页。要写 ADR 必须**同时满足三个门槛**：难反悔、无上下文会令人惊讶、真权衡。

**（5）CONTEXT.md**。项目词汇表，纯术语，**没有实现细节**。

**（6）dumb zone**。上下文窗口接近满时，grilling 提问质量下降的区域。

**（7）hunk**。diff 里的一小块。

## 八、常见陷阱

**（1）grill-me 不能写文件**。它是有意无状态的，只改进脑中的想法。要落盘用 grill-with-docs。

**（2）spec 写完不要立即 implement**。spec 是持久的，工单是可丢弃的。先用 to-tickets 切片，再 implement。

**（3）CONTEXT.md 不能写实现细节**。它只收词汇，不收 spec 或草稿笔记。

**（4）ADR 有门槛**。三个条件同时满足才写，不是所有决策都要 ADR。

**（5）tdd 不做重构**。v1.0 后 refactor 步骤已移除，由 code-review 承担。

**（6）triage 只处理外部工单**。自己创建的工单已经 agent-ready，不需要再跑。

**（7）grilling 不要开 plan mode**。plan mode 让 agent 急于输出计划，与 grilling 的"保持探索"精神相悖。

## 九、总结

总的来说，matt-pocock 这套 skill 把"AI 编码"拆得很细。

它不是把所有流程塞进一个万能 skill，而是按场景切分，让你按需调用。整个体系建立在"上下文窗口有限"这一硬约束上，所有设计决策都围绕此展开。

最值得借鉴的，是它对"人类决策 vs AI 执行"的清晰解耦——每个 skill 都有明确的职责边界，不越界替代人类判断。

如果你也用 Claude 做开发，可以从 setup-matt-pocock-skills 开始，试试看。

（完）

## 参考

- [Skills 总览](https://www.aihero.dev/skills)
- [mattpocock/skills 仓库](https://github.com/mattpocock/skills)
