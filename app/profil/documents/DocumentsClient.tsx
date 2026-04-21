'use client'
import Link from 'next/link'
import { updateDocuments } from './actions'
import UploadDocument from './UploadDocument'

interface Props {
  cvStatut:    string
  lettreStatut: string
  cvUrl:       string | null
  lettreUrl:   string | null
}

export default function DocumentsClient({ cvUrl, lettreUrl }: Props) {

  async function handleCvUpload(url: string) {
    await updateDocuments({
      cv_statut:    'depose',
      lettre_statut: lettreUrl ? 'depose' : 'a_deposer',
      cv_url:        url,
      lettre_url:    lettreUrl,
    })
  }

  async function handlePortfolioUpload(url: string) {
    await updateDocuments({
      cv_statut:    cvUrl ? 'depose' : 'a_deposer',
      lettre_statut: 'depose',
      cv_url:        cvUrl,
      lettre_url:    url,
    })
  }

  const complet = !!cvUrl && !!lettreUrl

  return (
    <div className="min-h-screen bg-[#D6E6D6]">
      {/* Navbar */}
      <div className="bg-white border-b border-[#C8D8C8]">
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center gap-3">
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
      </div>

      <div className="max-w-3xl mx-auto px-6 py-6 flex flex-col gap-4">

        {/* Header */}
        <div className="bg-white rounded-2xl border border-[#C8D8C8] p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Mes documents</p>
              <p className="text-2xl font-black text-gray-900">
                {complet ? '✓ Profil complet' : 'Documents à déposer'}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {complet
                  ? 'Tous tes documents sont déposés. Ton responsable peut les consulter.'
                  : 'Dépose tes documents pour que ton responsable puisse les consulter.'}
              </p>
            </div>
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${complet ? 'bg-[#F0FDF4]' : 'bg-[#FFF7ED]'}`}>
              {complet ? '📄' : '📋'}
            </div>
          </div>
        </div>

        {/* Upload cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <div className="bg-white rounded-2xl border border-[#C8D8C8] p-6 flex flex-col gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
                Curriculum Vitae (CV)
              </p>
              <p className="text-xs text-gray-400">Dépose ton CV au format PDF.</p>
            </div>
            <UploadDocument
              type="cv"
              label="CV"
              currentUrl={cvUrl}
              onUpload={handleCvUpload}
            />
          </div>

          <div className="bg-white rounded-2xl border border-[#C8D8C8] p-6 flex flex-col gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
                Portfolio
              </p>
              <p className="text-xs text-gray-400">Dépose ton portfolio au format PDF.</p>
            </div>
            <UploadDocument
              type="portfolio"
              label="Portfolio"
              currentUrl={lettreUrl}
              onUpload={handlePortfolioUpload}
            />
          </div>

        </div>

        {/* Conseils */}
        <div className="bg-white rounded-2xl border border-[#C8D8C8] p-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Conseils</p>
          <div className="flex flex-col gap-3">
            {[
              { icon: '📄', tip: 'Dépose tes fichiers directement au format PDF pour une meilleure compatibilité.' },
              { icon: '🔄', tip: 'Mets à jour ton CV après chaque nouvelle expérience ou formation.' },
              { icon: '🖼️', tip: 'Mets à jour ton portfolio régulièrement avec tes dernières réalisations.' },
              { icon: '👀', tip: 'Tes documents sont privés et accessibles uniquement par ton responsable.' },
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
