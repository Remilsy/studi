'use server'

import { createClient } from '../../lib/supabase-server'
import { revalidatePath } from 'next/cache'

async function syncStats(supabase: any, etudiantId: string, userEmail: string) {
  const { data: cands } = await supabase
    .from('candidatures')
    .select('statut, entreprise')
    .eq('etudiant_id', etudiantId)

  if (!cands) return

  await supabase.from('etudiants').update({
    nb_candidatures:         cands.length,
    nb_candidatures_attente: cands.filter((c: any) => c.statut === 'en_attente').length,
    nb_candidatures_refus:   cands.filter((c: any) => c.statut === 'refus').length,
    nb_entretiens:           cands.filter((c: any) => c.statut === 'entretien' || c.statut === 'accepte').length,
    nb_entreprises:          new Set(cands.map((c: any) => c.entreprise.trim().toLowerCase())).size,
  }).eq('email', userEmail)
}

export async function addCandidature(data: {
  entreprise: string
  poste: string
  statut: string
  date_action: string
  notes?: string
  url?: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  const { data: etudiant } = await supabase.from('etudiants').select('id').eq('email', user.email).single()
  if (!etudiant) return { error: 'Étudiant introuvable' }

  const { error } = await supabase.from('candidatures').insert({
    etudiant_id: etudiant.id,
    entreprise:  data.entreprise,
    poste:       data.poste,
    statut:      data.statut,
    date_action: data.date_action,
    notes:       data.notes || null,
    url:         data.url || null,
  })
  if (error) return { error: error.message }

  await syncStats(supabase, etudiant.id, user.email!)
  revalidatePath('/profil')
  return { success: true }
}

export async function updateCandidatureStatut(id: string, statut: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  const { data: etudiant } = await supabase.from('etudiants').select('id').eq('email', user.email).single()
  if (!etudiant) return { error: 'Étudiant introuvable' }

  await supabase.from('candidatures').update({ statut }).eq('id', id)
  await syncStats(supabase, etudiant.id, user.email!)
  revalidatePath('/profil')
  revalidatePath('/profil/candidatures')
  return { success: true }
}

export async function updateCandidature(id: string, data: {
  entreprise: string
  poste: string
  statut: string
  date_action: string
  notes: string | null
  url: string | null
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  const { data: etudiant } = await supabase.from('etudiants').select('id').eq('email', user.email).single()
  if (!etudiant) return { error: 'Étudiant introuvable' }

  const { error } = await supabase.from('candidatures').update(data).eq('id', id)
  if (error) return { error: error.message }

  await syncStats(supabase, etudiant.id, user.email!)
  revalidatePath('/profil')
  revalidatePath('/profil/candidatures')
  return { success: true }
}

export async function deleteCandidature(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Non connecté' }

  const { data: etudiant } = await supabase.from('etudiants').select('id').eq('email', user.email).single()
  if (!etudiant) return { error: 'Étudiant introuvable' }

  await supabase.from('candidatures').delete().eq('id', id)
  await syncStats(supabase, etudiant.id, user.email!)
  revalidatePath('/profil')
  return { success: true }
}
