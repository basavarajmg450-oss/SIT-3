import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { tpoAPI } from '../../services/api'
import toast from 'react-hot-toast'

const dayLabel = (date) =>
  date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })

const getWeekRange = (startDate) => {
  const start = new Date(startDate)
  start.setHours(0, 0, 0, 0)
  const days = []
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    days.push(d)
  }
  return days
}

export default function InterviewCalendar() {
  const [startDate, setStartDate] = useState(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
  })
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [drives, setDrives] = useState([])
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedDrive, setSelectedDrive] = useState('')
  const [eligibleStudents, setEligibleStudents] = useState([])
  const [studentToSchedule, setStudentToSchedule] = useState('')
  const [newDate, setNewDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [newTime, setNewTime] = useState('10:00')
  const [creating, setCreating] = useState(false)

  const weekDays = getWeekRange(startDate)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const start = weekDays[0].toISOString()
        const end = weekDays[weekDays.length - 1].toISOString()
        const { data } = await tpoAPI.getInterviewSlots({ start, end })
        if (data.success) setSlots(data.slots)
        // load drives for quick scheduling
        const drivesRes = await tpoAPI.getDrives({ limit: 100 })
        if (drivesRes.data.success) setDrives(drivesRes.data.drives)
      } catch {
        toast.error('Failed to load interview schedule')
      } finally {
        setLoading(false)
      }
    }
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate])

  const grouped = slots.reduce((acc, slot) => {
    const key = new Date(slot.date).toISOString().slice(0, 10)
    acc[key] = acc[key] || []
    acc[key].push(slot)
    return acc
  }, {})

  const changeWeek = (direction) => {
    const next = new Date(startDate)
    next.setDate(startDate.getDate() + direction * 7)
    setStartDate(next)
  }

  const openCreate = () => {
    setSelectedDrive(drives[0]?._id || '')
    setStudentToSchedule('')
    setNewDate(new Date().toISOString().slice(0,10))
    setNewTime('10:00')
    setCreateOpen(true)
  }

  const loadEligible = async (driveId) => {
    try {
      if (!driveId) return setEligibleStudents([])
      const { data } = await tpoAPI.getEligibleStudents(driveId)
      if (data.success) setEligibleStudents(data.students || [])
    } catch {
      toast.error('Failed to load eligible students')
    }
  }

  useEffect(() => { if (selectedDrive) loadEligible(selectedDrive) }, [selectedDrive])

  const getStudentUserId = (s) => (typeof s.userId === 'string' ? s.userId : s.userId?._id?.toString?.() || s.userId?.toString?.()) || s._id?.toString?.() || ''

  const handleCreate = async () => {
    if (!selectedDrive || !studentToSchedule || !newDate || !newTime) return toast.error('Fill all fields')
    setCreating(true)
    try {
      const payload = { driveId: selectedDrive, studentId: studentToSchedule, date: newDate, time: newTime, type: 'Technical', mode: 'Online' }
      const { data } = await tpoAPI.scheduleInterview(payload)
      if (data.success) {
        toast.success(data.message || 'Interview scheduled')
        setCreateOpen(false)
        // reload slots
        const start = weekDays[0].toISOString()
        const end = weekDays[weekDays.length - 1].toISOString()
        const res = await tpoAPI.getInterviewSlots({ start, end })
        if (res.data.success) setSlots(res.data.slots)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to schedule interview')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Interview Calendar</h2>
          <p className="text-xs text-gray-500">
            Scheduling is done from each drive&apos;s eligible students. This calendar gives you a weekly overview.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => changeWeek(-1)}
            className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            ← Prev
          </button>
          <button
            onClick={() => changeWeek(1)}
            className="px-2.5 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
          >
            Next →
          </button>
          <button onClick={openCreate} className="ml-3 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-sm">Create Slot</button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="grid grid-cols-7 min-w-[900px] gap-3">
          {weekDays.map((day) => {
            const key = day.toISOString().slice(0, 10)
            const daySlots = grouped[key] || []
            return (
              <div key={key} className="bg-white rounded-2xl border border-gray-100 p-3 flex flex-col h-80">
                <div className="mb-2">
                  <p className="text-xs font-semibold text-gray-700">{dayLabel(day)}</p>
                  <p className="text-[11px] text-gray-400">
                    {daySlots.length > 0 ? `${daySlots.length} interviews` : 'No interviews'}
                  </p>
                </div>
                <div className="flex-1 space-y-2 overflow-y-auto scrollbar-thin">
                  {loading && (
                    <div className="space-y-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />
                      ))}
                    </div>
                  )}
                  {!loading &&
                    daySlots.map((slot) => (
                      <motion.div
                        key={slot.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100 text-[11px] space-y-0.5"
                      >
                        <p className="font-semibold text-indigo-800">
                          {slot.time} • {slot.type}
                        </p>
                        <p className="text-gray-700 truncate">{slot.driveCompany}</p>
                        <p className="text-gray-500 truncate">{slot.driveTitle}</p>
                        <p className="text-gray-400 truncate">{slot.studentEmail}</p>
                      </motion.div>
                    ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
      {createOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg bg-white rounded-2xl p-6 shadow-lg">
            <h3 className="font-semibold text-gray-800 mb-3">Create Interview Slot</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-xs text-gray-600 block mb-1">Drive</label>
                <select value={selectedDrive} onChange={(e) => setSelectedDrive(e.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm">
                  <option value="">Select drive</option>
                  {drives.map((d) => <option key={d._id} value={d._id}>{d.company} - {d.title}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">Student</label>
                <select value={studentToSchedule} onChange={(e) => setStudentToSchedule(e.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm">
                  <option value="">Select student</option>
                  {eligibleStudents.map((s) => (
                    <option key={s._id} value={getStudentUserId(s)}>{s.name} • {s.regNumber}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">Date</label>
                <input type="date" value={newDate} onChange={(e) => setNewDate(e.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">Time</label>
                <input type="time" value={newTime} onChange={(e) => setNewTime(e.target.value)} className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setCreateOpen(false)} className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm">Cancel</button>
              <button disabled={creating} onClick={handleCreate} className="px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-sm">{creating ? 'Creating...' : 'Create Slot'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

