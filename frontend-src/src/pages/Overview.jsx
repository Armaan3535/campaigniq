import React, { useEffect, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'

import KpiCard from '../components/KpiCard'
import SectionHeader from '../components/SectionHeader'

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend)

/* shared chart font */
ChartJS.defaults.font.family = 'DM Sans, system-ui, sans-serif'
ChartJS.defaults.color = '#7A7A7A'

const PALETTE = ['#4A6CF7', '#3BA878', '#E0963A', '#D05454', '#9B59B6', '#20B2AA']
const BORDER_COLOR = 'rgba(0,0,0,0.06)'

/* ─── Generic API hook ───────────────────────────────── */
function useApi(url) {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  useEffect(() => {
    fetch(url)
      .then(r => { if (!r.ok) throw new Error(r.statusText); return r.json() })
      .then(d => { setData(d); setLoading(false) })
      .catch(e => { setError(e.message); setLoading(false) })
  }, [url])
  return { data, loading, error }
}

/* ─── Helpers ────────────────────────────────────────── */
function pct(n)   { return n != null ? `${(n).toFixed(1)}%` : '—' }
function money(n) { return n != null ? `$${Math.round(n).toLocaleString()}` : '—' }
function num(n)   { return n != null ? n.toLocaleString() : '—' }

function Spinner() {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
      <div className="loading__spinner" />
    </div>
  )
}

function ChartCard({ label, title, children }) {
  return (
    <div className="chart-card">
      <div className="chart-card__label">{label}</div>
      <div className="chart-card__title">{title}</div>
      <div className="chart-card__canvas">{children}</div>
    </div>
  )
}

/* ─── Response Distribution ──────────────────────────── */
function ResponseDistChart({ raw }) {
  if (!raw?.value) return <Spinner />
  const items  = raw.value
  const labels = items.map(i => i.range)
  const counts = items.map(i => i.count)

  return (
    <Bar
      data={{
        labels,
        datasets: [{
          label: 'Customers',
          data: counts,
          backgroundColor: '#4A6CF7',
          borderRadius: 3,
          borderSkipped: false,
        }],
      }}
      options={{
        responsive: true,
        aspectRatio: 1.7,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` ${c.raw} customers` } } },
        scales: {
          x: { grid: { color: BORDER_COLOR }, ticks: { font: { size: 10 }, maxRotation: 45 } },
          y: { grid: { color: BORDER_COLOR }, ticks: { font: { size: 11 } }, beginAtZero: true },
        },
      }}
    />
  )
}

/* ─── Customer Segments Doughnut ─────────────────────── */
function SegmentsChart({ raw }) {
  if (!raw?.value) return <Spinner />
  const segs   = raw.value
  const labels = segs.map(s => s.name)
  const counts = segs.map(s => s.count)

  return (
    <Doughnut
      data={{
        labels,
        datasets: [{
          data: counts,
          backgroundColor: PALETTE,
          borderWidth: 2,
          borderColor: '#F5F4F0',
          hoverOffset: 6,
        }],
      }}
      options={{
        responsive: true,
        aspectRatio: 1.5,
        cutout: '68%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { boxWidth: 10, boxHeight: 10, padding: 12, font: { size: 11 } },
          },
          tooltip: { callbacks: { label: c => ` ${c.label}: ${c.raw} customers` } },
        },
      }}
    />
  )
}

/* ─── Product Affinity ───────────────────────────────── */
function ProductAffinityChart({ raw }) {
  if (!raw?.value) return <Spinner />
  const items  = raw.value
  const labels = items.map(p => p.product)
  const counts = items.map(p => p.count)

  return (
    <Bar
      data={{
        labels,
        datasets: [{
          label: 'High Affinity',
          data: counts,
          backgroundColor: PALETTE,
          borderRadius: 4,
          borderSkipped: false,
        }],
      }}
      options={{
        responsive: true,
        aspectRatio: 2.2,
        indexAxis: 'y',
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` ${c.raw} customers` } } },
        scales: {
          x: { grid: { color: BORDER_COLOR }, ticks: { font: { size: 11 } }, beginAtZero: true },
          y: { grid: { display: false }, ticks: { font: { size: 12, weight: '500' } } },
        },
      }}
    />
  )
}

