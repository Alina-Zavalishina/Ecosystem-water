import { Organism, type SpeciesDefinition, type Vector2 } from '../types'

export class Plankton extends Organism {
  static readonly definition: SpeciesDefinition = {
    species: 'Планктон',
    type: 'plankton',
    trophic: 'primary',
    color: '#4dd0e1',
    size: 2.8,
    maxEnergy: 80,
    maxAge: 340,
    reproductionThreshold: 42,
    reproductionRate: 0.15,
    metabolism: 0.3,
    speed: 0.7,
    diet: ['algae'],
    dietEnergy: 40,
    initialPopulation: 90,
    populationCap: 200,
    shape: 'dot',
  }

  constructor(position: Vector2, birthTick: number, energy?: number) {
    super(Plankton.definition, position, birthTick, energy)
  }
}
