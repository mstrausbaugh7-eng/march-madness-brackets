import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Home({ onJoin, player, setView, onEnableAdmin }) {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [adminClick, setAdminClick] = useState(0)

  const handleSubmit = async () => {
    if (!name.trim()) return
    setLoading(true)
    setError('')

    try {
      // Check if player exists
      let { data: existing } = await supabase
        .from('players')
        .select('*')
        .eq('name', name.trim())
        .single()

      if (existing) {
        onJoin(existing)
        return
      }

      // Create new player
      const { data: newPlayer, error: insertError } = await supabase
        .from('players')
        .insert({ name: name.trim() })
        .select()
        .single()

      if (insertError) throw insertError
      onJoin(newPlayer)
    } catch (err) {
      setError('Something went wrong. Check your Supabase setup.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogoClick = () => {
    const next = adminClick + 1
    setAdminClick(next)
    if (next >= 5) {
      onEnableAdmin()
      setAdminClick(0)
    }
  }

  return (
    <div className="home">
      <div className="home-hero">
        <div className="hero-decoration">
          {['E', 'E', 'E', 'E', 'E', 'E', 'E', 'E'].map((_, i) => (
            <div key={i} className={`deco-ball ball-${i}`} />
          ))}
        </div>

        <div className="hero-content">
          <div className="title-stack" onClick={handleLogoClick}>
            <h1 className="hero-title">
              <span className="title-march">MARCH</span>
              <span className="title-madness">MADNESS</span>
            </h1>
            <p className="hero-subtitle">Family Bracket Challenge · 2025</p>
          </div>

          <div className="hero-stats">
            <div className="stat">
              <span className="stat-num">63</span>
              <span className="stat-label">Games</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-num">64</span>
              <span className="stat-label">Teams</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <span className="stat-num">1</span>
              <span className="stat-label">Champion</span>
            </div>
          </div>

          {player ? (
            <div className="returning-player">
              <p className="welcome-back">Welcome back, <strong>{player.name}</strong>!</p>
              <div className="action-buttons">
                <button className="btn-primary" onClick={() => setView('bracket')}>
                  View My Bracket
                </button>
                <button className="btn-secondary" onClick={() => setView('leaderboard')}>
                  See Leaderboard
                </button>
              </div>
            </div>
          ) : (
            <div className="join-form">
              <p className="join-prompt">Enter your name to pick your bracket</p>
              <div className="input-row">
                <input
                  type="text"
                  className="name-input"
                  placeholder="Your name..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  maxLength={30}
                />
                <button
                  className="btn-primary"
                  onClick={handleSubmit}
                  disabled={loading || !name.trim()}
                >
                  {loading ? '...' : "Let's Go →"}
                </button>
              </div>
              {error && <p className="error-msg">{error}</p>}
              <p className="join-note">Returning? Just enter your name again to edit your picks.</p>
            </div>
          )}

          <button className="leaderboard-link" onClick={() => setView('leaderboard')}>
            View Leaderboard →
          </button>
        </div>
      </div>
    </div>
  )
}
