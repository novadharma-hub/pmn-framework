import React, { useRef, useEffect } from 'react'

export default function ParticlesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let w = 0
    let h = 0
    let particles: Particle[] = []
    let animId: number | null = null
    const mouse = { x: null as number | null, y: null as number | null, radius: 120 }

    const isDark = () => {
      return document.documentElement.getAttribute('data-theme') === 'dark'
    }

    class Particle {
      x: number
      y: number
      size: number
      vx: number
      vy: number
      sizeSeed: number
      angle: number
      rotationSpeed: number
      leafColor: string

      constructor() {
        this.x = Math.random() * w
        this.y = Math.random() * h
        this.size = Math.random() * 2.8 + 0.8
        this.vx = (Math.random() - 0.5) * 1.5
        this.vy = (Math.random() - 0.5) * 1.5
        this.sizeSeed = Math.random() * 100
        this.angle = Math.random() * Math.PI * 2
        this.rotationSpeed = (Math.random() - 0.5) * 0.015
        
        // Cozy Bookstore Light colors: Soft forest greens, warm brown, golden amber, terracotta
        const leafColors = [
          'rgba(30, 70, 32, 0.35)',   // Soft Forest Green
          'rgba(50, 95, 54, 0.35)',   // Olive
          'rgba(142, 102, 64, 0.3)',  // Soft Brown
          'rgba(196, 142, 85, 0.25)', // Golden Amber
          'rgba(164, 80, 52, 0.25)'   // Terracotta/Rust
        ]
        this.leafColor = leafColors[Math.floor(Math.random() * leafColors.length)]
      }

      update() {
        if (!isDark()) {
          // Leaf falling behavior
          this.angle += this.rotationSpeed
          // Slow downward drift
          const speedY = Math.abs(this.vy) * 0.4 + 0.3
          this.y += speedY
          // Horizontal drift (swaying)
          this.x += Math.sin(this.y * 0.01 + this.sizeSeed) * 0.5 + this.vx * 0.15

          // Screen wrapping instead of bounce
          if (this.y > h + 15) {
            this.y = -15
            this.x = Math.random() * w
          }
          if (this.x > w + 15) {
            this.x = -15
          } else if (this.x < -15) {
            this.x = w + 15
          }
        } else {
          // Standard dot behavior
          this.x += this.vx + Math.sin(this.y * 0.008 + this.sizeSeed) * 0.22
          this.y += this.vy + Math.cos(this.x * 0.008 + this.sizeSeed) * 0.22

          // Bounce off canvas edges
          if (this.x > w) { this.x = w; this.vx = -Math.abs(this.vx) }
          if (this.x < 0) { this.x = 0; this.vx = Math.abs(this.vx) }
          if (this.y > h) { this.y = h; this.vy = -Math.abs(this.vy) }
          if (this.y < 0) { this.y = 0; this.vy = Math.abs(this.vy) }

          // Mouse repulsion
          if (mouse.x !== null && mouse.y !== null) {
            const dx = mouse.x - this.x
            const dy = mouse.y - this.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < mouse.radius && dist > 0) {
              const force = (mouse.radius - dist) / mouse.radius
              this.x -= (dx / dist) * force * 3.5
              this.y -= (dy / dist) * force * 3.5
            }
          }
        }
      }

      draw(index: number) {
        const dark = isDark()
        if (!dark) {
          // Drifting leaf drawing (silhouettes using quadratic curves)
          ctx.save()
          ctx.translate(this.x, this.y)
          ctx.rotate(this.angle)
          ctx.fillStyle = this.leafColor
          
          // Scale leaf size slightly
          const leafW = (this.size * 2) + 7
          const leafH = leafW * 1.6
          
          ctx.beginPath()
          // Start at top tip
          ctx.moveTo(0, -leafH / 2)
          // Right curve
          ctx.quadraticCurveTo(leafW / 2, 0, 0, leafH / 2)
          // Left curve
          ctx.quadraticCurveTo(-leafW / 2, 0, 0, -leafH / 2)
          ctx.fill()
          
          // Draw a tiny leaf spine line
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.06)'
          ctx.lineWidth = 0.5
          ctx.beginPath()
          ctx.moveTo(0, -leafH / 2)
          ctx.lineTo(0, leafH / 2 + 1)
          ctx.stroke()
          
          ctx.restore()
          return
        }

        // Standard dot drawing (dark mode)
        const col = 'rgba(192, 39, 26, 0.9)'
        const glow = 'rgba(192, 39, 26, 0.6)'

        // Size breathing effect
        let currentSize = this.size + Math.sin(Date.now() * 0.0016 + this.sizeSeed) * 0.35
        currentSize = Math.max(0.4, currentSize)

        ctx.save()
        ctx.fillStyle = col
        ctx.beginPath()
        ctx.shadowBlur = 8
        ctx.shadowColor = glow
        ctx.arc(this.x, this.y, currentSize * 0.6, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()

        // Connect to mouse
        if (mouse.x !== null && mouse.y !== null) {
          const dx = mouse.x - this.x
          const dy = mouse.y - this.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < mouse.radius * 0.85) {
            ctx.save()
            ctx.globalAlpha = (1 - dist / (mouse.radius * 0.85)) * 0.4
            ctx.strokeStyle = 'rgba(192, 39, 26, 0.5)'
            ctx.lineWidth = 0.8
            ctx.beginPath()
            ctx.moveTo(this.x, this.y)
            ctx.lineTo(mouse.x, mouse.y)
            ctx.stroke()
            ctx.restore()
          }
        }

        // Connect particles to each other (neural network)
        for (let j = index + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const dx2 = this.x - p2.x
          const dy2 = this.y - p2.y
          const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2)
          if (dist2 < 82) {
            ctx.save()
            ctx.globalAlpha = (1 - dist2 / 82) * 0.25
            ctx.strokeStyle = 'rgba(192, 39, 26, 0.4)'
            ctx.lineWidth = 0.6
            ctx.beginPath()
            ctx.moveTo(this.x, this.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()
            ctx.restore()
          }
        }
      }
    }

    const init = () => {
      particles = []
      let n = Math.min(Math.floor((w * h) / 6000), 200)
      n = Math.max(n, 80)
      for (let i = 0; i < n; i++) {
        particles.push(new Particle())
      }
    }

    const resize = () => {
      const parent = canvas.parentElement
      w = canvas.width = parent ? parent.offsetWidth : window.innerWidth
      h = canvas.height = parent ? parent.offsetHeight : window.innerHeight
      init()
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const cx = e.clientX - rect.left
      const cy = e.clientY - rect.top
      if (cx >= 0 && cx <= rect.width && cy >= 0 && cy <= rect.height) {
        mouse.x = cx
        mouse.y = cy
      } else {
        mouse.x = null
        mouse.y = null
      }
    }

    const handleMouseLeave = () => {
      mouse.x = null
      mouse.y = null
    }

    const animate = () => {
      ctx.clearRect(0, 0, w, h)
      particles.forEach((p, i) => {
        p.update()
        p.draw(i)
      })
      animId = requestAnimationFrame(animate)
    }

    // Event listeners
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseout', handleMouseLeave)

    // Initial setups
    resize()
    animate()

    // Cleanup
    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseout', handleMouseLeave)
      if (animId) cancelAnimationFrame(animId)
    }
  }, [])

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-0"
    />
  )
}
