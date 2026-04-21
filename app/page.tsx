import { createClient } from '../lib/supabase-server'
import Link from 'next/link'
import LogoutButton from './components/LogoutButton'
import DashboardClient from './components/DashboardClient'
import AdminSidebar from './components/AdminSidebar'

function calcProgression(e: any) {
  let s = 0
  if (e.telephone) s += 20
  if (e.linkedin)  s += 20
  if (e.cv_statut     === 'depose') s += 20
  if (e.lettre_statut === 'depose') s += 20
  if ((e.nb_candidatures || 0) > 0) s += 20
  return s
}

async function getEtudiants() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('etudiants')
    .select('*')
    .order('created_at', { ascending: false })
  return data || []
}

export default async function Dashboard() {
  const etudiants = await getEtudiants()

  const total        = etudiants.length
  const places       = etudiants.filter((e: any) => e.statut === 'place').length
  const enRecherche  = etudiants.filter((e: any) => e.statut === 'en_recherche').length
  const enPrep       = etudiants.filter((e: any) => e.statut === 'en_preparation').length
  const tauxPlacement = total > 0 ? Math.round((places / total) * 100) : 0

  const totalCandidatures = etudiants.reduce((sum: number, e: any) => sum + (e.nb_candidatures || 0), 0)

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const in7days = new Date(today)
  in7days.setDate(today.getDate() + 7)

  const prochainEntretiens = etudiants
    .filter((e: any) => {
      if (!e.prochain_entretien) return false
      const d = new Date(e.prochain_entretien)
      return d >= today && d <= in7days
    })
    .sort((a: any, b: any) => new Date(a.prochain_entretien).getTime() - new Date(b.prochain_entretien).getTime())

  const aRelancer = etudiants.filter((e: any) =>
    e.statut === 'en_recherche' && (e.nb_candidatures || 0) === 0
  )

  return (
    <div className="min-h-screen bg-[#D6E6D6] flex">

      <AdminSidebar />

      <div className="flex-1 p-6 overflow-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Bonjour, Remi</h1>
            <p className="text-sm text-[#5C7A5C] mt-0.5">SUP-PHOTO · Promo 2024–2025</p>
          </div>
          <LogoutButton />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <StatCard label="Étudiants" value={total} sub={`${enPrep} en préparation`} />
          <StatCard label="En recherche" value={enRecherche} sub={`${aRelancer.length} à relancer`} color="blue" />
          <StatCard label="Placés" value={places} sub={`${tauxPlacement}% de la promo`} color="green" />
          <StatCard label="Candidatures" value={totalCandidatures} sub="au total" />
        </div>

        {/* Taux de placement */}
        <div className="bg-white border border-[#C8D8C8] rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Taux de placement global</span>
            <span className="text-sm font-bold text-gray-900">{tauxPlacement}%</span>
          </div>
          <div className="flex gap-1 h-3 rounded-full overflow-hidden">
            {places > 0 && (
              <div className="bg-green-400 rounded-l-full transition-all" style={{ width: `${(places / total) * 100}%` }}></div>
            )}
            {enRecherche > 0 && (
              <div className="bg-[#5C7A5C]" style={{ width: `${(enRecherche / total) * 100}%` }}></div>
            )}
            {enPrep > 0 && (
              <div className="bg-gray-200 rounded-r-full" style={{ width: `${(enPrep / total) * 100}%` }}></div>
            )}
          </div>
          <div className="flex gap-4 mt-2">
            {[
              { label: 'Placés', color: 'bg-green-400', count: places },
              { label: 'En recherche', color: 'bg-[#5C7A5C]', count: enRecherche },
              { label: 'En préparation', color: 'bg-gray-200', count: enPrep },
            ].map(({ label, color, count }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className={`w-2 h-2 rounded-full ${color}`}></div>
                <span className="text-[10px] text-gray-400">{label} ({count})</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">

          {/* Prochains entretiens */}
          <div className="bg-white border border-[#C8D8C8] rounded-xl p-4">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Entretiens cette semaine</h2>
            {prochainEntretiens.length === 0 ? (
              <p className="text-sm text-gray-300 italic">Aucun entretien prévu.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {prochainEntretiens.map((e: any) => (
                  <Link key={e.id} href={`/etudiants/${e.id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#F8FAF8] transition-colors">
                    <div className="w-7 h-7 rounded-full bg-[#E4EDE4] flex items-center justify-center text-xs font-semibold text-[#3D553D] shrink-0">
                      {e.prenom[0]}{e.nom[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate">{e.prenom} {e.nom}</p>
                      <p className="text-[10px] text-[#5C7A5C]">
                        {new Date(e.prochain_entretien).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* À relancer */}
          <div className="bg-white border border-[#C8D8C8] rounded-xl p-4">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              À relancer <span className="text-red-400 ml-1">{aRelancer.length}</span>
            </h2>
            {aRelancer.length === 0 ? (
              <p className="text-sm text-gray-300 italic">Tout le monde est actif.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {aRelancer.slice(0, 5).map((e: any) => (
                  <Link key={e.id} href={`/etudiants/${e.id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#F8FAF8] transition-colors">
                    <div className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center text-xs font-semibold text-red-400 shrink-0">
                      {e.prenom[0]}{e.nom[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate">{e.prenom} {e.nom}</p>
                      <p className="text-[10px] text-gray-400">0 candidature</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Meilleurs progressions */}
          <div className="bg-white border border-[#C8D8C8] rounded-xl p-4">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Top progressions</h2>
            <div className="flex flex-col gap-2">
              {[...etudiants]
                .sort((a: any, b: any) => calcProgression(b) - calcProgression(a))
                .slice(0, 5)
                .map((e: any) => {
                  const pct = calcProgression(e)
                  return (
                  <Link key={e.id} href={`/etudiants/${e.id}`} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#F8FAF8] transition-colors">
                    <div className="w-7 h-7 rounded-full bg-[#E4EDE4] flex items-center justify-center text-xs font-semibold text-[#3D553D] shrink-0">
                      {e.prenom[0]}{e.nom[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate">{e.prenom} {e.nom}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="flex-1 h-1 bg-[#E4EDE4] rounded-full overflow-hidden">
                          <div className="h-full bg-[#5C7A5C] rounded-full" style={{ width: `${pct}%` }}></div>
                        </div>
                        <span className="text-[10px] text-gray-400">{pct}%</span>
                      </div>
                    </div>
                  </Link>
                )})}
            </div>
          </div>
        </div>

        {/* Liste étudiants complète avec recherche/filtres */}
        <DashboardClient etudiants={etudiants} />
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, color }: { label: string; value: number; sub: string; color?: string }) {
  const colors = {
    green: 'text-green-600',
    blue: 'text-blue-600',
  }
  const valueColor = color ? colors[color as keyof typeof colors] : 'text-gray-900'
  return (
    <div className="bg-white border border-[#C8D8C8] rounded-xl p-4">
      <div className="text-[11px] font-medium text-gray-400 mb-1.5 uppercase tracking-wide">{label}</div>
      <div className={`text-2xl font-bold tracking-tight ${valueColor}`}>{value}</div>
      <div className="text-[11px] text-gray-400 mt-1">{sub}</div>
    </div>
  )
}
