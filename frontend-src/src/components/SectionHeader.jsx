import React from 'react'

/**
 * A labeled section block header, drasa-style
 * Props: label (uppercase small caps), title, action (optional JSX button/link)
 */
export default function SectionHeader({ label, title, action }) {
  return (
    <div className="section-header">
      <div className="section-header__left">
        <div className="section-header__label">{label}</div>
        <h2 className="section-header__title">{title}</h2>
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}
