import React, { useState } from 'react'
import SectionHeader from '../components/SectionHeader'

/* ─── Field config ── */
const FIELDS = [
  { key: 'Income',      label: 'Annual Income ($)', type: 'number', placeholder: '52000', min: 0,  max: 200000 },
  { key: 'Age',         label: 'Age',               type: 'number', placeholder: '45',    min: 18, max: 100 },
  { key: 'Recency',     label: 'Recency (days since last purchase)', type: 'number', placeholder: '30', min: 0, max: 200 },
  { key: 'Kidhome',     label: 'Kids at Home',      type: 'number', placeholder: '0',     min: 0,  max: 3 },
  { key: 'Teenhome',    label: 'Teens at Home',     type: 'number', placeholder: '0',     min: 0,  max: 3 },
  { key: 'NumWebVisitsMonth', label: 'Web Visits / Month', type: 'number', placeholder: '5', min: 0, max: 30 },
  { key: 'MntWines',    label: 'Spend: Wines ($)',  type: 'number', placeholder: '300',   min: 0,  max: 2000 },
  { key: 'MntMeatProducts', label: 'Spend: Meat ($)', type: 'number', placeholder: '150', min: 0, max: 2000 },
  { key: 'MntFishProducts', label: 'Spend: Fish ($)', type: 'number', placeholder: '40',  min: 0, max: 500 },
  { key: 'MntFruits',   label: 'Spend: Fruits ($)', type: 'number', placeholder: '20',   min: 0,  max: 500 },
  { key: 'MntSweetProducts', label: 'Spend: Sweets ($)', type: 'number', placeholder: '20', min: 0, max: 500 },
  { key: 'MntGoldProds', label: 'Spend: Gold ($)', type: 'number', placeholder: '50',    min: 0,  max: 500 },
  { key: 'Education',   label: 'Education Level',  type: 'select', options: ['Graduation', 'PhD', 'Master', '2n Cycle', 'Basic'] },
  { key: 'Marital_Status', label: 'Marital Status', type: 'select', options: ['Married', 'Single', 'Together', 'Divorced', 'Widow'] },
  { key: 'AcceptedCmp1', label: 'Accepted Campaign 1?', type: 'select', options: ['0', '1'] },
  { key: 'AcceptedCmp2', label: 'Accepted Campaign 2?', type: 'select', options: ['0', '1'] },
  { key: 'AcceptedCmp3', label: 'Accepted Campaign 3?', type: 'select', options: ['0', '1'] },
  { key: 'AcceptedCmp4', label: 'Accepted Campaign 4?', type: 'select', options: ['0', '1'] },
  { key: 'AcceptedCmp5', label: 'Accepted Campaign 5?', type: 'select', options: ['0', '1'] },
  { key: 'Complain',    label: 'Complained in Last 2 Yrs?', type: 'select', options: ['0', '1'] },
]

const DEFAULTS = {
  Income: 52000, Age: 45, Recency: 30, Kidhome: 0, Teenhome: 0,
  NumWebVisitsMonth: 5, MntWines: 300, MntMeatProducts: 150,
  MntFishProducts: 40, MntFruits: 20, MntSweetProducts: 20, MntGoldProds: 50,
  Education: 'Graduation', Marital_Status: 'Married',
  AcceptedCmp1: '0', AcceptedCmp2: '0', AcceptedCmp3: '0', AcceptedCmp4: '0', AcceptedCmp5: '0',
  Complain: '0',
}

function pct(n)   { return n != null ? `${(Number(n) * 100).toFixed(1)}%`  : '—' }
function money(n) { return n != null ? `$${Math.round(Number(n)).toLocaleString()}` : '—' }

function ResultCard({ label, value, sub, accentColor = 'var(--accent)' }) {
  return (
    <div className="chart-card" style={{ borderTop: `3px solid ${accentColor}` }}>
      <div className="chart-card__label">{label}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--dark)', margin: '0.25rem 0' }}>{value}</div>
      {sub && <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{sub}</div>}
    </div>
  )
}

