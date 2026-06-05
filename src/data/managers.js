export const managers = [
  // ── Villa League ──────────────────────────────────────────
  { id: 1,  name: 'Andrea',    league: 'villa', color: '#FF6B6B', photo: '/managers/andrea.png'    },
  { id: 2,  name: 'Anjali',    league: 'villa', color: '#FF8E53', photo: '/managers/anjali.png'    },
  { id: 3,  name: 'Asha',      league: 'villa', color: '#FFC947', photo: '/managers/asha.png'      },
  { id: 4,  name: 'Chichi',    league: 'villa', color: '#FF6BAE', photo: '/managers/chichi.png'    },
  { id: 5,  name: 'Kroix',     league: 'villa', color: '#DA77F2', photo: '/managers/kroix.png'     },
  { id: 6,  name: 'Lily',      league: 'villa', color: '#7B68EE', photo: '/managers/lily.png'      },
  { id: 7,  name: 'Makena',    league: 'villa', color: '#48C9B0', photo: '/managers/makena.png'    },
  { id: 8,  name: 'Melody',    league: 'villa', color: '#45B7D1', photo: '/managers/melody.png'    },
  { id: 9,  name: 'Nadia',     league: 'villa', color: '#96CEB4', photo: '/managers/nadia.png'     },
  { id: 10, name: 'Sam',       league: 'villa', color: '#F0A500', photo: '/managers/sam.png'       },
  { id: 11, name: 'Saniya',    league: 'villa', color: '#DDA0DD', photo: '/managers/saniya.png'    },
  { id: 12, name: 'Somnia',    league: 'villa', color: '#82C341', photo: '/managers/somnia.png'    },
  { id: 13, name: 'Srina',     league: 'villa', color: '#FF1B8D', photo: '/managers/srina.png',    isHost: true },
  { id: 14, name: 'Sydney B.', league: 'villa', color: '#87CEEB', photo: '/managers/sydney b.png'  },
  { id: 15, name: 'Sydney W.', league: 'villa', color: '#FFB347', photo: '/managers/sydney w.png'  },

  // ── Casa League ───────────────────────────────────────────
  { id: 16, name: 'Amanda',    league: 'casa',  color: '#E53935', photo: '/managers/amanda.png'    },
  { id: 17, name: 'Anne',      league: 'casa',  color: '#1E88E5', photo: '/managers/anne.png'      },
  { id: 18, name: 'Christie',  league: 'casa',  color: '#00897B', photo: '/managers/christie.png'  },
  { id: 19, name: 'Eleonore',  league: 'casa',  color: '#8E24AA', photo: '/managers/eleonore.png'  },
  { id: 20, name: 'Ellana',    league: 'casa',  color: '#039BE5', photo: '/managers/ellana.png'    },
  { id: 21, name: 'Jessica',   league: 'casa',  color: '#F4511E', photo: '/managers/jessica.png'   },
  { id: 22, name: 'Kaylee',    league: 'casa',  color: '#43A047', photo: '/managers/kaylee.png'    },
  { id: 23, name: 'Lauryn',    league: 'casa',  color: '#FB8C00', photo: '/managers/lauryn.png'    },
  { id: 24, name: 'Lesley',    league: 'casa',  color: '#6D4C41', photo: '/managers/lesley.png'    },
  { id: 25, name: 'Saron',     league: 'casa',  color: '#00ACC1', photo: '/managers/saron.png'     },
  { id: 26, name: 'Sharon',    league: 'casa',  color: '#D81B60', photo: '/managers/sharon.png'    },
  { id: 27, name: 'Sierra',    league: 'casa',  color: '#546E7A', photo: '/managers/sierra.png'    },
  // Srina appears in both leagues as host, with a separate store key so picks/points are independent
  { id: 29, name: 'Srina',     league: 'casa',  color: '#FF1B8D', photo: '/managers/srina.png',    isHost: true, storeKey: 'Srina_Casa' },
  { id: 28, name: 'Zina',      league: 'casa',  color: '#558B2F', photo: '/managers/zina.png'      },
]

// Returns the key used for store lookups (picks, scores, adjustments)
export function mgrKey(m) { return m.storeKey ?? m.name }

export const villaManagers = managers.filter(m => m.league === 'villa')
export const casaManagers  = managers.filter(m => m.league === 'casa')
