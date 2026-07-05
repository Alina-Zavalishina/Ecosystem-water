import type { Season } from '../types'

export const SIMULATION = {
  TICKS_PER_SECOND: 8,
  CANVAS_WIDTH: 960,
  CANVAS_HEIGHT: 600,
  MAX_SPEED: 8,
} as const

export const ECOLOGY = {
  EAT_DISTANCE: 5,
  REPRODUCTION_COOLDOWN: 25,
  PERCEPTION_FACTOR: 7,
  PRODUCER_PHOTOSYNTHESIS_GAIN: 3.2,
  WEATHER_MORTALITY_BASE: 0.0006,
  OFFSPRING_ENERGY_RATIO: 0.45,
  REPRODUCTION_COST_RATIO: 0.4,
} as const

export const WEATHER_LIMITS = {
  temperature: { min: -10, max: 40, default: 22 },
  sunlight: { min: 0, max: 100, default: 70 },
  rainfall: { min: 0, max: 100, default: 15 },
  wind: { min: 0, max: 100, default: 12 },
  humidity: { min: 10, max: 100, default: 55 },
} as const

export const SEASON_TEMPERATURES: Record<Season, number> = {
  spring: 14,
  summer: 24,
  autumn: 9,
  winter: 1,
}

export const SEASON_SUNLIGHT: Record<Season, number> = {
  spring: 65,
  summer: 88,
  autumn: 40,
  winter: 20,
}

export const SEASON_ORDER: Season[] = ['spring', 'summer', 'autumn', 'winter']

export const SEASON_LABELS: Record<Season, string> = {
  spring: 'Весна',
  summer: 'Лето',
  autumn: 'Осень',
  winter: 'Зима',
}

export const SEASON_EMOJI: Record<Season, string> = {
  spring: '🌱',
  summer: '☀️',
  autumn: '🍂',
  winter: '❄️',
}

export const UI = {
  EVENT_LOG_MAX: 120,
  DYNAMICS_HISTORY_LENGTH: 240,
  TICKS_PER_SEASON: 80,
} as const
