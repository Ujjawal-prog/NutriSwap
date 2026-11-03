// Copy to nutriswap/ns/src/api.js. Set VITE_API_URL=http://localhost:5000/api in the frontend .env
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

async function post(path, body) {
  let res
  try {
    res = await fetch(BASE + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
  } catch {
    throw new Error('Cannot reach the server. Is the backend running?')
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
  return data
}

export const matchRecipes = (have) => post('/recipes/match', { have }).then((d) => d.recipes)
export const getSwaps = (ingredients) => post('/swaps', { ingredients }).then((d) => d.swaps)
export const calcWaste = (monthly) => post('/waste', { monthly })
