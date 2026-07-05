import { useMemo } from 'react'
import type { Lake } from '../models/Lake'
import type { EcosystemSnapshot, Trend } from '../types'

export interface SeriesPoint {
  tick: number
  value: number
}

export interface SpeciesSeries {
  species: string
  points: SeriesPoint[]
  current: number
  trend: Trend
}

export interface LakeData {
  series: SpeciesSeries[]
  speciesList: string[]
  counts: Record<string, number>
  biodiversityIndex: number
  speciesRichness: number
}

export function useLakeData(lake: Lake, snapshot: EcosystemSnapshot): LakeData {
  return useMemo(() => {
    const speciesList = lake.dynamics.getSpeciesList()
    const counts = lake.dynamics.getCounts()

    const series: SpeciesSeries[] = speciesList.map((species) => {
      const points = lake.dynamics.getSeries(species).map((p) => ({
        tick: p.tick,
        value: p.value,
      }))
      return {
        species,
        points,
        current: counts[species] ?? 0,
        trend: lake.dynamics.getTrend(species),
      }
    })

    return {
      series,
      speciesList,
      counts,
      biodiversityIndex: lake.dynamics.getBiodiversityIndex(),
      speciesRichness: lake.dynamics.getSpeciesRichness(),
    }
  }, [lake, snapshot.tick])
}
