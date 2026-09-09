import { Link } from 'react-router-dom'
import GradientWaves from './GradientWaves'

export default function SparklesPreview() {
  return <section className="sparkles-preview">
    <GradientWaves horizonColor="#541637" waveColor="#d94f91" crestColor="#fff2fa" speed={0.45} amplitude={2.9} waveScale={0.72} swell={1.5} turbulence={1.4} brightness={1.05} />
    <div className="sparkles-content"><span className="eyebrow">A calmer place for your money</span><h2>Ledgerly</h2><p>Start with clarity. Build from there.</p><Link className="sparkles-start" to="/login">Start now <span aria-hidden="true">↗</span></Link></div>
  </section>
}
