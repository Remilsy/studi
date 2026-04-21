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
  const r = 36
  const circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
      <defs>
        <linearGradient id="donutGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22C55E"/>
          <stop offset="100%" stopColor="#86EFAC"/>
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(34,197,94,0.12)" strokeWidth="10"/>
      <circle cx="50" cy="50" r={r} fill="none" stroke="url(#donutGrad)" strokeWidth="10"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.8s ease' }}/>
    </svg>
  )
}

/* Carte verre avec highlight spéculaire au sommet */
function GlassCard({ children, shadow, className = '' }: {
  children: React.ReactNode
  shadow?: string
  className?: string
}) {
  return (
    <div className={`relative overflow-hidden ${className}`} style={{
      background: 'linear-gradient(145deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.28) 100%)',
      backdropFilter: 'blur(60px)',
      WebkitBackdropFilter: 'blur(60px)',
      border: '1px solid rgba(255,255,255,0.65)',
      borderRadius: '28px',
      boxShadow: shadow
        ? `${shadow}, inset 0 1px 0 rgba(255,255,255,0.7), inset 0 -1px 0 rgba(0,0,0,0.04)`
        : 'inset 0 1px 0 rgba(255,255,255,0.7)',
    }}>
      {/* Highlight spéculaire angulaire */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '45%',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.22) 0%, transparent 100%)',
        pointerEvents: 'none', borderRadius: '28px 28px 0 0',
      }}/>
      {children}
    </div>
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
    <div className="min-h-screen flex" style={{
      background: 'linear-gradient(160deg, #B8C4BE 0%, #BFC3CC 100%)',
    }}>

      {/* Orbes liquides de fond */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <div style={{ position:'absolute', top:'-15%', left:'10%', width:'800px', height:'800px', borderRadius:'50%', background:'radial-gradient(circle at 40% 40%, rgba(120,200,140,0.45) 0%, transparent 58%)', filter:'blur(90px)' }}/>
        <div style={{ position:'absolute', bottom:'-10%', right:'5%', width:'700px', height:'700px', borderRadius:'50%', background:'radial-gradient(circle at 60% 60%, rgba(160,130,220,0.38) 0%, transparent 58%)', filter:'blur(90px)' }}/>
        <div style={{ position:'absolute', top:'30%', right:'25%', width:'450px', height:'450px', borderRadius:'50%', background:'radial-gradient(circle, rgba(100,150,220,0.28) 0%, transparent 58%)', filter:'blur(70px)' }}/>
        <div style={{ position:'absolute', top:'60%', left:'30%', width:'360px', height:'360px', borderRadius:'50%', background:'radial-gradient(circle, rgba(240,150,80,0.25) 0%, transparent 58%)', filter:'blur(70px)' }}/>
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

          {/* KPI Cards — chiffres toujours en noir, accent sur le label */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Étudiants',    value: total,       sub: `dont ${enPrep} en prépa`,         color: '#16A34A', shadow: '0 12px 50px rgba(34,197,94,0.22)',   icon: '🎓' },
              { label: 'En recherche', value: enRecherche, sub: `${aRelancer.length} sans candidature`, color: '#2563EB', shadow: '0 12px 50px rgba(59,130,246,0.22)',   icon: '🔍' },
              { label: 'Placés',       value: places,      sub: `${taux}% de placement`,           color: '#059669', shadow: '0 12px 50px rgba(16,185,129,0.22)',   icon: '✅' },
              { label: 'Candidatures', value: totalCands,  sub: 'au total',                        color: '#7C3AED', shadow: '0 12px 50px rgba(139,92,246,0.22)',   icon: '📨' },
            ].map(({ label, value, sub, color, shadow, icon }) => (
              <GlassCard key={label} shadow={shadow} className="p-5 flex flex-col gap-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-2xl flex items-center justify-center text-base shrink-0"
                    style={{ background: `${color}18` }}>
                    {icon}
                  </div>
                  <span className="text-xs font-bold tracking-wide" style={{ color }}>{label}</span>
                </div>

                <div>
                  <p className="text-5xl font-black text-gray-900 tracking-tight leading-none">{value}</p>
                  <p className="text-xs font-medium mt-2" style={{ color: `${color}cc` }}>{sub}</p>
                </div>

                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
                  <div className="h-full rounded-full"
                    style={{ width: `${total > 0 ? Math.round((value / total) * 100) : 0}%`, background: `linear-gradient(90deg, ${color}, ${color}88)` }}/>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Rangée du milieu */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Donut placement */}
            <GlassCard shadow="0 12px 50px rgba(34,197,94,0.18)" className="p-6 flex flex-col gap-5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: '#22C55E' }}/>
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#16A34A' }}>Taux de placement</p>
              </div>
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
                    { label: 'Placés',         count: places,      color: '#16A34A', dot: '#22C55E' },
                    { label: 'En recherche',   count: enRecherche, color: '#2563EB', dot: '#3B82F6' },
                    { label: 'En préparation', count: enPrep,      color: '#9CA3AF', dot: '#D1D5DB' },
                  ].map(({ label, count, color, dot }) => (
                    <div key={label} className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: dot }}/>
                      <span className="text-xs text-gray-500 flex-1">{label}</span>
                      <span className="text-sm font-black" style={{ color }}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>

            {/* Entretiens */}
            <GlassCard shadow="0 12px 50px rgba(59,130,246,0.18)" className="p-6 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: '#3B82F6' }}/>
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#2563EB' }}>Entretiens 7 jours</p>
                </div>
                <span className="text-xs font-black px-2.5 py-1 rounded-full"
                  style={{ background: 'rgba(59,130,246,0.12)', color: '#2563EB' }}>
                  {entretiens.length}
                </span>
              </div>
              {entretiens.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-8 gap-2">
                  <p className="text-3xl">📅</p>
                  <p className="text-xs text-gray-400">Aucun entretien prévu</p>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {entretiens.slice(0, 4).map((e: any) => {
                    const d = new Date(e.prochain_entretien)
                    const diff = Math.ceil((d.getTime() - today.getTime()) / 86400000)
                    const urgent = diff <= 1
                    return (
                      <Link key={e.id} href={`/etudiants/${e.id}`}
                        className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-white/50 transition-colors">
                        <div className="w-10 h-10 rounded-2xl flex flex-col items-center justify-center shrink-0"
                          style={{ background: urgent ? 'rgba(249,115,22,0.12)' : 'rgba(59,130,246,0.1)' }}>
                          <span className="text-xs font-black leading-none" style={{ color: urgent ? '#EA580C' : '#2563EB' }}>{d.getDate()}</span>
                          <span className="text-[9px] leading-none mt-0.5 uppercase font-bold" style={{ color: urgent ? '#F97316' : '#3B82F6' }}>
                            {d.toLocaleDateString('fr-FR', { month: 'short' })}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{e.prenom} {e.nom}</p>
                          <p className="text-[11px]" style={{ color: urgent ? '#F97316' : '#9CA3AF' }}>
                            {diff === 0 ? "Aujourd'hui !" : diff === 1 ? 'Demain' : `Dans ${diff} jours`}
                          </p>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </GlassCard>

            {/* À relancer */}
            <GlassCard shadow="0 12px 50px rgba(249,115,22,0.18)" className="p-6 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: '#F97316' }}/>
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#EA580C' }}>À relancer</p>
                </div>
                {aRelancer.length > 0 && (
                  <span className="text-xs font-black px-2.5 py-1 rounded-full"
                    style={{ background: 'rgba(249,115,22,0.12)', color: '#EA580C' }}>
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
                <div className="flex flex-col gap-1">
                  {aRelancer.slice(0, 4).map((e: any) => (
                    <Link key={e.id} href={`/etudiants/${e.id}`}
                      className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-white/50 transition-colors">
                      <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-black shrink-0"
                        style={{ background: 'rgba(249,115,22,0.12)', color: '#EA580C' }}>
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
                    <Link href="/relances" className="text-xs text-center py-1 font-medium transition-colors hover:underline"
                      style={{ color: '#F97316' }}>
                      +{aRelancer.length - 4} autres →
                    </Link>
                  )}
                </div>
              )}
            </GlassCard>
          </div>

          {/* Top progressions */}
          <GlassCard shadow="0 12px 50px rgba(139,92,246,0.14)" className="p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: '#8B5CF6' }}/>
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#7C3AED' }}>Top progressions</p>
              </div>
              <Link href="/etudiants" className="text-xs font-bold hover:underline" style={{ color: '#7C3AED' }}>Voir tous →</Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {topProgressions.map((e: any) => {
                const pct = calcProgression(e)
                const isPlace = e.statut === 'place'
                const accentColor = pct === 100 ? '#16A34A' : pct >= 60 ? '#7C3AED' : '#EA580C'
                const barGrad = pct === 100 ? '#22C55E, #86EFAC' : pct >= 60 ? '#8B5CF6, #C4B5FD' : '#F97316, #FED7AA'
                return (
                  <Link key={e.id} href={`/etudiants/${e.id}`}
                    className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/50 transition-colors">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black shrink-0"
                      style={{ background: `${accentColor}15`, color: accentColor }}>
                      {e.prenom[0]}{e.nom[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-gray-900 truncate">{e.prenom} {e.nom}</p>
                        <span className="text-xs font-black ml-2 shrink-0" style={{ color: accentColor }}>{pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.07)' }}>
                        <div className="h-full rounded-full"
                          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${barGrad})` }}/>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </GlassCard>

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
