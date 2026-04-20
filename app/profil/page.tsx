import { createClient } from '../../lib/supabase-server'
import { redirect } from 'next/navigation'
import LogoutButton from '../components/LogoutButton'
import EditIdentite from './EditIdentite'
import CandidatureTracker from './CandidatureTracker'

function getStatut(statut: string) {
  const map: Record<string, { label: string; dot: string; text: string; bg: string }> = {
    en_preparation: { label: 'En préparation', dot: '#9CA3AF', text: '#6B7280', bg: '#F9FAFB' },
    en_recherche:   { label: 'En recherche',   dot: '#5C7A5C', text: '#3D553D', bg: '#E4EDE4' },
    place:          { label: 'Placé',           dot: '#16A34A', text: '#15803D', bg: '#F0FDF4' },
  }
  return map[statut] || map['en_preparation']
}

function getDocStatut(val: string | null) {
  if (val === 'depose')          return { label: 'Déposé',          color: '#15803D', bg: '#F0FDF4', dot: '#16A34A' }
  if (val === 'a_mettre_a_jour') return { label: 'À mettre à jour', color: '#C2410C', bg: '#FFF7ED', dot: '#F97316' }
  return                                { label: 'Non déposé',       color: '#9CA3AF', bg: '#F3F4F6', dot: '#D1D5DB' }
}

function getProgression(e: Record<string, unknown>) {
  let score = 0
  if (e.telephone)  score += 20
  if (e.linkedin)   score += 20
  if (e.cv_statut === 'depose')     score += 20
  if (e.lettre_statut === 'depose') score += 20
  if (e.nb_candidatures && (e.nb_candidatures as number) > 0) score += 20
  return score
}

