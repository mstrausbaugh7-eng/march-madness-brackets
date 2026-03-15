import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function Leaderboard() {
  const [standings, setStandings] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)

  useEffect(() => {
    loadStandings()
    // Auto-refresh every 60 seconds
    const interval = setInterval(loadStandings, 60000)
    return () => clearInterval(interval)
  }, [])

  const loadStandings = async () => {
    setLoading(true)
    const POINTS = { 1: 1, 2: 2, 3: 4, 4: 8, 5: 16, 6: 32 }

    const { data: players } = await supabase.from('players').select('*')
    const { data: allPicks } = await supabase.from('picks').select('*')
    const { data: results } = await supabase.from('results').select('*')

    if (!players || !allPicks || !results) {
      setLoading(false)
      return
    }

    // Build result lookup
    const resultMap = {}
    results.forEach(r => { if (r.winner) resultMap[`${r.round}-${r.slot}`] = r.winner })

    const gamesPlayed = results.filter(r => r.winner).length
    const maxScore = Object.entries(POINTS).reduce((sum, [r, pts]) => {
      const slots = Math.pow(2, 6 - parseInt(r))
      return sum + slots * pts
    }, 0) // = 192

    const scored = players.map(player => {
      const playerPicks = allPicks.filter(p => p.player_id === player.id)
      let score = 0
      let correct = 0
      let possible = 0

      playerPicks.forEach(pick => {
        const key = `${pick.round}-${pick.slot}`
        if (resultMap[key]) {
          if (resultMap[key] === pick.team) {
            score += POINTS[pick.round] || 0
            correct++
          }
        }
      })

      // Max possible: all remaining unpicked games could still go their way
      const decided = Object.keys(resultMap).length
      possible = score
      playerPicks.forEach(pick => {
        const key = `${pick.round}-${pick.slot}`
        if (!resultMap[key]) {
          possible += POINTS[pick.round] || 0
        }
      })

      return {
        name: player.name,
        score,
        correct,
        possible,
        picks: playerPicks.length,
        champion: playerPicks.find(p => p.round === 6)?.team || '—',
      }
    })

    scored.sort((a, b) => b.score - a.score || b.possible - a.possible)
    setStandings(scored)
    setLastUpdated(new Date())
    setLoading(false)
  }

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="leaderboard-page">
      <div className="leaderboard-header">
        <h2>Leaderboard</h2>
        {lastUpdated && (
          <span className="refresh-info">
            Updated {lastUpdated.toLocaleTimeString()} ·
            <button className="refresh-btn" onClick={loadStandings}>↻ Refresh</button>
          </span>
        )}
      </div>

      {loading ? (
        <div className="loading">Loading standings...</div>
      ) : standings.length === 0 ? (
        <div className="empty-state">
          <p>No picks yet! Be the first to enter your bracket.</p>
        </div>
      ) : (
        <div className="standings-table">
          <div className="standings-head">
            <span className="col-rank">Rank</span>
            <span className="col-name">Name</span>
            <span className="col-score">Score</span>
            <span className="col-possible">Max</span>
            <span className="col-correct">Correct</span>
            <span className="col-champ">Champion Pick</span>
          </div>
          {standings.map((player, idx) => (
            <div key={player.name} className={`standings-row ${idx === 0 ? 'leader' : ''}`}>
              <span className="col-rank">
                {idx < 3 ? medals[idx] : `${idx + 1}`}
              </span>
              <span className="col-name">{player.name}</span>
              <span className="col-score">{player.score}</span>
              <span className="col-possible">{player.possible}</span>
              <span className="col-correct">{player.correct}</span>
              <span className="col-champ">{player.champion}</span>
            </div>
          ))}
        </div>
      )}

      <div className="scoring-legend">
        <h4>Scoring</h4>
        <div className="legend-grid">
          {[['R64', 1], ['R32', 2], ['S16', 4], ['E8', 8], ['F4', 16], ['Champ', 32]].map(([r, p]) => (
            <div key={r} className="legend-item">
              <span>{r}</span><strong>{p}pt</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
