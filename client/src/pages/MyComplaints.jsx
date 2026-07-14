import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminSidebar from '../components/AdminSidebar.jsx'
import MobileNav from '../components/MobileNav.jsx'
import Icon from '../components/Icon.jsx'
import { formatDate, formatDateTime, getSessionUser, request } from '../lib/api.js'

const COMPLAINT_CATEGORIES = ['Electrical', 'Water', 'Cleaning', 'Security', 'Parking', 'Lift', 'Other']
const COMPLAINT_PRIORITIES = ['Low', 'Medium', 'High']

const STATUS_STYLES = {
  Open: 'bg-surface-variant text-on-surface-variant',
  'In Progress': 'bg-tertiary-container text-on-tertiary-container',
  Resolved: 'bg-primary-container text-primary',
  Closed: 'bg-outline-variant text-on-surface-variant',
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

function mapComplaint(complaint, index = 0) {
  const residentName = complaint.resident?.name || 'Resident'

  return {
    id: complaint._id,
    displayId: formatComplaintId(complaint._id),
    title: complaint.title,
    description: complaint.description,
    status: complaint.status,
    icon: getComplaintIcon(complaint.category),
    raised: formatDate(complaint.createdAt),
    assigned: complaint.assignedTo?.name || 'Management Team',
    date: formatDate(complaint.createdAt),
    category: complaint.category,
    priority: complaint.priority,
    residentName,
    residentUnit: complaint.resident?.flatNumber || 'Unit pending',
    photoUrl: complaint.photoUrl || null,
    isOverdue: Boolean(complaint.isOverdue),
    wide: index === 0,
  }
}

export default function MyComplaints() {
  const currentUser = getSessionUser()
  const isAdmin = currentUser?.role === 'admin'
  const [detailId, setDetailId] = useState(null)
  const [raiseOpen, setRaiseOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Statuses')
  const [categoryFilter, setCategoryFilter] = useState('All Categories')
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailComplaint, setDetailComplaint] = useState(null)
  const [history, setHistory] = useState([])
  const [photoFile, setPhotoFile] = useState(null)
  const [draft, setDraft] = useState({
    title: '',
    category: COMPLAINT_CATEGORIES[0],
    priority: 'Medium',
    description: '',
  })

  useEffect(() => {
    let active = true

    async function loadComplaints() {
      try {
        setLoading(true)
        const response = await request(isAdmin ? '/complaints?sort=newest&limit=20' : '/complaints/my')
        const fetched = response?.data?.complaints || []

        if (active) {
          setComplaints(fetched.map((complaint, index) => mapComplaint(complaint, index)))
        }
      } catch (requestError) {
        if (active) {
          window.alert(requestError.message)
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    loadComplaints()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!detailId) {
      setDetailComplaint(null)
      setHistory([])
      return
    }

    let active = true

    async function loadComplaintDetails() {
      try {
        setDetailLoading(true)
        const [detailResponse, historyResponse] = await Promise.all([
          request(`/complaints/${detailId}`),
          request(`/complaints/${detailId}/history`),
        ])

        if (active) {
          setDetailComplaint(mapComplaint(detailResponse?.data?.complaint || {}, 0))
          setHistory(historyResponse?.data?.history || [])
        }
      } catch (requestError) {
        if (active) {
          window.alert(requestError.message)
        }
      } finally {
        if (active) {
          setDetailLoading(false)
        }
      }
    }

    loadComplaintDetails()

    return () => {
      active = false
    }
  }, [detailId])

  const activeComplaint = detailComplaint || complaints.find((complaint) => complaint.id === detailId)

  const filtered = useMemo(() => {
    const term = search.toLowerCase()
    return complaints.filter((complaint) => {
      const matchesSearch =
        complaint.displayId.toLowerCase().includes(term) ||
        complaint.title.toLowerCase().includes(term) ||
        complaint.category.toLowerCase().includes(term)
      const matchesStatus = statusFilter === 'All Statuses' || complaint.status === statusFilter
      const matchesCategory =
        categoryFilter === 'All Categories' || complaint.category === categoryFilter

      return matchesSearch && matchesStatus && matchesCategory
    })
  }, [categoryFilter, complaints, search, statusFilter])

  async function loadComplaints() {
    const response = await request(isAdmin ? '/complaints?sort=newest&limit=20' : '/complaints/my')
    const fetched = response?.data?.complaints || []
    setComplaints(fetched.map((complaint, index) => mapComplaint(complaint, index)))
  }

  async function handleCreateComplaint(e) {
    e.preventDefault()

    if (isAdmin) {
      window.alert('Admins cannot raise resident complaints from this screen.')
      return
    }

    try {
      setSubmitting(true)
      const formData = new FormData()
      formData.append('title', draft.title)
      formData.append('category', draft.category)
      formData.append('description', draft.description)
      formData.append('priority', draft.priority)

      if (photoFile) {
        formData.append('photo', photoFile)
      }

      await request('/complaints', {
        method: 'POST',
        body: formData,
      })

      setDraft({
        title: '',
        category: COMPLAINT_CATEGORIES[0],
        priority: 'Medium',
        description: '',
      })
      setPhotoFile(null)
      setRaiseOpen(false)
      await loadComplaints()
    } catch (requestError) {
      window.alert(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-background text-on-surface min-h-screen">
      <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center w-full px-lg h-16 bg-surface border-b border-outline-variant shadow-sm">
        <div className="flex items-center gap-md">
          <span className="font-headline-md text-headline-md font-bold text-primary">UrbanLink</span>
        </div>
        <div className="hidden md:flex flex-1 max-w-md mx-xl">
          <div className="relative w-full">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface-container-low border border-outline-variant rounded-full py-2 pl-10 pr-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none font-body-sm text-body-sm"
              placeholder="Search complaints..."
              type="text"
            />
          </div>
        </div>
        <div className="flex items-center gap-md">
          <button className="p-2 rounded-full hover:bg-surface-container-low transition-colors text-on-surface-variant">
            <Icon name="notifications" />
          </button>
          <button className="p-2 rounded-full hover:bg-surface-container-low transition-colors text-on-surface-variant">
            <Icon name="account_circle" />
          </button>
        </div>
      </nav>

      <AdminSidebar onNewNotice={() => {}} topOffset />

      <main className="md:ml-[280px] pt-20 px-lg pb-24 md:pb-xl max-w-screen-xl mx-auto">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md mb-xl">
          <div>
            <h1 className="font-display-lg text-display-lg text-on-surface">
              {isAdmin ? 'Complaints' : 'My Complaints'}
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              {isAdmin
                ? 'Track and manage society maintenance requests'
                : 'Track and manage your maintenance requests'}
            </p>
          </div>
          {!isAdmin ? (
            <button
              onClick={() => setRaiseOpen(true)}
              className="px-xl py-3 bg-primary text-on-primary rounded-lg font-label-md text-label-md flex items-center gap-2 shadow-sm hover:opacity-90 transition-opacity"
            >
              <Icon name="add_circle" />
              Raise New Complaint
            </button>
          ) : (
            <button className="px-xl py-3 bg-surface-container-high text-on-surface-variant rounded-lg font-label-md text-label-md flex items-center gap-2 shadow-sm cursor-default" disabled>
              <Icon name="report_problem" />
              Admin View
            </button>
          )}
        </header>

        <div className="bg-surface-container-low p-md rounded-lg flex flex-col md:flex-row gap-md items-center mb-lg border border-outline-variant">
          <div className="relative flex-1 w-full">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-surface border border-outline-variant rounded-lg py-2 pl-10 pr-4 focus:ring-2 focus:ring-primary outline-none font-body-sm text-body-sm"
              placeholder="Filter by ID, subject or category..."
              type="text"
            />
          </div>
          <div className="flex gap-sm w-full md:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-surface border border-outline-variant rounded-lg py-2 px-3 font-body-sm text-body-sm outline-none focus:ring-2 focus:ring-primary flex-1"
            >
              <option>All Statuses</option>
              <option>Open</option>
              <option>In Progress</option>
              <option>Resolved</option>
              <option>Closed</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-surface border border-outline-variant rounded-lg py-2 px-3 font-body-sm text-body-sm outline-none focus:ring-2 focus:ring-primary flex-1"
            >
              <option>All Categories</option>
              {COMPLAINT_CATEGORIES.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
          {loading && filtered.length === 0 ? (
            <div className="lg:col-span-2 bg-surface p-lg rounded-lg border border-outline-variant shadow-sm">
              Loading complaints...
            </div>
          ) : filtered.length === 0 ? (
            <div className="lg:col-span-2 bg-surface p-lg rounded-lg border border-outline-variant shadow-sm">
              No complaints match your filters.
            </div>
          ) : (
            filtered.map((c) =>
              c.wide ? (
              <div
                key={c.id}
                className="lg:col-span-2 group bg-surface p-lg rounded-lg border border-outline-variant shadow-sm hover:shadow-md hover:border-primary transition-all cursor-pointer"
                onClick={() => setDetailId(c.id)}
              >
                <div className="flex justify-between items-start mb-md">
                  <div className="flex items-center gap-sm">
                    <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container">
                      <Icon name={c.icon} />
                    </div>
                    <div>
                      <span className="font-mono-label text-mono-label text-outline uppercase tracking-wider">{c.displayId}</span>
                      <h3 className="font-headline-sm text-headline-sm text-on-surface">{c.title}</h3>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full font-label-md text-label-md ${STATUS_STYLES[c.status]}`}>
                    {c.status}
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-lg line-clamp-2">{c.description}</p>
                <div className="flex flex-wrap items-center gap-xl mt-auto pt-lg border-t border-outline-variant">
                  <div className="flex items-center gap-xs">
                    <Icon name="calendar_today" className="text-primary text-[20px]" />
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Raised: {c.raised}</span>
                  </div>
                  <div className="flex items-center gap-xs">
                    <Icon name="person" className="text-primary text-[20px]" />
                    <span className="font-body-sm text-body-sm text-on-surface-variant">Assigned: {c.assigned}</span>
                  </div>
                  <div className="ml-auto flex items-center text-primary font-label-md text-label-md group-hover:translate-x-1 transition-transform">
                    View Details <Icon name="chevron_right" className="ml-1" />
                  </div>
                </div>
              </div>
            ) : (
              <div
                key={c.id}
                className="bg-surface p-lg rounded-lg border border-outline-variant shadow-sm hover:border-primary transition-all cursor-pointer"
                onClick={() => setDetailId(c.id)}
              >
                <div className="flex justify-between items-start mb-md">
                  <div className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center">
                    <Icon name={c.icon} className="text-primary" />
                  </div>
                  <span className={`px-2 py-1 rounded font-label-md text-label-md ${STATUS_STYLES[c.status]}`}>
                    {c.status}
                  </span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-on-surface mb-sm">{c.title}</h3>
                <span className="font-mono-label text-mono-label text-outline uppercase">{c.displayId}</span>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-md mb-lg">{c.description}</p>
                <div className="pt-md border-t border-outline-variant flex justify-between items-center">
                  <span className="font-body-sm text-body-sm text-on-surface-variant italic">{c.date}</span>
                  <Icon
                    name={c.status === 'Resolved' ? 'check_circle' : 'arrow_forward'}
                    className={c.status === 'Resolved' ? 'text-primary' : 'text-on-surface-variant'}
                  />
                </div>
              </div>
            )
          ))}

          <div className="bg-primary p-lg rounded-lg flex flex-col justify-between text-on-primary">
            <div>
              <h4 className="font-label-md text-label-md uppercase opacity-80 mb-sm">Resolution Rate</h4>
              <p className="font-display-lg text-display-lg">84%</p>
            </div>
            <div className="h-32 w-full mt-md">
              <div className="flex items-end gap-2 h-full">
                <div className="bg-on-primary w-full h-[40%] rounded-t-sm opacity-30" />
                <div className="bg-on-primary w-full h-[60%] rounded-t-sm opacity-50" />
                <div className="bg-on-primary w-full h-[90%] rounded-t-sm" />
                <div className="bg-on-primary w-full h-[75%] rounded-t-sm opacity-70" />
                <div className="bg-on-primary w-full h-[85%] rounded-t-sm" />
              </div>
            </div>
            <p className="font-body-sm text-body-sm mt-md opacity-80">
              You have 2 active tickets being addressed within the 24h SLA.
            </p>
          </div>

          <div className="bg-surface rounded-lg border border-outline-variant overflow-hidden flex flex-col">
            <div className="h-48 relative bg-secondary-container flex items-end">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="relative z-10 p-4 text-white">
                <p className="font-label-md text-label-md uppercase opacity-80">Maintenance Team</p>
                <h4 className="font-headline-sm text-headline-sm">We're here to help</h4>
              </div>
            </div>
            <div className="p-md">
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Our certified technicians are available 24/7 for emergency repairs and routine maintenance tasks.
              </p>
            </div>
          </div>
        </div>
      </main>

      <MobileNav />

      {/* Detail slide-over */}
      <div
        className={`fixed inset-0 bg-on-background/40 backdrop-blur-sm z-[60] transition-opacity duration-300 ${
          activeComplaint ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div
          className={`absolute right-0 top-0 h-full w-full max-w-lg bg-surface shadow-2xl transform transition-transform duration-300 p-lg overflow-y-auto ${
            activeComplaint ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {activeComplaint && (
            <>
              <div className="flex justify-between items-center mb-xl">
                <h2 className="font-headline-md text-headline-md text-on-surface">Complaint Details</h2>
                <button className="p-2 rounded-full hover:bg-surface-container-low" onClick={() => setDetailId(null)}>
                  <Icon name="close" />
                </button>
              </div>
              <div className="mb-xl">
                <div className="flex items-center gap-md mb-md">
                  <span className="px-2 py-1 bg-primary-container text-primary font-mono-label text-mono-label rounded">
                    {activeComplaint.displayId}
                  </span>
                  <span className={`px-3 py-1 rounded-full font-label-md text-label-md ${STATUS_STYLES[activeComplaint.status]}`}>
                    {activeComplaint.status}
                  </span>
                </div>
                <h3 className="font-headline-sm text-headline-sm mb-sm">{activeComplaint.title}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">{activeComplaint.description}</p>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-body-sm text-on-surface-variant">
                  <div>
                    <span className="font-label-md text-label-md text-outline">Category:</span> {activeComplaint.category}
                  </div>
                  <div>
                    <span className="font-label-md text-label-md text-outline">Priority:</span> {activeComplaint.priority}
                  </div>
                  <div>
                    <span className="font-label-md text-label-md text-outline">Resident:</span> {activeComplaint.residentName}
                  </div>
                  <div>
                    <span className="font-label-md text-label-md text-outline">Unit:</span> {activeComplaint.residentUnit}
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-label-md text-label-md uppercase text-outline mb-lg">Progress Timeline</h4>
                <div className="space-y-xl relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-outline-variant">
                  {detailLoading ? (
                    <div className="relative pl-10 text-on-surface-variant">Loading timeline...</div>
                  ) : history.length > 0 ? (
                    history.map((step, index) => {
                      const isLatest = index === history.length - 1
                      const isFinal = step.newStatus === 'Resolved' || step.newStatus === 'Closed'
                      const title = !step.previousStatus
                        ? 'Complaint Registered'
                        : step.previousStatus === step.newStatus && step.note
                        ? 'Admin Note Added'
                        : step.newStatus
                      const detailText = step.note || `Updated by ${step.actor?.name || 'Admin User'}`

                      return (
                        <div key={step.timestamp || `${step.newStatus}-${index}`} className={`relative pl-10 ${isLatest ? '' : ''}`}>
                          <div
                            className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center z-10 ${
                              isFinal
                                ? 'bg-primary'
                                : isLatest
                                ? 'bg-surface border-2 border-primary'
                                : 'bg-surface-container-highest border-2 border-outline-variant'
                            }`}
                          >
                            {isFinal ? <Icon name="check" className="text-[14px] text-on-primary" /> : isLatest ? <div className="w-2 h-2 rounded-full bg-primary animate-pulse" /> : <Icon name="history" className="text-[14px] text-outline" />}
                          </div>
                          <p className={`font-label-md text-label-md ${isLatest ? 'text-primary font-bold' : 'text-on-surface'}`}>
                            {title}
                          </p>
                          <p className="font-body-sm text-body-sm text-on-surface-variant">{formatDateTime(step.timestamp)}</p>
                          {step.note && <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{detailText}</p>}
                        </div>
                      )
                    })
                  ) : (
                    <div className="relative pl-10 text-on-surface-variant">No history available yet.</div>
                  )}
                </div>
              </div>
              <div className="mt-xl pt-xl border-t border-outline-variant">
                <button className="w-full py-3 border border-outline text-on-surface rounded-lg font-label-md text-label-md hover:bg-surface-container-low transition-colors">
                  Add a Comment
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Raise complaint modal */}
      {raiseOpen && !isAdmin && (
        <div className="fixed inset-0 bg-on-background/60 flex items-center justify-center z-[70] p-md">
          <div className="bg-surface w-full max-w-lg rounded-lg shadow-2xl overflow-hidden">
            <div className="p-lg border-b border-outline-variant flex justify-between items-center">
              <h3 className="font-headline-sm text-headline-sm">Raise New Complaint</h3>
              <button className="p-1 hover:bg-surface-container-low rounded-full" onClick={() => setRaiseOpen(false)}>
                <Icon name="close" />
              </button>
            </div>
            <form
              className="p-lg space-y-lg"
              onSubmit={handleCreateComplaint}
            >
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-xs">Title / Subject</label>
                <input
                  value={draft.title}
                  onChange={(e) => setDraft((current) => ({ ...current, title: e.target.value }))}
                  className="w-full bg-surface border border-outline-variant rounded-lg p-2 font-body-sm focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Brief summary of the issue"
                  type="text"
                />
              </div>
              <div className="grid grid-cols-2 gap-md">
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-xs">Category</label>
                  <select
                    value={draft.category}
                    onChange={(e) => setDraft((current) => ({ ...current, category: e.target.value }))}
                    className="w-full bg-surface border border-outline-variant rounded-lg p-2 font-body-sm focus:ring-2 focus:ring-primary outline-none"
                  >
                    {COMPLAINT_CATEGORIES.map((category) => (
                      <option key={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-label-md text-label-md text-on-surface-variant mb-xs">Urgency</label>
                  <select
                    value={draft.priority}
                    onChange={(e) => setDraft((current) => ({ ...current, priority: e.target.value }))}
                    className="w-full bg-surface border border-outline-variant rounded-lg p-2 font-body-sm focus:ring-2 focus:ring-primary outline-none"
                  >
                    {COMPLAINT_PRIORITIES.map((priority) => (
                      <option key={priority}>{priority}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-xs">Description</label>
                <textarea
                  value={draft.description}
                  onChange={(e) => setDraft((current) => ({ ...current, description: e.target.value }))}
                  className="w-full bg-surface border border-outline-variant rounded-lg p-2 font-body-sm focus:ring-2 focus:ring-primary outline-none"
                  placeholder="Provide more details about the problem..."
                  rows={3}
                />
              </div>
              <div>
                <label className="block font-label-md text-label-md text-on-surface-variant mb-xs">Photo</label>
                <input
                  accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files?.[0] || null)}
                  className="w-full bg-surface border border-outline-variant rounded-lg p-2 font-body-sm focus:ring-2 focus:ring-primary outline-none"
                  type="file"
                />
                <p className="mt-1 text-[11px] text-on-surface-variant">
                  {photoFile ? photoFile.name : 'Optional. Attach a photo to help the maintenance team understand the issue.'}
                </p>
              </div>
              <div className="flex gap-md justify-end pt-md">
                <button
                  type="button"
                  className="px-lg py-2 font-label-md text-label-md text-secondary hover:bg-surface-container-low rounded-lg transition-colors"
                  onClick={() => setRaiseOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-xl py-2 bg-primary text-on-primary font-label-md text-label-md rounded-lg shadow-sm hover:opacity-90 transition-opacity disabled:opacity-70"
                >
                  {submitting ? 'Submitting...' : 'Submit Complaint'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
