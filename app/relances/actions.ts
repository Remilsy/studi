'use server'
import { createClient } from '../../lib/supabase-server'
import { revalidatePath } from 'next/cache'

export async function addRelance(etudiantId: string, message: string, type: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'admin') return { error: 'Non autorisé' }
  const { error } = await supabase.from('relances').insert({ etudiant_id: etudiantId, message, type })
  if (error) return { error: error.message }
  revalidatePath('/relances')
  return { success: true }
}

export async function deleteRelance(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'admin') return { error: 'Non autorisé' }
  await supabase.from('relances').delete().eq('id', id)
  revalidatePath('/relances')
  return { success: true }
}

export async function repondreRelance(id: string, reponse: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }
  const { error } = await supabase.from('relances').update({
    lu: true,
    reponse: reponse.trim() || null,
    reponse_at: new Date().toISOString(),
  }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/profil')
  revalidatePath('/relances')
  return { success: true }
}
