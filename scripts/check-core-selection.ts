/**
 * 精选核心不变量校验
 *
 * 对两条管线分别断言外部契约（不变量）：
 *   A. 生成器：对全量题库（3465 题）跑一次 selectCore
 *   B. 物化产物：页面直接消费的 curatedCore（作者可在 questions-core.ts 覆写定稿）
 *
 * A / B 共同断言：
 *   1. 唯一性：id 唯一、清洗后题干唯一
 *   2. 排序：分类（QUESTION_CATEGORIES 序）→ 子技术 → 组内 coverCount 降序
 *   3. 卫生：无开头序号/章节号、无括号闲聊尾巴、公司名为规范值
 *
 * 生成器（A）额外断言：确定性、规模 0 < N < 全量、源 hot 全保留、存量子技术覆盖
 * 物化产物（B）额外断言：count === curatedTotal、每项 hot: true
 *
 * 任一断言失败即抛错并以非零码退出；全部通过则打印绿色 OK 与两管线题量。
 * Usage: pnpm exec tsx scripts/check-core-selection.ts
 */

import type { QuestionCategory } from '../src/data/questions'
import type { CuratedQuestion } from '../src/data/select-core'
import process from 'node:process'
import {
  CATEGORY_LABELS,
  QUESTION_CATEGORIES,
  questions,
} from '../src/data/questions'
import { curatedCore, curatedTotal } from '../src/data/questions-core'
import {
  cleanQuestionText,
  COMPANY_ALIASES,
  groupKey,
  hasResidualChatterTail,
  hasResidualLeadingNoise,
  normalizeCompany,
  normalizeCompareKey,
  selectCore,
} from '../src/data/select-core'

const source = questions as readonly CuratedQuestion[]

/* ------------------------------------------------------------------ *
 * 断言工具
 * ------------------------------------------------------------------ */

let failed = false

/** 断言失败即置全局 failed 并打印；返回条件本身便于逐条聚合 */
function assert(condition: boolean, message: string): boolean {
  if (!condition) {
    failed = true
    console.error(`❌ ${message}`)
    return false
  }
  return true
}

function section(title: string): void {
  console.log(`\n—— ${title} ——`)
}

/* ------------------------------------------------------------------ *
 * 共同不变量：唯一性 / 排序 / 卫生
 * ------------------------------------------------------------------ */

function checkUniqueness(core: readonly CuratedQuestion[], run: string): boolean {
  const count = core.length
  const ids = new Set(core.map(q => q.id))
  const textKeys = new Set(core.map(q => normalizeCompareKey(q.text)))
  let ok = true
  ok = assert(ids.size === count, `${run}：id 不唯一：${ids.size} 唯一 / ${count} 条`) && ok
  ok = assert(textKeys.size === count, `${run}：清洗后题干不唯一：${textKeys.size} 唯一 / ${count} 条`) && ok
  return ok
}

function checkOrdering(core: readonly CuratedQuestion[], run: string): boolean {
  const seenCategories = new Set<QuestionCategory>()
  let lastCategory: QuestionCategory | null = null
  let lastSubKey: string | null = null
  let prevCover: number | null = null
  for (const q of core) {
    if (q.category !== lastCategory) {
      if (seenCategories.has(q.category)) {
        assert(false, `${run}：分类 ${q.category} 出现穿插（非 QUESTION_CATEGORIES 顺序连续排列）`)
        return false
      }
      seenCategories.add(q.category)
      lastCategory = q.category
      lastSubKey = null
      prevCover = null
    }
    const subKey = groupKey(q.category, q.subTech)
    if (subKey !== lastSubKey) {
      lastSubKey = subKey
      prevCover = null
    }
    if (prevCover !== null && q.coverCount > prevCover) {
      assert(false, `${run}：子技术 ${subKey} 内热力未降序：coverCount ${prevCover} → ${q.coverCount}`)
      return false
    }
    prevCover = q.coverCount
  }
  return true
}

function checkHygiene(core: readonly CuratedQuestion[], run: string): boolean {
  const noiseHits = core.filter(q => hasResidualLeadingNoise(q.text))
  const chatterHits = core.filter(q => hasResidualChatterTail(q.text))
  const aliasHits = core.filter(q => Object.hasOwn(COMPANY_ALIASES, q.company))
  const nonCanonical = core.filter(q => q.company !== '' && normalizeCompany(q.company) !== q.company)
  let ok = true
  ok = assert(noiseHits.length === 0, `${run}：${noiseHits.length} 条题干仍带开头序号/章节号：${noiseHits.slice(0, 5).map(q => `${q.id}「${q.text.slice(0, 40)}」`).join('; ')}`) && ok
  ok = assert(chatterHits.length === 0, `${run}：${chatterHits.length} 条题干仍有闲聊尾巴：${chatterHits.slice(0, 5).map(q => `${q.id}「${q.text.slice(-40)}」`).join('; ')}`) && ok
  ok = assert(aliasHits.length === 0, `${run}：${aliasHits.length} 条公司名仍为别名：${[...new Set(aliasHits.map(q => q.company))].join(', ')}`) && ok
  ok = assert(nonCanonical.length === 0, `${run}：${nonCanonical.length} 条公司名非规范值`) && ok
  return ok
}

