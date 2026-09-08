/**
 * 精选核心不变量校验
 *
 * 对全量题库（3465 题）跑一次 selectCore，断言其外部契约（不变量）：
 *   1. 确定性：两次运行深度相等
 *   2. 唯一性：id 唯一、清洗后题干唯一
 *   3. hot 全保留
 *   4. 每个存量子技术至少 1 名代表（整子技术被丢弃时打印）
 *   5. 排序：分类 → 子技术 → 热力降序
 *   6. 卫生：无开头序号/章节号、无括号闲聊尾巴、公司名为规范值
 *   7. 规模：0 < N < 全量
 *
 * 任一断言失败即抛错并以非零码退出；全部通过则打印绿色 OK 与题量/分分类明细。
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
import {
  cleanQuestionText,
  COMPANY_ALIASES,
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

function assert(condition: boolean, message: string): void {
  if (!condition) {
    failed = true
    console.error(`❌ ${message}`)
  }
}

function section(title: string): void {
  console.log(`\n—— ${title} ——`)
}

/* ------------------------------------------------------------------ *
 * 主流程
 * ------------------------------------------------------------------ */

function main(): void {
  console.log(`📦 全量题库：${source.length} 题`)

  // 1) 确定性：两次运行深度相等
  section('确定性')
  const runA = selectCore(source)
  const runB = selectCore(source)
  assert(
    JSON.stringify(runA) === JSON.stringify(runB),
    '两次 selectCore 运行结果不一致（非确定性）',
  )
  const curated = runA

  // 2) 规模：0 < N < 全量
  section('规模')
  const count = curated.length
  assert(count > 0 && count < source.length, `精选题量 ${count} 不在 (0, ${source.length}) 区间内`)
  console.log(`精选核心：${count} 题（全量的 ${((count / source.length) * 100).toFixed(1)}%）`)

  // 3) 唯一性
  section('唯一性')
  const ids = new Set(curated.map(q => q.id))
  const textKeys = new Set(curated.map(q => normalizeCompareKey(q.text)))
  assert(ids.size === count, `id 不唯一：${ids.size} 唯一 / ${count} 条`)
  assert(textKeys.size === count, `清洗后题干不唯一：${textKeys.size} 唯一 / ${count} 条`)

  // 4) hot 全保留（按清洗后题干比较键）
  section('hot 保留')
  const outputTextKeys = new Set(curated.map(q => normalizeCompareKey(q.text)))
  const sourceHots = source.filter(q => q.hot)
  const missingHots = sourceHots.filter(q => !outputTextKeys.has(normalizeCompareKey(cleanQuestionText(q.text))))
  assert(
    missingHots.length === 0,
    `有 ${missingHots.length} 条 hot 题未出现在精选核心：${missingHots.slice(0, 5).map(q => q.id).join(', ')}`,
  )
  console.log(`hot：${sourceHots.length} 条，全部保留（按清洗后文本）`)

  // 5) 子技术覆盖
  section('子技术覆盖')
  const sourceSubKeys = new Set(source.map(q => `${q.category}::${q.subTech}`))
  const outputSubKeys = new Set(curated.map(q => `${q.category}::${q.subTech}`))
  const dropped = [...sourceSubKeys].filter(key => !outputSubKeys.has(key)).sort()
  if (dropped.length === 0) {
    console.log(`✅ 全部 ${sourceSubKeys.size} 个子技术均有代表题`)
  }
  else {
    console.log(`⚠️ 有 ${dropped.length} 个子技术被整体丢弃（选择策略有意为之）：`)
    for (const key of dropped) console.log(`   - ${key}`)
  }

  // 6) 排序：分类 → 子技术 → 热力降序
  section('排序')
  const seenCategories = new Set<QuestionCategory>()
  let lastCategory: QuestionCategory | null = null
  let lastSubKey: string | null = null
  let prevCover: number | null = null
  let orderOk = true
  for (const q of curated) {
    if (q.category !== lastCategory) {
      if (seenCategories.has(q.category)) {
        assert(false, `分类 ${q.category} 出现穿插（非 QUESTION_CATEGORIES 顺序连续排列）`)
        orderOk = false
        break
      }
      seenCategories.add(q.category)
      lastCategory = q.category
      lastSubKey = null
      prevCover = null
    }
    const subKey = `${q.category}::${q.subTech}`
    if (subKey !== lastSubKey) {
      lastSubKey = subKey
      prevCover = null
    }
    if (prevCover !== null && q.coverCount > prevCover) {
      assert(false, `子技术 ${subKey} 内热力未降序：coverCount ${prevCover} → ${q.coverCount}`)
      orderOk = false
      break
    }
    prevCover = q.coverCount
  }
  if (orderOk)
    console.log('✅ 分类 → 子技术 → coverCount 降序 成立')

  // 7) 卫生
  section('卫生')
  const noiseHits = curated.filter(q => hasResidualLeadingNoise(q.text))
  assert(noiseHits.length === 0, `${noiseHits.length} 条题干仍带开头序号/章节号：${noiseHits.slice(0, 5).map(q => `${q.id}「${q.text.slice(0, 40)}」`).join('; ')}`)
  const chatterHits = curated.filter(q => hasResidualChatterTail(q.text))
  assert(chatterHits.length === 0, `${chatterHits.length} 条题干仍有闲聊尾巴：${chatterHits.slice(0, 5).map(q => `${q.id}「${q.text.slice(-40)}」`).join('; ')}`)
  const aliasHits = curated.filter(q => Object.hasOwn(COMPANY_ALIASES, q.company))
  assert(aliasHits.length === 0, `${aliasHits.length} 条公司名仍为别名：${[...new Set(aliasHits.map(q => q.company))].join(', ')}`)
  const nonCanonical = curated.filter(q => q.company !== '' && normalizeCompany(q.company) !== q.company)
  assert(nonCanonical.length === 0, `${nonCanonical.length} 条公司名非规范值`)
  console.log('✅ 无开头序号/章节号；无括号闲聊尾巴；公司名为规范值')

  // 8) 明细
  section('分分类明细')
  for (const category of QUESTION_CATEGORIES) {
    const inCat = curated.filter(q => q.category === category)
    if (inCat.length === 0)
      continue
    const subCount = new Set(inCat.map(q => q.subTech)).size
    console.log(`  ${CATEGORY_LABELS[category]}（${category}）：${inCat.length} 题 / ${subCount} 子技术`)
  }

  section('分子技术覆盖（top 条数）')
  const subCounts = new Map<string, number>()
  for (const q of curated) {
    const key = `${q.category}::${q.subTech}`
    subCounts.set(key, (subCounts.get(key) ?? 0) + 1)
  }
  for (const [key, n] of [...subCounts.entries()].sort((a, b) => b[1] - a[1])) {
    console.log(`  ${key}：${n}`)
  }

  console.log('')
  if (failed) {
    console.error('❌ 精选核心不变量校验未通过')
    process.exit(1)
  }
  console.log(`✅ 精选核心不变量全部通过 · ${count} 题`)
}

main()
