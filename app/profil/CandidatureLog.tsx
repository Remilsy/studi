'use client'

import { useState, useMemo, useOptimistic, useTransition } from 'react'
import { addCandidature, updateCandidatureStatut, deleteCandidature } from './candidature-actions'

interface Candidature {
  id: string
  entreprise: string
  poste: string
  statut: string
  date_action: string
  notes: string | null
}

const STATUTS = [
  { key: 'envoye',     label: 'Envoyée',    color: '#3D553D', bg: '#E4EDE4', dot: '#5C7A5C',  border: '#A3BFA3' },
  { key: 'en_attente', label: 'En attente', color: '#C2410C', bg: '#FFF7ED', dot: '#F97316',  border: '#FCD9A0' },
  { key: 'entretien',  label: 'Entretien',  color: '#1D4ED8', bg: '#EFF6FF', dot: '#3B82F6',  border: '#BFDBFE' },
  { key: 'refus',      label: 'Refus',      color: '#9F1239', bg: '#FFF1F2', dot: '#F43F5E',  border: '#FECDD3' },
  { key: 'accepte',    label: 'Acceptée ✓', color: '#15803D', bg: '#F0FDF4', dot: '#16A34A',  border: '#BBF7D0' },
]

function getStatut(key: string) {
  return STATUTS.find(s => s.key === key) || STATUTS[0]
}

function nextStatut(key: string) {
  const idx = STATUTS.findIndex(s => s.key === key)
  return STATUTS[(idx + 1) % STATUTS.length].key
}

