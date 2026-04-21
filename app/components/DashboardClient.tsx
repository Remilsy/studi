'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

interface Etudiant {
  id: string
  prenom: string
  nom: string
  email: string
  statut: string
  niveau: string
  type_formation: string
  nb_candidatures: number | null
  score_progression: number | null
  prochain_entretien: string | null
}

const statutConfig: Record<string, { label: string; color: string; bg: string; bar: string }> = {
  en_preparation: { label: 'En préparation', color: '#9CA3AF', bg: 'rgba(156,163,175,0.1)',  bar: '#D1D5DB' },
  en_recherche:   { label: 'En recherche',   color: '#3B82F6', bg: 'rgba(59,130,246,0.1)',   bar: '#3B82F6' },
  place:          { label: 'Placé',           color: '#22C55E', bg: 'rgba(34,197,94,0.1)',    bar: '#22C55E' },
}

function exportCSV(etudiants: Etudiant[]) {
  const headers = ['Prénom', 'Nom', 'Email', 'Statut', 'Section', 'Formation', 'Candidatures', 'Progression']
  const rows = etudiants.map(e => [
    e.prenom, e.nom, e.email,
    statutConfig[e.statut]?.label || e.statut,
    e.niveau, e.type_formation === 'alternance' ? 'Alternance' : 'Initial',
    e.nb_candidatures ?? 0, `${e.score_progression ?? 0}%`,
  ])
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url
  a.download = `etudiants_${new Date().toISOString().slice(0, 10)}.csv`
  a.click(); URL.revokeObjectURL(url)
}

export default function DashboardClient({ etudiants }: { etudiants: Etudiant[] }) {
  const [search, setSearch] = useState('')
  const [filterStatut, setFilterStatut] = useState('')
  const [filterNiveau, setFilterNiveau] = useState('')
  const [filterFormation, setFilterFormation] = useState('')

  const niveaux = useMemo(() => {
    const set = new Set(etudiants.map(e => e.niveau).filter(Boolean))
    return Array.from(set).sort()
  }, [etudiants])

  const filtered = useMemo(() => {
    return etudiants.filter(e => {
      const q = search.toLowerCase()
      if (q && !`${e.prenom} ${e.nom}`.toLowerCase().includes(q) && !e.email.toLowerCase().includes(q)) return false
      if (filterStatut && e.statut !== filterStatut) return false
      if (filterNiveau && e.niveau !== filterNiveau) return false
      if (filterFormation && e.type_formation !== filterFormation) return false
      return true
    })
  }, [etudiants, search, filterStatut, filterNiveau, filterFormation])

  const ctrlStyle = {
    background: 'rgba(255,255,255,0.7)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: '1px solid rgba(255,255,255,0.9)',
    color: '#111827',
    borderRadius: '12px',
    padding: '8px 12px',
    fontSize: '13px',
    outline: 'none',
  }

  return (
    <div style={{
      background: 'rgba(255,255,255,0.55)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      border: '1px solid rgba(255,255,255,0.85)',
      borderRadius: '24px',
      boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
    }}>
      {/* Toolbar */}
      <div className="p-4 flex flex-wrap items-center gap-3" style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <input
          type="text"
          placeholder="Rechercher un étudiant..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ ...ctrlStyle, flex: '1 1 180px', minWidth: '180px' }}
        />
        <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)} style={ctrlStyle}>
          <option value="">Tous les statuts</option>
          <option value="en_preparation">En préparation</option>
          <option value="en_recherche">En recherche</option>
          <option value="place">Placé</option>
        </select>
        <select value={filterNiveau} onChange={e => setFilterNiveau(e.target.value)} style={ctrlStyle}>
          <option value="">Toutes sections</option>
          {niveaux.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <select value={filterFormation} onChange={e => setFilterFormation(e.target.value)} style={ctrlStyle}>
          <option value="">Toutes formations</option>
          <option value="alternance">Alternance</option>
          <option value="initial">Initial</option>
        </select>
        <button onClick={() => exportCSV(filtered)} style={{ ...ctrlStyle, color: '#6B7280', cursor: 'pointer' }}>
          ↓ CSV
        </button>
        <span className="text-xs text-gray-400 shrink-0">{filtered.length} étudiant{filtered.length > 1 ? 's' : ''}</span>
      </div>

      {filtered.length === 0 ? (
        <div className="p-10 text-center">
          <p className="text-sm text-gray-300 italic">Aucun étudiant ne correspond à ta recherche.</p>
        </div>
      ) : (
        <div>
          {filtered.map((e, idx) => {
            const s = statutConfig[e.statut] || { label: e.statut, color: '#9CA3AF', bg: 'rgba(156,163,175,0.1)', bar: '#D1D5DB' }
            const urgence = e.statut === 'en_recherche' && (e.nb_candidatures ?? 0) === 0
            return (
              <Link
                key={e.id}
                href={`/etudiants/${e.id}`}
                className="flex items-center gap-4 px-5 py-3.5 transition-colors relative overflow-hidden"
                style={{ borderTop: idx > 0 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}
                onMouseEnter={ev => (ev.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.5)'}
                onMouseLeave={ev => (ev.currentTarget as HTMLElement).style.background = 'transparent'}
              >
                <div className="absolute left-0 top-2 bottom-2 w-0.5 rounded-r-full" style={{ backgroundColor: s.bar }}/>

                <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-bold shrink-0"
                  style={{ background: s.bg, color: s.color }}>
                  {e.prenom[0]}{e.nom[0]}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-gray-900 truncate">{e.prenom} {e.nom}</p>
                    {urgence && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                        style={{ background: 'rgba(249,115,22,0.1)', color: '#EA580C' }}>À relancer</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 truncate">{e.email}</p>
                </div>

                <div className="hidden sm:flex items-center gap-2 shrink-0">
                  <span className="text-xs text-gray-400">{e.niveau}</span>
                  <span className="text-gray-200">·</span>
                  <span className="text-xs text-gray-400">{e.type_formation === 'alternance' ? 'Alternance' : 'Initial'}</span>
                </div>

                <span className="hidden md:inline-flex text-[10px] font-bold px-2.5 py-0.5 rounded-full shrink-0"
                  style={{ background: s.bg, color: s.color }}>
                  {s.label}
                </span>

                <div className="hidden lg:flex items-center gap-2 w-24 shrink-0">
                  <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.07)' }}>
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${e.score_progression ?? 0}%`, background: `linear-gradient(90deg, ${s.bar}, ${s.bar}99)` }}/>
                  </div>
                  <span className="text-[10px] text-gray-400">{e.score_progression ?? 0}%</span>
                </div>

                <span className="text-xs font-bold shrink-0" style={{ color: s.color }}>{e.nb_candidatures ?? 0} cand.</span>

                <svg className="w-3.5 h-3.5 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                </svg>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
