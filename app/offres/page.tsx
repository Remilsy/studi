import { createClient } from '../../lib/supabase-server'
import { redirect } from 'next/navigation'
import AdminSidebar from '../components/AdminSidebar'
import ParallaxOrbs from '../components/ParallaxOrbs'
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
    <div className="h-screen flex relative" style={{ background: 'var(--dash-bg)' }}>
      <ParallaxOrbs />
      <AdminSidebar />
      <div id="dashboard-scroll" className="flex-1 h-full overflow-y-auto" style={{ position: 'relative', zIndex: 1 }}>
        <div className="p-6">
          <OffresClient offres={offres || []} />
        </div>
      </div>
    </div>
  )
}
