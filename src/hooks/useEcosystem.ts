import { useCallback, useEffect, useRef, useState } from 'react'
import { Lake } from '../models/Lake'
import { SIMULATION } from '../utils/Constants'
import type { EcosystemSnapshot, OrganismType, WeatherData } from '../types'

export interface UseEcosystem {
  lake: Lake
  snapshot: EcosystemSnapshot
  isRunning: boolean
  speed: number
  autoSeason: boolean
  play: () => void
  pause: () => void
  toggle: () => void
  reset: () => void
  setSpeed: (n: number) => void
  stepOnce: () => void
  addOrganisms: (type: OrganismType, count: number) => void
  setWeather: (data: Partial<WeatherData>) => void
  setAutoSeason: (v: boolean) => void
}

export function useEcosystem(width: number, height: number): UseEcosystem {
  const lakeRef = useRef<Lake | null>(null)
  if (lakeRef.current === null) {
    lakeRef.current = new Lake(width, height)
  }
  const lake = lakeRef.current

  const [snapshot, setSnapshot] = useState<EcosystemSnapshot>(() => lake.getSnapshot())
  const [isRunning, setRunning] = useState(false)
  const [speed, setSpeedState] = useState(1)
  const [autoSeason, setAutoSeasonState] = useState(false)

  useEffect(() => {
    lake.setAutoSeason(autoSeason)
  }, [autoSeason, lake])

  useEffect(() => {
    if (!isRunning) return
    const intervalMs = 1000 / SIMULATION.TICKS_PER_SECOND
    const id = window.setInterval(() => {
      for (let i = 0; i < speed; i++) lake.step()
      setSnapshot(lake.getSnapshot())
    }, intervalMs)
    return () => window.clearInterval(id)
  }, [isRunning, speed, lake])

  const refresh = useCallback(() => setSnapshot(lake.getSnapshot()), [lake])

  const play = useCallback(() => setRunning(true), [])
  const pause = useCallback(() => setRunning(false), [])
  const toggle = useCallback(() => setRunning((r) => !r), [])
  const reset = useCallback(() => {
    lake.reset()
    refresh()
  }, [lake, refresh])
  const setSpeed = useCallback((n: number) => setSpeedState(n), [])
  const stepOnce = useCallback(() => {
    lake.step()
    refresh()
  }, [lake, refresh])
  const addOrganisms = useCallback(
    (type: OrganismType, count: number) => {
      lake.addOrganisms(type, count)
      refresh()
    },
    [lake, refresh],
  )
  const setWeather = useCallback(
    (data: Partial<WeatherData>) => {
      lake.setWeather(data)
      refresh()
    },
    [lake, refresh],
  )
  const setAutoSeason = useCallback((v: boolean) => setAutoSeasonState(v), [])

  return {
    lake,
    snapshot,
    isRunning,
    speed,
    autoSeason,
    play,
    pause,
    toggle,
    reset,
    setSpeed,
    stepOnce,
    addOrganisms,
    setWeather,
    setAutoSeason,
  }
}
