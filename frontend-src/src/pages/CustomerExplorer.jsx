import React, { useState, useEffect, useCallback } from 'react'
import SectionHeader from '../components/SectionHeader'

/* ─── Helpers ── */
function pct(n)   { return n != null ? `${Number(n).toFixed(1)}%`  : '—' }
function money(n) { return n != null ? `$${Math.round(n).toLocaleString()}` : '—' }
function num(n)   { return n != null ? n.toLocaleString() : '—' }

function Tag({ label, type = 'neutral' }) {
  return <span className={`tag tag--${type}`}>{label}</span>
}

function churnTag(risk) {
  if (risk === 'High')   return <Tag label="High churn" type="red" />
  if (risk === 'Medium') return <Tag label="Med churn"  type="amber" />
  return                        <Tag label="Low churn"  type="green" />
}

function respTag(tier) {
  if (tier === 'High')   return <Tag label="High response" type="accent" />
  if (tier === 'Medium') return <Tag label="Med response"  type="neutral" />
  return                        <Tag label="Low response"  type="neutral" />
}

/* ─── Customer Row ── */
function CustomerRow({ c, onClick }) {
  return (
    <tr
      onClick={() => onClick(c)}
      style={{ cursor: 'pointer', borderBottom: '1px solid var(--border)' }}
    >
      <td style={td}><strong style={{ fontFamily: 'var(--font-display)', letterSpacing: '-0.01em' }}>#{c.id}</strong></td>
      <td style={td}>{c.segment_name ?? '—'}</td>
      <td style={td}>{churnTag(c.churn_risk)}</td>
      <td style={td}>{respTag(c.response_tier)}</td>
      <td style={td}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ flex: 1, height: 4, background: 'var(--surface)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${Math.round((c.response_prob ?? 0) * 100)}%`, background: 'var(--accent)', borderRadius: 2 }} />
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-mid)', minWidth: 32 }}>
            {pct((c.response_prob ?? 0) * 100)}
          </span>
        </div>
      </td>
      <td style={td}>{money(c.predicted_ltv)}</td>
      <td style={td}>{c.best_channel ?? '—'}</td>
    </tr>
  )
}

const td = { padding: '0.75rem 1rem', fontSize: '0.83rem', color: 'var(--text-mid)', verticalAlign: 'middle' }

