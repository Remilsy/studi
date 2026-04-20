import { createClient } from '../../lib/supabase-server'
import { redirect } from 'next/navigation'
import AdminSidebar from '../components/AdminSidebar'

const STATUTS = [
  { key: 'envoye',     label: 'Envoyée',    color: '#3D553D', bg: '#E4EDE4', dot: '#5C7A5C' },
  { key: 'en_attente', label: 'Attente',    color: '#C2410C', bg: '#FFF7ED', dot: '#F97316' },
  { key: 'entretien',  label: 'Entretien',  color: '#1D4ED8', bg: '#EFF6FF', dot: '#3B82F6' },
  { key: 'refus',      label: 'Refus',      color: '#9F1239', bg: '#FFF1F2', dot: '#F43F5E' },
  { key: 'accepte',    label: 'Acceptée',   color: '#15803D', bg: '#F0FDF4', dot: '#16A34A' },
]

export default async function EntreprisesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'admin') redirect('/login')

  const [{ data: candidatures }, { data: etudiants }] = await Promise.all([
    supabase.from('candidatures').select('id, entreprise, poste, statut, etudiant_id, date_action'),
    supabase.from('etudiants').select('id, prenom, nom'),
  ])

  const cands = candidatures || []
  const etudMap = Object.fromEntries((etudiants || []).map(e => [e.id, e]))

  // Grouper par entreprise
  const map: Record<string, { nom: string; cands: typeof cands }> = {}
  for (const c of cands) {
    const key = c.entreprise.trim().toLowerCase()
    if (!map[key]) map[key] = { nom: c.entreprise.trim(), cands: [] }
    map[key].cands.push(c)
  }

  const entreprises = Object.values(map).sort((a, b) => b.cands.length - a.cands.length)

  const bestStatut = (cands: typeof candidatures) => {
    if (!cands) return null
    const order = ['accepte', 'entretien', 'en_attente', 'envoye', 'refus']
    for (const s of order) {
      if (cands.some(c => c.statut === s)) return s
    }
    return null
  }

  return (
    <div className="min-h-screen bg-[#D6E6D6] flex">
      <AdminSidebar />
      <div className="flex-1 p-6">

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Entreprises</h1>
            <p className="text-sm text-[#5C7A5C] mt-0.5">{entreprises.length} entreprises contactées</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {STATUTS.map(s => {
            const count = cands.filter(c => c.statut === s.key).length
            return (
              <div key={s.key} className="bg-white rounded-2xl border border-[#C8D8C8] p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.dot }}></div>
                  <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: s.color }}>{s.label}</p>
                </div>
                <p className="text-2xl font-black" style={{ color: s.color }}>{count}</p>
              </div>
            )
          })}
        </div>

        {/* Liste entreprises */}
        {entreprises.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#C8D8C8] p-16 text-center">
            <p className="text-2xl mb-3">🏢</p>
            <p className="text-sm text-gray-400">Aucune candidature enregistrée par les étudiants.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {entreprises.map(({ nom, cands: ec }) => {
              const best = bestStatut(ec)
              const bs = STATUTS.find(s => s.key === best)
              const students = [...new Set(ec.map(c => c.etudiant_id))]
              const acceptees = ec.filter(c => c.statut === 'accepte').length
              const entretiens = ec.filter(c => c.statut === 'entretien').length

              return (
                <div key={nom} className="bg-white rounded-2xl border border-[#C8D8C8] p-5"
                  style={{ borderLeftWidth: '3px', borderLeftColor: bs?.dot || '#E5E7EB' }}>
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black"
                        style={{ backgroundColor: bs?.bg || '#F3F4F6', color: bs?.color || '#9CA3AF' }}>
                        {nom[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-base font-bold text-gray-900">{nom}</p>
                        <p className="text-xs text-gray-400">
                          {ec.length} candidature{ec.length > 1 ? 's' : ''} · {students.length} étudiant{students.length > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {acceptees > 0 && (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#F0FDF4] text-[#15803D]">
                          ✓ {acceptees} acceptée{acceptees > 1 ? 's' : ''}
                        </span>
                      )}
                      {entretiens > 0 && (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-[#EFF6FF] text-[#1D4ED8]">
                          {entretiens} entretien{entretiens > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Postes + statuts */}
                  <div className="mt-4 flex flex-wrap gap-2">
                    {ec.map(c => {
                      const s = STATUTS.find(st => st.key === c.statut) || STATUTS[0]
                      const etudiant = etudMap[c.etudiant_id]
                      return (
                        <div key={c.id} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs"
                          style={{ backgroundColor: s.bg, borderColor: s.dot + '40' }}>
                          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.dot }}></div>
                          <span className="font-medium" style={{ color: s.color }}>{c.poste}</span>
                          {etudiant && (
                            <span className="text-gray-400 font-normal">— {etudiant.prenom} {etudiant.nom}</span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
