import Icon from './Icon.jsx'

export default function TopBar({ title = 'UrbanLink', searchPlaceholder, onSearch, avatar }) {
  return (
    <header className="bg-surface border-b border-outline-variant shadow-sm flex justify-between items-center w-full px-lg h-16 z-50 fixed top-0 left-0 md:left-[280px] right-0">
      <div className="flex items-center gap-4">
        <span className="font-headline-md text-headline-md font-bold text-primary">{title}</span>
        {searchPlaceholder && (
          <div className="hidden md:flex bg-surface-container-low items-center px-sm rounded-lg border border-outline-variant ml-xl gap-2">
            <Icon name="search" className="text-outline" />
            <input
              onChange={(e) => onSearch?.(e.target.value)}
              className="bg-transparent border-none focus:ring-0 text-body-md py-2 w-64 outline-none"
              placeholder={searchPlaceholder}
              type="text"
            />
          </div>
        )}
      </div>
      <div className="flex items-center gap-md">
        <button className="p-2 hover:bg-surface-container-low transition-colors duration-200 rounded-full text-secondary">
          <Icon name="notifications" />
        </button>
        <div className="flex items-center gap-sm">
          <div className="w-8 h-8 rounded-full bg-secondary-container overflow-hidden flex items-center justify-center text-on-secondary-container font-bold text-xs">
            {avatar || 'AU'}
          </div>
          <span className="font-label-md text-label-md text-on-surface hidden md:block">Admin User</span>
          <Icon name="expand_more" className="text-outline" />
        </div>
      </div>
    </header>
  )
}
