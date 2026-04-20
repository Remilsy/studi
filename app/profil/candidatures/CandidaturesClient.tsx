'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { addCandidature, updateCandidatureStatut, updateCandidature, deleteCandidature } from '../candidature-actions'

interface Candidature {
  id: string
  entreprise: string
  poste: string
  statut: string
  date_action: string
  notes: string | null
  url: string | null
}

const STATUTS = [
  { key: 'envoye',     label: 'Envoyée',    color: '#3D553D', bg: '#E4EDE4', dot: '#5C7A5C'  },
  { key: 'en_attente', label: 'En attente', color: '#C2410C', bg: '#FFF7ED', dot: '#F97316'  },
  { key: 'entretien',  label: 'Entretien',  color: '#1D4ED8', bg: '#EFF6FF', dot: '#3B82F6'  },
  { key: 'refus',      label: 'Refus',      color: '#9F1239', bg: '#FFF1F2', dot: '#F43F5E'  },
  { key: 'accepte',    label: 'Acceptée',   color: '#15803D', bg: '#F0FDF4', dot: '#16A34A'  },
]

function getS(key: string) { return STATUTS.find(s => s.key === key) || STATUTS[0] }

function getLevel(n: number) {
  if (n >= 20) return { label: 'Or',      emoji: '🥇', color: '#92400E', bg: '#FEF3C7', next: null }
  if (n >= 10) return { label: 'Argent',  emoji: '🥈', color: '#475569', bg: '#F1F5F9', next: 20   }
  if (n >= 5)  return { label: 'Bronze',  emoji: '🥉', color: '#92400E', bg: '#FEF9EE', next: 10   }
  return             { label: 'Débutant', emoji: '⭐',  color: '#6B7280', bg: '#F9FAFB', next: 5    }
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

function isRelance(c: Candidature) {
  if (c.statut !== 'en_attente') return false
  const days = Math.round((new Date().getTime() - new Date(c.date_action).getTime()) / 86400000)
  return days >= 7
}

const TODAY = new Date().toISOString().split('T')[0]
const EMPTY = { entreprise: '', poste: '', statut: 'envoye', date_action: TODAY, notes: '', url: '' }

// ── Stepper de statut ────────────────────────────────────────
function StatusStepper({ id, statut, onChange }: {
  id: string; statut: string; onChange: (id: string, s: string) => void
}) {
  const currentIdx = STATUTS.findIndex(s => s.key === statut)

  return (
    <div className="px-4 pb-4 pt-1">
      <p className="text-[9px] font-semibold text-gray-400 uppercase tracking-widest mb-2">
        Avancement — clique pour changer
      </p>
      <div className="flex items-center">
        {STATUTS.map((opt, idx) => {
          const isCurrent = statut === opt.key
          const isPast    = idx < currentIdx

          return (
            <div key={opt.key} className="flex items-center flex-1 last:flex-none">
              {/* Bouton étape */}
              <button
                onClick={() => onChange(id, opt.key)}
                title={`Marquer comme : ${opt.label}`}
                className="flex flex-col items-center gap-1 group shrink-0"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center transition-all border-2 group-hover:scale-110"
                  style={
                    isCurrent ? { backgroundColor: opt.dot, borderColor: opt.dot } :
                    isPast    ? { backgroundColor: 'white',  borderColor: opt.dot } :
                                { backgroundColor: 'white',  borderColor: '#E5E7EB' }
                  }
                >
                  {isCurrent && <div className="w-2.5 h-2.5 rounded-full bg-white"></div>}
                  {isPast && (
                    <svg width="10" height="10" fill="none" stroke={opt.dot} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                    </svg>
                  )}
                </div>
                <span
                  className="text-[9px] font-bold w-12 text-center leading-tight transition-colors"
                  style={{ color: isCurrent ? opt.color : isPast ? opt.dot : '#D1D5DB' }}
                >
                  {opt.label === 'En attente' ? 'Attente' : opt.label}
                </span>
              </button>

              {/* Ligne connecteur */}
              {idx < STATUTS.length - 1 && (
                <div
                  className="flex-1 h-0.5 mx-1 mb-4 transition-colors"
                  style={{ backgroundColor: idx < currentIdx ? STATUTS[idx].dot : '#E5E7EB' }}
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Graphe d'activité ────────────────────────────────────────
function ActivityGraph({ cands }: { cands: Candidature[] }) {
  const weeks = useMemo(() => {
    const result = []
    for (let i = 7; i >= 0; i--) {
      const ref = new Date(); ref.setHours(0,0,0,0)
      ref.setDate(ref.getDate() - ref.getDay() - i * 7)
      const end = new Date(ref); end.setDate(end.getDate() + 6); end.setHours(23,59,59,999)
      const count = cands.filter(c => {
        const d = new Date(c.date_action)
        return d >= ref && d <= end
      }).length
      result.push({ label: ref.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }), count })
    }
    return result
  }, [cands])

  const max = Math.max(...weeks.map(w => w.count), 1)
  const total = weeks.reduce((s, w) => s + w.count, 0)

  return (
    <div className="bg-white rounded-2xl border border-[#C8D8C8] p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Activité · 8 dernières semaines</p>
        <span className="text-xs font-bold text-[#5C7A5C]">{total} candidature{total > 1 ? 's' : ''}</span>
      </div>
      <div className="flex items-end gap-1.5 h-16">
        {weeks.map((w, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
            <div className="relative flex-1 w-full flex items-end">
              <div
                className="w-full rounded-t-md transition-all duration-500 group-hover:opacity-80"
                style={{
                  height: `${Math.max((w.count / max) * 100, w.count > 0 ? 15 : 5)}%`,
                  backgroundColor: w.count > 0 ? '#5C7A5C' : '#E4EDE4',
                }}
              ></div>
              {w.count > 0 && (
                <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-bold text-[#3D553D] opacity-0 group-hover:opacity-100 transition-opacity">
                  {w.count}
                </span>
              )}
            </div>
            <span className="text-[8px] text-gray-400 truncate w-full text-center">{w.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Formulaire ajout/edit inline ─────────────────────────────
function CandidatureForm({
  title, values, onChange, onSubmit, onCancel, submitting, error,
}: {
  title: string
  values: typeof EMPTY
  onChange: (f: typeof EMPTY) => void
  onSubmit: (e: React.FormEvent) => void
  onCancel: () => void
  submitting: boolean
  error: string
}) {
  const inp = "w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#5C7A5C] transition-colors bg-white text-gray-900"
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1.5 block">Entreprise *</label>
          <input autoFocus type="text" required placeholder="Apple, LVMH..." value={values.entreprise}
            onChange={e => onChange({ ...values, entreprise: e.target.value })} className={inp} />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1.5 block">Poste *</label>
          <input type="text" required placeholder="Photographe, Designer..." value={values.poste}
            onChange={e => onChange({ ...values, poste: e.target.value })} className={inp} />
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1.5 block">Statut</label>
          <select value={values.statut} onChange={e => onChange({ ...values, statut: e.target.value })} className={inp}>
            {STATUTS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1.5 block">Date</label>
          <input type="date" value={values.date_action}
            onChange={e => onChange({ ...values, date_action: e.target.value })} className={inp} />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-gray-500 mb-1.5 block">Lien de l'offre <span className="font-normal text-gray-300">(optionnel)</span></label>
          <input type="url" placeholder="https://..." value={values.url}
            onChange={e => onChange({ ...values, url: e.target.value })} className={inp} />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-gray-500 mb-1.5 block">Notes <span className="font-normal text-gray-300">(contact, source...)</span></label>
          <input type="text" placeholder="Via LinkedIn · Contact : Marie Dupont" value={values.notes}
            onChange={e => onChange({ ...values, notes: e.target.value })} className={inp} />
        </div>
      </div>
      {error && <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel}
          className="px-4 py-2 rounded-xl text-sm text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors">
          Annuler
        </button>
        <button type="submit" disabled={submitting}
          className="px-5 py-2 rounded-xl text-sm font-bold bg-[#3D553D] text-white hover:bg-[#2D4030] transition-colors disabled:opacity-50 active:scale-95">
          {submitting ? 'Sauvegarde...' : title}
        </button>
      </div>
    </form>
  )
}

// ── Carte candidature ────────────────────────────────────────
function CandidatureCard({
  c, editId, editData, onStatusChange, onEdit, onSaveEdit, onCancelEdit, onDelete, onEditChange, saving,
}: {
  c: Candidature
  editId: string | null
  editData: typeof EMPTY | null
  onStatusChange: (id: string, s: string) => void
  onEdit: (c: Candidature) => void
  onSaveEdit: (e: React.FormEvent) => void
  onCancelEdit: () => void
  onDelete: (id: string) => void
  onEditChange: (f: typeof EMPTY) => void
  saving: boolean
}) {
  const s = getS(c.statut)
  const relance = isRelance(c)
  const isEditing = editId === c.id

  return (
    <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden transition-all hover:shadow-sm"
      style={{ borderLeftWidth: '3px', borderLeftColor: s.dot }}>

      {/* Ligne principale */}
      <div className="flex items-center gap-3 px-4 pt-3 pb-2">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0"
          style={{ backgroundColor: s.bg, color: s.color }}>
          {c.entreprise[0]?.toUpperCase()}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-gray-900">{c.entreprise}</span>
            <span className="text-gray-300 text-xs">·</span>
            <span className="text-sm text-gray-500">{c.poste}</span>
            {relance && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-500 border border-orange-200">
                🔔 À relancer
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            {c.notes && <p className="text-xs text-gray-400 truncate max-w-48">{c.notes}</p>}
            {c.url && (
              <a href={c.url} target="_blank" rel="noopener noreferrer"
                className="text-xs text-[#5C7A5C] hover:underline shrink-0">↗ Voir l'offre</a>
            )}
          </div>
        </div>

        <span className="text-xs text-gray-400 shrink-0 hidden sm:block">{formatDate(c.date_action)}</span>

        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => onEdit(c)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-[#5C7A5C] hover:bg-[#E4EDE4] transition-colors">
            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
          </button>
          <button onClick={() => onDelete(c.id)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors">
            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Stepper de statut — toujours visible */}
      <StatusStepper id={c.id} statut={c.statut} onChange={onStatusChange} />

      {/* Formulaire édition inline */}
      {isEditing && editData && (
        <div className="border-t border-[#F3F4F6] px-4 py-4 bg-[#FAFAFA]">
          <CandidatureForm
            title="Sauvegarder"
            values={editData}
            onChange={onEditChange}
            onSubmit={onSaveEdit}
            onCancel={onCancelEdit}
            submitting={saving}
            error=""
          />
        </div>
      )}
    </div>
  )
}

// ── Vue Kanban ───────────────────────────────────────────────
function KanbanView({ cands, onStatusChange, onEdit, onDelete, editId, editData, onSaveEdit, onCancelEdit, onEditChange, saving }: any) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-4">
      {STATUTS.map(s => {
        const col = cands.filter((c: Candidature) => c.statut === s.key)
        return (
          <div key={s.key} className="flex-shrink-0 w-64 flex flex-col gap-2">
            <div className="flex items-center gap-2 px-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.dot }}></div>
              <span className="text-xs font-bold text-gray-600">{s.label}</span>
              <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: s.bg, color: s.color }}>{col.length}</span>
            </div>
            <div className="flex flex-col gap-2 min-h-16">
              {col.map((c: Candidature) => (
                <CandidatureCard key={c.id} c={c} editId={editId} editData={editData}
                  onStatusChange={onStatusChange} onEdit={onEdit} onSaveEdit={onSaveEdit}
                  onCancelEdit={onCancelEdit} onDelete={onDelete} onEditChange={onEditChange} saving={saving} />
              ))}
              {col.length === 0 && (
                <div className="border-2 border-dashed border-[#E5E7EB] rounded-xl h-16 flex items-center justify-center">
                  <span className="text-xs text-gray-300">Vide</span>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Composant principal ──────────────────────────────────────
export default function CandidaturesClient({ initial, objectif }: { initial: Candidature[]; objectif: number }) {
  const [cands, setCands]       = useState<Candidature[]>(initial)
  const [view, setView]         = useState<'liste' | 'kanban'>('liste')
  const [filter, setFilter]     = useState('toutes')
  const [search, setSearch]     = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId]     = useState<string | null>(null)
  const [editData, setEditData] = useState<typeof EMPTY | null>(null)
  const [form, setForm]         = useState(EMPTY)
  const [adding, setAdding]     = useState(false)
  const [saving, setSaving]     = useState(false)
  const [addError, setAddError] = useState('')

  const stats = useMemo(() => ({
    total:      cands.length,
    envoye:     cands.filter(c => c.statut === 'envoye').length,
    attente:    cands.filter(c => c.statut === 'en_attente').length,
    entretien:  cands.filter(c => c.statut === 'entretien').length,
    refus:      cands.filter(c => c.statut === 'refus').length,
    accepte:    cands.filter(c => c.statut === 'accepte').length,
    tauxReponse: cands.length > 0
      ? Math.round((cands.filter(c => c.statut !== 'envoye').length / cands.length) * 100) : 0,
    relances:   cands.filter(isRelance).length,
  }), [cands])

  const level = getLevel(stats.total)
  const levelPct = level.next ? Math.min(Math.round((stats.total / level.next) * 100), 100) : 100
  const objectifPct = Math.min(Math.round((stats.total / objectif) * 100), 100)

  const filtered = useMemo(() => {
    let list = cands
    if (view === 'liste' && filter !== 'toutes') list = list.filter(c => c.statut === filter)
    if (search) list = list.filter(c =>
      c.entreprise.toLowerCase().includes(search.toLowerCase()) ||
      c.poste.toLowerCase().includes(search.toLowerCase())
    )
    return list
  }, [cands, filter, search, view])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setAddError('')
    setAdding(true)
    const result = await addCandidature(form)
    if ('error' in result && result.error) { setAddError(result.error); setAdding(false); return }
    setCands(prev => [{ id: crypto.randomUUID(), ...form, notes: form.notes || null, url: form.url || null }, ...prev])
    setForm(EMPTY)
    setShowForm(false)
    setAdding(false)
  }

  async function handleStatusChange(id: string, statut: string) {
    setCands(prev => prev.map(c => c.id === id ? { ...c, statut } : c))
    await updateCandidatureStatut(id, statut)
  }

  function handleEdit(c: Candidature) {
    setEditId(c.id)
    setEditData({ entreprise: c.entreprise, poste: c.poste, statut: c.statut, date_action: c.date_action, notes: c.notes || '', url: c.url || '' })
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault()
    if (!editId || !editData) return
    setSaving(true)
    const result = await updateCandidature(editId, { ...editData, notes: editData.notes || null, url: editData.url || null })
    if (!('error' in result)) {
      setCands(prev => prev.map(c => c.id === editId ? { ...c, ...editData, notes: editData.notes || null, url: editData.url || null } : c))
      setEditId(null)
      setEditData(null)
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    setCands(prev => prev.filter(c => c.id !== id))
    await deleteCandidature(id)
  }

  return (
    <div className="min-h-screen bg-[#D6E6D6]">

      {/* Navbar */}
      <div className="bg-white border-b border-[#C8D8C8]">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/profil"
              className="flex items-center gap-2 bg-[#E4EDE4] hover:bg-[#D6E6D6] text-[#3D553D] px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
              </svg>
              Mon profil
            </Link>
            <div className="flex items-center gap-2 hidden sm:flex">
              <div className="w-2 h-2 rounded-full bg-[#5C7A5C]"></div>
              <span className="font-semibold text-gray-900 text-sm">Studi</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Toggle vue */}
            <div className="flex bg-gray-100 rounded-lg p-0.5">
              {(['liste', 'kanban'] as const).map(v => (
                <button key={v} onClick={() => setView(v)}
                  className="px-3 py-1.5 rounded-md text-xs font-semibold transition-all capitalize"
                  style={view === v ? { backgroundColor: 'white', color: '#3D553D', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' } : { color: '#9CA3AF' }}>
                  {v === 'liste' ? 'Liste' : 'Kanban'}
                </button>
              ))}
            </div>
            <button onClick={() => { setShowForm(true); setAddError('') }}
              className="flex items-center gap-1.5 bg-[#3D553D] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#2D4030] transition-colors active:scale-95">
              <span className="text-lg leading-none">+</span> Nouvelle
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 flex flex-col gap-4">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Total',        value: stats.total,               color: '#3D553D', bg: '#E4EDE4' },
            { label: 'Taux réponse', value: `${stats.tauxReponse}%`,   color: '#1D4ED8', bg: '#EFF6FF' },
            { label: 'Entretiens',   value: stats.entretien,           color: '#1D4ED8', bg: '#EFF6FF' },
            { label: stats.relances > 0 ? `À relancer (${stats.relances})` : 'Acceptées',
              value: stats.relances > 0 ? stats.relances : stats.accepte,
              color: stats.relances > 0 ? '#C2410C' : '#15803D',
              bg:    stats.relances > 0 ? '#FFF7ED' : '#F0FDF4' },
          ].map(({ label, value, color }) => (
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
              {level.next && <p className="text-[10px] text-gray-400 mt-1">{level.next - stats.total} avant le niveau suivant</p>}
            </div>
          </div>
          <div className="w-px bg-[#F3F4F6] hidden sm:block"></div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-gray-500">Objectif semaine</span>
              <span className="text-xs font-bold" style={{ color: objectifPct >= 100 ? '#16A34A' : '#5C7A5C' }}>
                {stats.total}/{objectif} {objectifPct >= 100 ? '✓' : ''}
              </span>
            </div>
            <div className="h-2 bg-[#E4EDE4] rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${objectifPct}%`, backgroundColor: objectifPct >= 100 ? '#16A34A' : '#5C7A5C' }}></div>
            </div>
            {objectifPct >= 100 && <p className="text-[10px] text-green-600 font-semibold mt-1">Objectif atteint !</p>}
          </div>
        </div>

        {/* Graphe d'activité */}
        <ActivityGraph cands={cands} />

        {/* Formulaire ajout */}
        {showForm && (
          <div className="bg-white rounded-2xl border-2 border-[#5C7A5C] p-6">
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm font-bold text-gray-900">Nouvelle candidature</p>
              <button onClick={() => setShowForm(false)} className="text-gray-300 hover:text-gray-500 text-xl">×</button>
            </div>
            <CandidatureForm title="+ Ajouter" values={form} onChange={setForm}
              onSubmit={handleAdd} onCancel={() => setShowForm(false)} submitting={adding} error={addError} />
          </div>
        )}

        {/* Filtres + recherche (liste seulement) */}
        {view === 'liste' && (
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex gap-1 bg-white border border-[#C8D8C8] rounded-xl p-1 flex-wrap">
              {[
                { key: 'toutes',     label: `Toutes (${stats.total})` },
                { key: 'envoye',     label: `Envoyées (${stats.envoye})` },
                { key: 'en_attente', label: `Attente (${stats.attente})` },
                { key: 'entretien',  label: `Entretiens (${stats.entretien})` },
                { key: 'refus',      label: `Refus (${stats.refus})` },
                { key: 'accepte',    label: `Acceptées (${stats.accepte})` },
              ].map(({ key, label }) => {
                const opt = STATUTS.find(x => x.key === key)
                return (
                  <button key={key} onClick={() => setFilter(key)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                    style={filter === key ? { backgroundColor: opt?.bg || '#E4EDE4', color: opt?.color || '#3D553D' } : { color: '#9CA3AF' }}>
                    {label}
                  </button>
                )
              })}
            </div>
            <input type="text" placeholder="Rechercher..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 rounded-xl border border-[#C8D8C8] bg-white text-sm outline-none focus:border-[#5C7A5C]" />
          </div>
        )}

        {/* Recherche en kanban */}
        {view === 'kanban' && (
          <input type="text" placeholder="Rechercher dans le tableau..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="px-4 py-2 rounded-xl border border-[#C8D8C8] bg-white text-sm outline-none focus:border-[#5C7A5C]" />
        )}

        {/* Contenu principal */}
        {cands.length === 0 ? (
          <div className="bg-white rounded-2xl border-2 border-dashed border-[#C8D8C8] p-16 text-center cursor-pointer hover:border-[#5C7A5C] transition-colors"
            onClick={() => { setShowForm(true); setAddError('') }}>
            <p className="text-5xl mb-4">📋</p>
            <p className="text-base font-bold text-gray-800 mb-1">Commence à tracker tes candidatures</p>
            <p className="text-sm text-gray-400 mb-5">Chaque candidature te rapproche de ton objectif</p>
            <div className="inline-flex items-center gap-2 bg-[#3D553D] text-white px-5 py-2.5 rounded-xl text-sm font-semibold">
              + Ajouter ma première candidature
            </div>
          </div>
        ) : view === 'kanban' ? (
          <KanbanView cands={filtered} onStatusChange={handleStatusChange} onEdit={handleEdit}
            onDelete={handleDelete} editId={editId} editData={editData} onSaveEdit={handleSaveEdit}
            onCancelEdit={() => { setEditId(null); setEditData(null) }} onEditChange={setEditData} saving={saving} />
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#C8D8C8] p-10 text-center">
            <p className="text-sm text-gray-400">Aucune candidature pour ce filtre.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map(c => (
              <CandidatureCard key={c.id} c={c} editId={editId} editData={editData}
                onStatusChange={handleStatusChange} onEdit={handleEdit} onSaveEdit={handleSaveEdit}
                onCancelEdit={() => { setEditId(null); setEditData(null) }} onDelete={handleDelete}
                onEditChange={setEditData} saving={saving} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
