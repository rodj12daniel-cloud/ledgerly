import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

export const spendingPalette = ['#147a91', '#e76f51', '#f2b134', '#5a9a57', '#7b61a8', '#d1495b', '#2a9d8f', '#52677d']

export default function SpendingDonut({ categories, total, currency, hidden }) {
  const segments = categories.map(([category, amount], index) => ({ category, amount, percent: total ? amount / total * 100 : 0, color: spendingPalette[index % spendingPalette.length] }))
  const shortTotal = new Intl.NumberFormat('en-US', { style: 'currency', currency, notation: 'compact', maximumFractionDigits: 1 }).format(total)
  const money = value => hidden ? '****' : new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 2 }).format(value)
  return <div className="analytics-donut-wrap"><div className="analytics-donut-chart"><ResponsiveContainer width="100%" height={190} initialDimension={{ width: 190, height: 190 }}><PieChart><Tooltip position={{ x: 12, y: 8 }} allowEscapeViewBox={{ x: false, y: false }} formatter={value => [money(value), 'Spent']} contentStyle={{ border: '1px solid var(--line)', borderRadius: 8, background: 'var(--surface)', color: 'var(--ink)' }} /><Pie isAnimationActive={false} data={segments} dataKey="amount" nameKey="category" startAngle={-270} endAngle={-630} innerRadius={52} outerRadius={78} paddingAngle={1} stroke="var(--surface)" strokeWidth={2}>{segments.map(item => <Cell key={item.category} fill={item.color} />)}</Pie></PieChart></ResponsiveContainer><div className="analytics-donut-center"><strong>{hidden ? '****' : shortTotal}</strong><span>Total spent</span></div></div><div className="analytics-legend">{segments.map(item => <div className="analytics-legend-item" key={item.category}><i style={{ background: item.color }} /><span>{item.category}</span><strong>{item.percent.toFixed(0)}%</strong></div>)}</div></div>
}
