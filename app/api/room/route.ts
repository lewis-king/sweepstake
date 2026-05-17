import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-client";
import { randomBytes } from "crypto";

function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars[randomBytes(1)[0] % chars.length];
  }
  return code;
}

async function generateUniqueRoomCode(): Promise<string> {
  let attempts = 0;
  while (attempts < 100) {
    const code = generateRoomCode();
    const { data: existing } = await supabase
      .from("sessions")
      .select("id")
      .eq("room_code", code)
      .single();
    if (!existing) return code;
    attempts++;
  }
  throw new Error("Failed to generate unique room code");
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hostId, targetPlayers, playerName } = body;

    if (!hostId) {
      return NextResponse.json(
        { error: "Invalid parameters. hostId is required" },
        { status: 400 }
      );
    }

    // Validate targetPlayers if provided
    if (targetPlayers !== undefined && targetPlayers !== null) {
      if (targetPlayers < 2 || targetPlayers > 48) {
        return NextResponse.json(
          { error: "Invalid parameters. targetPlayers must be between 2 and 48" },
          { status: 400 }
        );
      }
    }

    const roomCode = await generateUniqueRoomCode();
    const seed = Math.random() * 1000000;

    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .insert({
        room_code: roomCode,
        host_id: hostId,
        target_players: targetPlayers,
        seed: seed,
        status: "WAITING",
      })
      .select()
      .single();

    if (sessionError) throw sessionError;

    // Add host as first player if playerName provided
    if (playerName) {
      const { error: playerError } = await supabase.from("players").insert({
        session_id: session.id,
        name: playerName,
      });
      if (playerError) console.error("Error adding host player:", playerError);
    }

    // Fetch players for this session
    const { data: players } = await supabase
      .from("players")
      .select("*")
      .eq("session_id", session.id);

    return NextResponse.json({
      sessionId: session.id,
      roomCode: session.room_code,
      seed: session.seed,
      targetPlayers: session.target_players,
      status: session.status,
      players: players || [],
    });
  } catch (error) {
    console.error("Error creating room:", error);
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { data: rooms, error } = await supabase
      .from("sessions")
      .select("*, players(*)")
      .in("status", ["WAITING", "DRAWING"])
      .order("created_at", { ascending: false });

    if (error) throw error;

    return NextResponse.json({ rooms });
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return NextResponse.json({ error: "Failed to fetch rooms" }, { status: 500 });
  }
}
