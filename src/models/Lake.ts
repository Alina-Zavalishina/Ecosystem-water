import type {
  EcosystemSnapshot,
  EcosystemStats,
  IOrganism,
  OrganismType,
  SpeciesDefinition,
  Vector2,
} from '../types'
import { Algae } from './Algae'
import { Amphibian } from './Amphibian'
import { EventType } from './EventType'
import { Fish } from './Fish'
import { Insect } from './Insect'
import { Plankton } from './Plankton'
import { Reptile } from './Reptile'
import { PopulationDynamics } from './PopulationDynamics'
import { WeatherParameters } from './WeatherParameters'
import { EventLogger } from '../utils/EventLogger'
import { ECOLOGY, SEASON_LABELS, UI } from '../utils/Constants'
import {
  chance,
  distance,
  distanceSq,
  randomPosition,
  randomRange,
  SpatialGrid,
} from '../utils/MathUtils'

type OrganismConstructor = new (
  position: Vector2,
  birthTick: number,
  energy?: number,
) => IOrganism

export class Lake {
  width: number
  height: number
  organisms: IOrganism[] = []
  weather: WeatherParameters
  dynamics: PopulationDynamics
  tick = 0
  autoSeason = false

  private logger = EventLogger.getInstance()
  private birthCount = 0
  private deathCount = 0
  private predationCount = 0
  private lastEventCounts: Record<string, number> = {}
  private collapsed = false

  private static readonly REGISTRY: Record<OrganismType, OrganismConstructor> = {
    algae: Algae,
    plankton: Plankton,
    insect: Insect,
    fish: Fish,
    amphibian: Amphibian,
    reptile: Reptile,
  }

  static readonly DEFINITIONS: SpeciesDefinition[] = [
    Algae.definition,
    Plankton.definition,
    Insect.definition,
    Amphibian.definition,
    Fish.definition,
    Reptile.definition,
  ]

  constructor(width: number, height: number) {
    this.width = width
    this.height = height
    this.weather = new WeatherParameters({ season: 'summer' })
    this.dynamics = new PopulationDynamics()
    this.initialize()
    this.logger.log(EventType.SimulationStart, 'Водоём создан, жизнь зарождается', this.tick)
  }

  private createOrganism(
    def: SpeciesDefinition,
    position: Vector2,
    tick: number,
    energy?: number,
  ): IOrganism {
    const Ctor = Lake.REGISTRY[def.type]
    return new Ctor(position, tick, energy)
  }

  private initialize(): void {
    for (const def of Lake.DEFINITIONS) {
      for (let i = 0; i < def.initialPopulation; i++) {
        const pos = randomPosition(this.width, this.height, 20)
        this.organisms.push(this.createOrganism(def, pos, 0))
      }
    }
    this.dynamics.record(0, this.organisms)
  }

  step(): void {
    this.tick += 1

    const bounds: Vector2 = { x: this.width, y: this.height }
    const metabolismFactor = this.weather.getMetabolismFactor()
    const photoFactor = this.weather.getPhotosynthesisFactor()
    const wind = this.weather.wind

    const grid = new SpatialGrid<IOrganism>(48)
    for (const o of this.organisms) {
      if (o.alive) grid.insert(o)
    }

    for (const o of this.organisms) {
      if (!o.alive) continue
      this.steer(o, grid)
      o.tick(metabolismFactor, photoFactor, bounds, wind)
    }

    this.handleFeeding(grid)
    this.handleReproduction()
    this.handleDeath()
    this.organisms = this.organisms.filter((o) => o.alive)

    this.dynamics.record(this.tick, this.organisms)

    if (this.tick % 6 === 0) this.detectEvents()

    if (this.autoSeason && this.tick % UI.TICKS_PER_SEASON === 0) {
      const next = this.weather.advanceSeason()
      this.logger.log(
        EventType.SeasonChange,
        `Смена сезона: ${SEASON_LABELS[next]}`,
        this.tick,
      )
    }
  }

  private steer(o: IOrganism, grid: SpatialGrid<IOrganism>): void {
    if (o.def.diet.length === 0) return
    const radius = Lake.searchRadius(o)
    const nearby = grid.queryNear(o.position, radius)
    let best: IOrganism | null = null
    let bestD = radius * radius

    for (const p of nearby) {
      if (p === o || !p.alive) continue
      if (!o.def.diet.includes(p.type)) continue
      const d = distanceSq(o.position, p.position)
      if (d < bestD) {
        bestD = d
        best = p
      }
    }

    if (best) {
      o.velocity.x += (best.position.x - o.position.x) * 0.015
      o.velocity.y += (best.position.y - o.position.y) * 0.015
    }
  }

  private static searchRadius(o: IOrganism): number {
    return 55 + o.size * 3
  }

  private handleFeeding(grid: SpatialGrid<IOrganism>): void {
    for (const predator of this.organisms) {
      if (!predator.alive || predator.def.diet.length === 0) continue
      const perception = predator.size * ECOLOGY.PERCEPTION_FACTOR
      const nearby = grid.queryNear(predator.position, perception)
      const reach = predator.size + ECOLOGY.EAT_DISTANCE

      for (const prey of nearby) {
        if (prey === predator || !prey.alive) continue
        if (!predator.def.diet.includes(prey.type)) continue
        if (distance(predator.position, prey.position) <= reach + prey.size) {
          prey.alive = false
          predator.energy = Math.min(
            predator.def.maxEnergy,
            predator.energy + predator.def.dietEnergy,
          )
          this.predationCount += 1
          break
        }
      }
    }
  }

