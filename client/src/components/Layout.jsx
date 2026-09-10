import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import BackgroundLines from './BackgroundLines'
import LedgerlyChatbot from './LedgerlyChatbot'

const links = [['/', 'Dashboard'], ['/expenses', 'Expenses'], ['/accounts', 'Accounts'], ['/analytics', 'Analytics'], ['/settings', 'Settings']]
const navIcons = {
  Dashboard: <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>,
  Expenses: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l3 3v15H6V3Z" /><path d="M15 3v4h4M9 12h6M9 16h4" /></svg>,
  Accounts: <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18M7 15h4" /></svg>,
  Analytics: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19V5M4 19h17" /><path d="m7 15 3-4 3 2 5-7" /></svg>,
  Settings: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9.7 3.6.5 1.8a7.4 7.4 0 0 1 3.6 0l.5-1.8 2.1.9-.6 1.8a7.4 7.4 0 0 1 2.5 2.5l1.8-.6.9 2.1-1.8.5a7.4 7.4 0 0 1 0 3.6l1.8.5-.9 2.1-1.8-.6a7.4 7.4 0 0 1-2.5 2.5l.6 1.8-2.1.9-.5-1.8a7.4 7.4 0 0 1-3.6 0l-.5 1.8-2.1-.9.6-1.8a7.4 7.4 0 0 1-2.5-2.5l-1.8.6-.9-2.1 1.8-.5a7.4 7.4 0 0 1 0-3.6l-1.8-.5.9-2.1 1.8.6a7.4 7.4 0 0 1 2.5-2.5l-.6-1.8 2.1-.9Z" /><circle cx="12" cy="12" r="2.7" /></svg>
}

export default function Layout({ user, theme, setTheme, onLogout, hideAmounts, onToggleAmounts, children }) {
  const navigate = useNavigate()
  function logout() { localStorage.removeItem('ledgerly_token'); sessionStorage.removeItem('ledgerly_token'); onLogout(); navigate('/login', { replace: true }) }
  const avatar = user.profilePicture ? <img src={user.profilePicture} alt="" /> : user.name.charAt(0).toUpperCase()
  return <div className={`app-shell ${hideAmounts ? 'amounts-hidden' : ''}`}>
    {theme === 'aurora' && <BackgroundLines className="app-theme-lines" />}
    <aside className="sidebar">
      <div className="brand"><img src="/assets/images/vector.png" alt="Ledgerly" /></div>
      <div className="sidebar-label">Workspace</div>
      <nav>{links.map(([to, label]) => <NavLink key={to} to={to} end={to === '/'} title={label} aria-label={label} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}><span className="nav-icon">{navIcons[label]}</span><span className="nav-link-label">{label}</span></NavLink>)}</nav>
      <div className="sidebar-footer"><button className="amount-toggle" onClick={onToggleAmounts} aria-label={hideAmounts ? 'Show amounts' : 'Hide amounts'} title={hideAmounts ? 'Show amounts' : 'Hide amounts'}><span className="amount-toggle-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.5" />{hideAmounts && <path d="m4 4 16 16" />}</svg></span><span>{hideAmounts ? 'Show amounts' : 'Hide amounts'}</span></button><label className="theme-toggle"><span>{theme === 'midnight' ? 'Day mode' : 'Night mode'}</span><span className="switch"><input type="checkbox" checked={theme === 'midnight'} onChange={event => setTheme(event.target.checked ? 'midnight' : 'sunny')} aria-label={theme === 'midnight' ? 'Switch to day mode' : 'Switch to night mode'} /><span className="slider" /></span></label><button className="user-block" onClick={() => navigate('/settings')}><span className="avatar">{avatar}</span><span className="user-copy"><strong>{user.name}</strong><small>{user.email}</small></span><span className="chevron">›</span></button><button className="logout logout-button" onClick={logout} aria-label="Log out"><span className="logout-sign" aria-hidden="true"><svg viewBox="0 0 512 512"><path d="M377.9 105.9 500.7 228.7c7.2 7.2 11.3 17.1 11.3 27.3s-4.1 20.1-11.3 27.3L377.9 406.1c-6.4 6.4-15 9.9-24 9.9-18.7 0-33.9-15.2-33.9-33.9v-62.1h-128c-17.7 0-32-14.3-32-32v-64c0-17.7 14.3-32 32-32h128v-62.1c0-18.7 15.2-33.9 33.9-33.9 9 0 17.6 3.6 24 9.9ZM160 96H96c-17.7 0-32 14.3-32 32v256c0 17.7 14.3 32 32 32h64c17.7 0 32 14.3 32 32s-14.3 32-32 32H96c-53 0-96-43-96-96V128C0 75 43 32 96 32h64c17.7 0 32 14.3 32 32s-14.3 32-32 32Z" /></svg></span><span className="logout-text">Logout</span></button></div>
    </aside>
    <main className="main-content"><div className="manual-notice app-notice"><strong>Manual expense tracker</strong><span>No card or bank connections. Enter expenses only; never enter card numbers, CVV/CVCs, PINs, or banking credentials.</span></div>{children || <Outlet />}</main>
    <LedgerlyChatbot user={user} hideAmounts={hideAmounts} />
  </div>
}
