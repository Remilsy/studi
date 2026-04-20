'use server'

import { createClient } from '../../../lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function getCandidaturesForEtudiant(etudiantId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'admin') return []
  const { data } = await supabase
    .from('candidatures')
    .select('*')
    .eq('etudiant_id', etudiantId)
    .order('date_action', { ascending: false })
  return data || []
}

export async function updateEtudiant(id: string, formData: FormData) {
  const supabase = await createClient()

  const { error } = await supabase.from('etudiants').update({
    statut:                    formData.get('statut'),
    score_progression:         parseInt(formData.get('score_progression') as string),
    notes_responsable:         formData.get('notes_responsable'),
    cv_statut:                 formData.get('cv_statut'),
    lettre_statut:             formData.get('lettre_statut'),
    nb_candidatures:           parseInt(formData.get('nb_candidatures') as string) || 0,
    nb_candidatures_attente:   parseInt(formData.get('nb_candidatures_attente') as string) || 0,
    nb_candidatures_refus:     parseInt(formData.get('nb_candidatures_refus') as string) || 0,
    nb_entretiens:             parseInt(formData.get('nb_entretiens') as string) || 0,
    nb_entreprises:            parseInt(formData.get('nb_entreprises') as string) || 0,
    prochain_entretien:        formData.get('prochain_entretien') || null,
    objectif_candidatures:     parseInt(formData.get('objectif_candidatures') as string) || 5,
  }).eq('id', id)

  if (error) return { error: 'Erreur lors de la sauvegarde' }

  revalidatePath(`/etudiants/${id}`)
  revalidatePath('/etudiants')
  return { success: true }
}
