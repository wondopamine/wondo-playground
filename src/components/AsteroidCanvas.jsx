import { useEffect, useRef } from 'react'

export class AsteroidGenerator {
  constructor(canvas) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.centerX = canvas.width / 2
    this.centerY = canvas.height / 2
    this.config = {
      curveType: 'astroid',
      sharpness: 4,
      size: 200,
      randomness: 0,
      fillColor: '#0090FF',
      strokeColor: '#3E63DD',
      strokeWidth: 3,
      displayMode: 'both',
      showCenter: false,
      animSpeed: 50,
      cornerRoundness: 0
    }
    this.points = []
    this.isAnimating = false
    this.animationId = null
    this.animationProgress = 0
  }

  generateAstroid() {
    const points = []
    const steps = 360
    const a = this.config.size
    const power = 3 - (this.config.sharpness / 20) // Use sharpness to vary the power

    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * 2 * Math.PI
      const cosT = Math.cos(t)
      const sinT = Math.sin(t)

      const x = a * Math.pow(Math.abs(cosT), power) * Math.sign(cosT)
      const y = a * Math.pow(Math.abs(sinT), power) * Math.sign(sinT)

      points.push({ x, y })
    }

    return points
  }

  generateHypocycloid() {
    const points = []
    const steps = 720
    const R = this.config.size
    const r = R / this.config.sharpness
    const d = r

    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * 2 * Math.PI * this.config.sharpness

      const x = (R - r) * Math.cos(t) + d * Math.cos(((R - r) / r) * t)
      const y = (R - r) * Math.sin(t) - d * Math.sin(((R - r) / r) * t)

      points.push({ x, y })
    }

    return points
  }

  generateRealisticAsteroid() {
    const points = []
    const numPoints = Math.max(20, this.config.sharpness * 5)
    const baseRadius = this.config.size
    const randomFactor = this.config.randomness / 100

    const anglePoints = []
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * 2 * Math.PI
      const radiusVariation = 1 + (Math.random() - 0.5) * randomFactor
      const radius = baseRadius * radiusVariation

      anglePoints.push({ angle, radius })
    }

    const smoothSteps = 360
    for (let i = 0; i <= smoothSteps; i++) {
      const t = (i / smoothSteps) * 2 * Math.PI

      const idx = Math.floor((i / smoothSteps) * numPoints)
      const nextIdx = (idx + 1) % numPoints

      const p1 = anglePoints[idx]
      const p2 = anglePoints[nextIdx]

      const localT = ((i / smoothSteps) * numPoints) % 1
      const radius = p1.radius + (p2.radius - p1.radius) * localT

      const x = radius * Math.cos(t)
      const y = radius * Math.sin(t)

      points.push({ x, y })
    }

    return points
  }

  generate() {
    switch (this.config.curveType) {
      case 'astroid':
        this.points = this.generateAstroid()
        break
      case 'hypocycloid':
        this.points = this.generateHypocycloid()
        break
      case 'asteroid':
        this.points = this.generateRealisticAsteroid()
        break
    }

    if (this.config.randomness > 0 && this.config.curveType !== 'asteroid') {
      const randomFactor = this.config.randomness / 500
      this.points = this.points.map(p => ({
        x: p.x + (Math.random() - 0.5) * this.config.size * randomFactor,
        y: p.y + (Math.random() - 0.5) * this.config.size * randomFactor
      }))
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    if (this.points.length === 0) return

    this.ctx.save()
    this.ctx.translate(this.centerX, this.centerY)

    // Apply corner roundness using quadratic curves
    this.ctx.beginPath()

    if (this.config.cornerRoundness > 0) {
      const roundness = this.config.cornerRoundness / 100

      for (let i = 0; i < this.points.length; i++) {
        const prevIdx = i === 0 ? this.points.length - 1 : i - 1
        const nextIdx = (i + 1) % this.points.length

        const prev = this.points[prevIdx]
        const curr = this.points[i]
        const next = this.points[nextIdx]

        const dx1 = curr.x - prev.x
        const dy1 = curr.y - prev.y
        const dx2 = next.x - curr.x
        const dy2 = next.y - curr.y

        const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1)
        const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2)

        const factor = Math.min(0.5, roundness)

        const offset1X = (dx1 / len1) * len1 * factor
        const offset1Y = (dy1 / len1) * len1 * factor
        const offset2X = (dx2 / len2) * len2 * factor
        const offset2Y = (dy2 / len2) * len2 * factor

        const cp1x = curr.x - offset1X
        const cp1y = curr.y - offset1Y
        const cp2x = curr.x + offset2X
        const cp2y = curr.y + offset2Y

        if (i === 0) {
          this.ctx.moveTo(cp1x, cp1y)
        } else {
          this.ctx.lineTo(cp1x, cp1y)
        }

        this.ctx.quadraticCurveTo(curr.x, curr.y, cp2x, cp2y)
      }
    } else {
      this.ctx.moveTo(this.points[0].x, this.points[0].y)
      for (let i = 1; i < this.points.length; i++) {
        this.ctx.lineTo(this.points[i].x, this.points[i].y)
      }
    }

    this.ctx.closePath()

    if (this.config.displayMode === 'filled' || this.config.displayMode === 'both') {
      this.ctx.fillStyle = this.config.fillColor
      this.ctx.fill()
    }

    if (this.config.displayMode === 'outline' || this.config.displayMode === 'both') {
      this.ctx.strokeStyle = this.config.strokeColor
      this.ctx.lineWidth = this.config.strokeWidth
      this.ctx.lineJoin = 'round'
      this.ctx.lineCap = 'round'
      this.ctx.stroke()
    }

    if (this.config.showCenter) {
      this.ctx.fillStyle = '#333'
      this.ctx.beginPath()
      this.ctx.arc(0, 0, 5, 0, 2 * Math.PI)
      this.ctx.fill()
    }

    this.ctx.restore()
  }

  drawAnimated(progress) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

    if (this.points.length === 0) return

    const numPointsToDraw = Math.floor(this.points.length * progress)

    if (numPointsToDraw < 1) return

    this.ctx.save()
    this.ctx.translate(this.centerX, this.centerY)

    this.ctx.beginPath()
    this.ctx.moveTo(this.points[0].x, this.points[0].y)

    for (let i = 1; i < numPointsToDraw; i++) {
      this.ctx.lineTo(this.points[i].x, this.points[i].y)
    }

    this.ctx.strokeStyle = this.config.strokeColor
    this.ctx.lineWidth = this.config.strokeWidth
    this.ctx.lineCap = 'round'
    this.ctx.lineJoin = 'round'
    this.ctx.stroke()

    this.ctx.fillStyle = this.config.strokeColor
    this.ctx.beginPath()
    const currentPoint = this.points[numPointsToDraw - 1]
    this.ctx.arc(currentPoint.x, currentPoint.y, this.config.strokeWidth * 2, 0, 2 * Math.PI)
    this.ctx.fill()

    if (this.config.showCenter) {
      this.ctx.fillStyle = '#333'
      this.ctx.beginPath()
      this.ctx.arc(0, 0, 5, 0, 2 * Math.PI)
      this.ctx.fill()
    }

    this.ctx.restore()
  }

  startAnimation(onComplete) {
    if (this.isAnimating) return

    this.isAnimating = true
    this.animationProgress = 0

    const animate = () => {
      if (!this.isAnimating) return

      const increment = this.config.animSpeed / 10000
      this.animationProgress += increment

      if (this.animationProgress >= 1) {
        this.animationProgress = 1
        this.drawAnimated(this.animationProgress)
        this.stopAnimation()
        setTimeout(() => {
          this.draw()
          if (onComplete) onComplete()
        }, 200)
        return
      }

      this.drawAnimated(this.animationProgress)
      this.animationId = requestAnimationFrame(animate)
    }

    this.animationId = requestAnimationFrame(animate)
  }

  stopAnimation() {
    this.isAnimating = false
    if (this.animationId) {
      cancelAnimationFrame(this.animationId)
      this.animationId = null
    }
    this.animationProgress = 0
  }

  generateSVG() {
    if (this.points.length === 0) return ''

    const width = this.canvas.width
    const height = this.canvas.height

    let pathData = `M ${this.centerX + this.points[0].x} ${this.centerY + this.points[0].y}`

    for (let i = 1; i < this.points.length; i++) {
      pathData += ` L ${this.centerX + this.points[i].x} ${this.centerY + this.points[i].y}`
    }

    pathData += ' Z'

    const fillAttr = (this.config.displayMode === 'filled' || this.config.displayMode === 'both')
      ? `fill="${this.config.fillColor}"`
      : 'fill="none"'

    const strokeAttr = (this.config.displayMode === 'outline' || this.config.displayMode === 'both')
      ? `stroke="${this.config.strokeColor}" stroke-width="${this.config.strokeWidth}"`
      : ''

    const centerPoint = this.config.showCenter
      ? `<circle cx="${this.centerX}" cy="${this.centerY}" r="5" fill="#333"/>`
      : ''

    return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <path d="${pathData}" ${fillAttr} ${strokeAttr}/>
    ${centerPoint}
</svg>`
  }

  update() {
    this.generate()
    this.draw()
  }

  updateConfig(key, value) {
    this.config[key] = value
    this.update()
  }
}

export function AsteroidCanvas({ config, onGeneratorReady }) {
  const canvasRef = useRef(null)
  const generatorRef = useRef(null)

  useEffect(() => {
    if (canvasRef.current && !generatorRef.current) {
      generatorRef.current = new AsteroidGenerator(canvasRef.current)
      if (onGeneratorReady) {
        onGeneratorReady(generatorRef.current)
      }
      generatorRef.current.update()
    }
  }, [onGeneratorReady])

  useEffect(() => {
    if (generatorRef.current && config) {
      Object.keys(config).forEach(key => {
        if (generatorRef.current.config[key] !== config[key]) {
          generatorRef.current.config[key] = config[key]
        }
      })
      generatorRef.current.update()
    }
  }, [config])

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={600}
      className="border-2 border-border rounded-lg bg-white shadow-lg"
    />
  )
}
