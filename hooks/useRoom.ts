import useSWR from 'swr';
import { useState, useCallback } from 'react';

export interface Player {
  id: string;
  name: string;
  assignedTeam: string | null;
  joinedAt: string;
}

export interface Session {
  id: string;
  roomCode: string;
  hostId: string;
  targetPlayers: number;
  seed: number;
  status: 'WAITING' | 'DRAWING' | 'COMPLETED';
  players: Player[];
  createdAt: string;
}

const fetcher = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

export function getDeviceId(): string {
  if (typeof window === 'undefined') return 'server';
  return `device_${Math.random().toString(36).substring(2, 9)}${Date.now().toString(36)}`;
}

export function generateRandomPlayerName(): string {
  const adjectives = ['Swift', 'Bold', 'Clever', 'Fierce', 'Lucky', 'Golden', 'Silver', 'Rapid', 'Mighty', 'Sly'];
  const nouns = ['Eagle', 'Tiger', 'Wolf', 'Lion', 'Hawk', 'Panther', 'Bull', 'Falcon', 'Bear', 'Ram'];
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]}${nouns[Math.floor(Math.random() * nouns.length)]}`;
}

export function useCreateRoom() {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createRoom = async (hostId: string, targetPlayers: number, playerName?: string) => {
    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch('/api/room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostId, targetPlayers, playerName }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create room');
      }

      const data = await response.json();
      return { sessionId: data.sessionId };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create room';
      setError(message);
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  return { createRoom, isCreating, error };
}

export function useJoinRoom(roomId: string) {
  const [isJoining, setIsJoining] = useState(false);

  const joinRoom = useCallback(async (name: string, deviceId: string) => {
    setIsJoining(true);
    try {
      const res = await fetch(`/api/room/${roomId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: name, deviceId }),
      });
      if (!res.ok) throw new Error(await res.text());
      const player = await res.json();
      const sessionRes = await fetch(`/api/room/${roomId}`);
      const session = await sessionRes.json();
      return { sessionId: roomId, session };
    } finally {
      setIsJoining(false);
    }
  }, [roomId]);

  return { joinRoom, isJoining };
}

export function useJoinRoomByCode() {
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const joinRoomByCode = async (code: string, playerName: string, deviceId: string) => {
    setIsJoining(true);
    setError(null);

    try {
      // Step 1: Get room ID from code
      const codeResponse = await fetch(`/api/room/code/${code}`);
      if (!codeResponse.ok) {
        throw new Error('Invalid room code');
      }
      const { roomId } = await codeResponse.json();

      // Step 2: Join the room
      const response = await fetch(`/api/room/${roomId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName, deviceId }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to join room');
      }

      const data = await response.json();
      return { sessionId: data.session_id };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to join room';
      setError(message);
      return null;
    } finally {
      setIsJoining(false);
    }
  };

  return { joinRoomByCode, isJoining, error };
}

export function useRoom(roomId?: string) {
  const { data, error, mutate } = useSWR<Session>(
    roomId ? `/api/room/${roomId}` : null,
    async (url: string) => {
      const res = await fetch(url);
      if (!res.ok) throw new Error(await res.text());
      const rawData = await res.json();
      
      // Transform snake_case to camelCase
      const session: Session = {
        id: rawData.id,
        roomCode: rawData.room_code,
        hostId: rawData.host_id,
        targetPlayers: rawData.target_players,
        seed: rawData.seed,
        status: rawData.status,
        players: (rawData.players || []).map((p: any) => ({
          id: p.id,
          name: p.name,
          assignedTeam: p.assigned_team,
          joinedAt: p.joined_at,
        })),
        createdAt: rawData.created_at,
      };
      
      return session;
    },
    { refreshInterval: 2000, dedupingInterval: 500 }
  );

  return {
    session: data,
    error,
    isLoading: !error && !data,
    refresh: mutate,
  };
}

export function useRoomByCode(roomCode: string) {
  const [roomId, setRoomId] = useState<string | undefined>(undefined);
  const [isResolving, setIsResolving] = useState(false);
  const [resolvedSession, setResolvedSession] = useState<Session | undefined>(undefined);

  const resolveRoomCode = useCallback(async () => {
    if (!roomCode || isResolving) return;
    setIsResolving(true);
    try {
      const res = await fetch(`/api/room/code/${roomCode}`);
      const rawData = await res.json();
      if (rawData.id) {
        setRoomId(rawData.id);
        // Transform snake_case to camelCase
        const session: Session = {
          id: rawData.id,
          roomCode: rawData.room_code,
          hostId: rawData.host_id,
          targetPlayers: rawData.target_players,
          seed: rawData.seed,
          status: rawData.status,
          players: (rawData.players || []).map((p: any) => ({
            id: p.id,
            name: p.name,
            assignedTeam: p.assigned_team,
            joinedAt: p.joined_at,
          })),
          createdAt: rawData.created_at,
        };
        setResolvedSession(session);
        return session;
      }
    } catch (err) {
      console.error('Failed to resolve room code:', err);
    } finally {
      setIsResolving(false);
    }
    return null;
  }, [roomCode]);

  return { roomId, isResolving, resolveRoomCode, session: resolvedSession };
}

export function useUpdateRoomStatus(roomId: string) {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateStatus = useCallback(async (status: 'DRAWING' | 'COMPLETED') => {
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/room/${roomId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      return await res.json();
    } finally {
      setIsUpdating(false);
    }
  }, [roomId]);

  return { updateStatus, isUpdating };
}
