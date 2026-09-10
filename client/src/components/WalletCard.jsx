import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

function money(value, currency) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(value)
}

function currencySymbol(currency) {
  return { PHP: '₱', USD: '$', EUR: '€', GBP: '£', JPY: '¥', KRW: '₩', SGD: 'S$' }[currency] || '$'
}

function isLightColor(color) {
  const hex = color?.replace('#', '') || '667085'
  const value = hex.length === 3 ? hex.split('').map(part => part + part).join('') : hex
  const [red, green, blue] = [0, 2, 4].map(index => parseInt(value.slice(index, index + 2), 16) / 255)
  const linear = channel => channel <= .03928 ? channel / 12.92 : Math.pow((channel + .055) / 1.055, 2.4)
  return (.2126 * linear(red) + .7152 * linear(green) + .0722 * linear(blue)) > .55
}

const localLogos = {
  bpi: '/assets/brand-logos/BPI.png',
  bdo: '/assets/brand-logos/BDO.png',
  metrobank: '/assets/brand-logos/Metrobank.png',
  'metro bank': '/assets/brand-logos/Metrobank.png',
  unionbank: '/assets/brand-logos/UnionBankWhite.png',
  'union bank': '/assets/brand-logos/UnionBankWhite.png',
  'security bank': '/assets/brand-logos/SecurityBank.png',
  rcbc: '/assets/brand-logos/RCBCWhite.png',
  pnb: '/assets/brand-logos/PNB.png',
  chinabank: '/assets/brand-logos/ChinaBankWhite.png',
  'china bank': '/assets/brand-logos/ChinaBankWhite.png',
  landbank: '/assets/brand-logos/LandBank.png',
  'land bank': '/assets/brand-logos/LandBank.png',
  'gotyme bank': '/assets/brand-logos/GoTymeBank.png'
}

const whiteLogoBanks = new Set(['bpi', 'gotyme', 'gotyme bank', 'pnb', 'metrobank', 'metro bank', 'rcbc', 'unionbank', 'union bank'])
const cardColors = [['Red', '#C81D35'], ['Blue', '#1769AA'], ['Green', '#2E7D32'], ['Gold', '#D39B2A'], ['Purple', '#7048A8'], ['Black', '#20252B'], ['White', '#E9EEF2'], ['Orange', '#D66A28'], ['Teal', '#168B91'], ['Pink', '#C65383']]

export default function WalletCard({ wallet, user, balance, hideAmount, onEdit, onRemove, onColorChange }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState({ top: 8, left: 8 })
  const menuButtonRef = useRef(null)
  const label = wallet.account || wallet.label || 'Cash'
  const normalizedLabel = label.toLowerCase()
  const isChinaBank = normalizedLabel === 'chinabank' || normalizedLabel === 'china bank'
  const isWhiteLogoBank = whiteLogoBanks.has(normalizedLabel)
  const logo = isChinaBank || isWhiteLogoBank ? localLogos[normalizedLabel] : wallet.accountLogo || localLogos[normalizedLabel] || ''
  const fallbackMark = wallet.moneyType === 'cash' ? currencySymbol(wallet.currency || user.currency) : label.charAt(0).toUpperCase()
  const isBank = wallet.moneyType === 'bank'
  const useWhiteLogo = isBank && (whiteLogoBanks.has(normalizedLabel) || isChinaBank) && !isLightColor(wallet.accountColor)
  const lightCard = isLightColor(wallet.accountColor)
  function updateMenuPosition() {
    if (!menuButtonRef.current) return
    const rect = menuButtonRef.current.getBoundingClientRect()
    setMenuPosition({ top: Math.max(8, Math.min(rect.top, window.innerHeight - 190)), left: Math.max(8, Math.min(rect.right + 8, window.innerWidth - 132)) })
  }

  useEffect(() => {
    if (!menuOpen) return undefined
    updateMenuPosition()
    window.addEventListener('resize', updateMenuPosition)
    window.addEventListener('scroll', updateMenuPosition, true)
    return () => { window.removeEventListener('resize', updateMenuPosition); window.removeEventListener('scroll', updateMenuPosition, true) }
  }, [menuOpen])

  const menu = menuOpen && createPortal(<div className="wallet-menu-popover" style={menuPosition}>{wallet.moneyType !== 'cash' && <><strong>Card color</strong><div className="wallet-menu-colors">{cardColors.map(([name, color]) => <button type="button" key={name} className="wallet-menu-color" style={{ '--swatch': color }} aria-label={`Change card color to ${name}`} title={name} onClick={() => { setMenuOpen(false); onColorChange?.(color) }}><i></i></button>)}</div></>}<button type="button" onClick={() => { setMenuOpen(false); onEdit() }}>Edit</button><button type="button" onClick={() => { setMenuOpen(false); onRemove() }}>Remove</button></div>, document.body)

  return <><article className={`wallet-card ${wallet.style || 'ink'} ${isBank ? 'bank-wallet' : ''} ${useWhiteLogo ? 'white-bank-logo' : ''} ${lightCard ? 'light-card' : ''} ${wallet.moneyType === 'cash' ? 'cash-wallet' : 'account-wallet'}`} style={{ '--card-brand': wallet.accountColor || '#667085' }}>
    <div className="wallet-card-top"><span className="wallet-brand-mark">{logo ? <img src={logo} alt={`${label} logo`} onError={event => { event.currentTarget.style.display = 'none' }} /> : <span className={wallet.moneyType === 'cash' ? 'cash-mark' : 'wallet-fallback-mark'}>{fallbackMark}</span>}</span><div className="wallet-menu-wrap"><button ref={menuButtonRef} className="wallet-menu" aria-label="Account actions" aria-expanded={menuOpen} onClick={() => setMenuOpen(open => !open)}>•••</button></div></div>
    <strong>{user.name}</strong>
    <div className="wallet-balance-label">Current balance</div>
    <div className="wallet-balance">{hideAmount ? '****' : money(balance ?? wallet.balance, user.currency)}</div>
    <div className="wallet-network" aria-hidden="true"><span className="wallet-mastercard"><i></i><i></i></span></div>
  </article>{menu}</>
}
