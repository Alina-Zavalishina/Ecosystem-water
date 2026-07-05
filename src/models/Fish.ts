import { Organism, type SpeciesDefinition, type Vector2 } from '../types'

export class Fish extends Organism {
  static readonly definition: SpeciesDefinition = {
    species: 'Рыбы',
    type: 'fish',
    trophic: 'secondary',
    color: '#29b6f6',
    size: 9,
    maxEnergy: 140,
    maxAge: 650,
    reproductionThreshold: 66,
    reproductionRate: 0.04,
    metabolism: 1.0,
    speed: 1.9,
    diet: ['plankton', 'insect', 'amphibian'],
    dietEnergy: 46,
    initialPopulation: 26,
    populationCap: 70,
    shape: 'fish',
  }

  constructor(position: Vector2, birthTick: number, energy?: number) {
    super(Fish.definition, position, birthTick, energy)
  }
}
