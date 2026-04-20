'use client'
import { useState } from 'react'
import { repondreRelance } from '../relances/actions'

interface Relance {
  id: string
  message: string
  type: string
  lu: boolean
  reponse: string | null
  reponse_at: string | null
  created_at: string
}

const TYPE_LABELS: Record<string, string> = {
  urgent: 'Urgent', document: 'Document', candidature: 'Candidature', entretien: 'Entretien', general: 'Général',
}
const TYPE_COLORS: Record<string, { color: string; bg: string; border: string }> = {
  urgent:      { color: '#9F1239', bg: '#FFF1F2', border: '#FECDD3' },
  document:    { color: '#C2410C', bg: '#FFF7ED', border: '#FED7AA' },
  candidature: { color: '#1D4ED8', bg: '#EFF6FF', border: '#BFDBFE' },
  entretien:   { color: '#6D28D9', bg: '#F5F3FF', border: '#DDD6FE' },
  general:     { color: '#3D553D', bg: '#E4EDE4', border: '#A3BFA3' },
}

function fmtDate(str: string) {
  return new Date(str).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function RelancesWidget({ initial }: { initial: Relance[] }) {
  const [relances, setRelances] = useState(initial)
  const [openId, setOpenId]   = useState<string | null>(null)
  const [reply, setReply]     = useState('')
  const [sending, setSending] = useState(false)

  const nonLues = relances.filter(r => !r.lu && !r.reponse)

  async function handleReply(id: string) {
    setSending(true)
    await repondreRelance(id, reply)
    setRelances(prev => prev.map(r => r.id === id
      ? { ...r, lu: true, reponse: reply || null, reponse_at: new Date().toISOString() }
      : r
    ))
    setReply('')
    setOpenId(null)
    setSending(false)
  }

  async function handleLu(id: string) {
    await repondreRelance(id, '')
    setRelances(prev => prev.map(r => r.id === id ? { ...r, lu: true } : r))
  }

  if (relances.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      {/* En-tête si non lues */}
      {nonLues.length > 0 && (
        <div className="flex items-center gap-3 px-5 py-3 bg-orange-50 border border-orange-200 rounded-2xl">
          <span className="text-xl">🔔</span>
          <p className="text-sm font-bold text-orange-700">
            {nonLues.length} nouveau{nonLues.length > 1 ? 'x' : ''} message{nonLues.length > 1 ? 's' : ''} de ton responsable
          </p>
        </div>
      )}

      {relances.map(r => {
        const tc = TYPE_COLORS[r.type] || TYPE_COLORS.general
        const isOpen = openId === r.id
        const isAnswered = !!r.reponse
        const isRead = r.lu

        return (
          <div key={r.id}
            className="bg-white rounded-2xl border-2 transition-all overflow-hidden"
            style={{ borderColor: isRead ? '#E5E7EB' : tc.border }}>

            {/* Header — cliquable */}
            <button
              className="w-full text-left px-5 py-4 flex items-start gap-3"
              onClick={() => setOpenId(isOpen ? null : r.id)}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{ backgroundColor: tc.bg }}>
                <span className="text-sm">
                  {r.type === 'urgent' ? '🚨' : r.type === 'document' ? '📄' : r.type === 'candidature' ? '📋' : r.type === 'entretien' ? '🎯' : '💬'}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: tc.bg, color: tc.color }}>
                    {TYPE_LABELS[r.type] || 'Message'}
                  </span>
                  {!isRead && !isAnswered && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-500 border border-orange-200">
                      Nouveau
                    </span>
                  )}
                  {isAnswered && (
                    <span className="text-[10px] font-semibold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
                      ✓ Répondu
                    </span>
                  )}
                  {isRead && !isAnswered && (
                    <span className="text-[10px] text-gray-400">Lu</span>
                  )}
                  <span className="text-xs text-gray-400 ml-auto shrink-0">{fmtDate(r.created_at)}</span>
                </div>
                <p className={`text-sm leading-relaxed ${isRead ? 'text-gray-500' : 'text-gray-900 font-medium'}`}>
                  {r.message}
                </p>
              </div>

              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"
                className="shrink-0 mt-1 text-gray-400 transition-transform"
                style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
              </svg>
            </button>

            {/* Corps étendu */}
            {isOpen && (
              <div className="px-5 pb-5 border-t border-[#F3F4F6]">

                {/* Réponse existante */}
                {isAnswered && (
                  <div className="mt-4 p-3 bg-[#F0FDF4] rounded-xl border border-[#BBF7D0]">
                    <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest mb-1">Ta réponse</p>
                    <p className="text-sm text-gray-700">{r.reponse}</p>
                    {r.reponse_at && (
                      <p className="text-[10px] text-gray-400 mt-1">{fmtDate(r.reponse_at)}</p>
                    )}
                  </div>
                )}

                {/* Formulaire réponse */}
                {!isAnswered && (
                  <div className="mt-4 flex flex-col gap-3">
                    <textarea
                      value={reply}
                      onChange={e => setReply(e.target.value)}
                      placeholder="Écris ta réponse ici..."
                      rows={3}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-[#5C7A5C] transition-colors resize-none bg-white"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleReply(r.id)}
                        disabled={sending || !reply.trim()}
                        className="flex-1 bg-[#3D553D] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#2D4030] transition-colors disabled:opacity-50 active:scale-95"
                      >
                        {sending ? 'Envoi...' : 'Envoyer ma réponse'}
                      </button>
                      <button
                        onClick={() => handleLu(r.id)}
                        disabled={sending}
                        className="px-4 py-2 rounded-xl text-sm text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        Marquer comme lu
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
