import type { IOrganism, PopulationRecord, Trend } from '../types'
import { UI } from '../utils/Constants'

export class PopulationDynamics {
  history: PopulationRecord[] = []
  private speciesList: string[] = []
  private prevCounts: Record<string, number> = {}

  record(tick: number, organisms: ReadonlyArray<IOrganism>): void {
    const counts: Record<string, number> = {}
    for (const sp of this.speciesList) counts[sp] = 0

    for (const o of organisms) {
      counts[o.species] = (counts[o.species] ?? 0) + 1
      if (!this.speciesList.includes(o.species)) {
        this.speciesList.push(o.species)
      }
    }

    this.history.push({ tick, counts })
    if (this.history.length > UI.DYNAMICS_HISTORY_LENGTH) {
      this.history.shift()
    }
    this.prevCounts = { ...counts }
  }

  getSpeciesList(): string[] {
    return [...this.speciesList]
  }

  getCounts(): Record<string, number> {
    if (this.history.length === 0) return {}
    return { ...this.history[this.history.length - 1].counts }
  }

  getSeries(species: string): { tick: number; value: number }[] {
    return this.history.map((rec) => ({
      tick: rec.tick,
      value: rec.counts[species] ?? 0,
    }))
  }

  getTrend(species: string): Trend {
    const series = this.getSeries(species)
    if (series.length < 6) {
      return (this.prevCounts[species] ?? 0) === 0 ? 'extinct' : 'stable'
    }
    const recent = series.slice(-6)
    const current = recent[recent.length - 1].value
    if (current === 0) return 'extinct'
    const earlier = recent.slice(0, 3).reduce((s, p) => s + p.value, 0) / 3
    const later = recent.slice(-3).reduce((s, p) => s + p.value, 0) / 3
    if (earlier === 0) return later > 0 ? 'rising' : 'extinct'
    const ratio = later / earlier
    if (ratio > 1.15) return 'rising'
    if (ratio < 0.85) return 'falling'
    return 'stable'
  }

  getBiodiversityIndex(): number {
    const counts = this.getCounts()
    const values = Object.values(counts).filter((v) => v > 0)
    const total = values.reduce((s, v) => s + v, 0)
    if (total === 0 || values.length <= 1) return 0
    let h = 0
    for (const v of values) {
      const p = v / total
      h -= p * Math.log(p)
    }
    return h
  }

  getSpeciesRichness(): number {
    const counts = this.getCounts()
    return Object.values(counts).filter((v) => v > 0).length
  }

  reset(): void {
    this.history = []
    this.speciesList = []
    this.prevCounts = {}
  }
}
