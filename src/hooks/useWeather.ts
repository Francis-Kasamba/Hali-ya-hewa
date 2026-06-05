import { useCallback, useEffect, useRef, useState } from 'react'
import type { LocationState, WeatherResponse } from '../types/weather'
import { getWeatherByCoords } from '../utils/api'

export function useWeather(location: LocationState | null, lang: 'en' | 'sw') {
  const [weather, setWeather] = useState<WeatherResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const requestIdRef = useRef(0)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true

    return () => {
      mountedRef.current = false
    }
  }, [])

  const runWeatherFetch = useCallback(async () => {
    const requestId = ++requestIdRef.current
    const isLatestRequest = () => mountedRef.current && requestId === requestIdRef.current

    if (!location) {
      if (isLatestRequest()) {
        setWeather(null)
        setError(null)
        setLoading(false)
      }

      return
    }

    setLoading(true)
    setError(null)

    try {
      const data = await getWeatherByCoords(location.lat, location.lon, 7, lang)

      if (isLatestRequest()) {
        setWeather(data)
        setLoading(false)
      }
    } catch (fetchError) {
      if (isLatestRequest()) {
        setWeather(null)
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : 'Weather data unavailable — please try again',
        )
        setLoading(false)
      }
    }
  }, [lang, location])

  useEffect(() => {
    void runWeatherFetch()
  }, [runWeatherFetch])

  return {
    weather,
    loading,
    error,
    refetch: runWeatherFetch,
  }
}