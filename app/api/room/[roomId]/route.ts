import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase-client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    
    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", roomId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const { data: players } = await supabase
      .from("players")
      .select("*")
      .eq("session_id", roomId)
      .order("joined_at", { ascending: true });

    return NextResponse.json({ ...session, players: players || [] });
  } catch (error) {
    console.error("Error fetching room:", error);
    return NextResponse.json({ error: "Failed to fetch room" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const body = await request.json();
    const { playerName, deviceId } = body;

    if (!playerName || !deviceId) {
      return NextResponse.json(
        { error: "playerName and deviceId are required" },
        { status: 400 }
      );
    }

    const { data: session, error: sessionError } = await supabase
      .from("sessions")
      .select("*")
      .eq("id", roomId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    // Get all players in this room
    const { data: players } = await supabase
      .from("players")
      .select("*")
      .eq("session_id", roomId);

    // Check if this player already exists in the room - allow rejoin
    const existingPlayer = players?.find(
      (p) => p.name.toLowerCase() === playerName.toLowerCase()
    );

    if (existingPlayer) {
      // Player already exists - return their record (rejoin)
      return NextResponse.json(existingPlayer);
    }

    // New player - check if room is still accepting players
    if (session.status !== "WAITING") {
      return NextResponse.json(
        { error: "Room is no longer accepting players" },
        { status: 400 }
      );
    }

    // Only check if room is full if target_players is set and > 0
    if (session.target_players && session.target_players > 0) {
      if ((players || []).length >= session.target_players) {
        return NextResponse.json(
          { error: "Room is full" },
          { status: 400 }
        );
      }
    }

    // Hard limit: never more than 48 players (World Cup teams)
    if ((players || []).length >= 48) {
      return NextResponse.json(
        { error: "Room is full" },
        { status: 400 }
      );
    }

    // Insert new player
    const { data: player, error: playerError } = await supabase
      .from("players")
      .insert({
        session_id: roomId,
        name: playerName,
      })
      .select()
      .single();

    if (playerError) throw playerError;

    return NextResponse.json(player);
  } catch (error) {
    console.error("Error joining room:", error);
    return NextResponse.json({ error: "Failed to join room" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const body = await request.json();
    const { status, assignments } = body;

    const updateData: any = {};
    
    if (status && ["WAITING", "DRAWING", "COMPLETED"].includes(status)) {
      updateData.status = status;
    }

    if (assignments && Array.isArray(assignments)) {
      const updatePromises = assignments.map((assignment: any) =>
        supabase
          .from("players")
          .update({ assigned_team: assignment.team })
          .eq("id", assignment.playerId)
      );
      await Promise.all(updatePromises);
    }

    const { data: session, error } = await supabase
      .from("sessions")
      .update(updateData)
      .eq("id", roomId)
      .select()
      .single();

    if (error) throw error;

    const { data: players } = await supabase
      .from("players")
      .select("*")
      .eq("session_id", roomId)
      .order("joined_at", { ascending: true });

    return NextResponse.json({ ...session, players: players || [] });
  } catch (error) {
    console.error("Error updating room:", error);
    return NextResponse.json({ error: "Failed to update room" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;

    const { error } = await supabase
      .from("sessions")
      .delete()
      .eq("id", roomId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting room:", error);
    return NextResponse.json({ error: "Failed to delete room" }, { status: 500 });
  }
}
