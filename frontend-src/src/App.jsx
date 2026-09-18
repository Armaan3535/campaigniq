import React, { useState } from 'react'
import './index.css'

import Overview        from './pages/Overview'
import CustomerExplorer from './pages/CustomerExplorer'
import PredictNew      from './pages/PredictNew'
import ModelInsights   from './pages/ModelInsights'

/* ─── Nav items ── */
const NAV = [
  { id: 'overview',   label: 'Overview' },
  { id: 'explorer',   label: 'Customers' },
  { id: 'predict',    label: 'Predict' },
  { id: 'insights',   label: 'Model Insights' },
]

/* ─── Navbar ── */
function Navbar({ active, onNav }) {
  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar__inner">
          {/* Logo */}
          <button
            onClick={() => onNav('overview')}
            className="navbar__logo"
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <span />
            CampaignIQ
          </button>

          {/* Nav links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            {NAV.map(item => (
              <button
                key={item.id}
                onClick={() => onNav(item.id)}
                style={{
                  background:    'none',
                  border:        'none',
                  cursor:        'pointer',
                  fontFamily:    'var(--font-body)',
                  fontSize:      '0.8rem',
                  fontWeight:    active === item.id ? 700 : 500,
                  color:         active === item.id ? 'var(--text-inv)' : 'var(--text-inv-mid)',
                  padding:       '0.35rem 0.85rem',
                  borderRadius:  'var(--radius-pill)',
                  background:    active === item.id ? 'rgba(255,255,255,0.10)' : 'transparent',
                  letterSpacing: '-0.005em',
                  transition:    'all 0.15s ease',
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Status */}
          <div className="navbar__status">
            <div className="navbar__dot" />
            6 models active
          </div>
        </div>
      </div>
    </nav>
  )
}

/* ─── Footer ── */
function Footer({ page }) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__inner">
          <span className="footer__logo">CampaignIQ</span>
          <div className="footer__models">
            <div className="navbar__dot" />
            6 ML models · 2,237 customers scored
          </div>
          <span className="footer__copy">Customer Intelligence Dashboard</span>
        </div>
      </div>
    </footer>
  )
}

/* ─── App Shell ── */
export default function App() {
  const [page, setPage] = useState('overview')

  function renderPage() {
    switch (page) {
      case 'overview':  return <Overview />
      case 'explorer':  return <CustomerExplorer />
      case 'predict':   return <PredictNew />
      case 'insights':  return <ModelInsights />
      default:          return <Overview />
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar active={page} onNav={setPage} />
      <main style={{ flex: 1 }}>
        {renderPage()}
      </main>
      <Footer page={page} />
    </div>
  )
}
