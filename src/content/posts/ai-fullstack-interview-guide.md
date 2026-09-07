---
title: "AI 全栈面经全景：从牛客 20 篇真题看秋招在考什么"
published: 2026-09-02 18:00:00+08:00
description: "基于牛客 20 篇 AI 全栈/AI 应用/Agent 开发真面经，拆解秋招高频的 6 大命题：RAG、Agent、MCP、AI Coding、全栈工程与算法，配可直接复用的回答框架与备战路径。"
tags: ["AI全栈", "面经", "求职"]
pin: 0
draft: false
toc: true
lang: ''
---

> 本文数据来自 `agent-reach` 经 Exa `web_search_exa` 拉取的牛客面经，覆盖 2025-2026 年 OPPO/字节/小红书/去哪儿/淘天/拼多多/快手/深势科技等 10 余家厂的 AI 全栈/AI 应用/Agent 开发岗。不是堆流水账，只讲面试官到底在筛什么人，以及每个考点该怎么答到点上。

## 为什么单拎 AI 全栈说

AI 全栈是 2026 年的新岗，不是“会调大模型 API 的全栈”。JD 常见写法是 `前端 + 后端 + Agent/RAG 落地 + MCP/Skill + AI Coding`。OPPO 一面开场就说“全新岗位，对 AI 工具使用要求会更高”。

范式已经变了。2025 年是 Vibe Coding，比谁 Prompt 写得溜；2026 年是 Agentic Engineering，比谁的系统跑得稳。字节春招 JD 里 MCP、Skill 封装已是核心要求，面试画风从“你知道什么是 Agent 吗”变成“你的 Agent 崩了你怎么修”。

所以准备时别按传统后端四件套背，要按“AI 能力 + 工程兜底”两条线准备。

## 秋招在考什么：六大命题域

把 20 篇面经去重后，高频词统计很清晰：RAG 55%、Prompt 50%、向量库 45%、Agent/Function Calling 40%、AI 工具 70%、Python 78%。我把它收敛成六域，一张表看全：

| 命题域 | 牛客真题原句 | 面试官想听什么 |
| --- | --- | --- |
| **AI Coding** | 用过哪些 AI 工具？AI 生成代码效果不好怎么解决？平时 AI 占比多少？ | 你是不是 AI Native，能不能把 AI 当同事而不是外挂 |
| **RAG** | RAG 全流程？Chunk 怎么切？Embedding 用什么？召回算法有哪些？Rerank 有必要吗？检索不到怎么办？怎么评测？ | 有没有真做过，不是抄教程 |
| **Agent** | ReAct 是什么？为什么用多 Agent 而不是单 Agent？Agent 间怎么传数据？幻觉怎么治？长短期记忆怎么协同？ | 工程化能力，能否在非确定性系统里加确定性阀门 |
| **协议层** | MCP 是什么？和 Function Calling / A2A 区别？MCP Gateway 怎么做？Skill 颗粒度怎么定？ | 对 2026 协议生态的理解，最能拉开差距 |
| **全栈与工程化** | SSE 怎么推流？Vue 响应式？Redis 大 Key 怎么治？深分页怎么优化？MQ 选型？可观测怎么做？ | 能否兜底全栈链路 |
| **基础与算法** | 进程线程/堆栈/BFS/最长递增子序列/爬楼梯/全排列 + 手写 SQL | 门槛，不挂就行 |

不同厂侧重也不同：字节/淘天/拼多多拷打最深，会追问到 RRF 融合、RAGAS 指标、三层熔断；小红书偏 RAG + Redis/MySQL + 算法；OPPO/去哪儿重 AI 工具与项目角色，算法只问线性结构；深势科技 1h40min 地毯式，简历每个词都会展开。

## 一、AI Coding：必答题，答好能加分

这是 AI 全栈独有的必考。OPPO、字节、小红书都问了同一题：`平时用 AI 的比例 + 用哪些工具 + 出错怎么排查`。

**踩坑回答**：“我用 Cursor，AI 写不好我就重问一遍。”

**高分框架**：分场景 + 给比例 + 讲兜底。

> 前端界面 AI 生成占比 70%，我用 Cursor/Claude Code 直接出页面；前后端联调和复杂状态逻辑我手写，用调试工具验证。AI 出错时我有三层兜底：1) 单测保证接口契约 2) 管理端埋点拿错误上下文 3) 失败 case 自动重放环境。Skill 方面我常用 `grill-me`，它有效是因为把模糊需求压缩成了高密度约束，而不是靠字数堆。

字节一面还追问了“为什么没用 Spring AI 而自写向量机”，要能说清选型理由，而不是“我看教程用的这个”。

## 二、RAG：拉开差距的核心，15 场有 15 场问

