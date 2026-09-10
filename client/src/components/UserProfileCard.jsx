import { useRef, useState } from 'react'
import html2canvas from 'html2canvas'

function initials(name = '') {
  return name.split(' ').filter(Boolean).slice(0, 2).map(part => part[0]).join('').toUpperCase() || 'U'
}

export default function UserProfileCard({ user }) {
  const cardRef = useRef(null)
  const [downloading, setDownloading] = useState(false)

  async function downloadCard() {
    if (!cardRef.current || downloading) return
    setDownloading(true)
    try {
      const canvas = await html2canvas(cardRef.current, { scale: 3, backgroundColor: null, useCORS: true })
      const link = document.createElement('a')
      link.download = `ledgerly-profile-${user.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'card'}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()
    } finally {
      setDownloading(false)
    }
  }

  return <section className="profile-card-panel">
    <div className="profile-card-heading"><div><span className="eyebrow">Identity</span><h2>User profile</h2></div></div>
    <article ref={cardRef} className="user-profile-card" style={{ '--profile-card-color': user.cardColor || '#1769AA' }}>
      <div className="user-profile-lines" />
      <div className="user-profile-top"><span className="user-profile-chip" /><img className="user-profile-logo" src="/assets/images/vector.png" alt="Ledgerly" /></div>
      <div className="user-profile-avatar">{user.profilePicture ? <img src={user.profilePicture} alt="" /> : initials(user.name)}</div>
      <div className="user-profile-number">•••• &nbsp;•••• &nbsp;•••• &nbsp;{user.currency || 'PHP'}</div>
      <div className="user-profile-bottom"><div className="user-profile-holder"><small>CARDHOLDER NAME</small><strong>{user.name}</strong></div><div><small>ACCOUNT TYPE</small><strong>PERSONAL</strong></div></div>
    </article>
    <button type="button" className="profile-card-download" onClick={downloadCard} disabled={downloading}>{downloading ? 'Preparing image...' : 'Download card'}</button>
    <div className="profile-card-details"><strong>{user.name}</strong><span>{user.email}</span><small>Display currency: {user.currency}</small></div>
  </section>
}