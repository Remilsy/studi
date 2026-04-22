import { createClient } from '../../lib/supabase-server'
import { redirect } from 'next/navigation'
import AdminSidebar from '../components/AdminSidebar'
import ParallaxOrbs from '../components/ParallaxOrbs'

const STATUTS = [
  { key: 'envoye',     label: 'Envoyée',    color: '#3D553D', bg: 'rgba(92,122,92,0.12)',   dot: '#5C7A5C' },
  { key: 'en_attente', label: 'Attente',    color: '#C2410C', bg: 'rgba(249,115,22,0.12)',  dot: '#F97316' },
  { key: 'entretien',  label: 'Entretien',  color: '#1D4ED8', bg: 'rgba(59,130,246,0.12)',  dot: '#3B82F6' },
  { key: 'refus',      label: 'Refus',      color: '#9F1239', bg: 'rgba(244,63,94,0.12)',   dot: '#F43F5E' },
  { key: 'accepte',    label: 'Acceptée',   color: '#15803D', bg: 'rgba(34,197,94,0.12)',   dot: '#16A34A' },
]

const glass = {
  background: 'linear-gradient(145deg, var(--dash-card-from) 0%, var(--dash-card-to) 100%)',
  backdropFilter: 'blur(60px)',
  WebkitBackdropFilter: 'blur(60px)',
  border: '1px solid var(--dash-card-border)',
  borderRadius: '20px',
  boxShadow: 'inset 0 1px 0 var(--dash-card-inset)',
} as const

export default async function EntreprisesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'admin') redirect('/login')

  const [{ data: candidatures }, { data: etudiants }] = await Promise.all([
    supabase.from('candidatures').select('id, entreprise, poste, statut, etudiant_id, date_action'),
    supabase.from('etudiants').select('id, prenom, nom'),
  ])

  const cands = candidatures || []
  const etudMap = Object.fromEntries((etudiants || []).map(e => [e.id, e]))

  const map: Record<string, { nom: string; cands: typeof cands }> = {}
  for (const c of cands) {
    const key = c.entreprise.trim().toLowerCase()
    if (!map[key]) map[key] = { nom: c.entreprise.trim(), cands: [] }
    map[key].cands.push(c)
  }

  const entreprises = Object.values(map).sort((a, b) => b.cands.length - a.cands.length)

  const bestStatut = (cands: typeof candidatures) => {
    if (!cands) return null
    const order = ['accepte', 'entretien', 'en_attente', 'envoye', 'refus']
    for (const s of order) {
      if (cands.some(c => c.statut === s)) return s
    }
    return null
  }

  return (
    <div className="h-screen flex relative" style={{ background: 'var(--dash-bg)' }}>
      <ParallaxOrbs />
      <AdminSidebar />
      <div id="dashboard-scroll" className="flex-1 h-full overflow-y-auto" style={{ position: 'relative', zIndex: 1 }}>
        <div className="p-6">

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold tracking-tight" style={{ color: 'var(--dash-header-title)' }}>Entreprises</h1>
              <p className="text-sm mt-0.5" style={{ color: 'var(--dash-header-sub)' }}>{entreprises.length} entreprises contactées</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {STATUTS.map(s => {
              const count = cands.filter(c => c.statut === s.key).length
              return (
                <div key={s.key} style={{ ...glass, padding: '16px' }}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.dot }}></div>
                    <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: s.color }}>{s.label}</p>
                  </div>
                  <p className="text-2xl font-black" style={{ color: s.color }}>{count}</p>
                </div>
              )
            })}
          </div>

          {/* Liste entreprises */}
          {entreprises.length === 0 ? (
            <div style={{ ...glass, padding: '64px', textAlign: 'center' }}>
              <p className="text-2xl mb-3">🏢</p>
              <p className="text-sm" style={{ color: 'var(--dash-header-sub)' }}>Aucune candidature enregistrée par les étudiants.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {entreprises.map(({ nom, cands: ec }) => {
                const best = bestStatut(ec)
                const bs = STATUTS.find(s => s.key === best)
                const students = [...new Set(ec.map(c => c.etudiant_id))]
                const acceptees = ec.filter(c => c.statut === 'accepte').length
                const entretiens = ec.filter(c => c.statut === 'entretien').length

                return (
                  <div key={nom} style={{ ...glass, padding: '20px', borderLeft: `3px solid ${bs?.dot || 'rgba(0,0,0,0.1)'}` }}>
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black"
                          style={{ backgroundColor: bs?.bg || 'rgba(156,163,175,0.1)', color: bs?.color || '#9CA3AF' }}>
                          {nom[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="text-base font-bold" style={{ color: 'var(--dash-header-title)' }}>{nom}</p>
                          <p className="text-xs" style={{ color: 'var(--dash-header-sub)' }}>
                            {ec.length} candidature{ec.length > 1 ? 's' : ''} · {students.length} étudiant{students.length > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        {acceptees > 0 && (
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(34,197,94,0.12)', color: '#15803D' }}>
                            ✓ {acceptees} acceptée{acceptees > 1 ? 's' : ''}
                          </span>
                        )}
                        {entretiens > 0 && (
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(59,130,246,0.12)', color: '#1D4ED8' }}>
                            {entretiens} entretien{entretiens > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {ec.map(c => {
                        const s = STATUTS.find(st => st.key === c.statut) || STATUTS[0]
                        const etudiant = etudMap[c.etudiant_id]
                        return (
                          <div key={c.id} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs"
                            style={{ backgroundColor: s.bg, border: `1px solid ${s.dot}40` }}>
                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.dot }}></div>
                            <span className="font-medium" style={{ color: s.color }}>{c.poste}</span>
                            {etudiant && (
                              <span style={{ color: 'var(--dash-header-sub)' }} className="font-normal">— {etudiant.prenom} {etudiant.nom}</span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