function getLevel(n: number) {
  if (n >= 20) return { label: 'Or',      emoji: '🥇', next: null,  color: '#92400E', bg: '#FEF3C7' }
  if (n >= 10) return { label: 'Argent',  emoji: '🥈', next: 20,   color: '#475569', bg: '#F1F5F9' }
  if (n >= 5)  return { label: 'Bronze',  emoji: '🥉', next: 10,   color: '#92400E', bg: '#FEF9EE' }
  return              { label: 'Débutant',emoji: '⭐',  next: 5,    color: '#6B7280', bg: '#F9FAFB' }
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

const today = new Date().toISOString().split('T')[0]

export default function CandidatureLog({
  initial,
  objectif,
}: {
  initial: Candidature[]
  objectif: number
}) {
  const [cands, setCands] = useState<Candidature[]>(initial)
  const [showForm, setShowForm] = useState(false)
  const [adding, setAdding] = useState(false)
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    entreprise: '', poste: '', statut: 'envoye', date_action: today, notes: '',
  })

  const stats = useMemo(() => ({
    total:     cands.length,
    envoye:    cands.filter(c => c.statut === 'envoye').length,
    attente:   cands.filter(c => c.statut === 'en_attente').length,
    entretien: cands.filter(c => c.statut === 'entretien').length,
    refus:     cands.filter(c => c.statut === 'refus').length,
    accepte:   cands.filter(c => c.statut === 'accepte').length,
  }), [cands])

  const level = getLevel(stats.total)
  const levelNext = level.next ?? stats.total
  const levelPct = level.next ? Math.min(Math.round((stats.total / level.next) * 100), 100) : 100
  const objectifPct = Math.min(Math.round((stats.total / objectif) * 100), 100)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!form.entreprise.trim() || !form.poste.trim()) return
    setAdding(true)
    const result = await addCandidature(form)
    if (result.success) {
      const tempId = crypto.randomUUID()
      setCands(prev => [{
        id: tempId,
        entreprise: form.entreprise,
        poste: form.poste,
        statut: form.statut,
        date_action: form.date_action,
        notes: form.notes || null,
      }, ...prev])
      setForm({ entreprise: '', poste: '', statut: 'envoye', date_action: today, notes: '' })
      setShowForm(false)
    }
    setAdding(false)
  }

  async function handleStatusCycle(id: string, statut: string) {
    const next = nextStatut(statut)
    setCands(prev => prev.map(c => c.id === id ? { ...c, statut: next } : c))
    setPendingId(id)
    await updateCandidatureStatut(id, next)
    setPendingId(null)
  }

  async function handleDelete(id: string) {
    setCands(prev => prev.filter(c => c.id !== id))
    await deleteCandidature(id)
  }

  const inputCls = "w-full px-3 py-2 rounded-xl border border-gray-200 text-sm text-gray-900 outline-none focus:border-[#5C7A5C] transition-colors bg-white"

  return (
    <div className="flex flex-col gap-3">

      {/* ── Stats live ── */}
      <div className="bg-white rounded-2xl border border-[#C8D8C8] p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ backgroundColor: level.bg }}>
              {level.emoji}
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Niveau {level.label}</p>
              <p className="text-2xl font-black text-gray-900 leading-none">{stats.total} <span className="text-sm font-normal text-gray-400">candidature{stats.total > 1 ? 's' : ''}</span></p>
            </div>
          </div>
          <button
            onClick={() => setShowForm(v => !v)}
            className="flex items-center gap-2 bg-[#3D553D] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#2D4030] transition-colors active:scale-95"
          >
            <span className="text-base leading-none">+</span>
            Nouvelle
          </button>
        </div>

        {/* Barre niveau */}
        {level.next && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] text-gray-400">Vers le niveau suivant</span>
              <span className="text-[10px] font-semibold" style={{ color: level.color }}>{stats.total}/{levelNext}</span>
            </div>
            <div className="h-1.5 bg-[#F3F4F6] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${levelPct}%`, backgroundColor: level.color }}></div>
            </div>
          </div>
        )}

        {/* Objectif semaine */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold text-gray-500">Objectif semaine</span>
            <span className="text-[10px] font-bold" style={{ color: objectifPct >= 100 ? '#16A34A' : '#5C7A5C' }}>
              {stats.total}/{objectif} {objectifPct >= 100 ? '✓' : ''}
            </span>
          </div>
          <div className="h-2 bg-[#E4EDE4] rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500" style={{ width: `${objectifPct}%`, backgroundColor: objectifPct >= 100 ? '#16A34A' : '#5C7A5C' }}></div>
          </div>
        </div>

        {/* Mini stats */}
        {stats.total > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {[
              { label: 'Envoyées',  val: stats.envoye,    s: STATUTS[0] },
              { label: 'Attente',   val: stats.attente,   s: STATUTS[1] },
              { label: 'Entretien', val: stats.entretien, s: STATUTS[2] },
              { label: 'Refus',     val: stats.refus,     s: STATUTS[3] },
              { label: 'Acceptées', val: stats.accepte,   s: STATUTS[4] },
            ].filter(x => x.val > 0).map(({ label, val, s }) => (
              <div key={label} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: s.bg, color: s.color }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.dot }}></div>
                {val} {label}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Formulaire ajout ── */}
      {showForm && (
        <div className="bg-white rounded-2xl border-2 border-[#5C7A5C] p-5">
          <p className="text-xs font-semibold text-[#5C7A5C] uppercase tracking-widest mb-4">Nouvelle candidature</p>
          <form onSubmit={handleAdd} className="flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Entreprise</label>
                <input
                  type="text" required autoFocus
                  placeholder="Apple, Google..."
                  value={form.entreprise}
                  onChange={e => setForm(f => ({ ...f, entreprise: e.target.value }))}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Poste</label>
                <input
                  type="text" required
                  placeholder="Designer, Dev..."
                  value={form.poste}
                  onChange={e => setForm(f => ({ ...f, poste: e.target.value }))}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Statut</label>
                <select
                  value={form.statut}
                  onChange={e => setForm(f => ({ ...f, statut: e.target.value }))}
                  className={inputCls}
                >
                  {STATUTS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Date</label>
                <input
                  type="date"
                  value={form.date_action}
                  onChange={e => setForm(f => ({ ...f, date_action: e.target.value }))}
                  className={inputCls}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Notes <span className="font-normal text-gray-300">(optionnel)</span></label>
              <input
                type="text"
                placeholder="Contact, source, remarques..."
                value={form.notes}
                onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                className={inputCls}
              />
            </div>
            <div className="flex gap-2 justify-end pt-1">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-xl text-sm text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors">
                Annuler
              </button>
              <button type="submit" disabled={adding} className="px-5 py-2 rounded-xl text-sm font-semibold bg-[#3D553D] text-white hover:bg-[#2D4030] transition-colors disabled:opacity-50">
                {adding ? 'Ajout...' : '+ Ajouter'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Liste ── */}
      {cands.length === 0 ? (
        <div
          className="bg-white rounded-2xl border-2 border-dashed border-[#C8D8C8] p-10 text-center cursor-pointer hover:border-[#5C7A5C] transition-colors"
          onClick={() => setShowForm(true)}
        >
          <p className="text-4xl mb-3">📋</p>
          <p className="text-sm font-semibold text-gray-700 mb-1">Commence à tracker tes candidatures</p>
          <p className="text-xs text-gray-400">Clique ici ou sur "+ Nouvelle" pour ajouter ta première candidature</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {cands.map(c => {
            const s = getStatut(c.statut)
            const isPending = pendingId === c.id
            return (
              <div
                key={c.id}
                className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden transition-all hover:shadow-sm"
                style={{ borderLeftWidth: '3px', borderLeftColor: s.dot }}
              >
                <div className="flex items-center gap-3 px-4 py-3">
                  {/* Infos */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-gray-900 truncate">{c.entreprise}</p>
                      <span className="text-gray-300 text-xs">·</span>
                      <p className="text-xs text-gray-500 truncate">{c.poste}</p>
                    </div>
                    {c.notes && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">{c.notes}</p>
                    )}
                  </div>

                  {/* Statut — cliquable */}
                  <button
                    onClick={() => handleStatusCycle(c.id, c.statut)}
                    disabled={isPending}
                    title="Cliquer pour changer le statut"
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all hover:opacity-80 active:scale-95 shrink-0 disabled:opacity-40"
                    style={{ backgroundColor: s.bg, color: s.color }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.dot }}></div>
                    {s.label}
                  </button>

                  {/* Date */}
                  <span className="text-[10px] text-gray-400 shrink-0 hidden sm:block">{formatDate(c.date_action)}</span>

                  {/* Supprimer */}
                  <button
                    onClick={() => handleDelete(c.id)}
                    className="w-6 h-6 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors shrink-0"
                  >
                    <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
