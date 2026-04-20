'use server'
import { createClient } from '../../../lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function updateDocuments(data: {
  cv_statut: string
  lettre_statut: string
  cv_url: string | null
  lettre_url: string | null
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  const { error } = await supabase.from('etudiants').update(data).eq('email', user.email)
  if (error) return { error: error.message }

  revalidatePath('/profil')
  revalidatePath('/profil/documents')
  return { success: true }
}
