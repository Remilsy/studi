'use client'

import { useState } from 'react'
import { createOffre, toggleOffre, deleteOffre } from './actions'

interface Offre {
  id: string
  titre: string
  entreprise: string
  description: string | null
  type_contrat: string
  niveau: string
  localisation: string | null
  active: boolean
  created_at: string
}

const typeColors: Record<string, { bg: string; text: string }> = {
  stage:      { bg: 'rgba(59,130,246,0.12)',  text: '#1D4ED8' },
  alternance: { bg: 'rgba(92,122,92,0.12)',   text: '#3D553D' },
  cdi:        { bg: 'rgba(34,197,94,0.12)',   text: '#15803D' },
  cdd:        { bg: 'rgba(249,115,22,0.12)',  text: '#C2410C' },
}

const glass = {
  background: 'linear-gradient(145deg, var(--dash-card-from) 0%, var(--dash-card-to) 100%)',
  backdropFilter: 'blur(60px)',
  WebkitBackdropFilter: 'blur(60px)',
  border: '1px solid var(--dash-card-border)',
  borderRadius: '20px',
  boxShadow: 'inset 0 1px 0 var(--dash-card-inset)',
} as const

export default function OffresClient({ offres: initial }: { offres: Offre[] }) {
  const [offres, setOffres] = useState(initial)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

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

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    const formData = new FormData(e.currentTarget)
    const result = await createOffre(formData)
    if (result.success) {
      setShowForm(false)
      window.location.reload()
    }
    setSaving(false)
  }

  async function handleToggle(id: string, active: boolean) {
    await toggleOffre(id, !active)
    setOffres(offres.map(o => o.id === id ? { ...o, active: !active } : o))
  }

  async function handleDelete(id: string) {
    if (!confirm('Supprimer cette offre ?')) return
    await deleteOffre(id)
    setOffres(offres.filter(o => o.id !== id))
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight" style={{ color: 'var(--dash-header-title)' }}>Offres d'emploi</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--dash-header-sub)' }}>{offres.length} offre{offres.length > 1 ? 's' : ''} au total</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{ ...ctrl, width: 'auto', padding: '8px 16px', fontWeight: 600, cursor: 'pointer' }}
        >
          + Ajouter une offre
        </button>
      </div>

      {showForm && (
        <div style={{ ...glass, padding: '24px', marginBottom: '20px' }}>
          <h2 className="text-sm font-semibold mb-4" style={{ color: 'var(--dash-header-title)' }}>Nouvelle offre</h2>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--dash-header-sub)' }}>Titre du poste</label>
                <input type="text" name="titre" required placeholder="Ex : Photographe junior" style={ctrl} />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--dash-header-sub)' }}>Entreprise</label>
                <input type="text" name="entreprise" required placeholder="Nom de l'entreprise" style={ctrl} />
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--dash-header-sub)' }}>Type de contrat</label>
                <select name="type_contrat" style={ctrl}>
                  <option value="stage">Stage</option>
                  <option value="alternance">Alternance</option>
                  <option value="cdi">CDI</option>
                  <option value="cdd">CDD</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--dash-header-sub)' }}>Niveau requis</label>
                <select name="niveau" style={ctrl}>
                  <option value="Tous">Tous niveaux</option>
                  <option value="Bac+1">Bac+1</option>
                  <option value="Bac+2">Bac+2</option>
                  <option value="Bac+3">Bac+3</option>
                  <option value="Bac+4">Bac+4</option>
                  <option value="Bac+5">Bac+5</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--dash-header-sub)' }}>Localisation</label>
                <input type="text" name="localisation" placeholder="Paris, Lyon, Remote..." style={ctrl} />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--dash-header-sub)' }}>Description</label>
              <textarea name="description" rows={3} placeholder="Décris le poste, les missions..."
                style={{ ...ctrl, resize: 'none' }} />
            </div>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setShowForm(false)}
                style={{ ...ctrl, width: 'auto', padding: '8px 16px', cursor: 'pointer' }}>
                Annuler
              </button>
              <button type="submit" disabled={saving}
                style={{ ...ctrl, width: 'auto', padding: '8px 16px', background: 'rgba(61,85,61,0.85)', color: 'white', fontWeight: 600, cursor: 'pointer', opacity: saving ? 0.6 : 1 }}>
                {saving ? 'Création...' : "Créer l'offre"}
              </button>
            </div>
          </form>
        </div>
      )}

      {offres.length === 0 ? (
        <div style={{ ...glass, padding: '40px', textAlign: 'center' }}>
          <p className="text-sm" style={{ color: 'var(--dash-header-sub)' }}>Aucune offre pour l'instant.</p>
          <p className="text-xs mt-1 text-gray-400">Clique sur "+ Ajouter une offre" pour commencer.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {offres.map(offre => {
            const tc = typeColors[offre.type_contrat] || typeColors['stage']
            return (
              <div
                key={offre.id}
                style={{ ...glass, padding: '20px', opacity: offre.active ? 1 : 0.5 }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold" style={{ color: 'var(--dash-header-title)' }}>{offre.titre}</span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: tc.bg, color: tc.text }}>
                        {offre.type_contrat.toUpperCase()}
                      </span>
                      {!offre.active && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: 'rgba(0,0,0,0.08)', color: '#9CA3AF' }}>Inactive</span>
                      )}
                    </div>
                    <p className="text-xs mb-1" style={{ color: 'var(--dash-header-sub)' }}>
                      {offre.entreprise}{offre.localisation ? ` · ${offre.localisation}` : ''} · {offre.niveau}
                    </p>
                    {offre.description && (
                      <p className="text-xs mt-2 leading-relaxed line-clamp-2 text-gray-500">{offre.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggle(offre.id, offre.active)}
                      style={{ ...ctrl, width: 'auto', padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }}
                    >
                      {offre.active ? 'Désactiver' : 'Activer'}
                    </button>
                    <button
                      onClick={() => handleDelete(offre.id)}
                      style={{ ...ctrl, width: 'auto', padding: '6px 12px', fontSize: '12px', color: '#F43F5E', cursor: 'pointer' }}
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
