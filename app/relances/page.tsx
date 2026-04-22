import { createClient } from '../../lib/supabase-server'
import { redirect } from 'next/navigation'
import AdminSidebar from '../components/AdminSidebar'
import ParallaxOrbs from '../components/ParallaxOrbs'
import RelancesClient from './RelancesClient'

export default async function RelancesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.user_metadata?.role !== 'admin') redirect('/login')

  const [{ data: etudiants }, { data: relances }] = await Promise.all([
    supabase.from('etudiants').select('id, prenom, nom, email, statut').order('nom'),
    supabase.from('relances').select('*').order('created_at', { ascending: false }),
  ])

  return (
    <div className="h-screen flex relative" style={{ background: 'var(--dash-bg)' }}>
      <ParallaxOrbs />
      <AdminSidebar />
      <div id="dashboard-scroll" className="flex-1 h-full overflow-y-auto" style={{ position: 'relative', zIndex: 1 }}>
        <div className="p-6">
          <RelancesClient etudiants={etudiants || []} relances={relances || []} />
        </div>
      </div>
    </div>
  )
}
