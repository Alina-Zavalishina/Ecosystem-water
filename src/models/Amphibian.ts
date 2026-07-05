import { Organism, type SpeciesDefinition, type Vector2 } from '../types'

export class Amphibian extends Organism {
  static readonly definition: SpeciesDefinition = {
    species: 'Земноводные',
    type: 'amphibian',
    trophic: 'secondary',
    color: '#c0ca33',
    size: 7,
    maxEnergy: 120,
    maxAge: 520,
    reproductionThreshold: 60,
    reproductionRate: 0.055,
    metabolism: 0.85,
    speed: 1.0,
    diet: ['insect', 'plankton'],
    dietEnergy: 40,
    initialPopulation: 22,
    populationCap: 60,
    shape: 'frog',
  }

  constructor(position: Vector2, birthTick: number, energy?: number) {
    super(Amphibian.definition, position, birthTick, energy)
  }
}
