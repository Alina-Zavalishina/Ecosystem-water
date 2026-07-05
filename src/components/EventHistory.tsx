import { useEffect, useState } from 'react'
import { EVENT_COLORS, EVENT_LABELS } from '../models/EventType'
import { EventLogger } from '../utils/EventLogger'
import type { SimulationEvent } from '../types'

export function EventHistory() {
  const logger = EventLogger.getInstance()
  const [events, setEvents] = useState<SimulationEvent[]>(() =>
    logger.getRecent(60),
  )

  useEffect(() => {
    const unsub = logger.subscribe((e) => {
      setEvents((prev) => [...prev, e].slice(-80))
    })
    return unsub
  }, [logger])

  const shown = [...events].reverse()

  return (
    <div className="panel event-panel">
      <h3 className="panel-title">Журнал событий</h3>
      <div className="event-list">
        {shown.length === 0 ? (
          <div className="event-empty">Событий пока нет</div>
        ) : (
          shown.map((e) => (
            <div className="event-item" key={e.id}>
              <span
                className="event-dot"
                style={{ background: EVENT_COLORS[e.type] }}
              />
              <span className="event-type">{EVENT_LABELS[e.type]}</span>
              <span className="event-msg">{e.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
