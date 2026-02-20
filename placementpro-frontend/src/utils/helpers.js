export const formatDate = (date, options = {}) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    ...options,
  })
}

export const formatCurrency = (amount) => {
  if (!amount) return 'N/A'
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)} LPA`
  }
  return `₹${amount.toLocaleString('en-IN')}`
}

export const formatSalaryRange = (min, max) => {
  if (!min && !max) return 'Not disclosed'
  if (min && max) return `${formatCurrency(min)} - ${formatCurrency(max)}`
  if (max) return `Up to ${formatCurrency(max)}`
  return `From ${formatCurrency(min)}`
}

export const getStatusColor = (status) => {
  const colors = {
    Applied: 'bg-blue-100 text-blue-700 border-blue-200',
    Shortlisted: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    Aptitude: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    Interview: 'bg-purple-100 text-purple-700 border-purple-200',
    'HR Round': 'bg-orange-100 text-orange-700 border-orange-200',
    Selected: 'bg-green-100 text-green-700 border-green-200',
    Rejected: 'bg-red-100 text-red-700 border-red-200',
    Withdrawn: 'bg-gray-100 text-gray-700 border-gray-200',
    Active: 'bg-green-100 text-green-700 border-green-200',
    Closed: 'bg-gray-100 text-gray-700 border-gray-200',
    Completed: 'bg-blue-100 text-blue-700 border-blue-200',
    Pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    Scheduled: 'bg-blue-100 text-blue-700 border-blue-200',
    Cancelled: 'bg-red-100 text-red-700 border-red-200',
  }
  return colors[status] || 'bg-gray-100 text-gray-700 border-gray-200'
}

export const getStatusIcon = (status) => {
  const icons = {
    Applied: '📋',
    Shortlisted: '⭐',
    Aptitude: '📝',
    Interview: '🎤',
    'HR Round': '👥',
    Selected: '🎉',
    Rejected: '❌',
    Withdrawn: '↩️',
    Active: '✅',
    Closed: '🔒',
    Completed: '✔️',
  }
  return icons[status] || '📌'
}

export const getBranchColor = (branch) => {
  const colors = {
    CSE: 'bg-indigo-100 text-indigo-700',
    IT: 'bg-blue-100 text-blue-700',
    ECE: 'bg-green-100 text-green-700',
    EEE: 'bg-yellow-100 text-yellow-700',
    ME: 'bg-orange-100 text-orange-700',
    CE: 'bg-red-100 text-red-700',
    MCA: 'bg-purple-100 text-purple-700',
    MBA: 'bg-pink-100 text-pink-700',
  }
  return colors[branch] || 'bg-gray-100 text-gray-700'
}

export const timeAgo = (date) => {
  const now = new Date()
  const diff = now - new Date(date)
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return formatDate(date)
}

export const daysUntil = (date) => {
  const diff = new Date(date) - new Date()
  const days = Math.ceil(diff / 86400000)
  if (days < 0) return 'Expired'
  if (days === 0) return 'Today'
  if (days === 1) return 'Tomorrow'
  return `${days} days left`
}

export const truncate = (str, length = 100) => {
  if (!str) return ''
  return str.length > length ? str.slice(0, length) + '...' : str
}

export const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
}

export const generateAvatarColor = (name) => {
  const colors = ['bg-indigo-500', 'bg-purple-500', 'bg-pink-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-teal-500']
  if (!name) return colors[0]
  const idx = name.charCodeAt(0) % colors.length
  return colors[idx]
}
