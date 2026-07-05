import type { Vector2 } from '../types'

export function clamp(value: number, min: number, max: number): number {
  if (value < min) return min
  if (value > max) return max
  return value
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

export function randomInt(min: number, max: number): number {
  return Math.floor(min + Math.random() * (max - min + 1))
}

export function distance(a: Vector2, b: Vector2): number {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.sqrt(dx * dx + dy * dy)
}

export function distanceSq(a: Vector2, b: Vector2): number {
  const dx = a.x - b.x
  const dy = a.y - b.y
  return dx * dx + dy * dy
}

export function magnitude(v: Vector2): number {
  return Math.sqrt(v.x * v.x + v.y * v.y)
}

export function normalize(v: Vector2): Vector2 {
  const m = magnitude(v)
  if (m === 0) return { x: 0, y: 0 }
  return { x: v.x / m, y: v.y / m }
}

export function limit(v: Vector2, max: number): Vector2 {
  const m = magnitude(v)
  if (m > max && m > 0) {
    return { x: (v.x / m) * max, y: (v.y / m) * max }
  }
  return v
}

export function angleBetween(a: Vector2, b: Vector2): number {
  return Math.atan2(b.y - a.y, b.x - a.x)
}

export function randomPosition(width: number, height: number, margin = 10): Vector2 {
  return {
    x: randomRange(margin, width - margin),
    y: randomRange(margin, height - margin),
  }
}

export function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function chance(p: number): boolean {
  return Math.random() < p
}

let _idCounter = 0
export function nextId(prefix = 'id'): string {
  _idCounter += 1
  return `${prefix}-${_idCounter}`
}

export function gaussian(mean = 0, stddev = 1): number {
  const u1 = Math.random() || 1e-9
  const u2 = Math.random()
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  return mean + z * stddev
}

export class SpatialGrid<T extends { position: Vector2 }> {
  private cells = new Map<string, T[]>()

  constructor(private cellSize: number) {}

  private key(x: number, y: number): string {
    const cx = Math.floor(x / this.cellSize)
    const cy = Math.floor(y / this.cellSize)
    return `${cx},${cy}`
  }

  insert(item: T): void {
    const k = this.key(item.position.x, item.position.y)
    let arr = this.cells.get(k)
    if (!arr) {
      arr = []
      this.cells.set(k, arr)
    }
    arr.push(item)
  }

  queryNear(pos: Vector2, radius: number): T[] {
    const result: T[] = []
    const span = Math.ceil(radius / this.cellSize)
    const cx = Math.floor(pos.x / this.cellSize)
    const cy = Math.floor(pos.y / this.cellSize)
    for (let dx = -span; dx <= span; dx++) {
      for (let dy = -span; dy <= span; dy++) {
        const arr = this.cells.get(`${cx + dx},${cy + dy}`)
        if (arr) {
          for (let i = 0; i < arr.length; i++) result.push(arr[i])
        }
      }
    }
    return result
  }

  clear(): void {
    this.cells.clear()
  }
}
