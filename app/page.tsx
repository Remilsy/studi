import { createClient } from '../lib/supabase-server'
import Link from 'next/link'
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
  const { data } = await supabase.from('etudiants').select('*').order('created_at', { ascending: false })
  return data || []
}

function DonutChart({ pct }: { pct: number }) {
  const r = 38
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
      <circle cx="50" cy="50" r={r} fill="none" stroke="#E4EDE4" strokeWidth="13"/>
      <circle cx="50" cy="50" r={r} fill="none" stroke="#16A34A" strokeWidth="13"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.8s ease' }}/>
    </svg>
  )
}

export default async function Dashboard() {
  const etudiants = await getEtudiants()

  const total       = etudiants.length
  const places      = etudiants.filter((e: any) => e.statut === 'place').length
  const enRecherche = etudiants.filter((e: any) => e.statut === 'en_recherche').length
  const enPrep      = etudiants.filter((e: any) => e.statut === 'en_preparation').length
  const taux        = total > 0 ? Math.round((places / total) * 100) : 0
  const totalCands  = etudiants.reduce((s: number, e: any) => s + (e.nb_candidatures || 0), 0)

  const today = new Date(); today.setHours(0, 0, 0, 0)
  const in7   = new Date(today); in7.setDate(today.getDate() + 7)

  const entretiens = etudiants
    .filter((e: any) => {
      if (!e.prochain_entretien) return false
      const d = new Date(e.prochain_entretien)
      return d >= today && d <= in7
    })
    .sort((a: any, b: any) => new Date(a.prochain_entretien).getTime() - new Date(b.prochain_entretien).getTime())

  const aRelancer = etudiants.filter((e: any) => e.statut === 'en_recherche' && (e.nb_candidatures || 0) === 0)

  const topProgressions = [...etudiants]
    .sort((a: any, b: any) => calcProgression(b) - calcProgression(a))
    .slice(0, 6)

  const dateStr = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#F0F4F0' }}>
      <AdminSidebar />

      <div className="flex-1 overflow-auto">

        {/* Header */}
        <div className="px-8 pt-8 pb-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#5C7A5C' }}>
                {dateStr.charAt(0).toUpperCase() + dateStr.slice(1)}
              </p>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Bonjour, Remi 👋</h1>
              <p className="text-sm text-gray-500 mt-1">Voici l'état de ta promo aujourd'hui.</p>
            </div>
          </div>
        </div>

        <div className="px-8 pb-8 flex flex-col gap-5">

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Étudiants',    value: total,       sub: `${enPrep} en préparation`,        accent: '#E4EDE4', accentText: '#3D553D', dot: '#5C7A5C' },
              { label: 'En recherche', value: enRecherche, sub: `${aRelancer.length} à relancer`,   accent: '#EFF6FF', accentText: '#1D4ED8', dot: '#3B82F6' },
              { label: 'Placés',       value: places,      sub: `${taux}% de la promo`,             accent: '#F0FDF4', accentText: '#15803D', dot: '#16A34A' },
              { label: 'Candidatures', value: totalCands,  sub: 'toutes confondues',                accent: '#F5F3FF', accentText: '#6D28D9', dot: '#8B5CF6' },
            ].map(({ label, value, sub, accent, accentText, dot }) => (
              <div key={label} className="bg-white rounded-2xl p-5 flex flex-col gap-3 border border-white/60"
                style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)' }}>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">{label}</span>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: dot }}/>
                </div>
                <div>
                  <p className="text-4xl font-black tracking-tight" style={{ color: accentText }}>{value}</p>
                  <p className="text-xs text-gray-400 mt-1">{sub}</p>
                </div>
                <div className="h-1 rounded-full" style={{ backgroundColor: accent }}>
                  <div className="h-full rounded-full" style={{ width: `${total > 0 ? (value / total) * 100 : 0}%`, backgroundColor: dot }}/>
                </div>
              </div>
            ))}
          </div>

          {/* Middle row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Placement donut */}
            <div className="bg-white rounded-2xl p-6 flex flex-col gap-4"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Taux de placement</p>
              <div className="flex items-center gap-5">
                <div className="relative w-28 h-28 shrink-0">
                  <DonutChart pct={taux} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-2xl font-black text-gray-900">{taux}%</p>
                    <p className="text-[10px] text-gray-400">placés</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2.5 flex-1">
                  {[
                    { label: 'Placés',         count: places,      color: '#16A34A', bg: '#F0FDF4' },
                    { label: 'En recherche',   count: enRecherche, color: '#3B82F6', bg: '#EFF6FF' },
                    { label: 'En préparation', count: enPrep,      color: '#9CA3AF', bg: '#F3F4F6' },
                  ].map(({ label, count, color, bg }) => (
                    <div key={label} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }}/>
                      <span className="text-xs text-gray-500 flex-1">{label}</span>
                      <span className="text-xs font-bold" style={{ color }}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Entretiens */}
            <div className="bg-white rounded-2xl p-6 flex flex-col gap-3"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Entretiens cette semaine</p>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#EFF6FF', color: '#1D4ED8' }}>
                  {entretiens.length}
                </span>
              </div>
              {entretiens.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-6 gap-2">
                  <p className="text-2xl">📅</p>
                  <p className="text-xs text-gray-400">Aucun entretien prévu</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {entretiens.slice(0, 4).map((e: any) => {
                    const d = new Date(e.prochain_entretien)
                    const diff = Math.ceil((d.getTime() - today.getTime()) / 86400000)
                    return (
                      <Link key={e.id} href={`/etudiants/${e.id}`}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F8FAF8] transition-colors">
                        <div className="w-9 h-9 rounded-xl flex flex-col items-center justify-center shrink-0"
                          style={{ backgroundColor: diff <= 1 ? '#FFF7ED' : '#EFF6FF' }}>
                          <span className="text-xs font-black leading-none" style={{ color: diff <= 1 ? '#EA580C' : '#2563EB' }}>{d.getDate()}</span>
                          <span className="text-[9px] leading-none mt-0.5 uppercase font-semibold" style={{ color: diff <= 1 ? '#F97316' : '#3B82F6' }}>
                            {d.toLocaleDateString('fr-FR', { month: 'short' })}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{e.prenom} {e.nom}</p>
                          <p className="text-[11px] text-gray-400">{diff === 0 ? "Aujourd'hui" : diff === 1 ? 'Demain' : `Dans ${diff}j`}</p>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>

            {/* À relancer */}
            <div className="bg-white rounded-2xl p-6 flex flex-col gap-3"
              style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">À relancer</p>
                {aRelancer.length > 0 && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#FFF1F2', color: '#E11D48' }}>
                    {aRelancer.length}
                  </span>
                )}
              </div>
              {aRelancer.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-6 gap-2">
                  <p className="text-2xl">✅</p>
                  <p className="text-xs text-gray-400">Tout le monde est actif</p>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {aRelancer.slice(0, 4).map((e: any) => (
                    <Link key={e.id} href={`/etudiants/${e.id}`}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F8FAF8] transition-colors">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0"
                        style={{ backgroundColor: '#FFF1F2', color: '#E11D48' }}>
                        {e.prenom[0]}{e.nom[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{e.prenom} {e.nom}</p>
                        <p className="text-[11px] text-gray-400">0 candidature · {e.niveau}</p>
                      </div>
                      <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/>
                      </svg>
                    </Link>
                  ))}
                  {aRelancer.length > 4 && (
                    <Link href="/relances" className="text-xs text-center text-gray-400 hover:text-[#3D553D] py-1 transition-colors">
                      +{aRelancer.length - 4} autres →
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Top progressions */}
          <div className="bg-white rounded-2xl p-6" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div className="flex items-center justify-between mb-5">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Progressions</p>
              <Link href="/etudiants" className="text-xs font-semibold text-[#5C7A5C] hover:underline">Voir tous →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {topProgressions.map((e: any) => {
                const pct = calcProgression(e)
                const isPlace = e.statut === 'place'
                return (
                  <Link key={e.id} href={`/etudiants/${e.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#F8FAF8] transition-colors border border-transparent hover:border-[#E4EDE4]">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0"
                      style={{ backgroundColor: isPlace ? '#F0FDF4' : '#E4EDE4', color: isPlace ? '#15803D' : '#3D553D' }}>
                      {e.prenom[0]}{e.nom[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-sm font-semibold text-gray-900 truncate">{e.prenom} {e.nom}</p>
                        <span className="text-xs font-black ml-2 shrink-0" style={{ color: pct === 100 ? '#15803D' : '#5C7A5C' }}>{pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-[#E4EDE4] overflow-hidden">
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: pct === 100 ? '#16A34A' : '#5C7A5C' }}/>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Liste complète */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">Tous les étudiants</p>
              <span className="text-xs text-gray-400">{total} au total</span>
            </div>
            <DashboardClient etudiants={etudiants} />
          </div>

        </div>
      </div>
    </div>
  )
}
