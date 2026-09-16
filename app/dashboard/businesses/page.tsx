'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Plus, Edit, Trash2, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'
import DashboardNav from '@/components/DashboardNav'

interface Business {
  id: string
  business_name: string
  industry: string
  location: string
  business_stage: string
  team_size: number
  status: string
  created_at: string
}

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingBusiness, setEditingBusiness] = useState<Business | null>(null)
  const router = useRouter()

  const [formData, setFormData] = useState({
    business_name: '',
    industry: '',
    location: '',
    website: '',
    founder_contact: '',
    business_stage: 'startup',
    team_size: 0,
    revenue_range: '0-100k',
  })

  useEffect(() => {
    fetchBusinesses()
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

    if (editingBusiness) {
      const { error } = await supabase
        .from('businesses')
        .update(formData)
        .eq('id', editingBusiness.id)

      if (error) {
        console.error('Error updating business:', error)
        return
      }
    } else {
      const { error } = await supabase
        .from('businesses')
        .insert([{ ...formData, status: 'lead' }])

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
      team_size: 0,
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
      website: '',
      founder_contact: '',
      business_stage: business.business_stage || 'startup',
      team_size: business.team_size || 0,
      revenue_range: '0-100k',
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this business?')) return

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

  const startDiagnosis = (businessId: string) => {
    router.push(`/dashboard/diagnoses/new?businessId=${businessId}`)
  }

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="flex bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen">
      <DashboardNav />
      <div className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <p className="text-xs font-medium text-emerald-400 uppercase tracking-widest mb-2">Business Management</p>
            <h1 className="text-3xl font-semibold text-white tracking-tight">Businesses</h1>
            <p className="text-slate-400 mt-2">Manage client businesses</p>
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
                team_size: 0,
                revenue_range: '0-100k',
              })
              setShowModal(true)
            }}
            className="flex items-center px-6 py-3 bg-emerald-700/90 backdrop-blur-xl text-white rounded-2xl border border-emerald-600/50 shadow-lg hover:bg-emerald-800 transition-all"
          >
            <Plus className="mr-2 h-5 w-5" />
            Add Business
          </button>
        </div>

        <div className="bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 shadow-lg overflow-hidden">
          <table className="min-w-full divide-y divide-white/10">
            <thead className="bg-white/5 backdrop-blur-xl">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-widest">
                  Business Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-widest">
                  Industry
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-widest">
                  Stage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-widest">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-widest">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white/5 backdrop-blur-xl divide-y divide-white/10">
              {businesses.map((business) => (
                <tr key={business.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{business.business_name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-400">{business.industry || '-'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-emerald-500/20 backdrop-blur-xl text-emerald-400">
                      {business.business_stage || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full backdrop-blur-xl ${
                      business.status === 'lead' ? 'bg-slate-500/20 text-slate-400' :
                      business.status === 'diagnosing' ? 'bg-amber-500/20 text-amber-400' :
                      business.status === 'diagnosis_complete' ? 'bg-emerald-500/20 text-emerald-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {business.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => startDiagnosis(business.id)}
                      className="text-emerald-400 hover:text-emerald-300 transition-colors"
                      title="Start Diagnosis"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleEdit(business)}
                      className="text-slate-400 hover:text-white transition-colors"
                      title="Edit"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(business.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {businesses.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    No businesses added yet. Click "Add Business" to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-xl flex items-center justify-center z-50">
            <div className="bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="p-8">
                <h2 className="text-xl font-semibold text-white tracking-tight mb-6">
                  {editingBusiness ? 'Edit Business' : 'Add New Business'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-widest mb-2">
                      Business Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.business_name}
                      onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white placeholder-slate-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-widest mb-2">
                      Industry
                    </label>
                    <input
                      type="text"
                      value={formData.industry}
                      onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white placeholder-slate-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-widest mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white placeholder-slate-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-widest mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white placeholder-slate-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-widest mb-2">
                      Founder Contact
                    </label>
                    <input
                      type="email"
                      value={formData.founder_contact}
                      onChange={(e) => setFormData({ ...formData, founder_contact: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white placeholder-slate-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-widest mb-2">
                      Business Stage
                    </label>
                    <select
                      value={formData.business_stage}
                      onChange={(e) => setFormData({ ...formData, business_stage: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white transition-all"
                    >
                      <option value="startup">Startup</option>
                      <option value="growth">Growth</option>
                      <option value="mature">Mature</option>
                      <option value="decline">Decline</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-widest mb-2">
                      Team Size
                    </label>
                    <input
                      type="number"
                      value={formData.team_size}
                      onChange={(e) => setFormData({ ...formData, team_size: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white placeholder-slate-500 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 uppercase tracking-widest mb-2">
                      Revenue Range
                    </label>
                    <select
                      value={formData.revenue_range}
                      onChange={(e) => setFormData({ ...formData, revenue_range: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white transition-all"
                    >
                      <option value="0-100k">$0 - $100k</option>
                      <option value="100k-500k">$100k - $500k</option>
                      <option value="500k-1m">$500k - $1M</option>
                      <option value="1m-5m">$1M - $5M</option>
                      <option value="5m+">$5M+</option>
                    </select>
                  </div>
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-6 py-3 bg-white/10 backdrop-blur-xl border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-emerald-700 text-white rounded-xl hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-700/20"
                    >
                      {editingBusiness ? 'Update' : 'Add'} Business
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
