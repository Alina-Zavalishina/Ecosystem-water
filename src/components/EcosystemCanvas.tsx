import { useEffect, useRef } from 'react'
import type { Lake } from '../models/Lake'
import type { IOrganism } from '../types'

interface Props {
  lake: Lake
  width: number
  height: number
}

interface RainDrop {
  x: number
  y: number
  len: number
  speed: number
}

const MAX_RAIN = 160

export function EcosystemCanvas({ lake, width, height }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rainRef = useRef<RainDrop[]>([])

  useEffect(() => {
    const drops: RainDrop[] = []
    for (let i = 0; i < MAX_RAIN; i++) {
      drops.push({
        x: Math.random() * width,
        y: Math.random() * height,
        len: 8 + Math.random() * 14,
        speed: 6 + Math.random() * 8,
      })
    }
    rainRef.current = drops
  }, [width, height])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.floor(width * dpr)
    canvas.height = Math.floor(height * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    let raf = 0

    const render = () => {
      const w = lake.weather
      const organisms = lake.organisms

      const grad = ctx.createLinearGradient(0, 0, 0, height)
      const lightness = 0.4 + (w.sunlight / 100) * 0.4
      const warmth = Math.max(0, Math.min(1, (w.temperature + 5) / 40))
      const r1 = Math.round(10 + warmth * 25)
      const g1 = Math.round(40 + lightness * 50 + warmth * 20)
      const b1 = Math.round(80 + lightness * 70)
      grad.addColorStop(0, `rgb(${r1 + 20},${g1 + 25},${b1 + 20})`)
      grad.addColorStop(0.5, `rgb(${r1},${g1},${b1})`)
      grad.addColorStop(1, `rgb(${Math.max(0, r1 - 12)},${Math.max(0, g1 - 25)},${Math.max(0, b1 - 30)})`)
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, width, height)

      if (w.sunlight > 40) {
        const glowAlpha = ((w.sunlight - 40) / 60) * 0.5
        const sun = ctx.createRadialGradient(
          width - 70,
          60,
          10,
          width - 70,
          60,
          180,
        )
        sun.addColorStop(0, `rgba(255,245,180,${glowAlpha})`)
        sun.addColorStop(1, 'rgba(255,245,180,0)')
        ctx.fillStyle = sun
        ctx.fillRect(0, 0, width, height)
      }

      for (const o of organisms) {
        if (o.alive) drawOrganism(ctx, o)
      }

      if (w.rainfall > 5) {
        drawRain(ctx, rainRef.current, width, height, w.rainfall, w.wind)
      }

      if (w.temperature < 3) {
        ctx.fillStyle = 'rgba(220,240,255,0.05)'
        ctx.fillRect(0, 0, width, height)
      }

      raf = requestAnimationFrame(render)
    }

    raf = requestAnimationFrame(render)
    return () => cancelAnimationFrame(raf)
  }, [lake, width, height])

  return (
    <canvas
      ref={canvasRef}
      style={{ width, height, display: 'block', borderRadius: 10 }}
    />
  )
}

function drawOrganism(ctx: CanvasRenderingContext2D, o: IOrganism): void {
  const energyRatio = Math.max(0, Math.min(1, o.energy / o.def.maxEnergy))
  const alpha = 0.4 + energyRatio * 0.6
  const angle = Math.atan2(o.velocity.y, o.velocity.x)
  const moving = o.velocity.x * o.velocity.x + o.velocity.y * o.velocity.y > 0.01

  ctx.save()
  ctx.globalAlpha = alpha
  ctx.fillStyle = o.color
  ctx.translate(o.position.x, o.position.y)

  switch (o.shape) {
    case 'blob': {
      ctx.beginPath()
      ctx.arc(0, 0, o.size, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = alpha * 0.4
      ctx.beginPath()
      ctx.arc(o.size * 0.4, -o.size * 0.4, o.size * 0.6, 0, Math.PI * 2)
      ctx.fill()
      break
    }
    case 'dot': {
      ctx.beginPath()
      ctx.arc(0, 0, o.size, 0, Math.PI * 2)
      ctx.fill()
      break
    }
    case 'bug': {
      if (moving) ctx.rotate(angle)
      ctx.beginPath()
      ctx.ellipse(0, 0, o.size, o.size * 0.65, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = alpha * 0.5
      ctx.strokeStyle = o.color
      ctx.lineWidth = 0.8
      for (const s of [-1, 1]) {
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(o.size * s, -o.size * 1.4)
        ctx.moveTo(0, 0)
        ctx.lineTo(o.size * s, o.size * 1.4)
        ctx.stroke()
      }
      break
    }
    case 'fish': {
      if (moving) ctx.rotate(angle)
      ctx.beginPath()
      ctx.ellipse(0, 0, o.size, o.size * 0.55, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.moveTo(-o.size, 0)
      ctx.lineTo(-o.size * 1.8, -o.size * 0.7)
      ctx.lineTo(-o.size * 1.8, o.size * 0.7)
      ctx.closePath()
      ctx.fill()
      break
    }
    case 'frog': {
      ctx.beginPath()
      ctx.ellipse(0, 0, o.size, o.size * 0.8, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.globalAlpha = alpha
      ctx.fillStyle = '#1b1b1b'
      ctx.beginPath()
      ctx.arc(o.size * 0.4, -o.size * 0.5, o.size * 0.18, 0, Math.PI * 2)
      ctx.arc(-o.size * 0.4, -o.size * 0.5, o.size * 0.18, 0, Math.PI * 2)
      ctx.fill()
      break
    }
    case 'snake': {
      if (moving) ctx.rotate(angle)
      ctx.beginPath()
      ctx.ellipse(0, 0, o.size, o.size * 0.35, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.beginPath()
      ctx.arc(o.size * 0.9, 0, o.size * 0.3, 0, Math.PI * 2)
      ctx.fill()
      break
    }
    default: {
      ctx.beginPath()
      ctx.arc(0, 0, o.size, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  ctx.restore()
}

function drawRain(
  ctx: CanvasRenderingContext2D,
  drops: RainDrop[],
  width: number,
  height: number,
  rainfall: number,
  wind: number,
): void {
  const active = Math.floor((rainfall / 100) * MAX_RAIN)
  const slant = (wind / 100) * 6
  ctx.strokeStyle = 'rgba(180,210,235,0.4)'
  ctx.lineWidth = 1

  for (let i = 0; i < active; i++) {
    const d = drops[i]
    ctx.beginPath()
    ctx.moveTo(d.x, d.y)
    ctx.lineTo(d.x + slant, d.y + d.len)
    ctx.stroke()

    d.y += d.speed
    d.x += slant * 0.3
    if (d.y > height) {
      d.y = -d.len
      d.x = Math.random() * width
    }
    if (d.x > width) d.x = 0
    if (d.x < 0) d.x = width
  }
}
