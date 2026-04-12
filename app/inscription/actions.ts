'use server'

import { createClient } from '../../lib/supabase-server'

export async function inscrire(formData: FormData) {
  const prenom = formData.get('prenom') as string
  const nom = formData.get('nom') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const niveau = formData.get('niveau') as string
  const type_formation = formData.get('type_formation') as string
  const age = parseInt(formData.get('age') as string)
  const code = formData.get('code') as string

  if (code !== process.env.SIGNUP_CODE) {
    return { error: 'Code d\'accès incorrect' }
  }

  const supabase = await createClient()

  const { data, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { role: 'etudiant' } },
  })

  if (authError) {
    if (authError.message.includes('already registered')) {
      return { error: 'Un compte existe déjà avec cet email' }
    }
    return { error: 'Une erreur est survenue, réessaie' }
  }

  if (data.user) {
    const { error: dbError } = await supabase.from('etudiants').insert([{
      prenom,
      nom,
      email,
      niveau,
      type_formation,
      age,
      statut: 'en_preparation',
      score_progression: 0,
    }])

    if (dbError) {
      return { error: 'Compte créé mais erreur lors de l\'enregistrement de ta fiche' }
    }
  }

  return { success: true }
}
