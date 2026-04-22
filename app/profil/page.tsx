import { createClient } from '../../lib/supabase-server'
import { redirect } from 'next/navigation'
import ProfileMenu from '../components/ProfileMenu'
import EditIdentite from './EditIdentite'
import Link from 'next/link'
import RelancesWidget from './RelancesWidget'
import ParallaxOrbs from '../components/ParallaxOrbs'

const glass = {
  background: 'linear-gradient(145deg, var(--dash-card-from) 0%, var(--dash-card-to) 100%)',
  backdropFilter: 'blur(60px)',
  WebkitBackdropFilter: 'blur(60px)',
  border: '1px solid var(--dash-card-border)',
  borderRadius: '20px',
  boxShadow: 'inset 0 1px 0 var(--dash-card-inset)',
} as const

function getStatut(statut: string) {
  const map: Record<string, { label: string; dot: string; text: string; bg: string }> = {
    en_preparation: { label: 'En préparation', dot: '#9CA3AF', text: '#6B7280', bg: 'rgba(156,163,175,0.1)' },
    en_recherche:   { label: 'En recherche',   dot: '#5C7A5C', text: '#3D553D', bg: 'rgba(92,122,92,0.12)'  },
    place:          { label: 'Placé',           dot: '#16A34A', text: '#15803D', bg: 'rgba(34,197,94,0.12)'  },
  }
  return map[statut] || map['en_preparation']
}

function getDocStatut(val: string | null) {
  if (val === 'depose')          return { label: 'Déposé',          color: '#15803D', bg: 'rgba(34,197,94,0.12)',  dot: '#16A34A' }
  if (val === 'a_mettre_a_jour') return { label: 'À mettre à jour', color: '#C2410C', bg: 'rgba(249,115,22,0.12)', dot: '#F97316' }
  return                                { label: 'Non déposé',       color: '#9CA3AF', bg: 'rgba(156,163,175,0.1)', dot: '#D1D5DB' }
}

function getProgression(e: Record<string, unknown>) {
  let score = 0
  if (e.telephone)  score += 20
  if (e.linkedin)   score += 20
  if (e.cv_statut === 'depose')     score += 20
  if (e.lettre_statut === 'depose') score += 20
  if (e.nb_candidatures && (e.nb_candidatures as number) > 0) score += 20
  return score
}