export default async function Profil() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: etudiant }, { data: offres }] = await Promise.all([
    supabase.from('etudiants').select('*').eq('email', user.email).single(),
    supabase.from('offres').select('*').eq('active', true).order('created_at', { ascending: false }),
  ])

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

  const statut      = getStatut(etudiant.statut)
  const cvStatut    = getDocStatut(etudiant.cv_statut)
  const lmStatut    = getDocStatut(etudiant.lettre_statut)
  const progression = getProgression(etudiant)
  const initiale    = etudiant.prenom[0].toUpperCase()

  const candidatures = etudiant.nb_candidatures || 0
  const attente      = etudiant.nb_candidatures_attente || 0
  const refus        = etudiant.nb_candidatures_refus || 0
  const entretiens   = etudiant.nb_entretiens || 0
  const entreprises  = etudiant.nb_entreprises || 0
  const objectif     = etudiant.objectif_candidatures || 5
  const objectifPct  = Math.min(Math.round((candidatures / objectif) * 100), 100)


  return (
    <div className="min-h-screen bg-[#D6E6D6]">

      {/* Navbar */}
      <div className="bg-white border-b border-[#C8D8C8]">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#5C7A5C]"></div>
            <span className="font-semibold text-gray-900 text-sm tracking-tight">Studi</span>
          </div>
          <LogoutButton />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col gap-4">

        {/* ── HERO ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 bg-white rounded-2xl border border-[#C8D8C8] overflow-hidden">

          {/* Gauche — identité */}
          <div className="lg:col-span-2 bg-[#3D553D] p-8 flex flex-col gap-6">
            <div>
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-[#3D553D] mb-5"
                style={{ background: '#D6E6D6' }}
              >
                {initiale}
              </div>
              <h1 className="text-white font-bold text-2xl tracking-tight">{etudiant.prenom} {etudiant.nom}</h1>
              <p className="text-white text-sm mt-1" style={{ opacity: 0.4 }}>{etudiant.email}</p>
              <div
                className="inline-flex items-center gap-2 mt-3 px-3 py-1.5 rounded-full"
                style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
              >
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statut.dot }}></div>
                <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>{statut.label}</span>
              </div>
            </div>

            <div className="border-t border-white" style={{ borderColor: 'rgba(255,255,255,0.1)', paddingTop: '24px' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs tracking-widest" style={{ color: 'rgba(255,255,255,0.4)' }}>PROFIL COMPLÉTÉ</span>
                <span className="text-sm font-bold text-white">{progression}%</span>
              </div>
              <div className="h-1.5 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${progression}%`, backgroundColor: 'rgba(255,255,255,0.6)' }}
                ></div>
              </div>
              <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
                {progression < 100 ? 'Complète ton profil pour maximiser tes chances' : 'Profil complet !'}
              </p>
            </div>
          </div>

          {/* Droite — stats */}
          <div className="lg:col-span-3 p-8 flex flex-col justify-between gap-6">
            <div>
              <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase mb-6">Vue d'ensemble</p>
              <div className="grid grid-cols-3 gap-6">
                {[
                  { label: 'Candidatures', value: candidatures, sub: `objectif : ${objectif}`,             color: '#3D553D' },
                  { label: 'Entretiens',   value: entretiens,   sub: etudiant.prochain_entretien ? new Date(etudiant.prochain_entretien).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : 'Aucun planifié', color: '#1D4ED8' },
                  { label: 'Entreprises',  value: entreprises,  sub: 'contactées',                         color: '#6D28D9' },
                ].map(({ label, value, sub, color }) => (
                  <div key={label}>
                    <p className="text-5xl font-bold tracking-tight" style={{ color }}>{value}</p>
                    <p className="text-sm font-semibold text-gray-800 mt-1">{label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-[#F3F4F6] pt-5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-gray-700">Objectif de la semaine</span>
                <span className="text-xs text-gray-400">{candidatures} / {objectif} candidatures</span>
              </div>
              <div className="h-2 bg-[#E4EDE4] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#5C7A5C] rounded-full"
                  style={{ width: `${objectifPct}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* ── LIGNE 2 : tracker + infos ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* Tracker interactif — colonne principale */}
          <div className="lg:col-span-3">
            <CandidatureTracker
              initial={{
                nb_candidatures:         candidatures,
                nb_candidatures_attente: attente,
                nb_candidatures_refus:   refus,
                nb_entretiens:           entretiens,
                nb_entreprises:          entreprises,
                prochain_entretien:      etudiant.prochain_entretien,
                objectif_candidatures:   objectif,
              }}
            />
          </div>

          {/* Colonne droite : documents + identité + note */}
          <div className="lg:col-span-2 flex flex-col gap-4">

            {/* Documents */}
            <div className="bg-white rounded-2xl border border-[#C8D8C8] p-6">
              <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase mb-4">Documents</p>
              <div className="flex flex-col gap-3">
                {[
                  { label: 'Curriculum Vitae',     s: cvStatut },
                  { label: 'Lettre de motivation', s: lmStatut },
                ].map(({ label, s }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between p-4 rounded-xl"
                    style={{ backgroundColor: s.bg }}
                  >
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.dot }}></div>
                      <span className="text-xs font-semibold" style={{ color: s.color }}>{s.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Identité */}
            <div className="bg-white rounded-2xl border border-[#C8D8C8] p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase">Identité</p>
                <EditIdentite telephone={etudiant.telephone} linkedin={etudiant.linkedin} />
              </div>
              <div className="flex flex-col">
                {[
                  { label: 'Section',   value: etudiant.niveau },
                  { label: 'Formation', value: etudiant.type_formation === 'alternance' ? 'Alternance' : 'Initial' },
                  { label: 'Âge',       value: `${etudiant.age} ans` },
                  { label: 'Tél.',      value: etudiant.telephone || null },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center justify-between py-2.5 border-b border-[#F3F4F6] last:border-0">
                    <span className="text-xs text-gray-400">{label}</span>
                    <span className={`text-sm font-semibold ${value ? 'text-gray-900' : 'text-gray-300'}`}>
                      {value || '—'}
                    </span>
                  </div>
                ))}
                <div className="flex items-center justify-between py-2.5">
                  <span className="text-xs text-gray-400">LinkedIn</span>
                  {etudiant.linkedin ? (
                    <a href={etudiant.linkedin} target="_blank" rel="noopener noreferrer"
                      className="text-sm font-semibold text-[#5C7A5C]">
                      Voir le profil
                    </a>
                  ) : (
                    <span className="text-sm font-semibold text-gray-300">—</span>
                  )}
                </div>
              </div>
            </div>

            {/* Note responsable */}
            <div className="bg-white rounded-2xl border border-[#C8D8C8] p-6">
              <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase mb-3">Note de ton responsable</p>
              {etudiant.notes_responsable ? (
                <p className="text-sm text-gray-700 leading-relaxed">{etudiant.notes_responsable}</p>
              ) : (
                <p className="text-sm text-gray-300 italic">Aucune note pour l'instant.</p>
              )}
            </div>

            {/* Offres */}
            <div className="bg-white rounded-2xl border border-[#C8D8C8] p-6">
              <p className="text-xs font-semibold text-gray-400 tracking-widest uppercase mb-4">Offres d'emploi</p>
              {!offres || offres.length === 0 ? (
                <p className="text-sm text-gray-300 italic">Aucune offre disponible.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {offres.map((offre: any) => (
                    <div key={offre.id} className="p-3 rounded-xl bg-[#F8FAF8] border border-[#EEF3EE]">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{offre.titre}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{offre.entreprise}{offre.localisation ? ` · ${offre.localisation}` : ''}</p>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#E4EDE4] text-[#3D553D] shrink-0">
                          {offre.type_contrat.toUpperCase()}
                        </span>
                      </div>
                      {offre.description && (
                        <p className="text-xs text-gray-400 mt-2 leading-relaxed line-clamp-2">{offre.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
