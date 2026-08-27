#!/usr/bin/env bash
set -euo pipefail

# 灯箱冒烟测试（依赖 ego-browser，本地真实浏览器驱动）
# 用法: scripts/lightbox-smoke.sh [文章URL]   # 默认线上 hello-world
# 断言:
#   A. 开场动画 t≥240ms 后无 ≥40px 单帧跳变（两段式布局回归）
#   B. 题注栏位于图片下方且不重叠
#   C. 翻页计数器正常递增
#   D. Esc 正常关闭
URL="${1:-https://xmon.me/posts/hello-world/}?v=$(date +%s)"

ego-browser nodejs <<EOF
const task = await useOrCreateTaskSpace('lightbox-smoke')
await openOrReuseTab('${URL}', { wait: true, timeout: 30 })
await wait(4)

const fails = []
const check = (name, ok, detail) => {
  cliLog((ok ? 'PASS ✓ ' : 'RED ✗ ') + name + (detail ? ' | ' + detail : ''))
  if (!ok) fails.push(name)
}

const r = await js(String.raw\`(() => new Promise(resolve => {
  const img = (document.getElementById('post-content')||document).querySelectorAll('img')[0]
  if (!img) { resolve({error: 'no img'}); return }
  img.scrollIntoView({block: 'center'})
  img.click()
  const t0 = performance.now()
  const trace = []
  const iv = setInterval(() => {
    const z = document.querySelector('.zoom-img')
    if (z) trace.push({t: Math.round(performance.now()-t0), w: Math.round(z.getBoundingClientRect().width)})
  }, 40)
  setTimeout(() => {
    clearInterval(iv)
    const z = document.querySelector('.zoom-img'), bar = document.querySelector('.zoom-caption-bar'), counter = document.querySelector('.zoom-counter')
    if (!z || !bar || !counter) { resolve({error: 'lightbox 未打开'}); return }
    const a = z.getBoundingClientRect(), b = bar.getBoundingClientRect()
    let jump = null
    for (let i = 1; i < trace.length; i++) {
      if (trace[i].t >= 240 && Math.abs(trace[i].w - trace[i-1].w) >= 40) jump = trace[i-1].t + '→' + trace[i].t + 'ms: ' + trace[i-1].w + '→' + trace[i].w
    }
    resolve({
      jump,
      barBelow: b.top >= a.bottom - 2,
      overlap: !(b.top >= a.bottom - 1 || b.bottom <= a.top + 1 || b.left >= a.right - 1 || b.right <= a.left + 1),
      counter: counter.textContent
    })
  }, 1000)
}))()\`)

if (r.error) { cliLog('RED ✗ 前置失败: ' + r.error); process.exit(1) }
check('A 动画期外无≥40px跳变', !r.jump, r.jump || '轨迹平滑')
check('B 题注在图片下方且不重叠', r.barBelow && !r.overlap, '图底与题注顶间距正常')

// C: 翻页
await click('.zoom-next').catch(() => {})
await wait(1)
const c2 = await js(String.raw\`document.querySelector('.zoom-counter')?.textContent || ''\`)
check('C 翻页计数递增', /^2 \/ \d+\$/.test(c2), c2)

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