export default async function Profil() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: etudiant } = await supabase.from('etudiants').select('*').eq('email', user.email).single()

  if (!etudiant) {
    return (
      <div className="h-screen flex items-center justify-center p-6 relative" style={{ background: 'var(--dash-bg)' }}>
        <ParallaxOrbs />
        <div style={{ ...glass, padding: '32px', textAlign: 'center', maxWidth: '360px', position: 'relative', zIndex: 1 }}>
          <h2 className="text-base font-semibold mb-1" style={{ color: 'var(--dash-header-title)' }}>Aucune fiche trouvée</h2>
          <p className="text-sm" style={{ color: 'var(--dash-header-sub)' }}>Contacte ton responsable.</p>
        </div>
      </div>
    )
  }

  const [{ data: offres }, { data: candidaturesLog }, { data: relancesData }] = await Promise.all([
    supabase.from('offres').select('*').eq('active', true).order('created_at', { ascending: false }),
    supabase.from('candidatures').select('*').eq('etudiant_id', etudiant.id).order('created_at', { ascending: false }),
    supabase.from('relances').select('*').eq('etudiant_id', etudiant.id).order('created_at', { ascending: false }),
  ])

  const statut      = getStatut(etudiant.statut)
  const cvStatut    = getDocStatut(etudiant.cv_statut)
  const lmStatut    = getDocStatut(etudiant.lettre_statut)
  const progression = getProgression(etudiant)
  const initiale    = etudiant.prenom[0].toUpperCase()

  const candidatures = etudiant.nb_candidatures || 0
  const attente      = etudiant.nb_candidatures_attente || 0
  const refus        = etudiant.nb_candidatures_refus || 0
  const entretiens   = etudiant.nb_entretiens || 0
  const entreprises  = etudiant.nb_entreprises || 0
  const objectif     = etudiant.objectif_candidatures || 5
  const objectifPct  = Math.min(Math.round((candidatures / objectif) * 100), 100)

  return (
    <div className="h-screen overflow-y-auto relative" id="dashboard-scroll" style={{ background: 'var(--dash-bg)' }}>
      <ParallaxOrbs />

      {/* Navbar */}
      <div className="sticky top-0 z-20"
        style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.5)' }}>
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ background: 'linear-gradient(135deg, #22C55E, #8B5CF6)' }}></div>
            <span className="font-semibold text-sm tracking-tight" style={{ color: 'var(--dash-header-title)' }}>Studi</span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/profil/documents"
              className="text-xs font-medium transition-colors px-3 py-1.5 rounded-lg"
              style={{ color: 'var(--dash-header-sub)' }}>
              Documents
            </Link>
            <Link href="/profil/candidatures"
              className="text-xs font-medium transition-colors px-3 py-1.5 rounded-lg"
              style={{ color: 'var(--dash-header-sub)' }}>
              Candidatures
            </Link>
            <Link href="/offres"
              className="text-xs font-medium transition-colors px-3 py-1.5 rounded-lg"
              style={{ color: 'var(--dash-header-sub)' }}>
              Offres
            </Link>
            <ProfileMenu prenom={etudiant.prenom} nom={etudiant.nom} email={etudiant.email} />
          </div>
        </div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-8 flex flex-col gap-4">

        {/* RELANCES */}
        {(relancesData || []).length > 0 && (
          <RelancesWidget initial={relancesData as any} />
        )}

        {/* HERO */}
        <div style={{ ...glass, overflow: 'hidden' }}>
          <div className="grid grid-cols-1 lg:grid-cols-5">

            {/* Gauche */}
            <div className="lg:col-span-2 p-8 flex flex-col gap-6"
              style={{ background: 'linear-gradient(180deg, #1a3a1a 0%, #0f2a0f 100%)' }}>
              <div>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold mb-5"
                  style={{ background: 'rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.9)' }}>
                  {initiale}
                </div>
                <h1 className="text-white font-bold text-2xl tracking-tight">{etudiant.prenom} {etudiant.nom}</h1>
                <p className="text-white text-sm mt-1" style={{ opacity: 0.4 }}>{etudiant.email}</p>
                <div className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statut.dot }}></div>
                  <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>{statut.label}</span>
                </div>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>PROFIL COMPLÉTÉ</span>
                  <span className="text-sm font-bold text-white">{progression}%</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                  <div className="h-full rounded-full" style={{ width: `${progression}%`, backgroundColor: 'rgba(255,255,255,0.6)' }}></div>
                </div>
                <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  {progression < 100 ? 'Complète ton profil pour maximiser tes chances' : 'Profil complet !'}
                </p>
              </div>
            </div>

            {/* Droite */}
            <div className="lg:col-span-3 p-8 flex flex-col justify-between gap-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest mb-6" style={{ color: 'var(--dash-section-label)' }}>Vue d'ensemble</p>
                <div className="grid grid-cols-3 gap-6">
                  {[
                    { label: 'Candidatures', value: candidatures, sub: `objectif : ${objectif}`,             color: '#3D553D' },
                    { label: 'Entretiens',   value: entretiens,   sub: etudiant.prochain_entretien ? new Date(etudiant.prochain_entretien).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : 'Aucun planifié', color: '#1D4ED8' },
                    { label: 'Entreprises',  value: entreprises,  sub: 'contactées',                         color: '#6D28D9' },
                  ].map(({ label, value, sub, color }) => (
                    <div key={label}>
                      <p className="text-5xl font-bold tracking-tight" style={{ color }}>{value}</p>
                      <p className="text-sm font-semibold mt-1" style={{ color: 'var(--dash-header-title)' }}>{label}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--dash-header-sub)' }}>{sub}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '20px' }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold" style={{ color: 'var(--dash-header-title)' }}>Objectif de la semaine</span>
                  <span className="text-xs" style={{ color: 'var(--dash-header-sub)' }}>{candidatures} / {objectif} candidatures</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.07)' }}>
                  <div className="h-full rounded-full" style={{ width: `${objectifPct}%`, background: 'linear-gradient(90deg, #5C7A5C, #22C55E)' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* LIGNE 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* Candidatures */}
          <div className="lg:col-span-3 flex flex-col gap-3">
            <Link href="/profil/candidatures"
              className="rounded-2xl p-6 flex items-center justify-between group transition-all"
              style={{ background: 'linear-gradient(135deg, #1a3a1a 0%, #0f2a0f 100%)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div>
                <p className="text-white font-bold text-lg">Mes candidatures</p>
                <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  {candidaturesLog?.length ?? 0} candidature{(candidaturesLog?.length ?? 0) > 1 ? 's' : ''} · Cliquer pour gérer
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-4xl font-black text-white">{candidaturesLog?.length ?? 0}</p>
                </div>
                <svg className="w-5 h-5 text-white opacity-40 group-hover:opacity-80 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                </svg>
              </div>
            </Link>

            <div style={{ ...glass, padding: '16px 20px' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold" style={{ color: 'var(--dash-header-title)' }}>Objectif de la semaine</span>
                <span className="text-xs font-bold" style={{ color: objectifPct >= 100 ? '#16A34A' : '#5C7A5C' }}>
                  {candidatures}/{objectif} {objectifPct >= 100 ? '✓' : ''}
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.07)' }}>
                <div className="h-full rounded-full" style={{ width: `${objectifPct}%`, background: 'linear-gradient(90deg, #5C7A5C, #22C55E)' }}></div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Entretiens',  value: entretiens,  color: '#1D4ED8' },
                { label: 'Refus',       value: refus,        color: '#9F1239' },
                { label: 'Entreprises', value: entreprises,  color: '#6D28D9' },
              ].map(({ label, value, color }) => (
                <div key={label} style={{ ...glass, padding: '16px' }}>
                  <p className="text-2xl font-black" style={{ color }}>{value}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--dash-header-sub)' }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Droite */}
          <div className="lg:col-span-2 flex flex-col gap-4">

            {/* Documents */}
            <div style={{ ...glass, padding: '24px' }}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--dash-section-label)' }}>Documents</p>
                <Link href="/profil/documents" className="text-xs font-semibold hover:underline" style={{ color: '#5C7A5C' }}>
                  Gérer →
                </Link>
              </div>
              <div className="flex flex-col gap-3">
                {[
                  { label: 'Curriculum Vitae', btnLabel: 'Voir le CV',        s: cvStatut, url: etudiant.cv_url },
                  { label: 'Portfolio',         btnLabel: 'Voir le Portfolio', s: lmStatut, url: etudiant.lettre_url },
                ].map(({ label, btnLabel, s, url }) => (
                  <div key={label} className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: s.bg }}>
                    <div>
                      <p className="text-sm font-semibold" style={{ color: 'var(--dash-header-title)' }}>{label}</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.dot }}></div>
                        <span className="text-xs font-medium" style={{ color: s.color }}>{s.label}</span>
                      </div>
                    </div>
                    {url ? (
                      <a href={url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl shrink-0"
                        style={{ background: 'rgba(255,255,255,0.8)', color: '#3D553D', border: '1px solid rgba(255,255,255,0.9)' }}>
                        <span>📄</span><span>{btnLabel}</span><span>↗</span>
                      </a>
                    ) : (
                      <Link href="/profil/documents"
                        className="text-xs font-bold px-3 py-2 rounded-xl shrink-0"
                        style={{ background: 'rgba(255,255,255,0.7)', color: '#9CA3AF', border: '1px solid rgba(255,255,255,0.9)' }}>
                        Déposer →
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Identité */}
            <div style={{ ...glass, padding: '24px' }}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--dash-section-label)' }}>Identité</p>
                <EditIdentite telephone={etudiant.telephone} linkedin={etudiant.linkedin} />
              </div>
              <div className="flex flex-col">
                {[
                  { label: 'Section',   value: etudiant.niveau },
                  { label: 'Formation', value: etudiant.type_formation === 'alternance' ? 'Alternance' : 'Initial' },
                  { label: 'Âge',       value: `${etudiant.age} ans` },
                  { label: 'Tél.',      value: etudiant.telephone || null },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-2.5" style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <span className="text-xs" style={{ color: 'var(--dash-section-label)' }}>{label}</span>
                    <span className="text-sm font-semibold" style={{ color: value ? 'var(--dash-header-title)' : 'var(--dash-section-label)' }}>
                      {value || '—'}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-xs" style={{ color: 'var(--dash-section-label)' }}>LinkedIn</span>
                  {etudiant.linkedin ? (
                    <a href={etudiant.linkedin} target="_blank" rel="noopener noreferrer"
                      className="text-sm font-semibold" style={{ color: '#5C7A5C' }}>
                      Voir le profil
                    </a>
                  ) : (
                    <span className="text-sm font-semibold" style={{ color: 'var(--dash-section-label)' }}>—</span>
                  )}
                </div>
              </div>
            </div>

            {/* Note responsable */}
            <div style={{ ...glass, padding: '24px' }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--dash-section-label)' }}>Note de ton responsable</p>
              {etudiant.notes_responsable ? (
                <p className="text-sm leading-relaxed" style={{ color: 'var(--dash-header-title)' }}>{etudiant.notes_responsable}</p>
              ) : (
                <p className="text-sm italic" style={{ color: 'var(--dash-section-label)' }}>Aucune note pour l'instant.</p>
              )}
            </div>

            {/* Offres */}
            <div style={{ ...glass, padding: '24px' }}>
              <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'var(--dash-section-label)' }}>Offres d'emploi</p>
              {!offres || offres.length === 0 ? (
                <p className="text-sm italic" style={{ color: 'var(--dash-section-label)' }}>Aucune offre disponible.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {offres.map((offre: any) => (
                    <div key={offre.id} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.5)' }}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold" style={{ color: 'var(--dash-header-title)' }}>{offre.titre}</p>
                          <p className="text-xs mt-0.5" style={{ color: 'var(--dash-header-sub)' }}>{offre.entreprise}{offre.localisation ? ` · ${offre.localisation}` : ''}</p>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0" style={{ background: 'rgba(92,122,92,0.15)', color: '#3D553D' }}>
                          {offre.type_contrat.toUpperCase()}
                        </span>
                      </div>
                      {offre.description && (
                        <p className="text-xs mt-2 leading-relaxed line-clamp-2" style={{ color: 'var(--dash-section-label)' }}>{offre.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
