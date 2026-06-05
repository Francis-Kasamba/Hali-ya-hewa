import { useState } from 'react'
import { ForecastStrip } from './components/ForecastStrip'
import { CurrentWeather } from './components/CurrentWeather'
import { SearchBar } from './components/SearchBar'
import { useLocation } from './hooks/useLocation'
import { useWeather } from './hooks/useWeather'
import type { LocationState } from './types/weather'

function App() {
  const [lang, setLang] = useState<'en' | 'sw'>('en')
  const [searchedLocation, setSearchedLocation] = useState<LocationState | null>(null)
  const toggleLang = () => setLang((current) => (current === 'en' ? 'sw' : 'en'))

  const {
    location,
    loading: locationLoading,
    error: locationError,
    refetch: refetchLocation,
  } = useLocation(searchedLocation)
  const {
    weather,
    loading: weatherLoading,
    error: weatherError,
    refetch: refetchWeather,
  } = useWeather(location, lang)

  const activeError = locationError ?? weatherError
  const handleRetry = locationError ? refetchLocation : refetchWeather

  return (
    <main className="min-h-screen bg-gray-900 px-6 py-10 text-white">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/5 px-6 py-12 text-center shadow-2xl shadow-black/30 backdrop-blur-sm sm:px-10">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-300">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          Kenya Weather Dashboard
        </div>

        <header className="max-w-2xl">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Hali ya Hewa
          </h1>
          <p className="mt-4 text-base text-gray-300 sm:text-lg">
            Kenya Weather Dashboard
          </p>
        </header>

        <div className="mt-8 w-full max-w-3xl">
          <SearchBar onLocationSelect={setSearchedLocation} />
        </div>

        <section className="mt-10 w-full max-w-3xl rounded-2xl border border-dashed border-white/15 bg-gray-950/60 px-6 py-12 text-lg text-gray-200 sm:px-10">
          {locationLoading ? (
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-400 border-t-transparent" />
              <p className="text-sm text-gray-300">Detecting your location...</p>
            </div>
          ) : activeError ? (
            <div className="flex flex-col items-center justify-center gap-4 text-center">
              <p className="text-base text-red-300">{activeError}</p>
              <button
                type="button"
                onClick={handleRetry}
                className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-4 py-2 text-sm font-medium text-emerald-200 transition hover:bg-emerald-400/20"
              >
                Try Again
              </button>
            </div>
          ) : weatherLoading ? (
            <div className="space-y-6 text-left">
              <div className="space-y-3">
                <div className="h-8 w-48 animate-pulse rounded-xl bg-white/10" />
                <div className="h-4 w-32 animate-pulse rounded-full bg-white/10" />
              </div>

              <div className="rounded-3xl border border-white/10 bg-gray-950/80 px-6 py-8 sm:px-10">
                <div className="space-y-4">
                  <div className="h-8 w-48 animate-pulse rounded-xl bg-white/10" />
                  <div className="h-4 w-64 animate-pulse rounded-full bg-white/10" />
                  <div className="flex flex-wrap gap-3 pt-2">
                    <div className="h-9 w-20 animate-pulse rounded-full bg-white/10" />
                    <div className="h-9 w-24 animate-pulse rounded-full bg-white/10" />
                    <div className="h-9 w-28 animate-pulse rounded-full bg-white/10" />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            weather && location ? (
              <div className="space-y-8">
                <CurrentWeather
                  weather={weather}
                  city={location.city || 'Your area'}
                  lang={lang}
                  onToggleLang={toggleLang}
                />
                <ForecastStrip daily={weather.daily} />
              </div>
            ) : null
          )}
        </section>
      </section>

      <footer className="mt-6 text-center text-sm text-gray-400">
        Powered by WeatherAI · Built by Francis Kasamba
      </footer>
    </main>
  )
}

export default App
