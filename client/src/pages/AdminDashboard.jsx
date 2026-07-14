import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminSidebar from '../components/AdminSidebar.jsx'
import TopBar from '../components/TopBar.jsx'
import Icon from '../components/Icon.jsx'
import { formatDateTime, request } from '../lib/api.js'

const STAT_CARD_DEFS = [
  { label: 'Total Complaints', icon: 'assessment', key: 'totalComplaints' },
  { label: 'Open', icon: 'inbox', key: 'open' },
  { label: 'In Progress', icon: 'pending', key: 'inProgress' },
  { label: 'Resolved', icon: 'task_alt', key: 'resolved' },
  { label: 'Overdue', icon: 'warning', key: 'overdueCount', danger: true },
]

const CATEGORY_COLORS = ['bg-primary', 'bg-secondary', 'bg-tertiary', 'bg-outline']

const STATUS_STYLES = {
  Open: 'bg-secondary-container text-on-secondary-container',
  'In Progress': 'bg-tertiary-fixed text-on-tertiary-fixed-variant',
  Resolved: 'bg-green-100 text-green-800',
  Closed: 'bg-surface-variant text-on-surface-variant',
  Overdue: 'bg-error-container text-error',
}

const PRIORITY_COLOR = {
  Low: 'bg-outline',
  Medium: 'bg-orange-600',
  High: 'bg-error',
}

function formatComplaintId(id = '') {
  return `CMP-${id.slice(-6).toUpperCase()}`
}

function getComplaintIcon(category = '') {
  const normalized = category.toLowerCase()
  if (normalized.includes('water')) return 'water_drop'
  if (normalized.includes('elect')) return 'bolt'
  if (normalized.includes('security')) return 'security'
  if (normalized.includes('clean')) return 'cleaning_services'
  if (normalized.includes('parking')) return 'local_parking'
  if (normalized.includes('lift')) return 'elevator'
  return 'report_problem'
}

function mapComplaint(row) {
  return {
    id: row._id,
    displayId: formatComplaintId(row._id),
    category: row.category,
    icon: getComplaintIcon(row.category),
    desc: row.title,
    status: row.isOverdue ? 'Overdue' : row.status,
    priority: row.priority,
    priorityColor: PRIORITY_COLOR[row.priority] || 'bg-outline',
    time: formatDateTime(row.createdAt),
    statusClass: STATUS_STYLES[row.isOverdue ? 'Overdue' : row.status] || STATUS_STYLES.Open,
    residentName: row.resident?.name || 'Resident',
    assigned: row.assignedTo?.name || 'Management Team',
    description: row.description,
    isOverdue: Boolean(row.isOverdue),
  }
}

