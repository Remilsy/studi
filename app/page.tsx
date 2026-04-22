import { createClient } from '../lib/supabase-server'
import Link from 'next/link'
import DashboardClient from './components/DashboardClient'
import AdminSidebar from './components/AdminSidebar'
import ParallaxOrbs from './components/ParallaxOrbs'
import ThemeSwitcher from './components/ThemeSwitcher'

function calcProgression(e: any) {
  let s = 0
  if (e.telephone) s += 20
  if (e.linkedin)  s += 20
  if (e.cv_statut     === 'depose') s += 20
  if (e.lettre_statut === 'depose') s += 20
  if ((e.nb_candidatures || 0) > 0) s += 20
  return s
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days  = Math.floor(diff / 86400000)
  const hours = Math.floor(diff / 3600000)
  const mins  = Math.floor(diff / 60000)
  if (days  > 0) return `il y a ${days}j`
  if (hours > 0) return `il y a ${hours}h`
  if (mins  > 0) return `il y a ${mins}min`
  return "à l'instant"
}

async function getData() {
  const supabase = await createClient()
  const [{ data: etudiants }, { data: activite }] = await Promise.all([
    supabase.from('etudiants').select('*').order('created_at', { ascending: false }),
    supabase.from('etudiants')
      .select('id, prenom, nom, statut, nb_candidatures, updated_at')
      .order('updated_at', { ascending: false })
      .limit(6),
  ])
  return { etudiants: etudiants || [], activite: activite || [] }
}

function DonutChart({ pct }: { pct: number }) {
  const r = 36, circ = 2 * Math.PI * r, dash = (pct / 100) * circ
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" style={{ transform: 'rotate(-90deg)' }}>
      <defs>
        <linearGradient id="donutGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22C55E"/><stop offset="100%" stopColor="#86EFAC"/>
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(34,197,94,0.12)" strokeWidth="10"/>
      <circle cx="50" cy="50" r={r} fill="none" stroke="url(#donutGrad)" strokeWidth="10"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.8s ease' }}/>
    </svg>
  )
}

function GlassCard({ children, shadow, className = '', delay = '0ms' }: {
  children: React.ReactNode; shadow?: string; className?: string; delay?: string
}) {
  return (
    <div className={`card-enter card-hover relative overflow-hidden ${className}`} style={{
      animationDelay: delay,
      background: 'linear-gradient(145deg, var(--dash-card-from) 0%, var(--dash-card-to) 100%)',
      backdropFilter: 'blur(60px)', WebkitBackdropFilter: 'blur(60px)',
      border: '1px solid var(--dash-card-border)', borderRadius: '28px',
      boxShadow: shadow
        ? `${shadow}, inset 0 1px 0 var(--dash-card-inset)`
        : 'inset 0 1px 0 var(--dash-card-inset)',
    }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '45%',
        background: 'linear-gradient(180deg, var(--dash-card-specular) 0%, transparent 100%)',
        pointerEvents: 'none', borderRadius: '28px 28px 0 0',
      }}/>
      {children}
    </div>
  )
}

const statutActivite: Record<string, { label: string; color: string; bg: string }> = {
  en_preparation: { label: 'En préparation', color: '#9CA3AF', bg: 'rgba(156,163,175,0.1)' },
  en_recherche:   { label: 'En recherche',   color: '#3B82F6', bg: 'rgba(59,130,246,0.1)'  },
  place:          { label: 'Placé ✓',        color: '#16A34A', bg: 'rgba(34,197,94,0.1)'   },
}

