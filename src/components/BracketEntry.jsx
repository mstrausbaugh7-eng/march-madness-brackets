import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { TEAMS, REGIONS, ROUND_NAMES, getSlotsForRound } from '../lib/teams'

// Build matchups for round 1 from region teams
function getR1Matchups(region) {
  const teams = TEAMS[region]
  const matchups = []
  for (let i = 0; i < 16; i += 2) {
    matchups.push({ top: teams[i], bottom: teams[i + 1] })
  }
  return matchups // 8 matchups per region
}

export default function BracketEntry({ player }) {
  const [picks, setPicks] = useState({}) // { "round-slot": teamName }
  const [results, setResults] = useState({}) // same shape, actual results
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [activeRegion, setActiveRegion] = useState('East')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [player.id])

  const loadData = async () => {
    setLoading(true)
    // Load player's existing picks
    const { data: pickData } = await supabase
      .from('picks')
      .select('*')
      .eq('player_id', player.id)

    if (pickData) {
      const pickMap = {}
      pickData.forEach(p => { pickMap[`${p.round}-${p.slot}`] = p.team })
      setPicks(pickMap)
    }

    // Load results
    const { data: resultData } = await supabase
      .from('results')
      .select('*')

    if (resultData) {
      const resMap = {}
      resultData.forEach(r => {
        if (r.winner) resMap[`${r.round}-${r.slot}`] = r.winner
      })
      setResults(resMap)
    }

    setLoading(false)
  }

  // When a team is picked in round 1, slot is region*8 + matchupIdx
  // Round 2 slot is region*4 + matchupIdx/2, etc.
  const getGlobalSlot = (region, round, localSlot) => {
    const regionIdx = REGIONS.indexOf(region)
    if (round <= 4) {
      const gamesPerRegion = getSlotsForRound(round) / 4
      return regionIdx * gamesPerRegion + localSlot
    }
    // Final Four: slots 0-3 map to region winners
    return regionIdx
  }

  const handlePick = (region, round, localSlot, team) => {
    const globalSlot = getGlobalSlot(region, round, localSlot)
    const key = `${round}-${globalSlot}`

    setPicks(prev => {
      const next = { ...prev, [key]: team }

      // Cascade: if this team was picked in later rounds and is now being replaced, clear those
      clearDownstream(next, team, round, globalSlot)

      return next
    })
    setSaved(false)
  }

  const clearDownstream = (picksObj, oldTeam, round, slot) => {
    // When a pick changes, invalidate anything that depended on the old pick
    // being correct further down the bracket
    for (let r = round + 1; r <= 6; r++) {
      const nextSlot = Math.floor(slot / Math.pow(2, r - round))
      const key = `${r}-${nextSlot}`
      if (picksObj[key] && picksObj[key] !== picksObj[`${round}-${slot}`]) {
        // The downstream pick doesn't match the new pick here, so it stays valid
        // Only clear if the team that was picked downstream was the OLD pick from the changed game
      }
    }
  }

  const savePicks = async () => {
    setSaving(true)
    const rows = Object.entries(picks).map(([key, team]) => {
      const [round, slot] = key.split('-').map(Number)
      return { player_id: player.id, round, slot, team }
    })

    const { error } = await supabase
      .from('picks')
      .upsert(rows, { onConflict: 'player_id,round,slot' })

    setSaving(false)
    if (!error) {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
  }

  const getPickForSlot = (round, globalSlot) => picks[`${round}-${globalSlot}`] || null
  const getResultForSlot = (round, globalSlot) => results[`${round}-${globalSlot}`] || null

  const isCorrect = (round, globalSlot) => {
    const pick = getPickForSlot(round, globalSlot)
    const result = getResultForSlot(round, globalSlot)
    if (!pick || !result) return null
    return pick === result
  }

  // Get teams available to pick in a given round/slot based on previous picks
  const getAvailableTeams = (region, round, localSlot) => {
    if (round === 1) return null // R1 teams are static
    const regionIdx = REGIONS.indexOf(region)

    if (round <= 4) {
      const prevGamesPerRegion = getSlotsForRound(round - 1) / 4
      const prevSlot1 = regionIdx * prevGamesPerRegion + localSlot * 2
      const prevSlot2 = prevSlot1 + 1
      const t1 = getPickForSlot(round - 1, prevSlot1)
      const t2 = getPickForSlot(round - 1, prevSlot2)
      return [t1, t2].filter(Boolean)
    }

    if (round === 5) {
      // Final four: region winner
      const prevGlobalSlot = regionIdx * 1
      const t = getPickForSlot(4, prevGlobalSlot)
      return t ? [t] : []
    }

    if (round === 6) {
      const t1 = getPickForSlot(5, 0)
      const t2 = getPickForSlot(5, 1)
      return [t1, t2].filter(Boolean)
    }
    return []
  }

  const calcScore = () => {
    let score = 0
    const points = { 1: 1, 2: 2, 3: 4, 4: 8, 5: 16, 6: 32 }
    Object.keys(results).forEach(key => {
      if (picks[key] && picks[key] === results[key]) {
        const round = parseInt(key.split('-')[0])
        score += points[round] || 0
      }
    })
    return score
  }

  const totalPicks = Object.keys(picks).length
  const maxPicks = 63
  const score = calcScore()
  const hasResults = Object.keys(results).length > 0

  if (loading) return <div className="loading">Loading your bracket...</div>

  return (
    <div className="bracket-page">
      <div className="bracket-header">
        <div className="bracket-info">
          <h2>{player.name}'s Bracket</h2>
          <div className="bracket-meta">
            <span className="picks-progress">{totalPicks}/{maxPicks} picks</span>
            {hasResults && <span className="current-score">Score: {score} pts</span>}
          </div>
        </div>
        <button
          className={`save-btn ${saved ? 'saved' : ''}`}
          onClick={savePicks}
          disabled={saving}
        >
          {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Picks'}
        </button>
      </div>

      {/* Region tabs */}
      <div className="region-tabs">
        {REGIONS.map(r => (
          <button
            key={r}
            className={`region-tab ${activeRegion === r ? 'active' : ''}`}
            onClick={() => setActiveRegion(r)}
          >
            {r}
          </button>
        ))}
        <button
          className={`region-tab ${activeRegion === 'Final Four' ? 'active' : ''}`}
          onClick={() => setActiveRegion('Final Four')}
        >
          Final Four
        </button>
      </div>

      {activeRegion !== 'Final Four' ? (
        <RegionBracket
          region={activeRegion}
          picks={picks}
          results={results}
          onPick={handlePick}
          getPickForSlot={getPickForSlot}
          getResultForSlot={getResultForSlot}
          getAvailableTeams={getAvailableTeams}
          isCorrect={isCorrect}
        />
      ) : (
        <FinalFourBracket
          picks={picks}
          results={results}
          onPick={(round, slot, team) => {
            const key = `${round}-${slot}`
            setPicks(prev => ({ ...prev, [key]: team }))
            setSaved(false)
          }}
          getPickForSlot={getPickForSlot}
          getResultForSlot={getResultForSlot}
          isCorrect={isCorrect}
        />
      )}
    </div>
  )
}

function RegionBracket({ region, picks, results, onPick, getPickForSlot, getResultForSlot, getAvailableTeams, isCorrect }) {
  const regionIdx = REGIONS.indexOf(region)
  const rounds = [1, 2, 3, 4]
  const r1Matchups = getR1Matchups(region)

  return (
    <div className="region-bracket">
      <div className="rounds-scroll">
        {rounds.map(round => {
          const gamesPerRegion = getSlotsForRound(round) / 4
          return (
            <div key={round} className="round-col">
              <div className="round-label">{ROUND_NAMES[round]}</div>
              <div className="round-games">
                {Array.from({ length: gamesPerRegion }).map((_, localSlot) => {
                  const globalSlot = regionIdx * gamesPerRegion + localSlot
                  const pick = getPickForSlot(round, globalSlot)
                  const result = getResultForSlot(round, globalSlot)
                  const correct = isCorrect(round, globalSlot)

                  if (round === 1) {
                    const matchup = r1Matchups[localSlot]
                    return (
                      <R1Game
                        key={localSlot}
                        matchup={matchup}
                        pick={pick}
                        result={result}
                        correct={correct}
                        onPick={(team) => onPick(region, round, localSlot, team)}
                      />
                    )
                  }

                  const available = getAvailableTeams(region, round, localSlot)
                  return (
                    <LaterGame
                      key={localSlot}
                      available={available}
                      pick={pick}
                      result={result}
                      correct={correct}
                      onPick={(team) => onPick(region, round, localSlot, team)}
                      round={round}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function R1Game({ matchup, pick, result, correct, onPick }) {
  return (
    <div className="game-card">
      <TeamBtn
        team={matchup.top}
        picked={pick === matchup.top.name}
        isWinner={result === matchup.top.name}
        correct={pick === matchup.top.name ? correct : null}
        onClick={() => onPick(matchup.top.name)}
      />
      <div className="vs">vs</div>
      <TeamBtn
        team={matchup.bottom}
        picked={pick === matchup.bottom.name}
        isWinner={result === matchup.bottom.name}
        correct={pick === matchup.bottom.name ? correct : null}
        onClick={() => onPick(matchup.bottom.name)}
      />
    </div>
  )
}

function TeamBtn({ team, picked, isWinner, correct, onClick }) {
  let cls = 'team-btn'
  if (picked) cls += ' picked'
  if (isWinner) cls += ' winner'
  if (correct === true) cls += ' correct'
  if (correct === false) cls += ' wrong'

  return (
    <button className={cls} onClick={onClick}>
      <span className="team-seed">{team.seed}</span>
      <span className="team-name">{team.name}</span>
      {correct === true && <span className="result-icon">✓</span>}
      {correct === false && <span className="result-icon">✗</span>}
    </button>
  )
}

function LaterGame({ available, pick, result, correct, onPick, round }) {
  return (
    <div className="game-card later-game">
      {available.length === 0 ? (
        <div className="empty-slot">Pick previous rounds first</div>
      ) : (
        available.map(team => {
          const teamName = typeof team === 'string' ? team : team?.name
          if (!teamName) return null
          const isPicked = pick === teamName
          const isWinner = result === teamName
          const teamCorrect = isPicked ? correct : null
          return (
            <button
              key={teamName}
              className={`team-btn ${isPicked ? 'picked' : ''} ${isWinner ? 'winner' : ''} ${teamCorrect === true ? 'correct' : ''} ${teamCorrect === false ? 'wrong' : ''}`}
              onClick={() => onPick(teamName)}
            >
              <span className="team-name">{teamName}</span>
              {teamCorrect === true && <span className="result-icon">✓</span>}
              {teamCorrect === false && <span className="result-icon">✗</span>}
            </button>
          )
        })
      )}
    </div>
  )
}

function FinalFourBracket({ picks, results, onPick, getPickForSlot, getResultForSlot, isCorrect }) {
  // Final four: 4 region winners → 2 semis → 1 final
  // Slots: round 5 slot 0 = East vs West winner, slot 1 = South vs Midwest winner
  // Round 6 slot 0 = Champion

  const f4Teams = REGIONS.map((_, i) => getPickForSlot(4, i))
  const f4Game1 = [f4Teams[0], f4Teams[1]].filter(Boolean)
  const f4Game2 = [f4Teams[2], f4Teams[3]].filter(Boolean)

  const r5s0pick = getPickForSlot(5, 0)
  const r5s1pick = getPickForSlot(5, 1)
  const champTeams = [r5s0pick, r5s1pick].filter(Boolean)
  const champPick = getPickForSlot(6, 0)

  return (
    <div className="final-four">
      <h3 className="ff-title">Final Four & Championship</h3>
      <div className="ff-bracket">
        <div className="ff-column">
          <div className="ff-round-label">Final Four</div>
          <div className="ff-game">
            <p className="ff-matchup-label">East vs West</p>
            {f4Game1.length === 0 ? <div className="empty-slot">Complete Elite Eight first</div> : (
              f4Game1.map(team => (
                <button
                  key={team}
                  className={`team-btn ${r5s0pick === team ? 'picked' : ''} ${getResultForSlot(5, 0) === team ? 'winner' : ''} ${r5s0pick === team && isCorrect(5, 0) === true ? 'correct' : ''} ${r5s0pick === team && isCorrect(5, 0) === false ? 'wrong' : ''}`}
                  onClick={() => onPick(5, 0, team)}
                >
                  <span className="team-name">{team}</span>
                </button>
              ))
            )}
          </div>
          <div className="ff-game" style={{ marginTop: '2rem' }}>
            <p className="ff-matchup-label">South vs Midwest</p>
            {f4Game2.length === 0 ? <div className="empty-slot">Complete Elite Eight first</div> : (
              f4Game2.map(team => (
                <button
                  key={team}
                  className={`team-btn ${r5s1pick === team ? 'picked' : ''} ${getResultForSlot(5, 1) === team ? 'winner' : ''} ${r5s1pick === team && isCorrect(5, 1) === true ? 'correct' : ''} ${r5s1pick === team && isCorrect(5, 1) === false ? 'wrong' : ''}`}
                  onClick={() => onPick(5, 1, team)}
                >
                  <span className="team-name">{team}</span>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="ff-arrow">→</div>

        <div className="ff-column">
          <div className="ff-round-label">Championship</div>
          <div className="ff-game champ-game">
            <p className="ff-matchup-label">🏆 Champion</p>
            {champTeams.length === 0 ? <div className="empty-slot">Pick Final Four first</div> : (
              champTeams.map(team => (
                <button
                  key={team}
                  className={`team-btn champ-btn ${champPick === team ? 'picked' : ''} ${getResultForSlot(6, 0) === team ? 'winner' : ''} ${champPick === team && isCorrect(6, 0) === true ? 'correct' : ''} ${champPick === team && isCorrect(6, 0) === false ? 'wrong' : ''}`}
                  onClick={() => onPick(6, 0, team)}
                >
                  <span className="team-name">{team}</span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="scoring-guide">
        <h4>Point Values</h4>
        <div className="scoring-grid">
          {[['R64', 1], ['R32', 2], ['S16', 4], ['E8', 8], ['F4', 16], ['Champ', 32]].map(([label, pts]) => (
            <div key={label} className="scoring-item">
              <span className="scoring-round">{label}</span>
              <span className="scoring-pts">{pts}pt{pts > 1 ? 's' : ''}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
