'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '../../lib/supabase'

type Theme = 'normal' | 'light' | 'dark'

const themes: { id: Theme; label: string }[] = [
  { id: 'light',  label: 'Clair'  },
  { id: 'normal', label: 'Normal' },
  { id: 'dark',   label: 'Sombre' },
]

const nav = [
  {
    href: '/', label: 'Dashboard',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>,
  },
  {
    href: '/etudiants', label: 'Étudiants',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>,
  },
  {
    href: '/documents', label: 'Documents',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>,
  },
  {
    href: '/entreprises', label: 'Entreprises',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>,
  },
  {
    href: '/offres', label: 'Offres',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>,
  },
  {
    href: '/relances', label: 'Relances',
    icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>,
  },
]

function AdminProfileButton() {
  const [open, setOpen]           = useState(false)
  const [theme, setTheme]         = useState<Theme>('normal')
  const [email, setEmail]         = useState('')
  const [resetSent, setResetSent] = useState(false)
  const ref                       = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const saved = (localStorage.getItem('dash-theme') as Theme) || 'normal'
    setTheme(saved)
    document.documentElement.setAttribute('data-theme', saved)
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email || ''))
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
      redirectTo: `${window.location.origin}/reset-password`,
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
          width: '100%', display: 'flex', alignItems: 'center', gap: 8,
          padding: '7px 10px', borderRadius: 10, cursor: 'pointer',
          background: open ? 'rgba(255,255,255,0.08)' : 'transparent',
          border: '1px solid ' + (open ? 'rgba(255,255,255,0.1)' : 'transparent'),
          transition: 'all .12s',
        }}
        onMouseEnter={e => { if (!open) { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)' } }}
        onMouseLeave={e => { if (!open) { (e.currentTarget as HTMLElement).style.background = 'transparent' } }}
      >
        <div style={{ minWidth: 0, flex: 1, textAlign: 'left' }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.75)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Administrateur
          </p>
          <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {email || '—'}
          </p>
        </div>
        <svg width="11" height="11" fill="none" stroke="rgba(255,255,255,0.25)" viewBox="0 0 24 24"
          style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform .12s' }}>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7"/>
        </svg>
      </button>

      {/* Dropdown — opens upward */}
      {open && (
        <div style={{
          position: 'absolute', bottom: 'calc(100% + 6px)', left: 0, right: 0,
          zIndex: 100,
          background: 'rgba(18,22,18,0.98)',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.09)',
          borderRadius: 12,
          boxShadow: '0 -4px 24px rgba(0,0,0,0.5)',
          overflow: 'hidden',
        }}>

          {/* Identité */}
          <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>Administrateur</p>
            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 1 }}>{email}</p>
          </div>

          {/* Actions */}
          <div style={{ padding: '5px 6px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <DarkMenuItem
              icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"/>}
              label={resetSent ? 'Email envoyé ✓' : 'Changer le mot de passe'}
              onClick={handleReset}
              color={resetSent ? '#4ADE80' : 'rgba(255,255,255,0.6)'}
            />
          </div>

          {/* Thème */}
          <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'rgba(255,255,255,0.2)', marginBottom: 8 }}>
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
                    background: theme === id ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.04)',
                    color: theme === id ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.3)',
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
            <DarkMenuItem
              icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1"/>}
              label="Se déconnecter"
              onClick={handleLogout}
              color="#F87171"
              hoverBg="rgba(248,113,113,0.1)"
            />
          </div>

        </div>
      )}
    </div>
  )
}

function DarkMenuItem({ icon, label, onClick, color = 'rgba(255,255,255,0.6)', hoverBg = 'rgba(255,255,255,0.06)' }: {
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
        fontSize: 12, fontWeight: 500, color,
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

export default function AdminSidebar() {
  const p = usePathname()
  const active = (href: string) => href === '/' ? p === '/' : p === href || p.startsWith(href + '/')

  return (
    <div className="w-56 flex flex-col shrink-0 min-h-screen sticky top-0"
      style={{ background: 'linear-gradient(180deg, #0D0A1E 0%, #0A150A 100%)' }}>

      {/* Logo */}
      <div className="px-5 py-5 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-sm font-black shrink-0"
            style={{ background: 'linear-gradient(135deg, #22C55E, #8B5CF6)', color: '#fff', boxShadow: '0 4px 12px rgba(139,92,246,0.4)' }}>
            S
          </div>
          <div>
            <p className="text-sm font-bold text-white tracking-tight">Studi</p>
            <p className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.25)' }}>SUP-PHOTO</p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 mb-3 h-px" style={{ background: 'rgba(255,255,255,0.06)' }}/>

      {/* Nav */}
      <nav className="flex-1 px-3 flex flex-col gap-0.5">
        {nav.map(({ href, label, icon }) => {
          const isActive = active(href)
          return (
            <Link key={href} href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all"
              style={isActive
                ? {
                    background: 'rgba(139,92,246,0.18)',
                    color: '#A78BFA',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
                  }
                : { color: 'rgba(255,255,255,0.35)' }
              }
              onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.75)' }}
              onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.35)' }}
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {icon}
              </svg>
              {label}
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: '#A78BFA' }}/>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom — profile menu */}
      <div className="p-3 mx-2 mb-2 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <AdminProfileButton />
      </div>
    </div>
  )
}
