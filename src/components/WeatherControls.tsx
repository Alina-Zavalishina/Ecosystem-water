import type { UseEcosystem } from '../hooks/useEcosystem'
import { SEASON_EMOJI, SEASON_LABELS, SEASON_ORDER, WEATHER_LIMITS } from '../utils/Constants'
import type { Season } from '../types'

interface Props {
  eco: UseEcosystem
}

export function WeatherControls({ eco }: Props) {
  const w = eco.lake.weather

  return (
    <div className="panel">
      <h3 className="panel-title">Погода</h3>

      <div className="season-row">
        {SEASON_ORDER.map((s: Season) => (
          <button
            key={s}
            className={w.season === s ? 'season-btn active' : 'season-btn'}
            onClick={() => eco.setWeather({ season: s })}
          >
            {SEASON_EMOJI[s]}
            <span>{SEASON_LABELS[s]}</span>
          </button>
        ))}
      </div>

      <Slider
        label="Температура"
        value={w.temperature}
        min={WEATHER_LIMITS.temperature.min}
        max={WEATHER_LIMITS.temperature.max}
        suffix="°C"
        onChange={(v) => eco.setWeather({ temperature: v })}
      />
      <Slider
        label="Солнце"
        value={w.sunlight}
        min={WEATHER_LIMITS.sunlight.min}
        max={WEATHER_LIMITS.sunlight.max}
        suffix="%"
        onChange={(v) => eco.setWeather({ sunlight: v })}
      />
      <Slider
        label="Дождь"
        value={w.rainfall}
        min={WEATHER_LIMITS.rainfall.min}
        max={WEATHER_LIMITS.rainfall.max}
        suffix="%"
        onChange={(v) => eco.setWeather({ rainfall: v })}
      />
      <Slider
        label="Ветер"
        value={w.wind}
        min={WEATHER_LIMITS.wind.min}
        max={WEATHER_LIMITS.wind.max}
        suffix="%"
        onChange={(v) => eco.setWeather({ wind: v })}
      />
    </div>
  )
}

function Slider({
  label,
  value,
  min,
  max,
  suffix,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  suffix: string
  onChange: (v: number) => void
}) {
  return (
    <div className="control-group">
      <label className="control-label">
        {label}: <strong>{Math.round(value)}{suffix}</strong>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  )
}
