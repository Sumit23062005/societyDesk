export default function Icon({ name, className = '', filled = false, style = {} }) {
  return (
    <span
      className={`material-symbols-outlined ${filled ? 'filled' : ''} ${className}`}
      style={style}
    >
      {name}
    </span>
  )
}
