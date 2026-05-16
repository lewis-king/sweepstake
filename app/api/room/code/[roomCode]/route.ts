import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomCode: string }> }
) {
  try {
    const { roomCode } = await params;
    
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("*")
      .eq("room_code", roomCode)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const { data: players } = await supabase
      .from("players")
      .select("*")
      .eq("session_id", session.id)
      .order("joined_at", { ascending: true });

    return NextResponse.json({
      roomId: session.id,
      roomCode: session.room_code,
      targetPlayers: session.target_players,
      status: session.status,
      players: players || [],
    });
  } catch (error) {
    console.error("Error fetching room by code:", error);
    return NextResponse.json({ error: "Failed to fetch room" }, { status: 500 });
  }
}
