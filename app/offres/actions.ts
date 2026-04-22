'use server'

import { createClient } from '../../lib/supabase-server'
import { requireAdmin } from '../../lib/auth'
import { revalidatePath } from 'next/cache'

export async function createOffre(formData: FormData) {
  try { await requireAdmin() } catch { return { error: 'Non autorisé' } }

  const supabase = await createClient()
  const { error } = await supabase.from('offres').insert([{
    titre:        formData.get('titre'),
    entreprise:   formData.get('entreprise'),
    description:  formData.get('description'),
    type_contrat: formData.get('type_contrat'),
    niveau:       formData.get('niveau'),
    localisation: formData.get('localisation'),
    active:       true,
  }])

  if (error) return { error: 'Erreur lors de la création' }
  revalidatePath('/offres')
  return { success: true }
}

export async function toggleOffre(id: string, active: boolean) {
  try { await requireAdmin() } catch { return }

  const supabase = await createClient()
  await supabase.from('offres').update({ active }).eq('id', id)
  revalidatePath('/offres')
}

export async function deleteOffre(id: string) {
  try { await requireAdmin() } catch { return }

  const supabase = await createClient()
  await supabase.from('offres').delete().eq('id', id)
  revalidatePath('/offres')
}
