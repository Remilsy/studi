import { createClient } from '../../lib/supabase-server'
import { redirect } from 'next/navigation'
import AdminSidebar from '../components/AdminSidebar'
import ParallaxOrbs from '../components/ParallaxOrbs'
import Link from 'next/link'

const docCfg: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  depose:          { label: 'Déposé',          color: '#15803D', bg: 'rgba(34,197,94,0.12)',  dot: '#16A34A' },
  a_mettre_a_jour: { label: 'À mettre à jour', color: '#C2410C', bg: 'rgba(249,115,22,0.12)', dot: '#F97316' },
  a_deposer:       { label: 'Non déposé',       color: '#9CA3AF', bg: 'rgba(156,163,175,0.1)', dot: '#D1D5DB' },
}

const glass = {
  background: 'linear-gradient(145deg, var(--dash-card-from) 0%, var(--dash-card-to) 100%)',
  backdropFilter: 'blur(60px)',
  WebkitBackdropFilter: 'blur(60px)',
  border: '1px solid var(--dash-card-border)',
  borderRadius: '20px',
  boxShadow: 'inset 0 1px 0 var(--dash-card-inset)',
} as const

export default async function DocumentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'admin') redirect('/login')

  const { data: etudiants } = await supabase
    .from('etudiants')
    .select('id, prenom, nom, email, niveau, cv_statut, lettre_statut, cv_url, lettre_url, updated_at')
    .order('nom')

  const list = etudiants || []
  const cvManquants = list.filter(e => e.cv_statut !== 'depose').length
  const lettreManquantes = list.filter(e => e.lettre_statut !== 'depose').length
  const complets = list.filter(e => e.cv_statut === 'depose' && e.lettre_statut === 'depose').length

  return (
    <div className="h-screen flex relative" style={{ background: 'var(--dash-bg)' }}>
      <ParallaxOrbs />
      <AdminSidebar />
      <div id="dashboard-scroll" className="flex-1 h-full overflow-y-auto" style={{ position: 'relative', zIndex: 1 }}>
        <div className="p-6">

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold tracking-tight" style={{ color: 'var(--dash-header-title)' }}>Documents</h1>
              <p className="text-sm mt-0.5" style={{ color: 'var(--dash-header-sub)' }}>{list.length} étudiants</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Profils complets',      value: complets,          color: '#15803D', glow: 'rgba(34,197,94,0.15)'   },
              { label: 'CV manquants',           value: cvManquants,       color: '#C2410C', glow: 'rgba(249,115,22,0.15)'  },
              { label: 'Portfolios manquants',   value: lettreManquantes,  color: '#C2410C', glow: 'rgba(249,115,22,0.15)'  },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ ...glass, padding: '20px' }}>
                <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'var(--dash-section-label)' }}>{label}</p>
                <p className="text-3xl font-black" style={{ color }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Tableau */}
          <div style={{ ...glass, overflow: 'hidden' }}>
            <table className="w-full border-collapse">
              <thead>
                <tr style={{ background: 'rgba(0,0,0,0.04)', borderBottom: '1px solid rgba(0,0,0,0.08)' }}>
                  <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--dash-section-label)' }}>Étudiant</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest w-36" style={{ color: 'var(--dash-section-label)' }}>CV</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest w-36" style={{ color: 'var(--dash-section-label)' }}>Portfolio</th>
                  <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest w-20" style={{ color: 'var(--dash-section-label)' }}>Liens</th>
                  <th className="px-4 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {list.map(e => {
                  const cv  = docCfg[e.cv_statut || 'a_deposer']
                  const lm  = docCfg[e.lettre_statut || 'a_deposer']
                  const complet = e.cv_statut === 'depose' && e.lettre_statut === 'depose'
                  return (
                    <tr key={e.id} className="group hover:bg-white/20 transition-colors" style={{ borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0"
                            style={{ background: complet ? 'rgba(34,197,94,0.15)' : 'rgba(249,115,22,0.12)', color: complet ? '#15803D' : '#C2410C' }}>
                            {e.prenom[0]}{e.nom[0]}
                          </div>
                          <div>
                            <p className="text-sm font-bold" style={{ color: 'var(--dash-header-title)' }}>{e.prenom} {e.nom}</p>
                            <p className="text-xs" style={{ color: 'var(--dash-header-sub)' }}>{e.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{ backgroundColor: cv.bg, color: cv.color }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: cv.dot }}></span>
                          {cv.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="flex items-center gap-1.5 w-fit px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{ backgroundColor: lm.bg, color: lm.color }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: lm.dot }}></span>
                          {lm.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {e.cv_url && (
                            <a href={e.cv_url} target="_blank" rel="noopener noreferrer"
                              className="text-xs font-medium hover:underline" style={{ color: '#5C7A5C' }}>CV ↗</a>
                          )}
                          {e.lettre_url && (
                            <a href={e.lettre_url} target="_blank" rel="noopener noreferrer"
                              className="text-xs font-medium hover:underline" style={{ color: '#5C7A5C' }}>Portfolio ↗</a>
                          )}
                          {!e.cv_url && !e.lettre_url && <span className="text-xs text-gray-300">—</span>}
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <Link href={`/etudiants/${e.id}`}
                          className="text-xs opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--dash-header-sub)' }}>
                          →
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
