import { createClient } from '../lib/supabase-server'
import LogoutButton from './components/LogoutButton'

async function getEtudiants() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('etudiants')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) console.error(error)
  return data || []
}

export default async function Dashboard() {
  const etudiants = await getEtudiants()

  const total = etudiants.length
  const places = etudiants.filter((e: any) => e.statut === 'place').length
  const enRecherche = etudiants.filter((e: any) => e.statut === 'en_recherche').length

  return (
    <div className="min-h-screen bg-[#D6E6D6] flex">
      <div className="w-52 bg-white border-r border-gray-100 flex flex-col p-3 gap-1">
        <div className="flex items-center gap-2 px-3 py-3 mb-2">
          <div className="w-2 h-2 rounded-full bg-[#5C7A5C]"></div>
          <span className="font-semibold text-gray-900 tracking-tight">Studi</span>
        </div>
        <NavItem label="Dashboard" active />
        <NavItem label="Étudiants" />
        <NavItem label="Documents" />
        <div className="px-3 pt-3 pb-1 text-[10px] font-medium text-gray-400 uppercase tracking-widest">Recrutement</div>
        <NavItem label="Entreprises" />
        <NavItem label="Offres" />
        <NavItem label="Relances" />
      </div>

      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Bonjour, Remi 👋</h1>
            <p className="text-sm text-[#5C7A5C] mt-0.5">SUP-PHOTO · Promo 2024–2025</p>
          </div>
          <LogoutButton />
        </div>

        <div className="grid grid-cols-4 gap-3 mb-5">
          <StatCard label="Étudiants" value={total.toString()} sub={`${enRecherche} en recherche`} />
          <StatCard label="Candidatures" value="0" sub="à compléter" />
          <StatCard label="Placés" value={places.toString()} sub="cette année" />
          <StatCard label="À relancer" value="0" sub="inactifs +7 jours" />
        </div>

        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-gray-900">Étudiants</h2>
          <span className="text-xs text-[#5C7A5C] cursor-pointer">Voir tous →</span>
        </div>

        <div className="bg-white border border-[#C8D8C8] rounded-xl overflow-hidden mb-4">
          {etudiants.map((e: any) => (
            <StudentRow
              key={e.id}
              initiales={`${e.prenom[0]}${e.nom[0]}`}
              nom={`${e.prenom} ${e.nom}`}
              niveau={`${e.niveau} · ${e.type_formation === 'alternance' ? 'Alternance' : 'Initial'}`}
              statut={e.statut}
              progression={e.score_progression}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function NavItem({ label, active }: { label: string; active?: boolean }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer transition-all ${active ? "bg-[#E4EDE4] text-[#3D553D] font-medium" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}>
      {label}
    </div>
  )
}

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="bg-white border border-[#C8D8C8] rounded-xl p-4">
      <div className="text-[11px] font-medium text-gray-400 mb-1.5 uppercase tracking-wide">{label}</div>
      <div className="text-2xl font-semibold tracking-tight text-gray-900">{value}</div>
      <div className="text-[11px] text-gray-400 mt-1">{sub}</div>
    </div>
  )
}

function StudentRow({ initiales, nom, niveau, statut, progression }: { initiales: string; nom: string; niveau: string; statut: string; progression: number }) {
  const statutConfig: Record<string, { label: string; bg: string; text: string }> = {
    en_preparation: { label: 'En préparation', bg: 'bg-gray-100', text: 'text-gray-600' },
    en_recherche: { label: 'En recherche', bg: 'bg-[#E4EDE4]', text: 'text-[#3D553D]' },
    place: { label: 'Placé', bg: 'bg-green-50', text: 'text-green-700' },
  }
  const config = statutConfig[statut] || statutConfig['en_preparation']
  const barColor = statut === 'place' ? 'bg-green-500' : statut === 'en_recherche' ? 'bg-[#5C7A5C]' : 'bg-gray-300'

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-[#EEF3EE] last:border-0">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${config.bg} ${config.text}`}>{initiales}</div>
      <div className="flex-1">
        <div className="text-sm font-medium text-gray-900">{nom}</div>
        <div className="text-xs text-gray-400">{niveau}</div>
      </div>
      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${config.bg} ${config.text}`}>{config.label}</span>
      <div className="flex items-center gap-2">
        <div className="w-20 h-1 bg-[#E4EDE4] rounded-full overflow-hidden">
          <div className={`h-full rounded-full ${barColor}`} style={{ width: `${progression}%` }}></div>
        </div>
        <span className="text-[11px] text-gray-400 w-7 text-right">{progression}%</span>
      </div>
    </div>
  )
}