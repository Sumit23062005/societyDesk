import { useEffect, useMemo, useState } from 'react'
import AdminSidebar from '../components/AdminSidebar.jsx'
import Icon from '../components/Icon.jsx'
import { formatDateTime, formatUserInitials, getSessionUser, request } from '../lib/api.js'

function getNoticeIcon(title = '') {
  const text = title.toLowerCase()
  if (text.includes('water')) return 'water_drop'
  if (text.includes('event') || text.includes('gala')) return 'event'
  if (text.includes('security') || text.includes('visitor')) return 'security'
  if (text.includes('clean') || text.includes('pest')) return 'cleaning_services'
  if (text.includes('parking')) return 'local_parking'
  return 'campaign'
}

function mapNotice(notice, index) {
  const authorName = notice.createdBy?.name || 'Management Committee'

  return {
    id: notice._id,
    pinned: Boolean(notice.pinned),
    urgent: Boolean(notice.important),
    isNew: index < 2,
    icon: getNoticeIcon(notice.title),
    title: notice.title,
    body: notice.description,
    author: authorName,
    initials: formatUserInitials(authorName),
    date: formatDateTime(notice.createdAt),
    wide: index === 0 || Boolean(notice.pinned),
  }
}

export default function NoticeBoard() {
  const [notices, setNotices] = useState([])
  const [query, setQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [draft, setDraft] = useState({ title: '', content: '', important: false })
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const currentUserName = getSessionUser()?.name || 'Admin User'

  useEffect(() => {
    let active = true

    async function loadNotices() {
      try {
        setLoading(true)
        const response = await request('/notices')
        const fetched = response?.data?.notices || []
        if (active) {
          setNotices(fetched.map(mapNotice))
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

    loadNotices()

    return () => {
      active = false
    }
  }, [])

  const filtered = useMemo(() => {
    const term = query.toLowerCase()
    return notices.filter(
      (n) => n.title.toLowerCase().includes(term) || n.body.toLowerCase().includes(term),
    )
  }, [notices, query])

  async function publishNotice(e) {
    e.preventDefault()

    if (!draft.title.trim()) return

    try {
      setSubmitting(true)
      const response = await request('/notices', {
        method: 'POST',
        body: JSON.stringify({
          title: draft.title,
          description: draft.content || 'No additional details provided.',
          important: draft.important,
          pinned: draft.important,
        }),
      })

      const notice = response?.data?.notice
      if (notice) {
        setNotices((prev) => [mapNotice(notice, 0), ...prev])
      }

      setDraft({ title: '', content: '', important: false })
      setModalOpen(false)
      setError('')
    } catch (requestError) {
      window.alert(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  const pinnedCount = notices.filter((n) => n.pinned).length

  return (
    <div className="bg-background text-on-surface font-body-md min-h-screen flex">
      <AdminSidebar onNewNotice={() => setModalOpen(true)} />

      <main className="ml-0 md:ml-[280px] flex-1 flex flex-col h-screen">
        <header className="bg-surface border-b border-outline-variant h-16 flex items-center justify-between px-xl z-40 sticky top-0">
          <div className="flex items-center gap-lg">
            <h2 className="font-headline-md text-headline-md font-bold text-primary">UrbanLink Notices</h2>
            <div className="relative w-96 hidden md:block">
              <Icon name="search" className="absolute left-sm top-1/2 -translate-y-1/2 text-outline" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-xl pr-md py-sm bg-surface-container-low border border-outline-variant rounded-lg text-body-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                placeholder="Search notices..."
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-md">
            <button className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-surface-container-high transition-colors">
              <Icon name="notifications" />
            </button>
            <div className="flex items-center gap-sm cursor-pointer group">
              <div className="w-10 h-10 rounded-lg bg-secondary-container flex items-center justify-center overflow-hidden font-bold text-on-secondary-container text-xs">
                {formatUserInitials(currentUserName)}
              </div>
              <span className="font-body-md text-body-md text-on-surface font-semibold group-hover:text-primary">
                {currentUserName}
              </span>
              <Icon name="expand_more" className="text-outline" />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-surface-container-low p-xl">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-12 gap-lg mb-xl">
              <div className="col-span-12 md:col-span-8 flex flex-col justify-center">
                <h3 className="font-display-lg text-display-lg text-on-surface mb-xs">Community Notice Board</h3>
                <p className="text-secondary font-body-lg">Official updates, maintenance alerts, and society events.</p>
              </div>
              <div className="col-span-12 md:col-span-4 bg-primary text-on-primary p-lg rounded-lg flex items-center justify-between shadow-md">
                <div>
                  <p className="font-label-md text-label-md opacity-80">Pinned Announcements</p>
                  <p className="font-headline-md text-headline-md">{pinnedCount} Active</p>
                </div>
                <Icon name="push_pin" filled className="text-4xl" />
              </div>
            </div>

            {error && !loading && (
              <div className="mb-lg rounded-lg border border-error/20 bg-error-container px-4 py-3 text-error font-body-md text-body-md">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
              {loading && filtered.length === 0 && (
                <div className="col-span-full text-center py-xl text-on-surface-variant">Loading notices...</div>
              )}

              {filtered.map((notice) => (
                <div
                  key={notice.id}
                  className={`group ${notice.wide ? 'lg:col-span-2' : ''}`}
                >
                  <div
                    className={`p-xl rounded-lg h-full flex flex-col hover:shadow-lg transition-all relative overflow-hidden ${
                      notice.urgent
                        ? 'glass-card border-l-4 border-error'
                        : 'bg-surface border border-outline-variant hover:border-primary hover:shadow-md'
                    }`}
                  >
                    {notice.urgent && (
                      <div className="absolute top-0 right-0 p-md">
                        <span className="bg-error-container text-error text-[10px] font-bold px-sm py-xs rounded flex items-center gap-xs uppercase tracking-widest">
                          <Icon name="priority_high" className="text-xs" />
                          Urgent
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-md mb-md">
                      <Icon name={notice.icon} className={notice.urgent ? 'text-error' : 'text-primary'} />
                      <h4 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors">
                        {notice.title}
                      </h4>
                    </div>
                    <p className="text-secondary font-body-md mb-xl line-clamp-3">{notice.body}</p>
                    <div className="mt-auto flex items-center justify-between pt-lg border-t border-outline-variant flex-wrap gap-2">
                      <div className="flex items-center gap-sm">
                        <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-xs font-bold text-primary">
                          {notice.initials}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-label-md text-label-md text-on-surface">{notice.author}</span>
                          <span className="text-[10px] text-outline">{notice.date}</span>
                        </div>
                      </div>
                      {(notice.pinned || notice.isNew) && (
                        <div className="flex gap-xs">
                          {notice.pinned && (
                            <span className="bg-primary-container text-on-primary-container text-[10px] px-sm py-xs rounded-lg uppercase font-bold tracking-wider">
                              PINNED
                            </span>
                          )}
                          {notice.isNew && (
                            <span className="bg-secondary-container text-on-secondary-container text-[10px] px-sm py-xs rounded-lg uppercase font-bold tracking-wider">
                              NEW
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="col-span-full text-center py-xl text-on-surface-variant">
                  No notices match your search.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative bg-surface w-full max-w-xl p-xl rounded-lg shadow-2xl mx-4">
            <div className="flex items-center justify-between mb-lg">
              <h3 className="font-headline-md text-headline-md text-primary flex items-center gap-sm">
                <Icon name="campaign" />
                Post New Notice
              </h3>
              <button
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-surface-container-high transition-colors"
                onClick={() => setModalOpen(false)}
              >
                <Icon name="close" />
              </button>
            </div>
            <form className="space-y-lg" onSubmit={publishNotice}>
              <div>
                <label className="font-label-md text-label-md text-on-surface mb-sm block">Notice Title</label>
                <input
                  value={draft.title}
                  onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
                  className="w-full px-md py-sm bg-surface-container-low border border-outline rounded-lg text-body-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                  placeholder="e.g. Annual Maintenance Update"
                  type="text"
                />
              </div>
              <div>
                <label className="font-label-md text-label-md text-on-surface mb-sm block">Notice Content</label>
                <textarea
                  value={draft.content}
                  onChange={(e) => setDraft((d) => ({ ...d, content: e.target.value }))}
                  className="w-full px-md py-sm bg-surface-container-low border border-outline rounded-lg text-body-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                  placeholder="Write the details here..."
                  rows={5}
                />
              </div>
              <div className="flex items-center justify-between p-md bg-surface-container-low rounded-lg border border-outline-variant">
                <div className="flex items-center gap-md">
                  <Icon name="priority_high" className="text-error" />
                  <div>
                    <p className="font-body-md text-body-md font-semibold text-on-surface">Mark as Important</p>
                    <p className="text-[10px] text-secondary">Pin to the top and highlight for all residents</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={draft.important}
                    onChange={(e) => setDraft((d) => ({ ...d, important: e.target.checked }))}
                  />
                  <div className="w-11 h-6 bg-surface-dim peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary" />
                </label>
              </div>
              <div className="flex gap-md justify-end mt-xl">
                <button
                  type="button"
                  className="px-xl py-md text-secondary font-label-md text-label-md hover:bg-surface-container-high rounded-lg transition-colors"
                  onClick={() => setModalOpen(false)}
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-xl py-md bg-primary text-on-primary font-label-md text-label-md rounded-lg shadow-sm hover:shadow-md transition-all active:scale-95"
                >
                  {submitting ? 'Publishing...' : 'Publish Notice'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
