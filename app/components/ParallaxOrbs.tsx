'use client'
import { useEffect, useRef } from 'react'

export default function ParallaxOrbs() {
  const groupA = useRef<HTMLDivElement>(null)
  const groupB = useRef<HTMLDivElement>(null)
  const groupC = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = document.getElementById('dashboard-scroll')
    if (!container) return

    let rafId: number
    const handler = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        const y = container.scrollTop
        if (groupA.current) groupA.current.style.transform = `translateY(${y * 0.5}px)`
        if (groupB.current) groupB.current.style.transform = `translateY(${-y * 0.35}px)`
        if (groupC.current) groupC.current.style.transform = `translateY(${y * 0.22}px)`
      })
    }

    container.addEventListener('scroll', handler, { passive: true })
    return () => {
      container.removeEventListener('scroll', handler)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>

      {/* Groupe A — descend au scroll */}
      <div ref={groupA} style={{ position: 'absolute', inset: 0, willChange: 'transform' }}>
        <div style={{
          position: 'absolute', top: '-10%', left: '8%',
          width: '640px', height: '640px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(80,200,155,0.6) 0%, transparent 62%)',
          filter: 'blur(80px)',
          animation: 'orbFloat1 12s ease-in-out infinite',
        }}/>
        <div style={{
          position: 'absolute', top: '-5%', right: '12%',
          width: '520px', height: '520px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(50,185,145,0.5) 0%, transparent 62%)',
          filter: 'blur(80px)',
          animation: 'orbFloat2 15s ease-in-out infinite',
        }}/>
      </div>

      {/* Groupe B — monte au scroll */}
      <div ref={groupB} style={{ position: 'absolute', inset: 0, willChange: 'transform' }}>
        <div style={{
          position: 'absolute', bottom: '-10%', left: '12%',
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(90,210,165,0.55) 0%, transparent 62%)',
          filter: 'blur(80px)',
          animation: 'orbFloat2 14s ease-in-out infinite',
        }}/>
        <div style={{
          position: 'absolute', bottom: '-5%', right: '10%',
          width: '540px', height: '540px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(60,195,155,0.5) 0%, transparent 62%)',
          filter: 'blur(80px)',
          animation: 'orbFloat1 16s ease-in-out infinite',
        }}/>
      </div>

      {/* Groupe C — milieu, légèrement décalé */}
      <div ref={groupC} style={{ position: 'absolute', inset: 0, willChange: 'transform' }}>
        <div style={{
          position: 'absolute', top: '32%', left: '-5%',
          width: '500px', height: '500px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(70,205,160,0.48) 0%, transparent 62%)',
          filter: 'blur(75px)',
          animation: 'orbFloat3 18s ease-in-out infinite',
        }}/>
        <div style={{
          position: 'absolute', top: '38%', right: '-5%',
          width: '480px', height: '480px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(55,198,152,0.45) 0%, transparent 62%)',
          filter: 'blur(75px)',
          animation: 'orbFloat1 13s ease-in-out infinite',
        }}/>
      </div>

      <style>{`
        @keyframes orbFloat1 {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          33%       { transform: translateY(-25px) translateX(12px); }
          66%       { transform: translateY(18px) translateX(-10px); }
        }
        @keyframes orbFloat2 {
          0%, 100% { transform: translateY(0px) translateX(0px); }
          40%       { transform: translateY(22px) translateX(-15px); }
          70%       { transform: translateY(-16px) translateX(8px); }
        }
        @keyframes orbFloat3 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50%       { transform: translateY(-20px) scale(1.04); }
        }
      `}</style>
    </div>
  )
}