export default async function Dashboard() {
  const { etudiants, activite } = await getData()
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const adminName = user?.user_metadata?.prenom || user?.email?.split('@')[0] || 'Admin'

  const total       = etudiants.length
  const places      = etudiants.filter((e: any) => e.statut === 'place').length
  const enRecherche = etudiants.filter((e: any) => e.statut === 'en_recherche').length
  const enPrep      = etudiants.filter((e: any) => e.statut === 'en_preparation').length
  const taux        = total > 0 ? Math.round((places / total) * 100) : 0
  const totalCands  = etudiants.reduce((s: number, e: any) => s + (e.nb_candidatures || 0), 0)

  const today = new Date(); today.setHours(0, 0, 0, 0)
  const in7   = new Date(today); in7.setDate(today.getDate() + 7)

  const entretiens = etudiants
    .filter((e: any) => { if (!e.prochain_entretien) return false; const d = new Date(e.prochain_entretien); return d >= today && d <= in7 })
    .sort((a: any, b: any) => new Date(a.prochain_entretien).getTime() - new Date(b.prochain_entretien).getTime())

  const aRelancer = etudiants.filter((e: any) => e.statut === 'en_recherche' && (e.nb_candidatures || 0) === 0)

  // Documents manquants
  const sansCv     = etudiants.filter((e: any) => e.cv_statut !== 'depose')
  const sansLettre = etudiants.filter((e: any) => e.lettre_statut !== 'depose')
  const sansAucun  = etudiants.filter((e: any) => e.cv_statut !== 'depose' && e.lettre_statut !== 'depose')

  // Taux de conversion
  const avecCands     = etudiants.filter((e: any) => (e.nb_candidatures || 0) > 0).length
  const avecEntretien = etudiants.filter((e: any) => !!e.prochain_entretien).length
  const tauxCandEnt   = avecCands > 0   ? Math.round((avecEntretien / avecCands) * 100) : 0
  const tauxEntPlace  = avecEntretien > 0 ? Math.round((places / avecEntretien) * 100)  : 0
  const tauxGlobal    = avecCands > 0   ? Math.round((places / avecCands) * 100)         : 0

  const topProgressions = [...etudiants].sort((a: any, b: any) => calcProgression(b) - calcProgression(a)).slice(0, 6)
  const dateStr = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="h-screen flex" style={{ background: 'var(--dash-bg)' }}>
      <ParallaxOrbs />
      <AdminSidebar />

      <div id="dashboard-scroll" className="flex-1 h-full overflow-y-auto relative" style={{ zIndex: 1 }}>

        {/* Header */}
        <div className="px-8 pt-8 pb-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--dash-header-date)' }}>
                {dateStr.charAt(0).toUpperCase() + dateStr.slice(1)}
              </p>
              <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--dash-header-title)' }}>Bonjour, {adminName} 👋</h1>
              <p className="text-sm mt-1" style={{ color: 'var(--dash-header-sub)' }}>Voici l'état de ta promo aujourd'hui.</p>
            </div>
            <ThemeSwitcher />
          </div>
        </div>

        <div className="px-8 pb-8 flex flex-col gap-5">

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Étudiants',    value: total,       sub: `dont ${enPrep} en prépa`,              color: '#16A34A', shadow: '0 12px 50px rgba(34,197,94,0.22)',  icon: '🎓' },
              { label: 'En recherche', value: enRecherche, sub: `${aRelancer.length} sans candidature`,  color: '#2563EB', shadow: '0 12px 50px rgba(59,130,246,0.22)', icon: '🔍' },
              { label: 'Placés',       value: places,      sub: `${taux}% de placement`,                color: '#059669', shadow: '0 12px 50px rgba(16,185,129,0.22)', icon: '✅' },
              { label: 'Candidatures', value: totalCands,  sub: 'au total',                             color: '#7C3AED', shadow: '0 12px 50px rgba(139,92,246,0.22)', icon: '📨' },
            ].map(({ label, value, sub, color, shadow, icon }, i) => (
              <GlassCard key={label} shadow={shadow} className="p-5 flex flex-col gap-4" delay={`${i * 80}ms`}>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-2xl flex items-center justify-center text-base shrink-0" style={{ background: `${color}18` }}>{icon}</div>
                  <span className="text-xs font-bold tracking-wide" style={{ color }}>{label}</span>
                </div>
                <div>
                  <p className="text-5xl font-black tracking-tight leading-none" style={{ color: 'var(--dash-header-title)' }}>{value}</p>
                  <p className="text-xs font-medium mt-2" style={{ color: `${color}cc` }}>{sub}</p>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
                  <div className="h-full rounded-full" style={{ width: `${total > 0 ? Math.round((value / total) * 100) : 0}%`, background: `linear-gradient(90deg, ${color}, ${color}88)` }}/>
                </div>
              </GlassCard>
            ))}
          </div>

          {/* Rangée milieu */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            <GlassCard shadow="0 12px 50px rgba(34,197,94,0.18)" className="p-6 flex flex-col gap-5" delay="320ms">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: '#22C55E' }}/>
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#16A34A' }}>Taux de placement</p>
              </div>
              <div className="flex items-center gap-5">
                <div className="relative w-28 h-28 shrink-0">
                  <DonutChart pct={taux} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-2xl font-black" style={{ color: 'var(--dash-header-title)' }}>{taux}%</p>
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

            <GlassCard shadow="0 12px 50px rgba(59,130,246,0.18)" className="p-6 flex flex-col gap-3" delay="400ms">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: '#3B82F6' }}/>
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#2563EB' }}>Entretiens 7 jours</p>
                </div>
                <span className="text-xs font-black px-2.5 py-1 rounded-full" style={{ background: 'rgba(59,130,246,0.12)', color: '#2563EB' }}>{entretiens.length}</span>
              </div>
              {entretiens.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-8 gap-2">
                  <p className="text-3xl">📅</p><p className="text-xs text-gray-400">Aucun entretien prévu</p>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {entretiens.slice(0, 4).map((e: any) => {
                    const d = new Date(e.prochain_entretien)
                    const diff = Math.ceil((d.getTime() - today.getTime()) / 86400000)
                    const urgent = diff <= 1
                    return (
                      <Link key={e.id} href={`/etudiants/${e.id}`} className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-white/50 transition-colors">
                        <div className="w-10 h-10 rounded-2xl flex flex-col items-center justify-center shrink-0" style={{ background: urgent ? 'rgba(249,115,22,0.12)' : 'rgba(59,130,246,0.1)' }}>
                          <span className="text-xs font-black leading-none" style={{ color: urgent ? '#EA580C' : '#2563EB' }}>{d.getDate()}</span>
                          <span className="text-[9px] leading-none mt-0.5 uppercase font-bold" style={{ color: urgent ? '#F97316' : '#3B82F6' }}>{d.toLocaleDateString('fr-FR', { month: 'short' })}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: 'var(--dash-header-title)' }}>{e.prenom} {e.nom}</p>
                          <p className="text-[11px]" style={{ color: urgent ? '#F97316' : '#9CA3AF' }}>{diff === 0 ? "Aujourd'hui !" : diff === 1 ? 'Demain' : `Dans ${diff} jours`}</p>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </GlassCard>

            <GlassCard shadow="0 12px 50px rgba(249,115,22,0.18)" className="p-6 flex flex-col gap-3" delay="480ms">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: '#F97316' }}/>
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#EA580C' }}>À relancer</p>
                </div>
                {aRelancer.length > 0 && <span className="text-xs font-black px-2.5 py-1 rounded-full" style={{ background: 'rgba(249,115,22,0.12)', color: '#EA580C' }}>{aRelancer.length}</span>}
              </div>
              {aRelancer.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-8 gap-2">
                  <p className="text-3xl">✅</p><p className="text-xs text-gray-400">Tout le monde est actif</p>
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  {aRelancer.slice(0, 4).map((e: any) => (
                    <Link key={e.id} href={`/etudiants/${e.id}`} className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-white/50 transition-colors">
                      <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-black shrink-0" style={{ background: 'rgba(249,115,22,0.12)', color: '#EA580C' }}>{e.prenom[0]}{e.nom[0]}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--dash-header-title)' }}>{e.prenom} {e.nom}</p>
                        <p className="text-[11px] text-gray-400">0 candidature · {e.niveau}</p>
                      </div>
                      <svg className="w-3.5 h-3.5 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7"/></svg>
                    </Link>
                  ))}
                  {aRelancer.length > 4 && <Link href="/relances" className="text-xs text-center py-1 font-medium hover:underline" style={{ color: '#F97316' }}>+{aRelancer.length - 4} autres →</Link>}
                </div>
              )}
            </GlassCard>
          </div>

          {/* Nouvelles sections haute priorité */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Documents manquants */}
            <GlassCard shadow="0 12px 50px rgba(239,68,68,0.16)" className="p-6 flex flex-col gap-4" delay="560ms">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: '#EF4444' }}/>
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#DC2626' }}>Documents manquants</p>
                </div>
                <span className="text-xs font-black px-2.5 py-1 rounded-full" style={{ background: 'rgba(239,68,68,0.1)', color: '#DC2626' }}>{sansAucun.length}</span>
              </div>
              <div className="flex flex-col gap-2.5">
                {[
                  { label: 'Sans CV',             count: sansCv.length,     color: '#DC2626', pct: total > 0 ? Math.round((sansCv.length / total) * 100) : 0 },
                  { label: 'Sans lettre / portfolio', count: sansLettre.length, color: '#EA580C', pct: total > 0 ? Math.round((sansLettre.length / total) * 100) : 0 },
                  { label: 'Aucun document',      count: sansAucun.length,  color: '#9CA3AF', pct: total > 0 ? Math.round((sansAucun.length / total) * 100) : 0 },
                ].map(({ label, count, color, pct }) => (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">{label}</span>
                      <span className="text-xs font-bold" style={{ color }}>{count} <span className="text-gray-400 font-normal">({pct}%)</span></span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}88)` }}/>
                    </div>
                  </div>
                ))}
              </div>
              {sansAucun.length > 0 && (
                <div className="mt-1 flex flex-col gap-1">
                  {sansAucun.slice(0, 3).map((e: any) => (
                    <Link key={e.id} href={`/etudiants/${e.id}`} className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/50 transition-colors">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0" style={{ background: 'rgba(239,68,68,0.1)', color: '#DC2626' }}>{e.prenom[0]}{e.nom[0]}</div>
                      <span className="text-xs font-medium truncate" style={{ color: 'var(--dash-header-title)' }}>{e.prenom} {e.nom}</span>
                    </Link>
                  ))}
                </div>
              )}
            </GlassCard>

            {/* Taux de conversion */}
            <GlassCard shadow="0 12px 50px rgba(234,179,8,0.18)" className="p-6 flex flex-col gap-4" delay="640ms">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: '#EAB308' }}/>
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#CA8A04' }}>Taux de conversion</p>
              </div>
              <div className="flex flex-col gap-3">
                {[
                  { label: 'Candidature → Entretien', taux: tauxCandEnt, from: avecCands, to: avecEntretien, color: '#3B82F6' },
                  { label: 'Entretien → Placement',   taux: tauxEntPlace, from: avecEntretien, to: places,  color: '#16A34A' },
                  { label: 'Global (cand. → placé)',  taux: tauxGlobal,  from: avecCands,     to: places,   color: '#7C3AED' },
                ].map(({ label, taux: t, from, to, color }) => (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs text-gray-500 truncate flex-1">{label}</span>
                      <div className="flex items-center gap-1.5 ml-2 shrink-0">
                        <span className="text-[10px] text-gray-400">{from}→{to}</span>
                        <span className="text-sm font-black" style={{ color }}>{t}%</span>
                      </div>
                    </div>
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
                      <div className="h-full rounded-full transition-all" style={{ width: `${t}%`, background: `linear-gradient(90deg, ${color}, ${color}99)` }}/>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-auto pt-2 border-t" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Total candidatures</span>
                  <span className="text-lg font-black" style={{ color: 'var(--dash-header-title)' }}>{totalCands}</span>
                </div>
              </div>
            </GlassCard>

            {/* Activité récente */}
            <GlassCard shadow="0 12px 50px rgba(139,92,246,0.16)" className="p-6 flex flex-col gap-3" delay="720ms">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ background: '#8B5CF6' }}/>
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#7C3AED' }}>Activité récente</p>
              </div>
              <div className="flex flex-col gap-1">
                {activite.map((e: any) => {
                  const s = statutActivite[e.statut] || { label: e.statut, color: '#9CA3AF', bg: 'rgba(156,163,175,0.1)' }
                  return (
                    <Link key={e.id} href={`/etudiants/${e.id}`} className="flex items-center gap-3 p-2 rounded-2xl hover:bg-white/50 transition-colors">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0" style={{ background: s.bg, color: s.color }}>
                        {e.prenom[0]}{e.nom[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate" style={{ color: 'var(--dash-header-title)' }}>{e.prenom} {e.nom}</p>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-semibold" style={{ color: s.color }}>{s.label}</span>
                          <span className="text-[10px] text-gray-300">·</span>
                          <span className="text-[10px] text-gray-400">{e.nb_candidatures ?? 0} cand.</span>
                        </div>
                      </div>
                      <span className="text-[10px] text-gray-300 shrink-0">{timeAgo(e.updated_at)}</span>
                    </Link>
                  )
                })}
              </div>
            </GlassCard>
          </div>

          {/* Top progressions */}
          <GlassCard shadow="0 12px 50px rgba(139,92,246,0.14)" className="p-6" delay="800ms">
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
                const accentColor = pct === 100 ? '#16A34A' : pct >= 60 ? '#7C3AED' : '#EA580C'
                const barGrad = pct === 100 ? '#22C55E, #86EFAC' : pct >= 60 ? '#8B5CF6, #C4B5FD' : '#F97316, #FED7AA'
                return (
                  <Link key={e.id} href={`/etudiants/${e.id}`} className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/50 transition-colors">
                    <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-black shrink-0" style={{ background: `${accentColor}15`, color: accentColor }}>{e.prenom[0]}{e.nom[0]}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--dash-header-title)' }}>{e.prenom} {e.nom}</p>
                        <span className="text-xs font-black ml-2 shrink-0" style={{ color: accentColor }}>{pct}%</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.07)' }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${barGrad})` }}/>
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
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--dash-section-label)' }}>Tous les étudiants</p>
              <span className="text-xs" style={{ color: 'var(--dash-section-label)' }}>{total} au total</span>
            </div>
            <DashboardClient etudiants={etudiants} />
          </div>

        </div>
      </div>
    </div>
  )
}
