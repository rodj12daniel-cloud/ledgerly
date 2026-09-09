import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api'
import NetWorthCardBase from '../components/NetWorthCard'
import UserProfileCard from '../components/UserProfileCard'

const currencies = ['PHP', 'USD', 'EUR', 'GBP', 'JPY', 'KRW', 'SGD']
const themes = [['sunny', 'Sunny'], ['midnight', 'Midnight'], ['gradient', 'Gradient'], ['sakura', 'Sakura'], ['aurora', 'Aurora']]

function NetWorthCard({ user }) {
  return <aside className="settings-note"><UserProfileCard user={user} /><NetWorthCardBase user={user} /></aside>
}

export default function Settings({ user, onUpdate, theme, onThemeChange }) {
  const [form, setForm] = useState({ name: user.name, currency: user.currency, preferredTheme: user.preferredTheme || theme || 'sunny', profilePicture: user.profilePicture || '' })
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  function choosePicture(event) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024) {
      setError('Choose a PNG, JPG, or WebP image under 2 MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => setForm(current => ({ ...current, profilePicture: reader.result }))
    reader.readAsDataURL(file)
  }

  async function submit(event) {
    event.preventDefault()
    setMessage('')
    setError('')
    setSaving(true)
    try {
      const updated = await api('/me', { method: 'PUT', body: JSON.stringify(form) })
      onUpdate(updated)
      onThemeChange(updated.preferredTheme)
      setMessage('Your settings have been saved.')
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function deleteAccount() {
    if (!window.confirm('Delete your account and all expenses permanently? This cannot be undone.')) return
    setDeleting(true)
    setError('')
    try {
      await api('/me', { method: 'DELETE' })
      localStorage.removeItem('ledgerly_token')
      onUpdate(null)
    } catch (err) {
      setError(err.message)
      setDeleting(false)
    }
  }

  return <><header className="page-header"><div><span className="eyebrow">Preferences</span><h1>Settings</h1><p className="muted">Make Ledgerly feel like yours.</p></div></header><section className="settings-layout"><div className="panel settings-panel"><div className="panel-heading"><div><h2>Profile</h2><p className="muted">Update your personal details.</p></div></div>{error && <div className="alert error">{error}</div>}{message && <div className="alert success">{message}</div>}<div className="privacy-notice"><strong>Manual tracking only</strong><span>Ledgerly does not connect to real cards or bank accounts. Never enter card numbers, CVV/CVCs, PINs, or banking credentials.</span></div><form onSubmit={submit}><div className="profile-picture-field"><span className="profile-picture-preview">{form.profilePicture ? <img src={form.profilePicture} alt="Profile preview" /> : user.name.charAt(0).toUpperCase()}</span><label className="profile-picture-picker">Profile picture<input type="file" accept="image/png,image/jpeg,image/webp" onChange={choosePicture} /><small className="field-help">PNG, JPG, or WebP under 2 MB.</small></label>{form.profilePicture && <button type="button" className="button secondary profile-picture-remove" onClick={() => setForm({ ...form, profilePicture: '' })}>Remove photo</button>}</div><label>Name<input value={form.name} onChange={event => setForm({ ...form, name: event.target.value })} required /></label><label>Email<span className="input-readonly">{user.email}<small>Email cannot be changed</small></span></label><label>Preferred currency<select value={form.currency} onChange={event => setForm({ ...form, currency: event.target.value })}>{currencies.map(item => <option key={item}>{item}</option>)}</select><small className="field-help">This only changes how amounts are displayed.</small></label><label>Preferred theme<select value={form.preferredTheme} onChange={event => { const nextTheme = event.target.value; setForm({ ...form, preferredTheme: nextTheme }); onThemeChange(nextTheme) }}>{themes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select><small className="field-help">Choose the look that feels most like you.</small></label><button className="button primary" disabled={saving}>{saving ? 'Saving...' : 'Save changes'}</button></form><div className="settings-links"><Link to="/privacy">Privacy Policy</Link><Link to="/terms">Terms & Conditions</Link></div><div className="delete-zone"><h3>Delete account</h3><p>This permanently removes your account and every expense you entered.</p><button className="button danger" onClick={deleteAccount} disabled={deleting}>{deleting ? 'Deleting...' : 'Delete my account'}</button></div></div><NetWorthCard user={user} /></section></>
}
