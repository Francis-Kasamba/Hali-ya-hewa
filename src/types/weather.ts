export interface HourlySlot {
  time: string
  temp_c: number
  condition: string
  icon: string
  wind_kph: number
  humidity: number
  chance_of_rain: number
}

export interface ForecastDay {
  date: string
  max_temp_c: number
  min_temp_c: number
  condition: string
  icon: string
  chance_of_rain: number
  hourly: HourlySlot[]
}

export interface CurrentWeather {
  temp_c: number
  feels_like_c: number
  humidity: number
  wind_kph: number
  condition: string
  icon: string
  uv_index: number
  last_updated: string
}

export interface WeatherApiCurrent {
  time: string
  temperature: number
  wind_speed: number
  wind_direction: number
  condition_code: string
  icon: string
  icon_path: string
}

export interface WeatherApiHourly {
  time: string
  temperature: number
  precipitation_probability: number
  wind_speed: number
  condition_code: string
  icon: string
  humidity: number
  feels_like: number
  wind_gust: number
  uv_index: number
  icon_path: string
}

export interface WeatherApiDaily {
  date: string
  temp_min: number
  temp_max: number
  precipitation_sum: number
  sunrise: string
  sunset: string
  condition_code: string
  icon: string
  precipitation_probability: number
  wind_max: number
  icon_path: string
}

export interface WeatherApiResponse {
  location: {
    lat: number
    lon: number
    timezone: string
    requested_lat: number
    requested_lon: number
    country: string
  }
  current: WeatherApiCurrent
  hourly: WeatherApiHourly[]
  daily: WeatherApiDaily[]
  client_geo?: {
    country?: string
    ip_hash?: string
  }
}

export interface WeatherResponse {
  location: {
    name: string
    region: string
    country: string
    lat: number
    lon: number
    localtime: string
  }
  current: CurrentWeather
  hourly: HourlySlot[]
  daily: ForecastDay[]
  ai_summary?: string
}

export interface GeoWeatherResponse extends WeatherResponse {
  client_geo: {
    ip: string
    city: string
    region: string
    country: string
    lat: number
    lon: number
    timezone: string
  }
}

export interface LocationState {
  lat: number
  lon: number
  city: string
  source: 'gps' | 'ip' | 'search'
}