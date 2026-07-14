import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import AdminSidebar from '../components/AdminSidebar.jsx'
import MobileNav from '../components/MobileNav.jsx'
import Icon from '../components/Icon.jsx'
import { formatDateTime, request } from '../lib/api.js'

const STATUS_OPTIONS = ['Open', 'In Progress', 'Resolved', 'Closed']
const PRIORITY_OPTIONS = ['Low', 'Medium', 'High']

function formatComplaintId(id = '') {
  return `CMP-${id.slice(-6).toUpperCase()}`
}

function getHistoryTitle(step) {
  if (!step.previousStatus) return 'Complaint Opened'
  if (step.previousStatus === step.newStatus && step.note) return 'Admin Note Added'
  return step.newStatus
}

function getHistoryIcon(step, isLatest) {
  if (step.newStatus === 'Resolved' || step.newStatus === 'Closed') return 'check'
  if (isLatest) return 'play_arrow'
  if (step.note) return 'note'
  return 'history'
}

function mapComplaint(responseComplaint) {
  return {
    id: responseComplaint._id,
    displayId: formatComplaintId(responseComplaint._id),
    title: responseComplaint.title,
    description: responseComplaint.description,
    category: responseComplaint.category,
    status: responseComplaint.status,
    priority: responseComplaint.priority,
    isOverdue: Boolean(responseComplaint.isOverdue),
    photoUrl: responseComplaint.photoUrl,
    resident: responseComplaint.resident || {},
    createdAt: responseComplaint.createdAt,
  }
}

