import type { Season, WeatherData } from '../types'
import { clamp } from '../utils/MathUtils'
import {
  SEASON_ORDER,
  SEASON_SUNLIGHT,
  SEASON_TEMPERATURES,
  WEATHER_LIMITS,
} from '../utils/Constants'

export class WeatherParameters {
  temperature: number
  sunlight: number
  rainfall: number
  wind: number
  humidity: number
  season: Season

  constructor(data?: Partial<WeatherData>) {
    const d = data ?? {}
    this.temperature = d.temperature ?? WEATHER_LIMITS.temperature.default
    this.sunlight = d.sunlight ?? WEATHER_LIMITS.sunlight.default
    this.rainfall = d.rainfall ?? WEATHER_LIMITS.rainfall.default
    this.wind = d.wind ?? WEATHER_LIMITS.wind.default
    this.humidity = d.humidity ?? WEATHER_LIMITS.humidity.default
    this.season = d.season ?? 'summer'
  }

  setFrom(data: Partial<WeatherData>): void {
    if (data.temperature !== undefined)
      this.temperature = clamp(
        data.temperature,
        WEATHER_LIMITS.temperature.min,
        WEATHER_LIMITS.temperature.max,
      )
    if (data.sunlight !== undefined)
      this.sunlight = clamp(
        data.sunlight,
        WEATHER_LIMITS.sunlight.min,
        WEATHER_LIMITS.sunlight.max,
      )
    if (data.rainfall !== undefined)
      this.rainfall = clamp(
        data.rainfall,
        WEATHER_LIMITS.rainfall.min,
        WEATHER_LIMITS.rainfall.max,
      )
    if (data.wind !== undefined)
      this.wind = clamp(data.wind, WEATHER_LIMITS.wind.min, WEATHER_LIMITS.wind.max)
    if (data.humidity !== undefined)
      this.humidity = clamp(
        data.humidity,
        WEATHER_LIMITS.humidity.min,
        WEATHER_LIMITS.humidity.max,
      )
    if (data.season !== undefined) this.season = data.season
  }

  getMetabolismFactor(): number {
    return clamp(0.4 + ((this.temperature + 10) / 50) * 1.5, 0.3, 2)
  }

  getPhotosynthesisFactor(): number {
    const light = this.sunlight / 100
    const rainPenalty = this.rainfall > 70 ? (100 - this.rainfall) / 30 : 1
    return light * 4 * rainPenalty
  }

  getReproductionFactor(): number {
    const tempComfort = 1 - Math.abs(this.temperature - 20) / 30
    const lightFactor = 0.4 + (this.sunlight / 100) * 0.6
    return clamp(tempComfort * lightFactor, 0.1, 1.4)
  }

  getMortalityFactor(): number {
    let factor = 0
    if (this.temperature < 0) factor += (0 - this.temperature) * 0.02
    if (this.temperature > 33) factor += (this.temperature - 33) * 0.03
    if (this.rainfall > 80) factor += (this.rainfall - 80) * 0.01
    if (this.sunlight < 15) factor += (15 - this.sunlight) * 0.01
    return factor
  }

  advanceSeason(): Season {
    const idx = SEASON_ORDER.indexOf(this.season)
    const next = SEASON_ORDER[(idx + 1) % SEASON_ORDER.length]
    this.season = next
    this.temperature = SEASON_TEMPERATURES[next]
    this.sunlight = SEASON_SUNLIGHT[next]
    return next
  }

  toData(): WeatherData {
    return {
      temperature: this.temperature,
      sunlight: this.sunlight,
      rainfall: this.rainfall,
      wind: this.wind,
      humidity: this.humidity,
      season: this.season,
    }
  }

  clone(): WeatherParameters {
    return new WeatherParameters(this.toData())
  }
}
