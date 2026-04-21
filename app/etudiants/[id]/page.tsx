'use client'

import { useState, useEffect, useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '../../../lib/supabase'
import { updateEtudiant, getCandidaturesForEtudiant } from './actions'

const CAND_STATUTS = [
  { key: 'envoye',     label: 'Envoyée',    color: '#3D553D', bg: '#E4EDE4', dot: '#5C7A5C' },
  { key: 'en_attente', label: 'En attente', color: '#C2410C', bg: '#FFF7ED', dot: '#F97316' },
  { key: 'entretien',  label: 'Entretien',  color: '#1D4ED8', bg: '#EFF6FF', dot: '#3B82F6' },
  { key: 'refus',      label: 'Refus',      color: '#9F1239', bg: '#FFF1F2', dot: '#F43F5E' },
  { key: 'accepte',    label: 'Acceptée',   color: '#15803D', bg: '#F0FDF4', dot: '#16A34A' },
]
const MOIS_GRAPH = [
  { key: '2026-04', label: 'Avr' },
  { key: '2026-05', label: 'Mai' },
  { key: '2026-06', label: 'Jun' },
  { key: '2026-07', label: 'Jul' },
  { key: '2026-08', label: 'Aoû' },
]
function getCS(key: string) { return CAND_STATUTS.find(s => s.key === key) || CAND_STATUTS[0] }
function isCRelance(c: any) {
  if (c.statut !== 'en_attente') return false
  return Math.round((Date.now() - new Date(c.date_action).getTime()) / 86400000) >= 7
}
function fmtDate(str: string) {
  const d = new Date(str)
  const diff = Math.round((new Date().setHours(0,0,0,0) - d.setHours(0,0,0,0)) / 86400000)
  if (diff === 0) return "Aujourd'hui"
  if (diff === 1) return 'Hier'
  if (diff < 7) return `Il y a ${diff}j`
  return new Date(str).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

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
  const [candidatures, setCandidatures] = useState<any[]>([])
  const [candFilter, setCandFilter] = useState('toutes')
  const [candSearch, setCandSearch] = useState('')

  useEffect(() => {
    supabase.from('etudiants').select('*').eq('id', id).single().then(({ data }) => {
      if (data) { setEtudiant(data); setScoreVal(data.score_progression ?? 0) }
      setLoading(false)
    })
    getCandidaturesForEtudiant(id).then(data => setCandidatures(data))
  }, [id])

  const candStats = useMemo(() => ({
    total:       candidatures.length,
    envoye:      candidatures.filter(c => c.statut === 'envoye').length,
    attente:     candidatures.filter(c => c.statut === 'en_attente').length,
    entretien:   candidatures.filter(c => c.statut === 'entretien').length,
    refus:       candidatures.filter(c => c.statut === 'refus').length,
    accepte:     candidatures.filter(c => c.statut === 'accepte').length,
    relances:    candidatures.filter(isCRelance).length,
    tauxReponse: candidatures.length > 0
      ? Math.round((candidatures.filter(c => c.statut !== 'envoye').length / candidatures.length) * 100) : 0,
  }), [candidatures])

  const candFiltered = useMemo(() => {
    let list = candidatures
    if (candFilter !== 'toutes') list = list.filter(c => c.statut === candFilter)
    if (candSearch) {
      const q = candSearch.toLowerCase()
      list = list.filter(c =>
        c.entreprise.toLowerCase().includes(q) ||
        c.poste.toLowerCase().includes(q) ||
        (c.notes || '').toLowerCase().includes(q)
      )
    }
    return list
  }, [candidatures, candFilter, candSearch])

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

  const progression = (() => {
    let score = 0
    if (etudiant.telephone) score += 20
    if (etudiant.linkedin)  score += 20
    if (etudiant.cv_statut     === 'depose') score += 20
    if (etudiant.lettre_statut === 'depose') score += 20
    if ((etudiant.nb_candidatures || 0) > 0) score += 20
    return score
  })()

  const s = statutConfig[etudiant.statut] || statutConfig['en_preparation']
  const cv = docConfig[etudiant.cv_statut] || docConfig['a_deposer']
  const lm = docConfig[etudiant.lettre_statut] || docConfig['a_deposer']
  const nbCandidatures = etudiant.nb_candidatures ?? 0
  const objectif = etudiant.objectif_candidatures ?? 5
  const objectifPct = Math.min(Math.round((nbCandidatures / objectif) * 100), 100)
  const urgence = etudiant.statut === 'en_recherche' && nbCandidatures === 0
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
                <span className="text-sm font-bold text-white">{progression}%</span>
              </div>
              <div className="h-1.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <div className="h-full rounded-full" style={{ width: `${progression}%`, backgroundColor: 'rgba(255,255,255,0.6)' }}></div>
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
                  { label: 'Envoyées',    value: nbCandidatures,                        color: '#3D553D' },
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
                <span className="text-xs text-gray-400">{nbCandidatures} / {objectif} candidatures</span>
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
                { label: 'Curriculum Vitae', cfg: cv, url: etudiant.cv_url },
                { label: 'Portfolio',         cfg: lm, url: etudiant.lettre_url },
              ].map(({ label, cfg, url }) => (
                <div key={label} className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: cfg.bg }}>
                  <div>
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cfg.dot }}></div>
                      <span className="text-xs font-semibold" style={{ color: cfg.color }}>{cfg.label}</span>
                    </div>
                  </div>
                  {url && (
                    <a href={url} target="_blank" rel="noopener noreferrer"
                      className="text-xs font-bold text-[#3D553D] bg-white px-3 py-1.5 rounded-xl border border-[#C8D8C8] hover:bg-[#F0FDF4] transition-colors shrink-0">
                      Voir ↗
                    </a>
                  )}
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

        {/* ── CANDIDATURES ── */}
        <div className="bg-white rounded-2xl border border-[#C8D8C8] overflow-hidden">

          {/* En-tête + stats */}
          <div className="p-6 border-b border-[#F3F4F6]">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase mb-1">Suivi des candidatures</p>
                <p className="text-2xl font-black text-gray-900">
                  {candStats.total}
                  <span className="text-sm font-normal text-gray-400 ml-2">candidature{candStats.total > 1 ? 's' : ''}</span>
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'Taux réponse', value: `${candStats.tauxReponse}%`, color: '#1D4ED8', bg: '#EFF6FF' },
                  { label: 'Entretiens',   value: candStats.entretien,          color: '#1D4ED8', bg: '#EFF6FF' },
                  ...(candStats.relances > 0 ? [{ label: 'À relancer', value: candStats.relances, color: '#C2410C', bg: '#FFF7ED' }] : []),
                  ...(candStats.accepte > 0  ? [{ label: 'Acceptées',  value: candStats.accepte,  color: '#15803D', bg: '#F0FDF4' }] : []),
                ].map(({ label, value, color, bg }) => (
                  <div key={label} className="px-4 py-2.5 rounded-xl text-center" style={{ backgroundColor: bg }}>
                    <p className="text-xl font-black" style={{ color }}>{value}</p>
                    <p className="text-[10px] font-semibold text-gray-400 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Mini graphe mensuel */}
            {candStats.total > 0 && (() => {
              const data = MOIS_GRAPH.map(m => ({
                ...m,
                count: candidatures.filter(c => c.date_action?.startsWith(m.key)).length,
              }))
              const max = Math.max(...data.map(m => m.count), 1)
              const now = new Date().toISOString().slice(0, 7)
              return (
                <div className="mt-5 flex items-end gap-3 h-20">
                  {data.map(m => {
                    const pct   = m.count > 0 ? Math.max((m.count / max) * 100, 10) : 3
                    const isCur = m.key === now
                    return (
                      <div key={m.key} className="flex-1 flex flex-col items-center gap-1.5">
                        <div className="h-3 flex items-end">
                          {m.count > 0 && <span className="text-[10px] font-black" style={{ color: isCur ? '#3D553D' : '#5C7A5C' }}>{m.count}</span>}
                        </div>
                        <div className="w-full flex items-end" style={{ height: '44px' }}>
                          <div className="w-full rounded-t-lg transition-all"
                            style={{ height: `${pct}%`, minHeight: '3px',
                              backgroundColor: isCur ? '#3D553D' : m.count > 0 ? '#A3BFA3' : '#E4EDE4',
                              boxShadow: isCur ? '0 -2px 6px rgba(61,85,61,0.2)' : 'none' }} />
                        </div>
                        <p className="text-[10px] font-semibold" style={{ color: isCur ? '#3D553D' : '#9CA3AF' }}>{m.label}</p>
                      </div>
                    )
                  })}
                </div>
              )
            })()}

            {/* Répartition par statut */}
            {candStats.total > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-4">
                {CAND_STATUTS.map(st => {
                  const count = candidatures.filter(c => c.statut === st.key).length
                  if (!count) return null
                  return (
                    <span key={st.key} className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full"
                      style={{ backgroundColor: st.bg, color: st.color }}>
                      <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: st.dot }}></span>
                      {count} {st.label}
                    </span>
                  )
                })}
              </div>
            )}
          </div>

          {/* Filtres + recherche */}
          {candStats.total > 0 && (
            <div className="px-5 py-3 border-b border-[#F3F4F6] flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <div className="flex gap-1 flex-wrap">
                {[
                  { key: 'toutes',     label: `Toutes (${candStats.total})` },
                  { key: 'envoye',     label: `Envoyées (${candStats.envoye})` },
                  { key: 'en_attente', label: `Attente (${candStats.attente})` },
                  { key: 'entretien',  label: `Entretiens (${candStats.entretien})` },
                  { key: 'refus',      label: `Refus (${candStats.refus})` },
                  { key: 'accepte',    label: `Acceptées (${candStats.accepte})` },
                ].map(({ key, label }) => {
                  const opt = CAND_STATUTS.find(x => x.key === key)
                  return (
                    <button key={key} onClick={() => setCandFilter(key)}
                      className="px-3 py-1 rounded-lg text-xs font-semibold transition-all"
                      style={candFilter === key
                        ? { backgroundColor: opt?.bg || '#E4EDE4', color: opt?.color || '#3D553D' }
                        : { color: '#9CA3AF' }}>
                      {label}
                    </button>
                  )
                })}
              </div>
              <input type="text" placeholder="Rechercher..." value={candSearch}
                onChange={e => setCandSearch(e.target.value)}
                className="sm:ml-auto px-3 py-1.5 rounded-xl border border-[#C8D8C8] text-xs outline-none focus:border-[#5C7A5C] w-44 bg-white" />
            </div>
          )}

          {/* Tableau */}
          {candStats.total === 0 ? (
            <div className="py-16 text-center">
              <p className="text-3xl mb-3">📋</p>
              <p className="text-sm font-semibold text-gray-500">Aucune candidature enregistrée</p>
              <p className="text-xs text-gray-400 mt-1">L'étudiant n'a pas encore commencé à tracker ses candidatures.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse" style={{ minWidth: '640px' }}>
                <thead>
                  <tr className="bg-[#F8FAF8] border-b border-[#E5E7EB]">
                    <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400">Entreprise</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400">Poste</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400 w-36">Statut</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400 w-28">Date</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400">Notes</th>
                    <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400 w-20">Lien</th>
                  </tr>
                </thead>
                <tbody>
                  {candFiltered.map((c, i) => {
                    const s = getCS(c.statut)
                    const relance = isCRelance(c)
                    return (
                      <tr key={c.id}
                        className="border-b border-[#F3F4F6] hover:bg-[#FAFAFA] transition-colors"
                        style={{ borderLeft: `3px solid ${s.dot}` }}>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0"
                              style={{ backgroundColor: s.bg, color: s.color }}>
                              {c.entreprise[0]?.toUpperCase()}
                            </div>
                            <span className="text-sm font-bold text-gray-900">{c.entreprise}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600 max-w-44 truncate">{c.poste}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                              style={{ backgroundColor: s.bg, color: s.color }}>
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.dot }}></span>
                              {s.label}
                            </span>
                            {relance && (
                              <span className="text-[10px] font-bold text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded-full border border-orange-200">
                                🔔
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{fmtDate(c.date_action)}</td>
                        <td className="px-4 py-3 text-xs text-gray-500 max-w-52 truncate">
                          {c.notes || <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          {c.url
                            ? <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-xs text-[#5C7A5C] hover:underline font-medium">↗ Voir</a>
                            : <span className="text-gray-300 text-xs">—</span>
                          }
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                {candFiltered.length > 0 && (
                  <tfoot>
                    <tr className="bg-[#F8FAF8] border-t-2 border-[#E5E7EB]">
                      <td colSpan={6} className="px-5 py-3 text-xs font-bold text-gray-500">
                        {candFiltered.length} candidature{candFiltered.length > 1 ? 's' : ''}
                        {candFiltered.length !== candStats.total && <span className="text-gray-300 font-normal"> sur {candStats.total}</span>}
                        {candStats.relances > 0 && (
                          <span className="ml-3 text-orange-500">🔔 {candStats.relances} à relancer</span>
                        )}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
              {candFiltered.length === 0 && (
                <div className="py-10 text-center">
                  <p className="text-sm text-gray-400">Aucune candidature pour ce filtre.</p>
                </div>
              )}
            </div>
          )}
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
                    <label className={labelCls}>Statut Portfolio</label>
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
