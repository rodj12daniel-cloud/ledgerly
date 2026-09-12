import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { api } from '../api'
import BackgroundLines from '../components/BackgroundLines'

const currencies = ['PHP', 'USD', 'EUR', 'GBP', 'JPY', 'KRW', 'SGD']

export default function Auth({ mode, onLogin }) {
  const isRegister = mode === 'register'
  const navigate = useNavigate()
  const location = useLocation()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', currency: 'PHP' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [leaving, setLeaving] = useState(false)

  function change(event) { setForm({ ...form, [event.target.name]: event.target.value }) }

  function goHome(event) {
    event.preventDefault()
    setLeaving(true)
    window.setTimeout(() => navigate('/'), 360)
  }

  async function submit(event) {
    event.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await api(`/auth/${isRegister ? 'register' : 'login'}`, { method: 'POST', body: JSON.stringify(form) })
      localStorage.setItem('ledgerly_token', data.token)
      onLogin(data.user)
      navigate(location.state?.from || '/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return <div className={`auth-page ${leaving ? 'is-leaving' : ''}`}>
    <aside className="auth-aside">
      <div className="auth-waves" aria-hidden="true"><BackgroundLines /></div>
      <Link className="brand showcase-brand auth-home-link" to="/" onClick={goHome}><img src="/assets/images/vector.png" alt="" /><span>Ledgerly</span></Link>
      <div className="auth-quote"><span className="eyebrow">Personal finance, made clear</span><h1>A calmer way to keep an eye on your money.</h1><p>Track everyday spending, spot patterns, and make room for what matters.</p></div>
      <div className="auth-aside-footer">Private by design <span>•</span> Built for real life</div>
    </aside>
    <main className={`auth-card ${isRegister ? 'is-register' : 'is-login'}`}>
      <form className="auth-form" onSubmit={submit}>
        <Link className="auth-form-brand showcase-brand auth-home-link" to="/" onClick={goHome}><img src="/assets/images/vector.png" alt="" /><span>Ledgerly</span></Link>
        <p className="auth-form-heading">{isRegister ? 'Sign Up' : 'Login'}</p>
        {isRegister && <label className="auth-field"><input className="auth-input-field" name="name" value={form.name} onChange={change} placeholder="Name" autoComplete="name" required /></label>}
        <label className="auth-field"><input className="auth-input-field" name="email" type="email" value={form.email} onChange={change} placeholder="E-mail" autoComplete="email" required /></label>
        <label className="auth-field"><input className="auth-input-field" name="password" type="password" value={form.password} onChange={change} placeholder="Password" autoComplete={isRegister ? 'new-password' : 'current-password'} required minLength="6" /></label>
        {isRegister && <><label className="auth-field"><input className="auth-input-field" name="confirmPassword" type="password" value={form.confirmPassword} onChange={change} placeholder="Confirm password" autoComplete="new-password" required /></label><label className="auth-field auth-select-field"><select className="auth-input-field" name="currency" value={form.currency} onChange={change}>{currencies.map(currency => <option key={currency}>{currency}</option>)}</select></label></>}
        {error && <div className="alert error">{error}</div>}
        <div className="auth-form-buttons"><button className="auth-submit" type="submit" disabled={loading}>{loading ? 'Please wait...' : isRegister ? 'Create account' : 'Login'}</button><Link className="auth-mode-button" to={isRegister ? '/login' : '/register'}>{isRegister ? 'Login' : 'Sign Up'}</Link></div>
        <p className="auth-switch">{isRegister ? 'Already have an account?' : 'New to Ledgerly?'} <Link to={isRegister ? '/login' : '/register'}>{isRegister ? 'Sign in' : 'Create an account'}</Link></p>
        <p className="legal-links"><Link to="/privacy">Privacy Policy</Link><span>·</span><Link to="/terms">Terms & Conditions</Link></p>
      </form>
    </main>
  </div>
}
