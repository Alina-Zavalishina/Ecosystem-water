import type { EcosystemStats } from '../types'

interface Props {
  stats: EcosystemStats
}

export function StatisticsDashboard({ stats }: Props) {
  return (
    <div className="panel">
      <h3 className="panel-title">Статистика экосистемы</h3>

      <div className="stat-grid">
        <Stat label="Всего особей" value={stats.totalOrganisms} accent="#4fc3f7" />
        <Stat label="Рождений" value={stats.births} accent="#66bb6a" />
        <Stat label="Гибелей" value={stats.deaths} accent="#ef5350" />
        <Stat label="Съедено" value={stats.predations} accent="#ff7043" />
        <Stat label="Биомасса" value={Math.round(stats.totalBiomass)} accent="#ab47bc" />
        <Stat
          label="Индекс Шеннона"
          value={stats.biodiversityIndex.toFixed(2)}
          accent="#26a69a"
        />
      </div>
    </div>
  )
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string
  value: number | string
  accent: string
}) {
  return (
    <div className="stat-card" style={{ borderLeftColor: accent }}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}
