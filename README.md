# Hali ya Hewa 🌤️

Kenya weather dashboard. "Hali ya Hewa" means "Weather Conditions" in Swahili. Built for the WeatherAI technical assessment by Francis Kasamba.

## Live Demo
https://hali-ya-hewa.vercel.app

## GitHub
https://github.com/Francis-Kasamba/Hali-ya-hewa

---

## What it does

The app shows real-time weather for any location in Kenya. On load it automatically detects where you are using the browser's GPS. If GPS is denied or takes too long it falls back to IP-based geolocation. Once a location is resolved it fetches current conditions, a 7-day forecast, and an optional AI-generated weather summary from the WeatherAI API.

You can search any Kenyan city by name or click one of five quick-select buttons — Nairobi, Mombasa, Kisumu, Nakuru, Eldoret. There is a toggle to switch all weather text between English and Swahili. The translation is handled client-side so it responds instantly without an extra API call.

Every loading state shows a skeleton placeholder. Every failure state shows a plain error message and a Try Again button. The screen is never blank.

---

## Tech stack

- **React 19 + TypeScript** — UI and type safety
- **Vite 8** — dev server, build tool, environment variable injection
- **Tailwind CSS v3** — styling
- **Axios** — HTTP requests to the WeatherAI API
- **date-fns** — forecast date formatting
- **OpenStreetMap Nominatim** — free geocoding for city search and GPS reverse lookup
- **Vercel** — deployment

---

## How the WeatherAI API is used

Two endpoints are called.

**`GET /v1/weather-geo?ip=auto&ai=false`**
Called once on page load when GPS is not available. Returns the user's coordinates and city name based on their IP address. `ai=false` is passed on this call so it does not consume any of the 200 monthly AI requests — it is only needed for coordinates, not a weather summary.

**`GET /v1/weather?lat=X&lon=Y&units=metric&days=7&lang=en&ai=false`**
The main data call. Returns current conditions (temperature, feels-like, humidity, wind speed, UV index, condition) and a 7-day daily forecast with high/low temps and rain probability. `ai=false` is also passed here to stay within the free plan's AI quota. The `lang` parameter is sent on every call so the API has context, but weather condition text is translated client-side via a Swahili lookup map for instant toggle response. This call re-fires whenever the user selects a different city or switches language.

The Authorization header (`Bearer <key>`) is attached by an Axios instance and never exposed in the URL.

---

## Location detection flow

1. GPS and IP detection both fire at the same time on page load.
2. IP geolocation usually resolves first and shows weather data immediately.
3. If GPS succeeds within 8 seconds it overrides the IP result with a more accurate position.
4. If GPS is denied or times out the IP result is kept.
5. If both fail the user sees an error message and can search manually.

Note: IP geolocation accuracy depends on the ISP. If the detected location looks wrong, search for your city manually using the search bar.

---

## Language toggle

Switching to Kiswahili translates the following instantly without re-fetching:

- Weather condition text (e.g. "Cloudy" → "Mawingu")
- Forecast section heading ("7-Day Forecast" → "Utabiri wa Siku 7")
- Today label on the forecast strip ("Today" → "Leo")
- Feels-like label ("Feels" → "Hisi")

Translations are handled in `src/utils/i18n.ts` via a condition string lookup map.

---

## Project structure

```
src/
  components/
    CurrentWeather.tsx   current temp, stats, AI card, language toggle
    ForecastStrip.tsx    horizontally scrollable 7-day forecast cards
    SearchBar.tsx        city search input and quick-select pills
    WeatherIcon.tsx      maps condition string to an emoji
  hooks/
    useLocation.ts       GPS and IP detection, exposes location + refetch
    useWeather.ts        fetches weather on location/lang change, exposes weather + refetch
  types/
    weather.ts           all TypeScript interfaces
  utils/
    api.ts               Axios client, all API calls, response mapping
    i18n.ts              English to Swahili condition translation map
  App.tsx                root component, wires hooks and renders UI states
```

---

## Setup

Requires Node.js 18 or later.

```bash
git clone https://github.com/Francis-Kasamba/Hali-ya-hewa.git
cd Hali-ya-hewa
npm install
cp .env.example .env
```

Open `.env` and add your key:

```
VITE_WEATHERAI_KEY=wai_your_key_here
```

```bash
npm run dev
```

The dev server runs at `http://localhost:5173`. Vite proxies `/api/*` to `https://api.weather-ai.co` and `/nominatim/*` to `https://nominatim.openstreetmap.org` so there are no CORS errors locally.

---

## Environment variables

| Variable | Description |
|---|---|
| `VITE_WEATHERAI_KEY` | Your WeatherAI API key. Get one at weather-ai.co. |

The `.env` file is in `.gitignore` and must never be committed. The `.env.example` file with an empty placeholder is committed so other developers know what is required.

---

## Scripts

```bash
npm run dev       # start development server with hot reload
npm run build     # run TypeScript type check then build for production
npm run preview   # serve the production build locally to verify before deploying
npm run lint      # run ESLint
```

Always run `npm run build` before deploying. It catches TypeScript errors that the dev server ignores.

---

## Deployment on Vercel

1. Push the repo to GitHub. Confirm `.env` is not in the commit history with `git log --all --full-history -- .env`.
2. Go to vercel.com, create a new project, and import the repo.
3. Vercel detects Vite automatically. No build settings need to be changed.
4. Under Settings → Environment Variables, add `VITE_WEATHERAI_KEY` with your key.
5. Deploy.

The `vercel.json` file in the project root tells Vercel to proxy `/api/*` to WeatherAI and `/nominatim/*` to Nominatim. This is the production equivalent of the Vite dev proxy and is required — without it all API calls fail in production.

---

## Error handling

| Situation | What the user sees |
|---|---|
| Invalid or missing API key | Invalid API key — check your .env file |
| Monthly quota exceeded | API quota exceeded — try again later |
| Any other API failure | Weather data unavailable — please try again |
| GPS denied or timed out | IP fallback runs silently, no error shown |
| Both GPS and IP fail | Unable to detect your location. Please search for a city manually. |
| City not found in search | City not found |
