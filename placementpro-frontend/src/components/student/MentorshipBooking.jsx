import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { alumniAPI, studentAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { Star } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export default function MentorshipBooking() {
  const { isDark } = useTheme()
  const [mentors, setMentors] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

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

  const getAlumniUserId = (mentor) => {
    if (!mentor) return ''
    const u = mentor.userId
    if (typeof u === 'string' && u.length > 0) return u
    if (u && typeof u.toString === 'function') return u.toString()
    if (u && u._id) return String(u._id)
    return ''
  }

  const handleSubmitReview = async (mentor) => {
    const alumniId = getAlumniUserId(mentor)
    const alumniProfileId = mentor._id?.toString?.() || mentor._id
    if (!alumniId && !alumniProfileId) {
      toast.error('Cannot submit review for this mentor')
      return
    }
    if (reviewRating < 1 || reviewRating > 5) {
      toast.error('Please select a rating (1–5 stars)')
      return
    }
    setSubmitting(true)
    try {
      const { data } = await studentAPI.submitAlumniReview({
        ...(alumniId && { alumniId }),
        ...(alumniProfileId && !alumniId && { alumniProfileId }),
        rating: reviewRating,
        comment: reviewComment.trim(),
      })
      if (data.success) {
        toast.success(data.message || 'Review submitted!')
        setReviewRating(0)
        setReviewComment('')
        setSelected(null)
        loadMentors()
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className={`rounded-2xl p-5 border animate-pulse ${isDark ? 'bg-slate-900/70 border-white/10' : 'bg-white border-gray-100'}`}>
            <div className="flex gap-3">
              <div className={`w-12 h-12 rounded-xl ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
              <div className="flex-1 space-y-2">
                <div className={`h-4 rounded w-1/2 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
                <div className={`h-3 rounded w-3/4 ${isDark ? 'bg-white/10' : 'bg-gray-200'}`} />
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
          <p className={`font-medium ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>No mentors available right now</p>
          <p className={`text-sm mt-1 ${isDark ? 'text-slate-500' : 'text-gray-400'}`}>Check back later for mentorship profiles</p>
        </div>
      ) : (
        mentors.map((mentor, i) => (
          <motion.div
            key={mentor._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`rounded-2xl border overflow-hidden transition-all duration-300 ${isDark ? 'bg-slate-900/70 border-white/10' : 'bg-white border-gray-100'}`}
          >
            <div
              className="p-5 cursor-pointer transition-colors"
              onClick={() => {
                setSelected(selected?._id === mentor._id ? null : mentor)
                if (selected?._id !== mentor._id) {
                  setReviewRating(0)
                  setReviewComment('')
                }
              }}
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {mentor.name?.[0] || '?'}
                </div>
                <div className="flex-1">
                  <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>{mentor.name}</h4>
                  <p className="text-sm text-indigo-500 font-medium">{mentor.designation} @ {mentor.company}</p>
                  {mentor.bio && <p className={`text-xs mt-1 line-clamp-2 ${isDark ? 'text-slate-400' : 'text-gray-500'}`}>{mentor.bio}</p>}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-xs text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      {(mentor.rating || 0).toFixed(1)} ({mentor.reviewCount || 0} reviews)
                    </span>
                    <span className="text-xs text-emerald-500 font-medium">{mentor.availableSlots?.length ?? 0} slots available</span>
                  </div>
                </div>
              </div>

              {mentor.skills?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {mentor.skills.slice(0, 4).map((skill) => (
                    <span key={skill} className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-white/10 text-slate-300' : 'bg-indigo-50 text-indigo-600'}`}>{skill}</span>
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
                  <div className={`px-5 pb-5 pt-4 border-t ${isDark ? 'border-white/10' : 'border-gray-100'}`}>
                    <p className={`text-sm font-semibold mb-3 ${isDark ? 'text-slate-200' : 'text-gray-700'}`}>Leave a review for {mentor.name}</p>
                    <div className="space-y-3">
                      <div>
                        <label className={`text-xs font-medium block mb-1.5 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Rating (1–5 stars)</label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewRating(star)}
                              className="p-0.5 focus:outline-none"
                            >
                              <Star className={`w-8 h-8 transition-colors ${reviewRating >= star ? 'fill-amber-400 text-amber-400' : isDark ? 'text-slate-500' : 'text-gray-300'}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className={`text-xs font-medium block mb-1.5 ${isDark ? 'text-slate-400' : 'text-gray-600'}`}>Your review (optional)</label>
                        <textarea
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="Share your experience or feedback..."
                          rows={3}
                          className={`w-full px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 transition-all border ${isDark ? 'bg-slate-800 border-white/10 text-white placeholder-slate-500' : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'}`}
                        />
                      </div>
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleSubmitReview(mentor)}
                        disabled={submitting || reviewRating < 1}
                        className="w-full py-2.5 rounded-xl font-medium text-white bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {submitting ? (
                          <motion.div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity }} />
                        ) : (
                          <>Submit review</>
                        )}
                      </motion.button>
                    </div>
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
