// Test the seeded draw logic
const seed = 452866.441095314;
const players = ['TestHost', 'Sarah', 'Tom', 'Emma', 'James', 'Olivia', 'Noah', 'Ava', 'Liam', 'Sophia'];

// Mulberry32 PRNG
function mulberry32(a) {
  return function() {
    let t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// Fisher-Yates shuffle with seed
function seededShuffle(seed, array) {
  const rng = mulberry32(seed);
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// World Cup 2026 teams with odds
const WORLD_CUP_2026_TEAMS = [
  { name: 'Spain', odds: '4/1' },
  { name: 'France', odds: '9/2' },
  { name: 'England', odds: '11/2' },
  { name: 'Brazil', odds: '8/1' },
  { name: 'Argentina', odds: '17/2' },
  { name: 'Germany', odds: '14/1' },
  { name: 'Portugal', odds: '18/1' },
  { name: 'Netherlands', odds: '18/1' },
  { name: 'Italy', odds: '22/1' },
  { name: 'Belgium', odds: '28/1' },
  { name: 'Uruguay', odds: '33/1' },
  { name: 'Japan', odds: '40/1' },
  { name: 'Switzerland', odds: '40/1' },
  { name: 'USA', odds: '40/1' },
  { name: 'Mexico', odds: '50/1' },
  { name: 'Senegal', odds: '50/1' },
  { name: 'Denmark', odds: '66/1' },
  { name: 'Croatia', odds: '66/1' },
  { name: 'Morocco', odds: '80/1' },
  { name: 'Australia', odds: '80/1' },
  { name: 'Colombia', odds: '80/1' },
  { name: 'Canada', odds: '100/1' },
  { name: 'Serbia', odds: '100/1' },
  { name: 'Iran', odds: '100/1' },
  { name: 'Ukraine', odds: '120/1' },
  { name: 'South Korea', odds: '120/1' },
  { name: 'Saudi Arabia', odds: '150/1' },
  { name: 'Ecuador', odds: '150/1' },
  { name: 'Chile', odds: '150/1' },
  { name: 'Austria', odds: '200/1' },
  { name: 'Tunisia', odds: '200/1' },
  { name: 'Poland', odds: '250/1' },
  { name: 'Qatar', odds: '250/1' },
  { name: 'Ghana', odds: '250/1' },
  { name: 'Cameroon', odds: '333/1' },
  { name: 'Costa Rica', odds: '333/1' },
  { name: 'Peru', odds: '400/1' },
  { name: 'Nigeria', odds: '400/1' },
  { name: 'Republic of Ireland', odds: '400/1' },
  { name: 'Paraguay', odds: '500/1' },
  { name: 'Jamaica', odds: '500/1' },
  { name: 'Vietnam', odds: '666/1' },
  { name: 'Kazakhstan', odds: '666/1' },
  { name: 'Honduras', odds: '1000/1' },
  { name: 'Cape Verde', odds: '1000/1' },
  { name: 'Panama', odds: '1000/1' },
  { name: 'Guatemala', odds: '2000/1' },
  { name: 'Zambia', odds: '2000/1' },
  { name: 'Liechtenstein', odds: '5000/1' },
];

// Parse odds for sorting
function parseOdds(oddsStr) {
  if (oddsStr.includes('/')) {
    const [num, denom] = oddsStr.split('/').map(Number);
    return num / denom;
  }
  return parseFloat(oddsStr);
}

// Sort by odds and divide into tiers
const sortedTeams = [...WORLD_CUP_2026_TEAMS].sort((a, b) => parseOdds(a.odds) - parseOdds(b.odds));
const tier1 = sortedTeams.slice(0, 12);
const tier2 = sortedTeams.slice(12, 24);
const tier3 = sortedTeams.slice(24, 36);
const tier4 = sortedTeams.slice(36, 48);

console.log('Tier 1 (favorites):', tier1.map(t => t.name).join(', '));
console.log('Tier 2:', tier2.map(t => t.name).join(', '));
console.log('Tier 3:', tier3.map(t => t.name).join(', '));
console.log('Tier 4 (longshots):', tier4.map(t => t.name).join(', '));

// Shuffle each tier
const shuffledTier1 = seededShuffle(Math.floor(seed * 1000), tier1);
const shuffledTier2 = seededShuffle(Math.floor(seed * 1001), tier2);
const shuffledTier3 = seededShuffle(Math.floor(seed * 1002), tier3);
const shuffledTier4 = seededShuffle(Math.floor(seed * 1003), tier4);

// Create position arrays for each tier (every 4th position)
const tier1Positions = [0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44];
const tier2Positions = [1, 5, 9, 13, 17, 21, 25, 29, 33, 37, 41, 45];
const tier3Positions = [2, 6, 10, 14, 18, 22, 26, 30, 34, 38, 42, 46];
const tier4Positions = [3, 7, 11, 15, 19, 23, 27, 31, 35, 39, 43, 47];

// Shuffle positions within each tier
const shuffledTier1Pos = seededShuffle(Math.floor(seed * 2000), tier1Positions);
const shuffledTier2Pos = seededShuffle(Math.floor(seed * 2001), tier2Positions);
const shuffledTier3Pos = seededShuffle(Math.floor(seed * 2002), tier3Positions);
const shuffledTier4Pos = seededShuffle(Math.floor(seed * 2003), tier4Positions);

console.log('\nShuffled tier 1 positions:', shuffledTier1Pos);
console.log('Shuffled tier 2 positions:', shuffledTier2Pos);
console.log('Shuffled tier 3 positions:', shuffledTier3Pos);
console.log('Shuffled tier 4 positions:', shuffledTier4Pos);

// Build interleaved array with shuffled positions
const interleavedTeams = new Array(48);
shuffledTier1Pos.forEach((pos, i) => interleavedTeams[pos] = shuffledTier1[i]);
shuffledTier2Pos.forEach((pos, i) => interleavedTeams[pos] = shuffledTier2[i]);
shuffledTier3Pos.forEach((pos, i) => interleavedTeams[pos] = shuffledTier3[i]);
shuffledTier4Pos.forEach((pos, i) => interleavedTeams[pos] = shuffledTier4[i]);

// Shuffle player order
const playerOrderSeed = Math.floor(seed * 7919) + 12345;
const shuffledPlayerNames = seededShuffle(playerOrderSeed, players);

console.log('\nShuffled player order:', shuffledPlayerNames);

// Create reveal queue: round-robin assignment using shuffled player order
const revealQueue = [];
const numPlayers = shuffledPlayerNames.length;
for (let i = 0; i < 48; i++) {
  const playerIdx = i % numPlayers;
  revealQueue.push({
    playerName: shuffledPlayerNames[playerIdx],
    team: interleavedTeams[i],
  });
}

// Group by player
const playerTeams = {};
for (const item of revealQueue) {
  if (!playerTeams[item.playerName]) playerTeams[item.playerName] = [];
  playerTeams[item.playerName].push(item.team.name);
}

console.log('\n=== FINAL ASSIGNMENTS ===');
for (const [player, teams] of Object.entries(playerTeams)) {
  console.log(`${player}: ${teams.join(', ')}`);
}

console.log('\n=== TIER DISTRIBUTION CHECK ===');
const tierNames1 = new Set(tier1.map(t => t.name));
const tierNames2 = new Set(tier2.map(t => t.name));
const tierNames3 = new Set(tier3.map(t => t.name));
const tierNames4 = new Set(tier4.map(t => t.name));

for (const [player, teams] of Object.entries(playerTeams)) {
  const t1 = teams.filter(t => tierNames1.has(t)).length;
  const t2 = teams.filter(t => tierNames2.has(t)).length;
  const t3 = teams.filter(t => tierNames3.has(t)).length;
  const t4 = teams.filter(t => tierNames4.has(t)).length;
  console.log(`${player}: T1=${t1}, T2=${t2}, T3=${t3}, T4=${t4}`);
}
