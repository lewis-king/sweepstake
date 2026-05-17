const BASE_URL = 'https://worldcupsweepstake.app';

async function createRoom(name: string) {
  const hostId = `test-${Date.now()}`;
  const res = await fetch(`${BASE_URL}/api/room`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ hostId, playerName: name, targetPlayers: null }),
  });
  return res.json();
}

async function joinRoom(roomId: string, name: string) {
  const deviceId = `test-device-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const res = await fetch(`${BASE_URL}/api/room/${roomId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerName: name, deviceId }),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error(`Join failed for ${name}: ${text}`);
    return null;
  }
  return res.json();
}

async function main() {
  console.log('Creating room...');
  const room = await createRoom('Lewis');
  console.log('Room created:', room.roomCode);
  console.log('Room ID:', room.sessionId);
  
  const testPlayers = [
    'Marcus',
    'Priya',
    'James',
    'Aisha',
    'Diego',
    'Yuki',
    'Emma',
    'Kwame',
    'Sofia'
  ];
  
  console.log(`\nJoining ${testPlayers.length} test players...`);
  for (const player of testPlayers) {
    await joinRoom(room.sessionId, player);
    console.log(`  ✓ ${player} joined`);
  }
  
  const verify = await fetch(`${BASE_URL}/api/room/${room.sessionId}`);
  const data = await verify.json();
  
  console.log('\n=== ROOM STATUS ===');
  console.log(`Room Code: ${data.room_code}`);
  console.log(`Host: Lewis`);
  console.log(`Players: ${data.players?.length || 0}`);
  console.log('\nPlayer list:');
  data.players?.forEach((p: any, i: number) => {
    console.log(`  ${i + 1}. ${p.name}`);
  });
  
  console.log('\n📱 Share this with Lewis to join and watch:');
  console.log(`   Room Code: ${data.room_code}`);
  console.log(`   URL: ${BASE_URL}?room=${data.room_code}`);
}

main().catch(console.error);
