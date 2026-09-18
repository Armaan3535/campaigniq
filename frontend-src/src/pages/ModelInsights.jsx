import React, { useEffect, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)
ChartJS.defaults.font.family = 'DM Sans, system-ui, sans-serif'
ChartJS.defaults.color = '#7A7A7A'

const BORDER = 'rgba(0,0,0,0.06)'
const ACCENT  = '#4A6CF7'
const GREEN   = '#3BA878'
const AMBER   = '#E0963A'
const RED     = '#D05454'
const PURPLE  = '#9B59B6'
const TEAL    = '#20B2AA'

/* ─── Fetch hook ── */
function useApi(url) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  useEffect(() => {
    fetch(url)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [url])
  return { data, loading, error }
}

function Spinner() {
  return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="loading__spinner" /></div>
}

/* ─── Horizontal bar chart for feature importance ── */
function ImportanceChart({ features, color = ACCENT }) {
  if (!features || features.length === 0) {
    return <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No data.</p>
  }

  const top = features.slice(0, 12)
  return (
    <Bar
      data={{
        labels: top.map(f => f.feature),
        datasets: [{
          label: 'Importance',
          data: top.map(f => f.importance),
          backgroundColor: color,
          borderRadius: 4,
          borderSkipped: false,
        }],
      }}
      options={{
        responsive: true,
        indexAxis: 'y',
        aspectRatio: 1.5,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: c => ` ${Number(c.raw).toFixed(4)}` } },
        },
        scales: {
          x: { grid: { color: BORDER }, ticks: { font: { size: 10 } }, beginAtZero: true },
          y: { grid: { display: false }, ticks: { font: { size: 11 } } },
        },
      }}
    />
  )
}

/* ─── Single metric stat box ── */
function StatBox({ label, value }) {
  return (
    <div style={{
      background: 'var(--bg-warm)', borderRadius: 'var(--radius-md)',
      padding: '1.25rem 1.5rem', textAlign: 'center',
    }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 700, letterSpacing: '-0.03em', color: 'var(--dark)', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: '0.4rem' }}>{label}</div>
    </div>
  )
}