/* ─── Segment Matrix ─────────────────────────────────── */
function SegmentMatrixChart({ raw }) {
  if (!raw?.value) return <Spinner />
  const segs   = raw.value
  const labels = segs.map(s => s.name)

  return (
    <Bar
      data={{
        labels,
        datasets: [
          {
            label: 'Avg LTV ($)',
            data: segs.map(s => Math.round(s.avg_ltv ?? 0)),
            backgroundColor: '#4A6CF7',
            borderRadius: 3,
          },
          {
            label: 'Response Rate %',
            data: segs.map(s => Math.round((s.avg_response ?? 0) * 100)),
            backgroundColor: '#3BA878',
            borderRadius: 3,
          },
          {
            label: 'Churn Rate %',
            data: segs.map(s => Math.round((s.avg_churn ?? 0) * 100)),
            backgroundColor: '#E0963A',
            borderRadius: 3,
          },
        ],
      }}
      options={{
        responsive: true,
        aspectRatio: 2.8,
        plugins: {
          legend: {
            position: 'top',
            labels: { boxWidth: 10, boxHeight: 10, padding: 16, font: { size: 11 } },
          },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 } } },
          y: { grid: { color: BORDER_COLOR }, ticks: { font: { size: 11 } }, beginAtZero: true },
        },
      }}
    />
  )
}

/* ─── Segment Cards ──────────────────────────────────── */
function StatBox({ label, value }) {
  return (
    <div style={{ background: 'var(--bg-warm)', borderRadius: 'var(--radius-sm)', padding: '0.6rem 0.75rem' }}>
      <div style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.2rem' }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.95rem', fontWeight: 700, letterSpacing: '-0.01em', color: 'var(--dark)' }}>{value}</div>
    </div>
  )
}

