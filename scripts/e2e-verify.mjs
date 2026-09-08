// Functional QA v2 — walks the redesigned Learn journey the way a beginner
// would, then sandbox / research / mobile / a11y.
import { chromium } from 'playwright'
const BASE = 'http://localhost:5173/'
const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1500, height: 950 } })
const errs = []
page.on('pageerror', (e) => errs.push('PAGEERROR ' + e.message))
page.on('console', (m) => m.type() === 'error' && errs.push(m.text().slice(0, 200)))
let fails = 0
const ok = (name, cond, extra = '') => {
  console.log((cond ? '  ✔ ' : '  ✘ ') + name + (cond ? '' : '   ' + extra))
  if (!cond) fails++
  return cond
}
const V = (sel) => page.locator(`.page.show ${sel}`)
const vCount = async (sel) => V(sel).count()
const waitCont = async (label, ms = 45000) => {
  const opened = await page
    .waitForFunction(
      () => {
        const b = [...document.querySelectorAll('.page.show .stage-card button')].find((x) => /continue|sandbox →|keep/.test(x.textContent))
        return b && !b.disabled
      },
      { timeout: ms },
    )
    .then(() => true)
    .catch(() => false)
  console.log('  ·', label, opened ? 'gate open' : 'gate TIMEOUT')
  return opened
}
const cont = () => V('.stage-card button').filter({ hasText: /continue|open the sandbox/ }).last()

await page.goto(BASE, { waitUntil: 'networkidle' })
await page.evaluate(() => (document.documentElement.style.scrollBehavior = 'auto'))

// ---- light-theme + first viewport ------------------------------------------
await page.waitForFunction(() => document.querySelector('.learn-intro h1'), { timeout: 10000 })
ok('learn headline compact', (await V('.learn-intro h1').textContent()).includes('Can a connection remember'))
const bodyBg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor)
ok('light theme body', bodyBg === 'rgb(248, 250, 252)', bodyBg)
ok('architecture map with you-are-here', (await vCount('.arch-cell.here')) === 1)
ok('arch cells present', (await vCount('.arch-cell')) >= 4)
ok('nav = Learn/Sandbox/Research', (await page.locator('nav .tab').allTextContents()).join(',').toLowerCase().includes('learn'))

// ---- stage 1: watch a connection learn --------------------------------------
await waitCont('stage 1 (auto lesson)')
ok('stage 1 named', (await V('.stage-card h2').textContent()).includes('Watch a connection learn'))
const fLines = await page.evaluate(() => {
  const svg = [...document.querySelectorAll('.page.show .net')].find((n) => n.getClientRects().length)
  return svg ? [...svg.querySelectorAll('line[stroke="#16a34a"]')].length : -1
})
ok('F memory line (green) visible after lesson', fLines > 0, `lines=${fLines}`)
ok('timeline strip present (lean view)', (await vCount('.timeline .tl-dot')) >= 3)
ok('trace/journal hidden in lean stage', (await vCount('.lab-bottom')) === 0)
await cont().click()
await page.waitForTimeout(600)

// ---- stage 2: read the memory -----------------------------------------------
ok('stage 2 named', (await V('.stage-card h2').textContent()).includes('Read the memory'))
await page.waitForFunction(
  () => {
    const p = document.querySelector('.page.show .pred-compare')
    const jl = document.querySelector('.page.show .sr-live')
    return p && (p.textContent ?? '').includes('MODEL')
  },
  { timeout: 20000 },
)
const read2 = await V('.pred-compare').textContent()
ok('read: EXPECTED vs MODEL shown', /EXPECTED/.test(read2 ?? '') && /MODEL/.test(read2 ?? ''), read2 ?? '')
ok('read: model says LEMON ✓', (await V('.pred-v.ok').textContent()).includes('LEMON'))
await waitCont('stage 2 gate (probe fired)')
await cont().click()
await page.waitForTimeout(500)