/* ─── Individual model insight card ── */
function ModelCard({ title, type, description, features, color, metrics }) {
  return (
    <div className="chart-card" style={{ borderTop: `3px solid ${color}` }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div className="chart-card__label">{type}</div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--dark)', marginTop: '0.25rem' }}>
          {title}
        </div>
        {description && (
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.4rem', lineHeight: 1.5 }}>{description}</p>
        )}
      </div>

      {/* Inline metrics */}
      {metrics && (
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {Object.entries(metrics).map(([k, v]) => (
            <div key={k} style={{
              background: `${color}15`, borderRadius: 'var(--radius-sm)',
              padding: '0.5rem 0.9rem', border: `1px solid ${color}25`,
            }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>
                {k.replace(/_/g, ' ')}
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', color: 'var(--dark)' }}>
                {typeof v === 'number' ? (v > 1 ? v.toLocaleString() : v.toFixed(3)) : String(v)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Feature importance */}
      <div className="chart-card__label" style={{ marginBottom: '0.75rem' }}>Feature Importance (Top 12)</div>
      <ImportanceChart features={features} color={color} />
    </div>
  )
}

/* ─── Main page ── */
export default function ModelInsights() {
  const { data, loading, error } = useApi('/api/model-insights')

  const fi      = data?.feature_importances ?? {}
  const metrics = data?.metrics ?? {}

  const MODELS = [
    {
      key:         'response',
      title:       'Campaign Response Classifier',
      type:        'Classification',
      description: 'Predicts whether a customer will accept the next marketing campaign offer.',
      color:       ACCENT,
    },
    {
      key:         'churn',
      title:       'Churn Risk Classifier',
      type:        'Classification',
      description: 'Identifies customers likely to disengage based on recency and engagement patterns.',
      color:       RED,
    },
    {
      key:         'ltv',
      title:       'Lifetime Value Regressor',
      type:        'Regression',
      description: 'Forecasts 2-year customer spend from demographics and purchase history.',
      color:       GREEN,
    },
  ]

  return (
    <>
      {/* ── Hero ── */}
      <section className="hero" style={{ paddingBottom: '3rem' }}>
        <div className="container">
          <div className="hero__eyebrow">
            <span className="hero__eyebrow-dot" />
            Model Insights
          </div>
          <h1 className="hero__title" style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}>
            Inside the <em>models.</em>
          </h1>
          <p className="hero__sub" style={{ marginBottom: 0 }}>
            Feature importances for 3 of the 6 ML models powering CampaignIQ —
            Campaign Response, Churn Risk, and Lifetime Value.
          </p>
        </div>
      </section>

      {/* ── Global Metrics ── */}
      <section className="kpi-strip">
        <div className="container">
          <div className="kpi-strip__grid">
            <div className="kpi-card">
              <div className="kpi-card__accent" style={{ background: ACCENT }} />
              <div className="kpi-card__label">Total Customers Scored</div>
              <div className="kpi-card__value">{metrics.total_customers?.toLocaleString() ?? '—'}</div>
              <div className="kpi-card__sub">Across all 6 models</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-card__accent" style={{ background: GREEN }} />
              <div className="kpi-card__label">Predicted Responders</div>
              <div className="kpi-card__value">{metrics.predicted_responders?.toLocaleString() ?? '—'}</div>
              <div className="kpi-card__sub">Will accept next campaign</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-card__accent" style={{ background: AMBER }} />
              <div className="kpi-card__label">High Churn Customers</div>
              <div className="kpi-card__value">{metrics.high_churn_customers?.toLocaleString() ?? '—'}</div>
              <div className="kpi-card__sub">Need re-engagement</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-card__accent" style={{ background: RED }} />
              <div className="kpi-card__label">Avg. Predicted LTV</div>
              <div className="kpi-card__value">
                {metrics.avg_predicted_ltv != null ? `$${Math.round(metrics.avg_predicted_ltv).toLocaleString()}` : '—'}
              </div>
              <div className="kpi-card__sub">2-year spend forecast</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Model Feature Importance Charts ── */}
      <section className="section">
        <div className="container">
          {error && <div className="error-box" style={{ marginBottom: '2rem' }}>{error}</div>}
          {loading && <Spinner />}

          {!loading && !error && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {MODELS.map(m => {
                const features = fi[m.key] ?? []
                return (
                  <ModelCard
                    key={m.key}
                    title={m.title}
                    type={m.type}
                    description={m.description}
                    color={m.color}
                    features={features}
                  />
                )
              })}

              {/* Models without feature importance data */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                {[
                  { title: 'Product Affinity', type: 'Multi-output Classification', desc: 'Predicts high-affinity categories (Wines, Meat, Fish, Fruits, Sweets, Gold) per customer.', color: AMBER },
                  { title: 'Customer Segmentation', type: 'Clustering (K-Means + PCA)', desc: 'Groups customers into actionable personas using PCA dimensionality reduction and K-Means clustering.', color: PURPLE },
                  { title: 'Channel Propensity', type: 'Multi-class Classification', desc: 'Recommends optimal conversion channel — Store, Web, or Catalog — for each customer.', color: TEAL },
                ].map(m => (
                  <div key={m.title} className="chart-card" style={{ borderTop: `3px solid ${m.color}` }}>
                    <div className="chart-card__label">{m.type}</div>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.015em', color: 'var(--dark)', margin: '0.25rem 0 0.75rem' }}>
                      {m.title}
                    </div>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>{m.desc}</p>
                    <div style={{ marginTop: '1rem', display: 'inline-block', padding: '0.3rem 0.8rem', borderRadius: 'var(--radius-pill)', background: `${m.color}15`, color: m.color, fontSize: '0.72rem', fontWeight: 600 }}>
                      No importance data from API
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
