import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { tpoAPI } from '../../services/api'
import MarketIntelligence from '../common/MarketIntelligence'
import toast from 'react-hot-toast'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Bar, Doughnut, Line } from 'react-chartjs-2'
import { TrendingUp, Users, Building2, Award } from 'lucide-react'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler)

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { backgroundColor: '#1f2937', titleColor: '#fff', bodyColor: '#d1d5db', padding: 12, cornerRadius: 8 },
  },
  scales: {
    x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#9ca3af' } },
    y: { grid: { color: '#f3f4f6' }, ticks: { font: { size: 11 }, color: '#9ca3af' } },
  },
}

export default function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAnalytics()
  }, [])

  const loadAnalytics = async () => {
    try {
      const { data } = await tpoAPI.getAnalytics()
      if (data.success) setAnalytics(data)
    } catch {
      toast.error('Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 h-64 animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-1/3 mb-4" />
            <div className="h-40 bg-gray-100 rounded-xl" />
          </div>
        ))}
      </div>
    )
  }

  if (!analytics) return null

  const { stats, branchWise, trends, companyWise, skillDistribution } = analytics

  const statCards = [
    { icon: <Building2 className="w-5 h-5" />, label: 'Total Drives', value: stats.totalDrives, sub: `${stats.activeDrives} active`, color: 'from-indigo-500 to-indigo-600' },
    { icon: <Users className="w-5 h-5" />, label: 'Placed Students', value: stats.placedStudents, sub: `${stats.placementRate}% placement rate`, color: 'from-emerald-500 to-emerald-600' },
    { icon: <TrendingUp className="w-5 h-5" />, label: 'Avg Package', value: `${stats.avgPackage} LPA`, sub: `Max: ${stats.maxPackage} LPA`, color: 'from-amber-500 to-amber-600' },
    { icon: <Award className="w-5 h-5" />, label: 'Total Applications', value: stats.totalApplications, sub: `${stats.selectedCount} selected`, color: 'from-purple-500 to-purple-600' },
  ]

  const branchChartData = {
    labels: branchWise.map((b) => b._id),
    datasets: [
      {
        label: 'Placed',
        data: branchWise.map((b) => b.placed),
        backgroundColor: 'rgba(99, 102, 241, 0.85)',
        borderRadius: 6,
      },
      {
        label: 'Total',
        data: branchWise.map((b) => b.total),
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderRadius: 6,
      },
    ],
  }

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const trendData = {
    labels: trends.map((t) => MONTHS[t._id.month - 1]),
    datasets: [
      {
        label: 'Applications',
        data: trends.map((t) => t.count),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#6366f1',
        pointRadius: 4,
      },
      {
        label: 'Selected',
        data: trends.map((t) => t.selected),
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#10b981',
        pointRadius: 4,
      },
    ],
  }

  const skillData = {
    labels: skillDistribution.slice(0, 8).map((s) => s._id),
    datasets: [{
      data: skillDistribution.slice(0, 8).map((s) => s.count),
      backgroundColor: [
        '#6366f1', '#8b5cf6', '#06b6d4', '#10b981',
        '#f59e0b', '#ef4444', '#ec4899', '#84cc16',
      ],
      borderWidth: 0,
    }],
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white rounded-2xl p-4 border border-gray-100"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white mb-3`}>
              {card.icon}
            </div>
            <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{card.label}</p>
            <p className="text-xs text-indigo-600 font-medium mt-0.5">{card.sub}</p>
          </motion.div>
        ))}
      </div>

        <div className="lg:col-span-2">
          <MarketIntelligence />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {trends.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl p-5 border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">📈 Application Trends</h3>
            <div className="h-48">
              <Line data={trendData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, legend: { display: true, position: 'bottom', labels: { usePointStyle: true, padding: 15, font: { size: 11 } } } } }} />
            </div>
          </motion.div>
        )}

        {branchWise.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl p-5 border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">🏫 Branch-wise Placements</h3>
            <div className="h-48">
              <Bar data={branchChartData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, legend: { display: true, position: 'bottom', labels: { usePointStyle: true, padding: 15, font: { size: 11 } } } } }} />
            </div>
          </motion.div>
        )}

        {skillDistribution.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl p-5 border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">💡 Top Student Skills</h3>
            <div className="h-48">
              <Doughnut data={skillData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { usePointStyle: true, padding: 10, font: { size: 10 } } }, tooltip: { backgroundColor: '#1f2937', padding: 10, cornerRadius: 8 } } }} />
            </div>
          </motion.div>
        )}

        {companyWise.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl p-5 border border-gray-100">
            <h3 className="font-semibold text-gray-900 mb-4">🏢 Top Hiring Companies</h3>
            <div className="space-y-2">
              {companyWise.slice(0, 6).map((company, i) => (
                <div key={company._id} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-800">{company._id}</span>
                      <span className="text-indigo-600 font-semibold">{company.count} placed</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(company.count / companyWise[0].count) * 100}%` }}
                        transition={{ duration: 1, delay: i * 0.1 }}
                        className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
