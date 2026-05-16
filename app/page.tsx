"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useAnimation, useMotionValue, useTransform } from 'framer-motion';
import {
  useCreateRoom,
  useJoinRoom,
  useJoinRoomByCode,
  useRoom,
  useUpdateRoomStatus,
  getDeviceId,
  generateRandomPlayerName,
  type Session,
  type Player,
} from '@/hooks/useRoom';
import {
  performDeterministicDraw,
  generateRevealQueue,
  generateFinalResults,
  WORLD_CUP_2026_TEAMS,
  getTeamAdjective,
  isTop5Team,
} from '@/lib/seeded-random';

// ==================== HOOKS ====================

function useTypewriter(text: string, speed = 50) {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    setDisplayedText('');
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(prev => prev + text[i]);
        i++;
      } else {
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);
  
  return displayedText;
}

function useParticleExplosion(count = 50) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; vx: number; vy: number; color: string }>>([]);
  
  const explode = useCallback(() => {
    const newParticles = Array.from({ length: count }, (_, i) => ({
      id: i,
      x: 50,
      y: 50,
      vx: (Math.random() - 0.5) * 100,
      vy: (Math.random() - 0.5) * 100,
      color: Math.random() > 0.5 ? '#fbbf24' : '#f59e0b',
    }));
    setParticles(newParticles);
    setTimeout(() => setParticles([]), 2000);
  }, [count]);
  
  return { particles, explode };
}

// ==================== COMPONENTS ====================

