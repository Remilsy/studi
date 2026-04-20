'use client'
import { useState } from 'react'
import { addRelance, deleteRelance } from './actions'

interface Etudiant { id: string; prenom: string; nom: string; email: string; statut: string }
interface Relance  { id: string; etudiant_id: string; message: string; type: string; lu: boolean; reponse: string | null; reponse_at: string | null; created_at: string }

const TYPES = [
  { key: 'general',      label: 'Général',         color: '#3D553D', bg: '#E4EDE4' },
  { key: 'document',     label: 'Document manquant', color: '#C2410C', bg: '#FFF7ED' },
  { key: 'candidature',  label: 'Candidature',     color: '#1D4ED8', bg: '#EFF6FF' },
  { key: 'entretien',    label: 'Entretien',        color: '#6D28D9', bg: '#F5F3FF' },
  { key: 'urgent',       label: 'Urgent',           color: '#9F1239', bg: '#FFF1F2' },
]

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
      const etudiant = etudiants.find(e => e.id === selectedId)!
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
  const inp = "w-full px-3 py-2 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#5C7A5C] transition-colors bg-white text-gray-900"

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Relances</h1>
          <p className="text-sm text-[#5C7A5C] mt-0.5">
            {relances.length} relance{relances.length > 1 ? 's' : ''}
            {nonLues > 0 && <span className="ml-2 font-bold text-orange-500">· {nonLues} non lue{nonLues > 1 ? 's' : ''}</span>}
          </p>
        </div>
      </div>

      {/* Formulaire nouvelle relance */}
      <div className="bg-white rounded-2xl border border-[#C8D8C8] p-6 mb-6">
        <p className="text-xs font-bold text-[#3D553D] uppercase tracking-widest mb-4">Nouvelle relance</p>
        <form onSubmit={handleAdd} className="flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Étudiant *</label>
              <select value={selectedId} onChange={e => setSelectedId(e.target.value)} required className={inp}>
                <option value="">Choisir un étudiant...</option>
                {etudiants.map(e => (
                  <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Type</label>
              <select value={type} onChange={e => setType(e.target.value)} className={inp}>
                {TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
              </select>
            </div>
            <div className="sm:col-span-1 flex items-end">
              <button type="submit" disabled={saving || !selectedId || !message.trim()}
                className="w-full px-5 py-2 rounded-xl text-sm font-bold bg-[#3D553D] text-white hover:bg-[#2D4030] transition-colors disabled:opacity-50 active:scale-95">
                {saving ? 'Envoi...' : 'Envoyer la relance'}
              </button>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">Message *</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)} required rows={2}
              placeholder="Ex: N'oublie pas de mettre à jour ton CV avant vendredi..."
              className={`${inp} resize-none`} />
          </div>
        </form>
      </div>

      {/* Filtres */}
      <div className="bg-white rounded-2xl border border-[#C8D8C8] p-4 mb-4 flex flex-wrap gap-3 items-center">
        <select value={filterEtudiant} onChange={e => setFilterEtudiant(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-[#5C7A5C] bg-white text-gray-700">
          <option value="">Tous les étudiants</option>
          {etudiants.map(e => <option key={e.id} value={e.id}>{e.prenom} {e.nom}</option>)}
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="px-3 py-1.5 rounded-xl border border-gray-200 text-xs outline-none focus:border-[#5C7A5C] bg-white text-gray-700">
          <option value="">Tous les types</option>
          {TYPES.map(t => <option key={t.key} value={t.key}>{t.label}</option>)}
        </select>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
          {([['toutes', 'Toutes'], ['non_lues', 'Non lues'], ['lues', 'Lues']] as const).map(([v, l]) => (
            <button key={v} onClick={() => setFilterLu(v)}
              className="px-3 py-1 rounded-md text-xs font-semibold transition-all"
              style={filterLu === v ? { backgroundColor: 'white', color: '#3D553D', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' } : { color: '#9CA3AF' }}>
              {l}
            </button>
          ))}
        </div>
        <span className="ml-auto text-xs text-gray-400">{filtered.length} résultat{filtered.length > 1 ? 's' : ''}</span>
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#C8D8C8] p-12 text-center">
          <p className="text-2xl mb-2">📭</p>
          <p className="text-sm text-gray-400">Aucune relance pour ces filtres.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map(r => {
            const t = getType(r.type)
            const etudiant = etudiantMap[r.etudiant_id]
            return (
              <div key={r.id}
                className={`bg-white rounded-2xl border p-5 flex items-start gap-4 group transition-all ${r.lu ? 'border-[#E5E7EB] opacity-60' : 'border-[#C8D8C8]'}`}>
                {/* Avatar */}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0 bg-[#E4EDE4] text-[#3D553D]">
                  {etudiant?.prenom[0]}{etudiant?.nom[0]}
                </div>
                {/* Contenu */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-bold text-gray-900">{etudiant?.prenom} {etudiant?.nom}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ backgroundColor: t.bg, color: t.color }}>{t.label}</span>
                    {!r.lu && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-500 border border-orange-200">Non lue</span>}
                    {r.lu && <span className="text-[10px] text-gray-400">Lue ✓</span>}
                  </div>
                  <p className="text-sm text-gray-700 mb-1">{r.message}</p>
                  <p className="text-xs text-gray-400">{fmtDate(r.created_at)}</p>
                </div>
                {/* Réponse de l'étudiant */}
                {r.reponse && (
                  <div className="mt-2 p-3 bg-[#F0FDF4] rounded-xl border border-[#BBF7D0]">
                    <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mb-1">Réponse de l'étudiant</p>
                    <p className="text-sm text-gray-700">{r.reponse}</p>
                    {r.reponse_at && (
                      <p className="text-[10px] text-gray-400 mt-1">{fmtDate(r.reponse_at)}</p>
                    )}
                  </div>
                )}

                {/* Supprimer */}
                <button onClick={() => handleDelete(r.id)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 shrink-0">
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
