/**
 * MR.Play — dummy data for the "My Results" player dashboard.
 *
 * There is no backend, so every value here is a shared, static demo
 * dataset — the same for every visitor — EXCEPT the player's own display
 * name/avatar, which results.js pulls live from MRPlaySession (js/session.js)
 * instead of from anything in this file.
 *
 * This is explicitly NOT the research data collected during gameplay —
 * that stays private to paying research clients. Everything below stays
 * at the level of counts, categories, and general impact statements, not
 * fabricated findings.
 *
 * Loaded as a plain global (not an ES module) via <script src>, same as
 * games-data.js, so the site keeps working opened directly from disk
 * (file://). `gameId` fields below cross-reference MRPLAY_GAMES
 * (js/games-data.js) at render time in results.js, rather than repeating
 * game titles/thumbnails/urls here.
 */

var MRPLAY_PLAYER_STATS = {
  gamesPlayed: 4,
  totalPlayTime: '1h 12m',
  lastGamePlayed: 'Gravity Well',
  lastGamePlayedDate: 'Jul 20, 2026',
  currentStreak: 3
};

var MRPLAY_RECENT_RESULT = {
  gameId: 'gravity-well',
  score: 8420,
  rankLabel: 'Top 14% this month',
  keyDecisions: [
    'Sorted 14 brand pairs into Similar, Neutral, or Dissimilar',
    'Broke 3 close calls by instinct rather than overthinking',
    'Fastest ring launch: 0.8s'
  ],
  dateCompleted: 'July 20, 2026'
};

// Most recent first. status is 'completed' (Gravity Well, the only
// launchable game) or 'previewed' (the 3 in-development titles — you
// can't "complete" a game that isn't built yet, so no score/Replay).
var MRPLAY_GAME_HISTORY = [
  { gameId: 'gravity-well', status: 'completed', score: 8420, date: 'Jul 20, 2026' },
  { gameId: 'gravity-well', status: 'completed', score: 7150, date: 'Jul 16, 2026' },
  { gameId: 'breakfast-tycoon', status: 'previewed', score: null, date: 'Jul 14, 2026' },
  { gameId: 'gravity-well', status: 'completed', score: 9980, date: 'Jul 9, 2026' },
  { gameId: 'stormfront', status: 'previewed', score: null, date: 'Jul 5, 2026' },
  { gameId: 'gravity-well', status: 'completed', score: 6300, date: 'Jun 29, 2026' },
  { gameId: 'temple-trail', status: 'previewed', score: null, date: 'Jun 24, 2026' }
];

var MRPLAY_LEADERBOARDS = {
  overall: { rank: 812, total: 15406, label: 'Top 6%' },
  byGame: { gameId: 'gravity-well', rank: 96, total: 15406, label: 'Top 12%' },
  weekly: { rank: 54 },
  monthly: { rank: 128 },
  topPerformers: [
    { rank: 1, name: 'NovaSprinter', score: 12840 },
    { rank: 2, name: 'PixelPioneer', score: 12510 },
    { rank: 3, name: 'QuantumQuinn', score: 11990 },
    { rank: 4, name: 'DriftCipher', score: 11700 },
    { rank: 5, name: 'EchoRanger', score: 11455 }
  ],
  // "You" is inserted at render time by results.js using the real
  // session display name + this player's best score (9,980), not a
  // hardcoded name here.
  friends: [
    { rank: 1, name: 'NovaSprinter', score: 12840 },
    { rank: 2, name: 'you', score: 9980, isYou: true },
    { rank: 3, name: 'DriftCipher', score: 8890 },
    { rank: 4, name: 'QuantumQuinn', score: 7200 }
  ]
};

var MRPLAY_BADGES = [
  {
    id: 'first-game',
    title: 'First Game Completed',
    description: 'Complete your first MR.Play game.',
    unlocked: true,
    meta: 'Earned Jun 29, 2026'
  },
  {
    id: 'high-score',
    title: 'High-Score Milestone',
    description: 'Reach scoring milestones in a single game.',
    unlocked: true,
    meta: 'Bronze earned (best: 9,980) • Silver at 10,000'
  },
  {
    id: 'participation-streak',
    title: 'Participation Streak',
    description: 'Play on consecutive days to build a streak.',
    unlocked: true,
    meta: '3-day streak'
  },
  {
    id: 'games-explored',
    title: 'Games Explored',
    description: 'Preview every game in the library, including titles still in development.',
    unlocked: true,
    meta: '3 of 3 in-development titles previewed'
  },
  {
    id: 'consistency',
    title: 'Consistency Achievement',
    description: 'Keep a streak going for a full week.',
    unlocked: false,
    meta: 'Reach a 7-day streak to unlock'
  },
  {
    id: 'research-contribution',
    title: 'Research Contribution Milestone',
    description: 'Contribute gameplay sessions to active research.',
    unlocked: true,
    meta: 'Contributed to 4 research sessions'
  }
];

var MRPLAY_RESEARCH_CONTRIBUTION = {
  studiesContributed: 1,
  sessionsContributed: 4,
  activityGameId: 'gravity-well',
  impactStatement:
    'Every sort and ranking you made in Gravity Well became part of a real similarity-mapping study — combined with other players’ choices, never viewed individually.',
  participationHistory: ['Jul 20, 2026', 'Jul 16, 2026', 'Jul 9, 2026', 'Jun 29, 2026']
};
