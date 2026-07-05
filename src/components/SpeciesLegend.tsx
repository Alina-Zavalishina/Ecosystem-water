import { Lake } from '../models/Lake'
import type { LakeData } from '../hooks/useLakeData'
import type { Trend } from '../types'

interface Props {
  lakeData: LakeData
}

const TREND_ICON: Record<Trend, string> = {
  rising: '▲',
  falling: '▼',
  stable: '●',
  extinct: '✖',
}

const TREND_COLOR: Record<Trend, string> = {
  rising: '#66bb6a',
  falling: '#ef5350',
  stable: '#bdbdbd',
  extinct: '#b71c1c',
}

export function SpeciesLegend({ lakeData }: Props) {
  const rows = Lake.DEFINITIONS.map((def) => {
    const current = lakeData.counts[def.species] ?? 0
    const trend = lakeData.series.find((s) => s.species === def.species)?.trend ?? 'stable'
    return { def, current, trend }
  })

  return (
    <div className="panel">
      <h3 className="panel-title">Виды водоёма</h3>
      <div className="legend-list">
        {rows.map(({ def, current, trend }) => (
          <div className="legend-item" key={def.type}>
            <span className="swatch" style={{ background: def.color }} />
            <div className="legend-info">
              <span className="legend-name">{def.species}</span>
              <span className="legend-meta">
                {trophicLabel(def.trophic)} · лимит {def.populationCap}
              </span>
            </div>
            <span className="legend-count">{current}</span>
            <span
              className="legend-trend"
              style={{ color: TREND_COLOR[trend] }}
              title={trend}
            >
              {TREND_ICON[trend]}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function trophicLabel(t: string): string {
  switch (t) {
    case 'producer':
      return 'продуцент'
    case 'primary':
      return 'консумент I'
    case 'secondary':
      return 'консумент II'
    case 'tertiary':
      return 'хищник'
    default:
      return t
  }
}
