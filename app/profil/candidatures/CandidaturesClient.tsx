'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { addCandidature, updateCandidatureStatut, updateCandidature, deleteCandidature } from '../candidature-actions'
import ParallaxOrbs from '../../components/ParallaxOrbs'

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
  { key: 'envoye',     label: 'Envoyée',    color: '#3D553D', bg: 'rgba(92,122,92,0.12)',  dot: '#5C7A5C'  },
  { key: 'en_attente', label: 'En attente', color: '#C2410C', bg: 'rgba(249,115,22,0.12)', dot: '#F97316'  },
  { key: 'entretien',  label: 'Entretien',  color: '#1D4ED8', bg: 'rgba(59,130,246,0.12)', dot: '#3B82F6'  },
  { key: 'refus',      label: 'Refus',      color: '#9F1239', bg: 'rgba(244,63,94,0.12)',  dot: '#F43F5E'  },
  { key: 'accepte',    label: 'Acceptée',   color: '#15803D', bg: 'rgba(34,197,94,0.12)',  dot: '#16A34A'  },
]

const glass = {
  background: 'linear-gradient(145deg, var(--dash-card-from) 0%, var(--dash-card-to) 100%)',
  backdropFilter: 'blur(60px)',
  WebkitBackdropFilter: 'blur(60px)',
  border: '1px solid var(--dash-card-border)',
  borderRadius: '20px',
  boxShadow: 'inset 0 1px 0 var(--dash-card-inset)',
} as const

const ctrlBase: React.CSSProperties = {
  background: 'rgba(255,255,255,0.7)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  border: '1px solid rgba(255,255,255,0.9)',
  color: '#111827',
  borderRadius: '12px',
  padding: '8px 12px',
  fontSize: '13px',
  outline: 'none',
  width: '100%',
}

function getS(key: string) { return STATUTS.find(s => s.key === key) || STATUTS[0] }

