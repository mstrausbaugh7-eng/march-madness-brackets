import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { REGIONS, TEAMS, ROUND_NAMES, getSlotsForRound } from '../lib/teams'

export default function AdminPanel() {
  const [results, setResults] = useState({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeRound, setActiveRound] = useState(1)
  const [allPicks, setAllPicks] = useState([])

  useEffect(() => {
    loadResults()
    loadAllPicks()
  }, [])

  const loadResults = async () => {
    const { data } = await supabase.from('results').select('*')
    if (data) {
      const map = {}
      data.forEach(r => { map[`${r.round}-${r.slot}`] = r.winner || '' })
      setResults(map)
    }
  }

  const loadAllPicks = async () => {
    const { data } = await supabase.from('picks').select('*, players(name)')
    if (data) setAllPicks(data)
  }

  const setResult = (round, slot, winner) => {
    setResults(prev => ({ ...prev, [`${round}-${slot}`]: winner }))
    setSaved(false)
  }

  const saveResults = async () => {
    setSaving(true)
    const rows = Object.entries(results).map(([key, winner]) => {
      const [round, slot] = key.split('-').map(Number)
      return { round, slot, winner: winner || null }
    })

    const { error } = await supabase
      .from('results')
      .upsert(rows, { onConflict: 'round,slot' })

    setSaving(false)
    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  const getWhoPickedWhat = (round, slot) => {
    const gamePicks = allPicks.filter(p => p.round === round && p.slot === slot)
    const teams = {}
    gamePicks.forEach(p => {
      if (!teams[p.team]) teams[p.team] = []
      teams[p.team].push(p.players?.name || 'Unknown')
    })
    return teams
  }

  // Build game list for current round
  const getGamesForRound = (round) => {
    const slots = getSlotsForRound(round)
    const games = []
    for (let slot = 0; slot < slots; slot++) {
      games.push({ round, slot })
    }
    return games
  }

  // Get teams that could appear in this slot based on prior results
  const getCandidates = (round, slot) => {
    if (round === 1) {
      // Get region and local slot
      const regionIdx = Math.floor(slot / 8)
      const localSlot = slot % 8
      const region = REGIONS[regionIdx]
      const teams = TEAMS[region]
      return [teams[localSlot * 2].name, teams[localSlot * 2 + 1].name]
    }
    // For later rounds, look at prior results
    const slot1 = slot * 2
    const slot2 = slot * 2 + 1
    const t1 = results[`${round - 1}-${slot1}`]
    const t2 = results[`${round - 1}-${slot2}`]
    return [t1, t2].filter(Boolean)
  }

  const games = getGamesForRound(activeRound)

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h2>🔒 Admin — Enter Results</h2>
        <button
          className={`save-btn ${saved ? 'saved' : ''}`}
          onClick={saveResults}
          disabled={saving}
        >
          {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Results'}
        </button>
      </div>

      <p className="admin-note">Enter actual game winners. This updates everyone's scores automatically.</p>

      <div className="round-tabs">
        {[1, 2, 3, 4, 5, 6].map(r => (
          <button
            key={r}
            className={`region-tab ${activeRound === r ? 'active' : ''}`}
            onClick={() => setActiveRound(r)}
          >
            {ROUND_NAMES[r]}
          </button>
        ))}
      </div>

      <div className="admin-games">
        {games.map(({ round, slot }) => {
          const candidates = getCandidates(round, slot)
          const current = results[`${round}-${slot}`] || ''
          const whoPickedWhat = getWhoPickedWhat(round, slot)
          const regionIdx = round <= 4 ? Math.floor(slot / (getSlotsForRound(round) / 4)) : null
          const region = regionIdx !== null ? REGIONS[regionIdx] : ''

          return (
            <div key={slot} className="admin-game-card">
              <div className="admin-game-header">
                <span className="admin-game-label">
                  {region && `${region} · `}Game {slot + 1}
                </span>
                {current && <span className="admin-winner-badge">Winner: {current}</span>}
              </div>

              <div className="admin-candidates">
                {candidates.length === 0 ? (
                  <p className="no-candidates">Enter previous round results first</p>
                ) : candidates.map(team => (
                  <label key={team} className={`candidate-option ${current === team ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name={`result-${round}-${slot}`}
                      value={team}
                      checked={current === team}
                      onChange={() => setResult(round, slot, team)}
                    />
                    <span>{team}</span>
                    <span className="pick-count">
                      {whoPickedWhat[team] ? `${whoPickedWhat[team].length} picked` : '0 picked'}
                    </span>
                  </label>
                ))}
              </div>

              {Object.keys(whoPickedWhat).length > 0 && (
                <div className="who-picked">
                  {Object.entries(whoPickedWhat).map(([team, players]) => (
                    <div key={team} className="who-picked-row">
                      <strong>{team}:</strong> {players.join(', ')}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
