'use client'
import { useEffect, useState } from 'react'

type Theme = 'normal' | 'light' | 'dark'

const themes: { id: Theme; icon: string; label: string }[] = [
  { id: 'light',  icon: '☀️', label: 'Clair'  },
  { id: 'normal', icon: '🌿', label: 'Normal' },
  { id: 'dark',   icon: '🌙', label: 'Sombre' },
]

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState<Theme>('normal')

  useEffect(() => {
    const saved = (localStorage.getItem('dash-theme') as Theme) || 'normal'
    setTheme(saved)
    document.documentElement.setAttribute('data-theme', saved)
  }, [])

  const apply = (t: Theme) => {
    setTheme(t)
    localStorage.setItem('dash-theme', t)
    document.documentElement.setAttribute('data-theme', t)
  }

  return (
    <div className="flex items-center gap-0.5 p-1 rounded-2xl"
      style={{ background: 'rgba(0,0,0,0.12)', backdropFilter: 'blur(10px)' }}>
      {themes.map(({ id, icon, label }) => (
        <button
          key={id}
          onClick={() => apply(id)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all"
          style={theme === id
            ? { background: 'rgba(255,255,255,0.3)', color: 'var(--dash-header-title)', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
            : { color: 'var(--dash-header-sub)' }
          }
        >
          <span>{icon}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  )
}
