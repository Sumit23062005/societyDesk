import { Link, useLocation } from 'react-router-dom'
import Icon from './Icon.jsx'

const ITEMS = [
  { label: 'Home', icon: 'dashboard', to: '/dashboard' },
  { label: 'Complaints', icon: 'report_problem', to: '/complaints' },
  { label: 'Notices', icon: 'campaign', to: '/notices' },
  { label: 'Profile', icon: 'account_circle', to: '#' },
]

export default function MobileNav() {
  const location = useLocation()
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-surface border-t border-outline-variant flex items-center justify-around z-50">
      {ITEMS.map((item) => {
        const isActive = location.pathname === item.to
        return (
          <Link
            key={item.label}
            to={item.to}
            className={`flex flex-col items-center justify-center gap-1 ${
              isActive ? 'text-primary' : 'text-on-surface-variant'
            }`}
          >
            <Icon name={item.icon} filled={isActive} />
            <span className="text-[10px] font-label-md">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
