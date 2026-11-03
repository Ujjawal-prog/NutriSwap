import { useRef, useState } from 'react'
import GlowCard from './GlowCard'
import { EMOJI, RECIPES } from '../data'

const STEPS = ['Reading image', 'Recognising items', 'Estimating quantity', 'Matching recipes']
const POOL = [...new Set(RECIPES.flatMap(r => r.need))]
const QTY = ['1 bunch', '200 g', '4', '3', '400 g', '1 sprig', '2', '500 ml']
const VISION = import.meta.env.VITE_VISION_API_URL

const SCENE = 'data:image/svg+xml;utf8,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500"><defs><radialGradient id="g" cx=".5" cy=".2" r=".9"><stop offset="0" stop-color="#4a3216"/><stop offset="1" stop-color="#120c06"/></radialGradient></defs><rect width="800" height="500" fill="url(#g)"/><g stroke="#6b5a3a" stroke-width="6"><line x1="30" y1="205" x2="770" y2="205"/><line x1="30" y1="385" x2="770" y2="385"/></g><g font-size="84" text-anchor="middle"><text x="130" y="175">🥬</text><text x="270" y="175">🧀</text><text x="410" y="175">🥛</text><text x="550" y="175">🧈</text><text x="680" y="175">🫑</text><text x="150" y="355">🍅</text><text x="290" y="355">🧅</text><text x="430" y="355">🧄</text><text x="570" y="355">🥕</text><text x="690" y="355">🥚</text></g></svg>`)

// Returns [{ name, confidence, qty }]. With VITE_VISION_API_URL set it POSTs the photo
// (multipart field "image") and expects { items: [...] }. Otherwise it is a stand-in.
async function detect(file) {
  if (VISION && file) {
    const body = new FormData()
    body.append('image', file)
    const res = await fetch(VISION, { method: 'POST', body })
    if (!res.ok) throw new Error(`Vision API error (${res.status})`)
    return (await res.json()).items
  }
  let seed = (file?.size ?? 4242) % 997
  const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280
  return [...POOL].sort(() => rnd() - 0.5).slice(0, 6).map((name, i) => ({
    name, confidence: Math.round(96 - i * 3 - rnd() * 3), qty: QTY[Math.floor(rnd() * QTY.length)]
  }))
}

export default function FridgeScan({ onAdd, onCook }) {
  const [img, setImg] = useState('')
  const [phase, setPhase] = useState('idle')
  const [step, setStep] = useState(0)
  const [items, setItems] = useState([])
  const [shown, setShown] = useState(0)
  const [err, setErr] = useState('')
  const input = useRef(null)
  const busy = phase === 'scanning'

  const run = async file => {
    setErr(''); setItems([]); setShown(0); setStep(0); setPhase('scanning')
    const tick = setInterval(() => setStep(s => Math.min(s + 1, 2)), 900)
    try {
      const [found] = await Promise.all([detect(file), new Promise(r => setTimeout(r, 3200))])
      clearInterval(tick)
      setItems(found); setStep(3)
      found.forEach((_, i) => setTimeout(() => setShown(i + 1), 280 * (i + 1)))
      setTimeout(() => { setStep(4); setPhase('done'); onAdd(found.map(f => f.name.toLowerCase())) }, 280 * found.length + 700)
    } catch (e) {
      clearInterval(tick); setErr(e.message); setPhase('error')
    }
  }
  const onFile = e => {
    const f = e.target.files?.[0]
    if (!f) return
    setImg(URL.createObjectURL(f)); run(f); e.target.value = ''
  }

  return (
    <section id="scan" className="sec scan">
      <p className="eyebrow reveal"><span>01</span><i /> Fridge scan · 4 seconds</p>
      <h2 className="reveal">One photo. <em>A whole pantry.</em></h2>
      <p className="lede reveal">No typing, no barcode hunting. Open the fridge, take one picture, and NutriSwap reads what is on the shelf and drops it straight into your pantry.</p>
      <div className="scan-grid">
        <GlowCard className={`scanframe reveal ${phase}`}>
          <div className="scan-img" style={img ? { backgroundImage: `url(${img})` } : undefined}>
            {!img && <div className="scan-empty"><span>📷</span><b>Drop in a photo of your fridge</b><small>or try the sample shelf</small></div>}
            <i className="grid-lines" /><i className="vsweep" />
            {['tl', 'tr', 'bl', 'br'].map(c => <i key={c} className={`corner ${c}`} />)}
            {items.slice(0, shown).map((it, i) => (
              <span key={it.name} className="det" style={{ left: `${10 + ((i * 29) % 68)}%`, top: `${12 + ((i * 37) % 60)}%` }}>{EMOJI[it.name] ?? '🍽️'} {it.name}</span>
            ))}
            <span className="badge">{busy ? 'SCANNING…' : phase === 'done' ? 'COMPLETE' : 'READY'}</span>
          </div>
          <div className="scan-actions">
            <button className="solid" disabled={busy} onClick={() => input.current.click()}>📷 Take or upload photo</button>
            <button disabled={busy} onClick={() => { setImg(SCENE); run(null) }}>Try sample shelf</button>
            <input ref={input} type="file" accept="image/*" capture="environment" hidden onChange={onFile} />
          </div>
        </GlowCard>

        <GlowCard className="scanpanel reveal">
          <div className="panel-head"><span>PANTRY BEING BUILT</span><b>{shown} / {items.length} ITEMS</b></div>
          <div className="meter"><i style={{ width: `${items.length ? (shown / items.length) * 100 : busy ? 14 : 0}%` }} /></div>
          <div className="steps">
            {STEPS.map((s, i) => <span key={s} className={step > i ? 'ok' : step === i && busy ? 'now' : ''}>{step > i ? '✓' : '•'} {s}</span>)}
          </div>
          <ul className="found">
            {items.slice(0, shown).map(it => (
              <li key={it.name}>
                <div><span>{EMOJI[it.name] ?? '🍽️'} {it.name}</span><em>{it.confidence}% · {it.qty}</em></div>
                <u><i style={{ width: `${it.confidence}%` }} /></u>
              </li>
            ))}
            {!items.length && <li className="hint">{err || 'Detected ingredients will show up here.'}</li>}
          </ul>
          <div className="panel-foot">
            <span>{phase === 'done' ? `✓ ${items.length} added to your pantry` : 'Nothing scanned yet'}</span>
            <button className="solid" disabled={phase !== 'done'} onClick={onCook}>What can I cook →</button>
          </div>
        </GlowCard>
      </div>
    </section>
  )
}
