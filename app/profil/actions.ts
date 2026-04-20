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

  revalidatePath('/profil')
  return { success: true }
}
