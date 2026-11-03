// MOCK DATA: swap these for RecipeDB / FlavorDB calls once you have the API keys.
export const EMOJI = { rice: '🍚', paneer: '🧀', capsicum: '🫑', onion: '🧅', garlic: '🧄', 'toor dal': '🫘', tomato: '🍅', ghee: '🧈', 'refined flour': '🌾', potato: '🥔', butter: '🧈', spinach: '🥬', cream: '🥛', carrot: '🥕', peas: '🟢', egg: '🥚', chilli: '🌶️', mushroom: '🍄', lemon: '🍋', curd: '🥣' }

export const RECIPES = [
  { id: 1, name: 'Paneer Pepper Rice Bowl', emoji: '🍚', time: 25, kcal: 520, need: ['rice', 'paneer', 'capsicum', 'onion', 'garlic'] },
  { id: 2, name: 'Dal Tadka', emoji: '🍲', time: 30, kcal: 310, need: ['toor dal', 'onion', 'tomato', 'garlic', 'ghee'] },
  { id: 3, name: 'Aloo Paratha', emoji: '🫓', time: 35, kcal: 420, need: ['refined flour', 'potato', 'onion', 'butter'] },
  { id: 4, name: 'Palak Paneer', emoji: '🥬', time: 30, kcal: 380, need: ['spinach', 'paneer', 'onion', 'cream', 'tomato'] },
  { id: 5, name: 'Veg Pulao', emoji: '🍛', time: 30, kcal: 410, need: ['rice', 'carrot', 'peas', 'onion', 'ghee'] },
  { id: 6, name: 'Tomato Egg Curry', emoji: '🍳', time: 20, kcal: 290, need: ['egg', 'tomato', 'onion', 'garlic'] }
]

// Approximate change per 100 g, placeholder values for the demo.
export const SWAPS = {
  'refined flour': { to: 'whole-wheat flour', kcal: -8, protein: 1, fiber: 8, why: 'Slower glucose rise, far more fibre' },
  rice: { to: 'brown rice', kcal: -7, protein: 0, fiber: 1.4, why: 'Keeps the bran, so a gentler sugar spike' },
  cream: { to: 'low-fat curd', kcal: -280, protein: 3, fiber: 0, why: 'Same creamy body, a fraction of the fat' },
  paneer: { to: 'tofu', kcal: -190, protein: -10, fiber: 1, why: 'Lighter option when you want fewer calories' }
}

export const SAMPLES = {
  fridge: ['paneer', 'capsicum', 'onion', 'garlic', 'rice', 'tomato', 'spinach'],
  receipt: ['refined flour', 'potato', 'butter', 'onion', 'cream', 'egg'],
  qr: ['toor dal', 'ghee', 'tomato', 'garlic', 'onion', 'carrot', 'peas']
}

const card = (emoji, name, hue) => `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="220" height="220"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${hue}"/><stop offset="1" stop-color="#140d07"/></linearGradient></defs><rect width="220" height="220" fill="url(#g)"/><text x="110" y="122" font-size="92" text-anchor="middle">${emoji}</text><text x="110" y="190" font-size="17" fill="#ffcf7a" text-anchor="middle" font-family="sans-serif" letter-spacing="2">${name.toUpperCase()}</text></svg>`)}`
const HUES = ['#5a3510', '#4a2a0c', '#3d2a10', '#4b3510']
export const SPIRAL = Object.entries(EMOJI).map(([name, e], i) => ({ src: card(e, name, HUES[i % 4]), alt: name }))