// ---- stage 3: stop. watch it fade. -------------------------------------------
ok('stage 3 named', (await V('.stage-card h2').textContent()).includes('fade'))
await page.waitForFunction(
  () => {
    const bad = document.querySelector('.page.show .pred-v.bad')
    return !!bad && (bad.textContent ?? '').includes('APPLE')
  },
  { timeout: 30000 },
)
const read3 = await V('.pred-compare').textContent()
ok('fade: model fell back to APPLE ✕', /APPLE/.test(read3 ?? ''), read3 ?? '')
await waitCont('stage 3 gate (crossing probed)')
await cont().click()
await page.waitForTimeout(700)

// ---- stage 4: you control the decay -------------------------------------------
ok('stage 4 named', (await V('.stage-card h2').textContent()).includes('control the decay'))
ok('λ knob only', (await vCount('.learn-knobs .slider')) === 1)
await page.waitForFunction(
  () => {
    const p = document.querySelector('.page.show .pred-compare')
    const jl = document.querySelector('.page.show .journal-last')
    return p && (p.textContent ?? '').includes('MODEL')
  },
  { timeout: 30000 },
)
const read4 = await V('.pred-compare').textContent()
ok('replay lesson: model says LEMON ✓', (await V('.pred-v.ok').textContent()).includes('LEMON'), read4 ?? '')
ok('full detail now (trace visible)', (await vCount('.lab-bottom')) === 1)
// raise λ, replay, expect a faster failure — verify replay exists and λ changed state
await V('.learn-knobs .slider input[type="range"]').evaluate((el) => {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
  setter.call(el, '0.33')
  el.dispatchEvent(new Event('input', { bubbles: true }))
  el.dispatchEvent(new Event('change', { bubbles: true }))
})
await page.waitForTimeout(500)
const lamNow = await V('.learn-knobs').textContent()
ok('λ raised and half-life label updates', /half-life ≈ [12]\./.test(lamNow ?? ''), lamNow?.slice(0, 200) ?? '')
await cont().click()
await page.waitForTimeout(500)

// ---- stage 5: explain it yourself ----------------------------------------------
ok('stage 5 named', (await V('.stage-card h2').textContent()).includes('Explain it yourself'))
ok('quiz present', (await vCount('.quiz-q')) === 1)
await V('.quiz-opt').first().click()
await page.waitForTimeout(300)
ok('correct answer reveals explanation', (await vCount('.quiz-opt.right')) === 1 && (await V('.quiz-explain').textContent()).includes('A.'))
ok('handoff cards ×3', (await vCount('.ho-card')) === 3)
ok('handoff CTAs', (await vCount('.handoff-cta .btn')) >= 2)

// ---- sandbox (via handoff CTA) ---------------------------------------------------
await V('.handoff-cta .btn').first().click()
await page.waitForTimeout(2000)
ok('handoff opens sandbox', await page.locator('.page.show .sandbox').isVisible())
ok('sandbox scenario cards ×6', (await vCount('.scen-row .scen:not(.scen-import)')) === 6)
ok('sandbox import card present', (await vCount('.scen-row .scen-import')) === 1)

// keyboard teach in sandbox once hero run pauses
await page.waitForFunction(() => {
  const jl = document.querySelector('.page.show .journal-last')?.textContent ?? ''
  return jl.includes('probe') && jl.includes('APPLE')
}, { timeout: 45000 }).catch(() => {})
const keyCue = V('.net:visible g.node[tabindex="0"]').filter({ hasText: 'RED' })
const keyItem = V('.net:visible g[role="button"][tabindex="0"]').filter({ hasText: 'LEMON' })
await keyCue.focus()
await page.keyboard.press('Enter')
await page.waitForTimeout(250)
ok('pending cue after keyboard Enter', (await vCount('.tag-acc')) >= 1)
await keyItem.focus()
await page.keyboard.press(' ')
await page.waitForTimeout(600)
const jTeach = await V('.journal-last').textContent()
ok('keyboard teach writes F', /co-activate/.test(jTeach ?? ''), jTeach ?? '')

