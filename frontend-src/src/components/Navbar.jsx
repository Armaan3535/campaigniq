import React from 'react'

export default function Navbar({ modelsOnline = true }) {
  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar__inner">
          <div className="navbar__logo">
            <span />
            CampaignIQ
          </div>
          <div className="navbar__status">
            <div className="navbar__dot" style={{ background: modelsOnline ? 'var(--green)' : 'var(--red)' }} />
            {modelsOnline ? '6 ML models active' : 'Backend offline'}
          </div>
        </div>
      </div>
    </nav>
  )
}
