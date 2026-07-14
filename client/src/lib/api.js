const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'
const SESSION_USER_KEY = 'societydesk:user'

async function parseResponse(response) {
  const contentType = response.headers.get('content-type') || ''
  const payload = contentType.includes('application/json') ? await response.json() : null

  if (!response.ok) {
    const message = payload?.message || 'Request failed'
    throw new Error(message)
  }

  return payload
}

export async function request(path, options = {}) {
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData
  const headers = { ...(options.headers || {}) }

  if (!isFormData) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json'
  } else {
    delete headers['Content-Type']
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers,
    ...options,
  })

  return parseResponse(response)
}

export function getSessionUser() {
  try {
    const stored = localStorage.getItem(SESSION_USER_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function setSessionUser(user) {
  localStorage.setItem(SESSION_USER_KEY, JSON.stringify(user))
}

export function clearSessionUser() {
  localStorage.removeItem(SESSION_USER_KEY)
}

export function formatUserInitials(name = '') {
  return (
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('') || 'AU'
  )
}

export function formatDateTime(value) {
  if (!value) return ''
  const date = new Date(value)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

export function formatDate(value) {
  if (!value) return ''
  const date = new Date(value)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}
