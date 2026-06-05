import type { WeatherResponse } from '../types/weather'
import { translateCondition } from '../utils/i18n'
import { WeatherIcon } from './WeatherIcon'

type CurrentWeatherProps = {
  weather: WeatherResponse
  city: string
  lang: 'en' | 'sw'
  onToggleLang: () => void
}

function StatPill({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-200">
      {children}
    </div>
  )
}

export function CurrentWeather({
  weather,
  city,
  lang,
  onToggleLang,
}: CurrentWeatherProps) {
  return (
    <div className="space-y-6 text-left">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white sm:text-4xl">{city}</h2>
          <p className="mt-1 text-sm text-gray-400">
            {weather.location.country}
          </p>
        </div>

        <button
          type="button"
          onClick={onToggleLang}
          className="inline-flex items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-200 transition hover:bg-emerald-400/20"
        >
          {lang === 'en' ? '🇰🇪 Kiswahili' : '🇬🇧 English'}
        </button>
      </div>

      <div className="rounded-3xl border border-white/10 bg-gray-950/80 px-6 py-8 text-center shadow-lg shadow-black/20 sm:px-10">
        <div className="flex flex-col items-center gap-4">
          <WeatherIcon condition={weather.current.condition} size="lg" />
          <div className="text-7xl font-bold tracking-tight text-white sm:text-8xl">
            {Math.round(weather.current.temp_c)}°C
          </div>
          <p className="text-lg text-gray-300">{translateCondition(weather.current.condition, lang)}</p>

          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <StatPill>💧 {weather.current.humidity}%</StatPill>
            <StatPill>💨 {weather.current.wind_kph} km/h</StatPill>
            <StatPill>🌡️ {lang === 'sw' ? 'Hisi' : 'Feels'} {Math.round(weather.current.feels_like_c)}°C</StatPill>
            <StatPill>☀️ UV {weather.current.uv_index}</StatPill>
          </div>
        </div>
      </div>

      {weather.ai_summary ? (
        <div className="rounded-2xl border border-emerald-400/20 border-l-4 border-l-emerald-400 bg-gray-950/70 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300">
            🤖 AI Weather Insight
          </p>
          <p className="mt-2 text-base leading-7 text-white">{weather.ai_summary}</p>
        </div>
      ) : null}
    </div>
  )
}