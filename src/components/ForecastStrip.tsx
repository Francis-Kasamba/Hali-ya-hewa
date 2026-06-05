import { format, parseISO, isSameDay } from 'date-fns'
import type { ForecastDay } from '../types/weather'
import { translateCondition } from '../utils/i18n'
import { WeatherIcon } from './WeatherIcon'

type ForecastStripProps = {
  daily: ForecastDay[]
  lang: 'en' | 'sw'
}

export function ForecastStrip({ daily, lang }: ForecastStripProps) {
  return (
    <section className="mt-8 w-full text-left">
      <p className="text-xs font-semibold uppercase tracking-widest text-emerald-300">
        {lang === 'sw' ? 'Utabiri wa Siku 7' : '7-Day Forecast'}
      </p>

      <div className="scrollbar-hide mt-4 flex gap-3 overflow-x-auto pb-2">
        {daily.map((day) => {
          const date = parseISO(day.date)
          const isToday = isSameDay(date, new Date())

          return (
            <article
              key={day.date}
              className={`w-28 shrink-0 rounded-2xl border p-4 text-center ${
                isToday
                  ? 'border-emerald-400/50 bg-emerald-400/5'
                  : 'border-white/10 bg-white/5'
              }`}
            >
              <p className="text-sm font-medium text-white">
                {isToday ? (lang === 'sw' ? 'Leo' : 'Today') : format(date, 'EEE')}
              </p>

              <div className="my-3 flex justify-center">
                <WeatherIcon condition={day.condition} size="sm" />
              </div>
              <p className="text-xs text-gray-400">
                {translateCondition(day.condition, lang)}
              </p>

              <p className="text-lg font-bold text-white">{Math.round(day.max_temp_c)}°</p>
              <p className="text-sm text-gray-400">{Math.round(day.min_temp_c)}°</p>

              {day.chance_of_rain > 0 ? (
                <p className="mt-2 text-xs font-medium text-blue-300">
                  💧 {day.chance_of_rain}%
                </p>
              ) : null}
            </article>
          )
        })}
      </div>
    </section>
  )
}