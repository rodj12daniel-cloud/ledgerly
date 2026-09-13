export function LoadingIndicator({ type = 'dot-circle', size = 'md' }) {
  return <span className={`loading-indicator loading-indicator-${type} loading-indicator-${size}`} aria-hidden="true"><i /><i /><i /></span>
}