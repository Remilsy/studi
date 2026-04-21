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
      <defs>
        <linearGradient id="donutGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22C55E"/>
          <stop offset="100%" stopColor="#4ADE80"/>
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(34,197,94,0.1)" strokeWidth="11"/>
      <circle cx="50" cy="50" r={r} fill="none" stroke="url(#donutGrad)" strokeWidth="11"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.8s ease' }}/>
    </svg>
  )
}

const glass = {
  background: 'rgba(255,255,255,0.62)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  border: '1px solid rgba(255,255,255,0.88)',
  borderRadius: '24px',
} as const

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
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #F0FDF4 0%, #F5F3FF 55%, #EFF6FF 100%)' }}>

      {/* Orbes de fond */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div style={{ position:'absolute', top:'-8%', left:'18%', width:'640px', height:'640px', borderRadius:'50%', background:'radial-gradient(circle, rgba(74,222,128,0.2) 0%, transparent 65%)', filter:'blur(70px)' }}/>
        <div style={{ position:'absolute', bottom:'0%', right:'8%', width:'560px', height:'560px', borderRadius:'50%', background:'radial-gradient(circle, rgba(139,92,246,0.16) 0%, transparent 65%)', filter:'blur(70px)' }}/>
        <div style={{ position:'absolute', top:'45%', right:'28%', width:'320px', height:'320px', borderRadius:'50%', background:'radial-gradient(circle, rgba(59,130,246,0.12) 0%, transparent 65%)', filter:'blur(50px)' }}/>
      </div>

      <AdminSidebar />

      <div className="flex-1 overflow-auto relative" style={{ zIndex: 1 }}>

        {/* Header */}
        <div className="px-8 pt-8 pb-6">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-1.5" style={{ color: '#16A34A' }}>
            {dateStr.charAt(0).toUpperCase() + dateStr.slice(1)}
          </p>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Bonjour, Remi 👋</h1>
          <p className="text-sm text-gray-400 mt-1">Voici l'état de ta promo aujourd'hui.</p>
        </div>

        <div className="px-8 pb-8 flex flex-col gap-5">

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Étudiants',    value: total,       sub: `${enPrep} en préparation`,       color: '#22C55E', shadow: 'rgba(34,197,94,0.18)',    emoji: '🎓' },
              { label: 'En recherche', value: enRecherche, sub: `${aRelancer.length} à relancer`,  color: '#3B82F6', shadow: 'rgba(59,130,246,0.18)',    emoji: '🔍' },
              { label: 'Placés',       value: places,      sub: `${taux}% de la promo`,            color: '#10B981', shadow: 'rgba(16,185,129,0.18)',    emoji: '✅' },
              { label: 'Candidatures', value: totalCands,  sub: 'toutes confondues',               color: '#8B5CF6', shadow: 'rgba(139,92,246,0.18)',    emoji: '📨' },
            ].map(({ label, value, sub, color, shadow, emoji }) => (
              <div key={label} className="p-5 flex flex-col gap-3"
                style={{ ...glass, boxShadow: `0 8px 40px ${shadow}, 0 1px 2px rgba(0,0,0,0.04)` }}>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color }}>{label}</span>
                  <span className="text-xl">{emoji}</span>
                </div>
                <div>
                  <p className="text-5xl font-black tracking-tight leading-none" style={{ color }}>{value}</p>
                  <p className="text-xs text-gray-400 mt-2">{sub}</p>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
                  <div className="h-full rounded-full"
                    style={{ width: `${total > 0 ? Math.round((value / total) * 100) : 0}%`, background: `linear-gradient(90deg, ${color}, ${color}99)` }}/>
                </div>
              </div>
            ))}
          </div>

          {/* Rangée du milieu */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Donut placement */}
            <div className="p-6 flex flex-col gap-4"
              style={{ ...glass, boxShadow: '0 8px 40px rgba(34,197,94,0.12), 0 1px 2px rgba(0,0,0,0.04)' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#22C55E' }}>Taux de placement</p>
              <div className="flex items-center gap-5">
                <div className="relative w-28 h-28 shrink-0">
                  <DonutChart pct={taux} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-2xl font-black text-gray-900">{taux}%</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">placés</p>
                  </div>
                </div>
                <div className="flex flex-col gap-3 flex-1">
                  {[
                    { label: 'Placés',         count: places,      color: '#10B981' },
                    { label: 'En recherche',   count: enRecherche, color: '#3B82F6' },
                    { label: 'En préparation', count: enPrep,      color: '#D1D5DB' },
                  ].map(({ label, count, color }) => (
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
            <div className="p-6 flex flex-col gap-3"
              style={{ ...glass, boxShadow: '0 8px 40px rgba(59,130,246,0.12), 0 1px 2px rgba(0,0,0,0.04)' }}>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#3B82F6' }}>Entretiens cette semaine</p>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                  style={{ background: 'rgba(59,130,246,0.1)', color: '#3B82F6' }}>
                  {entretiens.length}
                </span>
              </div>
              {entretiens.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-8 gap-2">
                  <p className="text-3xl">📅</p>
                  <p className="text-xs text-gray-400">Aucun entretien prévu</p>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {entretiens.slice(0, 4).map((e: any) => {
                    const d = new Date(e.prochain_entretien)
                    const diff = Math.ceil((d.getTime() - today.getTime()) / 86400000)
                    return (
                      <Link key={e.id} href={`/etudiants/${e.id}`}
                        className="flex items-center gap-3 p-2.5 rounded-2xl transition-colors"
                        style={{ ':hover': { background: 'rgba(255,255,255,0.5)' } } as any}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.5)'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                      >
                        <div className="w-10 h-10 rounded-2xl flex flex-col items-center justify-center shrink-0"
                          style={{ background: diff <= 1 ? 'rgba(249,115,22,0.1)' : 'rgba(59,130,246,0.1)' }}>
                          <span className="text-xs font-black leading-none" style={{ color: diff <= 1 ? '#EA580C' : '#2563EB' }}>{d.getDate()}</span>
                          <span className="text-[9px] leading-none mt-0.5 uppercase font-bold" style={{ color: diff <= 1 ? '#F97316' : '#3B82F6' }}>
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
            <div className="p-6 flex flex-col gap-3"
              style={{ ...glass, boxShadow: '0 8px 40px rgba(249,115,22,0.12), 0 1px 2px rgba(0,0,0,0.04)' }}>
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#F97316' }}>À relancer</p>
                {aRelancer.length > 0 && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                    style={{ background: 'rgba(249,115,22,0.1)', color: '#EA580C' }}>
                    {aRelancer.length}
                  </span>
                )}
              </div>
              {aRelancer.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-8 gap-2">
                  <p className="text-3xl">✅</p>
                  <p className="text-xs text-gray-400">Tout le monde est actif</p>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {aRelancer.slice(0, 4).map((e: any) => (
                    <Link key={e.id} href={`/etudiants/${e.id}`}
                      className="flex items-center gap-3 p-2.5 rounded-2xl transition-colors"
                      onMouseEnter={ev => (ev.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.5)'}
                      onMouseLeave={ev => (ev.currentTarget as HTMLElement).style.background = 'transparent'}
                    >
                      <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-black shrink-0"
                        style={{ background: 'rgba(249,115,22,0.1)', color: '#EA580C' }}>
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
                    <Link href="/relances" className="text-xs text-center py-1 transition-colors"
                      style={{ color: '#F97316' }}>
                      +{aRelancer.length - 4} autres →
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Top progressions */}
          <div className="p-6"
            style={{ ...glass, boxShadow: '0 8px 40px rgba(139,92,246,0.1), 0 1px 2px rgba(0,0,0,0.04)' }}>
            <div className="flex items-center justify-between mb-5">
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#8B5CF6' }}>Top progressions</p>
              <Link href="/etudiants" className="text-xs font-bold hover:underline" style={{ color: '#8B5CF6' }}>Voir tous →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {topProgressions.map((e: any) => {
                const pct = calcProgression(e)
                const isPlace = e.statut === 'place'
                const barColor = pct === 100 ? '#22C55E' : pct >= 60 ? '#8B5CF6' : '#F97316'
                return (
                  <Link key={e.id} href={`/etudiants/${e.id}`}
                    className="flex items-center gap-3 p-3 rounded-2xl transition-colors"
                    onMouseEnter={ev => (ev.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.5)'}
                    onMouseLeave={ev => (ev.currentTarget as HTMLElement).style.background = 'transparent'}
                  >
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black shrink-0"
                      style={{ background: isPlace ? 'rgba(34,197,94,0.12)' : 'rgba(139,92,246,0.1)', color: isPlace ? '#16A34A' : '#7C3AED' }}>
                      {e.prenom[0]}{e.nom[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-sm font-semibold text-gray-900 truncate">{e.prenom} {e.nom}</p>
                        <span className="text-xs font-black ml-2 shrink-0" style={{ color: barColor }}>{pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.07)' }}>
                        <div className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${barColor}, ${barColor}aa)` }}/>
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
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Tous les étudiants</p>
              <span className="text-xs text-gray-400">{total} au total</span>
            </div>
            <DashboardClient etudiants={etudiants} />
          </div>

        </div>
      </div>
    </div>
  )
}
