'use client'
import { useRef, useState } from 'react'

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

    const cloudName    = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

    console.log('[upload] cloud_name:', cloudName, '| preset:', uploadPreset)

    if (!cloudName || !uploadPreset) {
      setError(`Variables d'env manquantes — cloud: "${cloudName}", preset: "${uploadPreset}"`)
      setLoading(false)
      return
    }

    const fd = new FormData()
    fd.append('file', file)
    fd.append('upload_preset', uploadPreset)
    fd.append('resource_type', 'raw')
    fd.append('folder', 'studi')

    try {
      const res  = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`, { method: 'POST', body: fd })
      const text = await res.text()
      let data: { secure_url?: string; error?: { message?: string } } = {}
      try { data = JSON.parse(text) } catch {
        setError(`Réponse invalide (${res.status}): ${text.slice(0, 200)}`)
        setLoading(false)
        return
      }

      if (!res.ok || data.error) {
        setError(data.error?.message ?? `Erreur Cloudinary ${res.status}`)
        setLoading(false)
        return
      }

      setLoading(false)
      setSaving(true)
      await onUpload(data.secure_url!)
      setUrl(data.secure_url!)
      setSaving(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      console.error('[UploadDocument]', err)
      setError(`Erreur: ${err instanceof Error ? err.message : String(err)}`)
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
              <p className="text-xs text-green-600">PDF déposé</p>
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
