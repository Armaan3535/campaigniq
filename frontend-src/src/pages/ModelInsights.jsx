import React, { useEffect, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import SectionHeader from '../components/SectionHeader'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)
ChartJS.defaults.font.family = 'DM Sans, system-ui, sans-serif'
ChartJS.defaults.color = '#7A7A7A'

const BORDER = 'rgba(0,0,0,0.06)'

function useInsights() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  useEffect(() => {
    fetch('/api/model-insights')
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [])
  return { data, loading, error }
}

function Spinner() {
  return <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><div className="loading__spinner" /></div>
}

function MetricBadge({ label, value, color = 'var(--accent)' }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '1.25rem', background: 'var(--bg-warm)', borderRadius: 'var(--radius-md)',
      minWidth: 110, border: `1px solid ${color}20`,
    }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--dark)' }}>{value}</div>
      <div style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: '0.3rem', textAlign: 'center' }}>{label}</div>
    </div>
  )
}

function ImportanceChart({ features, title, label }) {
  if (!features || features.length === 0) return <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No data available.</p>

  const top = features.slice(0, 15)
  const maxVal = Math.max(...top.map(f => f.importance ?? f.value ?? 0))

  return (
    <Bar
      data={{
        labels: top.map(f => f.feature ?? f.name ?? ''),
        datasets: [{
          label: label ?? 'Importance',
          data: top.map(f => f.importance ?? f.value ?? 0),
          backgroundColor: '#4A6CF7',
          borderRadius: 3,
          borderSkipped: false,
        }],
      }}
      options={{
        responsive: true,
        indexAxis: 'y',
        aspectRatio: 1.4,
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

/* Renders one model card */
function ModelCard({ model }) {
  const m = model
  const metrics = m.metrics ?? {}
  const featureKey = Object.keys(m).find(k => Array.isArray(m[k]) && m[k][0]?.feature)

  return (
    <div className="chart-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
        <div>
          <div className="chart-card__label">{m.type ?? 'Model'}</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--dark)' }}>
            {m.name ?? m.model_name ?? 'ML Model'}
          </div>
        </div>
        {m.algorithm && (
          <span className="tag tag--accent">{m.algorithm}</span>
        )}
      </div>

      {/* Metrics */}
      {Object.keys(metrics).length > 0 && (
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {Object.entries(metrics).map(([k, v]) => (
            <MetricBadge key={k} label={k.replace(/_/g, ' ')} value={typeof v === 'number' ? (v > 1 ? v.toFixed(1) : v.toFixed(3)) : v} />
          ))}
        </div>
      )}

      {/* Feature importance */}
      {featureKey && (
        <>
          <div className="chart-card__label" style={{ marginBottom: '0.75rem' }}>Feature Importance</div>
          <ImportanceChart features={m[featureKey]} label="Importance" />
        </>
      )}
    </div>
  )
}

export default function ModelInsights() {
  const { data, loading, error } = useInsights()

  // data may be { models: [...] } or { value: [...] } or flat object with model keys
  let models = []
  if (data) {
    if (Array.isArray(data.models))      models = data.models
    else if (Array.isArray(data.value))  models = data.value
    else if (Array.isArray(data))        models = data
    else {
      // Flat structure — wrap each key that has feature data
      models = Object.entries(data)
        .filter(([, v]) => typeof v === 'object' && v !== null && !Array.isArray(v))
        .map(([k, v]) => ({ name: k, ...v }))
    }
  }

  return (
    <>
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
            Feature importances, accuracy metrics, and evaluation summaries
            for each of the 6 ML models powering CampaignIQ.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: '3rem' }}>
        <div className="container">
          {error && <div className="error-box">{error}</div>}
          {loading && <Spinner />}

          {!loading && !error && models.length === 0 && (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '4rem' }}>
              No model insights available — did the models train successfully?
            </div>
          )}

          {!loading && models.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {models.map((m, i) => <ModelCard key={i} model={m} />)}
            </div>
          )}

          {/* Even if model structure isn't clean, show raw feature importance from the endpoint */}
          {!loading && !error && data && models.length === 0 && (
            <RawInsights data={data} />
          )}
        </div>
      </section>
    </>
  )
}

/* Fallback — render whatever the endpoint gives us */
function RawInsights({ data }) {
  const features = data?.features ?? data?.feature_importance ?? data?.top_features ?? []
  if (!features.length) return null

  return (
    <div className="chart-card">
      <div className="chart-card__label">Response Model</div>
      <div className="chart-card__title">Feature Importance</div>
      <ImportanceChart features={features} />
    </div>
  )
}
