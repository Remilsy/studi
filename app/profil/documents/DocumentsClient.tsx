'use client'
import Link from 'next/link'
import { updateDocuments } from './actions'
import UploadDocument from './UploadDocument'
import ParallaxOrbs from '../../components/ParallaxOrbs'

interface Props {
  cvStatut:    string
  lettreStatut: string
  cvUrl:       string | null
  lettreUrl:   string | null
}

const glass = {
  background: 'linear-gradient(145deg, var(--dash-card-from) 0%, var(--dash-card-to) 100%)',
  backdropFilter: 'blur(60px)',
  WebkitBackdropFilter: 'blur(60px)',
  border: '1px solid var(--dash-card-border)',
  borderRadius: '20px',
  boxShadow: 'inset 0 1px 0 var(--dash-card-inset)',
} as const

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
    <div className="h-screen overflow-y-auto relative" id="dashboard-scroll" style={{ background: 'var(--dash-bg)' }}>
      <ParallaxOrbs />

      {/* Navbar */}
      <div className="sticky top-0 z-20"
        style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.5)' }}>
        <div className="max-w-3xl mx-auto px-6 h-14 flex items-center gap-3">
          <Link href="/profil"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
            style={{ background: 'rgba(92,122,92,0.15)', color: '#3D553D' }}>
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7"/>
            </svg>
            Mon profil
          </Link>
          <div className="hidden sm:flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: 'linear-gradient(135deg, #22C55E, #8B5CF6)' }}></div>
            <span className="font-semibold text-sm" style={{ color: 'var(--dash-header-title)' }}>Studi</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-6 flex flex-col gap-4">

        {/* Header */}
        <div style={{ ...glass, padding: '24px' }}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--dash-section-label)' }}>Mes documents</p>
              <p className="text-2xl font-black" style={{ color: 'var(--dash-header-title)' }}>
                {complet ? '✓ Profil complet' : 'Documents à déposer'}
              </p>
              <p className="text-sm mt-1" style={{ color: 'var(--dash-header-sub)' }}>
                {complet
                  ? 'Tous tes documents sont déposés. Ton responsable peut les consulter.'
                  : 'Dépose tes documents pour que ton responsable puisse les consulter.'}
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
              style={{ background: complet ? 'rgba(34,197,94,0.15)' : 'rgba(249,115,22,0.12)' }}>
              {complet ? '📄' : '📋'}
            </div>
          </div>
        </div>

        {/* Upload cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

          <div style={{ ...glass, padding: '24px' }} className="flex flex-col gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--dash-section-label)' }}>
                Curriculum Vitae (CV)
              </p>
              <p className="text-xs" style={{ color: 'var(--dash-header-sub)' }}>Dépose ton CV au format PDF.</p>
            </div>
            <UploadDocument type="cv" label="CV" currentUrl={cvUrl} onUpload={handleCvUpload} />
          </div>

          <div style={{ ...glass, padding: '24px' }} className="flex flex-col gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--dash-section-label)' }}>
                Portfolio
              </p>
              <p className="text-xs" style={{ color: 'var(--dash-header-sub)' }}>Dépose ton portfolio au format PDF.</p>
            </div>
            <UploadDocument type="portfolio" label="Portfolio" currentUrl={lettreUrl} onUpload={handlePortfolioUpload} />
          </div>

        </div>

        {/* Conseils */}
        <div style={{ ...glass, padding: '24px' }}>
          <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--dash-section-label)' }}>Conseils</p>
          <div className="flex flex-col gap-3">
            {[
              { icon: '📄', tip: 'Dépose tes fichiers directement au format PDF pour une meilleure compatibilité.' },
              { icon: '🔄', tip: 'Mets à jour ton CV après chaque nouvelle expérience ou formation.' },
              { icon: '🖼️', tip: 'Mets à jour ton portfolio régulièrement avec tes dernières réalisations.' },
              { icon: '👀', tip: 'Tes documents sont privés et accessibles uniquement par ton responsable.' },
            ].map(({ icon, tip }) => (
              <div key={tip} className="flex items-start gap-3">
                <span className="text-lg shrink-0">{icon}</span>
                <p className="text-sm" style={{ color: 'var(--dash-header-sub)' }}>{tip}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
