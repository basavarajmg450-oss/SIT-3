import { useState, useEffect } from 'react'
import { studentAPI } from '../../services/api'
import toast from 'react-hot-toast'

export default function ResumeWizard() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '', regNumber: '', branch: '', semester: '', cgpa: '', phone: '', skills: '', projectsText: '', achievements: '', certifications: ''
  })

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await studentAPI.getProfile()
        if (data.success && data.profile) {
          const p = data.profile
          setForm({
            name: p.name || '',
            regNumber: p.regNumber || '',
            branch: p.branch || '',
            semester: p.semester || '',
            cgpa: p.cgpa || '',
            phone: p.phone || '',
            skills: (p.skills || []).join(', '),
            projectsText: (p.projects || []).map(pr => pr.title || pr).join('\n'),
            achievements: (p.achievements || []).join('\n'),
            certifications: (p.certifications || []).map(c => c.name || c).join('\n')
          })
        }
      } catch (err) {
        // ignore
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleSaveAndGenerate = async () => {
    // basic client-side validation
    const valid = validateForm()
    if (!valid) return

    setSaving(true)
    try {
      const payload = {
        name: form.name,
        regNumber: form.regNumber,
        branch: form.branch,
        semester: form.semester,
        cgpa: form.cgpa,
        phone: form.phone,
        skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
        projects: form.projectsText.split('\n').map((line) => ({ title: line.trim() })).filter(p => p.title),
        achievements: form.achievements.split('\n').map(s => s.trim()).filter(Boolean),
        certifications: form.certifications.split('\n').map(s => ({ name: s.trim() })).filter(Boolean),
      }

      await studentAPI.updateProfile(payload)

      const res = await studentAPI.generateResume()
      const blob = new Blob([res.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${(form.name || 'resume').replace(/\s+/g, '_')}_Resume.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)

      toast.success('Resume generated and downloaded')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate resume')
    } finally {
      setSaving(false)
    }
  }

  const validateForm = () => {
    if (!form.name || !form.regNumber || !form.branch) {
      toast.error('Name, Registration Number and Branch are required')
      return false
    }
    if (form.cgpa) {
      const v = parseFloat(form.cgpa)
      if (Number.isNaN(v) || v < 0 || v > 10) { toast.error('CGPA must be a number between 0 and 10'); return false }
    }
    return true
  }

  if (loading) return <div className="p-6 bg-white rounded-2xl animate-pulse">Loading...</div>

  const skillsArray = (form.skills || '').split(',').map(s => s.trim()).filter(Boolean)
  const projectsArray = (form.projectsText || '').split('\n').map(s => s.trim()).filter(Boolean)
  const achievementsArray = (form.achievements || '').split('\n').map(s => s.trim()).filter(Boolean)
  const certsArray = (form.certifications || '').split('\n').map(s => s.trim()).filter(Boolean)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-4">
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-3">Resume Wizard</h2>
          <p className="text-sm text-gray-500 mb-4">Fill your profile below and generate a college-branded PDF resume.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="Full Name" className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm" />
            <input value={form.regNumber} onChange={(e) => setForm({...form, regNumber: e.target.value})} placeholder="Registration Number" className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm" />
            <input value={form.branch} onChange={(e) => setForm({...form, branch: e.target.value})} placeholder="Branch" className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm" />
            <input value={form.semester} onChange={(e) => setForm({...form, semester: e.target.value})} placeholder="Semester" className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm" />
            <input value={form.cgpa} onChange={(e) => setForm({...form, cgpa: e.target.value})} placeholder="CGPA" className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm" />
            <input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} placeholder="Phone" className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm" />
          </div>

          <div className="mt-4">
            <label className="text-sm text-gray-600">Skills (comma separated)</label>
            <textarea value={form.skills} onChange={(e) => setForm({...form, skills: e.target.value})} className="w-full mt-2 px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm" rows={2} />
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-600">Projects (one per line)</label>
              <textarea value={form.projectsText} onChange={(e) => setForm({...form, projectsText: e.target.value})} className="w-full mt-2 px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm" rows={4} />
            </div>
            <div>
              <label className="text-sm text-gray-600">Achievements (one per line)</label>
              <textarea value={form.achievements} onChange={(e) => setForm({...form, achievements: e.target.value})} className="w-full mt-2 px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm" rows={4} />
            </div>
          </div>

          <div className="mt-4">
            <label className="text-sm text-gray-600">Certifications (one per line)</label>
            <textarea value={form.certifications} onChange={(e) => setForm({...form, certifications: e.target.value})} className="w-full mt-2 px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm" rows={3} />
          </div>

          <div className="flex items-center justify-end gap-2 mt-4">
            <button disabled={saving} onClick={handleSaveAndGenerate} className="px-4 py-2 rounded-lg bg-indigo-600 text-white">{saving ? 'Generating...' : 'Save & Generate PDF'}</button>
          </div>
        </div>
      </div>

      <div>
        <div className="bg-white rounded-2xl p-6 border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-3">Live Preview</h3>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <div className="bg-indigo-600 p-4 text-white">
              <h2 className="text-xl font-bold">{form.name || 'Student Name'}</h2>
              <div className="text-sm opacity-90">{form.branch || 'Branch'} • Semester {form.semester || 'N/A'}</div>
            </div>
            <div className="p-4">
              <div className="text-xs text-gray-500 mb-3">Contact</div>
              <div className="text-sm mb-3">{form.phone || ''} {form.regNumber ? `• ${form.regNumber}` : ''}</div>

              <div className="text-xs text-gray-500 mb-2">Skills</div>
              <div className="flex flex-wrap gap-2 mb-3">
                {skillsArray.length === 0 ? <div className="text-sm text-gray-400">No skills yet</div> : skillsArray.map(s => <span key={s} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{s}</span>)}
              </div>

              <div className="text-xs text-gray-500 mb-2">Projects</div>
              <div className="space-y-2 mb-3">
                {projectsArray.length === 0 ? <div className="text-sm text-gray-400">No projects yet</div> : projectsArray.map((p,i) => (
                  <div key={i}>
                    <div className="font-medium text-sm">▸ {p}</div>
                  </div>
                ))}
              </div>

              <div className="text-xs text-gray-500 mb-2">Achievements</div>
              <ul className="list-disc pl-5 mb-3 text-sm text-gray-700">
                {achievementsArray.length === 0 ? <li className="text-gray-400">None</li> : achievementsArray.map((a,i) => <li key={i}>{a}</li>)}
              </ul>

              <div className="text-xs text-gray-500 mb-2">Certifications</div>
              <ul className="list-disc pl-5 text-sm text-gray-700">
                {certsArray.length === 0 ? <li className="text-gray-400">None</li> : certsArray.map((c,i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
