import { useEffect, useMemo, useState } from 'react'
// Fancy React Bits components load automatically if their files exist in src/components.
// If a file is missing, a plain fallback is used so the site never crashes.
const mods = import.meta.glob('./components/*.jsx', { eager: true })
const pick = (name, fallback) => mods[`./components/${name}.jsx`]?.default ?? fallback
const PixelBlast = pick('PixelBlast', () => null)
const CursorGrid = pick('CursorGrid', () => null)
const TechText = pick('TechText', ({ text }) => <div className="fb-word">{text}</div>)
const SpecularButton = pick('SpecularButton', ({ children, onClick }) => <button className="fb-btn" onClick={onClick}>{children}</button>)
const GlassSurface = pick('GlassSurface', ({ children, width, height, borderRadius }) => <div className="fb-glass" style={{ width, height, borderRadius }}>{children}</div>)
const RotatingText = pick('RotatingText', ({ texts }) => <span>{texts[0]}</span>)
const CurvedInput = pick('CurvedInput', ({ value, onChange, onSubmit, placeholder }) => <form onSubmit={e => { e.preventDefault(); onSubmit(value) }}><input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} aria-label="Add ingredient" /></form>)
const WebThreads = pick('WebThreads', () => null)
const LatticeLoader = pick('LatticeLoader', ({ label, doneLabel, status }) => (
  <div className="fb-dots"><span>{Array.from({ length: 9 }, (_, i) => <i key={i} style={{ animationDelay: `${i * 90}ms` }} />)}</span><b>{status === 'done' ? doneLabel : label}</b></div>
))
const InfiniteSpiral = pick('InfiniteSpiral', ({ items }) => <div className="fb-spiral">{items.map(i => <img key={i.alt} src={i.src} alt={i.alt} />)}</div>)
import { RECIPES, SWAPS, EMOJI, SAMPLES, SPIRAL } from './data'
import GlowCard from './ui/GlowCard'
import FridgeScan from './ui/FridgeScan'

function Loader({ done }) {
  return (
    <div className={`loader${done ? ' out' : ''}`} aria-hidden={done}>
      <div className="loader-in">
        <div className="loader-mark">🥗</div>
        <h2>NutriSwap</h2>
        <LatticeLoader status={done ? 'done' : 'working'} label="Prepping your kitchen" doneLabel="Ready in" pattern="spiral" shape="round" color="#ffb43a" doneColor="#8fd14f" cellSize={9} gap={3} fontSize={15} glow glowColor="#ffb43a" />
      </div>
    </div>
  )
}

const go = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
const sign = n => (n > 0 ? `+${n}` : `${n}`)
const btn = { size: 'lg', radius: 28, tint: '#ffb43a', tintOpacity: 0.08, lineColor: '#ffcf7a', baseColor: '#6b5a3a', textColor: '#fff3dc', style: { background: 'rgba(22,15,6,.82)' } }

