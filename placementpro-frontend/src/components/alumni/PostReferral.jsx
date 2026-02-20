import { useState } from 'react'
import { motion } from 'framer-motion'
import { alumniAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { Save, Plus, Trash2 } from 'lucide-react'

const BRANCHES = ['CSE', 'IT', 'ECE', 'EEE', 'ME', 'CE', 'MCA', 'MBA', 'Other']

export default function PostReferral({ onSuccess }) {
  const [form, setForm] = useState({
    company: '', role: '', description: '', requirements: [''],
    minCGPA: 7.0, eligibleBranches: [], salaryRange: '', location: '',
    deadline: '', maxReferrals: 5,
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await alumniAPI.postReferral({
        ...form,
        requirements: form.requirements.filter(Boolean),
        minCGPA: parseFloat(form.minCGPA),
        maxReferrals: parseInt(form.maxReferrals),
      })
      if (data.success) {
        toast.success('Referral posted successfully! 🎉')
        onSuccess?.()
        setForm({ company: '', role: '', description: '', requirements: [''], minCGPA: 7.0, eligibleBranches: [], salaryRange: '', location: '', deadline: '', maxReferrals: 5 })
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post referral')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all'
  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-white rounded-2xl p-5 border border-gray-100 space-y-4">
        <h3 className="font-semibold text-gray-800 text-sm">Referral Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Company *</label>
            <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Your company name" className={inputClass} required />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Role *</label>
            <input type="text" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} placeholder="Software Engineer" className={inputClass} required />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Salary Range</label>
            <input type="text" value={form.salaryRange} onChange={(e) => setForm({ ...form, salaryRange: e.target.value })} placeholder="15-25 LPA" className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Location</label>
            <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Bangalore" className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Deadline *</label>
            <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} min={minDate} className={inputClass} required />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Min CGPA</label>
            <input type="number" value={form.minCGPA} onChange={(e) => setForm({ ...form, minCGPA: e.target.value })} min="0" max="10" step="0.1" className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Max Referrals</label>
            <input type="number" value={form.maxReferrals} onChange={(e) => setForm({ ...form, maxReferrals: e.target.value })} min="1" max="20" className={inputClass} />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Description *</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Job description and what you're looking for..." rows={3} className={inputClass} required />
        </div>

        <div>
          <label className="text-xs font-medium text-gray-600 mb-2 block">Eligible Branches</label>
          <div className="flex flex-wrap gap-2">
            {BRANCHES.map((b) => (
              <button key={b} type="button"
                onClick={() => setForm((f) => ({ ...f, eligibleBranches: f.eligibleBranches.includes(b) ? f.eligibleBranches.filter((x) => x !== b) : [...f.eligibleBranches, b] }))}
                className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition-all ${form.eligibleBranches.includes(b) ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'}`}>
                {b}
              </button>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-medium text-gray-600">Requirements</label>
            <button type="button" onClick={() => setForm((f) => ({ ...f, requirements: [...f.requirements, ''] }))} className="text-xs text-indigo-600 font-medium flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded-lg">
              <Plus className="w-3 h-3" /> Add
            </button>
          </div>
          {form.requirements.map((req, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input value={req} onChange={(e) => { const arr = [...form.requirements]; arr[idx] = e.target.value; setForm({ ...form, requirements: arr }) }} placeholder="React, Python..." className={`${inputClass} flex-1`} />
              <button type="button" onClick={() => setForm((f) => ({ ...f, requirements: f.requirements.filter((_, i) => i !== idx) }))} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
            </div>
          ))}
        </div>
      </div>

      <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.98 }} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60">
        {loading ? <motion.div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity }} /> : <><Save className="w-4 h-4" /> Post Referral</>}
      </motion.button>
    </form>
  )
}
