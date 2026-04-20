import { createClient } from '../../../lib/supabase-server'
import { redirect } from 'next/navigation'
import LogoutButton from '../../components/LogoutButton'
import CandidaturesClient from './CandidaturesClient'

export default async function CandidaturesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: etudiant }, { data: candidatures }] = await Promise.all([
    supabase.from('etudiants').select('id, objectif_candidatures').eq('email', user.email).single(),
    supabase.from('candidatures').select('*').order('created_at', { ascending: false }),
  ])

  if (!etudiant) redirect('/profil')

  return (
    <div>
      <div className="bg-white border-b border-[#C8D8C8] fixed top-0 left-0 right-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[#5C7A5C]"></div>
            <span className="font-semibold text-gray-900 text-sm">Studi</span>
          </div>
          <LogoutButton />
        </div>
      </div>
      <div className="pt-14">
        <CandidaturesClient
          initial={candidatures || []}
          objectif={etudiant.objectif_candidatures || 5}
        />
      </div>
    </div>
  )
}
