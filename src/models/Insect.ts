import { Organism, type SpeciesDefinition, type Vector2 } from '../types'

export class Insect extends Organism {
  static readonly definition: SpeciesDefinition = {
    species: 'Насекомые',
    type: 'insect',
    trophic: 'primary',
    color: '#ffa726',
    size: 4.5,
    maxEnergy: 95,
    maxAge: 380,
    reproductionThreshold: 55,
    reproductionRate: 0.075,
    metabolism: 0.55,
    speed: 1.3,
    diet: ['algae', 'plankton'],
    dietEnergy: 38,
    initialPopulation: 25,
    populationCap: 70,
    shape: 'bug',
  }

  constructor(position: Vector2, birthTick: number, energy?: number) {
    super(Insect.definition, position, birthTick, energy)
  }
}
