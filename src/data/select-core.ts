/**
 * 精选核心选择接缝（selection seam）
 *
 * 从全量题库（3465 题，见 ./questions.ts）派生一份「精选核心」：
 * 纯函数、确定性 —— 同一输入必得同一输出；不改动源数据文件，只读引用。
 *
 * 流程：
 *   1. 数据卫生：公司名归一 + 题干去序号/章节号/聊天尾巴 + 修复截断首字母
 *   2. 近重复合并（清洗后文本的字符二元组 Jaccard ≥ 阈值 → 收敛为代表）
 *   3. 精选收敛：保留全部 hot 题；对没有任何 hot 题的存量子技术补其热度代表
 *   4. 排序：分类（QUESTION_CATEGORIES 序）→ 子技术 → 热力（coverCount 降序，hot 优先）
 *
 * 全部清洗逻辑收敛在本模块，不编辑 src/data/questions.ts。
 */

import type { Question, QuestionCategory } from './questions'
import { QUESTION_CATEGORIES } from './questions'

/** 精选后输出条目：与源 Question 同构，但 text/company 已清洗归一 */
export type CuratedQuestion = Question

/** 选择策略旋钮，便于评审/物料化阶段在不改逻辑的前提下调规模 */
export interface SelectCoreOptions {
  /** 是否保留全部高频题（默认 true；置 false 可大幅缩小规模） */
  keepAllHot?: boolean
  /** 无高频题的存量子技术保留的热度代表数（默认 1） */
  topPerSubTech?: number
  /** 近重复判定的字符二元组 Jaccard 阈值（默认 0.75） */
  textSimThreshold?: number
}

interface ResolvedOptions {
  keepAllHot: boolean
  topPerSubTech: number
  textSimThreshold: number
}

function resolveOptions(options?: SelectCoreOptions): ResolvedOptions {
  return {
    keepAllHot: options?.keepAllHot ?? true,
    topPerSubTech: Math.max(0, Math.floor(options?.topPerSubTech ?? 1)),
    textSimThreshold: options?.textSimThreshold ?? 0.75,
  }
}

/* ------------------------------------------------------------------ *
 * 公司名归一
 * ------------------------------------------------------------------ */

/**
 * 公司别名表：key 为需要收敛的别名，value 为规范名。
 * 归一后不再出现 key（例：字节 / 字节跳动 → 字节跳动）。
 */
export const COMPANY_ALIASES: Readonly<Record<string, string>> = {
  字节: '字节跳动',
  阿里: '阿里巴巴',
  B站: '哔哩哔哩',
}

/** 归一并保留空串（未知公司留空） */
export function normalizeCompany(raw: string): string {
  const value = raw.trim()
  return COMPANY_ALIASES[value] ?? value
}

/* ------------------------------------------------------------------ *
 * 题干清洗
 * ------------------------------------------------------------------ */

/**
 * 观察到的章节式污染前缀（LLM 抽取产物，形如「五、流式输出与网络协议 17.」）。
 * 以精确前缀剔除：比通用正则更克制，不误伤题干本体。
 */
const CHAPTER_HEADING_PREFIXES: ReadonlyArray<string> = [
  '一、知识图谱与检索平台',
  '四、操作系统与网络 ',
  '四、RabbitMQ 消息队列 1. ',
  '五、个人 Agent Harness 项目深度提问 1. ',
  '六、现场实操编码 1. ',
  '七、候选人反问（候选人向面试官） 1. ',
  '四、AI 使用与职业理解 1. ',
  '四、微调八股核心提问 6. ',
  '四、Node.js 15. ',
  '五、流式输出与网络协议 17. ',
  '六、登录链路与Web安全 23. ',
  '七、客户端排查与调试 28. ',
  '四、客户端 / RN / 全栈 - ',
  '五、AI 工具 / 模型 - ',
  '六、个人情况 / 匹配度 - ',
]

/** 通用开头序号/章节号标记（可反复剥离：1. / 1、 / 1） / （1） / 一、） */
const GENERIC_LEADING_MARKERS: ReadonlyArray<RegExp> = [
  /^[（(]\s*\d+\s*[）)]/, // （1） (1)
  /^\d+\s*[.、．)）]/, // 1. 1、 1） 1)
  /^[一二三四五六七八九十]+\s*[、,，.．]/, // 一、 一，
]

/** 残留校验用：与 GENERIC_LEADING_MARKERS 保持同一判定口径 */
export function hasResidualLeadingNoise(text: string): boolean {
  const t = text.trimStart()
  return GENERIC_LEADING_MARKERS.some(re => re.test(t))
}

/** 面试官/追问类括号闲聊（（追问）、（追问*2）、（面试官强调…）） */
const CHATTER_PAREN_RE = /[（(]\s*(?:追问|面试官|考官|候选人|反问)[^（）()]*[）)]/g

