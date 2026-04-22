'use client'
import { useState } from 'react'
import { addRelance, deleteRelance } from './actions'

interface Etudiant { id: string; prenom: string; nom: string; email: string; statut: string }
interface Relance  { id: string; etudiant_id: string; message: string; type: string; lu: boolean; reponse: string | null; reponse_at: string | null; created_at: string }

const TYPES = [
  { key: 'general',      label: 'Général',           color: '#3D553D', bg: 'rgba(92,122,92,0.12)'   },
  { key: 'document',     label: 'Document manquant', color: '#C2410C', bg: 'rgba(249,115,22,0.12)'  },
  { key: 'candidature',  label: 'Candidature',       color: '#1D4ED8', bg: 'rgba(59,130,246,0.12)'  },
  { key: 'entretien',    label: 'Entretien',          color: '#6D28D9', bg: 'rgba(109,40,217,0.12)'  },
  { key: 'urgent',       label: 'Urgent',             color: '#9F1239', bg: 'rgba(244,63,94,0.12)'   },
]

const glass = {
  background: 'linear-gradient(145deg, var(--dash-card-from) 0%, var(--dash-card-to) 100%)',
  backdropFilter: 'blur(60px)',
  WebkitBackdropFilter: 'blur(60px)',
  border: '1px solid var(--dash-card-border)',
  borderRadius: '20px',
  boxShadow: 'inset 0 1px 0 var(--dash-card-inset)',
} as const

