import React from 'react'

/**
 * Single KPI card used in the dark strip.
 * Props: label, value, sub, accentColor
 */
export default function KpiCard({ label, value, sub, accentColor = 'var(--accent)' }) {
  return (
    <div className="kpi-card">
      <div
        className="kpi-card__accent"
        style={{ background: accentColor }}
      />
      <div className="kpi-card__label">{label}</div>
      <div className="kpi-card__value">{value}</div>
      {sub && <div className="kpi-card__sub">{sub}</div>}
    </div>
  )
}
