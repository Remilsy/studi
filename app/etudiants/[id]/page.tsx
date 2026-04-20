'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import { updateEtudiant } from './actions'

export default function EtudiantDetail() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [etudiant, setEtudiant] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [form, setForm] = useState<any>(null)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('etudiants').select('*').eq('id', id).single()
      if (data) {
        setEtudiant(data)
        setForm(data)
      }
      setLoading(false)
    }
    load()
  }, [id])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    const formData = new FormData(e.currentTarget)
    const result = await updateEtudiant(id, formData)
    setSaving(false)
    if (result.success) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#D6E6D6] flex items-center justify-center">
      <p className="text-sm text-gray-500">Chargement...</p>
    </div>
  )

  if (!etudiant) return (
    <div className="min-h-screen bg-[#D6E6D6] flex items-center justify-center">
      <p className="text-sm text-gray-500">Étudiant introuvable.</p>
    </div>
  )

  const inputCls = "w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 outline-none focus:border-[#5C7A5C] transition-colors bg-white"
  const labelCls = "text-xs font-medium text-gray-500 mb-1.5 block"

  return (
    <div className="min-h-screen bg-[#D6E6D6]">

      {/* Navbar */}
      <div className="bg-white border-b border-[#C8D8C8]">
        <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/etudiants" className="text-xs text-gray-400 hover:text-gray-700 transition-colors">← Retour</Link>
            <span className="text-gray-200">|</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#5C7A5C]"></div>
              <span className="font-semibold text-gray-900 text-sm tracking-tight">Studi</span>
            </div>
          </div>
          {saved && (
            <span className="text-xs text-[#5C7A5C] font-medium bg-[#E4EDE4] px-3 py-1 rounded-full">
              Sauvegardé
            </span>
          )}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Header étudiant */}
        <div className="bg-[#3D553D] rounded-2xl p-6 mb-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-[#D6E6D6] flex items-center justify-center text-xl font-bold text-[#3D553D] shrink-0">
            {etudiant.prenom[0]}{etudiant.nom[0]}
          </div>
          <div>
            <h1 className="text-white font-bold text-xl">{etudiant.prenom} {etudiant.nom}</h1>
            <p className="text-white text-sm mt-0.5" style={{ opacity: 0.5 }}>{etudiant.email} · {etudiant.niveau} · {etudiant.type_formation === 'alternance' ? 'Alternance' : 'Initial'}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            {/* Statut & progression */}
            <div className="bg-white rounded-2xl border border-[#C8D8C8] p-6">
              <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase mb-4">Statut & Progression</p>
              <div className="flex flex-col gap-4">
                <div>
                  <label className={labelCls}>Statut</label>
                  <select name="statut" defaultValue={etudiant.statut} className={inputCls}>
                    <option value="en_preparation">En préparation</option>
                    <option value="en_recherche">En recherche</option>
                    <option value="place">Placé</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Score de progression ({form?.score_progression ?? etudiant.score_progression}%)</label>
                  <input
                    type="range" name="score_progression"
                    min={0} max={100} defaultValue={etudiant.score_progression}
                    onChange={e => setForm({ ...form, score_progression: e.target.value })}
                    className="w-full accent-[#5C7A5C]"
                  />
                </div>
                <div>
                  <label className={labelCls}>Objectif candidatures / semaine</label>
                  <input type="number" name="objectif_candidatures" defaultValue={etudiant.objectif_candidatures ?? 5} min={1} className={inputCls} />
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white rounded-2xl border border-[#C8D8C8] p-6">
              <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase mb-4">Documents</p>
              <div className="flex flex-col gap-4">
                <div>
                  <label className={labelCls}>Statut CV</label>
                  <select name="cv_statut" defaultValue={etudiant.cv_statut ?? 'a_deposer'} className={inputCls}>
                    <option value="a_deposer">Non déposé</option>
                    <option value="depose">Déposé</option>
                    <option value="a_mettre_a_jour">À mettre à jour</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Statut lettre de motivation</label>
                  <select name="lettre_statut" defaultValue={etudiant.lettre_statut ?? 'a_deposer'} className={inputCls}>
                    <option value="a_deposer">Non déposée</option>
                    <option value="depose">Déposée</option>
                    <option value="a_mettre_a_jour">À mettre à jour</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Prochain entretien</label>
                  <input type="date" name="prochain_entretien" defaultValue={etudiant.prochain_entretien ?? ''} className={inputCls} />
                </div>
              </div>
            </div>

            {/* Candidatures */}
            <div className="bg-white rounded-2xl border border-[#C8D8C8] p-6">
              <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase mb-4">Candidatures</p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: 'nb_candidatures',         label: 'Envoyées',    default: etudiant.nb_candidatures ?? 0 },
                  { name: 'nb_candidatures_attente', label: 'En attente',  default: etudiant.nb_candidatures_attente ?? 0 },
                  { name: 'nb_candidatures_refus',   label: 'Refus',       default: etudiant.nb_candidatures_refus ?? 0 },
                  { name: 'nb_entretiens',           label: 'Entretiens',  default: etudiant.nb_entretiens ?? 0 },
                  { name: 'nb_entreprises',          label: 'Entreprises', default: etudiant.nb_entreprises ?? 0 },
                ].map(({ name, label, default: def }) => (
                  <div key={name}>
                    <label className={labelCls}>{label}</label>
                    <input type="number" name={name} defaultValue={def} min={0} className={inputCls} />
                  </div>
                ))}
              </div>
            </div>

            {/* Note responsable */}
            <div className="bg-white rounded-2xl border border-[#C8D8C8] p-6">
              <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase mb-4">Note responsable</p>
              <textarea
                name="notes_responsable"
                defaultValue={etudiant.notes_responsable ?? ''}
                rows={8}
                placeholder="Écris ici tes observations sur cet étudiant..."
                className={`${inputCls} resize-none`}
              />
            </div>

          </div>

          {/* Bouton save */}
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-[#5C7A5C] text-white px-8 py-2.5 rounded-xl text-sm font-medium hover:bg-[#4A6A4A] transition-colors disabled:opacity-50"
            >
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
