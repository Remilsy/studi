import Link from 'next/link'
import ParallaxOrbs from '../components/ParallaxOrbs'

const typeColors: Record<string, { bg: string; text: string; label: string }> = {
  stage:      { bg: 'rgba(59,130,246,0.12)',  text: '#1D4ED8', label: 'Stage'      },
  alternance: { bg: 'rgba(92,122,92,0.12)',   text: '#3D553D', label: 'Alternance' },
  cdi:        { bg: 'rgba(34,197,94,0.12)',   text: '#15803D', label: 'CDI'        },
  cdd:        { bg: 'rgba(249,115,22,0.12)',  text: '#C2410C', label: 'CDD'        },
}

const glass = {
  background: 'linear-gradient(145deg, var(--dash-card-from) 0%, var(--dash-card-to) 100%)',
  backdropFilter: 'blur(60px)',
  WebkitBackdropFilter: 'blur(60px)',
  border: '1px solid var(--dash-card-border)',
  borderRadius: '20px',
  boxShadow: 'inset 0 1px 0 var(--dash-card-inset)',
} as const

export default function OffresEtudiantView({ offres }: { offres: any[] }) {
  return (
    <div className="h-screen overflow-y-auto relative" id="dashboard-scroll" style={{ background: 'var(--dash-bg)' }}>
      <ParallaxOrbs />

      {/* Navbar */}
      <div className="sticky top-0 z-20"
        style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.5)' }}>
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
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
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-6">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--dash-section-label)' }}>Offres disponibles</p>
          <p className="text-2xl font-black" style={{ color: 'var(--dash-header-title)' }}>{offres.length} offre{offres.length > 1 ? 's' : ''}</p>
        </div>

        {offres.length === 0 ? (
          <div style={{ ...glass, padding: '64px', textAlign: 'center' }}>
            <p className="text-3xl mb-3">📭</p>
            <p className="text-sm font-semibold" style={{ color: 'var(--dash-header-sub)' }}>Aucune offre disponible pour le moment.</p>
            <p className="text-xs mt-1" style={{ color: 'var(--dash-section-label)' }}>Reviens plus tard !</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {offres.map((o: any) => {
              const tc = typeColors[o.type_contrat] || { bg: 'rgba(156,163,175,0.1)', text: '#6B7280', label: o.type_contrat }
              return (
                <div key={o.id} style={{ ...glass, padding: '20px' }} className="flex flex-col gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-bold" style={{ color: 'var(--dash-header-title)' }}>{o.titre}</p>
                      <p className="text-sm mt-0.5" style={{ color: 'var(--dash-header-sub)' }}>{o.entreprise}</p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
                      style={{ backgroundColor: tc.bg, color: tc.text }}>
                      {tc.label}
                    </span>
                  </div>
                  {o.description && (
                    <p className="text-sm leading-relaxed line-clamp-2" style={{ color: 'var(--dash-header-sub)' }}>{o.description}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs flex-wrap" style={{ color: 'var(--dash-section-label)' }}>
                    {o.localisation && <span>📍 {o.localisation}</span>}
                    {o.niveau && <span>🎓 {o.niveau}</span>}
                  </div>
                  <Link href="/profil/candidatures"
                    className="mt-auto w-full text-center px-4 py-2 rounded-xl text-sm font-semibold transition-colors active:scale-95"
                    style={{ background: 'linear-gradient(135deg, #3D553D, #2D4030)', color: 'white' }}>
                    Postuler → tracker dans mes candidatures
                  </Link>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
