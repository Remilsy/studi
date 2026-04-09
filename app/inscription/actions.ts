'use server'

import { createClient } from '../../lib/supabase-server'

export async function inscrire(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const code = formData.get('code') as string

  if (code !== process.env.SIGNUP_CODE) {
    return { error: 'Code d\'accès incorrect' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({ email, password })

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: 'Un compte existe déjà avec cet email' }
    }
    return { error: error.message }
  }

  return { success: true }
}