别只会说“向量检索 + 塞给 LLM”。面试官会连环追 Chunk、Embedding、召回、Rerank、评测。

### 标准全链路

**离线建库**：文档解析（PDF/Word/HTML + OCR 版面恢复）-> 清洗去重 -> 按标题/段落/语义边界切块 -> Embedding -> 写向量索引（Chroma/PGVector/Milvus）+ BM25 倒排，每块保留 `document_id/version/章节/权限/source/page` 便于溯源与增量更新。

**在线检索**：Query 规范化与改写 -> 并发执行稠密向量召回 + 稀疏 BM25 召回 -> RRF/加权融合 -> Cross-Encoder Rerank 精排（把 Top 20-50 缩到 3-5）-> 去重与 token 截断 -> 携引用喂给 LLM -> 证据不足则拒答或澄清。

**生成与校验**：要求模型只在证据范围内回答，输出后校验引用是否存在、数字实体是否一致。

一条可跑的最小实现是这样的：

```python
from langchain_community.vectorstores import Chroma

def retrieve_with_source(query, k=5):
    results = vectorstore.similarity_search_with_score(query, k=k)
    return [{"content": d.page_content, "source": d.metadata["source"],
             "page": d.metadata.get("page", "N/A"), "score": s}
            for d, s in results]

def rag_answer(question):
    sources = retrieve_with_source(question, k=5)
    context = "\n\n".join(s["content"] for s in sources)
    answer = llm.invoke(prompt.format(context=context, question=question))
    citation = "\n\n📚 参考来源:\n" + "\n".join(
        f"[{i}] {s['source']} p{s['page']} {s['score']:.2f}" for i, s in enumerate(sources, 1))
    return answer.content + citation
```

### 四个必会被追问的细节

1.  **Chunk 怎么选**：固定长度切会把关键句切在边界。正确是 256-512 token + 10-20% 重叠，代码按函数、Markdown 按标题分。太长噪声多，太短上下文碎。
2.  **Embedding 怎么选**：要说出维度与归一化。`bge-large-zh` 中文好但要自部署，阿里 `text-embedding-v2` 省运维，BGE-M3 同时支持稠密/稀疏/多向量，维度 1024 是否归一化会影响余弦计算。
3.  **为什么要 Rerank**：向量召回 Recall 高但 Precision 低，Top-K 里常混入“语义像但答非所问”的块。Cross-Encoder 重排能把最相关的提到前 3，节省 Token 也降幻觉。
4.  **检索不到怎么办**：这是小红书真题。答：Query 改写 + 同义词扩展 + 混合检索扩大召回 + 阈值拒答转澄清，而不是让模型瞎编。

### 评测

别只说准确率。淘天和快手都要求体系化：检索层看 `Recall@K / MRR / nDCG`，生成层看 `Faithfulness（忠实度）/ Answer Relevancy / Context Precision/Recall`，系统层看端到端成功率与延迟。工具用 RAGAS。

## 三、Agent：从 ReAct 到生产可用

**ReAct 是什么**：`Reason + Act` 循环，模型每轮输出 `Thought -> Action(调工具) -> Observation(工具返回)`，直到判定完成。字节会问 Action 失败怎么处理，答案不是重试，而是把结构化错误喂回模型做有限次自修正。

**单 Agent vs 多 Agent**：多 Agent不是为了炫技。合理理由是工具/权限差异大、可并行、需把规划/执行/验证隔离。代价是协商开销与状态合并成本。字节面经里候选人答“试过多 Agent，协商开销太大耗时不可接受”反而被认可，因为说了取舍。

**生产三层防御（2026 新范式必背）**：

1.  硬隔离：最大迭代 20 轮、token/费用预算、deadline
2.  熔断：同一工具连败 3 次或检测到“同参数重复调用”循环，直接中断
3.  自修：Reflection 让模型反思“是不是参数错了”，但限 3 次

最后兜底是返回“任务未完成，已记录日志请人工介入”，而不是把报错直接抛给用户。工具调用要做 DAG 依赖管理，无依赖可并行（Anthropic 单次可返回多个 `tool_use`），有依赖必须等上游返回。

**记忆**：工作记忆（当前窗口）-> 短期记忆（Redis + TTL）-> 长期记忆（PGVector/MySQL），靠 `sessionId` 串联，过长时做分层摘要压缩。

## 四、协议层：MCP / Function Calling / A2A / Skill

这是今年最能区分“背过”和“做过”的考点。

