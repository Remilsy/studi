import { createClient } from '../../../lib/supabase-server'
import { redirect } from 'next/navigation'
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
    <CandidaturesClient
      initial={candidatures || []}
      objectif={etudiant.objectif_candidatures || 5}
    />
  )
}