  private handleReproduction(): void {
    const reproFactor = this.weather.getReproductionFactor()
    const counts: Record<string, number> = {}
    for (const o of this.organisms) {
      if (o.alive) counts[o.type] = (counts[o.type] ?? 0) + 1
    }

    const newborns: IOrganism[] = []
    for (const o of this.organisms) {
      if (!o.alive || !o.canReproduce()) continue
      if ((counts[o.type] ?? 0) >= o.def.populationCap) continue
      if (chance(o.def.reproductionRate * reproFactor)) {
        const offspringEnergy = o.spendReproductionEnergy()
        const childPos: Vector2 = {
          x: o.position.x + randomRange(-16, 16),
          y: o.position.y + randomRange(-16, 16),
        }
        const child = this.createOrganism(o.def, childPos, this.tick, offspringEnergy)
        newborns.push(child)
        counts[o.type] = (counts[o.type] ?? 0) + 1
        this.birthCount += 1
      }
    }

    if (newborns.length > 0) this.organisms.push(...newborns)
  }

  private handleDeath(): void {
    const mortFactor = this.weather.getMortalityFactor()
    for (const o of this.organisms) {
      if (!o.alive) continue
      let die = false
      if (o.energy <= 0) die = true
      else if (o.age >= o.def.maxAge) die = true
      else if (chance(ECOLOGY.WEATHER_MORTALITY_BASE * (1 + mortFactor))) die = true

      if (die) {
        o.alive = false
        this.deathCount += 1
      }
    }
  }

  private detectEvents(): void {
    const counts = this.dynamics.getCounts()

    for (const species of this.dynamics.getSpeciesList()) {
      const cur = counts[species] ?? 0
      const prev = this.lastEventCounts[species] ?? 0

      if (prev > 0 && cur === 0) {
        this.logger.log(
          EventType.Extinction,
          `Вид «${species}» полностью вымер`,
          this.tick,
          species,
        )
      } else if (prev === 0 && cur > 0) {
        this.logger.log(
          EventType.SpeciesInvasion,
          `Вид «${species}» вновь заселил водоём`,
          this.tick,
          species,
        )
      } else if (cur > prev * 2.2 && cur - prev > 8) {
        this.logger.log(
          EventType.PopulationBoom,
          `Всплеск популяции: ${species} (+${cur - prev})`,
          this.tick,
          species,
        )
      } else if (cur < prev * 0.45 && prev - cur > 8) {
        this.logger.log(
          EventType.PopulationCrash,
          `Крах популяции: ${species} (−${prev - cur})`,
          this.tick,
          species,
        )
      }

      this.lastEventCounts[species] = cur
    }

    const total = Object.values(counts).reduce((s, v) => s + v, 0)
    if (total === 0 && !this.collapsed) {
      this.collapsed = true
      this.logger.log(
        EventType.EcosystemCollapse,
        'Экосистема полностью разрушена — жизнь угасла',
        this.tick,
      )
    } else if (total > 0 && this.collapsed) {
      this.collapsed = false
      this.logger.log(
        EventType.EcosystemStable,
        'Жизнь в водоёме возрождается',
        this.tick,
      )
    }
  }

  getStats(): EcosystemStats {
    const byType: Record<OrganismType, number> = {
      algae: 0,
      plankton: 0,
      insect: 0,
      fish: 0,
      amphibian: 0,
      reptile: 0,
    }
    const bySpecies: Record<string, number> = {}
    let biomass = 0
    let total = 0

    for (const o of this.organisms) {
      if (!o.alive) continue
      byType[o.type] += 1
      bySpecies[o.species] = (bySpecies[o.species] ?? 0) + 1
      biomass += o.size * (o.energy / o.def.maxEnergy)
      total += 1
    }

    return {
      tick: this.tick,
      totalOrganisms: total,
      byType,
      bySpecies,
      births: this.birthCount,
      deaths: this.deathCount,
      predations: this.predationCount,
      biodiversityIndex: this.dynamics.getBiodiversityIndex(),
      totalBiomass: biomass,
    }
  }

  getSnapshot(): EcosystemSnapshot {
    return {
      organisms: this.organisms.filter((o) => o.alive),
      stats: this.getStats(),
      tick: this.tick,
    }
  }

  addOrganisms(type: OrganismType, count: number): void {
    const def = Lake.DEFINITIONS.find((d) => d.type === type)
    if (!def) return
    for (let i = 0; i < count; i++) {
      const pos = randomPosition(this.width, this.height, 20)
      this.organisms.push(this.createOrganism(def, pos, this.tick))
    }
    this.logger.log(
      EventType.SpeciesInvasion,
      `В водоём выпущено: ${def.species} ×${count}`,
      this.tick,
      def.species,
    )
  }

  setWeather(data: Partial<Parameters<WeatherParameters['setFrom']>[0]>): void {
    const before = this.weather.season
    this.weather.setFrom(data)
    if (data.season && data.season !== before) {
      this.logger.log(
        EventType.SeasonChange,
        `Установлен сезон: ${SEASON_LABELS[data.season]}`,
        this.tick,
      )
    } else if (data.temperature !== undefined) {
      this.logger.log(
        EventType.WeatherChange,
        `Температура: ${data.temperature}°C`,
        this.tick,
      )
    }
  }

  setAutoSeason(value: boolean): void {
    this.autoSeason = value
  }

  reset(): void {
    this.organisms = []
    this.tick = 0
    this.birthCount = 0
    this.deathCount = 0
    this.predationCount = 0
    this.collapsed = false
    this.lastEventCounts = {}
    this.weather = new WeatherParameters({ season: 'summer' })
    this.dynamics.reset()
    this.initialize()
    this.logger.log(EventType.SimulationReset, 'Симуляция сброшена к началу', this.tick)
  }
}
