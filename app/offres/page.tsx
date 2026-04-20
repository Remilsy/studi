import { createClient } from '../../lib/supabase-server'
import Link from 'next/link'
import OffresClient from './OffresClient'

export default async function Offres() {
  const supabase = await createClient()
  const { data: offres } = await supabase
    .from('offres')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-[#D6E6D6] flex">

      {/* Sidebar */}
      <div className="w-52 bg-white border-r border-gray-100 flex flex-col p-3 gap-1 shrink-0">
        <div className="flex items-center gap-2 px-3 py-3 mb-2">
          <div className="w-2 h-2 rounded-full bg-[#5C7A5C]"></div>
          <span className="font-semibold text-gray-900 tracking-tight">Studi</span>
        </div>
        <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900">Dashboard</Link>
        <Link href="/etudiants" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900">Étudiants</Link>
        <Link href="#" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900">Documents</Link>
        <div className="px-3 pt-3 pb-1 text-[10px] font-medium text-gray-400 uppercase tracking-widest">Recrutement</div>
        <Link href="#" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900">Entreprises</Link>
        <Link href="/offres" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-[#E4EDE4] text-[#3D553D] font-medium">Offres</Link>
        <Link href="#" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900">Relances</Link>
      </div>

      <div className="flex-1 p-6">
        <OffresClient offres={offres || []} />
      </div>
    </div>
  )
}
