import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { alumniAPI } from '../../services/api'
import { formatDate } from '../../utils/helpers'
import toast from 'react-hot-toast'
import { Calendar, Clock, Star, ExternalLink } from 'lucide-react'

export default function MentorshipBooking() {
  const [mentors, setMentors] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [bookingSlot, setBookingSlot] = useState(null)
  const [topic, setTopic] = useState('')
  const [booking, setBooking] = useState(false)

  useEffect(() => {
    loadMentors()
  }, [])

  const loadMentors = async () => {
    try {
      const { data } = await alumniAPI.getMentorshipSlots()
      if (data.success) setMentors(data.mentors)
    } catch {
      toast.error('Failed to load mentors')
    } finally {
      setLoading(false)
    }
  }

  const handleBook = async (mentor, slot) => {
    setBooking(true)
    try {
      const { data } = await alumniAPI.bookMentorship({ alumniId: mentor._id, slotId: slot._id, topic })
      if (data.success) {
        toast.success('Mentorship slot booked! 🎉')
        setSelected(null)
        setBookingSlot(null)
        setTopic('')
        loadMentors()
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to book slot')
    } finally {
      setBooking(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse">
            <div className="flex gap-3">
              <div className="w-12 h-12 bg-gray-200 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-3/4" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {mentors.length === 0 ? (
        <div className="text-center py-10">
          <div className="text-4xl mb-3">🤝</div>
          <p className="text-gray-500 font-medium">No mentors available right now</p>
          <p className="text-gray-400 text-sm mt-1">Check back later for mentorship slots</p>
        </div>
      ) : (
        mentors.map((mentor, i) => (
          <motion.div
            key={mentor._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl border border-gray-100 overflow-hidden"
          >
            <div
              className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setSelected(selected?._id === mentor._id ? null : mentor)}
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {mentor.name[0]}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{mentor.name}</h4>
                  <p className="text-sm text-indigo-600 font-medium">{mentor.designation} @ {mentor.company}</p>
                  {mentor.bio && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{mentor.bio}</p>}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-xs text-amber-600">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {(mentor.rating || 4.5).toFixed(1)} ({mentor.reviewCount || 0} reviews)
                    </span>
                    <span className="text-xs text-emerald-600 font-medium">{mentor.availableSlots?.length} slots available</span>
                  </div>
                </div>
              </div>

              {mentor.skills?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {mentor.skills.slice(0, 4).map((skill) => (
                    <span key={skill} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">{skill}</span>
                  ))}
                </div>
              )}
            </div>

            <AnimatePresence>
              {selected?._id === mentor._id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Available Slots</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                      {mentor.availableSlots?.map((slot) => (
                        <button
                          key={slot._id}
                          onClick={() => setBookingSlot(bookingSlot?._id === slot._id ? null : slot)}
                          className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                            bookingSlot?._id === slot._id
                              ? 'border-indigo-500 bg-indigo-50'
                              : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50'
                          }`}
                        >
                          <div className="text-center min-w-[40px]">
                            <div className="text-lg">{['📋', '🎤', '💡'][mentor.availableSlots.indexOf(slot) % 3]}</div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">{slot.topic}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="flex items-center gap-1 text-xs text-gray-500"><Calendar className="w-3 h-3" />{formatDate(slot.date)}</span>
                              <span className="flex items-center gap-1 text-xs text-gray-500"><Clock className="w-3 h-3" />{slot.time}</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>

                    <AnimatePresence>
                      {bookingSlot && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="space-y-3"
                        >
                          <div>
                            <label className="text-xs font-medium text-gray-600 mb-1 block">What would you like to discuss?</label>
                            <textarea
                              value={topic}
                              onChange={(e) => setTopic(e.target.value)}
                              placeholder="Resume review, interview tips, career advice..."
                              rows={2}
                              className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all"
                            />
                          </div>
                          <motion.button
                            whileTap={{ scale: 0.97 }}
                            onClick={() => handleBook(mentor, bookingSlot)}
                            disabled={booking}
                            className="btn-primary w-full text-sm py-2.5 flex items-center justify-center gap-2 disabled:opacity-60"
                          >
                            {booking ? (
                              <motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity }} />
                            ) : 'Book This Slot 🤝'}
                          </motion.button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))
      )}
    </div>
  )
}
