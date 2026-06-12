import { villaManagers, casaManagers } from './managers.js'

export const VILLA_LEAGUE_ID = 'villa-league'
export const CASA_LEAGUE_ID = 'casa-league'

export const MAIN_LEAGUES = [
  {
    id: VILLA_LEAGUE_ID,
    name: 'Villa League',
    inviteCode: 'VILLA26',
    isMain: true,
    managers: villaManagers,
  },
  {
    id: CASA_LEAGUE_ID,
    name: 'Casa League',
    inviteCode: 'CASA26',
    isMain: true,
    managers: casaManagers,
  },
]

export function isMainLeague(leagueId) {
  return leagueId === VILLA_LEAGUE_ID || leagueId === CASA_LEAGUE_ID
}

export function getMainLeague(leagueId) {
  return MAIN_LEAGUES.find(l => l.id === leagueId) ?? null
}