*   **Function Calling**：LLM 自主决定调哪个函数、填什么参数，是 Agent 自主决策的核心，不是简单 API 转发。痛点是厂商绑定、静态配置、无执行标准。
*   **MCP（Model Context Protocol）**：把工具描述与执行解耦，Server 统一注册工具，Client 动态发现。最大改进是把 `O(N*M)` 的对接成本降到 `O(N+M)`，一次写 Server，多 Agent 复用，且可集中审计。去哪儿 AI 面原题就是“MCP 是什么有什么用”。
*   **A2A**：MCP 是垂直（模型调工具），A2A 是水平（Agent 调 Agent），负责发现、委托与结果交换。
*   **Skill**：可复用的能力封装，颗粒度以“一个可验证任务”为单位。面试会问“Skill 和 MCP 区别”，答：Skill 是能力包，MCP 是 Skill 对外暴露的标准化协议。

安全必提：工具描述审计、权限最小化、MCP 隧道加密、不信任第三方 Server。

## 五、全栈与工程化：证明你能兜底

AI 全栈不是不要八股，而是八股要能和 AI 项目结合着答。

*   **前端**：字节问了 Vue 响应式 `ref vs reactive` 能否响应成员变化；SSE 推流要说清 `EventSource + 后端 Emitter` 单向长连接，以及 SSE 局限性（单向、断线重连）。
*   **后端/DB**：小红书 50min 面试连问 `Redis 内存淘汰/过期删除/大 Key 治理/深分页`，深分页标准答是用游标或覆盖索引避免 `LIMIT 100000,10`。
*   **工程化**：淘天追问 1-2 亿消息洪峰怎么扛、RabbitMQ vs RocketMQ 选型；快手问 `1000 条数据求和怎么设计` 考察批量与流式；北京用友问 MCP Gateway 的企业级含义。回答要带指标：`Hit Rate 87% / 工具选择准确率 90%+ / P99 <8s`。

## 六、算法与八股：门槛题，别挂

OPPO 只问线性结构、数组链表、栈队列、BFS，无代码题。字节/小红书则必手撕：最长递增子序列、爬楼梯（要讲时空优化）、全排列、任意二叉树遍历（ACM 模式自建树）、回文串匹配。准备 10 道即可，重点是能讲清复杂度与优化。

## 怎么备战：一个项目吃透

面经反复验证：`项目 > 证书 > 简历包装`。但 19 场里有 15 场被问同一个 RAG 项目，说明深度比广度重要。

**路径**：

1.  搭一个完整 RAG + Agent 项目，别用烂大街 Demo。垂直场景 + 带溯源 + 带 Rerank + 带评测，能说出 Chunk 为什么 500、为什么要归一化、Rerank 提升 20% 的真实数字。
2.  在此项目上把 Agentic Loop 跑通，接 MCP Server，加超时/熔断/自修正，跑一周看它在哪崩，再修好。
3.  每天刷 Exa/官方博客，跟进 MCP/A2A 新协议，面试官要的是“你昨天的思考”，不是去年的定义。
4.  让 AI 按简历和 JD 出 100 道追问题，提前演练“为什么不用 XXX”这类选型拷打。

## 写在最后：这篇博客怎么来的

本文就是按上面方法论整理面经的示例：先用 `agent-reach` 全网拉取，再按六域归类，最后对每个域做“真题 -> 标准框架 -> 踩坑”三段式深挖。写作时遵循本博客约定：正文从 `##` 开始不写一级标题，标签用 `tags` 而非分类，参考统一收在 `## 参考`。

如果你也在准备 27 届秋招，建议把这篇当 checklist，逐项在自己项目里补齐。面试不是考试，没有标准答案，面试官看的是你在不确定系统中加确定性约束的思考。

## 参考

*   OPPO AI 全栈一面面经 https://www.nowcoder.com/discuss/920830730643443712
*   字节 AI 全栈开发一面面经 https://www.nowcoder.com/discuss/913848724952997888
*   小红书 AI 全栈开发一面分享 https://www.nowcoder.com/feed/main/detail/20f1ffa173484efbb5a77f25e6a44e5f
*   去哪儿 AI 全栈工程师 AI 面 https://www.nowcoder.com/discuss/923667223216934912
*   2026 春招 AI 应用开发岗复盘 19 场真题 https://gitcode.csdn.net/69cb3d9154b52172bc65abc3.html
*   2026 大厂 AI Agent 面试深度复盘 https://devpress.csdn.net/xclaw/6a85a85d10ee7a33f29cdfb4.html
*   深势科技 Agent 全栈开发一面 https://www.nowcoder.com/feed/main/detail/f5ad9e14f2c94ef0b553e23c1bb944b9
*   拼多多 AI Agent 岗两轮面经 https://www.nowcoder.com/discuss/919634965879324672
*   近期开发 AI 面经 40 问 https://www.nowcoder.com/feed/main/detail/e3425d60dec24ee1bcf1dc44420b0101
*   社招 AI 应用岗 13 场面经归并 https://www.codefather.cn/post/2068247530516369409
