export class ColorGenerator {
  private hue = Math.floor(Math.random() * 360)

  nextColor(saturation = 65, lightness = 55): string {
    this.hue = (this.hue + 47) % 360
    return this.hsl(this.hue, saturation, lightness)
  }

  private hsl(h: number, s: number, l: number): string {
    return `hsl(${Math.round(h)}, ${s}%, ${l}%)`
  }

  static shade(hex: string, percent: number): string {
    const hsl = ColorGenerator.hexToHsl(hex)
    const newL = Math.max(0, Math.min(100, hsl.l + percent))
    return `hsl(${hsl.h}, ${hsl.s}%, ${newL}%)`
  }

  static withAlpha(hex: string, alpha: number): string {
    const hsl = ColorGenerator.hexToHsl(hex)
    return `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${alpha})`
  }

  private static hexToHsl(hex: string): { h: number; s: number; l: number } {
    let r = 0
    let g = 0
    let b = 0
    const clean = hex.replace('#', '')
    if (clean.length === 3) {
      r = parseInt(clean[0] + clean[0], 16)
      g = parseInt(clean[1] + clean[1], 16)
      b = parseInt(clean[2] + clean[2], 16)
    } else {
      r = parseInt(clean.substring(0, 2), 16)
      g = parseInt(clean.substring(2, 4), 16)
      b = parseInt(clean.substring(4, 6), 16)
    }
    r /= 255
    g /= 255
    b /= 255
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0
    let s = 0
    const l = (max + min) / 2
    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0)
          break
        case g:
          h = (b - r) / d + 2
          break
        default:
          h = (r - g) / d + 4
      }
      h /= 6
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) }
  }
}