/** 对一份核心数组执行共同不变量（唯一性/排序/卫生）并打印通过小结，返回题量 */
function runCommonInvariants(core: readonly CuratedQuestion[], run: string): number {
  const count = core.length

  section('唯一性')
  if (checkUniqueness(core, run))
    console.log(`✅ ${run}：id 与清洗后题干均唯一`)

  section('排序')
  if (checkOrdering(core, run))
    console.log(`✅ ${run}：分类 → 子技术 → coverCount 降序 成立`)

  section('卫生')
  if (checkHygiene(core, run))
    console.log(`✅ ${run}：无开头序号/章节号；无括号闲聊尾巴；公司名为规范值`)

  return count
}

/* ------------------------------------------------------------------ *
 * 主流程
 * ------------------------------------------------------------------ */

function main(): void {
  console.log(`📦 全量题库：${source.length} 题`)

  // ============ A. 生成器：selectCore(questions) ============
  section('A · 生成器 selectCore(questions)')

  section('确定性')
  const runA = selectCore(source)
  const runB = selectCore(source)
  assert(
    JSON.stringify(runA) === JSON.stringify(runB),
    '生成器：两次 selectCore 运行结果不一致（非确定性）',
  )
  const generated = runA

  section('规模')
  const genCount = generated.length
  assert(genCount > 0 && genCount < source.length, `生成器：精选题量 ${genCount} 不在 (0, ${source.length}) 区间内`)
  console.log(`生成器：精选核心 ${genCount} 题（全量的 ${((genCount / source.length) * 100).toFixed(1)}%）`)

  section('hot 保留')
  const outputTextKeys = new Set(generated.map(q => normalizeCompareKey(q.text)))
  const sourceHots = source.filter(q => q.hot)
  const missingHots = sourceHots.filter(q => !outputTextKeys.has(normalizeCompareKey(cleanQuestionText(q.text))))
  assert(
    missingHots.length === 0,
    `生成器：有 ${missingHots.length} 条 hot 题未出现在精选核心：${missingHots.slice(0, 5).map(q => q.id).join(', ')}`,
  )
  console.log(`生成器：hot ${sourceHots.length} 条，全部保留（按清洗后文本）`)

  section('子技术覆盖')
  const sourceSubKeys = new Set(source.map(q => groupKey(q.category, q.subTech)))
  const outputSubKeys = new Set(generated.map(q => groupKey(q.category, q.subTech)))
  const dropped = [...sourceSubKeys].filter(key => !outputSubKeys.has(key)).sort()
  if (dropped.length === 0) {
    console.log(`✅ 生成器：全部 ${sourceSubKeys.size} 个子技术均有代表题`)
  }
  else {
    console.log(`⚠️ 生成器：有 ${dropped.length} 个子技术被整体丢弃（选择策略有意为之）：`)
    for (const key of dropped) console.log(`   - ${key}`)
  }

  runCommonInvariants(generated, '生成器')

  section('分分类明细')
  for (const category of QUESTION_CATEGORIES) {
    const inCat = generated.filter(q => q.category === category)
    if (inCat.length === 0)
      continue
    const subCount = new Set(inCat.map(q => q.subTech)).size
    console.log(`  ${CATEGORY_LABELS[category]}（${category}）：${inCat.length} 题 / ${subCount} 子技术`)
  }

  section('分子技术覆盖（top 条数）')
  const subCounts = new Map<string, number>()
  for (const q of generated) {
    const key = groupKey(q.category, q.subTech)
    subCounts.set(key, (subCounts.get(key) ?? 0) + 1)
  }
  for (const [key, n] of [...subCounts.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${key}：${n}`)
  }

  // ============ B. 物化产物：curatedCore（页面实际消费） ============
  section('B · 物化产物 curatedCore（页面消费）')
  console.log('对页面实际消费的 curatedCore 断言以下不变量（作者覆写后同样受检）：')

  section('题量与 hot 组成')
  const totalOk = assert(
    curatedCore.length === curatedTotal,
    `curatedCore：length ${curatedCore.length} !== curatedTotal ${curatedTotal}`,
  )
  const nonHot = curatedCore.filter(q => !q.hot)
  const hotOk = assert(nonHot.length === 0, `curatedCore：有 ${nonHot.length} 条非 hot 题：${nonHot.slice(0, 5).map(q => q.id).join(', ')}`)
  if (totalOk && hotOk)
    console.log(`✅ curatedCore：${curatedCore.length} 题 === curatedTotal ${curatedTotal}；${curatedCore.length} 条全部 hot: true`)

  const artifactCount = runCommonInvariants(curatedCore, 'curatedCore')

  console.log('')
  if (failed) {
    console.error('❌ 精选核心不变量校验未通过')
    process.exit(1)
  }
  console.log(`✅ 精选核心不变量全部通过 · 生成器 ${genCount} 题 / curatedCore（页面消费物）${artifactCount} 题`)
}

main()
