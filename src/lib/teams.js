// 2026 NCAA Tournament — 64 teams, 4 regions, seeded 1-16
// Each region has 8 first-round matchups (seed 1v16, 8v9, 5v12, 4v13, 6v11, 3v14, 7v10, 2v15)

export const REGIONS = ['East', 'West', 'South', 'Midwest']

export const TEAMS = {
  East: [
    { seed: 1,  name: 'Duke' },
    { seed: 16, name: 'Siena' },
    { seed: 8,  name: 'Ohio St.' },
    { seed: 9,  name: 'TCU' },
    { seed: 5,  name: "St. John's" },
    { seed: 12, name: 'N. Iowa' },
    { seed: 4,  name: 'Kansas' },
    { seed: 13, name: 'Cal Baptist' },
    { seed: 6,  name: 'Louisville' },
    { seed: 11, name: 'South Florida' },
    { seed: 3,  name: 'Michigan St.' },
    { seed: 14, name: 'N. Dakota St.' },
    { seed: 7,  name: 'UCLA' },
    { seed: 10, name: 'UCF' },
    { seed: 2,  name: 'UConn' },
    { seed: 15, name: 'Furman' },
  ],
  West: [
    { seed: 1,  name: 'Arizona' },
    { seed: 16, name: 'LIU' },
    { seed: 8,  name: 'Villanova' },
    { seed: 9,  name: 'Utah St.' },
    { seed: 5,  name: 'Wisconsin' },
    { seed: 12, name: 'High Point' },
    { seed: 4,  name: 'Arkansas' },
    { seed: 13, name: 'Hawaii' },
    { seed: 6,  name: 'BYU' },
    { seed: 11, name: 'TEX/NCST' },
    { seed: 3,  name: 'Gonzaga' },
    { seed: 14, name: 'Kennesaw St.' },
    { seed: 7,  name: 'Miami' },
    { seed: 10, name: 'Missouri' },
    { seed: 2,  name: 'Purdue' },
    { seed: 15, name: 'Queens' },
  ],
  South: [
    { seed: 1,  name: 'Florida' },
    { seed: 16, name: 'PVAM/LEH' },
    { seed: 8,  name: 'Clemson' },
    { seed: 9,  name: 'Iowa' },
    { seed: 5,  name: 'Vanderbilt' },
    { seed: 12, name: 'McNeese' },
    { seed: 4,  name: 'Nebraska' },
    { seed: 13, name: 'Troy' },
    { seed: 6,  name: 'N. Carolina' },
    { seed: 11, name: 'VCU' },
    { seed: 3,  name: 'Illinois' },
    { seed: 14, name: 'Penn' },
    { seed: 7,  name: "Saint Mary's" },
    { seed: 10, name: 'Texas A&M' },
    { seed: 2,  name: 'Houston' },
    { seed: 15, name: 'Idaho' },
  ],
  Midwest: [
    { seed: 1,  name: 'Michigan' },
    { seed: 16, name: 'UMBC/HOW' },
    { seed: 8,  name: 'Georgia' },
    { seed: 9,  name: 'Saint Louis' },
    { seed: 5,  name: 'Texas Tech' },
    { seed: 12, name: 'Akron' },
    { seed: 4,  name: 'Alabama' },
    { seed: 13, name: 'Hofstra' },
    { seed: 6,  name: 'Tennessee' },
    { seed: 11, name: 'M-OH/SMU' },
    { seed: 3,  name: 'Virginia' },
    { seed: 14, name: 'Wright St.' },
    { seed: 7,  name: 'Kentucky' },
    { seed: 10, name: 'Santa Clara' },
    { seed: 2,  name: 'Iowa St.' },
    { seed: 15, name: 'Tennessee St.' },
  ],
}

// Points per correct pick per round
export const ROUND_POINTS = {
  1: 1,
  2: 2,
  3: 4,
  4: 8,
  5: 16,
  6: 32,
}

export const ROUND_NAMES = {
  1: 'Round of 64',
  2: 'Round of 32',
  3: 'Sweet 16',
  4: 'Elite Eight',
  5: 'Final Four',
  6: 'Championship',
}

export function getRegionTeams(region) {
  return TEAMS[region] || []
}

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
  return Math.pow(2, 6 - round)
}
