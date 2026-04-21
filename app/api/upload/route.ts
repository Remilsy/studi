import { NextRequest, NextResponse } from 'next/server'
import { uploadPDF } from '../../../lib/cloudinary'
import { createClient } from '../../../lib/supabase-server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const type = formData.get('type') as string | null

  if (!file) return NextResponse.json({ error: 'Aucun fichier reçu' }, { status: 400 })
  if (file.type !== 'application/pdf') return NextResponse.json({ error: 'Seuls les fichiers PDF sont acceptés' }, { status: 400 })
  if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: 'Fichier trop volumineux (max 10 Mo)' }, { status: 400 })

  const buffer = Buffer.from(await file.arrayBuffer())
  const publicId = `studi/${user.id}/${type ?? 'doc'}_${Date.now()}`

  try {
    const url = await uploadPDF(buffer, publicId)
    return NextResponse.json({ url })
  } catch (err) {
    console.error('[upload] Cloudinary error:', err)
    return NextResponse.json({ error: 'Erreur lors de l\'upload, réessaie.' }, { status: 500 })
  }
}