export default function App() {
  const [have, setHave] = useState(['onion', 'tomato', 'rice'])
  const [text, setText] = useState('')
  const [scan, setScan] = useState('')
  const [pick, setPick] = useState(null)
  const [waste, setWaste] = useState(500)

  const [ready, setReady] = useState(false)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    let t
    Promise.all([document.fonts?.ready, new Promise(r => setTimeout(r, 1800))]).then(() => {
      setReady(true)
      t = setTimeout(() => setGone(true), 1400)
    })
    return () => clearTimeout(t)
  }, [])
  useEffect(() => { document.body.style.overflow = gone ? '' : 'hidden' }, [gone])

  useEffect(() => {
    if (!ready) return undefined
    const io = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && e.target.classList.add('in')), { threshold: 0.12 })
    document.querySelectorAll('.reveal').forEach(el => io.observe(el))
    return () => io.disconnect()
  }, [ready])

  const add = name => {
    const n = name.trim().toLowerCase()
    if (n && !have.includes(n)) setHave([...have, n])
    setText('')
  }
  const doScan = kind => {
    setScan(kind)
    setTimeout(() => { setHave(SAMPLES[kind]); setScan(''); setPick(null) }, 1500)
  }

  const results = useMemo(
    () => RECIPES.map(r => {
      const got = r.need.filter(n => have.includes(n))
      return { ...r, miss: r.need.filter(n => !have.includes(n)), pct: Math.round((got.length / r.need.length) * 100) }
    }).sort((a, b) => b.pct - a.pct),
    [have]
  )
  const chosen = results.find(r => r.id === pick) ?? results[0]
  const swaps = chosen.need.filter(n => SWAPS[n])

  return (
    <>
      {!gone && <Loader done={ready} />}
      <nav className="nav">
        <GlassSurface width="min(920px, 94vw)" height={58} borderRadius={29} distortionScale={-120} displace={0.6} backgroundOpacity={0.12}>
          <div className="nav-in">
            <b>🥗 NutriSwap</b>
            <div><a onClick={() => go('scan')}>Scan</a><a onClick={() => go('pantry')}>Pantry</a><a onClick={() => go('spiral')}>Ingredients</a><a onClick={() => go('impact')}>Impact</a></div>
          </div>
        </GlassSurface>
      </nav>

      <header className="hero">
        <div className="bg"><PixelBlast variant="circle" color="#ffb43a" accentColor="#ff6a3d" pixelSize={5} patternScale={2} patternDensity={0.85} glow={0.3} edgeFade={0.5} twinkle={0.15} hoverEffect="reveal" enableRipples autoRipple={5} /></div>
        <div className="scrim" />
        <div className="hero-in">
          <p className="tag">Built for Foodoscope · powered by RecipeDB + FlavorDB</p>
          <div className="wordmark"><TechText text="NutriSwap" fontWeight={700} fontSize={190} reveal="letter" intro="type" introDuration={2} color="#f6efe4" accentColor="#ffb43a" /></div>
          <h1 className="rot">Make every <RotatingText texts={['ingredient', 'leftover', 'rupee', 'meal']} effect="slide" rotationInterval={2200} highlight highlightColor="#ffb43a" staggerDuration={0.02} /> count.</h1>
          <p className="sub">Tell us what is in your kitchen. We find what you can cook and how to make it healthier, so nothing goes to waste.</p>
          <div className="cta">
            <SpecularButton {...btn} onClick={() => go('pantry')}>Open my pantry</SpecularButton>
            <SpecularButton {...btn} tintOpacity={0} onClick={() => go('impact')}>See the impact</SpecularButton>
          </div>
        </div>
      </header>

      <FridgeScan onAdd={names => setHave(h => [...new Set([...h, ...names])])} onCook={() => go('pantry')} />

      <div className="pantry-wrap">
      <div className="bg"><CursorGrid color="#ffb43a" gridColor="#ffb43a" cellSize={64} highlight="area" radius={150} fillOpacity={0.05} gridOpacity={0.05} spotlight={0.5} edgeFade={0.3} clickPulse /></div>
      <section id="pantry" className="sec">
        <h2 className="reveal">1 · What do you have?</h2>
        <div className="scans reveal">
          {[['fridge', '📷 Scan fridge'], ['receipt', '🧾 Scan receipt'], ['qr', '▦ Scan grocery QR']].map(([k, label]) => (
            <button key={k} className={scan === k ? 'on' : ''} onClick={() => (k === 'fridge' ? go('scan') : doScan(k))} disabled={!!scan}>{scan === k ? 'Analyzing…' : label}</button>
          ))}
          <CurvedInput type="text" placeholder="Add an ingredient…" buttonText="Add" theme="dark" bend={14} height={56} width={340} showIcon={false} shadowSize="sm" backgroundColor="#17130e" borderColor="#3a2e1b" buttonColor="#ffb43a" buttonTextColor="#1a1206" textColor="#f6efe4" placeholderColor="#8a7b62" value={text} onChange={setText} onSubmit={v => add(v)} />
        </div>
        {scan && <div className="scanbar" />}
        <div className="chips reveal">
          {have.map(n => <button key={n} className="chip" onClick={() => setHave(have.filter(x => x !== n))} title="Remove">{EMOJI[n] ?? '🍽️'} {n} ✕</button>)}
          {have.length === 0 && <span className="muted">Nothing yet. Add something or scan.</span>}
        </div>

        <h2 className="reveal">2 · What can you cook?</h2>
        <div className="recipes">
          {results.map(r => (
            <GlowCard as="article" key={r.id} className={`rcard reveal ${chosen.id === r.id ? 'sel' : ''}`} onClick={() => setPick(r.id)}>
              <div className="ring" style={{ '--p': r.pct }}><span>{r.pct}%</span></div>
              <div>
                <h3>{r.emoji} {r.name}</h3>
                <p className="muted">{r.time} min · {r.kcal} kcal</p>
                <p className="miss">{r.miss.length ? `Missing: ${r.miss.join(', ')}` : '✅ You have everything'}</p>
              </div>
            </GlowCard>
          ))}
        </div>

        <h2 className="reveal">3 · Make it healthier</h2>
        <GlowCard className="swaps reveal">
          <p className="muted">For <b>{chosen.name}</b></p>
          {swaps.length === 0 && <p>This one is already a good pick. No swaps needed.</p>}
          {swaps.map(n => { const s = SWAPS[n]; return (
            <div key={n} className="swap">
              <div className="from">{EMOJI[n]} {n}<span>→</span><b>{s.to}</b></div>
              <p className="muted">{s.why}</p>
              <div className="pills"><i>{sign(s.kcal)} kcal</i><i>{sign(s.protein)} g protein</i><i>{sign(s.fiber)} g fibre</i></div>
            </div>
          )})}
          <p className="fine">Values are approximate per 100 g.</p>
        </GlowCard>
      </section>
      </div>

      <section id="spiral" className="atlas">
        <div className="atlas-in">
          <div className="atlas-copy">
            <p className="eyebrow reveal"><span>03</span><i /> Ingredient atlas</p>
            <h2 className="reveal">Every ingredient, <em>understood.</em></h2>
            <p className="lede reveal">NutriSwap knows what each ingredient is and what to swap it for, so a half-empty fridge still becomes dinner.</p>
            <div className="atlas-stats">
              {[[Object.keys(EMOJI).length, 'ingredients tracked'], [Object.keys(SWAPS).length, 'smart swaps'], [RECIPES.length, 'recipes to match']].map(([n, t]) => (
                <GlowCard key={t} className="mini reveal"><b>{n}</b><span>{t}</span></GlowCard>
              ))}
            </div>
          </div>
          <div className="atlas-orbit">
            <i className="halo" /><i className="orbit-ring" /><i className="orbit-ring r2" />
            <InfiniteSpiral items={SPIRAL} animationMode="all" speed={0.5} radius={190} cardWidth={110} cardHeight={110} verticalSpacing={64} cardRadius={22} />
            <span className="orb o1">FlavorDB</span><span className="orb o2">RecipeDB</span>
          </div>
        </div>
      </section>

      <section id="impact" className="impact">
        <div className="bg"><WebThreads colors={['#ffb43a', '#ff6a3d', '#8fd14f']} coreColor="#fff3dc" threadCount={8} spread={0.22} brightness={0.7} glow={0.025} fade={0.2} /></div>
        <div className="sec impact-in">
          <h2 className="reveal">What it is worth</h2>
          <GlowCard className="calc reveal">
            <label>Groceries your household wastes each month: <b>₹{waste}</b></label>
            <input type="range" min="0" max="3000" step="100" value={waste} onChange={e => setWaste(+e.target.value)} />
            <p className="big">₹{(waste * 12).toLocaleString('en-IN')}<small> saved every year</small></p>
          </GlowCard>
          <div className="stats">
            {[['62.3%', 'of daily energy comes from carbohydrates in a study of 18,090 Indian adults'], ['28.5%', 'comes from refined cereals alone'], ['12%', 'is all the protein contributes'], ['19–26%', 'higher odds of diabetes or obesity with the most white rice']].map(([n, t]) => (
              <GlowCard key={n} className="stat reveal"><b>{n}</b><span>{t}</span></GlowCard>
            ))}
          </div>
        </div>
      </section>

      <footer>Less waste. Better choices. Smarter living. · NutriSwap</footer>
    </>
  )
}
