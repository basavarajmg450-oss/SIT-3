import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { statsAPI } from '../../services/api'
import { TrendingUp, Briefcase, Users, Brain } from 'lucide-react'

export default function MarketIntelligence({ compact = false }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await statsAPI.getMarketIntelligence()
        if (data.success) setData(data.data)
      } catch {
        // silent fail – widget is optional
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-gray-100 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
        <div className="space-y-2">
          <div className="h-3 bg-gray-100 rounded" />
          <div className="h-3 bg-gray-100 rounded w-2/3" />
        </div>
      </div>
    )
  }

  if (!data) return null

  const skills = data.topSkills || data.topSkills || []

  return (
    <motion.div
      className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-indigo-600" />
          <h2 className="font-semibold text-gray-900 text-sm">
            Market Intelligence
          </h2>
        </div>
        <span className="text-[10px] text-gray-400 uppercase tracking-wide">
          Updated {new Date(data.lastUpdated).toLocaleDateString()}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-indigo-50 rounded-xl p-2.5">
          <p className="text-[10px] text-gray-500 flex items-center gap-1">
            <Briefcase className="w-3 h-3 text-indigo-500" /> Active Drives
          </p>
          <p className="text-lg font-bold text-indigo-700">{data.activeDrives}</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-2.5">
          <p className="text-[10px] text-gray-500 flex items-center gap-1">
            <Users className="w-3 h-3 text-emerald-500" /> Companies
          </p>
          <p className="text-lg font-bold text-emerald-700">{data.companiesHiring}</p>
        </div>
        <div className="bg-amber-50 rounded-xl p-2.5">
          <p className="text-[10px] text-gray-500 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-amber-500" /> Avg Package
          </p>
          <p className="text-lg font-bold text-amber-700">{data.avgPackage}</p>
        </div>
      </div>

      {!compact && (
        <p className="text-xs text-gray-500 mb-3">
          Max package: <span className="font-semibold text-gray-800">{data.maxPackage}</span> •
          Total applications: <span className="font-semibold text-gray-800">{data.totalApplications}</span>
        </p>
      )}

      <div>
        <p className="text-xs font-semibold text-gray-800 mb-2">
          🔥 Trending Skills
        </p>
        <div className="flex flex-wrap gap-1.5">
          {skills.slice(0, compact ? 6 : 10).map((s) => (
            <span
              key={s}
              className="text-[11px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100"
            >
              {s}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

