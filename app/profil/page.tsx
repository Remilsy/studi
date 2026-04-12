import { createClient } from '../../lib/supabase-server'
import { redirect } from 'next/navigation'
import LogoutButton from '../components/LogoutButton'

function getStatut(statut: string) {
  const map: Record<string, { label: string; dot: string; text: string; bg: string }> = {
    en_preparation: { label: 'En préparation', dot: '#9CA3AF', text: '#374151', bg: '#F3F4F6' },
    en_recherche:   { label: 'En recherche',   dot: '#5C7A5C', text: '#3D553D', bg: '#E4EDE4' },
    place:          { label: 'Placé',           dot: '#16A34A', text: '#15803D', bg: '#F0FDF4' },
  }
  return map[statut] || map['en_preparation']
}

function getDocStatut(val: string | null) {
  if (val === 'depose')          return { label: 'Déposé',            color: 'text-green-600',  bg: 'bg-green-50',  dot: '#16A34A' }
  if (val === 'a_mettre_a_jour') return { label: 'À mettre à jour',   color: 'text-orange-500', bg: 'bg-orange-50', dot: '#F97316' }
  return                                { label: 'Non déposé',         color: 'text-gray-400',   bg: 'bg-gray-50',   dot: '#D1D5DB' }
}

function getProgression(e: Record<string, unknown>) {
  let score = 0
  if (e.telephone)                                score += 20
  if (e.linkedin)                                 score += 20
  if (e.cv_statut === 'depose')                   score += 20
  if (e.lettre_statut === 'depose')               score += 20
  if (e.nb_candidatures && (e.nb_candidatures as number) > 0) score += 20
  return score
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
      <div className="min-h-screen bg-[#D6E6D6] flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-[#C8D8C8] p-8 text-center max-w-sm w-full">
          <h2 className="text-base font-semibold text-gray-900 mb-1">Aucune fiche trouvée</h2>
          <p className="text-sm text-gray-400">Contacte ton responsable.</p>
        </div>
      </div>
    )
  }

  const statut    = getStatut(etudiant.statut)
  const cvStatut  = getDocStatut(etudiant.cv_statut)
  const lmStatut  = getDocStatut(etudiant.lettre_statut)
  const progression = getProgression(etudiant)
  const initiale  = etudiant.prenom[0].toUpperCase()

  const candidatures = etudiant.nb_candidatures || 0
  const attente      = etudiant.nb_candidatures_attente || 0
  const refus        = etudiant.nb_candidatures_refus || 0
  const entretiens   = etudiant.nb_entretiens || 0
  const entreprises  = etudiant.nb_entreprises || 0
  const objectif     = etudiant.objectif_candidatures || 5
  const objectifPct  = Math.min(Math.round((candidatures / objectif) * 100), 100)

  const prochainEntretien = etudiant.prochain_entretien
    ? new Date(etudiant.prochain_entretien).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  return (
    <div className="min-h-screen bg-[#D6E6D6]">

      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-6 pb-3 max-w-sm mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#5C7A5C]"></div>
          <span className="font-semibold text-[#3D553D] text-sm tracking-tight">Studi</span>
        </div>
        <LogoutButton />
      </div>

      <div className="px-4 pb-10 max-w-sm mx-auto flex flex-col gap-3">

        {/* Hero */}
        <div className="bg-[#3D553D] rounded-2xl px-5 py-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-white/15 flex items-center justify-center text-2xl font-bold text-white shrink-0">
              {initiale}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-white font-bold text-base leading-tight">{etudiant.prenom} {etudiant.nom}</h1>
              <p className="text-white/50 text-xs mt-0.5 truncate">{etudiant.email}</p>
              <div className="flex items-center gap-1.5 mt-2">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statut.dot }}></div>
                <span className="text-white/70 text-xs">{statut.label}</span>
              </div>
            </div>
            <div
              className="text-right shrink-0"
            >
              <p className="text-white/50 text-[10px] mb-0.5">Profil</p>
              <p className="text-white font-bold text-xl">{progression}%</p>
            </div>
          </div>

          {/* Barre de complétion profil */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-white/50 text-[10px]">Complétion du profil</span>
              <span className="text-white/70 text-[10px]">{progression}/100%</span>
            </div>
            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-white/70 rounded-full transition-all"
                style={{ width: `${progression}%` }}
              ></div>
            </div>
            <p className="text-white/30 text-[10px] mt-1">
              {progression < 100 ? 'Complète ton profil pour maximiser tes chances' : 'Profil complet !'}
            </p>
          </div>
        </div>

        {/* Candidatures stats */}
        <div className="bg-white rounded-2xl border border-[#C8D8C8] p-5">
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mb-3">Candidatures</p>

          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{candidatures}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Envoyées</p>
            </div>
            <div className="text-center border-x border-gray-100">
              <p className="text-2xl font-bold text-orange-500">{attente}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">En attente</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-400">{refus}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">Refus</p>
            </div>
          </div>

          {/* Objectif semaine */}
          <div className="bg-[#F8FAF8] rounded-xl p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-600 font-medium">Objectif semaine</span>
              <span className="text-xs font-bold text-gray-900">{candidatures} / {objectif}</span>
            </div>
            <div className="h-2 bg-[#E4EDE4] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#5C7A5C] rounded-full transition-all"
                style={{ width: `${objectifPct}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Entretiens & Entreprises */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl border border-[#C8D8C8] p-4">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mb-2">Entretiens</p>
            <p className="text-3xl font-bold text-gray-900">{entretiens}</p>
            {prochainEntretien && (
              <p className="text-[10px] text-[#5C7A5C] mt-1.5 font-medium">Prochain : {prochainEntretien}</p>
            )}
            {!prochainEntretien && (
              <p className="text-[10px] text-gray-300 mt-1.5">Aucun planifié</p>
            )}
          </div>
          <div className="bg-white rounded-2xl border border-[#C8D8C8] p-4">
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mb-2">Entreprises</p>
            <p className="text-3xl font-bold text-gray-900">{entreprises}</p>
            <p className="text-[10px] text-gray-300 mt-1.5">contactées</p>
          </div>
        </div>

        {/* Documents */}
        <div className="bg-white rounded-2xl border border-[#C8D8C8] p-5">
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mb-3">Documents</p>
          <div className="flex flex-col gap-2">
            {[
              { label: 'Curriculum Vitae', s: cvStatut },
              { label: 'Lettre de motivation', s: lmStatut },
            ].map(({ label, s }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-700">{label}</span>
                <div
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${s.bg} ${s.color}`}
                >
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.dot }}></div>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Identité */}
        <div className="bg-white rounded-2xl border border-[#C8D8C8] p-5">
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mb-3">Identité</p>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-xs text-gray-400">Section</span>
              <span className="text-sm font-medium text-gray-900">{etudiant.niveau}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-xs text-gray-400">Formation</span>
              <span className="text-sm font-medium text-gray-900">{etudiant.type_formation === 'alternance' ? 'Alternance' : 'Initial'}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-xs text-gray-400">Âge</span>
              <span className="text-sm font-medium text-gray-900">{etudiant.age} ans</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-50">
              <span className="text-xs text-gray-400">Téléphone</span>
              <span className={`text-sm font-medium ${etudiant.telephone ? 'text-gray-900' : 'text-gray-300'}`}>
                {etudiant.telephone || 'Non renseigné'}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-xs text-gray-400">LinkedIn</span>
              {etudiant.linkedin ? (
                <a href={etudiant.linkedin} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-[#5C7A5C] underline truncate max-w-[160px]">
                  Voir le profil
                </a>
              ) : (
                <span className="text-sm font-medium text-gray-300">Non renseigné</span>
              )}
            </div>
          </div>
        </div>

        {/* Notes du responsable */}
        <div className="bg-white rounded-2xl border border-[#C8D8C8] p-5">
          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mb-2">Note de ton responsable</p>
          {etudiant.notes_responsable ? (
            <p className="text-sm text-gray-700 leading-relaxed">{etudiant.notes_responsable}</p>
          ) : (
            <p className="text-sm text-gray-300 italic">Aucune note pour l'instant.</p>
          )}
        </div>

        {/* Offres bientôt */}
        <div className="bg-white rounded-2xl border border-[#C8D8C8] px-5 py-4 flex items-center justify-between opacity-50">
          <div>
            <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest mb-1">Offres d'emploi</p>
            <p className="text-sm font-semibold text-gray-500">Bientôt disponible</p>
          </div>
          <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-gray-400 font-bold text-xs">
            Soon
          </div>
        </div>

      </div>
    </div>
  )
}
