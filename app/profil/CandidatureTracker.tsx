'use client'

import { useState, useCallback } from 'react'
import { updateCandidatureStats } from './actions'

interface Props {
  initial: {
    nb_candidatures: number
    nb_candidatures_attente: number
    nb_candidatures_refus: number
    nb_entretiens: number
    nb_entreprises: number
    prochain_entretien: string | null
    objectif_candidatures: number
  }
}

function getLevel(n: number): { label: string; next: number; color: string; bg: string; emoji: string } {
  if (n >= 20) return { label: 'Or',    next: 20, color: '#92400E', bg: '#FEF3C7', emoji: '🥇' }
  if (n >= 10) return { label: 'Argent', next: 20, color: '#475569', bg: '#F1F5F9', emoji: '🥈' }
  if (n >= 5)  return { label: 'Bronze', next: 10, color: '#92400E', bg: '#FEF9EE', emoji: '🥉' }
  return            { label: 'Débutant', next: 5,  color: '#6B7280', bg: '#F9FAFB', emoji: '⭐' }
}

function Counter({
  label, value, onChange, color = '#3D553D',
}: {
  label: string; value: number; onChange: (v: number) => void; color?: string
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#F8FAF8]">
      <span className="text-sm font-medium text-gray-600">{label}</span>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors text-sm font-bold"
        >−</button>
        <span className="text-lg font-bold w-6 text-center" style={{ color }}>{value}</span>
        <button
          onClick={() => onChange(value + 1)}
          className="w-7 h-7 rounded-full flex items-center justify-center text-white transition-colors text-sm font-bold hover:opacity-80"
          style={{ backgroundColor: color }}
        >+</button>
      </div>
    </div>
  )
}

