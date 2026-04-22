'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'

type Theme = 'normal' | 'light' | 'dark'

interface Props {
  prenom: string
  nom: string
  email: string
}

const themes: { id: Theme; label: string }[] = [
  { id: 'light',  label: 'Clair'  },
  { id: 'normal', label: 'Normal' },
  { id: 'dark',   label: 'Sombre' },
]

export default function ProfileMenu({ prenom, nom, email }: Props) {
  const [open, setOpen]         = useState(false)
  const [theme, setTheme]       = useState<Theme>('normal')
  const [resetSent, setResetSent] = useState(false)
  const ref                     = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const saved = (localStorage.getItem('dash-theme') as Theme) || 'normal'
    setTheme(saved)
    document.documentElement.setAttribute('data-theme', saved)
  }, [])

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  function applyTheme(t: Theme) {
    setTheme(t)
    localStorage.setItem('dash-theme', t)
    document.documentElement.setAttribute('data-theme', t)
  }

  async function handleReset() {
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || window.location.origin}/auth/callback?next=/reset-password`,
    })
    setResetSent(true)
    setTimeout(() => setResetSent(false), 4000)
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
          display: 'flex', alignItems: 'center', gap: 7,
          padding: '5px 10px 5px 8px', borderRadius: 8, cursor: 'pointer',
          background: open ? 'rgba(0,0,0,0.07)' : 'transparent',
          border: '1px solid ' + (open ? 'rgba(0,0,0,0.12)' : 'transparent'),
          transition: 'all .12s',
        }}
        onMouseEnter={e => { if (!open) { (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.05)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(0,0,0,0.08)' } }}
        onMouseLeave={e => { if (!open) { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.borderColor = 'transparent' } }}
      >
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--dash-header-title)' }}>
          {prenom} {nom}
        </span>
        <svg width="11" height="11" fill="none" stroke="currentColor" viewBox="0 0 24 24"
          style={{ color: 'var(--dash-section-label)', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .12s' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', right: 0,
          width: 230, zIndex: 100,
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(0,0,0,0.1)',
          borderRadius: 12,
          boxShadow: '0 4px 24px rgba(0,0,0,0.1), 0 1px 3px rgba(0,0,0,0.06)',
          overflow: 'hidden',
        }}>

          {/* Identité */}
          <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{prenom} {nom}</p>
            <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 1 }}>{email}</p>
          </div>

          {/* Actions */}
          <div style={{ padding: '5px 6px' }}>
            <MenuItem
              icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>}
              label={resetSent ? 'Email envoyé ✓' : 'Changer le mot de passe'}
              onClick={handleReset}
              color={resetSent ? '#16A34A' : '#374151'}
            />
          </div>

          {/* Thème */}
          <div style={{ padding: '8px 14px 10px', borderTop: '1px solid rgba(0,0,0,0.07)', borderBottom: '1px solid rgba(0,0,0,0.07)' }}>
            <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#9CA3AF', marginBottom: 7 }}>
              Apparence
            </p>
            <div style={{ display: 'flex', gap: 3 }}>
              {themes.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => applyTheme(id)}
                  style={{
                    flex: 1, padding: '5px 0', borderRadius: 6,
                    fontSize: 11, fontWeight: 600, cursor: 'pointer', border: 'none',
                    background: theme === id ? '#111827' : 'rgba(0,0,0,0.05)',
                    color: theme === id ? '#fff' : '#6B7280',
                    transition: 'all .12s',
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Déconnexion */}
          <div style={{ padding: '5px 6px' }}>
            <MenuItem
              icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"/>}
              label="Se déconnecter"
              onClick={handleLogout}
              color="#DC2626"
              hoverBg="rgba(220,38,38,0.07)"
            />
          </div>

        </div>
      )}
    </div>
  )
}

function MenuItem({ icon, label, onClick, color = '#374151', hoverBg = 'rgba(0,0,0,0.05)' }: {
  icon: React.ReactNode
  label: string
  onClick: () => void
  color?: string
  hoverBg?: string
}) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 9,
        padding: '7px 9px', borderRadius: 7, cursor: 'pointer',
        background: 'transparent', border: 'none', transition: 'background .1s',
        fontSize: 13, fontWeight: 500, color,
      }}
      onMouseEnter={e => (e.currentTarget.style.background = hoverBg)}
      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
    >
      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
        {icon}
      </svg>
      {label}
    </button>
  )
}
