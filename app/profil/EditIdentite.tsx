'use client'

import { useState } from 'react'
import { updateProfil } from './actions'

interface Props {
  telephone: string | null
  linkedin: string | null
}

export default function EditIdentite({ telephone, linkedin }: Props) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    const formData = new FormData(e.currentTarget)
    await updateProfil(formData)
    setSaving(false)
    setSaved(true)
    setOpen(false)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div>
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="text-xs text-[#5C7A5C] font-medium hover:underline"
        >
          Modifier
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 mt-3 pt-3 border-t border-[#F3F4F6]">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Téléphone</label>
            <input
              type="tel"
              name="telephone"
              defaultValue={telephone ?? ''}
              placeholder="06 00 00 00 00"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#5C7A5C] transition-colors"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">LinkedIn (URL)</label>
            <input
              type="url"
              name="linkedin"
              defaultValue={linkedin ?? ''}
              placeholder="https://linkedin.com/in/tonprofil"
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#5C7A5C] transition-colors"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-[#5C7A5C] text-white py-2 rounded-lg text-xs font-medium hover:bg-[#4A6A4A] transition-colors disabled:opacity-50"
            >
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-2 rounded-lg text-xs text-gray-500 border border-gray-200 hover:bg-gray-50"
            >
              Annuler
            </button>
          </div>
        </form>
      )}
      {saved && (
        <p className="text-xs text-[#5C7A5C] mt-2 font-medium">Profil mis à jour !</p>
      )}
    </div>
  )
}
