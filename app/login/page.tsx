'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError('Email ou mot de passe incorrect')
      setLoading(false)
    } else {
      window.location.href = '/'
    }
  }

  return (
    <div className="min-h-screen bg-[#D6E6D6] flex items-center justify-center">
      <div className="bg-white rounded-2xl border border-[#C8D8C8] p-8 w-full max-w-sm">

        <div className="flex items-center gap-2 mb-8">
          <div className="w-2 h-2 rounded-full bg-[#5C7A5C]"></div>
          <span className="font-semibold text-gray-900 tracking-tight">Studi</span>
        </div>

        <h1 className="text-xl font-semibold text-gray-900 tracking-tight mb-1">Connexion</h1>
        <p className="text-sm text-gray-400 mb-6">SUP-PHOTO · Espace de suivi</p>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ton@email.fr"
              required
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 outline-none focus:border-[#5C7A5C] transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 outline-none focus:border-[#5C7A5C] transition-colors"
            />
          </div>

          {error && (
            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#5C7A5C] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#4A6A4A] transition-colors disabled:opacity-50"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-4">
          Pas encore de compte ?{' '}
          <Link href="/inscription" className="text-[#5C7A5C] hover:underline">
            Créer mon espace
          </Link>
        </p>
      </div>
    </div>
  )
}