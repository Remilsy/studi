'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminSidebar() {
  const p = usePathname()
  const active = (href: string) => href === '/' ? p === '/' : p === href || p.startsWith(href + '/')
  const cls = (href: string) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
      active(href) ? 'bg-[#E4EDE4] text-[#3D553D] font-medium' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
    }`
  return (
    <div className="w-52 bg-white border-r border-gray-100 flex flex-col p-3 gap-1 shrink-0 min-h-screen sticky top-0">
      <div className="flex items-center gap-2 px-3 py-3 mb-2">
        <div className="w-2 h-2 rounded-full bg-[#5C7A5C]"></div>
        <span className="font-semibold text-gray-900 tracking-tight">Studi</span>
      </div>
      <Link href="/" className={cls('/')}>Dashboard</Link>
      <Link href="/etudiants" className={cls('/etudiants')}>Étudiants</Link>
      <Link href="/documents" className={cls('/documents')}>Documents</Link>
      <div className="px-3 pt-3 pb-1 text-[10px] font-medium text-gray-400 uppercase tracking-widest">Recrutement</div>
      <Link href="/entreprises" className={cls('/entreprises')}>Entreprises</Link>
      <Link href="/offres" className={cls('/offres')}>Offres</Link>
      <Link href="/relances" className={cls('/relances')}>Relances</Link>
    </div>
  )
}
