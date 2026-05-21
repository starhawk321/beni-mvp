'use client'

import { useEffect, useRef } from 'react'

export default function GradientField() {
  const blob1 = useRef<HTMLDivElement>(null)
  const blob2 = useRef<HTMLDivElement>(null)
  const blob3 = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let raf: number
    let tx1 = 18, ty1 = 28
    let tx2 = 82, ty2 = 22
    let cx1 = 18, cy1 = 28
    let cx2 = 82, cy2 = 22

    const handleMouseMove = (e: MouseEvent) => {
      const mx = (e.clientX / window.innerWidth)  * 100
      const my = (e.clientY / window.innerHeight) * 100
      tx1 = mx * 0.4 + 10
      ty1 = my * 0.5 + 10
      tx2 = 100 - mx * 0.4 - 10
      ty2 = my * 0.4 + 10
    }

    const animate = () => {
      // Lerp toward target — smooth lag effect
      cx1 += (tx1 - cx1) * 0.04
      cy1 += (ty1 - cy1) * 0.04
      cx2 += (tx2 - cx2) * 0.03
      cy2 += (ty2 - cy2) * 0.03

      if (blob1.current) {
        blob1.current.style.left = `${cx1 - 30}%`
        blob1.current.style.top  = `${cy1 - 30}%`
      }
      if (blob2.current) {
        blob2.current.style.left = `${cx2 - 30}%`
        blob2.current.style.top  = `${cy2 - 30}%`
      }

      raf = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', handleMouseMove)
    raf = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  const blob = (ref: React.RefObject<HTMLDivElement | null>, color: string, size: string, delay: string) => (
    <div ref={ref} style={{
      position: 'absolute',
      width: size, height: size,
      borderRadius: '50%',
      background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      filter: 'blur(60px)',
      opacity: 0.85,
      pointerEvents: 'none',
      willChange: 'left, top',
      animationDelay: delay,
    }} />
  )

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      {blob(blob1, 'rgba(122,231,255,0.22)', '60vw', '0s')}
      {blob(blob2, 'rgba(155,91,255,0.20)', '55vw', '0s')}
      {/* Static bottom blob */}
      <div ref={blob3} style={{
        position: 'absolute',
        width: '70vw', height: '70vw',
        bottom: '-20vw', left: '15vw',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(229,91,184,0.16) 0%, transparent 70%)',
        filter: 'blur(80px)',
        pointerEvents: 'none',
      }} />
    </div>
  )
}
