type WeatherIconProps = {
  condition: string
  size?: 'sm' | 'md' | 'lg'
}

const ICONS: Array<{ match: RegExp; emoji: string }> = [
  { match: /sunny|clear/i, emoji: '☀️' },
  { match: /partly cloudy/i, emoji: '⛅' },
  { match: /cloudy|overcast/i, emoji: '☁️' },
  { match: /rain|drizzle|shower/i, emoji: '🌧️' },
  { match: /thunderstorm/i, emoji: '⛈️' },
  { match: /snow/i, emoji: '❄️' },
  { match: /fog|mist/i, emoji: '🌫️' },
  { match: /wind/i, emoji: '💨' },
]

const SIZE_CLASSES = {
  sm: 'text-2xl',
  md: 'text-4xl',
  lg: 'text-6xl',
} as const

export function WeatherIcon({ condition, size = 'md' }: WeatherIconProps) {
  const icon = ICONS.find(({ match }) => match.test(condition))?.emoji ?? '🌡️'

  return <span className={SIZE_CLASSES[size]} aria-hidden="true">{icon}</span>
}