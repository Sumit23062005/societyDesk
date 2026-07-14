import { Link, useLocation } from 'react-router-dom'
import Icon from './Icon.jsx'

const NAV_ITEMS = [
  { label: 'Dashboard', icon: 'dashboard', to: '/dashboard' },
  { label: 'Complaints', icon: 'report_problem', to: '/complaints' },
  { label: 'Notice Board', icon: 'campaign', to: '/notices' },
  { label: 'Residents', icon: 'group', to: '#' },
]

export default function AdminSidebar({ onNewNotice, topOffset = false }) {
  const location = useLocation()

  return (
    <aside
      className={`hidden md:flex w-[280px] h-screen fixed left-0 top-0 bg-surface-container-low border-r border-outline-variant flex-col py-lg z-40 ${
        topOffset ? 'pt-20' : ''
      }`}
    >
      {!topOffset && (
        <div className="px-lg mb-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-on-primary">
            <Icon name="apartment" />
          </div>
          <div>
            <h1 className="font-headline-sm text-headline-sm text-primary">Admin Panel</h1>
            <p className="font-label-md text-label-md text-secondary">UrbanLink Residents</p>
          </div>
        </div>
      )}

      <nav className="flex-1 space-y-1 px-sm">
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.to
          return (
            <Link
              key={item.label}
              to={item.to}
              className={`flex items-center gap-3 py-3 px-lg mx-sm rounded-lg transition-transform scale-95 active:scale-100 ${
                isActive
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <Icon name={item.icon} filled={isActive} />
              <span className="font-label-md text-label-md">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="px-lg my-lg">
        <button
          onClick={onNewNotice}
          className="w-full bg-primary text-on-primary font-label-md text-label-md py-3 rounded-lg shadow-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          <Icon name="add" className="text-[18px]" />
          New Notice
        </button>
      </div>

      <div className="mt-auto pt-lg border-t border-outline-variant/30 px-sm pb-lg">
        <a
          href="#"
          className="flex items-center gap-3 py-3 px-lg mx-sm rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-transform scale-95 active:scale-100"
        >
          <Icon name="settings" />
          <span className="font-label-md text-label-md">Settings</span>
        </a>
        <a
          href="#"
          className="flex items-center gap-3 py-3 px-lg mx-sm rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-transform scale-95 active:scale-100"
        >
          <Icon name="help" />
          <span className="font-label-md text-label-md">Support</span>
        </a>
      </div>
    </aside>
  )
}