export default function CandidatureTracker({ initial }: Props) {
  const [cand,    setCand]    = useState(initial.nb_candidatures)
  const [attente, setAttente] = useState(initial.nb_candidatures_attente)
  const [refus,   setRefus]   = useState(initial.nb_candidatures_refus)
  const [entret,  setEntret]  = useState(initial.nb_entretiens)
  const [entrep,  setEntrep]  = useState(initial.nb_entreprises)
  const [entretienDate, setEntretienDate] = useState(initial.prochain_entretien ?? '')
  const [saving,  setSaving]  = useState(false)
  const [flash,   setFlash]   = useState(false)
  const [saved,   setSaved]   = useState(false)

  const objectif = initial.objectif_candidatures
  const objectifPct = Math.min(Math.round((cand / objectif) * 100), 100)
  const level = getLevel(cand)
  const levelPct = cand >= 20 ? 100 : Math.round((cand / level.next) * 100)

  const handleAddCandidature = useCallback(() => {
    setCand(v => v + 1)
    setFlash(true)
    setTimeout(() => setFlash(false), 600)
  }, [])

  async function handleSave() {
    setSaving(true)
    await updateCandidatureStats({
      nb_candidatures: cand,
      nb_candidatures_attente: attente,
      nb_candidatures_refus: refus,
      nb_entretiens: entret,
      nb_entreprises: entrep,
      prochain_entretien: entretienDate || null,
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const motivMessages = [
    'Continue, tu es sur la bonne voie !',
    'Chaque candidature compte.',
    'La régularité fait la différence.',
    'Plus tu postules, plus tu progresses.',
  ]
  const motivMsg = motivMessages[cand % motivMessages.length]

  return (
    <div className="flex flex-col gap-4">

      {/* Bouton principal */}
      <button
        onClick={handleAddCandidature}
        className="relative w-full rounded-2xl p-6 text-white font-bold text-lg transition-all active:scale-95 overflow-hidden"
        style={{ backgroundColor: '#3D553D' }}
      >
        <div className="flex items-center justify-center gap-3">
          <span className="text-3xl">+</span>
          <span>J'ai candidaté !</span>
        </div>
        <p className="text-sm font-normal mt-1 opacity-60">Appuie à chaque candidature envoyée</p>
        {flash && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span
              className="text-5xl font-black text-white opacity-0 animate-ping"
              style={{ animation: 'ping 0.5s ease-out forwards' }}
            >+1</span>
          </div>
        )}
      </button>

      {/* Compteur principal + niveau */}
      <div className="bg-white rounded-2xl border border-[#C8D8C8] p-5 flex items-center gap-5">
        <div className="flex-1">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Candidatures envoyées</p>
          <p
            className="text-6xl font-black tracking-tight transition-all"
            style={{ color: '#3D553D' }}
          >
            {cand}
          </p>
          <p className="text-xs text-gray-400 mt-1">{motivMsg}</p>
        </div>
        <div className="flex flex-col items-center gap-2 shrink-0">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
            style={{ backgroundColor: level.bg }}
          >
            {level.emoji}
          </div>
          <span className="text-xs font-bold" style={{ color: level.color }}>{level.label}</span>
          {cand < 20 && (
            <span className="text-[10px] text-gray-400">{level.next - cand} avant le prochain</span>
          )}
        </div>
      </div>

      {/* Niveau progress */}
      {cand < 20 && (
        <div className="bg-white rounded-2xl border border-[#C8D8C8] px-5 py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500">Niveau {level.label}</span>
            <span className="text-xs text-gray-400">{cand} / {level.next}</span>
          </div>
          <div className="h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${levelPct}%`, backgroundColor: level.color }}
            ></div>
          </div>
        </div>
      )}

      {/* Objectif semaine */}
      <div className="bg-white rounded-2xl border border-[#C8D8C8] px-5 py-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-600">Objectif de la semaine</span>
          <span className="text-xs font-bold" style={{ color: objectifPct >= 100 ? '#16A34A' : '#5C7A5C' }}>
            {cand} / {objectif} {objectifPct >= 100 ? '✓' : ''}
          </span>
        </div>
        <div className="h-2.5 bg-[#E4EDE4] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${objectifPct}%`, backgroundColor: objectifPct >= 100 ? '#16A34A' : '#5C7A5C' }}
          ></div>
        </div>
        {objectifPct >= 100 && (
          <p className="text-xs text-green-600 font-semibold mt-2">Objectif atteint cette semaine !</p>
        )}
      </div>

      {/* Détail stats */}
      <div className="bg-white rounded-2xl border border-[#C8D8C8] p-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Détail de tes candidatures</p>
        <div className="flex flex-col gap-2">
          <Counter label="En attente de réponse" value={attente} onChange={setAttente} color="#C2410C" />
          <Counter label="Refus reçus"            value={refus}   onChange={setRefus}   color="#9F1239" />
          <Counter label="Entretiens obtenus"     value={entret}  onChange={setEntret}  color="#1D4ED8" />
          <Counter label="Entreprises contactées" value={entrep}  onChange={setEntrep}  color="#6D28D9" />
        </div>
      </div>

      {/* Prochain entretien */}
      <div className="bg-white rounded-2xl border border-[#C8D8C8] p-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Prochain entretien</p>
        <input
          type="date"
          value={entretienDate}
          onChange={e => setEntretienDate(e.target.value)}
          className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 outline-none focus:border-[#5C7A5C] transition-colors"
        />
        {entretienDate && (
          <p className="text-xs text-[#5C7A5C] font-semibold mt-2">
            {new Date(entretienDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        )}
      </div>

      {/* Bouton sauvegarder */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full py-3 rounded-2xl text-sm font-semibold transition-all disabled:opacity-50"
        style={{ backgroundColor: saved ? '#F0FDF4' : '#E4EDE4', color: saved ? '#15803D' : '#3D553D' }}
      >
        {saving ? 'Sauvegarde...' : saved ? 'Sauvegardé !' : 'Sauvegarder mes mises à jour'}
      </button>
    </div>
  )
}