/** 面经主题标签（#秋招# #27秋招9月行动指南#），保留 C# 之类正常语境 */
const HASHTAG_RE = /(?:^|\s)[#＃][^\s#＃]+[#＃]?/g

/** 截断的 ASCII 首字母修复：只作用于题干开头，配合后续字符限定，不误伤句中词 */
const LEAD_FIXUPS: ReadonlyArray<{ re: RegExp, to: string }> = [
  { re: /^Cp(?=\S)/, to: 'mcp' }, // Cp和function-call → mcp
  { re: /^It\s+(?=revert)/i, to: 'git ' }, // It revert → git revert
  { re: /^Ynchronized(?=\S|$)/, to: 'synchronized' },
  { re: /^Odebase(?=\S|$)/, to: 'codebase' },
  { re: /^Upervisor(?=\S|$)/, to: 'supervisor' },
]

/** 题干清洗：章节前缀 → 通用序号 → 括号闲聊 → 话题标签 → 截断首字母 → 规整空白 */
export function cleanQuestionText(raw: string): string {
  let text = raw.trim()

  // 1) 章节式污染前缀（精确）
  let prev: string | null = null
  while (prev !== text) {
    prev = text
    for (const prefix of CHAPTER_HEADING_PREFIXES) {
      if (text.startsWith(prefix)) {
        text = text.slice(prefix.length)
        break
      }
    }
    text = text.trim()
  }

  // 2) 通用开头序号/章节号标记（反复剥离直到稳定）
  prev = null
  while (prev !== text) {
    prev = text
    for (const re of GENERIC_LEADING_MARKERS) {
      text = text.replace(re, '')
    }
    // 剥掉标记后遗留的连字符/圆点引导（如「01） - AI 对话平台」）
    text = text.replace(/^[\s\-–—·•]+/, '').trim()
  }

  // 3) 括号闲聊（不限于尾部，句中出现的（追问）一并去除）
  text = text.replace(CHATTER_PAREN_RE, '')

  // 4) 话题标签
  text = text.replace(HASHTAG_RE, ' ')

  // 5) 截断首字母修复
  for (const { re, to } of LEAD_FIXUPS) {
    if (re.test(text)) {
      text = text.replace(re, to)
    }
  }

  // 6) 规整空白
  return text.replace(/\s+/g, ' ').trim()
}

/** 残余闲聊尾巴校验（括号闲聊已全局剥离，正常不应再以该模式收尾） */
export function hasResidualChatterTail(text: string): boolean {
  const t = text.trimEnd()
  return /[（(]\s*(?:追问|面试官|考官|候选人|反问)[^（）()]*[）)]\s*$/.test(t)
}

/* ------------------------------------------------------------------ *
 * 近重复判定
 * ------------------------------------------------------------------ */

/** 比较键：去空白/标点、统一小写，只留字母数字（含 CJK） */
export function normalizeCompareKey(text: string): string {
  return text.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '')
}

function charBigrams(key: string): Set<string> {
  const grams = new Set<string>()
  for (let i = 0; i + 1 < key.length; i++) {
    grams.add(key.slice(i, i + 2))
  }
  return grams
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0)
    return 1
  if (a.size === 0 || b.size === 0)
    return 0
  let intersection = 0
  for (const gram of a) {
    if (b.has(gram))
      intersection++
  }
  return intersection / (a.size + b.size - intersection)
}

