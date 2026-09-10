import { useEffect, useMemo, useState } from 'react'
import { api } from '../api'
import useExchangeRates from '../hooks/useExchangeRates'

const palette = ['#147a91', '#e76f51', '#f2b134', '#5a9a57', '#7b61a8', '#d1495b', '#2a9d8f', '#52677d']
const dateOptions = [['all', 'All time'], ['30', 'Last 30 days'], ['90', 'Last 90 days'], ['year', 'This year']]
const categoryOptions = ['All categories', 'Food', 'Transportation', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Education', 'Other']

function money(value, currency, hidden) { return hidden ? '****' : new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(value) }
function shortMoney(value, currency) { return new Intl.NumberFormat('en-US', { style: 'currency', currency, notation: 'compact', maximumFractionDigits: 1 }).format(value) }
function dateLabel(date) { return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }

function Donut({ categories, total, currency, hidden }) {
  let offset = 0
  const segments = categories.map(([category, amount], index) => {
    const percent = total ? amount / total * 100 : 0
    const segment = { category, amount, percent, offset, color: palette[index % palette.length] }
    offset += percent
    return segment
  })
  return <div className="analytics-donut-wrap"><div className="analytics-donut" style={{ background: segments.length ? `conic-gradient(${segments.map(item => `${item.color} ${item.offset}% ${item.offset + item.percent}%`).join(', ')})` : 'var(--surface-2)' }}><div><strong>{hidden ? '****' : shortMoney(total, currency)}</strong><span>Total spent</span></div></div><div className="analytics-legend">{segments.map(item => <div className="analytics-legend-item" key={item.category}><i style={{ background: item.color }} /><span>{item.category}</span><strong>{item.percent.toFixed(0)}%</strong></div>)}</div></div>
}

function SpendingTrend({ points, currency, hidden }) {
  const max = Math.max(...points.map(point => point.amount), 1)
  if (points.length === 1) return <div className="trend-chart trend-single"><div className="trend-single-stage"><div className="trend-single-bar" style={{ height: `${Math.max(points[0].amount / max * 100, 12)}%` }}><strong>{hidden ? '****' : money(points[0].amount, currency)}</strong></div></div><div className="trend-labels"><span>{points[0].label}</span><span>One recorded period</span></div><div className="trend-highlights"><span>Only period tracked</span><span>{hidden ? '****' : money(points[0].amount, currency)}</span></div></div>
  const width = 640; const height = 220; const inset = 22
  const coordinates = points.map((point, index) => ({ ...point, x: inset + (points.length === 1 ? 0 : index * (width - inset * 2) / (points.length - 1)), y: height - inset - point.amount / max * (height - inset * 2) }))
  const line = coordinates.map((point, index) => `${index ? 'L' : 'M'} ${point.x} ${point.y}`).join(' ')
  const area = `${line} L ${coordinates.at(-1)?.x || inset} ${height - inset} L ${coordinates[0]?.x || inset} ${height - inset} Z`
  return <div className="trend-chart"><svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Spending over time"><defs><linearGradient id="trend-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#176b87" stopOpacity=".24" /><stop offset="1" stopColor="#176b87" stopOpacity="0" /></linearGradient></defs><path className="trend-area" d={area} /><path className="trend-line" d={line} />{coordinates.map(point => <circle key={point.label} cx={point.x} cy={point.y} r="4" />)}</svg><div className="trend-labels">{points.map(point => <span key={point.label}>{point.label}</span>)}</div>{points.length > 0 && <div className="trend-highlights"><span>Peak {shortMoney(max, currency)}</span><span>{hidden ? '****' : money(points.reduce((sum, point) => sum + point.amount, 0), currency)}</span></div>}</div>
}

export default function Analytics({ user, hideAmounts }) {
  const [expenses, setExpenses] = useState([])
  const [error, setError] = useState('')
  const [dateRange, setDateRange] = useState('all')
  const [category, setCategory] = useState('All categories')
  useEffect(() => { api('/expenses').then(setExpenses).catch(err => setError(err.message)) }, [])
  const { convert } = useExchangeRates(expenses, user.currency)
  const filtered = useMemo(() => {
    const today = new Date(); const start = new Date(today); const currentYear = today.getFullYear()
    if (dateRange === '30' || dateRange === '90') start.setDate(today.getDate() - Number(dateRange))
    return expenses.filter(item => {
      const date = new Date(item.date)
      const inRange = dateRange === 'all' || (dateRange === 'year' ? date.getFullYear() === currentYear : date >= start)
      return inRange && (category === 'All categories' || item.category === category)
    }).sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [expenses, dateRange, category])
  const rows = useMemo(() => filtered.map(item => ({ ...item, converted: convert(item.amount, item.currency || 'PHP') })), [filtered, convert])
  const categories = useMemo(() => Object.entries(rows.reduce((all, item) => ({ ...all, [item.category]: (all[item.category] || 0) + item.converted }), {})).sort((a, b) => b[1] - a[1]), [rows])
  const total = rows.reduce((sum, item) => sum + item.converted, 0)
  const average = rows.length ? total / rows.length : 0
  const trend = useMemo(() => {
    const grouped = rows.reduce((all, item) => { const key = item.date.slice(0, 7); all[key] = (all[key] || 0) + item.converted; return all }, {})
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b)).slice(-6).map(([key, amount]) => ({ label: new Date(`${key}-01T00:00:00`).toLocaleDateString('en-US', { month: 'short' }), amount }))
  }, [rows])
  const insights = useMemo(() => {
    if (!rows.length) return ['Add your first expense to unlock personalized spending patterns.']
    const items = [`${categories[0]?.[0] || 'Your top category'} is your biggest spending area at ${Math.round(categories[0][1] / total * 100)}% of the filtered total.`]
    if (rows.length > 1) items.push(`Your average transaction is ${money(average, user.currency, hideAmounts)} across ${rows.length} recorded expenses.`)
    if (rows[0]) items.push(`Your latest expense was ${rows[0].description} on ${new Date(rows[0].date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.`)
    return items
  }, [rows, categories, total, average, user.currency, hideAmounts])
  return <><header className="page-header analytics-header"><div><span className="eyebrow">Your patterns</span><h1>Analytics</h1><p className="muted">A clear view of your manually entered spending.</p></div><div className="analytics-header-mark">{dateRange === 'all' ? 'All activity' : dateOptions.find(option => option[0] === dateRange)?.[1]}</div></header>{error && <div className="alert error">{error}</div>}<section className="analytics-filters"><div><span className="eyebrow">Explore your ledger</span><strong>Spending overview</strong></div><label>Date range<select value={dateRange} onChange={event => setDateRange(event.target.value)}>{dateOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>Category<select value={category} onChange={event => setCategory(event.target.value)}>{categoryOptions.map(item => <option key={item}>{item}</option>)}</select></label></section><section className="analytics-summary"><div><span>Total spent</span><strong>{money(total, user.currency, hideAmounts)}</strong><small>{rows.length ? 'Within selected filters' : 'No matching records'}</small></div><div><span>Transactions</span><strong>{rows.length}</strong><small>Recorded expenses</small></div><div><span>Average transaction</span><strong>{money(average, user.currency, hideAmounts)}</strong><small>Per expense</small></div><div><span>Top category</span><strong>{categories[0]?.[0] || 'Not yet'}</strong><small>{categories[0] ? `${Math.round(categories[0][1] / total * 100)}% of total` : 'Add expenses to see'}</small></div></section><section className="analytics-main-grid"><div className="panel analytics-trend-panel"><div className="panel-heading"><div><span className="eyebrow">Monthly movement</span><h2>Spending over time</h2><p className="muted">Track your spending rhythm across the selected period.</p></div></div>{trend.length ? <SpendingTrend points={trend} currency={user.currency} hidden={hideAmounts} /> : <div className="empty-state"><strong>Your trend is waiting.</strong><span>Add expenses to see movement over time.</span></div>}</div><div className="panel analytics-donut-panel"><div className="panel-heading"><div><span className="eyebrow">Where it goes</span><h2>Spending breakdown</h2></div></div>{categories.length ? <Donut categories={categories} total={total} currency={user.currency} hidden={hideAmounts} /> : <div className="empty-state"><strong>No breakdown yet.</strong><span>Your categories will appear here.</span></div>}</div></section><section className="analytics-secondary-grid"><div className="panel analytics-category-panel"><div className="panel-heading"><div><span className="eyebrow">Category detail</span><h2>Spending by category</h2><p className="muted">Amounts and share of your filtered spending.</p></div></div>{categories.length ? <div className="analytics-category-list">{categories.map(([item, amount], index) => <div className="analytics-category-row" key={item}><div className="analytics-category-heading"><span><i style={{ background: palette[index % palette.length] }} />{item}</span><strong>{money(amount, user.currency, hideAmounts)}</strong></div><div className="analytics-category-bar"><span style={{ width: `${total ? amount / total * 100 : 0}%`, background: palette[index % palette.length] }} /></div><small>{total ? (amount / total * 100).toFixed(1) : 0}% of total</small></div>)}</div> : <div className="empty-state"><strong>Your first pattern is waiting.</strong><span>Add expenses to see a category breakdown.</span></div>}</div><div className="panel analytics-insights-panel"><div className="panel-heading"><div><span className="eyebrow">Signal, not noise</span><h2>Spending insights</h2></div></div><div className="insight-list">{insights.map((item, index) => <div className="insight-item" key={item}><span>0{index + 1}</span><p>{item}</p></div>)}</div></div></section><section className="analytics-tertiary-grid"><div className="panel analytics-largest-panel"><div className="panel-heading"><div><span className="eyebrow">Biggest line items</span><h2>Largest expenses</h2></div></div>{rows.length ? <div className="largest-list">{[...rows].sort((a, b) => b.converted - a.converted).slice(0, 5).map(item => <div className="largest-item" key={item._id}><span className="category-icon"><span>{item.category.charAt(0)}</span></span><div><strong>{item.description}</strong><small>{item.category} · {dateLabel(item.date)}</small></div><b>{money(item.converted, user.currency, hideAmounts)}</b></div>)}</div> : <div className="empty-state"><strong>No expenses found.</strong><span>Try another filter.</span></div>}</div><div className="panel analytics-recent-panel"><div className="panel-heading"><div><span className="eyebrow">Latest activity</span><h2>Recent spending</h2></div></div>{rows.length ? <div className="analytics-table-wrap"><table><thead><tr><th>Description</th><th>Category</th><th>Date</th><th className="align-right">Amount</th></tr></thead><tbody>{rows.slice(0, 6).map(item => <tr key={item._id}><td><strong>{item.description}</strong><small>{item.account || 'No account selected'}</small></td><td>{item.category}</td><td>{dateLabel(item.date)}</td><td className="align-right amount">{money(item.converted, user.currency, hideAmounts)}</td></tr>)}</tbody></table></div> : <div className="empty-state"><strong>No recent spending.</strong><span>Try another filter.</span></div>}</div></section></>
}
