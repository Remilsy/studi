'use server'

import { createClient } from '../../lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function updateProfil(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  const { error } = await supabase.from('etudiants').update({
    telephone: formData.get('telephone') || null,
    linkedin:  formData.get('linkedin')  || null,
  }).eq('email', user.email)

  if (error) return { error: 'Erreur lors de la sauvegarde' }

  // Recalcule score_progression
  const { data: e } = await supabase
    .from('etudiants')
    .select('cv_statut, lettre_statut, nb_candidatures')
    .eq('email', user.email)
    .single()
  if (e) {
    let score = 0
    if (formData.get('telephone')) score += 20
    if (formData.get('linkedin'))  score += 20
    if (e.cv_statut     === 'depose') score += 20
    if (e.lettre_statut === 'depose') score += 20
    if ((e.nb_candidatures || 0) > 0) score += 20
    await supabase.from('etudiants').update({ score_progression: score }).eq('email', user.email)
  }

  revalidatePath('/profil')
  return { success: true }
}

export async function updateCandidatureStats(stats: {
  nb_candidatures: number
  nb_candidatures_attente: number
  nb_candidatures_refus: number
  nb_entretiens: number
  nb_entreprises: number
  prochain_entretien: string | null
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  const { error } = await supabase.from('etudiants').update(stats).eq('email', user.email)

  if (error) return { error: 'Erreur lors de la sauvegarde' }

  revalidatePath('/profil')
  return { success: true }
}
