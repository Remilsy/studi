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
  stage:      { bg: '#EFF6FF', text: '#1D4ED8' },
  alternance: { bg: '#E4EDE4', text: '#3D553D' },
  cdi:        { bg: '#F0FDF4', text: '#15803D' },
  cdd:        { bg: '#FFF7ED', text: '#C2410C' },
}

export default function OffresClient({ offres: initial }: { offres: Offre[] }) {
  const [offres, setOffres] = useState(initial)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)

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

  const inputCls = "w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#5C7A5C] transition-colors"

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Offres d'emploi</h1>
          <p className="text-sm text-[#5C7A5C] mt-0.5">{offres.length} offre{offres.length > 1 ? 's' : ''} au total</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-[#5C7A5C] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#4A6A4A] transition-colors"
        >
          + Ajouter une offre
        </button>
      </div>

      {/* Formulaire ajout */}
      {showForm && (
        <div className="bg-white border border-[#C8D8C8] rounded-xl p-6 mb-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">Nouvelle offre</h2>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Titre du poste</label>
                <input type="text" name="titre" required placeholder="Ex : Photographe junior" className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Entreprise</label>
                <input type="text" name="entreprise" required placeholder="Nom de l'entreprise" className={inputCls} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Type de contrat</label>
                <select name="type_contrat" className={inputCls}>
                  <option value="stage">Stage</option>
                  <option value="alternance">Alternance</option>
                  <option value="cdi">CDI</option>
                  <option value="cdd">CDD</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Niveau requis</label>
                <select name="niveau" className={inputCls}>
                  <option value="Tous">Tous niveaux</option>
                  <option value="Bac+1">Bac+1</option>
                  <option value="Bac+2">Bac+2</option>
                  <option value="Bac+3">Bac+3</option>
                  <option value="Bac+4">Bac+4</option>
                  <option value="Bac+5">Bac+5</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Localisation</label>
                <input type="text" name="localisation" placeholder="Paris, Lyon, Remote..." className={inputCls} />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Description</label>
              <textarea name="description" rows={3} placeholder="Décris le poste, les missions..." className={`${inputCls} resize-none`} />
            </div>
            <div className="flex gap-3 justify-end">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded-lg text-sm text-gray-500 border border-gray-200 hover:bg-gray-50">
                Annuler
              </button>
              <button type="submit" disabled={saving} className="px-4 py-2 rounded-lg text-sm font-medium bg-[#5C7A5C] text-white hover:bg-[#4A6A4A] disabled:opacity-50">
                {saving ? 'Création...' : 'Créer l\'offre'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Liste offres */}
      {offres.length === 0 ? (
        <div className="bg-white border border-[#C8D8C8] rounded-xl p-10 text-center">
          <p className="text-sm text-gray-400">Aucune offre pour l'instant.</p>
          <p className="text-xs text-gray-300 mt-1">Clique sur "+ Ajouter une offre" pour commencer.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {offres.map(offre => {
            const tc = typeColors[offre.type_contrat] || typeColors['stage']
            return (
              <div
                key={offre.id}
                className={`bg-white border border-[#C8D8C8] rounded-xl p-5 ${!offre.active ? 'opacity-50' : ''}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-900">{offre.titre}</span>
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: tc.bg, color: tc.text }}
                      >
                        {offre.type_contrat.toUpperCase()}
                      </span>
                      {!offre.active && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-400">Inactive</span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mb-1">{offre.entreprise}{offre.localisation ? ` · ${offre.localisation}` : ''} · {offre.niveau}</p>
                    {offre.description && (
                      <p className="text-xs text-gray-400 mt-2 leading-relaxed line-clamp-2">{offre.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggle(offre.id, offre.active)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                      {offre.active ? 'Désactiver' : 'Activer'}
                    </button>
                    <button
                      onClick={() => handleDelete(offre.id)}
                      className="text-xs px-3 py-1.5 rounded-lg border border-red-100 text-red-400 hover:bg-red-50 transition-colors"
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
