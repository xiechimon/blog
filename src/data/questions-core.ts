/**
 * 精选核心（物化层）
 *
 * 从全量题库（3465 题，见 ./questions.ts）按覆盖信号派生一份「精选核心」：
 * 保留全部高频题（keepAllHot 默认 true）+ 每个存量子技术至少 1 名热度代表，共 698 题。
 * 由 ./select-core 的纯函数派生（同一输入必得同一输出），页面直接消费本模块。
 *
 * 作者可在【呈交复核】阶段调整规模/内容：改 ./select-core 的政策旋钮，或在此覆写
 * curatedCore 的本体（替换为手动定稿的数组），两处皆可。
 */

import type { CuratedQuestion } from './select-core'
import { CATEGORY_LABELS, questions, sourceMeta } from './questions'
import { selectCore } from './select-core'

/** 精选核心：页面消费的题集合（text / company 已清洗归一） */
export const curatedCore: CuratedQuestion[] = selectCore(questions)

/** 核心题量（实际以 curatedCore.length 为准） */
export const curatedTotal: number = curatedCore.length

export { CATEGORY_LABELS, sourceMeta }
export type { CuratedQuestion }
