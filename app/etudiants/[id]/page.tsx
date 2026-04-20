'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import { updateEtudiant } from './actions'

const statutConfig: Record<string, { label: string; dot: string; text: string; bg: string; border: string }> = {
  en_preparation: { label: 'En préparation', dot: '#9CA3AF', text: '#6B7280', bg: '#F9FAFB', border: '#E5E7EB' },
  en_recherche:   { label: 'En recherche',   dot: '#5C7A5C', text: '#3D553D', bg: '#E4EDE4', border: '#5C7A5C' },
  place:          { label: 'Placé',           dot: '#16A34A', text: '#15803D', bg: '#F0FDF4', border: '#16A34A' },
}

const docConfig: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  depose:          { label: 'Déposé',          color: '#15803D', bg: '#F0FDF4', dot: '#16A34A' },
  a_mettre_a_jour: { label: 'À mettre à jour', color: '#C2410C', bg: '#FFF7ED', dot: '#F97316' },
  a_deposer:       { label: 'Non déposé',       color: '#9CA3AF', bg: '#F3F4F6', dot: '#D1D5DB' },
}

export default function EtudiantDetail() {
  const { id } = useParams<{ id: string }>()
  const [etudiant, setEtudiant] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [scoreVal, setScoreVal] = useState(0)

  useEffect(() => {
    supabase.from('etudiants').select('*').eq('id', id).single().then(({ data }) => {
      if (data) { setEtudiant(data); setScoreVal(data.score_progression ?? 0) }
      setLoading(false)
    })
  }, [id])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    const formData = new FormData(e.currentTarget)
    const result = await updateEtudiant(id, formData)
    setSaving(false)
    if (result.success) {
      const { data } = await supabase.from('etudiants').select('*').eq('id', id).single()
      if (data) { setEtudiant(data); setScoreVal(data.score_progression ?? 0) }
      setSaved(true)
      setEditing(false)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-[#D6E6D6] flex items-center justify-center">
      <p className="text-sm text-gray-400">Chargement...</p>
    </div>
  )
  if (!etudiant) return (
    <div className="min-h-screen bg-[#D6E6D6] flex items-center justify-center">
      <p className="text-sm text-gray-400">Étudiant introuvable.</p>
    </div>
  )

  const s = statutConfig[etudiant.statut] || statutConfig['en_preparation']
  const cv = docConfig[etudiant.cv_statut] || docConfig['a_deposer']
  const lm = docConfig[etudiant.lettre_statut] || docConfig['a_deposer']
  const candidatures = etudiant.nb_candidatures ?? 0
  const objectif = etudiant.objectif_candidatures ?? 5
  const objectifPct = Math.min(Math.round((candidatures / objectif) * 100), 100)
  const urgence = etudiant.statut === 'en_recherche' && candidatures === 0
  const inputCls = "w-full px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-900 outline-none focus:border-[#5C7A5C] transition-colors bg-white"
  const labelCls = "text-xs font-medium text-gray-500 mb-1.5 block"

  const prochainEntretien = etudiant.prochain_entretien
    ? new Date(etudiant.prochain_entretien)
    : null
  const today = new Date(); today.setHours(0,0,0,0)
  const entretienDemain = prochainEntretien
    ? Math.ceil((prochainEntretien.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div className="min-h-screen bg-[#D6E6D6]">

      {/* Navbar */}
      <div className="bg-white border-b border-[#C8D8C8]">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xs text-gray-400 hover:text-gray-700 transition-colors">← Dashboard</Link>
            <span className="text-gray-200">|</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#5C7A5C]"></div>
              <span className="font-semibold text-gray-900 text-sm tracking-tight">Studi</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {saved && (
              <span className="text-xs text-[#5C7A5C] font-medium bg-[#E4EDE4] px-3 py-1 rounded-full">
                Sauvegardé
              </span>
            )}
            {!editing ? (
              <button
                onClick={() => setEditing(true)}
                className="bg-[#5C7A5C] text-white px-4 py-1.5 rounded-lg text-xs font-medium hover:bg-[#4A6A4A] transition-colors"
              >
                Modifier la fiche
              </button>
            ) : (
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-1.5 rounded-lg text-xs font-medium border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col gap-4">

        {/* ── HERO ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 bg-white rounded-2xl border border-[#C8D8C8] overflow-hidden">

          {/* Gauche */}
          <div className="lg:col-span-2 bg-[#3D553D] p-8 flex flex-col gap-5">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-[#D6E6D6] flex items-center justify-center text-xl font-bold text-[#3D553D] mb-4">
                {etudiant.prenom[0]}{etudiant.nom[0]}
              </div>
              <h1 className="text-white font-bold text-2xl tracking-tight">{etudiant.prenom} {etudiant.nom}</h1>
              <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>{etudiant.email}</p>
              <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                {etudiant.niveau} · {etudiant.type_formation === 'alternance' ? 'Alternance' : 'Initial'}
              </p>

              <div className="flex items-center gap-2 mt-3">
                <div
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
                >
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.dot }}></div>
                  <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>{s.label}</span>
                </div>
                {urgence && (
                  <div
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                    style={{ backgroundColor: 'rgba(239,68,68,0.2)' }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
                    <span className="text-xs font-medium text-red-300">À relancer</span>
                  </div>
                )}
              </div>
            </div>

            {/* Progression */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>PROGRESSION</span>
                <span className="text-sm font-bold text-white">{etudiant.score_progression ?? 0}%</span>
              </div>
              <div className="h-1.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <div className="h-full rounded-full" style={{ width: `${etudiant.score_progression ?? 0}%`, backgroundColor: 'rgba(255,255,255,0.6)' }}></div>
              </div>
            </div>

            {/* Contact */}
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '20px' }} className="flex flex-col gap-2">
              {etudiant.telephone && (
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Tél.</span>
                  <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>{etudiant.telephone}</span>
                </div>
              )}
              {etudiant.linkedin && (
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>LinkedIn</span>
                  <a href={etudiant.linkedin} target="_blank" rel="noopener noreferrer" className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
                    Voir le profil →
                  </a>
                </div>
              )}
              {etudiant.age && (
                <div className="flex items-center gap-2">
                  <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Âge</span>
                  <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>{etudiant.age} ans</span>
                </div>
              )}
            </div>
          </div>

          {/* Droite — stats */}
          <div className="lg:col-span-3 p-8 flex flex-col gap-6">

            {/* Prochain entretien mis en avant */}
            {prochainEntretien && (
              <div
                className="rounded-xl p-4 flex items-center gap-4"
                style={{ backgroundColor: entretienDemain !== null && entretienDemain <= 2 ? '#FFF7ED' : '#F0F7FF', border: `1px solid ${entretienDemain !== null && entretienDemain <= 2 ? '#FED7AA' : '#BFDBFE'}` }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex flex-col items-center justify-center shrink-0"
                  style={{ backgroundColor: entretienDemain !== null && entretienDemain <= 2 ? '#F97316' : '#3B82F6' }}
                >
                  <span className="text-white text-xs font-bold leading-none">{prochainEntretien.getDate()}</span>
                  <span className="text-white text-[9px] leading-none mt-0.5 uppercase">
                    {prochainEntretien.toLocaleDateString('fr-FR', { month: 'short' })}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold" style={{ color: entretienDemain !== null && entretienDemain <= 2 ? '#C2410C' : '#1D4ED8' }}>
                    Prochain entretien
                  </p>
                  <p className="text-xs" style={{ color: entretienDemain !== null && entretienDemain <= 2 ? '#EA580C' : '#3B82F6' }}>
                    {entretienDemain === 0 ? "Aujourd'hui !" : entretienDemain === 1 ? 'Demain' : `Dans ${entretienDemain} jours`}
                    {' · '}{prochainEntretien.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  </p>
                </div>
              </div>
            )}

            {/* Stats candidatures */}
            <div>
              <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase mb-4">Candidatures</p>
              <div className="grid grid-cols-3 gap-4 mb-4">
                {[
                  { label: 'Envoyées',    value: candidatures,                          color: '#3D553D' },
                  { label: 'Entretiens',  value: etudiant.nb_entretiens ?? 0,            color: '#1D4ED8' },
                  { label: 'Entreprises', value: etudiant.nb_entreprises ?? 0,           color: '#6D28D9' },
                ].map(({ label, value, color }) => (
                  <div key={label}>
                    <p className="text-4xl font-bold tracking-tight" style={{ color }}>{value}</p>
                    <p className="text-xs font-semibold text-gray-500 mt-1">{label}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'En attente', value: etudiant.nb_candidatures_attente ?? 0, bg: '#FFF7ED', color: '#C2410C' },
                  { label: 'Refus',      value: etudiant.nb_candidatures_refus ?? 0,   bg: '#FFF1F2', color: '#9F1239' },
                ].map(({ label, value, bg, color }) => (
                  <div key={label} className="flex items-center justify-between px-4 py-3 rounded-xl" style={{ backgroundColor: bg }}>
                    <span className="text-xs font-medium" style={{ color }}>{label}</span>
                    <span className="text-xl font-bold" style={{ color }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Objectif semaine */}
            <div className="border-t border-[#F3F4F6] pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-600">Objectif de la semaine</span>
                <span className="text-xs text-gray-400">{candidatures} / {objectif} candidatures</span>
              </div>
              <div className="h-2 bg-[#E4EDE4] rounded-full overflow-hidden">
                <div className="h-full bg-[#5C7A5C] rounded-full transition-all" style={{ width: `${objectifPct}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* ── LIGNE 2 ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Documents */}
          <div className="bg-white rounded-2xl border border-[#C8D8C8] p-6">
            <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase mb-4">Documents</p>
            <div className="flex flex-col gap-3">
              {[
                { label: 'Curriculum Vitae',     cfg: cv },
                { label: 'Lettre de motivation', cfg: lm },
              ].map(({ label, cfg }) => (
                <div key={label} className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: cfg.bg }}>
                  <span className="text-sm font-medium text-gray-700">{label}</span>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.dot }}></div>
                    <span className="text-xs font-semibold" style={{ color: cfg.color }}>{cfg.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Statut */}
          <div className="bg-white rounded-2xl border border-[#C8D8C8] p-6">
            <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase mb-4">Statut</p>
            <div className="flex flex-col gap-2">
              {Object.entries(statutConfig).map(([key, cfg]) => (
                <div
                  key={key}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{
                    backgroundColor: etudiant.statut === key ? cfg.bg : 'transparent',
                    border: `1px solid ${etudiant.statut === key ? cfg.border : 'transparent'}`,
                  }}
                >
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cfg.dot }}></div>
                  <span className="text-sm font-medium" style={{ color: etudiant.statut === key ? cfg.text : '#9CA3AF' }}>
                    {cfg.label}
                  </span>
                  {etudiant.statut === key && (
                    <div className="ml-auto w-4 h-4 rounded-full bg-white flex items-center justify-center" style={{ border: `1px solid ${cfg.border}` }}>
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.dot }}></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Note responsable */}
          <div className="bg-white rounded-2xl border border-[#C8D8C8] p-6">
            <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase mb-3">Note responsable</p>
            {etudiant.notes_responsable ? (
              <p className="text-sm text-gray-700 leading-relaxed">{etudiant.notes_responsable}</p>
            ) : (
              <p className="text-sm text-gray-300 italic">Aucune note. Clique sur "Modifier la fiche" pour en ajouter une.</p>
            )}
          </div>
        </div>

        {/* ── MODE ÉDITION ── */}
        {editing && (
          <div className="bg-white rounded-2xl border border-[#5C7A5C] p-6">
            <p className="text-xs font-semibold text-[#5C7A5C] tracking-widest uppercase mb-5">Mode édition</p>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Statut & Progression */}
                <div className="flex flex-col gap-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Statut & Progression</p>
                  <div>
                    <label className={labelCls}>Statut</label>
                    <select name="statut" defaultValue={etudiant.statut} className={inputCls}>
                      <option value="en_preparation">En préparation</option>
                      <option value="en_recherche">En recherche</option>
                      <option value="place">Placé</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelCls}>Score de progression ({scoreVal}%)</label>
                    <input
                      type="range" name="score_progression"
                      min={0} max={100} defaultValue={etudiant.score_progression ?? 0}
                      onChange={e => setScoreVal(parseInt(e.target.value))}
                      className="w-full accent-[#5C7A5C]"
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Objectif candidatures / semaine</label>
                    <input type="number" name="objectif_candidatures" defaultValue={etudiant.objectif_candidatures ?? 5} min={1} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Prochain entretien</label>
                    <input type="date" name="prochain_entretien" defaultValue={etudiant.prochain_entretien ?? ''} className={inputCls} />
                  </div>
                </div>

                {/* Documents */}
                <div className="flex flex-col gap-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Documents</p>
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
                </div>

                {/* Candidatures */}
                <div className="flex flex-col gap-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Candidatures</p>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { name: 'nb_candidatures',         label: 'Envoyées',    val: etudiant.nb_candidatures ?? 0 },
                      { name: 'nb_candidatures_attente', label: 'En attente',  val: etudiant.nb_candidatures_attente ?? 0 },
                      { name: 'nb_candidatures_refus',   label: 'Refus',       val: etudiant.nb_candidatures_refus ?? 0 },
                      { name: 'nb_entretiens',           label: 'Entretiens',  val: etudiant.nb_entretiens ?? 0 },
                      { name: 'nb_entreprises',          label: 'Entreprises', val: etudiant.nb_entreprises ?? 0 },
                    ].map(({ name, label, val }) => (
                      <div key={name}>
                        <label className={labelCls}>{label}</label>
                        <input type="number" name={name} defaultValue={val} min={0} className={inputCls} />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Note */}
                <div className="flex flex-col gap-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Note responsable</p>
                  <textarea
                    name="notes_responsable"
                    defaultValue={etudiant.notes_responsable ?? ''}
                    rows={7}
                    placeholder="Observations, points d'attention, suivi..."
                    className={`${inputCls} resize-none`}
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button type="button" onClick={() => setEditing(false)} className="px-5 py-2 rounded-xl text-sm text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors">
                  Annuler
                </button>
                <button type="submit" disabled={saving} className="bg-[#5C7A5C] text-white px-8 py-2 rounded-xl text-sm font-medium hover:bg-[#4A6A4A] transition-colors disabled:opacity-50">
                  {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
