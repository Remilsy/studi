import Link from 'next/link'

const typeColors: Record<string, { bg: string; text: string; label: string }> = {
  stage:      { bg: '#EFF6FF', text: '#1D4ED8', label: 'Stage' },
  alternance: { bg: '#E4EDE4', text: '#3D553D', label: 'Alternance' },
  cdi:        { bg: '#F0FDF4', text: '#15803D', label: 'CDI' },
  cdd:        { bg: '#FFF7ED', text: '#C2410C', label: 'CDD' },
}

export default function OffresEtudiantView({ offres }: { offres: any[] }) {
  return (
    <div className="min-h-screen bg-[#D6E6D6]">
      {/* Navbar */}
      <div className="bg-white border-b border-[#C8D8C8]">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
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
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6">
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">Offres disponibles</p>
          <p className="text-2xl font-black text-gray-900">{offres.length} offre{offres.length > 1 ? 's' : ''}</p>
        </div>

        {offres.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#C8D8C8] p-16 text-center">
            <p className="text-3xl mb-3">📭</p>
            <p className="text-sm font-semibold text-gray-500">Aucune offre disponible pour le moment.</p>
            <p className="text-xs text-gray-400 mt-1">Reviens plus tard !</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {offres.map((o: any) => {
              const tc = typeColors[o.type_contrat] || { bg: '#F3F4F6', text: '#6B7280', label: o.type_contrat }
              return (
                <div key={o.id} className="bg-white rounded-2xl border border-[#C8D8C8] p-5 flex flex-col gap-3 hover:shadow-sm transition-all">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-bold text-gray-900">{o.titre}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{o.entreprise}</p>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full shrink-0"
                      style={{ backgroundColor: tc.bg, color: tc.text }}>
                      {tc.label}
                    </span>
                  </div>
                  {o.description && (
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{o.description}</p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                    {o.localisation && <span>📍 {o.localisation}</span>}
                    {o.niveau && <span>🎓 {o.niveau}</span>}
                  </div>
                  <Link href="/profil/candidatures"
                    className="mt-auto w-full text-center bg-[#3D553D] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#2D4030] transition-colors active:scale-95">
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
