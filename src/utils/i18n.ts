const sw: Record<string, string> = {
  'sunny': 'Jua Kali',
  'clear': 'Anga Safi',
  'partly cloudy': 'Mawingu Kidogo',
  'cloudy': 'Mawingu',
  'overcast': 'Mawingu Mazito',
  'rain': 'Mvua',
  'drizzle': 'Mvua Nyepesi',
  'shower': 'Mvua ya Muda',
  'thunderstorm': 'Radi na Mvua',
  'fog': 'Ukungu',
  'mist': 'Ukungu Mwepesi',
  'haze': 'Ukungu',
  'snow': 'Theluji',
  'wind': 'Upepo Mkali',
  'weather': 'Hali ya Hewa',
}

export function translateCondition(condition: string, lang: 'en' | 'sw'): string {
  if (lang === 'en') return condition

  const key = Object.keys(sw).find((k) =>
    condition.toLowerCase().includes(k)
  )

  return key ? sw[key] : condition
}
