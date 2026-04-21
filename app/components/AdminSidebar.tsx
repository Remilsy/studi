'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LogoutButton from './LogoutButton'

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

      {/* Bottom */}
      <div className="p-3 mx-2 mb-2 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <LogoutButton />
      </div>
    </div>
  )
}
