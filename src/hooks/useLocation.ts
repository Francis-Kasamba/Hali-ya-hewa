import { useCallback, useEffect, useRef, useState } from 'react'
import type { LocationState } from '../types/weather'
import { getWeatherByIP } from '../utils/api'

const LOCATION_TIMEOUT_MS = 8000
const NETWORK_TIMEOUT_MS = 5000

type NominatimReverseResponse = {
  address?: {
    city?: string
    town?: string
    county?: string
  }
}

function getBrowserPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'))
      return
    }

    const timeoutId = window.setTimeout(() => {
      reject(new Error('Geolocation timeout'))
    }, LOCATION_TIMEOUT_MS)

    navigator.geolocation.getCurrentPosition(
      (position) => {
        window.clearTimeout(timeoutId)
        resolve(position)
      },
      (error) => {
        window.clearTimeout(timeoutId)
        reject(error)
      },
      {
        enableHighAccuracy: false,
        maximumAge: 0,
        timeout: LOCATION_TIMEOUT_MS,
      },
    )
  })
}

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage: string,
): Promise<T> {
  let timeoutId: number | undefined

  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = window.setTimeout(() => {
      reject(new Error(timeoutMessage))
    }, timeoutMs)
  })

  try {
    return await Promise.race([promise, timeoutPromise])
  } finally {
    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId)
    }
  }
}

async function getCityFromCoordinates(
  lat: number,
  lon: number,
): Promise<string> {
  const url = new URL('/nominatim/reverse', window.location.origin)
  url.searchParams.set('lat', String(lat))
  url.searchParams.set('lon', String(lon))
  url.searchParams.set('format', 'json')

  const controller = new AbortController()
  const timeoutId = window.setTimeout(() => controller.abort(), NETWORK_TIMEOUT_MS)

  try {
    const response = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Reverse geocoding failed')
    }

    const data = (await response.json()) as NominatimReverseResponse
    return (
      data.address?.city ?? data.address?.town ?? data.address?.county ?? ''
    )
  } finally {
    window.clearTimeout(timeoutId)
  }
}

async function detectByGps(): Promise<LocationState> {
  const position = await withTimeout(
    getBrowserPosition(),
    LOCATION_TIMEOUT_MS,
    'Geolocation timeout',
  )
  const lat = position.coords.latitude
  const lon = position.coords.longitude
  const city = await withTimeout(
    getCityFromCoordinates(lat, lon),
    NETWORK_TIMEOUT_MS,
    'Reverse geocoding timeout',
  )

  if (!city) {
    throw new Error('City not found')
  }

  return {
    lat,
    lon,
    city,
    source: 'gps',
  }
}

async function detectByIp(): Promise<LocationState> {
  const response = await getWeatherByIP()
  const { lat, lon, city } = response.client_geo
  const resolvedCity = response._cityHeader ?? city ?? 'Kenya'

  return {
    lat,
    lon,
    city: resolvedCity,
    source: 'ip',
  }
}

export function useLocation(externalLocation: LocationState | null = null) {
  const [location, setLocation] = useState<LocationState | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const requestIdRef = useRef(0)
  const mountedRef = useRef(true)

  useEffect(() => {
    mountedRef.current = true

    return () => {
      mountedRef.current = false
    }
  }, [])

  useEffect(() => {
    if (externalLocation) {
      requestIdRef.current += 1
      setLocation(externalLocation)
      setError(null)
      setLoading(false)
    }
  }, [externalLocation])

  const runDetection = useCallback(async () => {
    if (externalLocation) {
      return
    }

    const requestId = ++requestIdRef.current

    setLoading(true)
    setError(null)
    setLocation(null)

    const isLatestRequest = () => mountedRef.current && requestId === requestIdRef.current

    void detectByGps()
      .then((gpsLocation) => {
        if (isLatestRequest()) {
          setLocation(gpsLocation)
          setError(null)
          setLoading(false)
        }
      })
      .catch(() => {
        // Ignore GPS failures and keep the IP-based result.
      })

    try {
      const ipLocation = await detectByIp()

      if (isLatestRequest()) {
        setLocation(ipLocation)
        setLoading(false)
      }

      return
    } catch {
      if (isLatestRequest()) {
        setError(
          'Unable to detect your location. Please search for a city manually.',
        )
        setLoading(false)
      }
    }
  }, [externalLocation])

  useEffect(() => {
    void runDetection()
  }, [runDetection])

  return {
    location,
    loading,
    error,
    refetch: runDetection,
  }
}