import { useState } from 'react'
import { motion } from 'framer-motion'
import { tpoAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { Plus, Trash2, Save } from 'lucide-react'

const BRANCHES = ['CSE', 'IT', 'ECE', 'EEE', 'ME', 'CE', 'MCA', 'MBA', 'Other']
const WORK_MODES = ['On-site', 'Remote', 'Hybrid']

export default function CreateDrive({ onSuccess }) {
  const [form, setForm] = useState({
    title: '', company: '', description: '', jobRole: '',
    minCGPA: 7.0, maxBacklogs: 0, eligibleBranches: [],
    salaryMin: '', salaryMax: '', location: '', workMode: 'Hybrid',
    driveDate: '', deadline: '', requirements: [''], perks: [''],
    maxHires: '',
  })
  const [loading, setLoading] = useState(false)

  const handleBranchToggle = (branch) => {
    setForm((f) => ({
      ...f,
      eligibleBranches: f.eligibleBranches.includes(branch)
        ? f.eligibleBranches.filter((b) => b !== branch)
        : [...f.eligibleBranches, branch],
    }))
  }

  const handleListChange = (field, idx, value) => {
    setForm((f) => {
      const arr = [...f[field]]
      arr[idx] = value
      return { ...f, [field]: arr }
    })
  }

  const addListItem = (field) => setForm((f) => ({ ...f, [field]: [...f[field], ''] }))
  const removeListItem = (field, idx) => setForm((f) => ({ ...f, [field]: f[field].filter((_, i) => i !== idx) }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.eligibleBranches.length === 0) return toast.error('Select at least one eligible branch')
    setLoading(true)
    try {
      const payload = {
        ...form,
        minCGPA: parseFloat(form.minCGPA),
        maxBacklogs: parseInt(form.maxBacklogs),
        salaryMin: form.salaryMin ? parseInt(form.salaryMin) : undefined,
        salaryMax: form.salaryMax ? parseInt(form.salaryMax) : undefined,
        maxHires: form.maxHires ? parseInt(form.maxHires) : undefined,
        requirements: form.requirements.filter(Boolean),
        perks: form.perks.filter(Boolean),
      }
      const { data } = await tpoAPI.createDrive(payload)
      if (data.success) {
        toast.success(data.message)
        onSuccess?.()
        setForm({
          title: '', company: '', description: '', jobRole: '',
          minCGPA: 7.0, maxBacklogs: 0, eligibleBranches: [],
          salaryMin: '', salaryMax: '', location: '', workMode: 'Hybrid',
          driveDate: '', deadline: '', requirements: [''], perks: [''], maxHires: '',
        })
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create drive')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = 'w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all'

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-2xl p-5 border border-gray-100 space-y-4">
        <h3 className="font-semibold text-gray-800 text-sm">Drive Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Company Name *</label>
            <input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="TCS, Infosys, Amazon..." className={inputClass} required />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Drive Title *</label>
            <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Software Engineer - Full Stack" className={inputClass} required />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Job Role *</label>
            <input type="text" value={form.jobRole} onChange={(e) => setForm({ ...form, jobRole: e.target.value })} placeholder="Software Engineer" className={inputClass} required />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Work Mode</label>
            <select value={form.workMode} onChange={(e) => setForm({ ...form, workMode: e.target.value })} className={inputClass}>
              {WORK_MODES.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Location</label>
            <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="Hyderabad / Bangalore" className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Max Hires</label>
            <input type="number" value={form.maxHires} onChange={(e) => setForm({ ...form, maxHires: e.target.value })} placeholder="10" min="1" className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Drive Date *</label>
            <input type="date" value={form.driveDate} onChange={(e) => setForm({ ...form, driveDate: e.target.value })} min={minDate} className={inputClass} required />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Application Deadline *</label>
            <input type="date" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} min={minDate} className={inputClass} required />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-1 block">Job Description *</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Detailed job description..." rows={3} className={inputClass} required />
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-gray-100 space-y-4">
        <h3 className="font-semibold text-gray-800 text-sm">Eligibility Criteria</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Minimum CGPA *</label>
            <input type="number" value={form.minCGPA} onChange={(e) => setForm({ ...form, minCGPA: e.target.value })} placeholder="7.0" min="0" max="10" step="0.1" className={inputClass} required />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Max Backlogs *</label>
            <input type="number" value={form.maxBacklogs} onChange={(e) => setForm({ ...form, maxBacklogs: e.target.value })} placeholder="0" min="0" className={inputClass} required />
          </div>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-600 mb-2 block">Eligible Branches *</label>
          <div className="flex flex-wrap gap-2">
            {BRANCHES.map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => handleBranchToggle(b)}
                className={`text-sm px-3 py-1.5 rounded-xl border font-medium transition-all ${
                  form.eligibleBranches.includes(b)
                    ? 'bg-indigo-500 text-white border-indigo-500'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-gray-100 space-y-4">
        <h3 className="font-semibold text-gray-800 text-sm">Salary & Package</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Min Salary (₹/year)</label>
            <input type="number" value={form.salaryMin} onChange={(e) => setForm({ ...form, salaryMin: e.target.value })} placeholder="700000" className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Max Salary (₹/year)</label>
            <input type="number" value={form.salaryMax} onChange={(e) => setForm({ ...form, salaryMax: e.target.value })} placeholder="1000000" className={inputClass} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-gray-100 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 text-sm">Requirements</h3>
          <button type="button" onClick={() => addListItem('requirements')} className="text-xs text-indigo-600 font-medium flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded-lg">
            <Plus className="w-3 h-3" /> Add
          </button>
        </div>
        {form.requirements.map((req, idx) => (
          <div key={idx} className="flex gap-2">
            <input value={req} onChange={(e) => handleListChange('requirements', idx, e.target.value)} placeholder="Data Structures, React..." className={`${inputClass} flex-1`} />
            <button type="button" onClick={() => removeListItem('requirements', idx)} className="text-red-400 hover:text-red-600 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <motion.button
        type="submit"
        disabled={loading}
        whileTap={{ scale: 0.98 }}
        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {loading ? (
          <motion.div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity }} />
        ) : (
          <><Save className="w-4 h-4" /> Create Drive & Notify Students</>
        )}
      </motion.button>
    </form>
  )
}
