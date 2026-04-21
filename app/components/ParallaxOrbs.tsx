'use client'
import { useEffect, useRef } from 'react'

export default function ParallaxOrbs() {
  const groupA = useRef<HTMLDivElement>(null) // haut — descendent lentement
  const groupB = useRef<HTMLDivElement>(null) // bas  — montent lentement
  const groupC = useRef<HTMLDivElement>(null) // milieu — mouvement inverse léger

  useEffect(() => {
    const container = document.getElementById('dashboard-scroll')
    if (!container) return

    let rafId: number
    const handler = () => {
      rafId = requestAnimationFrame(() => {
        const y = container.scrollTop
        if (groupA.current) groupA.current.style.transform = `translateY(${y * 0.18}px)`
        if (groupB.current) groupB.current.style.transform = `translateY(${-y * 0.12}px)`
        if (groupC.current) groupC.current.style.transform = `translateY(${y * 0.08}px)`
      })
    }

    container.addEventListener('scroll', handler, { passive: true })
    return () => {
      container.removeEventListener('scroll', handler)
      cancelAnimationFrame(rafId)
    }
  }, [])

  const orb = (color: string, opacity: number, size: number) =>
    `radial-gradient(circle, rgba(${color},${opacity}) 0%, transparent 62%)`

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {/* Groupe A – haut */}
      <div ref={groupA} style={{ position: 'absolute', inset: 0, willChange: 'transform' }}>
        <div style={{ position:'absolute', top:'-8%',  left:'8%',   width:'620px', height:'620px', borderRadius:'50%', background: orb('80,200,160', 0.55, 620), filter:'blur(80px)' }}/>
        <div style={{ position:'absolute', top:'-5%',  right:'12%', width:'520px', height:'520px', borderRadius:'50%', background: orb('50,185,150', 0.45, 520), filter:'blur(80px)' }}/>
      </div>

      {/* Groupe B – bas */}
      <div ref={groupB} style={{ position: 'absolute', inset: 0, willChange: 'transform' }}>
        <div style={{ position:'absolute', bottom:'-8%', left:'12%',  width:'580px', height:'580px', borderRadius:'50%', background: orb('90,210,168', 0.5, 580), filter:'blur(80px)' }}/>
        <div style={{ position:'absolute', bottom:'-5%', right:'10%', width:'520px', height:'520px', borderRadius:'50%', background: orb('60,195,158', 0.45, 520), filter:'blur(80px)' }}/>
      </div>

      {/* Groupe C – milieu */}
      <div ref={groupC} style={{ position: 'absolute', inset: 0, willChange: 'transform' }}>
        <div style={{ position:'absolute', top:'30%', left:'-4%',  width:'480px', height:'480px', borderRadius:'50%', background: orb('70,205,162', 0.45, 480), filter:'blur(75px)' }}/>
        <div style={{ position:'absolute', top:'35%', right:'-4%', width:'480px', height:'480px', borderRadius:'50%', background: orb('55,198,155', 0.42, 480), filter:'blur(75px)' }}/>
      </div>
    </div>
  )
}
