'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export default function ResetPassword() {
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState(false)
  const [ready, setReady]         = useState(false)

  useEffect(() => {
    // Supabase injecte le token dans le hash de l'URL
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    return () => subscription.unsubscribe()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas.'); return }
    if (password.length < 6)  { setError('Minimum 6 caractères.'); return }
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)
    if (error) setError(error.message)
    else setSuccess(true)
  }

  return (
    <div style={{ minHeight: '100vh', background: '#F0F4F0', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{
        background: '#fff', borderRadius: 16, border: '1px solid #E5EBE5',
        padding: 32, width: '100%', maxWidth: 380,
        boxShadow: '0 2px 16px rgba(0,0,0,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#5C7A5C' }}/>
          <span style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>Studi</span>
        </div>

        {success ? (
          <div>
            <p style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 6 }}>Mot de passe mis à jour</p>
            <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 24 }}>Tu peux maintenant te connecter avec ton nouveau mot de passe.</p>
            <a href="/login" style={{
              display: 'block', width: '100%', textAlign: 'center',
              padding: '10px 0', borderRadius: 8, background: '#5C7A5C',
              color: '#fff', fontSize: 13, fontWeight: 600, textDecoration: 'none',
            }}>
              Se connecter
            </a>
          </div>
        ) : !ready ? (
          <div>
            <p style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 6 }}>Lien invalide</p>
            <p style={{ fontSize: 13, color: '#6B7280' }}>Ce lien a expiré ou est invalide. Demande un nouveau lien depuis le menu de ton compte.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <p style={{ fontSize: 18, fontWeight: 700, color: '#111827', marginBottom: 4 }}>Nouveau mot de passe</p>
              <p style={{ fontSize: 13, color: '#6B7280', marginBottom: 20 }}>Choisis un mot de passe sécurisé.</p>
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 6 }}>Nouveau mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%', padding: '9px 12px', borderRadius: 8,
                  border: '1px solid #E5EBE5', fontSize: 13, color: '#111827',
                  outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', display: 'block', marginBottom: 6 }}>Confirmer</label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%', padding: '9px 12px', borderRadius: 8,
                  border: '1px solid #E5EBE5', fontSize: 13, color: '#111827',
                  outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>

            {error && (
              <p style={{ fontSize: 12, color: '#DC2626', background: '#FEF2F2', padding: '8px 12px', borderRadius: 8 }}>{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 0', borderRadius: 8, background: '#5C7A5C',
                color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                border: 'none', opacity: loading ? 0.6 : 1,
              }}
            >
              {loading ? 'Enregistrement...' : 'Enregistrer le mot de passe'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
