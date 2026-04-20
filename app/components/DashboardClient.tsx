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

const statutLabels: Record<string, { label: string; bg: string; text: string }> = {
  en_preparation: { label: 'En préparation', bg: '#F3F4F6', text: '#6B7280' },
  en_recherche:   { label: 'En recherche',   bg: '#E4EDE4', text: '#3D553D' },
  place:          { label: 'Placé',           bg: '#F0FDF4', text: '#15803D' },
}

function exportCSV(etudiants: Etudiant[]) {
  const headers = ['Prénom', 'Nom', 'Email', 'Statut', 'Section', 'Formation', 'Candidatures', 'Progression']
  const rows = etudiants.map(e => [
    e.prenom,
    e.nom,
    e.email,
    statutLabels[e.statut]?.label || e.statut,
    e.niveau,
    e.type_formation === 'alternance' ? 'Alternance' : 'Initial',
    e.nb_candidatures ?? 0,
    `${e.score_progression ?? 0}%`,
  ])
  const csv = [headers, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `etudiants_${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
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

  const selectCls = "px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white text-gray-700 outline-none focus:border-[#5C7A5C] transition-colors"

  return (
    <div className="bg-white border border-[#C8D8C8] rounded-xl">
      {/* Toolbar */}
      <div className="p-4 border-b border-[#F3F4F6] flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Rechercher un étudiant..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 min-w-48 px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#5C7A5C] transition-colors"
        />
        <select value={filterStatut} onChange={e => setFilterStatut(e.target.value)} className={selectCls}>
          <option value="">Tous les statuts</option>
          <option value="en_preparation">En préparation</option>
          <option value="en_recherche">En recherche</option>
          <option value="place">Placé</option>
        </select>
        <select value={filterNiveau} onChange={e => setFilterNiveau(e.target.value)} className={selectCls}>
          <option value="">Toutes les sections</option>
          {niveaux.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        <select value={filterFormation} onChange={e => setFilterFormation(e.target.value)} className={selectCls}>
          <option value="">Toutes formations</option>
          <option value="alternance">Alternance</option>
          <option value="initial">Initial</option>
        </select>
        <button
          onClick={() => exportCSV(filtered)}
          className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors shrink-0"
        >
          ↓ Export CSV
        </button>
        <span className="text-xs text-gray-400 shrink-0">{filtered.length} étudiant{filtered.length > 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="p-10 text-center">
          <p className="text-sm text-gray-300 italic">Aucun étudiant ne correspond à ta recherche.</p>
        </div>
      ) : (
        <div className="divide-y divide-[#F9FAF9]">
          {filtered.map(e => {
            const s = statutLabels[e.statut] || { label: e.statut, bg: '#F3F4F6', text: '#6B7280' }
            return (
              <Link
                key={e.id}
                href={`/etudiants/${e.id}`}
                className="flex items-center gap-4 px-4 py-3 hover:bg-[#F8FAF8] transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#E4EDE4] flex items-center justify-center text-xs font-semibold text-[#3D553D] shrink-0">
                  {e.prenom[0]}{e.nom[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{e.prenom} {e.nom}</p>
                  <p className="text-xs text-gray-400 truncate">{e.email}</p>
                </div>
                <div className="hidden sm:flex items-center gap-2 shrink-0">
                  <span className="text-xs text-gray-400">{e.niveau}</span>
                  <span className="text-gray-200">·</span>
                  <span className="text-xs text-gray-400">{e.type_formation === 'alternance' ? 'Alternance' : 'Initial'}</span>
                </div>
                <span
                  className="hidden md:inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                  style={{ backgroundColor: s.bg, color: s.text }}
                >
                  {s.label}
                </span>
                <div className="hidden lg:flex items-center gap-2 w-24 shrink-0">
                  <div className="flex-1 h-1 bg-[#E4EDE4] rounded-full overflow-hidden">
                    <div className="h-full bg-[#5C7A5C] rounded-full" style={{ width: `${e.score_progression ?? 0}%` }}></div>
                  </div>
                  <span className="text-[10px] text-gray-400">{e.score_progression ?? 0}%</span>
                </div>
                <span className="text-xs text-gray-400 shrink-0">{e.nb_candidatures ?? 0} cand.</span>
                <svg className="w-3.5 h-3.5 text-gray-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
