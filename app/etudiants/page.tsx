'use client'

import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import Link from 'next/link'

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

  return (
    <div className="min-h-screen bg-[#D6E6D6] flex">
      <div className="w-52 bg-white border-r border-gray-100 flex flex-col p-3 gap-1">
        <div className="flex items-center gap-2 px-3 py-3 mb-2">
          <div className="w-2 h-2 rounded-full bg-[#5C7A5C]"></div>
          <span className="font-semibold text-gray-900 tracking-tight">Studi</span>
        </div>
        <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900">Dashboard</Link>
        <Link href="/etudiants" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm bg-[#E4EDE4] text-[#3D553D] font-medium">Étudiants</Link>
        <Link href="#" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900">Documents</Link>
        <div className="px-3 pt-3 pb-1 text-[10px] font-medium text-gray-400 uppercase tracking-widest">Recrutement</div>
        <Link href="#" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900">Entreprises</Link>
        <Link href="#" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900">Offres</Link>
        <Link href="#" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900">Relances</Link>
      </div>

      <div className="flex-1 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 tracking-tight">Étudiants</h1>
            <p className="text-sm text-[#5C7A5C] mt-0.5">{etudiants.length} étudiants au total</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-[#5C7A5C] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#4A6A4A] transition-colors"
          >
            + Ajouter un étudiant
          </button>
        </div>

        {showForm && (
          <div className="bg-white border border-[#C8D8C8] rounded-xl p-6 mb-5">
            <h2 className="text-sm font-medium text-gray-900 mb-4">Nouvel étudiant</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Prénom</label>
                <input
                  type="text"
                  required
                  value={form.prenom}
                  onChange={e => setForm({...form, prenom: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#5C7A5C]"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Nom</label>
                <input
                  type="text"
                  required
                  value={form.nom}
                  onChange={e => setForm({...form, nom: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#5C7A5C]"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Email</label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#5C7A5C]"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Niveau</label>
                <select
                  value={form.niveau}
                  onChange={e => setForm({...form, niveau: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#5C7A5C]"
                >
                  <option>Bac+1</option>
                  <option>Bac+2</option>
                  <option>Bac+3</option>
                  <option>Bac+4</option>
                  <option>Bac+5</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1.5 block">Type de formation</label>
                <select
                  value={form.type_formation}
                  onChange={e => setForm({...form, type_formation: e.target.value})}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm outline-none focus:border-[#5C7A5C]"
                >
                  <option value="alternance">Alternance</option>
                  <option value="initial">Initial</option>
                </select>
              </div>
              <div className="col-span-2 flex gap-3 justify-end mt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-lg text-sm text-gray-500 border border-gray-200 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-sm font-medium bg-[#5C7A5C] text-white hover:bg-[#4A6A4A]"
                >
                  Ajouter
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-white border border-[#C8D8C8] rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-sm text-gray-400">Chargement...</div>
          ) : etudiants.map((e: any) => (
            <div key={e.id} className="flex items-center gap-3 px-4 py-3 border-b border-[#EEF3EE] last:border-0">
              <div className="w-8 h-8 rounded-full bg-[#E4EDE4] flex items-center justify-center text-xs font-medium text-[#3D553D]">
                {e.prenom[0]}{e.nom[0]}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">{e.prenom} {e.nom}</div>
                <div className="text-xs text-gray-400">{e.email}</div>
              </div>
              <div className="text-xs text-gray-400">{e.niveau} · {e.type_formation === 'alternance' ? 'Alternance' : 'Initial'}</div>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#E4EDE4] text-[#3D553D]">
                {e.statut === 'place' ? 'Placé' : e.statut === 'en_recherche' ? 'En recherche' : 'En préparation'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}