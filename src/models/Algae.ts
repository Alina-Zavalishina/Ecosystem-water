import { Organism, type SpeciesDefinition, type Vector2 } from '../types'

export class Algae extends Organism {
  static readonly definition: SpeciesDefinition = {
    species: 'Водоросли',
    type: 'algae',
    trophic: 'producer',
    color: '#4caf50',
    size: 3.5,
    maxEnergy: 100,
    maxAge: 500,
    reproductionThreshold: 62,
    reproductionRate: 0.11,
    metabolism: 0.3,
    speed: 0.3,
    diet: [],
    dietEnergy: 0,
    initialPopulation: 100,
    populationCap: 150,
    shape: 'blob',
  }

  constructor(position: Vector2, birthTick: number, energy?: number) {
    super(Algae.definition, position, birthTick, energy)
  }
}
