const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '')

export async function api(path, options = {}) {
  const token = localStorage.getItem('ledgerly_token')
  let response
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers }
    })
  } catch {
    throw new Error('Unable to reach the Ledgerly API. Check that the server is running and VITE_API_URL points to it.')
  }
  const data = await response.json().catch(() => ({}))
  if (response.status === 401) {
    localStorage.removeItem('ledgerly_token')
    sessionStorage.removeItem('ledgerly_token')
  }
  if (!response.ok) throw new Error(data.message || 'Something went wrong.')
  return data
}
