import { createClient } from '../../lib/supabase-server'
import { redirect } from 'next/navigation'
import LogoutButton from '../components/LogoutButton'

function getLevel(score: number) {
  if (score >= 80) return { label: 'Expert', icon: '🏆', color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' }
  if (score >= 60) return { label: 'Avancé', icon: '⚡', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' }
  if (score >= 40) return { label: 'Intermédiaire', icon: '🎯', color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' }
  if (score >= 20) return { label: 'En progression', icon: '🌱', color: 'text-[#5C7A5C]', bg: 'bg-[#E4EDE4]', border: 'border-[#C8D8C8]' }
  return { label: 'Débutant', icon: '✨', color: 'text-gray-500', bg: 'bg-gray-50', border: 'border-gray-200' }
}

function getStatutConfig(statut: string) {
  const config: Record<string, { label: string; bg: string; text: string; dot: string }> = {
    en_preparation: { label: 'En préparation', bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
    en_recherche: { label: 'En recherche', bg: 'bg-[#E4EDE4]', text: 'text-[#3D553D]', dot: 'bg-[#5C7A5C]' },
    place: { label: 'Placé ✓', bg: 'bg-green-50', text: 'text-green-700', dot: 'bg-green-500' },
  }
  return config[statut] || config['en_preparation']
}

export default async function Profil() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: etudiant } = await supabase
    .from('etudiants')
    .select('*')
    .eq('email', user.email)
    .single()

  if (!etudiant) {
    return (
      <div className="min-h-screen bg-[#D6E6D6] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl border border-[#C8D8C8] p-8 text-center max-w-sm w-full">
          <div className="text-4xl mb-3">🔍</div>
          <h2 className="text-base font-semibold text-gray-900 mb-1">Aucune fiche trouvée</h2>
          <p className="text-sm text-gray-400">Contacte ton responsable pour créer ton profil.</p>
        </div>
      </div>
    )
  }

  const level = getLevel(etudiant.score_progression)
  const statut = getStatutConfig(etudiant.statut)
  const initiales = `${etudiant.prenom[0]}${etudiant.nom[0]}`

  return (
    <div className="min-h-screen bg-[#D6E6D6] p-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-sm flex flex-col gap-3">

        {/* Header nav */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#5C7A5C]"></div>
            <span className="font-semibold text-[#3D553D] tracking-tight text-sm">Studi</span>
          </div>
          <LogoutButton />
        </div>

        {/* Card principale — Avatar + niveau */}
        <div className="bg-white rounded-2xl border border-[#C8D8C8] overflow-hidden">
          <div className="bg-gradient-to-br from-[#5C7A5C] to-[#3D553D] px-6 pt-8 pb-10 text-center relative">
            <div className="w-20 h-20 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-2xl font-bold text-white mx-auto mb-3">
              {initiales}
            </div>
            <h1 className="text-white font-semibold text-lg tracking-tight">{etudiant.prenom} {etudiant.nom}</h1>
            <p className="text-white/60 text-xs mt-0.5">{etudiant.email}</p>
          </div>

          {/* Badge niveau chevauchant */}
          <div className="flex justify-center -mt-4 mb-4">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold shadow-sm bg-white ${level.border}`}>
              <span>{level.icon}</span>
              <span className={level.color}>{level.label}</span>
            </div>
          </div>

          {/* Progression XP */}
          <div className="px-6 pb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-gray-400">Progression</span>
              <span className="text-xs font-bold text-gray-900">{etudiant.score_progression} <span className="text-gray-400 font-normal">/ 100 XP</span></span>
            </div>
            <div className="w-full h-3 bg-[#E4EDE4] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#5C7A5C] to-[#7A9A7A] rounded-full transition-all duration-700"
                style={{ width: `${etudiant.score_progression}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Statut */}
        <div className="bg-white rounded-2xl border border-[#C8D8C8] px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-0.5">Statut actuel</p>
            <p className="text-sm font-semibold text-gray-900">{statut.label}</p>
          </div>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${statut.bg}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${statut.dot}`}></div>
            <span className={`text-xs font-medium ${statut.text}`}>{statut.label}</span>
          </div>
        </div>

        {/* Infos */}
        <div className="bg-white rounded-2xl border border-[#C8D8C8] px-5 py-4 flex flex-col gap-3">
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest">Informations</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#F8FAF8] rounded-xl p-3">
              <p className="text-[10px] text-gray-400 mb-1">Section</p>
              <p className="text-sm font-semibold text-gray-900">{etudiant.niveau}</p>
            </div>
            <div className="bg-[#F8FAF8] rounded-xl p-3">
              <p className="text-[10px] text-gray-400 mb-1">Formation</p>
              <p className="text-sm font-semibold text-gray-900">{etudiant.type_formation === 'alternance' ? 'Alternance' : 'Initial'}</p>
            </div>
            <div className="bg-[#F8FAF8] rounded-xl p-3">
              <p className="text-[10px] text-gray-400 mb-1">Âge</p>
              <p className="text-sm font-semibold text-gray-900">{etudiant.age} ans</p>
            </div>
            <div className="bg-[#F8FAF8] rounded-xl p-3">
              <p className="text-[10px] text-gray-400 mb-1">XP</p>
              <p className="text-sm font-semibold text-gray-900">{etudiant.score_progression} pts</p>
            </div>
          </div>
        </div>

        {/* Section offres — à venir */}
        <div className="bg-white rounded-2xl border border-[#C8D8C8] px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-medium text-gray-400 uppercase tracking-widest mb-0.5">Offres</p>
              <p className="text-sm font-semibold text-gray-900">Bientôt disponible</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#E4EDE4] flex items-center justify-center text-sm">
              🔒
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