// Glowing Orb Background
function AmbientOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute w-[600px] h-[600px] rounded-full blur-[120px]"
        style={{ background: 'radial-gradient(circle, rgba(251,191,36,0.15) 0%, transparent 70%)', top: '-20%', left: '-10%' }}
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full blur-[100px]"
        style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)', bottom: '-10%', right: '-10%' }}
        animate={{
          x: [0, -80, 0],
          y: [0, 100, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full blur-[80px]"
        style={{ background: 'radial-gradient(circle, rgba(252,211,77,0.08) 0%, transparent 70%)', top: '40%', right: '20%' }}
        animate={{
          x: [0, 50, 0],
          y: [0, 50, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

// Premium Card Container
function PremiumCard({ children, className = '', glow = false }: { children: React.ReactNode; className?: string; glow?: boolean }) {
  return (
    <div className={`relative ${className}`}>
      {glow && (
        <motion.div
          className="absolute inset-0 rounded-3xl"
          style={{ background: 'linear-gradient(135deg, rgba(251,191,36,0.1) 0%, rgba(245,158,11,0.1) 100%)' }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3, repeat: Infinity }}
        />
      )}
      <div className="relative bg-zinc-900/80 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        {children}
      </div>
    </div>
  );
}

// Trophy Icon Animation
function AnimatedTrophy() {
  return (
    <motion.div
      animate={{
        rotate: [0, -10, 10, -5, 5, 0],
        scale: [1, 1.1, 1],
      }}
      transition={{ duration: 6, repeat: Infinity }}
      className="relative"
    >
      <div className="text-8xl md:text-9xl filter drop-shadow-[0_0_60px_rgba(251,191,36,0.5)]">
        🏆
      </div>
      <motion.div
        className="absolute inset-0 flex items-center justify-center text-8xl md:text-9xl"
        animate={{ opacity: [0, 0.3, 0], scale: [1, 1.5, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        style={{ mixBlendMode: 'overlay' }}
      >
        🏆
      </motion.div>
    </motion.div>
  );
}

// Player Card with Premium Design
function PlayerCard({ player, isDrawing }: { player: Player; isDrawing: boolean }) {
  const [isHovered, setIsHovered] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-50, 50], [5, -5]);
  const rotateY = useTransform(x, [-50, 50], [-5, 5]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left - rect.width / 2) / 2);
    y.set((e.clientY - rect.top - rect.height / 2) / 2);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', damping: 20, stiffness: 200 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => { x.set(0); y.set(0); setIsHovered(false); }}
      onMouseEnter={() => setIsHovered(true)}
      style={{ perspective: 1000 }}
      className="group"
    >
      <motion.div
        style={{ rotateX, rotateY }}
        className="relative"
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      >
        <PremiumCard
          glow={!!player.assignedTeam || isHovered}
          className="p-0 overflow-hidden cursor-pointer"
        >
          <div className={`relative p-6 transition-all duration-500 ${
            player.assignedTeam 
              ? 'bg-gradient-to-br from-yellow-500/10 via-transparent to-yellow-600/10' 
              : isHovered ? 'bg-white/5' : ''
          }`}>
            <div className="flex items-center gap-5">
              {/* Team Badge or Placeholder */}
              <motion.div
                animate={player.assignedTeam ? {
                  scale: [1, 1.05, 1],
                } : {}}
                transition={{ duration: 2, repeat: player.assignedTeam ? Infinity : 0 }}
                className={`relative w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black shadow-xl ${
                  player.assignedTeam
                    ? 'bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-700'
                    : 'bg-zinc-800'
                }`}
              >
                {player.assignedTeam ? (
                  <>
                    <span className="relative z-10 text-zinc-900">
                      {player.assignedTeam.substring(0, 2).toUpperCase()}
                    </span>
                    <motion.div
                      className="absolute inset-0 rounded-2xl"
                      style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.4) 0%, transparent 50%)' }}
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 3, repeat: Infinity }}
                    />
                  </>
                ) : (
                  <motion.div
                    className="w-4 h-4 rounded-full bg-zinc-600"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </motion.div>

              {/* Player Info */}
              <div className="flex-1 min-w-0">
                <motion.p
                  className="text-xl font-bold text-white truncate group-hover:text-yellow-300 transition-colors duration-300"
                  animate={isHovered ? { scale: 1.02, x: 5 } : {}}
                  transition={{ type: 'spring', damping: 20 }}
                >
                  {player.name}
                </motion.p>
                {player.assignedTeam ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-2 mt-1">
                      <motion.span
                        initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="text-yellow-400 font-semibold text-sm flex items-center gap-1"
                      >
                        <span className="text-xs">⚡</span>
                        {player.assignedTeam}
                      </motion.span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.p
                    animate={{ opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-zinc-500 text-sm mt-1"
                  >
                    Waiting for assignment...
                  </motion.p>
                )}
              </div>

              {/* Status Indicator */}
              <motion.div
                className={`w-3 h-3 rounded-full ${
                  player.assignedTeam 
                    ? 'bg-gradient-to-br from-yellow-300 to-yellow-500 shadow-lg shadow-yellow-500/50'
                    : 'bg-zinc-600'
                }`}
                animate={player.assignedTeam ? {
                  scale: [1, 1.2, 1],
                  boxShadow: ['0 0 20px rgba(251,191,36,0.5)', '0 0 30px rgba(251,191,36,0.8)', '0 0 20px rgba(251,191,36,0.5)'],
                } : {
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ boxShadow: '0 0 10px currentColor' }}
              />
            </div>
          </div>
        </PremiumCard>
      </motion.div>
    </motion.div>
  );
}

// Number Counter Animation
function NumberCounter({ value, label }: { value: number; label: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    const start = displayValue;
    const end = value;
    const duration = 1000;
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.floor(start + (end - start) * eased));
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value]);

  return (
    <div className="text-center">
      <motion.div
        key={value}
        initial={{ scale: 1.5, opacity: 0, y: -20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', damping: 15 }}
        className="flex items-baseline justify-center gap-3"
      >
        <motion.span
          className="text-7xl md:text-9xl font-black bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-700 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(251,191,36,0.3)]"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {displayValue}
        </motion.span>
        <span className="text-zinc-500 text-2xl font-light">/</span>
        <span className="text-4xl md:text-5xl font-light text-zinc-400">{label}</span>
      </motion.div>
    </div>
  );
}

// Slot Machine Animation
function SlotMachine({ players, onComplete }: { players: string[]; onComplete: (selected: string) => void }) {
  const [reels, setReels] = useState<string[]>(players.slice(0, 3));
  const [stopped, setStopped] = useState<number[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const animationRefs = useRef<Array<NodeJS.Timeout | null>>([]);

  useEffect(() => {
    // Start animations for each reel
    animationRefs.current = players.slice(0, 3).map((_, reelIndex) => {
      return setInterval(() => {
        if (!stopped.includes(reelIndex)) {
          setReels(prev => {
            const newReels = [...prev];
            newReels[reelIndex] = players[Math.floor(Math.random() * players.length)];
            return newReels;
          });
        }
      }, 50);
    });

    // Stop reels sequentially
    const stopDelays = [2000, 3000, 4000];
    stopDelays.forEach((delay, reelIndex) => {
      const timeout = setTimeout(() => {
        setStopped(prev => [...prev, reelIndex]);
        if (reelIndex === 2) {
          const finalSelection = reels[2];
          setSelected(finalSelection);
          setTimeout(() => {
            animationRefs.current.forEach(interval => interval && clearInterval(interval));
            onComplete(finalSelection);
          }, 1500);
        }
      }, delay);
      setTimeout(() => clearTimeout(timeout), delay + 100);
    });

    return () => {
      animationRefs.current.forEach(interval => interval && clearInterval(interval));
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-zinc-950 to-zinc-900 z-50 flex flex-col items-center justify-center p-4 md:p-8">
      <AmbientOrbs />
      
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12 relative z-10"
      >
        <motion.p
          animate={{ opacity: [0.4, 1, 0.4], scale: [1, 1.05, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="text-yellow-400 font-bold text-lg md:text-xl mb-3 tracking-widest uppercase"
        >
          Selecting Player...
        </motion.p>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="inline-block"
        >
          <span className="text-4xl">🎰</span>
        </motion.div>
      </motion.div>

      <div className="flex gap-2 md:gap-3 lg:gap-4 items-center justify-center relative z-10">
        {reels.map((name, i) => (
          <motion.div
            key={i}
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.1 }}
            className={`relative w-40 md:w-56 h-24 md:h-28 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
              stopped.includes(i)
                ? 'border-yellow-400 shadow-[0_0_60px_rgba(251,191,36,0.4)] scale-105'
                : 'border-zinc-700 shadow-xl'
            }`}
          >
            <div className={`absolute inset-0 flex items-center justify-center font-black italic text-lg md:text-xl text-center px-4 ${
              stopped.includes(i) 
                ? 'bg-gradient-to-br from-yellow-500 to-yellow-700 text-zinc-900' 
                : 'bg-zinc-800 text-white'
            }`}>
              <AnimatePresence mode="wait">
                <motion.span
                  key={`${i}-${name}`}
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -40, opacity: 0 }}
                  transition={{ duration: 0.05 }}
                  className="whitespace-nowrap"
                >
                  {name}
                </motion.span>
              </AnimatePresence>
            </div>
            
            {/* Shine effect */}
            {stopped.includes(i) && (
              <motion.div
                className="absolute inset-0"
                style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 50%, rgba(255,255,255,0.1) 100%)' }}
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </motion.div>
        ))}
      </div>

      {selected && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 15, stiffness: 200 }}
          className="mt-12 text-center relative z-10"
        >
          <p className="text-zinc-400 font-bold mb-2">SELECTED PLAYER</p>
          <h2 className="text-4xl md:text-6xl font-black italic bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">
            {selected}!
          </h2>
        </motion.div>
      )}
    </div>
  );
}

// Pack Opening Reveal Animation
function PackReveal({ playerName, team, onComplete }: { playerName: string; team: typeof WORLD_CUP_2026_TEAMS[0]; onComplete: () => void }) {
  const [phase, setPhase] = useState<'intro' | 'buildup' | 'reveal' | 'celebrate' | 'exit'>('intro');
  const isTop5 = isTop5Team(team.name);
  const { explode } = useParticleExplosion(isTop5 ? 200 : 100);
  const revealKey = `${playerName}-${team.code}`;

  // Reset and start animation when new player/team arrives
  useEffect(() => {
    setPhase('intro');
    
    const sequence = isTop5 ? [
      { phase: 'buildup' as const, delay: 4000 },
      { phase: 'reveal' as const, delay: 14000 },
      { phase: 'celebrate' as const, delay: 23000 },
      { phase: 'exit' as const, delay: 26000 },
    ] : [
      { phase: 'buildup' as const, delay: 5000 },
      { phase: 'reveal' as const, delay: 15000 },
      { phase: 'celebrate' as const, delay: 25000 },
      { phase: 'exit' as const, delay: 28000 },
    ];

    const timeouts: NodeJS.Timeout[] = [];
    
    sequence.forEach(({ phase: p, delay }) => {
      const timeout = setTimeout(() => {
        setPhase(p);
        if (p === 'celebrate') explode();
        if (p === 'exit') setTimeout(onComplete, 1000);
      }, delay);
      timeouts.push(timeout);
    });

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [revealKey, explode, onComplete]);

  return (
    <div className="fixed inset-0 bg-zinc-950 z-50 flex flex-col items-center justify-center overflow-hidden">
      {/* Dynamic Background */}
      <AmbientOrbs />
      
      <motion.div
        className={`absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-orange-600/20 ${
          phase === 'reveal' ? 'opacity-100' : 'opacity-0'
        }`}
        transition={{ duration: 0.5 }}
      />

      {/* Content Container */}
      <div className="relative z-10 text-center px-4">
        {/* Player Name - hide during exit phase */}
        {phase !== 'exit' && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <motion.p
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-yellow-400 font-bold text-sm md:text-base mb-3 tracking-[0.3em] uppercase"
            >
              Assigned To
            </motion.p>
            <motion.h2
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 15 }}
              className="text-3xl md:text-5xl font-black text-white"
            >
              {playerName}
            </motion.h2>
          </motion.div>
        )}

        {/* Team Reveal Card */}
        <AnimatePresence mode="wait">
          {phase === 'reveal' && (
            <motion.div
              initial={{ scale: 0, opacity: 0, rotate: -180 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0, opacity: 0, rotate: 180 }}
              transition={{ type: 'spring', damping: 15, stiffness: 200 }}
              className="relative inline-block"
            >
              {/* Card Glow */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-3xl blur-3xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              
              {/* Main Card */}
              <PremiumCard className="p-8 md:p-12 relative">
                {/* Flag */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring', damping: 15 }}
                  className="text-8xl md:text-9xl mb-6 filter drop-shadow-2xl"
                >
                  {team.flag}
                </motion.div>
                
                {/* Top 5 Badge */}
                {isTop5 && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0, rotate: -180 }}
                    animate={{ scale: 1, opacity: 1, rotate: 0 }}
                    transition={{ delay: 0.4, type: 'spring', damping: 10 }}
                    className="absolute -top-4 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-red-600 via-orange-600 to-red-600 rounded-full shadow-[0_0_40px_rgba(239,68,68,0.8)] border-2 border-yellow-400 z-20"
                  >
                    <span className="text-white font-black text-sm md:text-base tracking-widest uppercase flex items-center gap-2">
                      <span>🔥</span> TOP PICK <span>🔥</span>
                    </span>
                  </motion.div>
                )}
                
                {/* Team Name */}
                <motion.h1
                  initial={{ y: 50, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className={`text-5xl md:text-8xl font-black italic bg-gradient-to-br ${
                    isTop5 
                      ? 'from-red-200 via-orange-400 to-red-600 drop-shadow-[0_0_60px_rgba(239,68,68,0.6)]'
                      : 'from-yellow-200 via-yellow-400 to-yellow-600 drop-shadow-[0_0_40px_rgba(251,191,36,0.5)]'
                  } bg-clip-text text-transparent`}
                >
                  {team.name}
                </motion.h1>
                
                {/* Team Code */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="text-yellow-400 font-bold text-2xl md:text-3xl mt-4 tracking-widest"
                >
                  {team.code}
                </motion.p>
              </PremiumCard>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Progress Indicator */}
        {phase !== 'reveal' && phase !== 'exit' && (
          <motion.div
            className="w-64 h-1 bg-zinc-800 rounded-full mt-12 mx-auto overflow-hidden"
          >
            <motion.div
              className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: '100%' }}
              transition={{ duration: 6, ease: 'linear' }}
            />
          </motion.div>
        )}

        {/* Celebration Text */}
        {phase === 'celebrate' && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mt-8 space-y-2"
          >
            {isTop5 && (
              <motion.p
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', damping: 10 }}
                className="text-3xl md:text-5xl font-black italic bg-gradient-to-r from-red-400 via-orange-400 to-red-400 bg-clip-text text-transparent tracking-widest drop-shadow-[0_0_30px_rgba(239,68,68,0.5)]"
              >
                🔥🔥🔥 TOP PICK! 🔥🔥🔥
              </motion.p>
            )}
            <p className="text-lg md:text-xl font-bold text-zinc-400 tracking-widest">
              YOU'RE THE
            </p>
            <p className="text-2xl md:text-4xl font-black italic text-yellow-400 tracking-widest">
              🎉 {getTeamAdjective(team.odds)}! 🎉
            </p>
            <p className={`text-sm mt-3 font-bold tracking-wider ${isTop5 ? 'text-orange-400' : 'text-zinc-500'}`}>
              Odds: {team.odds}{isTop5 ? ' ⭐' : ''}
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Assignments Modal
function AssignmentsModal({ session, onClose }: { session: Session; onClose: () => void }) {
  const assignedPlayers = session.players.filter(p => p.assignedTeam);
  const unassignedPlayers = session.players.filter(p => !p.assignedTeam);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-2xl"
      >
        <PremiumCard glow className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-black italic text-white">CURRENT ASSIGNMENTS</h2>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white text-2xl font-light"
            >
              ✕
            </button>
          </div>
          
          {/* Progress */}
          <div className="mb-4 md:mb-5">
            <div className="flex items-center justify-between text-sm text-zinc-400 mb-2 px-1">
              <span className="px-1">Progress</span>
              <span>{assignedPlayers.length} / {session.players.length}</span>
            </div>
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-yellow-400 to-yellow-600"
                initial={{ width: 0 }}
                animate={{ width: `${(assignedPlayers.length / session.players.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
          
          {/* Assigned Players */}
          {assignedPlayers.length > 0 && (
            <div className="mb-5 md:mb-6">
              <h3 className="text-sm font-bold text-yellow-400 mb-3 tracking-wider">ASSIGNED</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {assignedPlayers.map((player, index) => (
                  <motion.div
                    key={player.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-zinc-800/50"
                  >
                    <span className="text-yellow-400 font-bold w-6">{index + 1}.</span>
                    <span className="text-2xl">{WORLD_CUP_2026_TEAMS.find(t => t.name === player.assignedTeam)?.flag}</span>
                    <div className="flex-1">
                      <p className="font-bold text-white text-sm">{player.name}</p>
                      <p className="text-yellow-400 text-xs">{player.assignedTeam}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
          
          {/* Unassigned Players */}
          {unassignedPlayers.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-zinc-500 mb-3 tracking-wider">PENDING ({unassignedPlayers.length})</h3>
              <div className="flex flex-wrap gap-2">
                {unassignedPlayers.map((player, index) => (
                  <motion.span
                    key={player.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="px-3 py-2 rounded-lg bg-zinc-800 text-zinc-400 text-sm font-semibold"
                  >
                    {player.name}
                  </motion.span>
                ))}
              </div>
            </div>
          )}
          
          {/* Close Button */}
          <div className="mt-6 px-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="w-full py-3 rounded-2xl bg-zinc-700 font-bold text-white text-base hover:bg-zinc-600 transition-all"
          >
            Close
          </motion.button>
          </div>
        </PremiumCard>
      </motion.div>
    </div>
  );
}

// Results Dashboard
function ResultsDashboard({ session }: { session: Session }) {
  const playerNames = session.players.map(p => p.name);
  const results = generateFinalResults(session.seed, playerNames);
  
  const copyToClipboard = () => {
    const text = results.map((player, i) => 
      `${i + 1}. ${player.playerName} - ${player.teams.map(t => t.name).join(', ')}`
    ).join('\n');
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-zinc-900 px-4 md:px-6 py-6 md:py-8 relative overflow-hidden">
      <AmbientOrbs />
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-2xl md:max-w-3xl lg:max-w-4xl mx-auto relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            className="inline-block mb-2"
          >
            <span className="text-6xl">🏆</span>
          </motion.div>
          <motion.h1
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-3xl md:text-5xl font-black italic bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-700 bg-clip-text text-transparent mb-1"
          >
            FINAL RESULTS
          </motion.h1>
          <p className="text-zinc-400 text-sm">World Cup 2026 Sweepstake</p>
        </div>

        {/* Results by Player */}
        <div className="space-y-6">
          <AnimatePresence>
            {results.map((playerResult, playerIndex) => (
              <motion.div
                key={playerResult.playerName}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: playerIndex * 0.1 }}
              >
                <PremiumCard glow className="overflow-hidden">
                  {/* Player Header */}
                  <div className="bg-gradient-to-r from-yellow-500/10 to-transparent px-4 md:px-5 py-3 border-b border-white/5">
                    <div className="flex items-center gap-3">
                      <span className="text-xl font-black italic text-yellow-500">{playerIndex + 1}.</span>
                      <span className="font-bold text-white text-base">{playerResult.playerName}</span>
                      <span className="text-zinc-500 text-xs">({playerResult.teams.length} teams)</span>
                    </div>
                  </div>
                  
                  {/* Teams List */}
                  <div className="divide-y divide-white/5">
                    {playerResult.teams.map((team, teamIndex) => (
                      <motion.div
                        key={team.code}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: teamIndex * 0.05 }}
                        className="flex items-center gap-3 px-4 md:px-5 py-2 md:py-2.5 hover:bg-white/5 transition-colors"
                      >
                        <span className="text-lg">{team.flag}</span>
                        <span className="flex-1 font-semibold text-white text-sm">{team.name}</span>
                        <span className="text-yellow-400 font-bold text-sm">{team.odds}</span>
                      </motion.div>
                    ))}
                  </div>
                </PremiumCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Copy Button */}
        <div className="mt-6 px-2">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: results.length * 0.1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={copyToClipboard}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-green-500 to-green-700 font-bold text-white text-base shadow-lg hover:shadow-green-500/30 transition-all"
        >
          📋 Copy Results
        </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

// Welcome Screen
function WelcomeScreen({ onCreateRoom, onJoinRoom, isCreating, isJoining, error }: {
  onCreateRoom: (targetPlayers: number, playerName: string) => void;
  onJoinRoom: (roomCode: string, playerName: string) => void;
  isCreating: boolean;
  isJoining: boolean;
  error: string | null;
}) {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [targetPlayers, setTargetPlayers] = useState(12);
  
  const titleText = useTypewriter("WORLD CUP 2026", 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center p-4 md:p-8 lg:p-12 relative overflow-hidden">
      <AmbientOrbs />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-lg md:max-w-xl lg:max-w-2xl relative z-10"
      >
        <PremiumCard glow className="pt-8 pb-6 px-6 md:pt-10 md:pb-8 md:px-8 lg:pt-12 lg:pb-10 lg:px-10 space-y-4">
          {/* Title Section */}
          <div className="text-center mb-6 md:mb-8">
            <AnimatedTrophy />
            <motion.h1 
              className="text-4xl md:text-6xl font-black italic mt-4 bg-gradient-to-r from-yellow-300 via-yellow-500 to-yellow-700 bg-clip-text text-transparent"
              animate={{ backgroundPosition: ['0%', '100%', '0%'] }}
              transition={{ duration: 5, repeat: Infinity }}
              style={{ backgroundSize: '200%' }}
            >
              WORLD CUP
            </motion.h1>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-xl md:text-2xl font-bold text-zinc-400 mt-1 tracking-widest"
            >
              SWEEPSTAKE
            </motion.h2>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/50 text-red-400 text-sm text-center font-semibold"
            >
              ⚠️ {error}
            </motion.div>
          )}

          {/* Player Count Slider */}
          <div className="mb-5 md:mb-6">
            <div className="flex items-center justify-between mb-4 px-1">
              <label className="text-zinc-400 font-semibold tracking-wide px-1">TARGET PLAYERS</label>
              <motion.span
                key={targetPlayers}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-2xl font-black text-yellow-400 px-1"
              >
                {targetPlayers}
              </motion.span>
            </div>
            <input
              type="range"
              min="2"
              max="48"
              value={targetPlayers}
              onChange={(e) => setTargetPlayers(parseInt(e.target.value))}
              className="w-full h-2 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-yellow-500"
              style={{
                background: `linear-gradient(to right, #fbbf24 0%, #fbbf24 ${((targetPlayers - 2) / 46) * 100}%, #262626 ${((targetPlayers - 2) / 46) * 100}%, #262626 100%)`
              }}
            />
            <div className="flex justify-between mt-3 px-1 text-xs text-zinc-600 font-medium">
              <span>2</span>
              <span>25</span>
              <span>48</span>
            </div>
          </div>

          {/* Name Input for Creator */}
          <div className="mb-4 md:mb-5 px-2">
            <input
              type="text"
              placeholder="NAME"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={24}
              className="w-full px-4 py-3 rounded-2xl bg-zinc-800/50 border border-zinc-700 text-white placeholder-zinc-500 text-center text-base font-bold focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all"
            />
          </div>

          {/* Create Room Button */}
          <div className="px-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onCreateRoom(targetPlayers, playerName)}
              disabled={!playerName.trim() || isCreating}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 font-black italic text-zinc-900 text-lg md:text-xl shadow-lg shadow-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isCreating ? (
              <div className="flex items-center justify-center gap-2">
                <span className="font-bold tracking-wider">CREATING</span>
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-4 bg-zinc-900 rounded-full"
                      animate={{ height: [4, 16, 4] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              'CREATE NEW ROOM'
            )}
          </motion.button>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 md:gap-4 mt-4 mb-5 md:mb-6">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
            <span className="text-zinc-500 font-semibold text-sm">OR JOIN EXISTING</span>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
          </div>

          {/* Join Room Section */}
          <div className="space-y-3">
            <div className="px-2 mb-3 md:mb-4">
              <input
                type="text"
                placeholder="ROOM CODE"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
                maxLength={6}
                className="w-full px-4 py-3 rounded-2xl bg-zinc-800/50 border border-zinc-700 text-white placeholder-zinc-500 text-center text-xl font-bold tracking-widest focus:outline-none focus:border-yellow-500 focus:ring-2 focus:ring-yellow-500/20 transition-all"
              />
            </div>
            
            <div className="px-2 mb-4 md:mb-6">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onJoinRoom(roomCode, playerName)}
                disabled={!roomCode.trim() || !playerName.trim() || isJoining}
                className="w-full py-3 rounded-2xl bg-zinc-700 font-bold text-white text-base hover:bg-zinc-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isJoining ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="font-bold tracking-wider">JOINING</span>
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-4 bg-white rounded-full"
                        animate={{ height: [4, 16, 4] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                'JOIN ROOM'
              )}
            </motion.button>
            </div>
          </div>
        </PremiumCard>
      </motion.div>
    </div>
  );
}

// Lobby Screen
function LobbyScreen({ 
  session, 
  onStartDraw, 
  isHost,
  isUpdating,
  onShowAssignments
}: { 
  session: Session; 
  onStartDraw: () => void; 
  isHost: boolean;
  isUpdating: boolean;
  onShowAssignments?: () => void;
}) {
  const playerCount = session.players.length;
  const canStart = playerCount >= 2 && session.status === 'WAITING';

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-zinc-900 px-4 md:px-6 py-6 md:py-8 relative overflow-hidden">
      <AmbientOrbs />
      
      <div className="max-w-2xl mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <motion.span
              animate={{ y: [-10, 0, -10] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-5xl">
              ⚽
            </motion.span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black italic text-white mb-1">SWEEPSTAKE LOBBY</h1>
          <p className="text-zinc-400 text-sm">Room Code: <span className="text-yellow-400 font-bold tracking-widest">{session.roomCode}</span></p>
        </motion.div>

        {/* Player Counter */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-4"
        >
          <NumberCounter value={playerCount} label={session.targetPlayers.toString()} />
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-zinc-500 text-sm mt-1"
          >
            players in lobby
          </motion.p>
        </motion.div>

        {/* Players Grid */}
        <div className="grid gap-3 mb-6">
          <AnimatePresence mode="popLayout">
            {session.players.map((player, index) => (
              <motion.div
                key={player.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.05 }}
              >
                <PlayerCard player={player} isDrawing={session.status === 'DRAWING'} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Start Button or Waiting Message */}
        {isHost ? (
          <div className="px-2">
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onStartDraw}
              disabled={!canStart || isUpdating}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 font-black italic text-zinc-900 text-xl shadow-lg shadow-yellow-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isUpdating ? (
              <div className="flex items-center justify-center gap-2">
                <span className="font-bold tracking-wider">PROCESSING</span>
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="w-1.5 h-4 bg-zinc-900 rounded-full"
                      animate={{ height: [4, 16, 4] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              '🎲 START DRAW'
            )}
          </motion.button>
          </div>
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-zinc-500 text-sm"
          >
            Waiting for host to start the draw...
          </motion.p>
        )}
        
        {/* Show Assignments Button */}
        {session.status === 'DRAWING' && onShowAssignments && (
          <div className="mt-4 px-2">
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onShowAssignments}
              className="w-full py-3 rounded-2xl bg-zinc-800 font-bold text-white text-base hover:bg-zinc-700 transition-all"
          >
            👁️ Show Current Assignments
          </motion.button>
          </div>
        )}
      </div>
    </div>
  );
}

// ==================== MAIN APP ====================

export default function SweepstakeApp() {
  const [view, setView] = useState<'welcome' | 'lobby' | 'drawing' | 'revealing' | 'results'>('welcome');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [currentReveal, setCurrentReveal] = useState<{ playerName: string; team: typeof WORLD_CUP_2026_TEAMS[0] } | null>(null);
  const [revealQueue, setRevealQueue] = useState<Array<{ playerName: string; team: typeof WORLD_CUP_2026_TEAMS[0] }>>([]);
  const [revealedIndex, setRevealedIndex] = useState(0);
  const [showAssignments, setShowAssignments] = useState(false);
  const [nonHostRevealIndex, setNonHostRevealIndex] = useState(0);
  const nonHostInitialized = useRef(false);

  const { createRoom, isCreating } = useCreateRoom();
  const { joinRoomByCode, isJoining, error: joinError } = useJoinRoomByCode();
  const { updateStatus, isUpdating } = useUpdateRoomStatus(roomId || '');
  const room = useRoom(roomId ?? undefined);

  const deviceId = useRef(getDeviceId());

  const handleCreateRoom = async (targetPlayers: number, name: string) => {
    if (!name.trim()) return;
    const result = await createRoom(deviceId.current, targetPlayers, name.trim());
    if (result?.sessionId) {
      // Use useEffect to ensure roomId is set before switching view
      setRoomId(result.sessionId);
      // Small delay to ensure state update propagates
      setTimeout(() => setView('lobby'), 100);
    }
  };

  const handleJoinRoom = async (code: string, name: string) => {
    if (!code.trim()) return;
    
    const playerName = name.trim() || generateRandomPlayerName();
    const result = await joinRoomByCode(code.toUpperCase(), playerName, deviceId.current);
    if (result?.sessionId) {
      // Use setTimeout to ensure roomId state is updated before view change
      setRoomId(result.sessionId);
      setTimeout(() => setView('lobby'), 100);
    }
  };

  const startDraw = async () => {
    if (!room.session) return;
    
    await updateStatus('DRAWING');
    
    const playerNames = room.session.players.map(p => p.name);
    const revealQueue = generateRevealQueue(room.session.seed, playerNames);
    
    setRevealQueue(revealQueue);
    setRevealedIndex(0);
    setView('revealing');
    setCurrentReveal(revealQueue[0]);
  };

  const handleRevealComplete = async () => {
    // Update the database with the current assignment
    if (roomId && currentReveal) {
      try {
        await fetch(`/api/room/${roomId}/assign`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playerName: currentReveal.playerName,
            teamName: currentReveal.team.name,
          }),
        });
      } catch (err) {
        console.error('Failed to update assignment:', err);
      }
    }
    
    const nextIndex = revealedIndex + 1;
    
    if (nextIndex < revealQueue.length) {
      setRevealedIndex(nextIndex);
      setCurrentReveal(revealQueue[nextIndex]);
    } else {
      if (roomId) {
        await updateStatus('COMPLETED');
      }
      setTimeout(() => setView('results'), 500);
    }
  };

  // Handle non-host users watching the draw
  const handleNonHostRevealComplete = async () => {
    setNonHostRevealIndex(prev => prev + 1);
  };

  const handleShowAssignments = () => {
    setShowAssignments(true);
  };

  const handleCloseAssignments = () => {
    setShowAssignments(false);
  };

  // Initialize non-host reveal index when entering reveal view
  useEffect(() => {
    if (view === 'lobby' && room.session?.status === 'DRAWING') {
      const isHost = room.session.hostId === deviceId.current;
      if (!isHost && !nonHostInitialized.current) {
        const assignedCount = room.session.players.filter(p => p.assignedTeam).length;
        setNonHostRevealIndex(assignedCount);
        nonHostInitialized.current = true;
      }
    } else if (view !== 'lobby' || room.session?.status !== 'DRAWING') {
      // Reset when leaving reveal view (allows rejoin to pick up from new position)
      nonHostInitialized.current = false;
    }
  }, [view, room.session?.status]);

  if (view === 'welcome') {
    return (
      <WelcomeScreen 
        onCreateRoom={handleCreateRoom} 
        onJoinRoom={handleJoinRoom}
        isCreating={isCreating}
        isJoining={isJoining}
        error={joinError}
      />
    );
  }

  if (view === 'results' && room.session) {
    return <ResultsDashboard session={room.session} />;
  }

  if (view === 'revealing' && currentReveal) {
    return (
      <PackReveal 
        playerName={currentReveal.playerName} 
        team={currentReveal.team} 
        onComplete={handleRevealComplete}
      />
    );
  }

  // Non-host users watching the draw
  if (view === 'lobby' && room.session?.status === 'DRAWING') {
    const isHost = room.session.hostId === deviceId.current;
    
    if (!isHost) {
      const playerNames = room.session.players.map(p => p.name);
      const nonHostRevealQueue = generateRevealQueue(room.session.seed, playerNames);
      
      // Check if we've completed all reveals
      if (nonHostRevealIndex >= nonHostRevealQueue.length) {
        setTimeout(() => setView('results'), 500);
        return (
          <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
            <div className="text-yellow-400 text-xl">Finalizing...</div>
          </div>
        );
      }
      
      const nextReveal = nonHostRevealQueue[nonHostRevealIndex];
      if (!nextReveal) return <div className="min-h-screen bg-zinc-950 flex items-center justify-center"><div className="text-yellow-400 text-xl">Loading...</div></div>;
      
      return (
        <PackReveal 
          playerName={nextReveal.playerName}
          team={nextReveal.team}
          onComplete={handleNonHostRevealComplete}
        />
      );
    }
  }

  if (view === 'lobby') {
    if (!room.session) {
      // Loading room data after creation/join
      return (
        <div className="min-h-screen bg-gradient-to-b from-zinc-950 to-zinc-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 relative">
              <div className="absolute inset-0 rounded-full border-4 border-zinc-700" />
              <div className="absolute inset-0 rounded-full border-4 border-yellow-500 border-t-transparent animate-spin" />
            </div>
            <p className="text-yellow-400 font-bold tracking-widest animate-pulse">ENTERING LOBBY</p>
          </div>
        </div>
      );
    }
    const isHost = room.session.hostId === deviceId.current;
    return (
      <LobbyScreen 
        session={room.session}
        onStartDraw={startDraw}
        isHost={isHost}
        isUpdating={isUpdating}
        onShowAssignments={handleShowAssignments}
      />
    );
  }

  if (showAssignments && room.session) {
    return (
      <>
        <LobbyScreen 
          session={room.session}
          onStartDraw={startDraw}
          isHost={room.session.hostId === deviceId.current}
          isUpdating={isUpdating}
          onShowAssignments={handleShowAssignments}
        />
        <AnimatePresence>
          <AssignmentsModal session={room.session} onClose={handleCloseAssignments} />
        </AnimatePresence>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="text-yellow-400 text-xl">Loading...</div>
    </div>
  );
}
