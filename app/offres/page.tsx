import { createClient } from '../../lib/supabase-server'
import { redirect } from 'next/navigation'
import AdminSidebar from '../components/AdminSidebar'
import OffresClient from './OffresClient'
import OffresEtudiantView from './OffresEtudiantView'

export default async function Offres() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: offres } = await supabase
    .from('offres')
    .select('*')
    .order('created_at', { ascending: false })

  const isAdmin = user.user_metadata?.role === 'admin'

  if (!isAdmin) {
    return <OffresEtudiantView offres={(offres || []).filter((o: any) => o.active)} />
  }

  return (
    <div className="min-h-screen bg-[#D6E6D6] flex">
      <AdminSidebar />
      <div className="flex-1 p-6">
        <OffresClient offres={offres || []} />
      </div>
    </div>
  )
}