function SegmentCard({ seg, idx }) {
  const color     = PALETTE[idx % PALETTE.length]
  const churnRate = seg.avg_churn ?? 0
  const respRate  = seg.avg_response ?? 0

  const churnTagCls = churnRate > 0.3 ? 'tag--red' : churnRate > 0.15 ? 'tag--amber' : 'tag--green'
  const churnLabel  = churnRate > 0.3 ? 'High churn' : churnRate > 0.15 ? 'Med churn' : 'Low churn'
  const respTagCls  = respRate > 0.2  ? 'tag--accent' : 'tag--neutral'
  const respLabel   = respRate > 0.2  ? 'High response' : 'Low response'

  return (
    <div className="chart-card" style={{ borderTop: `3px solid ${color}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div>
          <div className="chart-card__label" style={{ marginBottom: '0.25rem' }}>Segment</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.01em', color: 'var(--dark)' }}>
            {seg.name}
          </div>
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--dark)' }}>
          {num(seg.count)}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <span className={`tag ${churnTagCls}`}>{churnLabel}</span>
        <span className={`tag ${respTagCls}`}>{respLabel}</span>
        {seg.top_channel && <span className="tag tag--neutral">{seg.top_channel}</span>}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        <StatBox label="Avg LTV"     value={money(seg.avg_ltv)} />
        <StatBox label="Top Product" value={seg.top_product ?? '—'} />
        <StatBox label="Churn Rate"  value={`${(churnRate * 100).toFixed(1)}%`} />
        <StatBox label="Response"    value={`${(respRate  * 100).toFixed(1)}%`} />
      </div>
    </div>
  )
}

/* ─── Main Overview Page ─────────────────────────────── */
export default function Overview() {
  const { data: ovData,   loading: ovLoad,   error: ovErr } = useApi('/api/overview')
  const { data: segData,  loading: segLoad  }               = useApi('/api/segments')
  const { data: prodData, loading: prodLoad }               = useApi('/api/top-products')
  const { data: respData, loading: respLoad }               = useApi('/api/response-dist')

  const ov = ovData ?? {}

  return (
    <>
      {/* ── Hero ─────────────────────────────────────── */}
      <section className="hero">
        <div className="container">
          <div className="hero__eyebrow">
            <span className="hero__eyebrow-dot" />
            Customer Intelligence Platform
          </div>
          <h1 className="hero__title">
            Know your<br />
            <em>customers.</em>
          </h1>
          <p className="hero__sub">
            Six machine-learning models scoring 2,237 customers for campaign
            response, churn risk, lifetime value, product affinity, and
            optimal channel.
          </p>
          <div className="hero__meta">
            <div className="hero__stat">
              <span className="hero__stat-num">
                {ovLoad ? '…' : num(ov.total_customers)}
              </span>
              <span className="hero__stat-label">Customers</span>
            </div>
            <div className="hero__divider" />
            <div className="hero__stat">
              <span className="hero__stat-num">6</span>
              <span className="hero__stat-label">ML Models</span>
            </div>
            <div className="hero__divider" />
            <div className="hero__stat">
              <span className="hero__stat-num">
                {ovLoad ? '…' : pct(ov.response_rate_pct)}
              </span>
              <span className="hero__stat-label">Response Rate</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── KPI Strip ────────────────────────────────── */}
      <section className="kpi-strip">
        <div className="container">
          {ovErr && (
            <div className="error-box" style={{ color: 'var(--red)', marginBottom: '2rem' }}>
              Cannot reach backend — run <code>python backend/app.py</code>
            </div>
          )}
          <div className="kpi-strip__grid">
            <KpiCard
              label="Total Customers"
              value={ovLoad ? '…' : num(ov.total_customers)}
              sub="In the dataset"
              accentColor="var(--accent)"
            />
            <KpiCard
              label="Predicted Responders"
              value={ovLoad ? '…' : num(ov.predicted_responders)}
              sub="Will accept next campaign"
              accentColor="var(--green)"
            />
            <KpiCard
              label="High Churn Risk"
              value={ovLoad ? '…' : num(ov.high_churn_risk)}
              sub="Need re-engagement"
              accentColor="var(--amber)"
            />
            <KpiCard
              label="Avg. Predicted LTV"
              value={ovLoad ? '…' : money(ov.avg_ltv)}
              sub="2-year spend forecast"
              accentColor="var(--red)"
            />
          </div>
        </div>
      </section>

      {/* ── Intelligence Charts ───────────────────────── */}
      <section className="section">
        <div className="container">
          <SectionHeader label="Intelligence" title="Response & Segments" />
          <div className="charts-2col">
            <ChartCard label="Model" title="Campaign Response Probability">
              {respLoad ? <Spinner /> : <ResponseDistChart raw={respData} />}
            </ChartCard>
            <ChartCard label="Clustering" title="Customer Segments">
              {segLoad ? <Spinner /> : <SegmentsChart raw={segData} />}
            </ChartCard>
          </div>
        </div>
      </section>

      {/* ── Segment Matrix ───────────────────────────── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <SectionHeader label="Segments" title="Intelligence Matrix" />
          <ChartCard label="Multi-metric comparison" title="Avg LTV · Response Rate · Churn Rate by Segment">
            {segLoad ? <Spinner /> : <SegmentMatrixChart raw={segData} />}
          </ChartCard>
        </div>
      </section>

      {/* ── Product Affinity ─────────────────────────── */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <SectionHeader label="Products" title="Category Affinity" />
          <ChartCard label="Affinity model" title="Customers with High Predicted Affinity per Category">
            {prodLoad ? <Spinner /> : <ProductAffinityChart raw={prodData} />}
          </ChartCard>
        </div>
      </section>

      {/* ── Segment Cards ─────────────────────────────── */}
      {segData?.value && (
        <section className="section" style={{ paddingTop: 0, paddingBottom: '6rem' }}>
          <div className="container">
            <SectionHeader label="Profiles" title="Segment Breakdown" />
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '1rem',
              }}
            >
              {segData.value.map((seg, i) => (
                <SegmentCard key={seg.id !== undefined ? seg.id : i} seg={seg} idx={i} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