export default function AdminDashboard() {
  const [dashboard, setDashboard] = useState({})
  const [recentComplaints, setRecentComplaints] = useState([])
  const [overdueComplaints, setOverdueComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    async function loadDashboard() {
      try {
        setLoading(true)
        const [dashboardResponse, recentResponse, overdueResponse] = await Promise.all([
          request('/dashboard/admin'),
          request('/complaints?sort=newest&limit=4'),
          request('/complaints?overdue=true&sort=overdue&limit=3'),
        ])

        if (active) {
          setDashboard(dashboardResponse?.data?.dashboard || {})
          setRecentComplaints((recentResponse?.data?.complaints || []).map(mapComplaint))
          setOverdueComplaints((overdueResponse?.data?.complaints || []).map(mapComplaint))
          setError('')
        }
      } catch (requestError) {
        if (active) {
          setError(requestError.message)
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadDashboard()

    return () => {
      active = false
    }
  }, [])

  const stats = useMemo(
    () =>
      STAT_CARD_DEFS.map((definition) => ({
        ...definition,
        value: dashboard[definition.key] ?? 0,
      })),
    [dashboard],
  )

  const categories = useMemo(() => {
    const total = dashboard.totalComplaints || 0
    return (dashboard.byCategory || []).map((category, index) => ({
      label: category.category,
      pct: total ? Math.round((category.count / total) * 100) : 0,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    }))
  }, [dashboard])

  const shownOverdue = overdueComplaints.slice(0, 2)

  return (
    <div className="bg-background text-on-surface">
      <TopBar searchPlaceholder="Search complaints..." />
      <AdminSidebar onNewNotice={() => {}} topOffset />

      <main className="md:ml-[280px] pt-16 min-h-screen bg-background">
        <div className="p-lg md:p-xl max-w-[1440px] mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-xl gap-4">
            <div>
              <h1 className="font-display-lg text-display-lg text-on-background">System Overview</h1>
              <p className="font-body-md text-body-md text-secondary">
                Real-time status of your residential maintenance operations.
              </p>
            </div>
            <div className="flex items-center gap-sm">
              <button className="flex items-center gap-2 px-md py-2 border border-outline rounded-lg font-label-md text-label-md hover:bg-surface-container-low transition-colors">
                <Icon name="calendar_today" className="text-[18px]" />
                Last 30 Days
              </button>
              <button className="flex items-center gap-2 px-md py-2 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:opacity-90">
                <Icon name="download" className="text-[18px]" />
                Export Report
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-xl rounded-lg border border-error/20 bg-error-container px-4 py-3 text-error font-body-md text-body-md">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-lg mb-xl">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className={`p-lg rounded-xl border shadow-sm hover:shadow-md transition-shadow relative overflow-hidden ${
                  stat.danger ? 'bg-error-container border-error/20' : 'bg-surface border-outline-variant'
                }`}
              >
                {stat.danger && (
                  <div className="absolute -right-2 -top-2 opacity-10">
                    <Icon name="alarm_on" className="text-[100px] text-error" />
                  </div>
                )}
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <Icon
                    name={stat.icon}
                    className={`p-2 rounded-lg ${stat.danger ? 'text-error bg-white/50' : 'text-primary bg-secondary-container/50'}`}
                  />
                  {stat.danger && <span className="animate-pulse flex h-3 w-3 bg-error rounded-full" />}
                </div>
                <p className={`font-label-md text-label-md ${stat.danger ? 'text-on-error-container font-bold' : 'text-secondary'}`}>
                  {stat.label}
                </p>
                <h3 className={`font-headline-md text-headline-md font-bold mt-1 ${stat.danger ? 'text-on-error-container' : ''}`}>
                  {loading ? '...' : stat.value}
                </h3>
              </div>
            ))}
          </div>

          <div className="mb-xl">
            <div className="flex items-center gap-2 mb-md">
              <Icon name="notification_important" className="text-error" />
              <h2 className="font-headline-sm text-headline-sm text-error">Critical Action Required: Overdue Tasks</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
              {shownOverdue.map((item) => (
                <div key={item.id} className="bg-surface border-l-4 border-error p-lg rounded-r-lg shadow-sm hover:shadow-md transition-all group">
                  <div className="flex justify-between items-start mb-sm">
                    <span className="font-mono-label text-mono-label text-error bg-error-container px-2 py-0.5 rounded">
                      SLA BREACHED
                    </span>
                    <span className="font-label-md text-label-md text-secondary">{item.time}</span>
                  </div>
                  <h4 className="font-headline-sm text-headline-sm mb-1 group-hover:text-primary transition-colors cursor-pointer">
                    {item.desc}
                  </h4>
                  <p className="font-body-sm text-body-sm text-secondary line-clamp-2 mb-4">{item.description}</p>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-surface-container-highest" />
                      <span className="font-label-md text-label-md">{item.assigned}</span>
                    </div>
                    <button className="text-primary font-label-md text-label-md hover:underline">Escalate</button>
                  </div>
                </div>
              ))}
              <div className="bg-surface-container-low border border-dashed border-outline-variant flex flex-col items-center justify-center p-lg rounded-lg text-center group cursor-pointer hover:bg-surface-container transition-colors">
                <Icon name="visibility" className="text-outline group-hover:scale-110 transition-transform mb-2" />
                <p className="font-label-md text-label-md text-secondary">View all {dashboard.overdueCount ?? overdueComplaints.length} overdue issues</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-xl">
            <div className="lg:col-span-1 bg-surface p-xl rounded-xl border border-outline-variant shadow-sm h-full">
              <div className="flex items-center justify-between mb-xl">
                <h2 className="font-headline-sm text-headline-sm">By Category</h2>
                <Icon name="more_vert" className="text-outline" />
              </div>
              <div className="space-y-6">
                {categories.map((category) => (
                  <div key={category.label}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-label-md text-label-md flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${category.color}`} /> {category.label}
                      </span>
                      <span className="font-label-md text-label-md font-bold">{category.pct}%</span>
                    </div>
                    <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                      <div className={`${category.color} h-full`} style={{ width: `${category.pct}%` }} />
                    </div>
                  </div>
                ))}
                {categories.length === 0 && !loading && (
                  <p className="font-body-sm text-body-sm text-secondary">No category data available yet.</p>
                )}
              </div>
              <div className="mt-xl pt-xl border-t border-outline-variant flex items-center justify-center">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" fill="none" r="16" stroke="#e4e9e4" strokeWidth="3" />
                    <circle cx="18" cy="18" fill="none" r="16" stroke="#064e3b" strokeDasharray="75, 100" strokeLinecap="round" strokeWidth="3" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-headline-md text-headline-md font-bold">{loading ? '...' : '88%'}</span>
                    <span className="text-[10px] text-secondary uppercase font-bold tracking-widest">SLA Goal</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2 bg-surface rounded-xl border border-outline-variant shadow-sm flex flex-col h-full">
              <div className="p-lg border-b border-outline-variant flex flex-col md:flex-row gap-md md:items-center justify-between">
                <h2 className="font-headline-sm text-headline-sm">Recent Complaints</h2>
                <div className="flex flex-wrap gap-sm">
                  <select className="text-label-md font-label-md bg-surface-container-low border-outline-variant rounded-lg focus:ring-primary focus:border-primary">
                    <option>Category: All</option>
                    <option>Plumbing</option>
                    <option>Electrical</option>
                  </select>
                  <select className="text-label-md font-label-md bg-surface-container-low border-outline-variant rounded-lg focus:ring-primary focus:border-primary">
                    <option>Priority: All</option>
                    <option>High</option>
                    <option>Medium</option>
                  </select>
                  <button className="bg-surface-container-high p-2 rounded-lg hover:bg-surface-dim transition-colors">
                    <Icon name="filter_list" className="text-[20px]" />
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low">
                      <th className="px-lg py-4 font-label-md text-label-md text-secondary uppercase tracking-wider">Category</th>
                      <th className="px-lg py-4 font-label-md text-label-md text-secondary uppercase tracking-wider">Description</th>
                      <th className="px-lg py-4 font-label-md text-label-md text-secondary uppercase tracking-wider">Status</th>
                      <th className="px-lg py-4 font-label-md text-label-md text-secondary uppercase tracking-wider">Priority</th>
                      <th className="px-lg py-4 font-label-md text-label-md text-secondary uppercase tracking-wider">Timestamp</th>
                      <th className="px-lg py-4" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30">
                    {recentComplaints.map((row, index) => (
                      <tr key={row.id} className={`hover:bg-surface-container-lowest transition-colors group ${index % 2 ? 'bg-surface-container-low/20' : ''}`}>
                        <td className="px-lg py-4">
                          <div className="flex items-center gap-2">
                            <Icon name={row.icon} className="text-primary text-[20px]" />
                            <span className="font-body-sm text-body-sm">{row.category}</span>
                          </div>
                        </td>
                        <td className="px-lg py-4 max-w-xs">
                          <p className="font-body-sm text-body-sm font-medium truncate">{row.desc}</p>
                        </td>
                        <td className="px-lg py-4">
                          <span className={`px-2 py-1 rounded-full text-[11px] font-bold uppercase ${row.statusClass}`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="px-lg py-4">
                          <div className="flex items-center gap-1">
                            <span className={`w-2 h-2 rounded-full ${row.priorityColor}`} />
                            <span className="font-body-sm text-body-sm">{row.priority}</span>
                          </div>
                        </td>
                        <td className="px-lg py-4">
                          <span className="font-body-sm text-body-sm text-secondary">{row.time}</span>
                        </td>
                        <td className="px-lg py-4 text-right">
                          <Link to={`/complaints/${row.id}`} className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <Icon name="chevron_right" className="text-outline" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-auto p-lg border-t border-outline-variant flex items-center justify-between">
                <p className="font-label-md text-label-md text-secondary">Showing {recentComplaints.length} of {dashboard.totalComplaints ?? 0} records</p>
                <div className="flex gap-2">
                  <button className="p-1 border border-outline-variant rounded hover:bg-surface-container-low disabled:opacity-50" disabled>
                    <Icon name="navigate_before" />
                  </button>
                  <button className="p-1 border border-outline-variant rounded hover:bg-surface-container-low">
                    <Icon name="navigate_next" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
