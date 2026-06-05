import { useState } from 'react'
import type { LocationState } from '../types/weather'

type SearchBarProps = {
  onLocationSelect: (location: LocationState) => void
}

const QUICK_CITIES = ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret']

export function SearchBar({ onLocationSelect }: SearchBarProps) {
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchCity = async (city: string) => {
    const trimmedCity = city.trim()

    if (!trimmedCity || loading) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `/nominatim/search?q=${encodeURIComponent(trimmedCity)},Kenya&format=json&limit=1`,
        {
          headers: {
            Accept: 'application/json',
          },
        },
      )

      if (!response.ok) {
        throw new Error('City not found')
      }

      const results = (await response.json()) as Array<{
        lat: string
        lon: string
      }>

      if (results.length === 0) {
        setError('City not found')
        return
      }

      const [firstResult] = results

      onLocationSelect({
        lat: Number(firstResult.lat),
        lon: Number(firstResult.lon),
        city: trimmedCity,
        source: 'search',
      })

      setQuery('')
    } catch {
      setError('City not found')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="w-full text-left">
      <form
        className="flex flex-col gap-3 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault()
          void searchCity(query)
        }}
      >
        <input
          type="text"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search Kenyan city"
          className="w-full flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-400 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30"
        />

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-400/10 px-5 py-3 text-sm font-medium text-emerald-200 transition hover:bg-emerald-400/20 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
        >
          {loading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-200 border-t-transparent" />
          ) : (
            'Search'
          )}
        </button>
      </form>

      {error ? <p className="mt-2 text-sm text-red-300">{error}</p> : null}

      <div className="mt-4 flex flex-wrap gap-2">
        {QUICK_CITIES.map((city) => (
          <button
            key={city}
            type="button"
            onClick={() => void searchCity(city)}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-200 transition hover:border-emerald-400/50 hover:bg-emerald-400/10 hover:text-emerald-100"
          >
            {city}
          </button>
        ))}
      </div>
    </section>
  )
}