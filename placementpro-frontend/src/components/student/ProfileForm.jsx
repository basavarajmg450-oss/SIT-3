import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { studentAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { Plus, Trash2, Download, Save } from 'lucide-react'

const BRANCHES = ['CSE', 'IT', 'ECE', 'EEE', 'ME', 'CE', 'MCA', 'MBA', 'Other']

const emptyProject = { title: '', description: '', techStack: [], duration: '', link: '' }

export default function ProfileForm({ onSave }) {
  const { profile: existingProfile, updateProfile, user } = useAuth()
  const [form, setForm] = useState({
    name: '', regNumber: '', branch: 'CSE', semester: '', cgpa: '', backlogs: 0,
    phone: '', skills: '', linkedin: '', github: '', achievements: '',
    projects: [],
  })
  const [loading, setLoading] = useState(false)
  const [genResume, setGenResume] = useState(false)
  const [techInput, setTechInput] = useState({})

  useEffect(() => {
    if (existingProfile) {
      setForm({
        name: existingProfile.name || '',
        regNumber: existingProfile.regNumber || '',
        branch: existingProfile.branch || 'CSE',
        semester: existingProfile.semester || '',
        cgpa: existingProfile.cgpa || '',
        backlogs: existingProfile.backlogs || 0,
        phone: existingProfile.phone || '',
        skills: existingProfile.skills?.join(', ') || '',
        linkedin: existingProfile.linkedin || '',
        github: existingProfile.github || '',
        achievements: existingProfile.achievements?.join('\n') || '',
        projects: existingProfile.projects || [],
      })
    }
  }, [existingProfile])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const payload = {
        ...form,
        cgpa: parseFloat(form.cgpa),
        backlogs: parseInt(form.backlogs),
        semester: parseInt(form.semester),
        skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean),
        achievements: form.achievements.split('\n').map((a) => a.trim()).filter(Boolean),
      }
      const { data } = await studentAPI.updateProfile(payload)
      if (data.success) {
        updateProfile(data.profile)
        toast.success('Profile saved successfully! ✅')
        onSave?.()
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save profile')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateResume = async () => {
    setGenResume(true)
    try {
      const { data } = await studentAPI.generateResume()
      const blob = new Blob([data], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${form.name.replace(/\s+/g, '_') || 'Resume'}.pdf`
      link.click()
      URL.revokeObjectURL(url)
      toast.success('Resume downloaded! 📄')
    } catch {
      toast.error('Save your profile first, then generate resume')
    } finally {
      setGenResume(false)
    }
  }

  const addProject = () => setForm((f) => ({ ...f, projects: [...f.projects, { ...emptyProject }] }))
  const removeProject = (idx) => setForm((f) => ({ ...f, projects: f.projects.filter((_, i) => i !== idx) }))
  const updateProject = (idx, field, value) => {
    setForm((f) => {
      const projs = [...f.projects]
      projs[idx] = { ...projs[idx], [field]: value }
      return { ...f, projects: projs }
    })
  }

  const addTechStack = (idx) => {
    const val = (techInput[idx] || '').trim()
    if (!val) return
    updateProject(idx, 'techStack', [...(form.projects[idx].techStack || []), val])
    setTechInput((t) => ({ ...t, [idx]: '' }))
  }

  const removeTechStack = (projIdx, techIdx) => {
    const newStack = form.projects[projIdx].techStack.filter((_, i) => i !== techIdx)
    updateProject(projIdx, 'techStack', newStack)
  }

  const inputClass = 'w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all'

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
        <button
          type="button"
          onClick={handleGenerateResume}
          disabled={genResume}
          className="flex items-center gap-2 text-sm bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-xl hover:bg-emerald-100 transition-colors font-medium"
        >
          {genResume ? (
            <motion.div className="w-4 h-4 border-2 border-emerald-400 border-t-emerald-700 rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity }} />
          ) : <Download className="w-4 h-4" />}
          Download Resume
        </button>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-gray-100 space-y-4">
        <h3 className="font-semibold text-gray-800 text-sm">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Full Name *</label>
            <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter full name" className={inputClass} required />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Registration Number</label>
            <input type="text" value={form.regNumber} onChange={(e) => setForm({ ...form, regNumber: e.target.value })} placeholder="CSE2021001" className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Branch *</label>
            <select value={form.branch} onChange={(e) => setForm({ ...form, branch: e.target.value })} className={inputClass} required>
              {BRANCHES.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Semester</label>
            <input type="number" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} placeholder="8" min="1" max="10" className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">CGPA *</label>
            <input type="number" value={form.cgpa} onChange={(e) => setForm({ ...form, cgpa: e.target.value })} placeholder="8.5" min="0" max="10" step="0.1" className={inputClass} required />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Active Backlogs</label>
            <input type="number" value={form.backlogs} onChange={(e) => setForm({ ...form, backlogs: e.target.value })} placeholder="0" min="0" className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">Phone</label>
            <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="9876543210" className={inputClass} />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-600 mb-1 block">LinkedIn URL</label>
            <input type="text" value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} placeholder="linkedin.com/in/username" className={inputClass} />
          </div>
          <div className="md:col-span-2">
            <label className="text-xs font-medium text-gray-600 mb-1 block">GitHub URL</label>
            <input type="text" value={form.github} onChange={(e) => setForm({ ...form, github: e.target.value })} placeholder="github.com/username" className={inputClass} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-gray-100 space-y-3">
        <h3 className="font-semibold text-gray-800 text-sm">Skills</h3>
        <textarea
          value={form.skills}
          onChange={(e) => setForm({ ...form, skills: e.target.value })}
          placeholder="JavaScript, React, Node.js, Python, SQL, Git..."
          rows={3}
          className={inputClass}
        />
        <p className="text-xs text-gray-400">Separate skills with commas</p>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-gray-100 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 text-sm">Projects</h3>
          <button type="button" onClick={addProject} className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700 font-medium bg-indigo-50 px-3 py-1.5 rounded-lg">
            <Plus className="w-3.5 h-3.5" /> Add Project
          </button>
        </div>

        {form.projects.map((project, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-600">Project {idx + 1}</span>
              <button type="button" onClick={() => removeProject(idx)} className="text-red-400 hover:text-red-600 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Title *</label>
                <input value={project.title} onChange={(e) => updateProject(idx, 'title', e.target.value)} placeholder="Project Title" className={inputClass} />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Duration</label>
                <input value={project.duration} onChange={(e) => updateProject(idx, 'duration', e.target.value)} placeholder="2 months" className={inputClass} />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-gray-500 mb-1 block">Description</label>
                <textarea value={project.description} onChange={(e) => updateProject(idx, 'description', e.target.value)} placeholder="Brief project description..." rows={2} className={inputClass} />
              </div>
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-gray-500 mb-1 block">Tech Stack</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {(project.techStack || []).map((tech, tIdx) => (
                    <span key={tIdx} className="flex items-center gap-1 bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-lg">
                      {tech}
                      <button type="button" onClick={() => removeTechStack(idx, tIdx)} className="text-indigo-400 hover:text-indigo-700">×</button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={techInput[idx] || ''}
                    onChange={(e) => setTechInput((t) => ({ ...t, [idx]: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTechStack(idx))}
                    placeholder="React, Node.js..."
                    className={`${inputClass} flex-1`}
                  />
                  <button type="button" onClick={() => addTechStack(idx)} className="px-3 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs hover:bg-indigo-100 transition-colors font-medium">Add</button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {form.projects.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-4">No projects added yet. Click "Add Project" to get started.</p>
        )}
      </div>

      <div className="bg-white rounded-2xl p-5 border border-gray-100">
        <h3 className="font-semibold text-gray-800 text-sm mb-3">Achievements</h3>
        <textarea
          value={form.achievements}
          onChange={(e) => setForm({ ...form, achievements: e.target.value })}
          placeholder="Won First Prize in Hackathon 2023&#10;Google Kickstart Qualifier&#10;Published research paper..."
          rows={4}
          className={inputClass}
        />
        <p className="text-xs text-gray-400 mt-1">One achievement per line</p>
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
          <><Save className="w-4 h-4" /> Save Profile</>
        )}
      </motion.button>
    </form>
  )
}
