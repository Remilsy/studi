import { createClient } from '../../lib/supabase-server'
import { redirect } from 'next/navigation'
import AdminSidebar from '../components/AdminSidebar'
import Link from 'next/link'

const docCfg: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  depose:          { label: 'Déposé',          color: '#15803D', bg: '#F0FDF4', dot: '#16A34A' },
  a_mettre_a_jour: { label: 'À mettre à jour', color: '#C2410C', bg: '#FFF7ED', dot: '#F97316' },
  a_deposer:       { label: 'Non déposé',       color: '#9CA3AF', bg: '#F3F4F6', dot: '#D1D5DB' },
}

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
    <div className="min-h-screen bg-[#D6E6D6] flex">
      <AdminSidebar />
      <div className="flex-1 p-6">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Documents</h1>
            <p className="text-sm text-[#5C7A5C] mt-0.5">{list.length} étudiants</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Profils complets', value: complets,        color: '#15803D', bg: '#F0FDF4' },
            { label: 'CV manquants',     value: cvManquants,     color: '#C2410C', bg: '#FFF7ED' },
            { label: 'Portfolios manquants', value: lettreManquantes, color: '#C2410C', bg: '#FFF7ED' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className="bg-white rounded-2xl border border-[#C8D8C8] p-5">
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">{label}</p>
              <p className="text-3xl font-black" style={{ color }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Tableau */}
        <div className="bg-white rounded-2xl border border-[#C8D8C8] overflow-hidden">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#F8FAF8] border-b border-[#E5E7EB]">
                <th className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400">Étudiant</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400 w-36">CV</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400 w-36">Portfolio</th>
                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-gray-400 w-20">Liens</th>
                <th className="px-4 py-3 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {list.map(e => {
                const cv  = docCfg[e.cv_statut || 'a_deposer']
                const lm  = docCfg[e.lettre_statut || 'a_deposer']
                const complet = e.cv_statut === 'depose' && e.lettre_statut === 'depose'
                return (
                  <tr key={e.id} className="border-b border-[#F3F4F6] hover:bg-[#FAFAFA] transition-colors group">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 ${complet ? 'bg-[#E4EDE4] text-[#3D553D]' : 'bg-[#FFF7ED] text-[#C2410C]'}`}>
                          {e.prenom[0]}{e.nom[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{e.prenom} {e.nom}</p>
                          <p className="text-xs text-gray-400">{e.email}</p>
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
                            className="text-xs text-[#5C7A5C] hover:underline font-medium">CV ↗</a>
                        )}
                        {e.lettre_url && (
                          <a href={e.lettre_url} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-[#5C7A5C] hover:underline font-medium">Portfolio ↗</a>
                        )}
                        {!e.cv_url && !e.lettre_url && <span className="text-xs text-gray-300">—</span>}
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <Link href={`/etudiants/${e.id}`}
                        className="text-xs text-gray-300 hover:text-[#5C7A5C] transition-colors opacity-0 group-hover:opacity-100">
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
  )
}
