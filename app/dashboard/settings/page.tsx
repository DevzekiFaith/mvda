'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Settings, User, Bell, Shield, Palette, Database } from 'lucide-react'
import DashboardNav from '@/components/DashboardNav'

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    setLoading(false)
  }

  return (
    <div className="flex bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 min-h-screen">
      <DashboardNav />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <p className="text-xs font-medium text-emerald-400 uppercase tracking-widest mb-2">Configuration</p>
          <h1 className="text-3xl font-semibold text-white tracking-tight">Settings</h1>
          <p className="text-slate-400 mt-2">Manage your account and application preferences</p>
        </div>

        {loading ? (
          <div className="text-center text-white py-12">Loading settings...</div>
        ) : (
          <div className="space-y-6">
            {/* Profile Section */}
            <div className="bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 shadow-lg p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Profile Settings</h2>
                  <p className="text-slate-400 text-sm">Manage your personal information</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-widest mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-slate-300 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-widest mb-2">
                    User ID
                  </label>
                  <input
                    type="text"
                    value={user?.id || ''}
                    disabled
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-slate-300 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 shadow-lg p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                  <Bell className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Notification Settings</h2>
                  <p className="text-slate-400 text-sm">Configure your notification preferences</p>
                </div>
              </div>

              <div className="space-y-4">
                {[
                  { label: 'Email notifications for completed diagnoses', checked: true },
                  { label: 'Email notifications for new constraints', checked: true },
                  { label: 'Weekly performance reports', checked: false },
                  { label: 'System updates and announcements', checked: true }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-slate-300">{item.label}</span>
                    <button
                      className={`w-12 h-6 rounded-full transition-all ${
                        item.checked ? 'bg-emerald-500' : 'bg-slate-600'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transform transition-all ${
                        item.checked ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Settings */}
            <div className="bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 shadow-lg p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Security Settings</h2>
                  <p className="text-slate-400 text-sm">Manage your security preferences</p>
                </div>
              </div>

              <div className="space-y-4">
                <button className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white transition-all">
                  Change Password
                </button>
                <button className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white transition-all">
                  Enable Two-Factor Authentication
                </button>
              </div>
            </div>

            {/* Appearance Settings */}
            <div className="bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 shadow-lg p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
                  <Palette className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Appearance</h2>
                  <p className="text-slate-400 text-sm">Customize your dashboard experience</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 uppercase tracking-widest mb-2">
                    Theme
                  </label>
                  <select className="w-full px-4 py-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl text-white">
                    <option value="dark">Dark (Default)</option>
                    <option value="light">Light</option>
                    <option value="system">System</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Data Management */}
            <div className="bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 shadow-lg p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Database className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Data Management</h2>
                  <p className="text-slate-400 text-sm">Export or manage your data</p>
                </div>
              </div>

              <div className="space-y-4">
                <button className="w-full px-4 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white transition-all">
                  Export All Data
                </button>
                <button className="w-full px-4 py-3 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-xl text-red-400 transition-all">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}