export default function ComplaintDetails() {
  const { id } = useParams()
  const [complaint, setComplaint] = useState(null)
  const [history, setHistory] = useState([])
  const [status, setStatus] = useState('Open')
  const [priority, setPriority] = useState('High')
  const [note, setNote] = useState('')
  const [markedOverdue, setMarkedOverdue] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [initialStatus, setInitialStatus] = useState('Open')
  const [initialPriority, setInitialPriority] = useState('High')

  useEffect(() => {
    if (!id) return

    let active = true

    async function loadComplaint() {
      try {
        setLoading(true)
        const [detailResponse, historyResponse] = await Promise.all([
          request(`/complaints/${id}`),
          request(`/complaints/${id}/history`),
        ])

        const loadedComplaint = mapComplaint(detailResponse?.data?.complaint || {})
        const loadedHistory = historyResponse?.data?.history || []

        if (active) {
          setComplaint(loadedComplaint)
          setHistory(loadedHistory)
          setStatus(loadedComplaint.status || 'Open')
          setPriority(loadedComplaint.priority || 'High')
          setMarkedOverdue(Boolean(loadedComplaint.isOverdue))
          setInitialStatus(loadedComplaint.status || 'Open')
          setInitialPriority(loadedComplaint.priority || 'High')
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

    loadComplaint()

    return () => {
      active = false
    }
  }, [id])

  async function handleUpdate(e) {
    e.preventDefault()

    try {
      setSaving(true)
      setSaved(false)

      const trimmedNote = note.trim()

      if (status !== initialStatus) {
        await request(`/complaints/${id}/status`, {
          method: 'PUT',
          body: JSON.stringify({
            status,
            note: trimmedNote || undefined,
          }),
        })
      }

      if (priority !== initialPriority) {
        await request(`/complaints/${id}/priority`, {
          method: 'PUT',
          body: JSON.stringify({ priority }),
        })
      }

      if (status === initialStatus && priority === initialPriority && trimmedNote) {
        await request(`/complaints/${id}/notes`, {
          method: 'POST',
          body: JSON.stringify({ note: trimmedNote }),
        })
      }

      const [detailResponse, historyResponse] = await Promise.all([
        request(`/complaints/${id}`),
        request(`/complaints/${id}/history`),
      ])

      const refreshedComplaint = mapComplaint(detailResponse?.data?.complaint || {})

      setComplaint(refreshedComplaint)
      setHistory(historyResponse?.data?.history || [])
      setStatus(refreshedComplaint.status || 'Open')
      setPriority(refreshedComplaint.priority || 'High')
      setMarkedOverdue(Boolean(refreshedComplaint.isOverdue))
      setInitialStatus(refreshedComplaint.status || 'Open')
      setInitialPriority(refreshedComplaint.priority || 'High')
      setNote('')
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (requestError) {
      window.alert(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  const residentName = complaint?.resident?.name || 'Robert Harrison'
  const residentUnit = complaint?.resident?.flatNumber || 'Unit 402, Block C'
  const residentContact = complaint?.resident?.email || '+1 (555) 012-3456'
  const complaintPhoto = complaint?.photoUrl

  return (
    <div className="bg-background text-on-background antialiased">
      <AdminSidebar onNewNotice={() => {}} />

      <main className="md:ml-[280px] min-h-screen p-lg lg:p-xl pb-24 md:pb-xl">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-xl gap-4">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="p-2 rounded-lg hover:bg-surface-container transition-colors">
              <Icon name="arrow_back" className="text-on-surface" />
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="font-headline-md text-headline-md text-on-surface">
                  Complaint #{complaint?.displayId || id || 'CMP-7429'}
                </h2>
                <span className={`px-3 py-1 rounded-lg font-label-md text-label-md flex items-center gap-1 ${markedOverdue ? 'bg-error-container text-error' : 'bg-secondary-container text-on-secondary-container'}`}>
                  <Icon name={markedOverdue ? 'error' : 'check_circle'} className="text-sm" />
                  {markedOverdue ? 'OVERDUE' : 'ON TRACK'}
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {loading ? 'Loading complaint details...' : `Submitted on ${formatDateTime(complaint?.createdAt)}`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 border border-outline-variant text-secondary rounded-lg font-label-md text-label-md hover:bg-surface-container transition-colors flex items-center gap-2">
              <Icon name="print" />
              Print Details
            </button>
            <button className="px-4 py-2 bg-primary text-on-primary rounded-lg font-label-md text-label-md flex items-center gap-2 shadow-sm hover:shadow-lg transition-all">
              <Icon name="share" />
              Forward to Vendor
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="col-span-1 lg:col-span-8 space-y-6">
            <section className="bg-surface-container-lowest border border-outline-variant rounded-lg p-lg shadow-sm">
              <div className="flex justify-between items-start mb-lg flex-wrap gap-3">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-secondary-container flex items-center justify-center font-bold text-on-secondary-container">
                    {residentName
                      .split(' ')
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((part) => part[0]?.toUpperCase() || '')
                      .join('') || 'RH'}
                  </div>
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">{residentName}</h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">{residentUnit} • {residentContact}</p>
                  </div>
                </div>
                <span className="inline-block px-3 py-1 bg-secondary-container text-on-secondary-container rounded-lg font-label-md text-label-md uppercase tracking-wider">
                  {complaint?.category || 'PLUMBING'}
                </span>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="font-label-md text-label-md text-outline uppercase mb-2">Description</h4>
                  <p className="font-body-md text-body-md text-on-surface leading-relaxed">
                    {complaint?.description || 'Loading complaint description...'}
                  </p>
                </div>
                <div className="pt-4 border-t border-outline-variant">
                  <h4 className="font-label-md text-label-md text-outline uppercase mb-4">Attached Photo</h4>
                  <div className="relative group cursor-zoom-in rounded-lg overflow-hidden border border-outline-variant aspect-video w-full max-w-2xl bg-surface-container-high flex items-center justify-center">
                    {complaintPhoto ? (
                      <img alt="Complaint attachment" className="h-full w-full object-cover" src={complaintPhoto} />
                    ) : (
                      <Icon name="image" className="text-outline text-6xl" />
                    )}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Icon name="zoom_in" className="text-white text-4xl" />
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-surface-container-lowest border border-outline-variant rounded-lg p-lg shadow-sm">
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-6">Manage Status</h3>
              <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleUpdate}>
                <div className="space-y-2">
                  <label className="font-label-md text-label-md text-on-surface-variant">Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-surface border border-outline-variant rounded-lg p-3 text-body-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  >
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="font-label-md text-label-md text-on-surface-variant">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-surface border border-outline-variant rounded-lg p-3 text-body-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                  >
                    {PRIORITY_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-full space-y-2">
                  <label className="font-label-md text-label-md text-on-surface-variant">Admin Note / Update Message</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full bg-surface border border-outline-variant rounded-lg p-3 text-body-md focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                    placeholder="Add a comment about this update for the resident or internal logs..."
                    rows={3}
                  />
                </div>
                <div className="col-span-full flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-surface-container-low p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <label className="relative inline-block w-12 h-6 cursor-pointer">
                      <input
                        checked={markedOverdue}
                        onChange={(e) => setMarkedOverdue(e.target.checked)}
                        className="absolute w-6 h-6 opacity-0 z-10 cursor-pointer peer"
                        type="checkbox"
                      />
                      <span className="absolute top-0 left-0 right-0 bottom-0 bg-outline-variant rounded-full transition-colors peer-checked:bg-error" />
                      <span className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-6" />
                    </label>
                    <span className="font-body-md text-body-md text-on-surface font-semibold">Mark as Overdue</span>
                  </div>
                  <button
                    type="submit"
                    disabled={saving}
                    className={`px-8 py-3 rounded-lg font-headline-sm text-headline-sm shadow-md hover:shadow-xl transition-all active:scale-95 flex items-center gap-2 ${
                      saved ? 'bg-green-700 text-white' : 'bg-primary text-on-primary'
                    }`}
                  >
                    {saving && <Icon name="sync" className="animate-spin" />}
                    {saved && <Icon name="check_circle" />}
                    {saving ? 'Updating...' : saved ? 'Updated Successfully' : 'Update Complaint'}
                  </button>
                </div>
              </form>
            </section>
          </div>

          <div className="col-span-1 lg:col-span-4">
            <section className="bg-surface-container-lowest border border-outline-variant rounded-lg p-lg shadow-sm h-full flex flex-col">
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-8">History &amp; Lifecycle</h3>
              <div className="relative flex-1">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-outline-variant" />
                <div className="space-y-10 relative">
                  {loading ? (
                    <div className="flex gap-6 text-on-surface-variant">Loading history...</div>
                  ) : history.length > 0 ? (
                    history.map((step, index) => {
                      const isLatest = index === history.length - 1
                      const title = getHistoryTitle(step)
                      const icon = getHistoryIcon(step, isLatest)
                      const detailText = step.note || `Updated by ${step.actor?.name || 'Admin User'}`
                      const isOverdueStep = step.note?.toLowerCase().includes('overdue') || step.newStatus === 'Closed'

                      return (
                        <div key={step.timestamp || `${step.newStatus}-${index}`} className="flex gap-6">
                          <div className={`relative z-10 w-8 h-8 rounded-lg border-4 border-surface flex items-center justify-center shrink-0 ${isLatest ? 'bg-primary text-on-primary' : isOverdueStep ? 'bg-error-container text-error' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                            <Icon name={icon} className="text-sm" />
                          </div>
                          <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant w-full">
                            <div className="flex justify-between items-start mb-2">
                              <p className={`font-label-md text-label-md font-bold uppercase ${isLatest ? 'text-primary' : isOverdueStep ? 'text-error' : 'text-on-surface'}`}>{title}</p>
                              <span className="text-[11px] font-mono-label text-outline">{formatDateTime(step.timestamp)}</span>
                            </div>
                            <p className="font-body-sm text-body-sm text-on-surface mb-2">
                              Status changed by <span className="font-bold">{step.actor?.name || 'Admin User'}</span>
                            </p>
                            {detailText && (
                              <div className="p-2 bg-surface-container-lowest rounded-lg border border-outline-variant">
                                <p className="font-body-sm text-body-sm text-on-surface-variant italic">{detailText}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <div className="flex gap-6">
                      <div className="relative z-10 w-8 h-8 rounded-lg bg-surface-container-highest border-4 border-surface flex items-center justify-center shrink-0">
                        <Icon name="add" className="text-on-surface-variant text-sm" />
                      </div>
                      <div className="w-full">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-label-md text-label-md text-on-surface font-bold uppercase">Complaint Opened</p>
                          <span className="text-[11px] font-mono-label text-outline">Pending</span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface">No history available yet.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <button className="mt-8 w-full py-2 text-primary border border-primary/20 rounded-lg font-label-md text-label-md hover:bg-primary/5 transition-colors">
                View Audit Log
              </button>
            </section>
          </div>
        </div>

        <footer className="mt-xl pt-lg border-t border-outline-variant flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-on-surface-variant">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center border-2 border-surface text-[10px] text-white">SJ</div>
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center border-2 border-surface text-[10px] text-white">MK</div>
              <div className="w-8 h-8 rounded-full bg-outline-variant flex items-center justify-center border-2 border-surface text-[10px] text-white">+2</div>
            </div>
            <p className="font-label-md text-label-md">Assigned Team: Maintenance Squad B</p>
          </div>
          <p className="font-mono-label text-mono-label opacity-50">Last synced: Just now</p>
        </footer>
      </main>

      <MobileNav />
    </div>
  )
}
