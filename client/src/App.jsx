import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { api } from './api'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Expenses from './pages/Expenses'
import Settings from './pages/Settings'
import Legal from './pages/Legal'
import Accounts from './pages/Accounts'
import Analytics from './pages/Analytics'
import Landing from './pages/Landing'

function HomePage({ user, theme, onThemeChange, hideAmounts, onLogout, onToggleAmounts }) {
  return <Layout user={user} theme={theme} setTheme={onThemeChange} onLogout={onLogout} hideAmounts={hideAmounts} onToggleAmounts={onToggleAmounts}><Dashboard user={user} theme={theme} onThemeChange={onThemeChange} hideAmounts={hideAmounts} /></Layout>
}

export default function App() {
  const storedTheme = localStorage.getItem('ledgerly_theme'); const initialTheme = storedTheme === 'dark' ? 'midnight' : storedTheme === 'light' || storedTheme === 'ocean' ? 'sunny' : storedTheme || 'sunny'
  const [user, setUser] = useState(null); const [theme, setTheme] = useState(initialTheme); const [hideAmounts, setHideAmounts] = useState(localStorage.getItem('ledgerly_hide_amounts') === 'true'); const [loading, setLoading] = useState(Boolean(localStorage.getItem('ledgerly_token'))); const location = useLocation()
  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem('ledgerly_theme', theme) }, [theme])
  useEffect(() => { if (!localStorage.getItem('ledgerly_token')) return; api('/me').then(setUser).catch(() => localStorage.removeItem('ledgerly_token')).finally(() => setLoading(false)) }, [])
  useEffect(() => { if (user?.preferredTheme) setTheme(user.preferredTheme === 'ocean' ? 'sunny' : user.preferredTheme) }, [user?.preferredTheme])
  useEffect(() => { localStorage.setItem('ledgerly_hide_amounts', String(hideAmounts)) }, [hideAmounts])
  async function changeTheme(nextTheme) {
    setTheme(nextTheme)
    if (!user) return
    try { setUser(await api('/me', { method: 'PUT', body: JSON.stringify({ preferredTheme: nextTheme }) })) } catch { setTheme(user.preferredTheme || 'sunny') }
  }
  function logout() { setUser(null) }
  if (loading) return <div className="loading-screen"><div className="loading-brand"><span className="loading-halo" /><img src="/assets/images/Black%20and%20Gold%20Elegant%20Banking%20Finance%20Logo%20(1).png" alt="Ledgerly" /><span className="loading-progress" /></div></div>
  return <Routes><Route path="/" element={user ? <HomePage user={user} theme={theme} onThemeChange={changeTheme} hideAmounts={hideAmounts} onLogout={logout} onToggleAmounts={() => setHideAmounts(value => !value)} /> : <Landing />} /><Route path="/login" element={user ? <Navigate to="/" replace /> : <Auth mode="login" onLogin={setUser} />} /><Route path="/register" element={user ? <Navigate to="/" replace /> : <Auth mode="register" onLogin={setUser} />} /><Route path="/privacy" element={<Legal type="privacy" user={user} />} /><Route path="/terms" element={<Legal type="terms" user={user} />} /><Route element={<ProtectedRoute user={user} />}><Route element={<Layout user={user} theme={theme} setTheme={changeTheme} onLogout={logout} hideAmounts={hideAmounts} onToggleAmounts={() => setHideAmounts(value => !value)} />}><Route path="/expenses" element={<Expenses user={user} hideAmounts={hideAmounts} />} /><Route path="/accounts" element={<Accounts user={user} hideAmounts={hideAmounts} />} /><Route path="/analytics" element={<Analytics user={user} hideAmounts={hideAmounts} />} /><Route path="/settings" element={<Settings user={user} onUpdate={setUser} theme={theme} onThemeChange={changeTheme} />} /></Route></Route><Route path="*" element={<Navigate to={user ? '/' : '/'} state={{ from: location.pathname }} replace />} /></Routes>
}
