'use client'

import { useState, useMemo } from 'react'
import { addCandidature, updateCandidatureStatut, deleteCandidature } from '../candidature-actions'
import Link from 'next/link'

interface Candidature {
  id: string
  entreprise: string
  poste: string
  statut: string
  date_action: string
  notes: string | null
}

const STATUTS = [
  { key: 'envoye',     label: 'Envoyée',    short: 'Envoyée',   color: '#3D553D', bg: '#E4EDE4', dot: '#5C7A5C'  },
  { key: 'en_attente', label: 'En attente', short: 'Attente',   color: '#C2410C', bg: '#FFF7ED', dot: '#F97316'  },
  { key: 'entretien',  label: 'Entretien',  short: 'Entretien', color: '#1D4ED8', bg: '#EFF6FF', dot: '#3B82F6'  },
  { key: 'refus',      label: 'Refus',      short: 'Refus',     color: '#9F1239', bg: '#FFF1F2', dot: '#F43F5E'  },
  { key: 'accepte',    label: 'Acceptée',   short: 'Acceptée',  color: '#15803D', bg: '#F0FDF4', dot: '#16A34A'  },
]

function getS(key: string) { return STATUTS.find(s => s.key === key) || STATUTS[0] }
function nextS(key: string) {
  const idx = STATUTS.findIndex(s => s.key === key)
  return STATUTS[(idx + 1) % STATUTS.length].key
}
function getLevel(n: number) {
  if (n >= 20) return { label: 'Or',       emoji: '🥇', color: '#92400E', bg: '#FEF3C7', next: null }
  if (n >= 10) return { label: 'Argent',   emoji: '🥈', color: '#475569', bg: '#F1F5F9', next: 20   }
  if (n >= 5)  return { label: 'Bronze',   emoji: '🥉', color: '#92400E', bg: '#FEF9EE', next: 10   }
  return             { label: 'Débutant',  emoji: '⭐',  color: '#6B7280', bg: '#F9FAFB', next: 5    }
}
function formatDate(str: string) {
  const d = new Date(str)
  const today = new Date(); today.setHours(0,0,0,0)
  const diff = Math.round((today.getTime() - d.getTime()) / 86400000)
  if (diff === 0) return "Aujourd'hui"
  if (diff === 1) return 'Hier'
  if (diff < 7)   return `Il y a ${diff}j`
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

const EMPTY_FORM = { entreprise: '', poste: '', statut: 'envoye', date_action: new Date().toISOString().split('T')[0], notes: '' }

export default function CandidaturesClient({
  initial, objectif,
}: {
  initial: Candidature[]
  objectif: number
}) {
  const [cands, setCands]       = useState<Candidature[]>(initial)
  const [filter, setFilter]     = useState('toutes')
  const [search, setSearch]     = useState('')
  const [showForm, setShowForm] = useState(false)
  const [form, setForm]         = useState(EMPTY_FORM)
  const [adding, setAdding]     = useState(false)
  const [error, setError]       = useState('')
  const [pending, setPending]   = useState<string | null>(null)

  const stats = useMemo(() => ({
    total:     cands.length,
    envoye:    cands.filter(c => c.statut === 'envoye').length,
    attente:   cands.filter(c => c.statut === 'en_attente').length,
    entretien: cands.filter(c => c.statut === 'entretien').length,
    refus:     cands.filter(c => c.statut === 'refus').length,
    accepte:   cands.filter(c => c.statut === 'accepte').length,
    tauxReponse: cands.length > 0
      ? Math.round(((cands.filter(c => c.statut !== 'envoye').length) / cands.length) * 100)
      : 0,
  }), [cands])

  const level = getLevel(stats.total)
  const levelPct = level.next ? Math.min(Math.round((stats.total / level.next) * 100), 100) : 100
  const objectifPct = Math.min(Math.round((stats.total / objectif) * 100), 100)

  const filtered = useMemo(() => {
    let list = cands
    if (filter !== 'toutes') list = list.filter(c => c.statut === filter)
    if (search) list = list.filter(c =>
      c.entreprise.toLowerCase().includes(search.toLowerCase()) ||
      c.poste.toLowerCase().includes(search.toLowerCase())
    )
    return list
  }, [cands, filter, search])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (!form.entreprise.trim() || !form.poste.trim()) {
      setError('Entreprise et poste sont obligatoires.')
      return
    }
    setAdding(true)
    const result = await addCandidature(form)
    if ('error' in result && result.error) {
      setError(result.error)
      setAdding(false)
      return
    }
    setCands(prev => [{
      id: crypto.randomUUID(),
      entreprise:  form.entreprise,
      poste:       form.poste,
      statut:      form.statut,
      date_action: form.date_action,
      notes:       form.notes || null,
    }, ...prev])
    setForm(EMPTY_FORM)
    setShowForm(false)
    setAdding(false)
  }

  async function handleCycle(id: string, statut: string) {
    const next = nextS(statut)
    setCands(prev => prev.map(c => c.id === id ? { ...c, statut: next } : c))
    setPending(id)
    await updateCandidatureStatut(id, next)
    setPending(null)
  }

  async function handleDelete(id: string) {
    setCands(prev => prev.filter(c => c.id !== id))
    await deleteCandidature(id)
  }

  const inp = "w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#5C7A5C] transition-colors bg-white text-gray-900"

  return (
    <div className="min-h-screen bg-[#D6E6D6]">

      {/* Navbar */}
      <div className="bg-white border-b border-[#C8D8C8]">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/profil" className="text-xs text-gray-400 hover:text-gray-700 transition-colors">← Mon profil</Link>
            <span className="text-gray-200">|</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#5C7A5C]"></div>
              <span className="font-semibold text-gray-900 text-sm">Studi</span>
            </div>
          </div>
          <button
            onClick={() => { setShowForm(true); setError('') }}
            className="flex items-center gap-1.5 bg-[#3D553D] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#2D4030] transition-colors active:scale-95"
          >
            <span className="text-lg leading-none">+</span> Nouvelle candidature
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col gap-5">

        {/* ── STATS ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Total envoyées',    value: stats.total,      color: '#3D553D', bg: '#E4EDE4'  },
            { label: 'Taux de réponse',   value: `${stats.tauxReponse}%`, color: '#1D4ED8', bg: '#EFF6FF' },
            { label: 'Entretiens',        value: stats.entretien,  color: '#1D4ED8', bg: '#EFF6FF'  },
            { label: 'Acceptées',         value: stats.accepte,    color: '#15803D', bg: '#F0FDF4'  },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className="bg-white rounded-2xl border border-[#C8D8C8] p-5">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">{label}</p>
              <p className="text-3xl font-black tracking-tight" style={{ color }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Niveau + objectif */}
        <div className="bg-white rounded-2xl border border-[#C8D8C8] p-5 flex flex-col sm:flex-row gap-5">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0" style={{ backgroundColor: level.bg }}>
              {level.emoji}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-gray-500">Niveau {level.label}</span>
                {level.next && <span className="text-xs" style={{ color: level.color }}>{stats.total}/{level.next}</span>}
              </div>
              <div className="h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${levelPct}%`, backgroundColor: level.color }}></div>
              </div>
              {level.next && <p className="text-[10px] text-gray-400 mt-1">{level.next - stats.total} candidature{level.next - stats.total > 1 ? 's' : ''} avant le niveau suivant</p>}
            </div>
          </div>
          <div className="w-px bg-[#F3F4F6] hidden sm:block"></div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-gray-500">Objectif de la semaine</span>
              <span className="text-xs font-bold" style={{ color: objectifPct >= 100 ? '#16A34A' : '#5C7A5C' }}>
                {stats.total}/{objectif} {objectifPct >= 100 ? '✓' : ''}
              </span>
            </div>
            <div className="h-2 bg-[#E4EDE4] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${objectifPct}%`, backgroundColor: objectifPct >= 100 ? '#16A34A' : '#5C7A5C' }}></div>
            </div>
            {objectifPct >= 100 && <p className="text-[10px] text-green-600 font-semibold mt-1">Objectif atteint cette semaine !</p>}
          </div>
        </div>

        {/* ── FORMULAIRE AJOUT ── */}
        {showForm && (
          <div className="bg-white rounded-2xl border-2 border-[#5C7A5C] p-6">
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm font-bold text-gray-900">Nouvelle candidature</p>
              <button onClick={() => { setShowForm(false); setError('') }} className="text-gray-300 hover:text-gray-500 text-xl leading-none">×</button>
            </div>
            <form onSubmit={handleAdd} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Entreprise *</label>
                  <input autoFocus type="text" required placeholder="Apple, LVMH, Studio X..." value={form.entreprise}
                    onChange={e => setForm(f => ({ ...f, entreprise: e.target.value }))} className={inp} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Poste *</label>
                  <input type="text" required placeholder="Photographe, Designer, Dev..." value={form.poste}
                    onChange={e => setForm(f => ({ ...f, poste: e.target.value }))} className={inp} />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Statut</label>
                  <select value={form.statut} onChange={e => setForm(f => ({ ...f, statut: e.target.value }))} className={inp}>
                    {STATUTS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Date de candidature</label>
                  <input type="date" value={form.date_action}
                    onChange={e => setForm(f => ({ ...f, date_action: e.target.value }))} className={inp} />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Notes <span className="font-normal text-gray-300">(optionnel — source, contact, lien...)</span></label>
                <input type="text" placeholder="Ex : via LinkedIn · Contact : Marie Dupont" value={form.notes}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} className={inp} />
              </div>
              {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => { setShowForm(false); setError('') }}
                  className="px-5 py-2.5 rounded-xl text-sm text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors">
                  Annuler
                </button>
                <button type="submit" disabled={adding}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold bg-[#3D553D] text-white hover:bg-[#2D4030] transition-colors disabled:opacity-50 active:scale-95">
                  {adding ? 'Ajout en cours...' : '+ Ajouter'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ── FILTRES + RECHERCHE ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex gap-1 bg-white border border-[#C8D8C8] rounded-xl p-1 flex-wrap">
            {[
              { key: 'toutes',     label: `Toutes (${stats.total})` },
              { key: 'envoye',     label: `Envoyées (${stats.envoye})` },
              { key: 'en_attente', label: `En attente (${stats.attente})` },
              { key: 'entretien',  label: `Entretiens (${stats.entretien})` },
              { key: 'refus',      label: `Refus (${stats.refus})` },
              { key: 'accepte',    label: `Acceptées (${stats.accepte})` },
            ].map(({ key, label }) => {
              const s = STATUTS.find(x => x.key === key)
              return (
                <button key={key} onClick={() => setFilter(key)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={filter === key
                    ? { backgroundColor: s?.bg || '#E4EDE4', color: s?.color || '#3D553D' }
                    : { color: '#9CA3AF' }
                  }
                >
                  {label}
                </button>
              )
            })}
          </div>
          <input type="text" placeholder="Rechercher entreprise, poste..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 rounded-xl border border-[#C8D8C8] bg-white text-sm outline-none focus:border-[#5C7A5C] transition-colors" />
        </div>

        {/* ── LISTE ── */}
        {filtered.length === 0 && cands.length === 0 ? (
          <div
            className="bg-white rounded-2xl border-2 border-dashed border-[#C8D8C8] p-16 text-center cursor-pointer hover:border-[#5C7A5C] transition-colors"
            onClick={() => { setShowForm(true); setError('') }}
          >
            <p className="text-5xl mb-4">📋</p>
            <p className="text-base font-bold text-gray-800 mb-1">Commence à tracker tes candidatures</p>
            <p className="text-sm text-gray-400 mb-5">Chaque candidature envoyée te rapproche de ton objectif</p>
            <div className="inline-flex items-center gap-2 bg-[#3D553D] text-white px-5 py-2.5 rounded-xl text-sm font-semibold">
              + Ajouter ma première candidature
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#C8D8C8] p-10 text-center">
            <p className="text-sm text-gray-400">Aucune candidature pour ce filtre.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map(c => {
              const s = getS(c.statut)
              return (
                <div key={c.id}
                  className="bg-white rounded-xl border border-[#E5E7EB] hover:shadow-sm transition-all overflow-hidden"
                  style={{ borderLeftWidth: '3px', borderLeftColor: s.dot }}
                >
                  <div className="flex items-center gap-4 px-5 py-4">
                    {/* Initiale entreprise */}
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0"
                      style={{ backgroundColor: s.bg, color: s.color }}>
                      {c.entreprise[0].toUpperCase()}
                    </div>

                    {/* Infos */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-gray-900">{c.entreprise}</span>
                        <span className="text-gray-300">·</span>
                        <span className="text-sm text-gray-600">{c.poste}</span>
                      </div>
                      {c.notes && (
                        <p className="text-xs text-gray-400 mt-0.5 truncate">{c.notes}</p>
                      )}
                    </div>

                    {/* Date */}
                    <span className="text-xs text-gray-400 shrink-0 hidden sm:block">{formatDate(c.date_action)}</span>

                    {/* Statut — cliquer pour changer */}
                    <button
                      onClick={() => handleCycle(c.id, c.statut)}
                      disabled={pending === c.id}
                      title="Cliquer pour changer le statut"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:scale-105 active:scale-95 shrink-0 disabled:opacity-50"
                      style={{ backgroundColor: s.bg, color: s.color }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.dot }}></div>
                      {s.label}
                    </button>

                    {/* Supprimer */}
                    <button onClick={() => handleDelete(c.id)}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors shrink-0">
                      <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
