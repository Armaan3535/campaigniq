import React, { useState } from 'react'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Overview from './pages/Overview'
import './index.css'

export default function App() {
  const [modelsOnline] = useState(true)

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar modelsOnline={modelsOnline} />
      <main style={{ flex: 1 }}>
        <Overview />
      </main>
      <Footer />
    </div>
  )
}
