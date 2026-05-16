import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-client";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const { playerName, teamName } = await request.json();

    if (!playerName || !teamName) {
      return NextResponse.json(
        { error: "Invalid parameters" },
        { status: 400 }
      );
    }

    // Find the player
    const { data: player, error: playerError } = await supabase
      .from("players")
      .select("*")
      .eq("name", playerName)
      .eq("session_id", roomId)
      .single();

    if (playerError || !player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    // Update the player's assigned team
    const { error: updateError } = await supabase
      .from("players")
      .update({ assigned_team: teamName })
      .eq("id", player.id);

    if (updateError) throw updateError;

    // Get updated session
    const { data: session } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", roomId)
      .single();

    const { data: players } = await supabase
      .from("players")
      .select("*")
      .eq("session_id", roomId)
      .order("joined_at", { ascending: true });

    return NextResponse.json({ session: { ...session, players: players || [] } });
  } catch (error) {
    console.error("Error assigning team:", error);
    return NextResponse.json({ error: "Failed to assign team" }, { status: 500 });
  }
}
