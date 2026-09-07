/**
 * AI 全栈面经汇总数据
 *
 * 数据来源：牛客网 1,526 篇 AI 全栈/Agent 面经（2026-08 ~ 2026-09）
 * 原始数据集在仓库外：~/Documents/blog-research/2026-09-ai-fullstack-interview/
 * 构建期不依赖仓库外路径，故将统计结果硬编码在此。
 *
 * 一篇面经可命中多个命题，各命题占比之和大于 100%，属正常。
 */

export interface TopicPoint {
  name: string
  count: number
  percent: number // count / topicCount * 100
}

export interface TopicStat {
  id: string // stable key，用于锚点
  label: string // 展示名
  count: number // 命中面经篇数
  percent: number // count / totalPosts * 100
  points: TopicPoint[] // 该命题 TOP10 考点
}

export interface CompanyStat {
  rank: number
  name: string
  count: number
  percent: number // count / totalPosts * 100
  topTopics: string[] // Top 1-3 命题 label
}

export interface InterviewData {
  totalPosts: number
  dateRange: string
  companiesCovered: number
  topics: TopicStat[]
  companies: CompanyStat[]
  relatedPostIds: string[] // 底部关联深度文章 id
}

const TOTAL = 1526
const pct = (n: number) => Math.round((n / TOTAL) * 1000) / 10

export const interviewData: InterviewData = {
  totalPosts: TOTAL,
  dateRange: '2026-08 ~ 2026-09',
  companiesCovered: 37,
  topics: [
    {
      id: 'agent',
      label: 'Agent / 智能体 / LLM',
      count: 1156,
      percent: 75.8,
      points: [
        { name: '大模型', count: 633, percent: 54.8 },
        { name: 'agent', count: 550, percent: 47.6 },
        { name: 'rag', count: 154, percent: 13.3 },
        { name: 'llm', count: 59, percent: 5.1 },
        { name: '智能体', count: 58, percent: 5.0 },
        { name: 'mcp', count: 50, percent: 4.3 },
        { name: '上下文', count: 46, percent: 4.0 },
        { name: '记忆', count: 37, percent: 3.2 },
        { name: 'ReAct', count: 32, percent: 2.8 },
        { name: 'langchain', count: 31, percent: 2.7 },
      ],
    },
    {
      id: 'fullstack',
      label: '全栈工程',
      count: 856,
      percent: 56.1,
      points: [
        { name: 'java', count: 118, percent: 13.8 },
        { name: '并发', count: 51, percent: 6.0 },
        { name: 'python', count: 49, percent: 5.7 },
        { name: '网络', count: 41, percent: 4.8 },
        { name: 'redis', count: 36, percent: 4.2 },
        { name: '数据库', count: 35, percent: 4.1 },
        { name: '高并发', count: 30, percent: 3.5 },
        { name: 'mysql', count: 23, percent: 2.7 },
        { name: '缓存', count: 23, percent: 2.7 },
        { name: '消息', count: 22, percent: 2.6 },
      ],
    },
    {
      id: 'algorithm',
      label: '算法 / 手撕',
      count: 757,
      percent: 49.6,
      points: [
        { name: '算法', count: 539, percent: 71.2 },
        { name: '栈', count: 134, percent: 17.7 },
        { name: '手撕', count: 47, percent: 6.2 },
        { name: '算法题', count: 41, percent: 5.4 },
        { name: '模拟', count: 33, percent: 4.4 },
        { name: '迭代', count: 31, percent: 4.1 },
        { name: '排序', count: 27, percent: 3.6 },
        { name: '堆', count: 17, percent: 2.2 },
        { name: '数组', count: 16, percent: 2.1 },
        { name: '树', count: 14, percent: 1.8 },
      ],
    },
    {
      id: 'rag',
      label: 'RAG 检索增强',
      count: 209,
      percent: 13.7,
      points: [
        { name: 'rag', count: 154, percent: 73.7 },
        { name: '检索', count: 49, percent: 23.4 },
        { name: '知识库', count: 46, percent: 22.0 },
        { name: '向量', count: 33, percent: 15.8 },
        { name: '召回', count: 25, percent: 12.0 },
        { name: '切分', count: 12, percent: 5.7 },
        { name: '向量检索', count: 12, percent: 5.7 },
        { name: 'chunk', count: 10, percent: 4.8 },
        { name: 'bm25', count: 10, percent: 4.8 },
        { name: '相似度', count: 10, percent: 4.8 },
      ],
    },
    {
      id: 'ai-coding',
      label: 'AI Coding',
      count: 209,
      percent: 13.7,
      points: [
        { name: 'ai coding', count: 179, percent: 85.6 },
        { name: 'claude code', count: 12, percent: 5.7 },
        { name: 'codex', count: 12, percent: 5.7 },
        { name: 'cursor', count: 5, percent: 2.4 },
        { name: 'ai编程', count: 4, percent: 1.9 },
        { name: '编程助手', count: 3, percent: 1.4 },
        { name: '代码生成', count: 3, percent: 1.4 },
        { name: 'v0', count: 2, percent: 1.0 },
        { name: 'ai 写代码', count: 1, percent: 0.5 },
        { name: 'ai 辅助编程', count: 1, percent: 0.5 },
      ],
    },
    {
      id: 'mcp',
      label: 'MCP 协议',
      count: 51,
      percent: 3.3,
      points: [
        { name: 'mcp', count: 50, percent: 98.0 },
        { name: 'mcp 协议', count: 2, percent: 3.9 },
        { name: '工具注册', count: 2, percent: 3.9 },
        { name: 'mcp server', count: 1, percent: 2.0 },
        { name: 'mcp 工具', count: 1, percent: 2.0 },
      ],
    },
  ],
  companies: [
    { rank: 1, name: '拼多多', count: 280, percent: 18.3, topTopics: ['Agent', '全栈工程', '算法'] },
    { rank: 2, name: '阿里巴巴', count: 134, percent: 8.8, topTopics: ['Agent', '全栈工程', '算法'] },
    { rank: 3, name: '华为', count: 100, percent: 6.6, topTopics: ['Agent', '算法', '全栈工程'] },
    { rank: 4, name: '字节跳动', count: 87, percent: 5.7, topTopics: ['Agent', '算法', '全栈工程'] },
    { rank: 5, name: '京东', count: 63, percent: 4.1, topTopics: ['AI Coding', '算法', '全栈工程'] },
    { rank: 6, name: '美团', count: 61, percent: 4.0, topTopics: ['AI Coding', 'Agent', '算法'] },
    { rank: 7, name: '百度', count: 59, percent: 3.9, topTopics: ['Agent', '全栈工程', '算法'] },
    { rank: 8, name: '米哈游', count: 38, percent: 2.5, topTopics: ['全栈工程', 'Agent', '算法'] },
    { rank: 9, name: '快手', count: 35, percent: 2.3, topTopics: ['Agent', '全栈工程', '算法'] },
    { rank: 10, name: '腾讯', count: 33, percent: 2.2, topTopics: ['Agent', '全栈工程', '算法'] },
  ],
  relatedPostIds: ['2026-09-02-ai-fullstack-interview-landscape'],
}

// 供布局需要的辅助值
export const TOPIC_LABELS = interviewData.topics.map(t => t.label)
export const totalPosts = interviewData.totalPosts
export const dateRange = interviewData.dateRange
export const companiesCovered = interviewData.companiesCovered
export const pctHelper = pct
