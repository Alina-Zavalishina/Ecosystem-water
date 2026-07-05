import { Lake } from '../models/Lake'
import type { UseEcosystem } from '../hooks/useEcosystem'
import { SIMULATION } from '../utils/Constants'

interface Props {
  eco: UseEcosystem
}

export function SimulationControls({ eco }: Props) {
  return (
    <div className="panel">
      <h3 className="panel-title">Управление</h3>

      <div className="control-row">
        <button
          className={eco.isRunning ? 'btn btn-warn' : 'btn btn-primary'}
          onClick={eco.toggle}
        >
          {eco.isRunning ? '⏸ Пауза' : '▶ Запуск'}
        </button>
        <button
          className="btn"
          onClick={eco.stepOnce}
          disabled={eco.isRunning}
          title="Один шаг симуляции"
        >
          ⏭ Шаг
        </button>
        <button className="btn btn-danger" onClick={eco.reset}>
          ↺ Сброс
        </button>
      </div>

      <div className="control-group">
        <label className="control-label">
          Скорость: <strong>{eco.speed}×</strong>
        </label>
        <input
          type="range"
          min={1}
          max={SIMULATION.MAX_SPEED}
          step={1}
          value={eco.speed}
          onChange={(e) => eco.setSpeed(Number(e.target.value))}
        />
      </div>

      <div className="control-group">
        <label className="control-label">Выпустить животных</label>
        <div className="add-grid">
          {Lake.DEFINITIONS.map((def) => (
            <button
              key={def.type}
              className="add-btn"
              style={{ borderColor: def.color }}
              onClick={() => eco.addOrganisms(def.type, 12)}
            >
              <span className="swatch" style={{ background: def.color }} />
              +12
            </button>
          ))}
        </div>
      </div>

      <label className="checkbox-row">
        <input
          type="checkbox"
          checked={eco.autoSeason}
          onChange={(e) => eco.setAutoSeason(e.target.checked)}
        />
        Автосмена сезонов
      </label>
    </div>
  )
}
