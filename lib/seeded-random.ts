// Mulberry32 - A fast, lightweight seeded PRNG
// Produces deterministic sequences from a seed value
// Perfect for synchronizing draws across multiple clients

export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  
  return function() {
    state |= 0;
    state = state + 0x6D2B79F5 | 0;
    let t = Math.imul(state ^ state >>> 15, 1 | state);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// Get a seeded random in range [min, max)
export function seededRandomInRange(seed: number, min: number, max: number): number {
  const rng = mulberry32(seed);
  return Math.floor(rng() * (max - min)) + min;
}

// Fisher-Yates shuffle with seed - returns shuffled array
export function seededShuffle<T>(seed: number, array: T[]): T[] {
  const result = [...array];
  const rng = mulberry32(seed);
  
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  
  return result;
}

// Pick n random items from array using seed
export function seededPick<T>(seed: number, array: T[], n: number): T[] {
  const shuffled = seededShuffle(seed, array);
  return shuffled.slice(0, Math.min(n, shuffled.length));
}

// Pick single item from array using seed
export function seededPickOne<T>(seed: number, array: T[]): T {
  const index = Math.floor(mulberry32(seed)() * array.length);
  return array[index];
}

// Generate a sequence of n seeds from a base seed
export function deriveSeeds(baseSeed: number, count: number): number[] {
  const seeds: number[] = [];
  const rng = mulberry32(baseSeed);
  
  for (let i = 0; i < count; i++) {
    seeds.push(Math.floor(rng() * 1000000000));
  }
  
  return seeds;
}

// 2026 World Cup participating nations (48 teams) with odds
export const WORLD_CUP_2026_TEAMS = [
  { code: "ESP", name: "Spain", flag: "🇪🇸", odds: "4/1" },
  { code: "FRA", name: "France", flag: "🇫🇷", odds: "9/2" },
  { code: "ENG", name: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", odds: "11/2" },
  { code: "BRA", name: "Brazil", flag: "🇧🇷", odds: "8/1" },
  { code: "ARG", name: "Argentina", flag: "🇦🇷", odds: "17/2" },
  { code: "GER", name: "Germany", flag: "🇩🇪", odds: "11/1" },
  { code: "POR", name: "Portugal", flag: "🇵🇹", odds: "11/1" },
  { code: "NED", name: "Netherlands", flag: "🇳🇱", odds: "18/1" },
  { code: "NOR", name: "Norway", flag: "🇳🇴", odds: "22/1" },
  { code: "BEL", name: "Belgium", flag: "🇧🇪", odds: "22/1" },
  { code: "COL", name: "Colombia", flag: "🇨🇴", odds: "40/1" },
  { code: "MAR", name: "Morocco", flag: "🇲🇦", odds: "40/1" },
  { code: "JPN", name: "Japan", flag: "🇯🇵", odds: "50/1" },
  { code: "USA", name: "United States", flag: "🇺🇸", odds: "50/1" },
  { code: "MEX", name: "Mexico", flag: "🇲🇽", odds: "66/1" },
  { code: "SUI", name: "Switzerland", flag: "🇨🇭", odds: "66/1" },
  { code: "URU", name: "Uruguay", flag: "🇺🇾", odds: "66/1" },
  { code: "SWE", name: "Sweden", flag: "🇸🇪", odds: "100/1" },
  { code: "SEN", name: "Senegal", flag: "🇸🇳", odds: "100/1" },
  { code: "ECU", name: "Ecuador", flag: "🇪🇨", odds: "100/1" },
  { code: "CRO", name: "Croatia", flag: "🇭🇷", odds: "100/1" },
  { code: "TUR", name: "Türkiye", flag: "🇹🇷", odds: "125/1" },
  { code: "AUT", name: "Austria", flag: "🇦🇹", odds: "150/1" },
  { code: "PAR", name: "Paraguay", flag: "🇵🇾", odds: "150/1" },
  { code: "SCO", name: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", odds: "250/1" },
  { code: "CAN", name: "Canada", flag: "🇨🇦", odds: "250/1" },
  { code: "GHA", name: "Ghana", flag: "🇬🇭", odds: "300/1" },
  { code: "CIV", name: "Ivory Coast", flag: "🇨🇮", odds: "300/1" },
  { code: "EGY", name: "Egypt", flag: "🇪🇬", odds: "300/1" },
  { code: "ALG", name: "Algeria", flag: "🇩🇿", odds: "300/1" },
  { code: "CZE", name: "Czechia", flag: "🇨🇿", odds: "300/1" },
  { code: "IRN", name: "Iran", flag: "🇮🇷", odds: "500/1" },
  { code: "TUN", name: "Tunisia", flag: "🇹🇳", odds: "500/1" },
  { code: "KOR", name: "South Korea", flag: "🇰🇷", odds: "500/1" },
  { code: "AUS", name: "Australia", flag: "🇦🇺", odds: "500/1" },
  { code: "COD", name: "DR Congo", flag: "🇨🇩", odds: "500/1" },
  { code: "BIH", name: "Bosnia & Herzegovina", flag: "🇧🇦", odds: "500/1" },
  { code: "KSA", name: "Saudi Arabia", flag: "🇸🇦", odds: "1000/1" },
  { code: "NZL", name: "New Zealand", flag: "🇳🇿", odds: "1000/1" },
  { code: "QAT", name: "Qatar", flag: "🇶🇦", odds: "1000/1" },
  { code: "CPV", name: "Cape Verde", flag: "🇨🇻", odds: "1000/1" },
  { code: "CUW", name: "Curacao", flag: "🇨🇼", odds: "1000/1" },
  { code: "HAI", name: "Haiti", flag: "🇭🇹", odds: "1000/1" },
  { code: "IRQ", name: "Iraq", flag: "🇮🇶", odds: "1000/1" },
  { code: "JOR", name: "Jordan", flag: "🇯🇴", odds: "1000/1" },
  { code: "PAN", name: "Panama", flag: "🇵🇦", odds: "1000/1" },
  { code: "UZB", name: "Uzbekistan", flag: "🇺🇿", odds: "1000/1" },
  { code: "RSA", name: "South Africa", flag: "🇿🇦", odds: "1000/1" },
];

// Get a fun adjective based on odds
export function getTeamAdjective(odds: string): string {
  const [numerator] = odds.split('/').map(Number);
  
  if (numerator <= 4) return "CHAMPION-LEVEL";
  if (numerator <= 9) return "CUP-CONTENDER";
  if (numerator <= 17) return "DANGEROUS DARK HORSE";
  if (numerator <= 22) return "SERIOUS THREAT";
  if (numerator <= 40) return "UPSET SPECIALISTS";
  if (numerator <= 66) return "SLEEPERS ALERT";
  if (numerator <= 100) return "WILD CARDS";
  if (numerator <= 300) return "LONGSHOT LEGENDS";
  if (numerator <= 500) return "FAIRYTALE CANDIDATES";
  return "LOTTERY TICKET";
}

// Parse odds string like "4/1" into a number for sorting
export function parseOdds(odds: string): number {
  const parts = odds.split('/');
  return parseFloat(parts[0]) / parseFloat(parts[1]);
}

// Perform the deterministic team assignment
// Takes session seed and array of player names, returns player-team pairs (one per player)
export function performDeterministicDraw(
  sessionSeed: number,
  playerNames: string[]
): { playerName: string; team: typeof WORLD_CUP_2026_TEAMS[0] }[] {
  // Shuffle teams using session seed
  const shuffledTeams = seededShuffle(Math.floor(sessionSeed * 1000), WORLD_CUP_2026_TEAMS);
  
  // Derive a secondary seed for player order shuffling
  const playerOrderSeed = Math.floor(sessionSeed * 7919) + 12345;
  
  // Create indexed players and shuffle by order seed
  const indexedPlayers = playerNames.map((name, index) => ({ name, originalIndex: index }));
  const shuffledPlayers = seededShuffle(playerOrderSeed, indexedPlayers);
  
  // Assign teams in order
  return shuffledPlayers.map((player, index) => ({
    playerName: player.name,
    team: shuffledTeams[index % shuffledTeams.length],
  }));
}

// Generate the full reveal queue for the sweepstake
// Uses tiered distribution for fairness - each player gets similar quality teams
// Prevents one player getting all favorites while another gets all longshots
export function generateRevealQueue(
  sessionSeed: number,
  playerNames: string[]
): { playerName: string; team: typeof WORLD_CUP_2026_TEAMS[0] }[] {
  const numPlayers = playerNames.length;
  
  // 1. Tiering Teams by Odds
  const sortedTeams = [...WORLD_CUP_2026_TEAMS].sort(
    (a, b) => parseOdds(a.odds) - parseOdds(b.odds)
  );
  
  // 2. Shuffle each tier independently to ensure randomness within the tier
  const shuffledT1 = seededShuffle(sessionSeed + 1, sortedTeams.slice(0, 12));
  const shuffledT2 = seededShuffle(sessionSeed + 2, sortedTeams.slice(12, 24));
  const shuffledT3 = seededShuffle(sessionSeed + 3, sortedTeams.slice(24, 36));
  const shuffledT4 = seededShuffle(sessionSeed + 4, sortedTeams.slice(36, 48));

  // 3. Create the Master Deck (Heavy hitters on top, longshots on bottom)
  const masterDeck = [...shuffledT1, ...shuffledT2, ...shuffledT3, ...shuffledT4];

  // 4. Deal the cards fairly into Player Hands
  const playerHands: Record<string, typeof WORLD_CUP_2026_TEAMS[0][]> = {};
  playerNames.forEach(name => playerHands[name] = []);
  
  // Shuffle the player order so the "first pick" advantage is random
  const playerDealOrder = seededShuffle(sessionSeed + 100, playerNames);
  
  masterDeck.forEach((team, i) => {
    // Continuous round-robin distribution guarantees max variance between players is never > 1
    const playerName = playerDealOrder[i % numPlayers];
    playerHands[playerName].push(team);
  });

  // 5. The Suspense Shuffle
  // Shuffle each player's individual hand so they don't know the order their teams will be revealed
  Object.keys(playerHands).forEach((name, i) => {
    playerHands[name] = seededShuffle(sessionSeed + 1000 + i, playerHands[name]);
  });

  // 6. Construct the Round-Robin Reveal
  // Establish the fixed turn order for the TV/Mobile screen
  const screenTurnOrder = seededShuffle(sessionSeed + 2000, playerNames);
  const revealQueue: { playerName: string; team: typeof WORLD_CUP_2026_TEAMS[0] }[] = [];
  
  const maxHandSize = Math.max(...Object.values(playerHands).map(hand => hand.length));

  // Loop through rounds, pulling one card from each player's hand per rotation
  for (let round = 0; round < maxHandSize; round++) {
    screenTurnOrder.forEach(playerName => {
      if (playerHands[playerName][round]) {
        revealQueue.push({
          playerName,
          team: playerHands[playerName][round]
        });
      }
    });
  }

  return revealQueue;
}

// Check if team is top 5 favorite by odds
export function isTop5Team(teamName: string): boolean {
  const sorted = [...WORLD_CUP_2026_TEAMS].sort((a, b) => parseOdds(a.odds) - parseOdds(b.odds));
  const top5 = sorted.slice(0, 5).map(t => t.name);
  return top5.includes(teamName);
}

// Generate final results grouped by player, sorted by odds (best first)
export function generateFinalResults(
  sessionSeed: number,
  playerNames: string[]
): { playerName: string; teams: typeof WORLD_CUP_2026_TEAMS[0][] }[] {
  const revealQueue = generateRevealQueue(sessionSeed, playerNames);
  
  // Group teams by player
  const playerTeams: Record<string, typeof WORLD_CUP_2026_TEAMS[0][]> = {};
  
  for (const assignment of revealQueue) {
    if (!playerTeams[assignment.playerName]) {
      playerTeams[assignment.playerName] = [];
    }
    playerTeams[assignment.playerName].push(assignment.team);
  }
  
  // Convert to array and sort teams by odds (best/lowest first)
  const results = Object.entries(playerTeams).map(([playerName, teams]) => ({
    playerName,
    teams: teams.sort((a, b) => parseOdds(a.odds) - parseOdds(b.odds)),
  }));
  
  // Sort players by their best odds
  return results.sort((a, b) => parseOdds(a.teams[0].odds) - parseOdds(b.teams[0].odds));
}

// Verify a draw result (client-side validation)
export function verifyDraw(
  sessionSeed: number,
  playerNames: string[],
  claimedAssignments: Record<string, string>
): boolean {
  const expected = performDeterministicDraw(sessionSeed, playerNames);
  
  for (const assignment of expected) {
    const claimed = claimedAssignments[assignment.playerName];
    if (claimed !== assignment.team.code) {
      return false;
    }
  }
  
  return true;
}
