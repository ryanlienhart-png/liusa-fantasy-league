export const positiveEvents = [
  { id: 'wins_li',          label: 'Wins Love Island',                    points: 50 },
  { id: 'makes_finale',     label: 'Makes Finale',                        points: 30 },
  { id: 'makes_casa_amor',  label: 'Makes Casa Amor',                     points: 25 },
  { id: 'coupled_casa',     label: 'Coupled Up After Casa Amor',          points: 20 },
  { id: 'wins_challenge',   label: 'Wins Villa Challenge',                points: 20 },
  { id: 'says_ily',         label: "Says 'I love you'",                   points: 20 },
  { id: 'wins_fan_vote',    label: 'Wins Individual Fan Vote',            points: 15 },
  { id: 'coupled_recouple', label: 'Coupled Up at Recoupling',            points: 15 },
  { id: 'exclusive',        label: 'Becomes Exclusive',                   points: 15 },
  { id: 'xxx',              label: 'Sex',                                 points: 20 },
  { id: 'hideaway',         label: 'Shares Hideaway',                     points: 10 },
  { id: 'sleeps_loyal',     label: 'Sleeps Outside to Stay Loyal',        points: 10 },
  { id: 'kiss_casa',        label: 'Kiss During Casa Amor',               points: 10 },
  { id: 'kiss',             label: 'Kiss (Outside of Challenge)',          points: 5  },
  { id: 'date_reward',      label: 'Wins Date Reward',                    points: 5  },
  { id: 'bombshell_date',   label: 'Chosen for Bombshell Date',           points: 5  },
  { id: 'survives_dumping', label: 'Survives Dumping (Chosen by Islanders)', points: 5 },
]

export const negativeEvents = [
  { id: 'exposed',          label: 'Exposed in Movie Night/Challenge/Game', points: -5  },
  { id: 'cries',            label: 'Cries (sad)',                           points: -5  },
  { id: 'crashes_out',      label: 'Crashes Out',                           points: -10 },
  { id: 'single_recouple',  label: 'Single at Recoupling',                  points: -10 },
  { id: 'single_casa',      label: 'Single after Casa Amor',                points: -15 },
  { id: 'dumped',           label: 'Dumped from Island',                    points: -20 },
  { id: 'walks',            label: 'Walks Voluntarily',                     points: -25 },
  { id: 'allegation',       label: 'Racism/Anti Allegation',                points: -30 },
]

export const bonusEvents = [
  { id: 'funniest',      label: 'Funniest Islander',  points: 5 },
  { id: 'messiest',      label: 'Messiest Islander',  points: 5 },
  { id: 'finest',        label: 'Finest Islander',    points: 5 },
  { id: 'best_couple',   label: 'Best Couple',        points: 5 },
  { id: 'toxic_couple',  label: 'Most Toxic Couple',  points: 5 },
]

export const allEvents = [...positiveEvents, ...negativeEvents, ...bonusEvents]
