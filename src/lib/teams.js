// 2025 NCAA Tournament — 64 teams, 4 regions, seeded 1-16
// Each region has 8 first-round matchups (seed 1v16, 8v9, 5v12, 4v13, 6v11, 3v14, 7v10, 2v15)

export const REGIONS = ['East', 'West', 'South', 'Midwest']

export const TEAMS = {
  East: [
    { seed: 1,  name: 'Duke' },
    { seed: 16, name: 'American' },
    { seed: 8,  name: 'Mississippi St' },
    { seed: 9,  name: 'Boise St' },
    { seed: 5,  name: 'Oregon' },
    { seed: 12, name: 'Liberty' },
    { seed: 4,  name: 'Arizona' },
    { seed: 13, name: 'Akron' },
    { seed: 6,  name: 'BYU' },
    { seed: 11, name: 'VCU' },
    { seed: 3,  name: 'Wisconsin' },
    { seed: 14, name: 'Montana' },
    { seed: 7,  name: 'Saint Marys' },
    { seed: 10, name: 'Vanderbilt' },
    { seed: 2,  name: 'Alabama' },
    { seed: 15, name: 'Robert Morris' },
  ],
  West: [
    { seed: 1,  name: 'Auburn' },
    { seed: 16, name: 'Alabama St' },
    { seed: 8,  name: 'Louisville' },
    { seed: 9,  name: 'Creighton' },
    { seed: 5,  name: 'Michigan' },
    { seed: 12, name: 'UC San Diego' },
    { seed: 4,  name: 'Texas A&M' },
    { seed: 13, name: 'Yale' },
    { seed: 6,  name: 'Ole Miss' },
    { seed: 11, name: 'Drake' },
    { seed: 3,  name: 'Iowa St' },
    { seed: 14, name: 'Lipscomb' },
    { seed: 7,  name: 'Marquette' },
    { seed: 10, name: 'New Mexico' },
    { seed: 2,  name: 'Michigan St' },
    { seed: 15, name: 'Bryant' },
  ],
  South: [
    { seed: 1,  name: 'Florida' },
    { seed: 16, name: 'Norfolk St' },
    { seed: 8,  name: 'UConn' },
    { seed: 9,  name: 'Oklahoma' },
    { seed: 5,  name: 'Memphis' },
    { seed: 12, name: 'Colorado St' },
    { seed: 4,  name: 'Maryland' },
    { seed: 13, name: 'Grand Canyon' },
    { seed: 6,  name: 'Missouri' },
    { seed: 11, name: 'Drake' },
    { seed: 3,  name: 'Texas Tech' },
    { seed: 14, name: 'UNCW' },
    { seed: 7,  name: 'Kansas' },
    { seed: 10, name: 'Arkansas' },
    { seed: 2,  name: 'St Johns' },
    { seed: 15, name: 'Omaha' },
  ],
  Midwest: [
    { seed: 1,  name: 'Houston' },
    { seed: 16, name: 'SIU Edwardsville' },
    { seed: 8,  name: 'Gonzaga' },
    { seed: 9,  name: 'Georgia' },
    { seed: 5,  name: 'Clemson' },
    { seed: 12, name: 'McNeese' },
    { seed: 4,  name: 'Purdue' },
    { seed: 13, name: 'High Point' },
    { seed: 6,  name: 'Illinois' },
    { seed: 11, name: 'Texas' },
    { seed: 3,  name: 'Kentucky' },
    { seed: 14, name: 'Troy' },
    { seed: 7,  name: 'UCLA' },
    { seed: 10, name: 'Utah St' },
    { seed: 2,  name: 'Tennessee' },
    { seed: 15, name: 'Wofford' },
  ],
}

// Points per correct pick per round
export const ROUND_POINTS = {
  1: 1,   // Round of 64
  2: 2,   // Round of 32
  3: 4,   // Sweet 16
  4: 8,   // Elite 8
  5: 16,  // Final Four
  6: 32,  // Championship
}

export const ROUND_NAMES = {
  1: 'Round of 64',
  2: 'Round of 32',
  3: 'Sweet 16',
  4: 'Elite Eight',
  5: 'Final Four',
  6: 'Championship',
}

// Get all 16 first-round teams for a region in matchup order
export function getRegionTeams(region) {
  return TEAMS[region] || []
}

// Build initial bracket slots: 63 total games
// Rounds 1-4: 8,4,2,1 games per region = 15 per region × 4 = 60
// Round 5 (F4): 2 games, Round 6 (Championship): 1 game
export function buildEmptyBracket() {
  const bracket = {}
  for (let round = 1; round <= 6; round++) {
    bracket[round] = {}
    const slots = getSlotsForRound(round)
    for (let slot = 0; slot < slots; slot++) {
      bracket[round][slot] = null
    }
  }
  return bracket
}

export function getSlotsForRound(round) {
  // Round 1: 32 games, Round 2: 16, Round 3: 8, Round 4: 4, Round 5: 2, Round 6: 1
  return Math.pow(2, 6 - round)
}
