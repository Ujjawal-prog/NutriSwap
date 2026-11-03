# NutriSwap Backend (Flask)

## Run
```bash
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env            # Windows: copy .env.example .env
python app.py                   # http://localhost:5000/api/health
python -m pytest -q tests       # optional: 6 tests
```
Works immediately on built-in data. `/api/health` shows `recipes_source` (fallback|foodoscope) and `vision` (demo|claude).

## Endpoints
| Method | Route | Body | Returns |
|---|---|---|---|
| GET | /api/health | - | status + data sources |
| POST | /api/vision/fridge | multipart `image` | `{items:[{name,confidence,qty}]}` |
| POST | /api/vision/receipt | multipart `image` | same |
| POST | /api/qr | `{text}` | `{items}` |
| POST | /api/recipes/match | `{have:[...]}` | `{recipes:[{...,miss,pct}]}` |
| POST | /api/swaps | `{ingredients:[...]}` | `{swaps:[{from,to,kcal,protein,fiber,why}]}` |
| POST | /api/waste | `{monthly}` | `{monthly,yearly}` |

## Connect Foodoscope RecipeDB / FlavorDB
1. Put the key and base URLs from the organizers into `.env`.
2. In `services/foodoscope.py` fill the three `# TODO` spots (auth header, RecipeDB call + mapping, FlavorDB call + mapping).
   Each must return the same shapes the fallback returns; nothing else changes.

## Turn on real fridge/receipt scanning
Put `ANTHROPIC_API_KEY` in `.env` and restart. Frontend: set in `ns/.env`
`VITE_VISION_API_URL=http://localhost:5000/api/vision/fridge` (FridgeScan.jsx already supports this, no code change).

## Connect the frontend (recipes + swaps)
Copy `frontend-patch/api.js` to `ns/src/api.js`. In `App.jsx` replace the `results` useMemo with:
```jsx
import { matchRecipes, getSwaps } from './api'
const [results, setResults] = useState([])
const [swapList, setSwapList] = useState([])
useEffect(() => { matchRecipes(have).then(setResults).catch(() => setResults([])) }, [have])
```
and compute the swaps for the chosen recipe with `getSwaps(chosen.need).then(setSwapList)` instead of reading `SWAPS`.
Guard `chosen` for an empty list while loading.
