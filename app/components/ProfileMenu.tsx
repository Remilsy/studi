'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'

type Theme = 'normal' | 'light' | 'dark'

const themes: { id: Theme; icon: string; label: string }[] = [
  { id: 'light',  icon: '☀️', label: 'Clair'   },
  { id: 'normal', icon: '🌿', label: 'Normal'  },
  { id: 'dark',   icon: '🌙', label: 'Sombre'  },
]

interface Props {
  prenom: string
  nom: string
  email: string
}

export default function ProfileMenu({ prenom, nom, email }: Props) {
  const [open, setOpen]   = useState(false)
  const [theme, setTheme] = useState<Theme>('normal')
  const ref               = useRef<HTMLDivElement>(null)
  const initiale          = prenom[0].toUpperCase()

  useEffect(() => {
    const saved = (localStorage.getItem('dash-theme') as Theme) || 'normal'
    setTheme(saved)
    document.documentElement.setAttribute('data-theme', saved)
  }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function applyTheme(t: Theme) {
    setTheme(t)
    localStorage.setItem('dash-theme', t)
    document.documentElement.setAttribute('data-theme', t)
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: 34, height: 34, borderRadius: '50%',
          background: open
            ? 'linear-gradient(135deg, #3D553D, #2D4030)'
            : 'linear-gradient(135deg, #5C7A5C, #3D553D)',
          color: 'white', fontSize: 13, fontWeight: 700,
          border: open ? '2px solid rgba(255,255,255,0.4)' : '2px solid transparent',
          cursor: 'pointer', transition: 'all .15s',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: open ? '0 0 0 4px rgba(92,122,92,0.2)' : 'none',
        }}
        title="Mon compte"
      >
        {initiale}
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 10px)', right: 0,
          width: 240, zIndex: 100,
          background: 'linear-gradient(145deg, rgba(255,255,255,0.92) 0%, rgba(240,248,240,0.92) 100%)',
          backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)',
          border: '1px solid rgba(255,255,255,0.95)',
          borderRadius: 18,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.9)',
          overflow: 'hidden',
        }}>

          {/* Identité */}
          <div style={{ padding: '16px 18px 14px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                background: 'linear-gradient(135deg, #5C7A5C, #3D553D)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: 15, fontWeight: 700,
              }}>
                {initiale}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: 14, color: '#1a2e1a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {prenom} {nom}
                </p>
                <p style={{ fontSize: 11, color: '#6B7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {email}
                </p>
              </div>
            </div>
          </div>

          {/* Thème */}
          <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9CA3AF', marginBottom: 10 }}>
              Apparence
            </p>
            <div style={{ display: 'flex', gap: 4, background: 'rgba(0,0,0,0.06)', borderRadius: 12, padding: 4 }}>
              {themes.map(({ id, icon, label }) => (
                <button
                  key={id}
                  onClick={() => applyTheme(id)}
                  style={{
                    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
                    padding: '6px 4px', borderRadius: 9, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                    transition: 'all .15s', border: 'none',
                    background: theme === id ? 'rgba(255,255,255,0.9)' : 'transparent',
                    color: theme === id ? '#1a2e1a' : '#9CA3AF',
                    boxShadow: theme === id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  }}
                >
                  <span style={{ fontSize: 16 }}>{icon}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Déconnexion */}
          <div style={{ padding: '10px 10px' }}>
            <button
              onClick={handleLogout}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 10px', borderRadius: 11, cursor: 'pointer',
                background: 'transparent', border: 'none', transition: 'background .12s',
                fontSize: 13, fontWeight: 600, color: '#DC2626',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(220,38,38,0.08)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <svg width="15" height="15" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"/>
              </svg>
              Se déconnecter
            </button>
          </div>

        </div>
      )}
    </div>
  )
}
