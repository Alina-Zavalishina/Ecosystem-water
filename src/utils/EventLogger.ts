import { EventType } from '../models/EventType'
import type { SimulationEvent } from '../types'
import { UI } from './Constants'
import { nextId } from './MathUtils'

type Listener = (event: SimulationEvent) => void

export class EventLogger {
  private static instance: EventLogger | null = null

  private events: SimulationEvent[] = []
  private listeners = new Set<Listener>()

  private constructor() {}

  static getInstance(): EventLogger {
    if (!EventLogger.instance) {
      EventLogger.instance = new EventLogger()
    }
    return EventLogger.instance
  }

  static reset(): void {
    const inst = EventLogger.getInstance()
    inst.events = []
    inst.listeners.clear()
  }

  log(
    type: EventType,
    message: string,
    tick: number,
    species?: string,
  ): void {
    const event: SimulationEvent = {
      id: nextId('evt'),
      tick,
      type,
      message,
      species,
      timestamp: Date.now(),
    }
    this.events.push(event)
    if (this.events.length > UI.EVENT_LOG_MAX) {
      this.events.splice(0, this.events.length - UI.EVENT_LOG_MAX)
    }
    this.listeners.forEach((fn) => fn(event))
  }

  getAll(): readonly SimulationEvent[] {
    return this.events
  }

  getRecent(n: number): SimulationEvent[] {
    return this.events.slice(-n)
  }

  subscribe(fn: Listener): () => void {
    this.listeners.add(fn)
    return () => {
      this.listeners.delete(fn)
    }
  }

  clear(): void {
    this.events = []
    this.listeners.forEach((fn) =>
      fn({
        id: nextId('evt'),
        tick: 0,
        type: EventType.SimulationReset,
        message: 'Журнал очищен',
        timestamp: Date.now(),
      }),
    )
  }
}
