// Test script to simulate 10 players joining and verify the draw

const fetch = require('node-fetch');

const ROOM_CODE = 'G56L4M';
const PLAYERS = [
  'Lewis', 'Sarah', 'Tom', 'Emma', 'James',
  'Olivia', 'Noah', 'Ava', 'Liam', 'Sophia'
];

async function main() {
  console.log('='.repeat(60));
  console.log('TESTING SWEEPSTAKE DRAW');
  console.log('='.repeat(60));
  console.log(`Room Code: ${ROOM_CODE}`);
  console.log(`Players: ${PLAYERS.join(', ')}`);
  console.log('');
  
  // Get room details (Lewis already joined)
  console.log('Step 1: Fetching room details...');
  const roomRes = await fetch(`http://localhost:3000/api/room/code/${ROOM_CODE}`);
  const roomData = await roomRes.json();
  console.log('Room found:', roomData.roomId);
  console.log('Current players:', roomData.players?.length || 0);
  console.log('');
  
  // Add remaining 9 players
  console.log('Step 2: Adding 9 more players...');
  for (const name of PLAYERS.slice(1)) {
    const res = await fetch(`http://localhost:3000/api/room/${roomData.roomId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, roomCode: ROOM_CODE })
    });
    const data = await res.json();
    if (data.error) {
      console.log(`  ❌ ${name}: ${data.error}`);
    } else {
      console.log(`  ✅ ${name} joined`);
    }
  }
  console.log('');
  
  // Fetch updated room
  const updatedRes = await fetch(`http://localhost:3000/api/room/${roomData.roomId}`);
  const updatedRoom = await updatedRes.json();
  console.log('Step 3: Verifying all players...');
  console.log(`Total players: ${updatedRoom.players?.length || 0}`);
  console.log('');
  
  // Start the draw
  console.log('Step 4: Starting draw...');
  const startRes = await fetch(`http://localhost:3000/api/room/${roomData.roomId}/assign`, {
    method: 'POST'
  });
  const startData = await startRes.json();
  console.log('Draw started:', startData);
  console.log('');
  
  // Poll for completion
  console.log('Step 5: Waiting for draw to complete...');
  let attempts = 0;
  while (attempts < 30) {
    await new Promise(r => setTimeout(r, 1000));
    const statusRes = await fetch(`http://localhost:3000/api/room/${roomData.roomId}`);
    const statusData = await statusRes.json();
    console.log(`  Status: ${statusData.status} (${attempts}s)`);
    if (statusData.status === 'COMPLETED') break;
    attempts++;
  }
  console.log('');
  
  // Get final results
  console.log('Step 6: Fetching final results...');
  const finalRes = await fetch(`http://localhost:3000/api/room/${roomData.roomId}`);
  const finalData = await finalRes.json();
  
  console.log('');
  console.log('='.repeat(60));
  console.log('FINAL RESULTS');
  console.log('='.repeat(60));
  
  if (finalData.players) {
    for (const player of finalData.players) {
      const team = player.assigned_team ? `${player.assigned_team} (${player.team?.name || 'N/A'})` : 'Not assigned yet';
      console.log(`  ${player.name}: ${team}`);
    }
  }
  
  console.log('');
  console.log('✅ Test complete!');
}

main().catch(console.error);
