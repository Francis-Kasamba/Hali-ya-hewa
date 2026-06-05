import axios from 'axios'
import type {
  GeoWeatherResponse,
  HourlySlot,
  WeatherApiDaily,
  WeatherApiHourly,
  WeatherApiResponse,
  WeatherResponse,
  ForecastDay,
} from '../types/weather'

const weatherApiKey = import.meta.env.VITE_WEATHERAI_KEY as string | undefined

export const weatherApi = axios.create({
  baseURL: '/api',
  timeout: 5000,
  headers: {
    Authorization: `Bearer ${weatherApiKey ?? ''}`,
  },
})

function getWeatherApiError(error: unknown): Error {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status

    if (status === 401) {
      return new Error('Invalid API key — check your .env file')
    }

    if (status === 429) {
      return new Error('API quota exceeded — try again later')
    }
  }

  return new Error('Weather data unavailable — please try again')
}

function describeCondition(icon: string): string {
  const fileName = icon.split('/').pop()?.replace(/\.[^.]+$/, '') ?? ''
  const words = fileName
    .replace(/^\d+_/, '')
    .replace(/_(day|night)$/i, '')
    .replace(/_/g, ' ')
    .trim()

  return words || 'Weather'
}

function formatRegion(timezone: string): string {
  const parts = timezone.split('/')
  const region = parts[parts.length - 1] ?? ''

  return region.replace(/_/g, ' ')
}

function findClosestHourlySlot(
  currentTime: string,
  hourly: WeatherApiHourly[],
): WeatherApiHourly | undefined {
  const currentDate = new Date(currentTime)

  if (Number.isNaN(currentDate.getTime())) {
    return hourly[0]
  }

  return hourly.reduce<WeatherApiHourly | undefined>((closest, slot) => {
    if (!closest) {
      return slot
    }

    const slotDistance = Math.abs(new Date(slot.time).getTime() - currentDate.getTime())
    const closestDistance = Math.abs(new Date(closest.time).getTime() - currentDate.getTime())

    return slotDistance < closestDistance ? slot : closest
  }, undefined)
}

function mapHourlySlot(slot: WeatherApiHourly): HourlySlot {
  return {
    time: slot.time,
    temp_c: slot.temperature,
    condition: describeCondition(slot.icon),
    icon: slot.icon,
    wind_kph: slot.wind_speed,
    humidity: slot.humidity,
    chance_of_rain: slot.precipitation_probability,
  }
}

function mapForecastDay(day: WeatherApiDaily): ForecastDay {
  return {
    date: day.date,
    max_temp_c: day.temp_max,
    min_temp_c: day.temp_min,
    condition: describeCondition(day.icon),
    icon: day.icon,
    chance_of_rain: day.precipitation_probability,
    hourly: [],
  }
}

function mapWeatherResponse(response: WeatherApiResponse & { ai_summary?: string }): WeatherResponse {
  const closestHourly = findClosestHourlySlot(response.current.time, response.hourly)

  return {
    location: {
      name: '',
      region: formatRegion(response.location.timezone),
      country: response.location.country,
      lat: response.location.lat,
      lon: response.location.lon,
      localtime: response.current.time,
    },
    current: {
      temp_c: response.current.temperature,
      feels_like_c: closestHourly?.feels_like ?? response.current.temperature,
      humidity: closestHourly?.humidity ?? 0,
      wind_kph: response.current.wind_speed,
      condition: describeCondition(response.current.icon),
      icon: response.current.icon,
      uv_index: closestHourly?.uv_index ?? 0,
      last_updated: response.current.time,
    },
    hourly: response.hourly.map(mapHourlySlot),
    daily: response.daily.map(mapForecastDay),
    ai_summary: response.ai_summary,
  }
}

async function requestWeather<T>(
  path: string,
  params: Record<string, string | number>,
): Promise<T> {
  try {
    const response = await weatherApi.get<T>(path, { params })
    return response.data
  } catch (error) {
    throw getWeatherApiError(error)
  }
}

export async function getWeatherByCoords(
  lat: number,
  lon: number,
  days = 7,
  lang = 'en',
): Promise<WeatherResponse> {
  const response = await requestWeather<WeatherApiResponse>('/v1/weather', {
    lat,
    lon,
    days,
    lang,
    units: 'metric',
  })

  return mapWeatherResponse(response)
}

export async function getCurrentWeather(
  lat: number,
  lon: number,
  lang = 'en',
): Promise<WeatherResponse> {
  const response = await requestWeather<WeatherApiResponse>('/v1/current', {
    lat,
    lon,
    lang,
    units: 'metric',
  })

  return mapWeatherResponse(response)
}

export async function getHourlyForecast(
  lat: number,
  lon: number,
  lang = 'en',
): Promise<WeatherResponse> {
  const response = await requestWeather<WeatherApiResponse>('/v1/hourly', {
    lat,
    lon,
    lang,
    units: 'metric',
  })

  return mapWeatherResponse(response)
}

export async function getWeatherByIP(lang = 'en'): Promise<GeoWeatherResponse & { _cityHeader?: string }> {
  try {
    const response = await weatherApi.get<GeoWeatherResponse>('/v1/weather-geo', {
      params: { ip: 'auto', ai: 'false', lang, units: 'metric' },
    })
    const cityHeader = (response.headers['x-city'] as string | undefined) ?? undefined
    return { ...response.data, _cityHeader: cityHeader }
  } catch (error) {
    throw getWeatherApiError(error)
  }
}