import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import BackgroundLines from './BackgroundLines'

const links = [['/', 'Dashboard'], ['/expenses', 'Expenses'], ['/accounts', 'Accounts'], ['/analytics', 'Analytics'], ['/settings', 'Settings']]
const navIcons = {
  Dashboard: <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>,
  Expenses: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h9l3 3v15H6V3Z" /><path d="M15 3v4h4M9 12h6M9 16h4" /></svg>,
  Accounts: <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 10h18M7 15h4" /></svg>,
  Analytics: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19V5M4 19h17" /><path d="m7 15 3-4 3 2 5-7" /></svg>,
  Settings: <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M18.4 5.6l-2.1 2.1M7.7 16.3l-2.1 2.1" /><circle cx="12" cy="12" r="4" /></svg>
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
      <nav>{links.map(([to, label]) => <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}><span className="nav-icon">{navIcons[label]}</span><span className="nav-link-label">{label}</span></NavLink>)}</nav>
      <div className="sidebar-footer"><button className="amount-toggle" onClick={onToggleAmounts} aria-label={hideAmounts ? 'Show amounts' : 'Hide amounts'} title={hideAmounts ? 'Show amounts' : 'Hide amounts'}><span className="amount-toggle-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" /><circle cx="12" cy="12" r="2.5" />{hideAmounts && <path d="m4 4 16 16" />}</svg></span><span>{hideAmounts ? 'Show amounts' : 'Hide amounts'}</span></button><button className="theme-toggle" onClick={() => setTheme(theme === 'midnight' ? 'sunny' : 'midnight')}><span>{theme === 'midnight' ? 'Day mode' : 'Night mode'}</span><span className="toggle-pill"><span /></span></button><button className="user-block" onClick={() => navigate('/settings')}><span className="avatar">{avatar}</span><span className="user-copy"><strong>{user.name}</strong><small>{user.email}</small></span><span className="chevron">›</span></button><button className="logout" onClick={logout}>Log out</button></div>
    </aside>
    <main className="main-content"><div className="manual-notice app-notice"><strong>Manual expense tracker</strong><span>No card or bank connections. Enter expenses only; never enter card numbers, CVV/CVCs, PINs, or banking credentials.</span></div>{children || <Outlet />}</main>
  </div>
}
