import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { alumniAPI } from '../services/api'
import Navbar from '../components/common/Navbar'
import Sidebar from '../components/common/Sidebar'
import { StatCard } from '../components/common/Card'
import PostReferral from '../components/alumni/PostReferral'
import toast from 'react-hot-toast'
import { formatDate, getStatusColor } from '../utils/helpers'
import { Plus, Save } from 'lucide-react'

function Home() {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [referrals, setReferrals] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const { data } = await alumniAPI.getReferrals()
      if (data.success) setReferrals(data.referrals)
    } catch {} finally { setLoading(false) }
  }

  const stats = [
    { icon: '🔗', label: 'Referrals Posted', value: profile?.totalReferrals || referrals.length, color: 'indigo' },
    { icon: '🤝', label: 'Mentorships Given', value: profile?.totalMentorships || 0, color: 'emerald' },
    { icon: '⭐', label: 'Rating', value: `${(profile?.rating || 4.5).toFixed(1)}/5`, color: 'amber' },
    { icon: '📅', label: 'Available Slots', value: profile?.slots?.filter((s) => !s.isBooked)?.length || 0, color: 'purple' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome, {profile?.name?.split(' ')[0] || 'Alumni'}! 🌟</h1>
        <p className="text-gray-500 text-sm mt-0.5">Help students launch their careers</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <StatCard {...s} />
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">My Referrals</h2>
              <button onClick={() => navigate('/alumni/referrals')} className="text-xs text-indigo-600 font-medium">View all →</button>
            </div>
            {referrals.length === 0 ? (
              <div className="text-center py-6"><div className="text-3xl mb-2">🔗</div><p className="text-gray-400 text-sm">No referrals yet. Post your first referral!</p></div>
            ) : (
              <div className="space-y-2">
                {referrals.slice(0, 3).map((ref) => (
                  <div key={ref._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{ref.role} at {ref.company}</p>
                      <p className="text-xs text-gray-500">{ref.applicants?.length || 0}/{ref.maxReferrals} applied</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${getStatusColor(ref.status)}`}>{ref.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-4">⚡ Quick Actions</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Post Referral', icon: '🔗', action: () => navigate('/alumni/referrals') },
                { label: 'Add Mentorship Slots', icon: '📅', action: () => navigate('/alumni/mentorship') },
                { label: 'Update Profile', icon: '👤', action: () => navigate('/alumni/profile') },
                { label: 'Interview Reviews', icon: '⭐', action: () => navigate('/alumni/reviews') },
              ].map((a) => (
                <motion.button key={a.label} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={a.action}
                  className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl hover:bg-indigo-50 hover:text-indigo-700 transition-all text-left">
                  <span className="text-xl">{a.icon}</span>
                  <span className="text-sm font-medium text-gray-700">{a.label}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {profile && (
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                  {profile.name?.[0] || '?'}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{profile.name}</h3>
                  <p className="text-sm text-indigo-600 font-medium">{profile.designation}</p>
                  <p className="text-xs text-gray-500">{profile.company} • Batch {profile.graduationYear}</p>
                </div>
              </div>
              {profile.bio && <p className="text-xs text-gray-600 mb-3">{profile.bio}</p>}
              {profile.skills?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {profile.skills.slice(0, 4).map((s) => <span key={s} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">{s}</span>)}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function AlumniProfile() {
  const { profile, updateProfile } = useAuth()
  const [form, setForm] = useState({ name: '', graduationYear: '', branch: 'CSE', company: '', designation: '', domain: '', linkedin: '', bio: '', skills: '', mentorshipAvailable: false })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (profile) setForm({ name: profile.name || '', graduationYear: profile.graduationYear || '', branch: profile.branch || 'CSE', company: profile.company || '', designation: profile.designation || '', domain: profile.domain || '', linkedin: profile.linkedin || '', bio: profile.bio || '', skills: profile.skills?.join(', ') || '', mentorshipAvailable: profile.mentorshipAvailable || false })
  }, [profile])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data } = await alumniAPI.updateProfile({ ...form, skills: form.skills.split(',').map((s) => s.trim()).filter(Boolean) })
      if (data.success) { updateProfile(data.profile); toast.success('Profile saved!') }
    } catch { toast.error('Failed to save') } finally { setLoading(false) }
  }

  const inputClass = 'w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all'

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Alumni Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="text-xs font-medium text-gray-600 mb-1 block">Full Name *</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} required /></div>
            <div><label className="text-xs font-medium text-gray-600 mb-1 block">Graduation Year</label><input type="number" value={form.graduationYear} onChange={(e) => setForm({ ...form, graduationYear: e.target.value })} placeholder="2020" className={inputClass} /></div>
            <div><label className="text-xs font-medium text-gray-600 mb-1 block">Company *</label><input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="Google, Microsoft..." className={inputClass} required /></div>
            <div><label className="text-xs font-medium text-gray-600 mb-1 block">Designation *</label><input type="text" value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} placeholder="Software Engineer" className={inputClass} required /></div>
            <div><label className="text-xs font-medium text-gray-600 mb-1 block">Domain</label><input type="text" value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} placeholder="Backend, AI/ML..." className={inputClass} /></div>
            <div><label className="text-xs font-medium text-gray-600 mb-1 block">LinkedIn URL</label><input type="text" value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} placeholder="linkedin.com/in/username" className={inputClass} /></div>
          </div>
          <div><label className="text-xs font-medium text-gray-600 mb-1 block">Bio</label><textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="Tell students about yourself..." rows={3} className={inputClass} maxLength={500} /></div>
          <div><label className="text-xs font-medium text-gray-600 mb-1 block">Skills (comma separated)</label><input type="text" value={form.skills} onChange={(e) => setForm({ ...form, skills: e.target.value })} placeholder="Python, React, System Design..." className={inputClass} /></div>
          <div className="flex items-center gap-3">
            <input type="checkbox" id="mentorship" checked={form.mentorshipAvailable} onChange={(e) => setForm({ ...form, mentorshipAvailable: e.target.checked })} className="w-4 h-4 rounded text-indigo-600" />
            <label htmlFor="mentorship" className="text-sm text-gray-700 font-medium">Available for Mentorship</label>
          </div>
        </div>
        <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.98 }} className="btn-primary flex items-center gap-2 disabled:opacity-60">
          {loading ? <motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity }} /> : <><Save className="w-4 h-4" /> Save Profile</>}
        </motion.button>
      </form>
    </div>
  )
}

function ManageReferrals() {
  const [referrals, setReferrals] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadReferrals() }, [])
  const loadReferrals = async () => {
    try { const { data } = await alumniAPI.getReferrals(); if (data.success) setReferrals(data.referrals) }
    catch {} finally { setLoading(false) }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Referrals 🔗</h1>
        <button onClick={() => setShowCreate(!showCreate)} className="btn-primary text-sm flex items-center gap-2"><Plus className="w-4 h-4" />{showCreate ? 'Cancel' : 'Post Referral'}</button>
      </div>
      {showCreate && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl p-5 border border-gray-100"><PostReferral onSuccess={() => { setShowCreate(false); loadReferrals() }} /></motion.div>}
      {loading ? <div className="text-center py-10"><motion.div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-500 rounded-full mx-auto" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity }} /></div> : (
        <div className="space-y-3">
          {referrals.map((ref, i) => (
            <motion.div key={ref._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-2xl p-5 border border-gray-100">
              <div className="flex items-start justify-between mb-2">
                <div><h3 className="font-semibold text-gray-900">{ref.role}</h3><p className="text-indigo-600 font-medium text-sm">{ref.company}</p></div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${getStatusColor(ref.status)}`}>{ref.status}</span>
              </div>
              <div className="flex gap-3 text-xs text-gray-500">
                <span>{ref.applicants?.length || 0}/{ref.maxReferrals} applied</span>
                <span>Deadline: {formatDate(ref.deadline)}</span>
                {ref.salaryRange && <span>💰 {ref.salaryRange}</span>}
              </div>
              {ref.applicants?.length > 0 && (
                <div className="mt-3 border-t border-gray-100 pt-3">
                  <p className="text-xs font-semibold text-gray-600 mb-2">Applicants:</p>
                  <div className="space-y-1">
                    {ref.applicants.slice(0, 3).map((a) => (
                      <div key={a._id} className="flex items-center justify-between text-xs">
                        <span className="text-gray-700">{a.studentName}</span>
                        <span className={`px-2 py-0.5 rounded-full font-medium border ${getStatusColor(a.status)}`}>{a.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
          {referrals.length === 0 && <div className="text-center py-10"><div className="text-4xl mb-3">🔗</div><p className="text-gray-500">No referrals posted yet</p></div>}
        </div>
      )}
    </div>
  )
}

function MentorshipSlots() {
  const { profile, updateProfile } = useAuth()
  const [slots, setSlots] = useState([{ date: '', time: '', topic: 'General Mentorship', duration: 60 }])
  const [loading, setLoading] = useState(false)

  const handleAddSlots = async () => {
    setLoading(true)
    try {
      const validSlots = slots.filter((s) => s.date && s.time)
      if (validSlots.length === 0) return toast.error('Please fill all slot details')
      const { data } = await alumniAPI.addMentorshipSlots({ slots: validSlots })
      if (data.success) { toast.success(`${validSlots.length} slots added!`); setSlots([{ date: '', time: '', topic: 'General Mentorship', duration: 60 }]) }
    } catch { toast.error('Failed to add slots') } finally { setLoading(false) }
  }

  const inputClass = 'px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all'
  const topics = ['Resume Review', 'Mock Interview', 'Career Guidance', 'Technical Interview Prep', 'General Mentorship']

  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-bold text-gray-900">Mentorship Slots 📅</h1>
      <div className="bg-white rounded-2xl p-5 border border-gray-100 space-y-4">
        <h3 className="font-semibold text-gray-800 text-sm">Add New Slots</h3>
        {slots.map((slot, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-gray-50 rounded-xl">
            <div><label className="text-xs text-gray-500 mb-1 block">Date</label><input type="date" value={slot.date} onChange={(e) => setSlots((s) => s.map((x, idx) => idx === i ? { ...x, date: e.target.value } : x))} className={`${inputClass} w-full`} /></div>
            <div><label className="text-xs text-gray-500 mb-1 block">Time</label><input type="time" value={slot.time} onChange={(e) => setSlots((s) => s.map((x, idx) => idx === i ? { ...x, time: e.target.value } : x))} className={`${inputClass} w-full`} /></div>
            <div><label className="text-xs text-gray-500 mb-1 block">Topic</label>
              <select value={slot.topic} onChange={(e) => setSlots((s) => s.map((x, idx) => idx === i ? { ...x, topic: e.target.value } : x))} className={`${inputClass} w-full`}>
                {topics.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex items-end"><button type="button" onClick={() => setSlots((s) => s.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-600 px-3 py-2 rounded-xl border border-red-100 hover:border-red-200 transition-colors text-sm">Remove</button></div>
          </motion.div>
        ))}
        <div className="flex gap-3">
          <button type="button" onClick={() => setSlots((s) => [...s, { date: '', time: '', topic: 'General Mentorship', duration: 60 }])} className="flex items-center gap-2 text-sm text-indigo-600 bg-indigo-50 px-4 py-2 rounded-xl hover:bg-indigo-100 transition-colors font-medium"><Plus className="w-4 h-4" /> Add Another Slot</button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={handleAddSlots} disabled={loading} className="btn-primary text-sm flex items-center gap-2 disabled:opacity-60">
            {loading ? <motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity }} /> : <><Save className="w-4 h-4" /> Save Slots</>}
          </motion.button>
        </div>
      </div>
    </div>
  )
}

function InterviewReviews() {
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    alumniAPI.getInterviewReviews().then(({ data }) => { if (data.success) setReviews(data.reviews) }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Interview Reviews ⭐</h1>
      {loading ? <div className="text-center py-10"><motion.div className="w-8 h-8 border-2 border-indigo-200 border-t-indigo-500 rounded-full mx-auto" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity }} /></div> : reviews.length === 0 ? (
        <div className="text-center py-10"><div className="text-4xl mb-3">⭐</div><p className="text-gray-500">No interview reviews yet</p></div>
      ) : (
        <div className="space-y-3">
          {reviews.map((r, i) => (
            <motion.div key={r._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="bg-white rounded-2xl p-4 border border-gray-100">
              <div className="flex justify-between mb-2">
                <div><p className="font-semibold text-gray-900 text-sm">{r.driveId?.company}</p><p className="text-xs text-gray-500">{r.type} Round</p></div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${getStatusColor(r.result)}`}>{r.result}</span>
              </div>
              {r.feedback && <p className="text-sm text-gray-600">{r.feedback}</p>}
              {r.rating && <div className="flex gap-1 mt-2">{[...Array(5)].map((_, idx) => <span key={idx} className={idx < r.rating ? 'text-amber-400' : 'text-gray-200'}>⭐</span>)}</div>}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AlumniDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} sidebarOpen={sidebarOpen} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="lg:ml-64 pt-16">
        <div className="p-4 lg:p-6 max-w-6xl mx-auto">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<AlumniProfile />} />
            <Route path="/referrals" element={<ManageReferrals />} />
            <Route path="/mentorship" element={<MentorshipSlots />} />
            <Route path="/reviews" element={<InterviewReviews />} />
          </Routes>
        </div>
      </main>
    </div>
  )
}
