'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'
import AdminSidebar from '../components/AdminSidebar'
import ParallaxOrbs from '../components/ParallaxOrbs'

const glass = {
  background: 'linear-gradient(145deg, var(--dash-card-from) 0%, var(--dash-card-to) 100%)',
  backdropFilter: 'blur(60px)',
  WebkitBackdropFilter: 'blur(60px)',
  border: '1px solid var(--dash-card-border)',
  borderRadius: '20px',
  boxShadow: 'inset 0 1px 0 var(--dash-card-inset)',
} as const

const ctrl: React.CSSProperties = {
  background: 'rgba(255,255,255,0.7)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  border: '1px solid rgba(255,255,255,0.9)',
  color: '#111827',
  borderRadius: '12px',
  padding: '8px 12px',
  fontSize: '13px',
  outline: 'none',
  width: '100%',
}

export default function Etudiants() {
  const [etudiants, setEtudiants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    prenom: '',
    nom: '',
    email: '',
    niveau: 'Bac+1',
    type_formation: 'alternance',
  })

  useEffect(() => {
    fetchEtudiants()
  }, [])

  async function fetchEtudiants() {
    const { data } = await supabase
      .from('etudiants')
      .select('*')
      .order('created_at', { ascending: false })
    setEtudiants(data || [])
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await supabase.from('etudiants').insert([{
      ...form,
      statut: 'en_preparation',
      score_progression: 0,
    }])
    if (!error) {
      setShowForm(false)
      setForm({ prenom: '', nom: '', email: '', niveau: 'Bac+1', type_formation: 'alternance' })
      fetchEtudiants()
    }
  }

  const statutColors: Record<string, { color: string; bg: string }> = {
    place:          { color: '#15803D', bg: 'rgba(34,197,94,0.12)'   },
    en_recherche:   { color: '#1D4ED8', bg: 'rgba(59,130,246,0.12)'  },
    en_preparation: { color: '#9CA3AF', bg: 'rgba(156,163,175,0.1)'  },
  }

  return (
    <div className="h-screen flex relative" style={{ background: 'var(--dash-bg)' }}>
      <ParallaxOrbs />
      <AdminSidebar />
      <div id="dashboard-scroll" className="flex-1 h-full overflow-y-auto" style={{ position: 'relative', zIndex: 1 }}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-semibold tracking-tight" style={{ color: 'var(--dash-header-title)' }}>Étudiants</h1>
              <p className="text-sm mt-0.5" style={{ color: 'var(--dash-header-sub)' }}>{etudiants.length} étudiants au total</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              style={{ ...ctrl, width: 'auto', padding: '8px 16px', fontWeight: 600, cursor: 'pointer' }}
            >
              + Ajouter un étudiant
            </button>
          </div>

          {showForm && (
            <div style={{ ...glass, padding: '24px', marginBottom: '20px' }}>
              <h2 className="text-sm font-medium mb-4" style={{ color: 'var(--dash-header-title)' }}>Nouvel étudiant</h2>
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--dash-header-sub)' }}>Prénom</label>
                  <input type="text" required value={form.prenom}
                    onChange={e => setForm({...form, prenom: e.target.value})} style={ctrl} />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--dash-header-sub)' }}>Nom</label>
                  <input type="text" required value={form.nom}
                    onChange={e => setForm({...form, nom: e.target.value})} style={ctrl} />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--dash-header-sub)' }}>Email</label>
                  <input type="email" required value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})} style={ctrl} />
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--dash-header-sub)' }}>Niveau</label>
                  <select value={form.niveau} onChange={e => setForm({...form, niveau: e.target.value})} style={ctrl}>
                    <option>Bac+1</option>
                    <option>Bac+2</option>
                    <option>Bac+3</option>
                    <option>Bac+4</option>
                    <option>Bac+5</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium mb-1.5 block" style={{ color: 'var(--dash-header-sub)' }}>Type de formation</label>
                  <select value={form.type_formation} onChange={e => setForm({...form, type_formation: e.target.value})} style={ctrl}>
                    <option value="alternance">Alternance</option>
                    <option value="initial">Initial</option>
                  </select>
                </div>
                <div className="col-span-2 flex gap-3 justify-end mt-2">
                  <button type="button" onClick={() => setShowForm(false)}
                    style={{ ...ctrl, width: 'auto', padding: '8px 16px', cursor: 'pointer' }}>
                    Annuler
                  </button>
                  <button type="submit"
                    style={{ ...ctrl, width: 'auto', padding: '8px 16px', background: 'rgba(61,85,61,0.85)', color: 'white', fontWeight: 600, cursor: 'pointer' }}>
                    Ajouter
                  </button>
                </div>
              </form>
            </div>
          )}

          <div style={{ ...glass, overflow: 'hidden' }}>
            {loading ? (
              <div className="p-8 text-center text-sm" style={{ color: 'var(--dash-header-sub)' }}>Chargement...</div>
            ) : etudiants.map((e: any, idx: number) => {
              const sc = statutColors[e.statut] || statutColors['en_preparation']
              return (
                <Link key={e.id} href={`/etudiants/${e.id}`}
                  className="flex items-center gap-3 px-4 py-3 transition-colors cursor-pointer"
                  style={{ borderTop: idx > 0 ? '1px solid rgba(0,0,0,0.04)' : 'none' }}
                  onMouseEnter={ev => (ev.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.3)'}
                  onMouseLeave={ev => (ev.currentTarget as HTMLElement).style.background = 'transparent'}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium shrink-0"
                    style={{ background: sc.bg, color: sc.color }}>
                    {e.prenom[0]}{e.nom[0]}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium" style={{ color: 'var(--dash-header-title)' }}>{e.prenom} {e.nom}</div>
                    <div className="text-xs" style={{ color: 'var(--dash-header-sub)' }}>{e.email}</div>
                  </div>
                  <div className="text-xs" style={{ color: 'var(--dash-header-sub)' }}>{e.niveau} · {e.type_formation === 'alternance' ? 'Alternance' : 'Initial'}</div>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full" style={{ background: sc.bg, color: sc.color }}>
                    {e.statut === 'place' ? 'Placé' : e.statut === 'en_recherche' ? 'En recherche' : 'En préparation'}
                  </span>
                  <span className="text-[10px]" style={{ color: 'var(--dash-header-sub)' }}>→</span>
                </Link>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
