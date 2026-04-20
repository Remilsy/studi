import { createClient } from '../../../lib/supabase-server'
import { redirect } from 'next/navigation'
import DocumentsClient from './DocumentsClient'

export default async function DocumentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: etudiant } = await supabase
    .from('etudiants')
    .select('cv_statut, lettre_statut, cv_url, lettre_url')
    .eq('email', user.email)
    .single()

  if (!etudiant) redirect('/profil')

  return (
    <DocumentsClient
      cvStatut={etudiant.cv_statut || 'a_deposer'}
      lettreStatut={etudiant.lettre_statut || 'a_deposer'}
      cvUrl={etudiant.cv_url}
      lettreUrl={etudiant.lettre_url}
    />
  )
}