/** 近重复合并：同一簇收敛为代表；hot 永远保留（簇内多个不同文本的 hot 各自保留） */
function dedupeNearTwins(list: readonly Question[], threshold: number): Question[] {
  if (list.length === 0)
    return []

  const keys = list.map(q => normalizeCompareKey(q.text))
  const gramSets = keys.map(key => charBigrams(key))

  // union-find
  const parent = Array.from({ length: list.length }, (_, i) => i)
  const find = (x: number): number => {
    let root = x
    while (parent[root] !== root) root = parent[root]
    while (parent[x] !== root) {
      const next = parent[x]
      parent[x] = root
      x = next
    }
    return root
  }
  const union = (a: number, b: number): void => {
    const ra = find(a)
    const rb = find(b)
    if (ra !== rb)
      parent[ra] = rb
  }

  // 完全同键（精确重复）
  const exactIndex = new Map<string, number>()
  for (let i = 0; i < keys.length; i++) {
    const existing = exactIndex.get(keys[i])
    if (existing === undefined)
      exactIndex.set(keys[i], i)
    else union(i, existing)
  }

  // 近似重复：按比较键前 6 字符分桶 + 长度窗口过滤，桶内两两比对
  const bucket = new Map<string, number[]>()
  keys.forEach((key, i) => {
    const prefix = key.slice(0, 6)
    const arr = bucket.get(prefix)
    if (arr)
      arr.push(i)
    else bucket.set(prefix, [i])
  })

  for (const indices of bucket.values()) {
    for (let a = 0; a < indices.length; a++) {
      const ia = indices[a]
      const la = keys[ia].length
      for (let b = a + 1; b < indices.length; b++) {
        const ib = indices[b]
        const lb = keys[ib].length
        // Jaccard ≥ 0.75 时两集合长度差最多约 1/3
        if (lb > la * 1.34 || la > lb * 1.34)
          continue
        if (jaccard(gramSets[ia], gramSets[ib]) >= threshold)
          union(ia, ib)
      }
    }
  }

  // 按簇收敛
  const clusters = new Map<number, Question[]>()
  for (let i = 0; i < list.length; i++) {
    const root = find(i)
    const arr = clusters.get(root)
    if (arr)
      arr.push(list[i])
    else clusters.set(root, [list[i]])
  }

  const pickBest = (group: Question[]): Question =>
    [...group].sort((a, b) => b.coverCount - a.coverCount || a.id.localeCompare(b.id))[0]

  const result: Question[] = []
  for (const group of clusters.values()) {
    const hotMembers = group.filter(q => q.hot)
    if (hotMembers.length > 0) {
      // hot 是硬保留：簇内去重后每个不同文本的 hot 各自输出
      const seenText = new Set<string>()
      for (const hot of hotMembers) {
        const key = normalizeCompareKey(hot.text)
        if (seenText.has(key))
          continue
        seenText.add(key)
        result.push(hot)
      }
    }
    else {
      result.push(pickBest(group))
    }
  }
  return result
}

/* ------------------------------------------------------------------ *
 * 选择主函数
 * ------------------------------------------------------------------ */

function heatDesc(a: Question, b: Question): number {
  return b.coverCount - a.coverCount || Number(b.hot) - Number(a.hot) || a.id.localeCompare(b.id)
}

function groupKey(category: QuestionCategory, subTech: string): string {
  return `${category}::${subTech}`
}

function orderCurated(kept: readonly Question[]): CuratedQuestion[] {
  const byCategory = new Map<QuestionCategory, Map<string, CuratedQuestion[]>>()

  for (const q of kept) {
    let bySub = byCategory.get(q.category)
    if (!bySub) {
      bySub = new Map()
      byCategory.set(q.category, bySub)
    }
    const arr = bySub.get(q.subTech)
    if (arr)
      arr.push(q)
    else bySub.set(q.subTech, [q])
  }

  const ordered: CuratedQuestion[] = []
  for (const category of QUESTION_CATEGORIES) {
    const bySub = byCategory.get(category)
    if (!bySub)
      continue
    const subTechs = [...bySub.entries()]
      .sort((a, b) => b[1].length - a[1].length || a[0].localeCompare(b[0], 'zh'))
    for (const [, questions] of subTechs) {
      questions.sort(heatDesc)
      ordered.push(...questions)
    }
  }
  return ordered
}

/**
 * 精选核心：同一输入必得同一输出。
 * 默认保留全部 hot 题；每个存量子技术至少保留 1 名代表（hot 缺失时取热度最高者）。
 */
export function selectCore(
  source: readonly Question[],
  options?: SelectCoreOptions,
): CuratedQuestion[] {
  const { keepAllHot, topPerSubTech, textSimThreshold } = resolveOptions(options)

  // 1) 卫生：清洗题干 + 归并公司
  const cleaned: Question[] = source.map(q => ({
    ...q,
    text: cleanQuestionText(q.text),
    company: normalizeCompany(q.company),
  }))

  // 2) 近重复合并
  const pool = dedupeNearTwins(cleaned, textSimThreshold)

  // 3) 精选收敛：hot 全保留；无 hot 的子技术补热度代表
  const byGroup = new Map<string, Question[]>()
  for (const q of pool) {
    const key = groupKey(q.category, q.subTech)
    const arr = byGroup.get(key)
    if (arr)
      arr.push(q)
    else byGroup.set(key, [q])
  }

  const selected: Question[] = []
  for (const group of byGroup.values()) {
    const hots = group.filter(q => q.hot)
    if (keepAllHot && hots.length > 0) {
      selected.push(...hots)
    }
    else {
      const k = Math.min(topPerSubTech, group.length)
      const byHeat = [...group].sort(heatDesc)
      selected.push(...byHeat.slice(0, k))
    }
  }

  // 4) 收敛后再去重一次，保证 id / text 全局唯一
  const deduped = dedupeNearTwins(selected, textSimThreshold)

  // 5) 排序：分类 → 子技术 → 热力降序
  return orderCurated(deduped)
}
