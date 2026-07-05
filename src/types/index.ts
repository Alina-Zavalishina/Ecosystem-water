import type { EventType } from '../models/EventType'
import { clamp } from '../utils/MathUtils'

export interface Vector2 {
  x: number
  y: number
}

export type OrganismType =
  | 'algae'
  | 'plankton'
  | 'insect'
  | 'fish'
  | 'amphibian'
  | 'reptile'

export type TrophicLevel = 'producer' | 'primary' | 'secondary' | 'tertiary'

export type Season = 'spring' | 'summer' | 'autumn' | 'winter'

export type OrganismShape = 'blob' | 'dot' | 'bug' | 'fish' | 'frog' | 'snake'

export type Trend = 'rising' | 'falling' | 'stable' | 'extinct'

export interface SpeciesDefinition {
  species: string
  type: OrganismType
  trophic: TrophicLevel
  color: string
  size: number
  maxEnergy: number
  maxAge: number
  reproductionThreshold: number
  reproductionRate: number
  metabolism: number
  speed: number
  diet: OrganismType[]
  dietEnergy: number
  initialPopulation: number
  populationCap: number
  shape: OrganismShape
}

export interface IOrganism {
  id: string
  species: string
  type: OrganismType
  trophic: TrophicLevel
  position: Vector2
  velocity: Vector2
  energy: number
  age: number
  maxAge: number
  size: number
  color: string
  shape: OrganismShape
  alive: boolean
  birthTick: number
  reproductionCooldown: number
  def: SpeciesDefinition
  tick(metabolismFactor: number, photoFactor: number, bounds: Vector2, wind: number): void
  canReproduce(): boolean
  spendReproductionEnergy(): number
}

export interface WeatherData {
  temperature: number
  sunlight: number
  rainfall: number
  wind: number
  humidity: number
  season: Season
}

export interface PopulationRecord {
  tick: number
  counts: Record<string, number>
}

export interface EcosystemStats {
  tick: number
  totalOrganisms: number
  byType: Record<OrganismType, number>
  bySpecies: Record<string, number>
  births: number
  deaths: number
  predations: number
  biodiversityIndex: number
  totalBiomass: number
}

export interface SimulationEvent {
  id: string
  tick: number
  type: EventType
  message: string
  species?: string
  timestamp: number
}

export interface EcosystemSnapshot {
  organisms: ReadonlyArray<IOrganism>
  stats: EcosystemStats
  tick: number
}

let _organismId = 0

export abstract class Organism implements IOrganism {
  readonly id: string
  readonly def: SpeciesDefinition
  readonly species: string
  readonly type: OrganismType
  readonly trophic: TrophicLevel
  readonly color: string
  readonly shape: OrganismShape
  position: Vector2
  velocity: Vector2
  energy: number
  age = 0
  readonly maxAge: number
  readonly size: number
  alive = true
  birthTick: number
  reproductionCooldown = 0

  constructor(
    def: SpeciesDefinition,
    position: Vector2,
    birthTick: number,
    energy?: number,
  ) {
    _organismId += 1
    this.id = `org-${_organismId}`
    this.def = def
    this.species = def.species
    this.type = def.type
    this.trophic = def.trophic
    this.color = def.color
    this.shape = def.shape
    this.position = { ...position }
    this.velocity = { x: 0, y: 0 }
    this.maxAge = def.maxAge
    this.size = def.size
    this.birthTick = birthTick
    this.energy = energy ?? def.maxEnergy * 0.7
  }

  tick(
    metabolismFactor: number,
    photoFactor: number,
    bounds: Vector2,
    wind: number,
  ): void {
    this.age += 1
    this.energy -= this.def.metabolism * metabolismFactor

    if (this.def.trophic === 'producer') {
      this.energy += photoFactor
    }

    if (this.reproductionCooldown > 0) this.reproductionCooldown -= 1

    this.move(bounds, wind)
    this.energy = clamp(this.energy, 0, this.def.maxEnergy)
  }

  protected move(bounds: Vector2, wind: number): void {
    const speed = this.def.speed
    this.velocity.x += (Math.random() - 0.5) * speed * 0.5
    this.velocity.y += (Math.random() - 0.5) * speed * 0.5

    const driftFactor = this.def.trophic === 'producer' ? 1 : 0.25
    this.velocity.x += (wind * 0.001) * driftFactor

    const m = Math.hypot(this.velocity.x, this.velocity.y)
    if (m > speed && m > 0) {
      this.velocity.x = (this.velocity.x / m) * speed
      this.velocity.y = (this.velocity.y / m) * speed
    }

    this.position.x += this.velocity.x
    this.position.y += this.velocity.y

    const margin = this.size
    if (this.position.x < margin) {
      this.position.x = margin
      this.velocity.x = Math.abs(this.velocity.x)
    } else if (this.position.x > bounds.x - margin) {
      this.position.x = bounds.x - margin
      this.velocity.x = -Math.abs(this.velocity.x)
    }
    if (this.position.y < margin) {
      this.position.y = margin
      this.velocity.y = Math.abs(this.velocity.y)
    } else if (this.position.y > bounds.y - margin) {
      this.position.y = bounds.y - margin
      this.velocity.y = -Math.abs(this.velocity.y)
    }
  }

  canReproduce(): boolean {
    return (
      this.energy >= this.def.reproductionThreshold &&
      this.reproductionCooldown <= 0
    )
  }

  spendReproductionEnergy(): number {
    const cost = this.def.reproductionThreshold * 0.4
    this.energy -= cost
    this.reproductionCooldown = 25
    return this.def.maxEnergy * 0.45
  }
}
