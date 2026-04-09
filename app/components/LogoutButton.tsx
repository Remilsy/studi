'use client'

import { supabase } from '../../lib/supabase'

export default function LogoutButton() {
  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <button
      onClick={handleLogout}
      className="w-8 h-8 rounded-full bg-[#5C7A5C] flex items-center justify-center text-white text-xs font-medium hover:bg-[#4A6A4A] transition-colors"
      title="Se déconnecter"
    >
      R
    </button>
  )
}