export default function PredictNew() {
  const [form, setForm]       = useState(DEFAULTS)
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)

  function handleChange(key, value) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    // Convert numeric strings to numbers
    const payload = {}
    for (const [k, v] of Object.entries(form)) {
      const n = Number(v)
      payload[k] = isNaN(n) || typeof v === 'string' && isNaN(Number(v)) ? v : n
    }

    try {
      const r = await fetch('/api/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!r.ok) throw new Error(`${r.status} ${r.statusText}`)
      const data = await r.json()
      setResult(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <section className="hero" style={{ paddingBottom: '3rem' }}>
        <div className="container">
          <div className="hero__eyebrow">
            <span className="hero__eyebrow-dot" />
            Real-time Prediction
          </div>
          <h1 className="hero__title" style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)' }}>
            Score any <em>customer.</em>
          </h1>
          <p className="hero__sub" style={{ marginBottom: 0 }}>
            Enter a customer's attributes and all 6 ML models will score
            them instantly — response probability, LTV, churn risk, and more.
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: '3rem' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', alignItems: 'start' }}>

            {/* ── Form ── */}
            <div>
              <SectionHeader label="Input" title="Customer Attributes" />
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
                  {FIELDS.map(f => (
                    <div key={f.key}>
                      <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                        {f.label}
                      </label>
                      {f.type === 'select' ? (
                        <select
                          value={form[f.key] ?? ''}
                          onChange={e => handleChange(f.key, e.target.value)}
                          style={inputStyle}
                        >
                          {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : (
                        <input
                          type="number"
                          value={form[f.key] ?? ''}
                          onChange={e => handleChange(f.key, e.target.value)}
                          placeholder={f.placeholder}
                          min={f.min}
                          max={f.max}
                          style={inputStyle}
                        />
                      )}
                    </div>
                  ))}
                </div>

                <button type="submit" disabled={loading} style={submitBtn}>
                  {loading ? 'Scoring…' : 'Run Prediction →'}
                </button>
              </form>
            </div>

            {/* ── Results ── */}
            <div>
              <SectionHeader label="Output" title="ML Predictions" />

              {error && (
                <div className="error-box" style={{ marginBottom: '1.5rem' }}>{error}</div>
              )}

              {!result && !loading && (
                <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>→</div>
                  <div style={{ fontSize: '0.85rem' }}>Fill in the form and hit<br/>"Run Prediction"</div>
                </div>
              )}

              {loading && (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                  <div className="loading__spinner" />
                </div>
              )}

              {result && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <ResultCard
                      label="Response Probability"
                      value={result.response_probability != null ? `${(result.response_probability * 100).toFixed(1)}%` : '—'}
                      sub={result.will_respond ? '✓ Likely to accept' : '✗ Unlikely to accept'}
                      accentColor="var(--accent)"
                    />
                    <ResultCard
                      label="Predicted LTV"
                      value={result.predicted_ltv != null ? `$${Math.round(result.predicted_ltv).toLocaleString()}` : '—'}
                      sub="2-year spend forecast"
                      accentColor="var(--green)"
                    />
                    <ResultCard
                      label="Churn Risk"
                      value={result.churn_risk ?? '—'}
                      sub={result.churn_probability != null ? `${(result.churn_probability * 100).toFixed(1)}% probability` : undefined}
                      accentColor={result.churn_risk === 'High' ? 'var(--red)' : result.churn_risk === 'Medium' ? 'var(--amber)' : 'var(--green)'}
                    />
                    <ResultCard
                      label="Best Channel"
                      value={result.recommended_channel ?? result.best_channel ?? '—'}
                      sub={result.channel_probabilities
                        ? `${(Math.max(...Object.values(result.channel_probabilities)) * 100).toFixed(0)}% confidence`
                        : undefined}
                      accentColor="var(--amber)"
                    />
                  </div>

                  {/* Segment */}
                  {result.segment_name && (
                    <div className="chart-card" style={{ borderTop: '3px solid var(--accent)' }}>
                      <div className="chart-card__label">Predicted Segment</div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, letterSpacing: '-0.02em', color: 'var(--dark)', margin: '0.25rem 0' }}>
                        {result.segment_name}
                      </div>
                    </div>
                  )}

                  {/* Affinity Ranking */}
                  {(result.affinity_ranking ?? result.top_products) && (
                    <div className="chart-card">
                      <div className="chart-card__label">Product Affinity Ranking</div>
                      <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                        {(result.affinity_ranking ?? result.top_products ?? []).map((p, i) => (
                          <span key={p} className={`tag ${i === 0 ? 'tag--accent' : 'tag--neutral'}`}>
                            {i + 1}. {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Predicted Spend Breakdown */}
                  {result.predicted_spend && (
                    <div className="chart-card">
                      <div className="chart-card__label" style={{ marginBottom: '1rem' }}>Predicted Spend Breakdown</div>
                      {Object.entries(result.predicted_spend)
                        .sort(([, a], [, b]) => b - a)
                        .map(([cat, val]) => {
                          const max = Math.max(...Object.values(result.predicted_spend))
                          const w = Math.round((val / max) * 100)
                          return (
                            <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                              <div style={{ width: 56, fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-mid)', textAlign: 'right' }}>{cat}</div>
                              <div style={{ flex: 1, height: 5, background: 'var(--surface)', borderRadius: 3, overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${w}%`, background: 'var(--accent)', borderRadius: 3 }} />
                              </div>
                              <div style={{ width: 52, fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-mid)' }}>${val.toFixed(0)}</div>
                            </div>
                          )
                        })
                      }
                    </div>
                  )}

                  {/* Strategy */}
                  {result.strategy && (
                    <div className="chart-card" style={{ background: 'var(--dark)', borderColor: 'transparent' }}>
                      <div className="label-inv" style={{ marginBottom: '0.75rem' }}>Recommended Strategy</div>
                      <p style={{ color: 'var(--text-inv)', fontSize: '0.9rem', lineHeight: 1.65 }}>{result.strategy}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

const inputStyle = {
  width: '100%',
  padding: '0.55rem 0.9rem',
  borderRadius: 'var(--radius-sm)',
  border: '1px solid var(--border)',
  background: 'white',
  fontSize: '0.83rem',
  color: 'var(--text)',
  fontFamily: 'var(--font-body)',
  outline: 'none',
}

const submitBtn = {
  width: '100%',
  padding: '0.9rem',
  borderRadius: 'var(--radius-pill)',
  border: 'none',
  background: 'var(--dark)',
  color: 'white',
  fontFamily: 'var(--font-display)',
  fontWeight: 700,
  fontSize: '1rem',
  letterSpacing: '-0.01em',
  cursor: 'pointer',
}
