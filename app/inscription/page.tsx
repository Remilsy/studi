'use client'

import { useState } from 'react'
import Link from 'next/link'
import { inscrire } from './actions'

export default function Inscription() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const formData = new FormData(e.currentTarget)
    const result = await inscrire(formData)

    if (result.error) {
      setError(result.error)
      setLoading(false)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#D6E6D6] flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-[#C8D8C8] p-8 w-full max-w-sm text-center">
          <div className="flex items-center gap-2 mb-8 justify-center">
            <div className="w-2 h-2 rounded-full bg-[#5C7A5C]"></div>
            <span className="font-semibold text-gray-900 tracking-tight">Studi</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#E4EDE4] flex items-center justify-center mx-auto mb-4">
            <svg className="w-5 h-5 text-[#5C7A5C]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold text-gray-900 mb-2">Compte créé !</h1>
          <p className="text-sm text-gray-400 mb-6">Tu peux maintenant te connecter.</p>
          <Link href="/login" className="block w-full bg-[#5C7A5C] text-white py-2.5 rounded-lg text-sm font-medium hover:bg-[#4A6A4A] transition-colors text-center">
            Se connecter
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#D6E6D6] flex items-center justify-center">
      <div className="bg-white rounded-2xl border border-[#C8D8C8] p-8 w-full max-w-sm">

        <div className="flex items-center gap-2 mb-8">
          <div className="w-2 h-2 rounded-full bg-[#5C7A5C]"></div>
          <span className="font-semibold text-gray-900 tracking-tight">Studi</span>
        </div>

        <h1 className="text-xl font-semibold text-gray-900 tracking-tight mb-1">Créer mon espace</h1>
        <p className="text-sm text-gray-400 mb-6">SUP-PHOTO · Espace de suivi</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">Email</label>
            <input
              type="email"
              name="email"
              placeholder="ton@email.fr"
              required
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 outline-none focus:border-[#5C7A5C] transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">Mot de passe</label>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              minLength={6}
              required
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm text-gray-900 outline-none focus:border-[#5C7A5C] transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">Code d'accès</label>
            <input
              type="text"
              name="code"
              placeholder="Code fourni par ton école"
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
            {loading ? 'Création...' : 'Créer mon espace'}
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-4">
          Déjà un compte ?{' '}
          <Link href="/login" className="text-[#5C7A5C] hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
