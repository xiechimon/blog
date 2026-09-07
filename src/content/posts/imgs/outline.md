# Outline: 2026-09-02-ai-fullstack-interview-landscape.md

> 基于 1,526 篇牛客 AI 全栈面经 v3 文章配图
> Type: infographic | Style: notion | Palette: default
> Density: balanced (4 张)

## Illustration 1
- **Position**: 第二节"整体画像" 末尾
- **Purpose**: 可视化 6 大命题频次（让读者一眼看到 Agent 76% 占主导）
- **Visual Content**: 横向柱状图，6 个柱形，按频次降序
  - Agent 76% / 全栈工程 56% / 算法 50% / RAG 14% / AI Coding 14% / MCP 3%
- **Filename**: 01-infographic-problems-distribution.png

## Illustration 2
- **Position**: 第三节"Agent" 末尾
- **Purpose**: 可视化 Agent 四层架构
- **Visual Content**: 4 个堆叠的层（自顶向下）
  - 用户交互层：自然语言输入 → 意图识别
  - Agent 调度层：ReAct 循环 / DAG 工作流
  - 工具执行层：API 调用 / 代码执行 / 检索
  - 记忆层：短期（内存）→ 中期（Redis）→ 长期（向量库 + MySQL）
- **Filename**: 02-framework-agent-arch.png

## Illustration 3
- **Position**: 第六节"RAG" 末尾
- **Purpose**: 可视化 RAG 五段式流程
- **Visual Content**: 5 个步骤从左到右
  - 分块 → 向量化 → 检索 → 融合 → 评估
  - 每步标关键工具（如"段落切分"、"bge-large-zh-v1.5"、"FAISS HNSW + BM25"、"RRF + Cross-Encoder"、"200 条测试集"）
- **Filename**: 03-flowchart-rag-pipeline.png

## Illustration 4
- **Position**: 第九节"TOP 10 公司" 末尾
- **Purpose**: TOP 10 公司面经数对比
- **Visual Content**: 横向柱状图，10 个公司
  - 拼多多 280 / 阿里 134 / 华为 100 / 字节 87 / 京东 63 / 美团 61 / 百度 59 / 米哈游 38 / 快手 35 / 腾讯 33
- **Filename**: 04-infographic-top-companies.png