/* ─── Customer Modal ── */
function CustomerModal({ customer, onClose }) {
  if (!customer) return null

  const c = customer
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
        zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: 'var(--bg)', borderRadius: 'var(--radius-lg)',
          width: '100%', maxWidth: 680, maxHeight: '85vh', overflowY: 'auto',
          padding: '2.5rem',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
          <div>
            <div className="label" style={{ marginBottom: 6 }}>Customer Profile</div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--dark)' }}>
              #{c.id}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{ padding: '0.4rem 1rem', borderRadius: 'var(--radius-pill)', background: 'var(--surface)', color: 'var(--text-mid)', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', border: 'none' }}
          >
            Close
          </button>
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
          {c.segment_name && <Tag label={c.segment_name} type="neutral" />}
          {churnTag(c.churn_risk)}
          {respTag(c.response_tier)}
          {c.best_channel && <Tag label={`Channel: ${c.best_channel}`} type="accent" />}
        </div>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '2rem' }}>
          {[
            ['Response Prob', pct((c.response_prob ?? 0) * 100)],
            ['Predicted LTV', money(c.predicted_ltv)],
            ['Income', money(c.Income)],
            ['Total Spend', money(c.TotalSpend)],
            ['Age', c.Age ?? '—'],
            ['Recency', `${c.Recency ?? '—'} days`],
          ].map(([label, value]) => (
            <div key={label} style={{ background: 'var(--bg-warm)', borderRadius: 'var(--radius-sm)', padding: '0.75rem 1rem' }}>
              <div style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>{label}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, letterSpacing: '-0.015em', color: 'var(--dark)' }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Spend Breakdown */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem' }}>
          <div className="label" style={{ marginBottom: '1rem' }}>Spending by Category (Last 2 Years)</div>
          {[
            ['Wines',   c.MntWines],
            ['Meat',    c.MntMeatProducts],
            ['Fish',    c.MntFishProducts],
            ['Fruits',  c.MntFruits],
            ['Sweets',  c.MntSweetProducts],
            ['Gold',    c.MntGoldProds],
          ].filter(([, v]) => v != null).map(([cat, val]) => {
            const maxSpend = 1000
            const w = Math.min(100, Math.round((val / maxSpend) * 100))
            return (
              <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.6rem' }}>
                <div style={{ width: 60, fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-mid)', textAlign: 'right' }}>{cat}</div>
                <div style={{ flex: 1, height: 6, background: 'var(--surface)', borderRadius: 3, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${w}%`, background: 'var(--accent)', borderRadius: 3 }} />
                </div>
                <div style={{ width: 52, fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-mid)' }}>{money(val)}</div>
              </div>
            )
          })}
        </div>

        {/* Campaign History */}
        <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: '1rem' }}>
          <div className="label" style={{ marginBottom: '0.75rem' }}>Campaign History</div>
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {[1,2,3,4,5].map(n => {
              const key   = `AcceptedCmp${n}`
              const accepted = c[key]
              return (
                <div key={n} style={{
                  padding: '0.3rem 0.75rem', borderRadius: 'var(--radius-pill)',
                  fontSize: '0.75rem', fontWeight: 600,
                  background: accepted ? 'rgba(59,168,120,0.12)' : 'var(--surface)',
                  color: accepted ? 'var(--green)' : 'var(--text-muted)',
                }}>
                  Cmp{n}: {accepted ? 'Accepted' : 'Declined'}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Main Explorer Page ── */
export default function CustomerExplorer() {
  const [customers, setCustomers]   = useState([])
  const [total, setTotal]           = useState(0)
  const [page, setPage]             = useState(1)
  const [loading, setLoading]       = useState(true)
  const [selected, setSelected]     = useState(null)

  // Filters
  const [search, setSearch]         = useState('')
  const [segment, setSegment]       = useState('')
  const [churnFilter, setChurnFilter] = useState('')
  const [respFilter, setRespFilter] = useState('')
  const [sortBy, setSortBy]         = useState('response_prob')
  const [sortDir, setSortDir]       = useState('desc')

  const PER_PAGE = 50

  const fetchCustomers = useCallback(() => {
    setLoading(true)
    const params = new URLSearchParams({
      page, per_page: PER_PAGE,
      sort_by: sortBy, sort_dir: sortDir,
    })
    if (search)      params.set('search',        search)
    if (segment)     params.set('segment',       segment)
    if (churnFilter) params.set('churn_risk',    churnFilter)
    if (respFilter)  params.set('response_tier', respFilter)

    fetch(`/api/customers?${params}`)
      .then(r => r.json())
      .then(d => {
        setCustomers(d.customers ?? [])
        setTotal(d.total ?? 0)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [page, search, segment, churnFilter, respFilter, sortBy, sortDir])

  useEffect(() => { fetchCustomers() }, [fetchCustomers])

  const totalPages = Math.ceil(total / PER_PAGE)

  return (
    <>
      {selected && <CustomerModal customer={selected} onClose={() => setSelected(null)} />}

      <section className="hero" style={{ paddingBottom: '3rem' }}>
        <div className="container">
          <div className="hero__eyebrow">
            <span className="hero__eyebrow-dot" />
            Customer Explorer
          </div>
          <h1 className="hero__title" style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}>
            All <em>{num(total)}</em> customers.
          </h1>
          <p className="hero__sub" style={{ marginBottom: 0 }}>
            Browse, filter, and dive into any customer's full ML-generated profile.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: '3rem' }}>
        <div className="container">
          {/* Filter Bar */}
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '2rem', alignItems: 'center' }}>
            <input
              type="text" placeholder="Search customer ID…"
              value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
              style={inputStyle}
            />
            <select value={segment} onChange={e => { setSegment(e.target.value); setPage(1) }} style={inputStyle}>
              <option value="">All Segments</option>
              <option value="High-Value Inactives">High-Value Inactives</option>
              <option value="Loyal Families">Loyal Families</option>
              <option value="Champions">Champions</option>
              <option value="At-Risk">At-Risk</option>
              <option value="Budget Shoppers">Budget Shoppers</option>
              <option value="Digital Natives">Digital Natives</option>
            </select>
            <select value={churnFilter} onChange={e => { setChurnFilter(e.target.value); setPage(1) }} style={inputStyle}>
              <option value="">All Churn Risk</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <select value={respFilter} onChange={e => { setRespFilter(e.target.value); setPage(1) }} style={inputStyle}>
              <option value="">All Response</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
            <select value={`${sortBy}:${sortDir}`} onChange={e => {
              const [b, d] = e.target.value.split(':')
              setSortBy(b); setSortDir(d); setPage(1)
            }} style={inputStyle}>
              <option value="response_prob:desc">Sort: Response ↓</option>
              <option value="predicted_ltv:desc">Sort: LTV ↓</option>
              <option value="response_prob:asc">Sort: Response ↑</option>
            </select>
          </div>

          {/* Table */}
          <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', overflow: 'hidden', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)', background: 'var(--bg-warm)' }}>
                  {['ID', 'Segment', 'Churn', 'Response', 'Probability', 'LTV', 'Channel'].map(h => (
                    <th key={h} style={{ ...td, fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', textAlign: 'left' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={7} style={{ padding: '3rem', textAlign: 'center' }}><div className="loading__spinner" style={{ margin: '0 auto' }} /></td></tr>
                ) : customers.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No customers match your filters.</td></tr>
                ) : customers.map(c => (
                  <CustomerRow key={c.id} c={c} onClick={setSelected} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '1.5rem' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Page {page} of {totalPages} · {total.toLocaleString()} customers
              </span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                  style={{ ...btnStyle, opacity: page <= 1 ? 0.4 : 1 }}
                >
                  ← Prev
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage(p => p + 1)}
                  style={{ ...btnStyle, opacity: page >= totalPages ? 0.4 : 1 }}
                >
                  Next →
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

const inputStyle = {
  padding: '0.55rem 0.9rem',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--border)',
  background: 'white',
  fontSize: '0.82rem',
  color: 'var(--text)',
  fontFamily: 'var(--font-body)',
  outline: 'none',
}

const btnStyle = {
  padding: '0.5rem 1.25rem',
  borderRadius: 'var(--radius-pill)',
  border: '1px solid var(--border)',
  background: 'var(--dark)',
  color: 'white',
  fontSize: '0.8rem',
  fontWeight: 600,
  fontFamily: 'var(--font-body)',
  cursor: 'pointer',
}
