import { useEcosystem } from './hooks/useEcosystem'
import { useLakeData } from './hooks/useLakeData'
import { EcosystemCanvas } from './components/EcosystemCanvas'
import { SimulationControls } from './components/SimulationControls'
import { StatisticsDashboard } from './components/StatisticsDashboard'
import { EventHistory } from './components/EventHistory'
import { WeatherControls } from './components/WeatherControls'
import { SpeciesLegend } from './components/SpeciesLegend'
import { SEASON_EMOJI, SEASON_LABELS, SIMULATION } from './utils/Constants'

export default function App() {
  const eco = useEcosystem(SIMULATION.CANVAS_WIDTH, SIMULATION.CANVAS_HEIGHT)
  const lakeData = useLakeData(eco.lake, eco.snapshot)
  const w = eco.lake.weather
  const stats = eco.snapshot.stats

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-titles">
          <h1>🪷 Экосистема водоёма</h1>
          <p className="subtitle">
            Живая симуляция пищевых цепей, размножения и динамики популяций
          </p>
        </div>
        <div className="header-stats">
          <span className="badge">
            {SEASON_EMOJI[w.season]} {SEASON_LABELS[w.season]}
          </span>
          <span className="badge">{Math.round(w.temperature)}°C</span>
          <span className={`badge ${eco.isRunning ? 'live' : 'paused'}`}>
            {eco.isRunning ? '● LIVE' : '⏸ ПАУЗА'}
          </span>
        </div>
      </header>

      <main className="layout">
        <section className="canvas-section">
          <div className="canvas-wrap">
            <EcosystemCanvas
              lake={eco.lake}
              width={SIMULATION.CANVAS_WIDTH}
              height={SIMULATION.CANVAS_HEIGHT}
            />
          </div>
          <p className="canvas-footer">
            Цвет воды, солнце и дождь отражают текущую погоду. Температура и свет
            управляют фотосинтезом водорослей, метаболизмом и размножением. Следи,
            как хищники и жертвы проходят циклы роста и спада.
          </p>
        </section>

        <aside className="side-panel">
          <SimulationControls eco={eco} />
          <WeatherControls eco={eco} />
        </aside>

        <section className="stats-section">
          <StatisticsDashboard stats={stats} />
        </section>

        <section className="legend-section">
          <SpeciesLegend lakeData={lakeData} />
        </section>

        <section className="event-section">
          <EventHistory />
        </section>
      </main>
    </div>
  )
}