await V('button:has-text("synapse matrix")').click()
await page.waitForTimeout(400)
ok('matrix view 36 tiles', (await vCount('.tile')) === 36)
await V('button:has-text("graph")').click()
await page.waitForTimeout(400)
ok('sandbox trace chart drawn', (await vCount('.trace-svg line, .trace-svg polyline')) > 3)

// custom preset import (valid + invalid)
await page.locator('#preset-file').setInputFiles({
  name: 'mine.json',
  mimeType: 'application/json',
  buffer: Buffer.from(
    JSON.stringify({
      id: 'mine', label: 'My experiment',
      params: { gamma: 0.55, lambda: 0.08 },
      script: [
        { k: 'teach', cue: 'RED', item: 'GRAPE' },
        { k: 'teach', cue: 'RED', item: 'GRAPE' },
        { k: 'teach', cue: 'RED', item: 'GRAPE' },
        { k: 'query', cue: 'RED', expected: 'GRAPE' },
      ],
    }),
  ),
})
await page.waitForTimeout(700)
ok('valid custom preset loads', (await vCount('.import-ok')) === 1)
await page.waitForFunction(() => {
  const jl = document.querySelector('.page.show .journal-last')?.textContent ?? ''
  return jl.includes('probe') && jl.includes('GRAPE')
}, { timeout: 25000 }).catch(() => {})
ok('imported preset runs to a verdict', /GRAPE/.test((await V('.journal-last').textContent()) ?? ''))
await page.locator('#preset-file').setInputFiles({
  name: 'bad.json',
  mimeType: 'application/json',
  buffer: Buffer.from(JSON.stringify({ script: [{ k: 'explode' }] })),
})
await page.waitForTimeout(1200)
const impErrTxt = await V('.import-err').first().textContent().catch(() => '')
ok('invalid preset rejected with path', /script\[0\]/.test(impErrTxt ?? ''), impErrTxt ?? '')

// ---- research ----------------------------------------------------------------
await page.locator('nav button:has-text("research")').click()
await page.waitForTimeout(800)
ok('research h1 visible', await V('.research h1').isVisible())
ok('BDH tab quotes', (await vCount('.quote')) >= 2)
await V('.subtab:has-text("Transformer memory")').click()
await page.waitForTimeout(400)
ok('transformer comparison', (await vCount('.cmp-card')) === 2)
await V('.subtab:has-text("Evidence & sources")').click()
await page.waitForTimeout(400)
ok('source cards ≥ 5 (incl. provenance)', (await vCount('.src-card')) >= 5)
ok('provenance card present', /Provenance/.test((await V('.src-grid').last().textContent()) ?? ''))
await V('.subtab:has-text("Limits & honesty")').click()
await page.waitForTimeout(400)
ok('≥6 limits', (await vCount('.limit')) >= 6)

// ---- a11y surface -------------------------------------------------------------
await page.locator('nav button:has-text("learn")').click()
await page.waitForTimeout(700)
ok('skip link present', (await page.locator('a.skip-link[href="#main"]').count()) === 1)
ok('main has id=main', (await page.locator('main#main').count()) === 1)
ok('aria-live region present', (await V('.sr-live[aria-live="polite"]').count()) >= 1)

// ---- mobile overflow -----------------------------------------------------------
const mob = await browser.newPage({ viewport: { width: 390, height: 844 } })
await mob.goto(BASE, { waitUntil: 'networkidle' })
await mob.waitForTimeout(4000)
const mo = await mob.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
ok('no horizontal overflow on mobile learn', mo <= 2, `overflow ${mo}px`)
for (const t of ['sandbox', 'research']) {
  await mob.locator(`nav button:has-text("${t}")`).click()
  await mob.waitForTimeout(900)
  const m = await mob.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
  ok(`no horizontal overflow on mobile ${t}`, m <= 2, `overflow ${m}px`)
}
await mob.close()

console.log(fails === 0 ? '\nALL FUNCTIONAL CHECKS PASSED' : `\n${fails} CHECK(S) FAILED`)
console.log('PAGE ERRORS:', errs.length ? errs.slice(0, 5) : 'none')
await browser.close()
