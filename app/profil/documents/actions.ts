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

  // Recalcule score_progression
  const { data: e } = await supabase
    .from('etudiants')
    .select('telephone, linkedin, nb_candidatures')
    .eq('email', user.email)
    .single()
  if (e) {
    let score = 0
    if (e.telephone) score += 20
    if (e.linkedin)  score += 20
    if (data.cv_statut     === 'depose') score += 20
    if (data.lettre_statut === 'depose') score += 20
    if ((e.nb_candidatures || 0) > 0)    score += 20
    await supabase.from('etudiants').update({ score_progression: score }).eq('email', user.email)
  }

  revalidatePath('/profil')
  revalidatePath('/profil/documents')
  revalidatePath('/documents')
  return { success: true }
}
