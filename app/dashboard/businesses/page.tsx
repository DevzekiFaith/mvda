'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Plus, Edit2, Trash2, Stethoscope, Search, Globe, MapPin, Users, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Business {
  id: string
  business_name: string
  industry: string
  location: string
  website?: string
  founder_contact?: string
  business_stage: string
  team_size: number
  revenue_range?: string
  status: string
  created_at: string
}

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  const [formData, setFormData] = useState({
    business_name: '',
    industry: '',
    location: '',
    website: '',
    founder_contact: '',
    business_stage: 'startup',
    team_size: 1,
    revenue_range: '0-100k',
  })

  useEffect(() => {
    fetchBusinesses()

    const channel = supabase
      .channel('businesses-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'businesses' }, () => {
        fetchBusinesses()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchBusinesses = async () => {
    const { data, error } = await supabase
      .from('businesses')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching businesses:', error)
    } else {
      setBusinesses(data || [])
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const { data: { user } } = await supabase.auth.getUser()

    if (editingBusiness) {
      const { error } = await supabase
        .from('businesses')
        .update({
          ...formData,
          team_size: Number(formData.team_size),
        })
        .eq('id', editingBusiness.id)

      if (error) {
        console.error('Error updating business:', error)
        return
      }
    } else {
      const { error } = await supabase
        .from('businesses')
        .insert([{ 
          ...formData, 
          team_size: Number(formData.team_size),
          assigned_consultant_id: user?.id || null,
          status: 'intake' 
        }])

      if (error) {
        console.error('Error creating business:', error)
        return
      }
    }

    setShowModal(false)
    setEditingBusiness(null)
    setFormData({
      business_name: '',
      industry: '',
      location: '',
      website: '',
      founder_contact: '',
      business_stage: 'startup',
      team_size: 1,
      revenue_range: '0-100k',
    })
    fetchBusinesses()
  }

  const handleEdit = (business: Business) => {
    setEditingBusiness(business)
    setFormData({
      business_name: business.business_name,
      industry: business.industry || '',
      location: business.location || '',
      website: business.website || '',
      founder_contact: business.founder_contact || '',
      business_stage: business.business_stage || 'startup',
      team_size: business.team_size || 1,
      revenue_range: business.revenue_range || '0-100k',
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this client profile?')) return

    const { error } = await supabase
      .from('businesses')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting business:', error)
      return
    }

    fetchBusinesses()
  }

  const filteredBusinesses = businesses.filter(b => 
    b.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.industry && b.industry.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (b.location && b.location.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="p-6 lg:p-10 max-w-7xl mx-auto w-full space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/[0.07]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#ff5722]" />
            <span className="text-xs font-mono uppercase tracking-[0.2em] text-[#ff5722]">
              Client Directory
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Client Businesses
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 font-light mt-0.5">
            Profiles, organizational sizes, revenue benchmarks, and diagnostic engagements.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingBusiness(null)
            setFormData({
              business_name: '',
              industry: '',
              location: '',
              website: '',
              founder_contact: '',
              business_stage: 'startup',
              team_size: 1,
              revenue_range: '0-100k',
            })
            setShowModal(true)
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#ff6a38] to-[#ff5722] text-white text-xs font-semibold shadow-[0_3px_15px_rgba(255,87,34,0.35)] hover:shadow-[0_5px_20px_rgba(255,87,34,0.5)] transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Register Business</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Filter by business name, industry, or city..."
          className="w-full pl-10 pr-4 py-2.5 bg-[#10121a] border border-white/[0.08] focus:border-[#ff5722]/60 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-[#ff5722]/50 transition-all font-sans"
        />
      </div>

      {/* Businesses Grid */}
      {loading ? (
        <div className="p-12 text-center text-xs font-mono text-zinc-500">Loading business registry...</div>
      ) : filteredBusinesses.length === 0 ? (
        <div className="p-12 text-center bg-[#10121a]/80 rounded-2xl border border-white/[0.07] space-y-3">
          <p className="text-xs text-zinc-400">No client businesses matching your search.</p>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-[#ff5722] text-white"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add First Client</span>
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBusinesses.map((business) => (
            <div
              key={business.id}
              className="p-6 rounded-2xl bg-[#10121a]/90 hover:bg-[#131622] border border-white/[0.07] hover:border-[#ff5722]/30 transition-all duration-300 flex flex-col justify-between group shadow-sm"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-[#ff5722] transition-colors">
                      {business.business_name}
                    </h3>
                    <span className="text-[11px] font-mono text-zinc-400">{business.industry || 'General Industry'}</span>
                  </div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-white/[0.05] border border-white/[0.08] text-zinc-300">
                    {business.business_stage || 'Startup'}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-zinc-400 font-light mt-4 mb-6">
                  {business.location && (
                    <div className="flex items-center gap-2 text-zinc-400">
                      <MapPin className="h-3.5 w-3.5 text-zinc-500" />
                      <span>{business.location}</span>
                    </div>
                  )}
                  {business.team_size > 0 && (
                    <div className="flex items-center gap-2 text-zinc-400">
                      <Users className="h-3.5 w-3.5 text-zinc-500" />
                      <span>{business.team_size} team members</span>
                    </div>
                  )}
                  {business.website && (
                    <div className="flex items-center gap-2 text-zinc-400 truncate">
                      <Globe className="h-3.5 w-3.5 text-zinc-500" />
                      <span className="truncate">{business.website}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between gap-2">
                <button
                  onClick={() => router.push(`/dashboard/diagnoses/new?businessId=${business.id}`)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-[#ff5722]/10 hover:bg-[#ff5722] text-[#ff5722] hover:text-white border border-[#ff5722]/30 hover:border-[#ff5722] transition-all"
                >
                  <Stethoscope className="h-3.5 w-3.5" />
                  <span>Diagnose</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(business)}
                    className="p-2 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.05] transition-colors"
                    title="Edit Details"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(business.id)}
                    className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#10121a] border border-white/[0.1] rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 p-1.5 rounded-lg text-zinc-500 hover:text-white hover:bg-white/[0.05]"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#ff5722]">
                {editingBusiness ? 'Update Record' : 'New Enrollment'}
              </span>
              <h2 className="text-xl font-bold text-white mt-1">
                {editingBusiness ? 'Edit Client Business' : 'Register Client Business'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                  Business Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.business_name}
                  onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                  placeholder="Apex Robotics Ltd"
                  className="w-full px-3.5 py-2.5 bg-white/[0.03] border border-white/[0.08] focus:border-[#ff5722]/60 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-[#ff5722]/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                    Industry
                  </label>
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    placeholder="SaaS / Logistics"
                    className="w-full px-3.5 py-2.5 bg-white/[0.03] border border-white/[0.08] focus:border-[#ff5722]/60 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="London, UK"
                    className="w-full px-3.5 py-2.5 bg-white/[0.03] border border-white/[0.08] focus:border-[#ff5722]/60 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                    Stage
                  </label>
                  <select
                    value={formData.business_stage}
                    onChange={(e) => setFormData({ ...formData, business_stage: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#141722] border border-white/[0.08] focus:border-[#ff5722]/60 rounded-xl text-xs text-white focus:outline-none"
                  >
                    <option value="idea">Idea</option>
                    <option value="startup">Startup</option>
                    <option value="growth">Growth</option>
                    <option value="mature">Mature</option>
                    <option value="declining">Declining</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                    Team Size
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.team_size}
                    onChange={(e) => setFormData({ ...formData, team_size: parseInt(e.target.value) || 1 })}
                    className="w-full px-3.5 py-2.5 bg-white/[0.03] border border-white/[0.08] focus:border-[#ff5722]/60 rounded-xl text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                    Revenue Range
                  </label>
                  <select
                    value={formData.revenue_range}
                    onChange={(e) => setFormData({ ...formData, revenue_range: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#141722] border border-white/[0.08] focus:border-[#ff5722]/60 rounded-xl text-xs text-white focus:outline-none"
                  >
                    <option value="0-100k">0 - 100k</option>
                    <option value="100k-500k">100k - 500k</option>
                    <option value="500k-1m">500k - 1M</option>
                    <option value="1m-5m">1M - 5M</option>
                    <option value="5m-10m">5M - 10M</option>
                    <option value="10m+">10M+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-400 mb-1.5">
                    Website (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    placeholder="https://apex.com"
                    className="w-full px-3.5 py-2.5 bg-white/[0.03] border border-white/[0.08] focus:border-[#ff5722]/60 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#ff5722] hover:bg-[#ff6e3a] text-white text-xs font-semibold shadow-sm"
                >
                  {editingBusiness ? 'Save Changes' : 'Enroll Business'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
