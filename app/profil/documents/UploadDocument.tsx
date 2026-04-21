'use client'
import { useRef, useState } from 'react'
import { supabase } from '../../../lib/supabase'

interface Props {
  type:       'cv' | 'portfolio'
  label:      string
  currentUrl: string | null
  onUpload:   (url: string) => Promise<void>
}

export default function UploadDocument({ type, label, currentUrl, onUpload }: Props) {
  const [url, setUrl]         = useState(currentUrl)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving]   = useState(false)
  const [saved, setSaved]     = useState(false)
  const [error, setError]     = useState('')
  const inputRef              = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    if (file.type !== 'application/pdf') {
      setError('Seuls les fichiers PDF sont acceptés.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Fichier trop volumineux (max 10 Mo).')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setError('Non connecté.'); setLoading(false); return }

      const path = `${user.id}/${type}_${Date.now()}.pdf`

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(path, file, { contentType: 'application/pdf', upsert: true })

      if (uploadError) {
        setError(`Erreur upload : ${uploadError.message}`)
        setLoading(false)
        return
      }

      const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(path)

      setLoading(false)
      setSaving(true)
      await onUpload(publicUrl)
      setUrl(publicUrl)
      setSaving(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error('[UploadDocument]', err)
      setError(`Erreur : ${err instanceof Error ? err.message : String(err)}`)
      setLoading(false)
    }
  }

  const isLoading = loading || saving

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        className="hidden"
        onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]); e.target.value = '' }}
      />

      {url ? (
        <div className="flex items-center justify-between p-4 bg-[#F0FDF4] rounded-xl border border-[#BBF7D0]">
          <div className="flex items-center gap-2">
            <span className="text-lg">📄</span>
            <div>
              <p className="text-sm font-bold text-green-700">
                {saved ? 'Sauvegardé ✓' : `${label} déposé ✓`}
              </p>
              <p className="text-xs text-green-600 break-all">{url}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href={url} target="_blank" rel="noopener noreferrer"
              className="text-xs font-semibold text-[#5C7A5C] hover:underline px-3 py-1.5 bg-white rounded-lg border border-[#C8D8C8] transition-colors hover:bg-[#F0FDF4]">
              Voir ↗
            </a>
            <button
              onClick={() => inputRef.current?.click()}
              disabled={isLoading}
              className="text-xs font-semibold text-gray-500 hover:text-gray-700 px-3 py-1.5 bg-white rounded-lg border border-gray-200 transition-colors hover:bg-gray-50 disabled:opacity-50">
              {isLoading ? '...' : 'Remplacer'}
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={isLoading}
          className="w-full p-6 border-2 border-dashed border-[#C8D8C8] rounded-xl hover:border-[#5C7A5C] hover:bg-[#F8FAF8] transition-all disabled:opacity-60 flex flex-col items-center gap-2 group">
          {isLoading ? (
            <>
              <div className="w-6 h-6 border-2 border-[#5C7A5C] border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-semibold text-[#5C7A5C]">
                {loading ? 'Upload en cours...' : 'Sauvegarde...'}
              </p>
            </>
          ) : (
            <>
              <span className="text-3xl group-hover:scale-110 transition-transform">📎</span>
              <p className="text-sm font-semibold text-gray-600 group-hover:text-[#3D553D]">
                Cliquer pour déposer un PDF
              </p>
              <p className="text-xs text-gray-400">PDF uniquement · Max 10 Mo</p>
            </>
          )}
        </button>
      )}

      {error && (
        <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg border border-red-200">{error}</p>
      )}
    </div>
  )
}
