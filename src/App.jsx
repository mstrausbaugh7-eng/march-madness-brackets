import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Home from './components/Home'
import BracketEntry from './components/BracketEntry'
import Leaderboard from './components/Leaderboard'
import AdminPanel from './components/AdminPanel'
import './index.css'

export default function App() {
  const [view, setView] = useState('home') // home | bracket | leaderboard | admin
  const [player, setPlayer] = useState(null) // { id, name }
  const [adminMode, setAdminMode] = useState(false)

  // Check for saved player in sessionStorage
  useEffect(() => {
    const saved = sessionStorage.getItem('mm_player')
    if (saved) setPlayer(JSON.parse(saved))
  }, [])

  const handleJoin = (playerData) => {
    setPlayer(playerData)
    sessionStorage.setItem('mm_player', JSON.stringify(playerData))
    setView('bracket')
  }

  const handleLogout = () => {
    setPlayer(null)
    sessionStorage.removeItem('mm_player')
    setView('home')
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="logo" onClick={() => setView('home')}>
            <span className="logo-bracket">[</span>
            <span className="logo-text">MADNESS</span>
            <span className="logo-bracket">]</span>
            <span className="logo-year">2025</span>
          </div>
          <nav className="header-nav">
            <button
              className={`nav-btn ${view === 'leaderboard' ? 'active' : ''}`}
              onClick={() => setView('leaderboard')}
            >
              Leaderboard
            </button>
            {player && (
              <button
                className={`nav-btn ${view === 'bracket' ? 'active' : ''}`}
                onClick={() => setView('bracket')}
              >
                My Bracket
              </button>
            )}
            {adminMode && (
              <button
                className={`nav-btn admin ${view === 'admin' ? 'active' : ''}`}
                onClick={() => setView('admin')}
              >
                Admin
              </button>
            )}
            {player ? (
              <div className="player-badge">
                <span>{player.name}</span>
                <button className="logout-btn" onClick={handleLogout}>×</button>
              </div>
            ) : (
              <button className="nav-btn cta" onClick={() => setView('home')}>
                Enter Bracket
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="app-main">
        {view === 'home' && (
          <Home onJoin={handleJoin} player={player} setView={setView} onEnableAdmin={() => setAdminMode(true)} />
        )}
        {view === 'bracket' && player && (
          <BracketEntry player={player} />
        )}
        {view === 'bracket' && !player && (
          <Home onJoin={handleJoin} player={player} setView={setView} onEnableAdmin={() => setAdminMode(true)} />
        )}
        {view === 'leaderboard' && (
          <Leaderboard />
        )}
        {view === 'admin' && adminMode && (
          <AdminPanel />
        )}
      </main>

      <footer className="app-footer">
        <p>Family Bracket Challenge 2025 · <span className="secret-admin" onClick={() => { setAdminMode(true); setView('admin') }}>●</span></p>
      </footer>
    </div>
  )
}
