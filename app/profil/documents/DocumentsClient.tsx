'use client'
import { useState } from 'react'
import Link from 'next/link'
import { updateDocuments } from './actions'

const STATUTS_DOC = [
  { key: 'depose',          label: 'Déposé',          color: '#15803D', bg: '#F0FDF4', dot: '#16A34A', desc: 'Ton document est à jour et accessible.' },
  { key: 'a_mettre_a_jour', label: 'À mettre à jour', color: '#C2410C', bg: '#FFF7ED', dot: '#F97316', desc: 'Ton document existe mais nécessite une mise à jour.' },
  { key: 'a_deposer',       label: 'Non déposé',       color: '#9CA3AF', bg: '#F3F4F6', dot: '#D1D5DB', desc: 'Document non encore partagé.' },
]

function getS(key: string) { return STATUTS_DOC.find(s => s.key === key) || STATUTS_DOC[2] }

interface Props {
  cvStatut: string
  lettreStatut: string
  cvUrl: string | null
  lettreUrl: string | null
}

export default function DocumentsClient({ cvStatut, lettreStatut, cvUrl, lettreUrl }: Props) {
  const [cv, setCv]               = useState(cvStatut)
  const [lm, setLm]               = useState(lettreStatut)
  const [cvLink, setCvLink]       = useState(cvUrl || '')
  const [lmLink, setLmLink]       = useState(lettreUrl || '')
  const [saving, setSaving]       = useState(false)
  const [saved, setSaved]         = useState(false)
  const [error, setError]         = useState('')

  const complet = cv === 'depose' && lm === 'depose'

  async function handleSave() {
    setSaving(true)
    setError('')
    const result = await updateDocuments({
      cv_statut: cv,
      lettre_statut: lm,
      cv_url: cvLink || null,
      lettre_url: lmLink || null,
    })
    setSaving(false)
    if ('error' in result && result.error) { setError(result.error); return }
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  const inp = "w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#5C7A5C] transition-colors bg-white"

  function DocCard({ label, statut, setStatut, link, setLink }: {
    label: string; statut: string; setStatut: (s: string) => void; link: string; setLink: (s: string) => void
  }) {
    const s = getS(statut)
    return (
      <div className="bg-white rounded-2xl border border-[#C8D8C8] p-6">
        <div className="flex items-start justify-between mb-5">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.dot }}></div>
              <span className="text-sm font-bold" style={{ color: s.color }}>{s.label}</span>
            </div>
            <p className="text-xs text-gray-400 mt-1">{s.desc}</p>
          </div>
          {statut === 'depose' && (
            <div className="w-10 h-10 rounded-xl bg-[#F0FDF4] flex items-center justify-center text-xl">✓</div>
          )}
        </div>

        {/* Statut selector */}
        <div className="flex flex-col gap-2 mb-4">
          {STATUTS_DOC.map(opt => (
            <button key={opt.key} onClick={() => setStatut(opt.key)}
              className="flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all"
              style={{
                borderColor: statut === opt.key ? opt.dot : '#F3F4F6',
                backgroundColor: statut === opt.key ? opt.bg : 'transparent',
              }}>
              <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
                style={{ borderColor: statut === opt.key ? opt.dot : '#D1D5DB' }}>
                {statut === opt.key && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: opt.dot }}></div>}
              </div>
              <span className="text-sm font-semibold" style={{ color: statut === opt.key ? opt.color : '#6B7280' }}>
                {opt.label}
              </span>
            </button>
          ))}
        </div>

        {/* Lien */}
        <div>
          <label className="text-xs font-medium text-gray-500 mb-1.5 block">
            Lien vers le document <span className="text-gray-300 font-normal">(Google Drive, Dropbox...)</span>
          </label>
          <input type="url" placeholder="https://drive.google.com/..." value={link}
            onChange={e => setLink(e.target.value)} className={inp} />
          {link && (
            <a href={link} target="_blank" rel="noopener noreferrer"
              className="text-xs text-[#5C7A5C] hover:underline mt-1 inline-block">
              ↗ Voir le document
            </a>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#D6E6D6]">
      {/* Navbar */}
      <div className="bg-white border-b border-[#C8D8C8]">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/profil"
              className="flex items-center gap-2 bg-[#E4EDE4] hover:bg-[#D6E6D6] text-[#3D553D] px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
              </svg>
              Mon profil
            </Link>
            <div className="hidden sm:flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#5C7A5C]"></div>
              <span className="font-semibold text-gray-900 text-sm">Studi</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {saved && <span className="text-xs text-[#5C7A5C] font-medium bg-[#E4EDE4] px-3 py-1 rounded-full">Sauvegardé ✓</span>}
            <button onClick={handleSave} disabled={saving}
              className="bg-[#3D553D] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#2D4030] transition-colors disabled:opacity-50 active:scale-95">
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-6 flex flex-col gap-4">

        {/* Header */}
        <div className="bg-white rounded-2xl border border-[#C8D8C8] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Mes documents</p>
              <p className="text-2xl font-black text-gray-900">
                {complet ? '✓ Profil complet' : 'Documents à compléter'}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {complet
                  ? 'Tous tes documents sont à jour. Ton responsable peut y accéder.'
                  : 'Mets à jour tes documents pour maximiser tes chances.'}
              </p>
            </div>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${complet ? 'bg-[#F0FDF4]' : 'bg-[#FFF7ED]'}`}>
              {complet ? '📄' : '📋'}
            </div>
          </div>
        </div>

        {error && <p className="text-xs text-red-500 bg-red-50 px-4 py-3 rounded-xl border border-red-200">{error}</p>}

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DocCard label="Curriculum Vitae (CV)" statut={cv} setStatut={setCv} link={cvLink} setLink={setCvLink} />
          <DocCard label="Lettre de motivation" statut={lm} setStatut={setLm} link={lmLink} setLink={setLmLink} />
        </div>

        {/* Conseils */}
        <div className="bg-white rounded-2xl border border-[#C8D8C8] p-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Conseils</p>
          <div className="flex flex-col gap-3">
            {[
              { icon: '📁', tip: 'Utilise Google Drive ou Dropbox pour partager tes documents via lien.' },
              { icon: '🔄', tip: 'Mets à jour ton CV après chaque nouvelle expérience ou formation.' },
              { icon: '✉️', tip: 'Personnalise ta lettre de motivation pour chaque candidature importante.' },
              { icon: '👀', tip: 'Assure-toi que les liens sont en "accès public" pour que ton responsable puisse les consulter.' },
            ].map(({ icon, tip }) => (
              <div key={tip} className="flex items-start gap-3">
                <span className="text-lg shrink-0">{icon}</span>
                <p className="text-sm text-gray-600">{tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