const ctrl: React.CSSProperties = {
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

function getType(key: string) { return TYPES.find(t => t.key === key) || TYPES[0] }

function fmtDate(str: string) {
  const d = new Date(str)
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function RelancesClient({ etudiants, relances: initial }: { etudiants: Etudiant[]; relances: Relance[] }) {
  const [relances, setRelances] = useState(initial)
  const [selectedId, setSelectedId] = useState('')
  const [message, setMessage] = useState('')
  const [type, setType] = useState('general')
  const [saving, setSaving] = useState(false)
  const [filterEtudiant, setFilterEtudiant] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterLu, setFilterLu] = useState<'toutes' | 'non_lues' | 'lues'>('toutes')

  const nonLues = relances.filter(r => !r.lu).length

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedId || !message.trim()) return
    setSaving(true)
    const result = await addRelance(selectedId, message, type)
    if ('success' in result) {
      setRelances(prev => [{
        id: crypto.randomUUID(),
        etudiant_id: selectedId,
        message,
        type,
        lu: false,
        reponse: null,
        reponse_at: null,
        created_at: new Date().toISOString(),
      }, ...prev])
      setMessage('')
      setSelectedId('')
      setType('general')
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    setRelances(prev => prev.filter(r => r.id !== id))
    await deleteRelance(id)
  }

  const filtered = relances.filter(r => {
    if (filterEtudiant && r.etudiant_id !== filterEtudiant) return false
    if (filterType && r.type !== filterType) return false
    if (filterLu === 'non_lues' && r.lu) return false
    if (filterLu === 'lues' && !r.lu) return false
    return true
  })

  const etudiantMap = Object.fromEntries(etudiants.map(e => [e.id, e]))

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight" style={{ color: 'var(--dash-header-title)' }}>Relances</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--dash-header-sub)' }}>
            {relances.length} relance{relances.length > 1 ? 's' : ''}
            {nonLues > 0 && <span className="ml-2 font-bold text-orange-500">· {nonLues} non lue{nonLues > 1 ? 's' : ''}</span>}
          </p>
        </div>
      </div>

      {/* Formulaire */}
      <div style={{ ...glass, padding: '24px', marginBottom: '24px' }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: '#3D553D' }}>Nouvelle relance</p>
        <form onSubmit={handleAdd} className="flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--dash-header-sub)' }}>Étudiant *</label>
              <select value={selectedId} onChange={e => setSelectedId(e.target.value)} required style={ctrl}>
                <option value="">Choisir un étudiant...</option>
                {etudiants.map(e => (
                  <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--dash-header-sub)' }}>Type</label>
              <select value={type} onChange={e => setType(e.target.value)} style={ctrl}>
                {TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
              </select>
            </div>
            <div className="sm:col-span-1 flex items-end">
              <button type="submit" disabled={saving || !selectedId || !message.trim()}
                style={{ ...ctrl, background: 'rgba(61,85,61,0.85)', color: 'white', fontWeight: 700, cursor: 'pointer', opacity: (saving || !selectedId || !message.trim()) ? 0.5 : 1 }}>
                {saving ? 'Envoi...' : 'Envoyer la relance'}
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--dash-header-sub)' }}>Message *</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)} required rows={2}
              placeholder="Ex: N'oublie pas de mettre à jour ton CV avant vendredi..."
              style={{ ...ctrl, resize: 'none' }} />
          </div>
        </form>
      </div>

      {/* Filtres */}
      <div style={{ ...glass, padding: '16px', marginBottom: '16px' }} className="flex flex-wrap gap-3 items-center">
        <select value={filterEtudiant} onChange={e => setFilterEtudiant(e.target.value)}
          style={{ ...ctrl, width: 'auto', padding: '6px 12px', fontSize: '12px' }}>
          <option value="">Tous les étudiants</option>
          {etudiants.map(e => <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>)}
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          style={{ ...ctrl, width: 'auto', padding: '6px 12px', fontSize: '12px' }}>
          <option value="">Tous les types</option>
          {TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
        </select>
        <div className="flex gap-1 p-0.5 rounded-lg" style={{ background: 'rgba(0,0,0,0.08)' }}>
          {([['toutes', 'Toutes'], ['non_lues', 'Non lues'], ['lues', 'Lues']] as const).map(([v, l]) => (
            <button key={v} onClick={() => setFilterLu(v)}
              className="px-3 py-1 rounded-md text-xs font-semibold transition-all"
              style={filterLu === v
                ? { backgroundColor: 'rgba(255,255,255,0.8)', color: '#3D553D', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }
                : { color: '#9CA3AF' }}>
              {l}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs" style={{ color: 'var(--dash-header-sub)' }}>{filtered.length} résultat{filtered.length > 1 ? 's' : ''}</span>
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div style={{ ...glass, padding: '48px', textAlign: 'center' }}>
          <p className="text-2xl mb-2">📭</p>
          <p className="text-sm" style={{ color: 'var(--dash-header-sub)' }}>Aucune relance pour ces filtres.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(r => {
            const t = getType(r.type)
            const etudiant = etudiantMap[r.etudiant_id]
            return (
              <div key={r.id}
                style={{ ...glass, padding: '20px', opacity: r.lu ? 0.65 : 1 }}
                className="flex items-start gap-4 group">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0"
                  style={{ background: 'rgba(92,122,92,0.15)', color: '#3D553D' }}>
                  {etudiant?.prenom[0]}{etudiant?.nom[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-bold" style={{ color: 'var(--dash-header-title)' }}>{etudiant?.prenom} {etudiant?.nom}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: t.bg, color: t.color }}>{t.label}</span>
                    {!r.lu && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: 'rgba(249,115,22,0.1)', color: '#EA580C', border: '1px solid rgba(249,115,22,0.3)' }}>Non lue</span>}
                    {r.lu && <span className="text-[10px]" style={{ color: 'var(--dash-header-sub)' }}>Lue ✓</span>}
                  </div>
                  <p className="text-sm mb-1" style={{ color: 'var(--dash-header-title)' }}>{r.message}</p>
                  <p className="text-xs" style={{ color: 'var(--dash-header-sub)' }}>{fmtDate(r.created_at)}</p>
                </div>
                {r.reponse && (
                  <div className="mt-2 p-3 rounded-xl" style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)' }}>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-1 text-green-600">Réponse de l'étudiant</p>
                    <p className="text-sm" style={{ color: 'var(--dash-header-title)' }}>{r.reponse}</p>
                    {r.reponse_at && (
                      <p className="text-[10px] mt-1" style={{ color: 'var(--dash-header-sub)' }}>{fmtDate(r.reponse_at)}</p>
                    )}
                  </div>
                )}
                <button onClick={() => handleDelete(r.id)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                  style={{ color: '#D1D5DB' }}
                  onMouseEnter={ev => { (ev.currentTarget as HTMLElement).style.color = '#F43F5E'; (ev.currentTarget as HTMLElement).style.background = 'rgba(244,63,94,0.1)' }}
                  onMouseLeave={ev => { (ev.currentTarget as HTMLElement).style.color = '#D1D5DB'; (ev.currentTarget as HTMLElement).style.background = 'transparent' }}>
                  <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
