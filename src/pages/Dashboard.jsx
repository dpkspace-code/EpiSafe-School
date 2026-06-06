import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

function Dashboard({ setPage }) {
  const [learnerCount, setLearnerCount] = useState(0)
  const [screeningCount, setScreeningCount] = useState(0)
  const [highRiskCount, setHighRiskCount] = useState(0)

  useEffect(() => {
    async function fetchStats() {
      const { count: lCount } = await supabase
        .from('learners')
        .select('*', { count: 'exact', head: true })

      const { count: sCount } = await supabase
        .from('screener_responses')
        .select('*', { count: 'exact', head: true })

      const { count: hCount } = await supabase
        .from('screener_responses')
        .select('*', { count: 'exact', head: true })
        .eq('risk_level', 'High')

      setLearnerCount(lCount || 0)
      setScreeningCount(sCount || 0)
      setHighRiskCount(hCount || 0)
    }
    fetchStats()
  }, [])

  return (
    <div>
      <h1>🧠 EpiSafe School</h1>
      <p style={{ marginBottom: '24px' }}>Epilepsy management dashboard</p>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{learnerCount}</div>
          <div className="stat-label">Learners in Registry</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{screeningCount}</div>
          <div className="stat-label">Screenings Done</div>
        </div>
        <div className="stat-card">
          <div className="stat-number" style={{ color: '#ff4d4f' }}>{highRiskCount}</div>
          <div className="stat-label">High Risk Flagged</div>
        </div>
      </div>

      <div className="card">
        <h2>Quick Actions</h2>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => setPage('screener')}>📋 New Screening</button>
          <button className="btn btn-primary" onClick={() => setPage('registry')}>➕ Add Learner</button>
          <button className="btn btn-secondary" onClick={() => setPage('guides')}>📖 View Guides</button>
        </div>
      </div>

      <div className="card">
        <h2>About EpiSafe</h2>
        <p style={{ lineHeight: '1.7' }}>
          EpiSafe helps schools identify learners at risk of seizures, maintain a secure epilepsy registry, 
          and equip staff with the knowledge to respond effectively. Use the screener to flag learners 
          for medical follow-up, and the registry to track confirmed cases and their action plans.
        </p>
      </div>
    </div>
  )
}

export default Dashboard