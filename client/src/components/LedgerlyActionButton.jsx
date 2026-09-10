export default function LedgerlyActionButton({ children, onClick, type = 'button', secondary = false, className = '' }) {
  const label = String(children)
  return <button type={type} className={`ledgerly-action-button ${secondary ? 'is-secondary' : ''}${className ? ` ${className}` : ''}`} onClick={onClick}>
    <span className="ledgerly-action-dots" aria-hidden="true" />
    <svg className="ledgerly-action-sparkle" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true"><path d="M14.187 8.096 15 5.25l.813 2.846a5.7 5.7 0 0 0 3.09 3.09L21.75 12l-2.846.813a5.7 5.7 0 0 0-3.09 3.09L15 18.75l-.813-2.846a5.7 5.7 0 0 0-3.09-3.09L8.25 12l2.846-.813a5.7 5.7 0 0 0 3.09-3.09Z" /><path d="m6 14.25-.259 1.035a3.2 3.2 0 0 1-2.456 2.456L2.25 18l1.035.259a3.2 3.2 0 0 1 2.456 2.456L6 21.75l.259-1.035a3.2 3.2 0 0 1 2.456-2.456L9.75 18l-1.035-.259a3.2 3.2 0 0 1-2.456-2.456Z" /><path d="m6.5 4-.197.592a1.8 1.8 0 0 1-1.106 1.106L4.5 5.9l.697.202a1.8 1.8 0 0 1 1.106 1.106L6.5 8l.197-.792a1.8 1.8 0 0 1 1.106-1.106L8.5 5.9l-.697-.202A1.8 1.8 0 0 1 6.697 4.592Z" /></svg>
    <span className="ledgerly-action-text">{label}</span>
  </button>
}
