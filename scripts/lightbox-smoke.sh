#!/usr/bin/env bash
set -euo pipefail

# 灯箱冒烟测试（依赖 ego-browser，本地真实浏览器驱动）
# 用法: scripts/lightbox-smoke.sh [文章URL]   # 默认线上 hello-world
# 断言:
#   A. 动画稳定后不再出现 ≥40px 尺寸变化（两段式布局回归）
#   B. 题注栏位于图片下方且不重叠（静止态测量）
#   C. 翻页计数器正常递增
#   D. Esc 正常关闭
# 注意：断言基于「等待动画真正稳定」而非固定墙钟时间——后台/遮挡窗口的
# 渲染节流会拖长动画，固定时间窗在那种环境下会产生假阳性。
URL="${1:-https://xmon.me/posts/hello-world/}?v=$(date +%s)"

ego-browser nodejs <<EOF
const task = await useOrCreateTaskSpace('lightbox-smoke')
await openOrReuseTab('${URL}', { wait: true, timeout: 30 })
// 前台化标签页，尽量规避后台渲染节流
await cdp('Page.bringToFront').catch(() => {})
await wait(3)

// 等首图元数据就绪再点击（消除图片未加载时的尺寸竞争）
await js(String.raw\`(() => new Promise(res => {
  const img = (document.getElementById('post-content')||document).querySelectorAll('img')[0]
  if (!img) return res('no img')
  if (img.complete && img.naturalWidth > 0) return res('ready')
  img.addEventListener('load', () => res('loaded'), { once: true })
  setTimeout(() => res(img.complete ? 'late-ready' : 'timeout'), 8000)
}))()\`)

const r = await js(String.raw\`(() => new Promise(resolve => {
  const img = (document.getElementById('post-content')||document).querySelectorAll('img')[0]
  if (!img) { resolve({error: 'no img'}); return }
  img.scrollIntoView({block: 'center'})
  img.click()

  // 轮询等待动画真正完成：宽度稳定 且 ≈ 内联最终宽度（scale=1），
  // 后台/遮挡窗口渲染节流会拖长动画，不能依赖固定墙钟；最多等 20s
  const widths = []
  const iv = setInterval(() => {
    const z = document.querySelector('.zoom-img')
    widths.push(z ? Math.round(z.getBoundingClientRect().width) : -1)
  }, 50)
  const t0 = performance.now()
  const settleWait = setInterval(() => {
    const n = widths.length
    const z = document.querySelector('.zoom-img')
    const target = z ? parseFloat(z.style.width) : NaN
    const stable = n >= 4 && Math.abs(widths[n-1] - widths[n-2]) <= 1 && Math.abs(widths[n-2] - widths[n-3]) <= 1 && Math.abs(widths[n-3] - widths[n-4]) <= 1
    const done = stable && target && Math.abs(widths[n-1] - target) <= 3
    if (done || performance.now() - t0 > 20000) {
      finish(!!done)
    }
  }, 100)

  function finish(completed) {
    clearInterval(iv)
    clearInterval(settleWait)
    const settledW = widths[widths.length - 1]
    const settledAt = performance.now()

    // 稳定后再观察 1.2s：任何 ≥40px 变化 = 二次跳变（红灯）
    const after = []
    const iv2 = setInterval(() => {
      const z = document.querySelector('.zoom-img')
      after.push(z ? Math.round(z.getBoundingClientRect().width) : -1)
    }, 50)
    setTimeout(() => {
      clearInterval(iv2)
      let jump = null
      for (let i = 1; i < after.length; i++) {
        if (Math.abs(after[i] - after[i-1]) >= 40) { jump = 'stable@' + settledW + ' then ' + after[i-1] + '→' + after[i]; break }
      }
      // 静止态几何断言
      const z = document.querySelector('.zoom-img'), bar = document.querySelector('.zoom-caption-bar'), counter = document.querySelector('.zoom-counter')
      if (!z || !bar || !counter) { resolve({error: 'lightbox 未打开或元素缺失', settledW}); return }
      const a = z.getBoundingClientRect(), b = bar.getBoundingClientRect()
      resolve({
        completed,
        jump,
        settledW,
        settleMs: Math.round(settledAt - t0),
        barBelow: b.top >= a.bottom - 2,
        overlap: !(b.top >= a.bottom - 1 || b.bottom <= a.top + 1 || b.left >= a.right - 1 || b.right <= a.left + 1),
        counter: counter.textContent
      })
    }, 1200)
  }
}))()\`)

const fails = []
const check = (name, ok, detail) => {
  cliLog((ok ? 'PASS ✓ ' : 'RED ✗ ') + name + (detail ? ' | ' + detail : ''))
  if (!ok) fails.push(name)
}

if (r.error) {
  cliLog('RED ✗ 前置失败: ' + r.error)
  await completeTaskSpace('lightbox-smoke', { keep: false }).catch(() => {})
  process.exit(1)
}
check('A 动画在 20s 内到达最终盒', r.completed !== false, r.completed === false ? '超时未完成' : '用时' + r.settleMs + 'ms')
check('A2 稳定后无≥40px跳变', !r.jump, (r.jump || '稳定于' + r.settledW + 'px'))
check('B 题注在图片下方且不重叠', r.barBelow && !r.overlap, '静止态测量')

// C: 翻页
await click('.zoom-next').catch(() => {})
await wait(1.2)
const c2 = await js(String.raw\`document.querySelector('.zoom-counter')?.textContent || ''\`)
check('C 翻页计数递增', /^2 \\/ \d+\$/.test(c2), c2)

// D: Esc 关闭
await js(String.raw\`document.dispatchEvent(new KeyboardEvent('keydown', {key: 'Escape', bubbles: true}))\`)
await wait(0.8)
const d = await js(String.raw\`(() => { const o = document.querySelector('.zoom-overlay'); return o ? getComputedStyle(o).display : 'missing' })()\`)
check('D Esc 关闭', d === 'none', 'overlay=' + d)

if (fails.length) {
  await completeTaskSpace('lightbox-smoke', { keep: false }).catch(() => {})
  throw new Error('SMOKE FAILED: ' + fails.join(', '))
}
cliLog('--- 全部通过 ---')
await completeTaskSpace('lightbox-smoke', { keep: false }).catch(() => {})
EOF
echo "灯箱冒烟测试通过: $URL"
