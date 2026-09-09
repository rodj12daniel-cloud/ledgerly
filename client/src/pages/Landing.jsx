import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import BackgroundLines from '../components/BackgroundLines'

export default function Landing() {
  const navigate = useNavigate()
  const [leaving, setLeaving] = useState(false)
  const [activeSection, setActiveSection] = useState('')

  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (hash === 'features' || hash === 'about') setActiveSection(hash)
  }, [])

  function goToLogin(event) {
    event.preventDefault()
    setLeaving(true)
    window.setTimeout(() => navigate('/login'), 420)
  }

  function goToRegister(event) {
    event.preventDefault()
    setLeaving(true)
    window.setTimeout(() => navigate('/register'), 420)
  }

  function goHome(event) {
    event.preventDefault()
    setLeaving(true)
    window.setTimeout(() => {
      setActiveSection('')
      window.history.replaceState(null, '', window.location.pathname)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      setLeaving(false)
    }, 420)
  }

  function showSection(event, section) {
    event.preventDefault()
    setActiveSection(section)
    window.history.replaceState(null, '', `#${section}`)
    window.setTimeout(() => document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 0)
  }

  return <main className={`landing-showcase ${leaving ? 'is-leaving' : ''}`}>
    <BackgroundLines className="landing-background-lines">
    <nav className="showcase-nav"><Link className="showcase-brand" to="/" onClick={goHome}><img className="showcase-logo-mark" src="/assets/images/vector.png" alt="" /><span>Ledgerly</span></Link><div className="showcase-links"><a href="#features" onClick={event => showSection(event, 'features')}>Features</a><a href="#about" onClick={event => showSection(event, 'about')}>About</a><Link className="showcase-signup" to="/register">Sign up</Link></div></nav>
    {!activeSection && <section className="showcase-hero"><div className="showcase-badge"><strong>NEW</strong><span>Personal finance, made clear</span></div><h1>Ledgerly</h1><p>Soft rolling waves for clearer money.<br />Track your spending with less noise and more intention.</p><div className="showcase-actions"><Link className="showcase-primary" to="/register" onClick={goToRegister}>Get started <span aria-hidden="true">↗</span></Link><Link className="showcase-secondary" to="/login" onClick={goToLogin}>Log in</Link></div></section>}
    {activeSection === 'features' && <section id="features" className="landing-features"><div className="features-heading"><span className="eyebrow">The Ledgerly toolkit</span><h2>Packed with practical features</h2><p>Everything you need to make everyday money decisions feel simpler.</p></div><div className="features-simple-grid"><article className="feature-simple-card"><div className="feature-illustration feature-illustration-receipt"><span><b><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 9h14M7 9V7a5 5 0 0 1 10 0v2M4 9h16l-1 11H5L4 9Z" /><path d="M9 13h6" /></svg>Coffee</b><em>PHP 180</em></span><span><b><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 15h18l-1.5-5H15l-2-3H7L5 10H3v5ZM5 15v3M19 15v3M7 18h2M15 18h2" /></svg>Transport</b><em>PHP 240</em></span><span><b><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8h14l-1 12H6L5 8ZM4 8h16M9 8V5h6v3M8 12h8M8 16h8" /></svg>Groceries</b><em>PHP 1,240</em></span></div><div><h3>Real-time expense logging</h3><p>Add spending as it happens and keep your daily picture current.</p></div></article><article className="feature-simple-card"><div className="feature-illustration feature-illustration-wallet"><span className="feature-folder" /><i /><i /><i /></div><div><h3>Secure money organization</h3><p>Keep wallets and balances in one private, easy-to-scan workspace.</p></div></article><article className="feature-simple-card"><div className="feature-illustration feature-illustration-chart"><span /><span /><span /><i>PHP</i><i>USD</i></div><div><h3>Clear financial overview</h3><p>See patterns, categories, and progress without the clutter.</p></div></article></div></section>}
    {activeSection === 'about' && <section id="about" className="landing-about"><div className="about-intro"><span className="eyebrow">About Ledgerly</span><h2>A quieter way to understand your money.</h2><p>Ledgerly gives everyday spending a clear home, so small decisions become easier to see and act on.</p></div><div className="about-bento"><article className="about-tile about-tile-large"><img className="about-feature-image" src="/assets/woman-about.jpg" alt="Woman reviewing her finances" /><div className="about-feature-shade" /><span className="about-number">01</span></article><article className="about-tile"><span className="about-icon">+</span><h3>Manual by design</h3><p>You decide what belongs in your ledger. No bank connections required.</p></article><article className="about-tile about-tile-accent"><span className="about-icon">↗</span><h3>Made for momentum</h3><p>Simple records become useful habits over time.</p></article><article className="about-tile about-clarity-tile"><span className="about-number">02</span><h3>Clarity over clutter</h3><p>See balances, expenses, and patterns together in one calm workspace.</p></article></div></section>}
    </BackgroundLines>
  </main>
}
