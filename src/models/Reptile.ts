import { Organism, type SpeciesDefinition, type Vector2 } from '../types'

export class Reptile extends Organism {
  static readonly definition: SpeciesDefinition = {
    species: 'Пресмыкающиеся',
    type: 'reptile',
    trophic: 'tertiary',
    color: '#ab47bc',
    size: 14,
    maxEnergy: 180,
    maxAge: 900,
    reproductionThreshold: 74,
    reproductionRate: 0.022,
    metabolism: 0.9,
    speed: 1.1,
    diet: ['fish', 'amphibian'],
    dietEnergy: 60,
    initialPopulation: 8,
    populationCap: 22,
    shape: 'snake',
  }

  constructor(position: Vector2, birthTick: number, energy?: number) {
    super(Reptile.definition, position, birthTick, energy)
  }
}
