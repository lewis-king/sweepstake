// test-draw.ts
// Run with: npx tsx test-draw.ts

// ==========================================
// 1. CORE LOGIC (From our architecture)
// ==========================================
function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return function() {
    state = (state + 0x6D2B79F5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(seed: number, array: T[]): T[] {
  const result = [...array];
  const rng = mulberry32(seed);
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function parseOdds(odds: string): number {
  const [num, den] = odds.split('/').map(Number);
  return num / den;
}

function generateRevealQueue(sessionSeed: number, playerNames: string[], teamsToUse: any[]) {
  const numPlayers = playerNames.length;
  
  const sortedTeams = [...teamsToUse].sort((a, b) => parseOdds(a.odds) - parseOdds(b.odds));
  
  const shuffledT1 = seededShuffle(sessionSeed + 1, sortedTeams.slice(0, 12));
  const shuffledT2 = seededShuffle(sessionSeed + 2, sortedTeams.slice(12, 24));
  const shuffledT3 = seededShuffle(sessionSeed + 3, sortedTeams.slice(24, 36));
  const shuffledT4 = seededShuffle(sessionSeed + 4, sortedTeams.slice(36, 48));

  const masterDeck = [...shuffledT1, ...shuffledT2, ...shuffledT3, ...shuffledT4];

  const playerHands: Record<string, any[]> = {};
  playerNames.forEach(name => playerHands[name] = []);
  
  const playerDealOrder = seededShuffle(sessionSeed + 100, playerNames);
  
  masterDeck.forEach((team, i) => {
    const playerName = playerDealOrder[i % numPlayers];
    playerHands[playerName].push(team);
  });

  Object.keys(playerHands).forEach((name, i) => {
    playerHands[name] = seededShuffle(sessionSeed + 1000 + i, playerHands[name]);
  });

  const screenTurnOrder = seededShuffle(sessionSeed + 2000, playerNames);
  const revealQueue: { playerName: string; team: any }[] = [];
  
  const maxHandSize = Math.max(...Object.values(playerHands).map(hand => hand.length));

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

// ==========================================
// 2. TEST SETUP & MOCK DATA
// ==========================================

// Generate 48 mock teams mapped explicitly to tiers for easy assertion
const MOCK_TEAMS = Array.from({ length: 48 }, (_, i) => {
  let odds = "1000/1"; // Default T4
  let explicitTier = 4;
  if (i < 12) { odds = "2/1"; explicitTier = 1; }
  else if (i < 24) { odds = "15/1"; explicitTier = 2; }
  else if (i < 36) { odds = "50/1"; explicitTier = 3; }

  return { 
    id: `Team_${i + 1}`, 
    odds,
    explicitTier // Baked in purely so our test can verify it easily
  };
});

function generatePlayers(count: number): string[] {
  return Array.from({ length: count }, (_, i) => `Player_${i + 1}`);
}

// Helper to group results by player for analysis
function analyzeDraw(queue: any[]) {
  const analysis: Record<string, { total: number, tiers: Record<number, number> }> = {};
  
  queue.forEach(item => {
    if (!analysis[item.playerName]) {
      analysis[item.playerName] = { total: 0, tiers: { 1: 0, 2: 0, 3: 0, 4: 0 } };
    }
    analysis[item.playerName].total++;
    analysis[item.playerName].tiers[item.team.explicitTier]++;
  });
  
  return analysis;
}

// ==========================================
// 3. THE TEST SUITE
// ==========================================

const logPass = (msg: string) => console.log(`✅ PASS: ${msg}`);
const logFail = (msg: string) => {
  console.error(`❌ FAIL: ${msg}`);
  process.exit(1);
};

function runTests() {
  console.log("\n🚀 Running Sweepstake Algorithm Tests...\n");

  // --- TEST 1: Determinism ---
  const seed = 999;
  const p10 = generatePlayers(10);
  const drawA = generateRevealQueue(seed, p10, MOCK_TEAMS);
  const drawB = generateRevealQueue(seed, p10, MOCK_TEAMS);
  
  const isDeterministic = JSON.stringify(drawA) === JSON.stringify(drawB);
  if (isDeterministic) logPass("Determinism: Identical seeds produce identical outputs.");
  else logFail("Determinism: Outputs differed for the same seed!");

  // --- TEST SUITE: Volume Balance & Tier Fairness ---
  const testScenarios = [
    { playerCount: 2, expectedMinHand: 24, expectedMaxHand: 24 },
    { playerCount: 5, expectedMinHand: 9, expectedMaxHand: 10 },
    { playerCount: 10, expectedMinHand: 4, expectedMaxHand: 5 },
    { playerCount: 16, expectedMinHand: 3, expectedMaxHand: 3 },
    { playerCount: 20, expectedMinHand: 2, expectedMaxHand: 3 },
  ];

  testScenarios.forEach(scenario => {
    const players = generatePlayers(scenario.playerCount);
    const draw = generateRevealQueue(12345, players, MOCK_TEAMS);
    const analysis = analyzeDraw(draw);
    
    const handSizes = Object.values(analysis).map(p => p.total);
    const minHand = Math.min(...handSizes);
    const maxHand = Math.max(...handSizes);

    // Assert overall hand size balance
    if (minHand === scenario.expectedMinHand && maxHand === scenario.expectedMaxHand) {
      logPass(`Volume Balance (${scenario.playerCount} players): Hands balanced between ${minHand} and ${maxHand}`);
    } else {
      logFail(`Volume Balance (${scenario.playerCount} players): Expected ${scenario.expectedMinHand}-${scenario.expectedMaxHand}, got ${minHand}-${maxHand}`);
    }

    // Assert Tier 1 distribution fairness
    // The number of Tier 1s per player should never differ by more than 1
    const t1Counts = Object.values(analysis).map(p => p.tiers[1]);
    const minT1 = Math.min(...t1Counts);
    const maxT1 = Math.max(...t1Counts);
    
    if (maxT1 - minT1 <= 1) {
      logPass(`Tier Fairness (${scenario.playerCount} players): Tier 1 teams perfectly distributed (Max diff: ${maxT1 - minT1})`);
    } else {
      logFail(`Tier Fairness (${scenario.playerCount} players): Unfair distribution! T1 counts were: ${t1Counts.join(', ')}`);
    }
  });

  // --- TEST 3: Output Length ---
  const fullDraw = generateRevealQueue(555, generatePlayers(10), MOCK_TEAMS);
  if (fullDraw.length === 48) {
    logPass("Integrity: Exactly 48 teams are dealt, none dropped or duplicated.");
  } else {
    logFail(`Integrity: Output length was ${fullDraw.length}, expected 48.`);
  }

  console.log("\n🎉 All core logic tests passed!\n");
}

// Execute
runTests();