function getLevel(n: number) {
  if (n >= 20) return { label: 'Or',      emoji: '🥇', color: '#92400E', bg: 'rgba(254,243,199,0.6)', next: null }
  if (n >= 10) return { label: 'Argent',  emoji: '🥈', color: '#475569', bg: 'rgba(241,245,249,0.6)', next: 20   }
  if (n >= 5)  return { label: 'Bronze',  emoji: '🥉', color: '#92400E', bg: 'rgba(254,249,238,0.6)', next: 10   }
  return             { label: 'Débutant', emoji: '⭐',  color: '#6B7280', bg: 'rgba(249,250,251,0.6)', next: 5    }
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
      <p className="text-[9px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--dash-section-label)' }}>
        Avancement — clique pour changer
      </p>
      <div className="flex items-center">
        {STATUTS.map((opt, idx) => {
          const isCurrent = statut === opt.key
          const isPast    = idx < currentIdx
          return (
            <div key={opt.key} className="flex items-center flex-1 last:flex-none">
              <button onClick={() => onChange(id, opt.key)} title={`Marquer comme : ${opt.label}`}
                className="flex flex-col items-center gap-1 group shrink-0">
                <div className="w-8 h-8 rounded-full flex items-center justify-center transition-all border-2 group-hover:scale-110"
                  style={
                    isCurrent ? { backgroundColor: opt.dot, borderColor: opt.dot } :
                    isPast    ? { backgroundColor: 'rgba(255,255,255,0.8)', borderColor: opt.dot } :
                                { backgroundColor: 'rgba(255,255,255,0.4)', borderColor: 'rgba(0,0,0,0.12)' }
                  }>
                  {isCurrent && <div className="w-2.5 h-2.5 rounded-full bg-white"></div>}
                  {isPast && (
                    <svg width="10" height="10" fill="none" stroke={opt.dot} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/>
                    </svg>
                  )}
                </div>
                <span className="text-[9px] font-bold w-12 text-center leading-tight transition-colors"
                  style={{ color: isCurrent ? opt.color : isPast ? opt.dot : 'rgba(0,0,0,0.2)' }}>
                  {opt.label === 'En attente' ? 'Attente' : opt.label}
                </span>
              </button>
              {idx < STATUTS.length - 1 && (
                <div className="flex-1 h-0.5 mx-1 mb-4 transition-colors"
                  style={{ backgroundColor: idx < currentIdx ? STATUTS[idx].dot : 'rgba(0,0,0,0.1)' }} />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Graphe d'activité ────────────────────────────────────────
const MOIS = [
  { key: '2026-04', label: 'Avril' },
  { key: '2026-05', label: 'Mai' },
  { key: '2026-06', label: 'Juin' },
  { key: '2026-07', label: 'Juillet' },
  { key: '2026-08', label: 'Août' },
]

function ActivityGraph({ cands }: { cands: Candidature[] }) {
  const data = useMemo(() =>
    MOIS.map(m => ({ ...m, count: cands.filter(c => c.date_action?.startsWith(m.key)).length }))
  , [cands])

  const max   = Math.max(...data.map(m => m.count), 1)
  const total = data.reduce((s, m) => s + m.count, 0)
  const now   = new Date().toISOString().slice(0, 7)

  return (
    <div style={{ ...glass, padding: '24px' }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--dash-section-label)' }}>Activité mensuelle</p>
          <p className="text-sm font-semibold mt-0.5" style={{ color: 'var(--dash-header-title)' }}>Avril → Août 2026</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black" style={{ color: '#3D553D' }}>{total}</p>
          <p className="text-xs" style={{ color: 'var(--dash-header-sub)' }}>candidature{total > 1 ? 's' : ''}</p>
        </div>
      </div>
      <div className="flex items-end gap-4 h-36">
        {data.map(m => {
          const pct      = m.count > 0 ? Math.max((m.count / max) * 100, 12) : 4
          const isCur    = m.key === now
          const barColor = isCur ? '#3D553D' : m.count > 0 ? '#5C7A5C' : 'rgba(0,0,0,0.08)'
          return (
            <div key={m.key} className="flex-1 flex flex-col items-center gap-2">
              <div className="h-5 flex items-end justify-center">
                {m.count > 0 && (
                  <span className="text-sm font-black" style={{ color: isCur ? '#3D553D' : '#5C7A5C' }}>
                    {m.count}
                  </span>
                )}
              </div>
              <div className="w-full flex items-end" style={{ height: '80px' }}>
                <div className="w-full rounded-t-xl transition-all duration-700"
                  style={{ height: `${pct}%`, backgroundColor: barColor, minHeight: '4px',
                    boxShadow: isCur ? '0 -2px 8px rgba(61,85,61,0.25)' : 'none' }} />
              </div>
              <div className="text-center">
                <p className="text-xs font-bold" style={{ color: isCur ? '#3D553D' : 'var(--dash-header-sub)' }}>{m.label}</p>
                {isCur && <div className="w-1 h-1 rounded-full bg-[#5C7A5C] mx-auto mt-0.5"></div>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Formulaire ajout/edit ────────────────────────────────────
function CandidatureForm({ title, values, onChange, onSubmit, onCancel, submitting, error }: {
  title: string; values: typeof EMPTY; onChange: (f: typeof EMPTY) => void
  onSubmit: (e: React.FormEvent) => void; onCancel: () => void; submitting: boolean; error: string
}) {
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--dash-header-sub)' }}>Entreprise *</label>
          <input autoFocus type="text" required placeholder="Apple, LVMH..." value={values.entreprise}
            onChange={e => onChange({ ...values, entreprise: e.target.value })} style={ctrlBase} />
        </div>
        <div>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--dash-header-sub)' }}>Poste *</label>
          <input type="text" required placeholder="Photographe, Designer..." value={values.poste}
            onChange={e => onChange({ ...values, poste: e.target.value })} style={ctrlBase} />
        </div>
        <div>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--dash-header-sub)' }}>Statut</label>
          <select value={values.statut} onChange={e => onChange({ ...values, statut: e.target.value })} style={ctrlBase}>
            {STATUTS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--dash-header-sub)' }}>Date</label>
          <input type="date" value={values.date_action}
            onChange={e => onChange({ ...values, date_action: e.target.value })} style={ctrlBase} />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--dash-header-sub)' }}>Lien de l'offre <span className="font-normal" style={{ color: 'var(--dash-section-label)' }}>(optionnel)</span></label>
          <input type="url" placeholder="https://..." value={values.url}
            onChange={e => onChange({ ...values, url: e.target.value })} style={ctrlBase} />
        </div>
        <div className="sm:col-span-2">
          <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--dash-header-sub)' }}>Notes <span className="font-normal" style={{ color: 'var(--dash-section-label)' }}>(contact, source...)</span></label>
          <input type="text" placeholder="Via LinkedIn · Contact : Marie Dupont" value={values.notes}
            onChange={e => onChange({ ...values, notes: e.target.value })} style={ctrlBase} />
        </div>
      </div>
      {error && <p className="text-xs px-3 py-2 rounded-lg" style={{ color: '#EF4444', background: 'rgba(239,68,68,0.1)' }}>{error}</p>}
      <div className="flex gap-2 justify-end">
        <button type="button" onClick={onCancel}
          style={{ ...ctrlBase, width: 'auto', padding: '8px 16px', cursor: 'pointer' }}>
          Annuler
        </button>
        <button type="submit" disabled={submitting}
          style={{ ...ctrlBase, width: 'auto', padding: '8px 20px', background: 'rgba(61,85,61,0.85)', color: 'white', fontWeight: 700, cursor: 'pointer', opacity: submitting ? 0.6 : 1 }}>
          {submitting ? 'Sauvegarde...' : title}
        </button>
      </div>
    </form>
  )
}

// ── Carte candidature ────────────────────────────────────────
function CandidatureCard({ c, editId, editData, onStatusChange, onEdit, onSaveEdit, onCancelEdit, onDelete, onEditChange, saving }: {
  c: Candidature; editId: string | null; editData: typeof EMPTY | null
  onStatusChange: (id: string, s: string) => void; onEdit: (c: Candidature) => void
  onSaveEdit: (e: React.FormEvent) => void; onCancelEdit: () => void
  onDelete: (id: string) => void; onEditChange: (f: typeof EMPTY) => void; saving: boolean
}) {
  const s = getS(c.statut)
  const relance = isRelance(c)
  const isEditing = editId === c.id

  return (
    <div style={{ ...glass, borderLeft: `3px solid ${s.dot}`, overflow: 'hidden' }}>
      <div className="flex items-center gap-3 px-4 pt-3 pb-2">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0"
          style={{ backgroundColor: s.bg, color: s.color }}>
          {c.entreprise[0]?.toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold" style={{ color: 'var(--dash-header-title)' }}>{c.entreprise}</span>
            <span style={{ color: 'var(--dash-section-label)' }} className="text-xs">·</span>
            <span className="text-sm" style={{ color: 'var(--dash-header-sub)' }}>{c.poste}</span>
            {relance && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(249,115,22,0.1)', color: '#EA580C', border: '1px solid rgba(249,115,22,0.3)' }}>
                🔔 À relancer
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            {c.notes && <p className="text-xs truncate max-w-48" style={{ color: 'var(--dash-section-label)' }}>{c.notes}</p>}
            {c.url && (
              <a href={c.url} target="_blank" rel="noopener noreferrer"
                className="text-xs hover:underline shrink-0" style={{ color: '#5C7A5C' }}>↗ Voir l'offre</a>
            )}
          </div>
        </div>
        <span className="text-xs shrink-0 hidden sm:block" style={{ color: 'var(--dash-section-label)' }}>{formatDate(c.date_action)}</span>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => onEdit(c)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: 'rgba(0,0,0,0.2)' }}
            onMouseEnter={ev => { (ev.currentTarget as HTMLElement).style.color = '#5C7A5C'; (ev.currentTarget as HTMLElement).style.background = 'rgba(92,122,92,0.12)' }}
            onMouseLeave={ev => { (ev.currentTarget as HTMLElement).style.color = 'rgba(0,0,0,0.2)'; (ev.currentTarget as HTMLElement).style.background = 'transparent' }}>
            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
            </svg>
          </button>
          <button onClick={() => onDelete(c.id)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: 'rgba(0,0,0,0.2)' }}
            onMouseEnter={ev => { (ev.currentTarget as HTMLElement).style.color = '#F43F5E'; (ev.currentTarget as HTMLElement).style.background = 'rgba(244,63,94,0.1)' }}
            onMouseLeave={ev => { (ev.currentTarget as HTMLElement).style.color = 'rgba(0,0,0,0.2)'; (ev.currentTarget as HTMLElement).style.background = 'transparent' }}>
            <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
            </svg>
          </button>
        </div>
      </div>
      <StatusStepper id={c.id} statut={c.statut} onChange={onStatusChange} />
      {isEditing && editData && (
        <div className="px-4 py-4" style={{ borderTop: '1px solid rgba(0,0,0,0.06)', background: 'rgba(255,255,255,0.15)' }}>
          <CandidatureForm title="Sauvegarder" values={editData} onChange={onEditChange}
            onSubmit={onSaveEdit} onCancel={onCancelEdit} submitting={saving} error="" />
        </div>
      )}
    </div>
  )
}

// ── Cellule éditable ─────────────────────────────────────────
function EditableCell({ id, col, value, editCell, editVal, onStart, onChange, onCommit, onKeyDown, renderView, nullable = false }: {
  id: string; col: string; value: string
  editCell: { id: string; col: string } | null; editVal: string
  onStart: (id: string, col: string, value: string) => void
  onChange: (v: string) => void; onCommit: () => void
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  renderView: () => React.ReactNode; nullable?: boolean
}) {
  const isEditing = editCell?.id === id && editCell?.col === col
  return (
    <td className="px-4 py-0 cursor-text group/cell" onClick={() => !isEditing && onStart(id, col, value)}>
      {isEditing ? (
        <input autoFocus type="text" value={editVal}
          onChange={e => onChange(e.target.value)}
          onBlur={onCommit} onKeyDown={onKeyDown}
          placeholder={nullable ? '—' : ''}
          style={{ ...ctrlBase, padding: '6px 8px', fontSize: '12px', borderRadius: '8px', marginTop: '6px', marginBottom: '6px' }} />
      ) : (
        <div className="py-3 flex items-center gap-1.5">
          {renderView()}
          <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24"
            className="shrink-0 opacity-0 group-hover/cell:opacity-40 transition-opacity" style={{ color: 'var(--dash-section-label)' }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
          </svg>
        </div>
      )}
    </td>
  )
}

// ── Vue Tableau ──────────────────────────────────────────────
function TableauView({ cands, onFieldUpdate, onDelete }: {
  cands: Candidature[]
  onFieldUpdate: (id: string, field: string, value: string) => Promise<void>
  onDelete: (id: string) => void
}) {
  const [sortCol, setSortCol]       = useState('date_action')
  const [sortDir, setSortDir]       = useState<'asc' | 'desc'>('desc')
  const [filter, setFilter]         = useState('toutes')
  const [search, setSearch]         = useState('')
  const [onlyRelance, setOnlyRelance] = useState(false)
  const [editCell, setEditCell]     = useState<{ id: string; col: string } | null>(null)
  const [editVal, setEditVal]       = useState('')
  const [selected, setSelected]     = useState<Set<string>>(new Set())
  const [bulkStatut, setBulkStatut] = useState('')

  function toggleSort(col: string) {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortCol(col); setSortDir('asc') }
  }

  function startEdit(id: string, col: string, value: string | null) {
    setEditCell({ id, col })
    setEditVal(value || '')
  }

  async function commitEdit() {
    if (!editCell) return
    const { id, col } = editCell
    setEditCell(null)
    await onFieldUpdate(id, col, editVal)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') { e.preventDefault(); commitEdit() }
    if (e.key === 'Escape') setEditCell(null)
  }

  const relanceCount = useMemo(() => cands.filter(isRelance).length, [cands])

  const filtered = useMemo(() => {
    let list = [...cands]
    if (filter !== 'toutes') list = list.filter(c => c.statut === filter)
    if (onlyRelance) list = list.filter(isRelance)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(c =>
        c.entreprise.toLowerCase().includes(q) ||
        c.poste.toLowerCase().includes(q) ||
        (c.notes || '').toLowerCase().includes(q)
      )
    }
    return list.sort((a, b) => {
      const av = String((a as any)[sortCol] || '')
      const bv = String((b as any)[sortCol] || '')
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    })
  }, [cands, filter, onlyRelance, search, sortCol, sortDir])

  const allSelected = selected.size > 0 && selected.size === filtered.length
  function toggleAll() {
    setSelected(allSelected ? new Set() : new Set(filtered.map(c => c.id)))
  }
  function toggleOne(id: string) {
    setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n })
  }
  function deleteSelected() {
    Array.from(selected).forEach(id => onDelete(id))
    setSelected(new Set())
  }
  async function applyBulkStatut() {
    if (!bulkStatut) return
    await Promise.all(Array.from(selected).map(id => onFieldUpdate(id, 'statut', bulkStatut)))
    setSelected(new Set())
    setBulkStatut('')
  }

  const sortTh = (col: string, label: string, className = '') => (
    <th onClick={() => toggleSort(col)}
      className={`px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest cursor-pointer select-none whitespace-nowrap transition-colors ${className}`}
      style={{ color: sortCol === col ? '#3D553D' : 'var(--dash-section-label)' }}>
      <span className="flex items-center gap-1">
        {label}
        <span style={{ color: '#5C7A5C', visibility: sortCol === col ? 'visible' : 'hidden' }}>{sortDir === 'asc' ? '↑' : '↓'}</span>
      </span>
    </th>
  )

  return (
    <div className="flex flex-col gap-3">
      {/* Filtres */}
      <div style={{ ...glass, padding: '12px' }} className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
        <div className="flex gap-1 flex-wrap">
          {[
            { key: 'toutes',     label: `Tout (${cands.length})` },
            { key: 'envoye',     label: `Envoyées (${cands.filter(c => c.statut === 'envoye').length})` },
            { key: 'en_attente', label: `Attente (${cands.filter(c => c.statut === 'en_attente').length})` },
            { key: 'entretien',  label: `Entretiens (${cands.filter(c => c.statut === 'entretien').length})` },
            { key: 'refus',      label: `Refus (${cands.filter(c => c.statut === 'refus').length})` },
            { key: 'accepte',    label: `Acceptées (${cands.filter(c => c.statut === 'accepte').length})` },
          ].map(({ key, label }) => {
            const opt = STATUTS.find(x => x.key === key)
            return (
              <button key={key} onClick={() => setFilter(key)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                style={filter === key
                  ? { backgroundColor: opt?.bg || 'rgba(92,122,92,0.12)', color: opt?.color || '#3D553D' }
                  : { color: '#9CA3AF' }}>
                {label}
              </button>
            )
          })}
        </div>
        <div className="flex items-center gap-2 sm:ml-auto">
          {relanceCount > 0 && (
            <button onClick={() => setOnlyRelance(v => !v)}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5"
              style={onlyRelance
                ? { background: 'rgba(249,115,22,0.15)', color: '#EA580C' }
                : { color: '#9CA3AF' }}>
              🔔 À relancer ({relanceCount})
            </button>
          )}
          <input type="text" placeholder="Rechercher..." value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...ctrlBase, width: '176px', padding: '6px 12px', fontSize: '12px' }} />
        </div>
      </div>

      {/* Tableau */}
      <div style={{ ...glass, overflow: 'hidden' }}>
        {selected.size > 0 && (
          <div className="flex items-center gap-3 px-5 py-3"
            style={{ background: 'linear-gradient(135deg, #1a3a1a, #0f2a0f)' }}>
            <span className="text-sm font-semibold text-white shrink-0">
              {selected.size} sélectionnée{selected.size > 1 ? 's' : ''}
            </span>
            <div className="flex items-center gap-2 ml-auto flex-wrap">
              <select value={bulkStatut} onChange={e => setBulkStatut(e.target.value)}
                className="text-xs rounded-lg px-2 py-1.5 outline-none"
                style={{ background: 'rgba(255,255,255,0.15)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>
                <option value="">Changer le statut...</option>
                {STATUTS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
              {bulkStatut && (
                <button onClick={applyBulkStatut}
                  className="text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                  style={{ background: 'rgba(255,255,255,0.2)' }}>
                  Appliquer
                </button>
              )}
              <button onClick={deleteSelected}
                className="text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors"
                style={{ background: 'rgba(244,63,94,0.7)' }}>
                Supprimer tout
              </button>
              <button onClick={() => setSelected(new Set())}
                className="text-xl leading-none transition-colors" style={{ color: 'rgba(255,255,255,0.5)' }}>×</button>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ minWidth: '720px' }}>
            <thead>
              <tr style={{ background: 'rgba(0,0,0,0.04)', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                <th className="pl-5 pr-3 py-3 w-9">
                  <input type="checkbox" checked={allSelected} onChange={toggleAll}
                    className="w-3.5 h-3.5 rounded accent-[#5C7A5C] cursor-pointer" />
                </th>
                <th className="px-2 py-3 text-[10px] font-bold uppercase tracking-widest text-right w-8"
                  style={{ color: 'var(--dash-section-label)' }}>#</th>
                {sortTh('entreprise', 'Entreprise')}
                {sortTh('poste', 'Poste')}
                {sortTh('statut', 'Statut', 'w-36')}
                {sortTh('date_action', 'Date', 'w-28')}
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--dash-section-label)' }}>Notes</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest w-20" style={{ color: 'var(--dash-section-label)' }}>Lien</th>
                <th className="px-3 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => {
                const s             = getS(c.statut)
                const relance       = isRelance(c)
                const isSelected    = selected.has(c.id)
                const editingStatut = editCell?.id === c.id && editCell?.col === 'statut'
                const editingDate   = editCell?.id === c.id && editCell?.col === 'date_action'
                const editingUrl    = editCell?.id === c.id && editCell?.col === 'url'

                return (
                  <tr key={c.id} className="group transition-colors"
                    style={{
                      borderBottom: '1px solid rgba(0,0,0,0.04)',
                      borderLeft: `3px solid ${s.dot}`,
                      background: isSelected ? 'rgba(34,197,94,0.07)' : 'transparent',
                    }}
                    onMouseEnter={ev => { if (!isSelected) (ev.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.2)' }}
                    onMouseLeave={ev => { if (!isSelected) (ev.currentTarget as HTMLElement).style.background = 'transparent' }}>

                    <td className="pl-5 pr-3 py-3">
                      <input type="checkbox" checked={isSelected} onChange={() => toggleOne(c.id)}
                        className="w-3.5 h-3.5 rounded accent-[#5C7A5C] cursor-pointer" />
                    </td>
                    <td className="px-2 py-3 text-xs font-mono text-right" style={{ color: 'var(--dash-section-label)' }}>{i + 1}</td>

                    <EditableCell id={c.id} col="entreprise" value={c.entreprise}
                      editCell={editCell} editVal={editVal}
                      onStart={startEdit} onChange={setEditVal} onCommit={commitEdit} onKeyDown={handleKeyDown}
                      renderView={() => (
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
                            style={{ backgroundColor: s.bg, color: s.color }}>
                            {c.entreprise[0]?.toUpperCase()}
                          </div>
                          <span className="text-sm font-bold truncate" style={{ color: 'var(--dash-header-title)' }}>{c.entreprise}</span>
                        </div>
                      )} />

                    <EditableCell id={c.id} col="poste" value={c.poste}
                      editCell={editCell} editVal={editVal}
                      onStart={startEdit} onChange={setEditVal} onCommit={commitEdit} onKeyDown={handleKeyDown}
                      renderView={() => <span className="text-sm truncate block max-w-44" style={{ color: 'var(--dash-header-sub)' }}>{c.poste}</span>} />

                    <td className="px-4 py-3">
                      {editingStatut ? (
                        <select autoFocus value={editVal}
                          onChange={e => setEditVal(e.target.value)}
                          onBlur={commitEdit}
                          style={{ ...ctrlBase, padding: '6px 8px', fontSize: '12px', borderRadius: '8px' }}>
                          {STATUTS.map(st => <option key={st.key} value={st.key}>{st.label}</option>)}
                        </select>
                      ) : (
                        <button onClick={() => startEdit(c.id, 'statut', c.statut)}
                          title="Cliquer pour changer"
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all hover:opacity-80 active:scale-95"
                          style={{ backgroundColor: s.bg, color: s.color }}>
                          <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: s.dot }}></div>
                          <span>{s.label}</span>
                          {relance && <span className="shrink-0 ml-0.5">🔔</span>}
                        </button>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {editingDate ? (
                        <input autoFocus type="date" value={editVal}
                          onChange={e => setEditVal(e.target.value)}
                          onBlur={commitEdit} onKeyDown={handleKeyDown}
                          style={{ ...ctrlBase, padding: '6px 8px', fontSize: '12px', borderRadius: '8px', width: 'auto' }} />
                      ) : (
                        <button onClick={() => startEdit(c.id, 'date_action', c.date_action)}
                          className="text-xs transition-colors whitespace-nowrap text-left group/date flex items-center gap-1"
                          style={{ color: 'var(--dash-header-sub)' }}>
                          {formatDate(c.date_action)}
                          <svg width="9" height="9" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                            className="opacity-0 group-hover/date:opacity-40 transition-opacity">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                          </svg>
                        </button>
                      )}
                    </td>

                    <EditableCell id={c.id} col="notes" value={c.notes || ''}
                      editCell={editCell} editVal={editVal}
                      onStart={startEdit} onChange={setEditVal} onCommit={commitEdit} onKeyDown={handleKeyDown}
                      renderView={() => c.notes
                        ? <span className="text-xs truncate block max-w-52" style={{ color: 'var(--dash-header-sub)' }}>{c.notes}</span>
                        : <span className="text-xs italic" style={{ color: 'var(--dash-section-label)' }}>ajouter une note...</span>}
                      nullable />

                    <td className="px-4 py-3">
                      {editingUrl ? (
                        <input autoFocus type="url" placeholder="https://..." value={editVal}
                          onChange={e => setEditVal(e.target.value)}
                          onBlur={commitEdit} onKeyDown={handleKeyDown}
                          style={{ ...ctrlBase, padding: '6px 8px', fontSize: '12px', borderRadius: '8px', width: '144px' }} />
                      ) : c.url ? (
                        <div className="flex items-center gap-1.5">
                          <a href={c.url} target="_blank" rel="noopener noreferrer"
                            onClick={e => e.stopPropagation()}
                            className="text-xs font-medium hover:underline" style={{ color: '#5C7A5C' }}>↗ Voir</a>
                          <button onClick={() => startEdit(c.id, 'url', c.url || '')}
                            className="text-[10px] transition-colors" style={{ color: 'var(--dash-section-label)' }}>✎</button>
                        </div>
                      ) : (
                        <button onClick={() => startEdit(c.id, 'url', '')}
                          className="text-xs font-medium transition-colors"
                          style={{ color: 'var(--dash-section-label)' }}>+ lien</button>
                      )}
                    </td>

                    <td className="px-3 py-3">
                      <button onClick={() => onDelete(c.id)}
                        className="w-6 h-6 rounded-md flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100"
                        style={{ color: 'rgba(0,0,0,0.15)' }}
                        onMouseEnter={ev => { (ev.currentTarget as HTMLElement).style.color = '#F43F5E'; (ev.currentTarget as HTMLElement).style.background = 'rgba(244,63,94,0.1)' }}
                        onMouseLeave={ev => { (ev.currentTarget as HTMLElement).style.color = 'rgba(0,0,0,0.15)'; (ev.currentTarget as HTMLElement).style.background = 'transparent' }}>
                        <svg width="10" height="10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>

            {filtered.length > 0 && (
              <tfoot>
                <tr style={{ background: 'rgba(0,0,0,0.04)', borderTop: '2px solid rgba(0,0,0,0.08)' }}>
                  <td colSpan={4} className="px-5 py-3 text-xs font-bold" style={{ color: 'var(--dash-header-sub)' }}>
                    {filtered.length} candidature{filtered.length > 1 ? 's' : ''}
                    {filtered.length !== cands.length && (
                      <span style={{ color: 'var(--dash-section-label)', fontWeight: 400 }}> sur {cands.length}</span>
                    )}
                  </td>
                  <td colSpan={5} className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {STATUTS.map(st => {
                        const count = filtered.filter(c => c.statut === st.key).length
                        if (!count) return null
                        return (
                          <span key={st.key} className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: st.bg, color: st.color }}>
                            {count} {st.label}
                          </span>
                        )
                      })}
                    </div>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>

          {filtered.length === 0 && (
            <div className="py-14 text-center">
              <p className="text-sm" style={{ color: 'var(--dash-header-sub)' }}>Aucune candidature pour ce filtre.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Composant principal ──────────────────────────────────────
export default function CandidaturesClient({ initial, objectif }: { initial: Candidature[]; objectif: number }) {
  const [cands, setCands]       = useState<Candidature[]>(initial)
  const [view, setView]         = useState<'liste' | 'tableau'>('liste')
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
    total:       cands.length,
    envoye:      cands.filter(c => c.statut === 'envoye').length,
    attente:     cands.filter(c => c.statut === 'en_attente').length,
    entretien:   cands.filter(c => c.statut === 'entretien').length,
    refus:       cands.filter(c => c.statut === 'refus').length,
    accepte:     cands.filter(c => c.statut === 'accepte').length,
    tauxReponse: cands.length > 0
      ? Math.round((cands.filter(c => c.statut !== 'envoye').length / cands.length) * 100) : 0,
    relances:    cands.filter(isRelance).length,
  }), [cands])

  const level = getLevel(stats.total)
  const levelPct = level.next ? Math.min(Math.round((stats.total / level.next) * 100), 100) : 100
  const objectifPct = Math.min(Math.round((stats.total / objectif) * 100), 100)

  const filtered = useMemo(() => {
    if (view !== 'liste') return cands
    let list = cands
    if (filter !== 'toutes') list = list.filter(c => c.statut === filter)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter(c =>
        c.entreprise.toLowerCase().includes(q) || c.poste.toLowerCase().includes(q)
      )
    }
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

  async function handleFieldUpdate(id: string, field: string, value: string) {
    const c = cands.find(x => x.id === id)
    if (!c) return
    const nullVal = (f: string, v: string) => (f === 'notes' || f === 'url') ? v || null : v
    setCands(prev => prev.map(x => x.id === id ? { ...x, [field]: nullVal(field, value) } : x))
    if (field === 'statut') {
      await updateCandidatureStatut(id, value)
    } else {
      const updated = { ...c, [field]: nullVal(field, value) }
      await updateCandidature(id, {
        entreprise: updated.entreprise, poste: updated.poste, statut: updated.statut,
        date_action: updated.date_action, notes: updated.notes, url: updated.url,
      })
    }
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
      setEditId(null); setEditData(null)
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    setCands(prev => prev.filter(c => c.id !== id))
    await deleteCandidature(id)
  }

  return (
    <div className="h-screen overflow-y-auto relative" id="dashboard-scroll" style={{ background: 'var(--dash-bg)' }}>
      <ParallaxOrbs />

      {/* Navbar */}
      <div className="sticky top-0 z-20"
        style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.5)' }}>
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/profil"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
              style={{ background: 'rgba(92,122,92,0.15)', color: '#3D553D' }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
              </svg>
              Mon profil
            </Link>
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background: 'linear-gradient(135deg, #22C55E, #8B5CF6)' }}></div>
              <span className="font-semibold text-sm" style={{ color: 'var(--dash-header-title)' }}>Studi</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex p-0.5 rounded-lg" style={{ background: 'rgba(0,0,0,0.08)' }}>
              {(['liste', 'tableau'] as const).map(v => (
                <button key={v} onClick={() => setView(v)}
                  className="px-3 py-1.5 rounded-md text-xs font-semibold transition-all capitalize"
                  style={view === v
                    ? { backgroundColor: 'rgba(255,255,255,0.85)', color: '#3D553D', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
                    : { color: '#9CA3AF' }}>
                  {v === 'liste' ? 'Liste' : 'Tableau'}
                </button>
              ))}
            </div>
            <button onClick={() => { setShowForm(true); setAddError('') }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold active:scale-95 transition-all"
              style={{ background: 'linear-gradient(135deg, #3D553D, #2D4030)', color: 'white' }}>
              <span className="text-lg leading-none">+</span> Nouvelle
            </button>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-6 flex flex-col gap-4">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Total',        value: stats.total,             color: '#3D553D' },
            { label: 'Taux réponse', value: `${stats.tauxReponse}%`, color: '#1D4ED8' },
            { label: 'Entretiens',   value: stats.entretien,         color: '#1D4ED8' },
            { label: stats.relances > 0 ? `À relancer (${stats.relances})` : 'Acceptées',
              value: stats.relances > 0 ? stats.relances : stats.accepte,
              color: stats.relances > 0 ? '#C2410C' : '#15803D' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ ...glass, padding: '20px' }}>
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--dash-section-label)' }}>{label}</p>
              <p className="text-3xl font-black tracking-tight" style={{ color }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Niveau + objectif */}
        <div style={{ ...glass, padding: '20px' }} className="flex flex-col sm:flex-row gap-5">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0" style={{ backgroundColor: level.bg }}>
              {level.emoji}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold" style={{ color: 'var(--dash-header-sub)' }}>Niveau {level.label}</span>
                {level.next && <span className="text-xs" style={{ color: level.color }}>{stats.total}/{level.next}</span>}
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.07)' }}>
                <div className="h-full rounded-full transition-all duration-700" style={{ width: `${levelPct}%`, backgroundColor: level.color }}></div>
              </div>
              {level.next && <p className="text-[10px] mt-1" style={{ color: 'var(--dash-section-label)' }}>{level.next - stats.total} avant le niveau suivant</p>}
            </div>
          </div>
          <div className="w-px hidden sm:block" style={{ background: 'rgba(0,0,0,0.06)' }}></div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold" style={{ color: 'var(--dash-header-sub)' }}>Objectif semaine</span>
              <span className="text-xs font-bold" style={{ color: objectifPct >= 100 ? '#16A34A' : '#5C7A5C' }}>
                {stats.total}/{objectif} {objectifPct >= 100 ? '✓' : ''}
              </span>
            </div>
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.07)' }}>
              <div className="h-full rounded-full transition-all"
                style={{ width: `${objectifPct}%`, background: objectifPct >= 100 ? 'linear-gradient(90deg, #16A34A, #22C55E)' : 'linear-gradient(90deg, #5C7A5C, #22C55E)' }}></div>
            </div>
            {objectifPct >= 100 && <p className="text-[10px] font-semibold mt-1 text-green-600">Objectif atteint !</p>}
          </div>
        </div>

        {/* Graphe */}
        <ActivityGraph cands={cands} />

        {/* Formulaire ajout */}
        {showForm && (
          <div style={{ ...glass, padding: '24px', borderLeft: '3px solid #5C7A5C' }}>
            <div className="flex items-center justify-between mb-5">
              <p className="text-sm font-bold" style={{ color: 'var(--dash-header-title)' }}>Nouvelle candidature</p>
              <button onClick={() => setShowForm(false)} className="text-xl" style={{ color: 'var(--dash-section-label)' }}>×</button>
            </div>
            <CandidatureForm title="+ Ajouter" values={form} onChange={setForm}
              onSubmit={handleAdd} onCancel={() => setShowForm(false)} submitting={adding} error={addError} />
          </div>
        )}

        {/* Filtres liste */}
        {view === 'liste' && (
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex gap-1 p-1 rounded-xl flex-wrap" style={{ ...glass }}>
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
                    style={filter === key
                      ? { backgroundColor: opt?.bg || 'rgba(92,122,92,0.12)', color: opt?.color || '#3D553D' }
                      : { color: '#9CA3AF' }}>
                    {label}
                  </button>
                )
              })}
            </div>
            <input type="text" placeholder="Rechercher..." value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ ...ctrlBase, flex: 1, padding: '8px 16px' }} />
          </div>
        )}

        {/* Contenu */}
        {cands.length === 0 ? (
          <div style={{ ...glass, padding: '64px', textAlign: 'center', borderStyle: 'dashed', cursor: 'pointer' }}
            onClick={() => { setShowForm(true); setAddError('') }}>
            <p className="text-5xl mb-4">📋</p>
            <p className="text-base font-bold mb-1" style={{ color: 'var(--dash-header-title)' }}>Commence à tracker tes candidatures</p>
            <p className="text-sm mb-5" style={{ color: 'var(--dash-header-sub)' }}>Chaque candidature te rapproche de ton objectif</p>
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
              style={{ background: 'linear-gradient(135deg, #3D553D, #2D4030)' }}>
              + Ajouter ma première candidature
            </div>
          </div>
        ) : view === 'tableau' ? (
          <TableauView cands={cands} onFieldUpdate={handleFieldUpdate} onDelete={handleDelete} />
        ) : filtered.length === 0 ? (
          <div style={{ ...glass, padding: '40px', textAlign: 'center' }}>
            <p className="text-sm" style={{ color: 'var(--dash-header-sub)' }}>Aucune candidature pour ce filtre.</p>
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
