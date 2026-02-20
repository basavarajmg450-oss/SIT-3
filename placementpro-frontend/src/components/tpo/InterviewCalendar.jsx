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

  const weekDays = getWeekRange(startDate)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const start = weekDays[0].toISOString()
        const end = weekDays[weekDays.length - 1].toISOString()
        const { data } = await tpoAPI.getInterviewSlots({ start, end })
        if (data.success) setSlots(data.slots)
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
    </div>
  )
}

