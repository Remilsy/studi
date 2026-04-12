import { createClient } from '../../lib/supabase-server'
import { redirect } from 'next/navigation'
import LogoutButton from '../components/LogoutButton'

export default async function Profil() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: etudiant } = await supabase
    .from('etudiants')
    .select('*')
    .eq('email', user.email)
    .single()

  const statutConfig: Record<string, { label: string; bg: string; text: string }> = {
    en_preparation: { label: 'En préparation', bg: 'bg-gray-100', text: 'text-gray-600' },
    en_recherche: { label: 'En recherche', bg: 'bg-[#E4EDE4]', text: 'text-[#3D553D]' },
    place: { label: 'Placé', bg: 'bg-green-50', text: 'text-green-700' },
  }
  const statut = etudiant ? (statutConfig[etudiant.statut] || statutConfig['en_preparation']) : null

  return (
    <div className="min-h-screen bg-[#D6E6D6] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-[#C8D8C8] w-full max-w-sm overflow-hidden">

        {/* Header */}
        <div className="bg-[#E4EDE4] px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#5C7A5C]"></div>
            <span className="font-semibold text-gray-900 tracking-tight">Studi</span>
          </div>
          <LogoutButton />
        </div>

        {etudiant ? (
          <div className="p-6">
            {/* Avatar + nom */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-[#E4EDE4] flex items-center justify-center text-lg font-semibold text-[#3D553D]">
                {etudiant.prenom[0]}{etudiant.nom[0]}
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">{etudiant.prenom} {etudiant.nom}</h1>
                <p className="text-sm text-gray-400">{etudiant.email}</p>
              </div>
            </div>

            {/* Infos */}
            <div className="flex flex-col gap-3 mb-6">
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-xs text-gray-400 font-medium">Section</span>
                <span className="text-sm text-gray-900">{etudiant.niveau}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-xs text-gray-400 font-medium">Formation</span>
                <span className="text-sm text-gray-900">{etudiant.type_formation === 'alternance' ? 'Alternance' : 'Initial'}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-50">
                <span className="text-xs text-gray-400 font-medium">Âge</span>
                <span className="text-sm text-gray-900">{etudiant.age} ans</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-xs text-gray-400 font-medium">Statut</span>
                {statut && (
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statut.bg} ${statut.text}`}>
                    {statut.label}
                  </span>
                )}
              </div>
            </div>

            {/* Progression */}
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs text-gray-400 font-medium">Progression</span>
              <span className="text-xs text-gray-900 font-medium">{etudiant.score_progression}%</span>
            </div>
            <div className="w-full h-2 bg-[#E4EDE4] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#5C7A5C] rounded-full transition-all"
                style={{ width: `${etudiant.score_progression}%` }}
              ></div>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-sm text-gray-400">
            Aucune fiche trouvée pour ton compte.
          </div>
        )}
      </div>
    </div>
  )
}
