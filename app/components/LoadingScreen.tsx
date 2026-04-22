'use client'

import { useEffect, useState } from 'react'

type Theme = 'normal' | 'light' | 'dark'

const bg:   Record<Theme, string> = { normal: '#E8F0E8', light: '#F5F8F5', dark: '#0D1A0D' }
const card: Record<Theme, string> = { normal: 'rgba(255,255,255,0.55)', light: 'rgba(255,255,255,0.8)', dark: 'rgba(255,255,255,0.06)' }
const text: Record<Theme, string> = { normal: '#1a2e1a', light: '#1a2e1a', dark: 'rgba(255,255,255,0.85)' }
const muted:Record<Theme, string> = { normal: '#6B7280', light: '#9CA3AF', dark: 'rgba(255,255,255,0.3)' }

export default function LoadingScreen() {
  const [theme, setTheme] = useState<Theme>('normal')

  useEffect(() => {
    const saved = (localStorage.getItem('dash-theme') as Theme) || 'normal'
    setTheme(saved)
  }, [])

  return (
    <div style={{
      height: '100vh', width: '100%', background: bg[theme],
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      position: 'relative', overflow: 'hidden',
    }}>

      {/* Barre de progression */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: theme === 'dark' ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)' }}>
        <div style={{ height: '100%', background: 'linear-gradient(90deg, #5C7A5C, #22C55E)', animation: 'progressBar 1.6s ease-in-out infinite' }}/>
      </div>

      {/* Orbe de fond */}
      <div style={{
        position: 'absolute', width: 500, height: 500, borderRadius: '50%', pointerEvents: 'none',
        background: theme === 'dark'
          ? 'radial-gradient(circle, rgba(92,122,92,0.1) 0%, transparent 70%)'
          : 'radial-gradient(circle, rgba(92,122,92,0.12) 0%, transparent 70%)',
        animation: 'breathe 3s ease-in-out infinite',
      }}/>

      {/* Card */}
      <div style={{
        background: card[theme],
        backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)',
        border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.9)'}`,
        borderRadius: 24, padding: '28px 36px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
        boxShadow: theme === 'dark' ? '0 8px 32px rgba(0,0,0,0.4)' : '0 8px 32px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
        animation: 'fadeUp .3s ease-out', position: 'relative', zIndex: 1,
      }}>

        <div style={{
          width: 44, height: 44, borderRadius: 14,
          background: 'linear-gradient(135deg, #22C55E, #8B5CF6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 18, fontWeight: 900, color: '#fff',
          boxShadow: '0 4px 16px rgba(139,92,246,0.35)',
          animation: 'pulse 2s ease-in-out infinite',
        }}>
          S
        </div>

        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: text[theme], letterSpacing: '-0.01em' }}>Studi</p>
          <p style={{ fontSize: 12, color: muted[theme], marginTop: 3 }}>Chargement…</p>
        </div>

        <div style={{ display: 'flex', gap: 6 }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{
              width: 6, height: 6, borderRadius: '50%',
              background: 'linear-gradient(135deg, #5C7A5C, #22C55E)',
              animation: `dot 1.2s ease-in-out ${i * 0.2}s infinite`,
            }}/>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes progressBar {
          0%   { width: 0%;  margin-left: 0;    }
          50%  { width: 60%; margin-left: 20%;  }
          100% { width: 0%;  margin-left: 100%; }
        }
        @keyframes breathe {
          0%, 100% { transform: scale(1);    opacity: .6; }
          50%       { transform: scale(1.15); opacity: 1;  }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes pulse {
          0%, 100% { box-shadow: 0 4px 16px rgba(139,92,246,0.35); }
          50%       { box-shadow: 0 4px 28px rgba(139,92,246,0.6);  }
        }
        @keyframes dot {
          0%, 80%, 100% { transform: scale(0.7); opacity: .4; }
          40%            { transform: scale(1.2); opacity: 1;  }
        }
      `}</style>
    </div>
  )
}
