import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { api } from '../api'
import BackgroundLines from '../components/BackgroundLines'
import SpecularButton from '../components/SpecularButton'

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
    <main className="auth-card"><Link className="mobile-brand brand showcase-brand auth-home-link" to="/" onClick={goHome}><img src="/assets/images/vector.png" alt="" /><span>Ledgerly</span></Link><span className="eyebrow">{isRegister ? 'Start your ledger' : 'Welcome back'}</span><h2>{isRegister ? 'Create your account' : 'Sign in to Ledgerly'}</h2><p className="muted">{isRegister ? 'A simple home for your daily spending.' : 'Your finances are waiting for you.'}</p>
      <div className="manual-notice"><strong>Manual tracking only.</strong><span>Ledgerly does not connect to cards or bank accounts. Never enter card numbers, CVV/CVCs, PINs, or banking credentials.</span></div>
      {error && <div className="alert error">{error}</div>}
      <form onSubmit={submit}>{isRegister && <label>Name<input name="name" value={form.name} onChange={change} placeholder="Your name" required /></label>}<label>Email<input name="email" type="email" value={form.email} onChange={change} placeholder="you@example.com" required /></label><label>Password<input name="password" type="password" value={form.password} onChange={change} placeholder="At least 6 characters" required minLength="6" /></label>{isRegister && <><label>Confirm password<input name="confirmPassword" type="password" value={form.confirmPassword} onChange={change} placeholder="Repeat your password" required /></label><label>Preferred currency<select name="currency" value={form.currency} onChange={change}>{currencies.map(currency => <option key={currency}>{currency}</option>)}</select></label></>}<SpecularButton type="submit" size="md" radius={8} tint="#d5d9de" tintOpacity={0.2} blur={10} textColor="#ffffff" lineColor="#ffffff" baseColor="#666d75" intensity={1.05} shineSize={12} shineFade={35} thickness={1.2} speed={0.35} followMouse proximity={220} disabled={loading}>{loading ? 'Please wait...' : isRegister ? 'Create account' : 'Sign in'}</SpecularButton></form>
      <p className="auth-switch">{isRegister ? 'Already have an account?' : 'New to Ledgerly?'} <Link to={isRegister ? '/login' : '/register'}>{isRegister ? 'Sign in' : 'Create an account'}</Link></p><p className="legal-links"><Link to="/privacy">Privacy Policy</Link><span>·</span><Link to="/terms">Terms & Conditions</Link></p>
    </main>
  </div>
}
