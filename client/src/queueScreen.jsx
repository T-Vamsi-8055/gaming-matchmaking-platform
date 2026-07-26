import React, { useEffect, useState } from 'react'
import { socket, ensureSocketConnected } from './socket.js'
import { useNavigate, useLocation } from 'react-router-dom'

const QueueScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  const game = location.state?.game || 'Match';
  const queueType = location.state?.queueType || '1';

  const getQueueLabel = (type) => {
    if (type === '1' || type === 1) return 'Solo Queue (1v1)';
    if (type === '2' || type === 2) return 'Duo Queue (2v2)';
    if (type === '4' || type === 4) return 'Squad Queue (4v4)';
    return 'Standard Queue';
  };

  useEffect(() => {
    ensureSocketConnected();

    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);

    const handleJoinedMatch = (matchPayload) => {
      navigate("/match", {
        state: { 
          gameTeam: matchPayload?.teams || matchPayload,
          matchData: matchPayload 
        }
      });
    };

    socket.on("joined-match", handleJoinedMatch);

    return () => {
      clearInterval(timer);
      socket.off("joined-match", handleJoinedMatch);
    };
  }, [navigate]);

  const handleCancelBtn = () => {
    socket.emit("exit-queue", game, queueType);
    navigate("/");
  };

  const formatTime = (totalSecs) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-slate-100 flex flex-col items-center justify-center relative overflow-hidden select-none">
      {/* Ambient background blur effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Container */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-lg px-6 space-y-8">
        
        {/* Top Badges */}
        <div className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-wider text-white">
            SEARCHING FOR MATCH
          </h1>
          <p className="text-xs font-mono text-zinc-400 uppercase tracking-widest">
            {game.toUpperCase()} • <span className="text-cyan-400 font-bold">{getQueueLabel(queueType)}</span>
          </p>
        </div>

        {/* Animated Radar Graphic */}
        <div className="relative flex items-center justify-center w-64 h-64 my-4">
          {/* Radar Circles */}
          <div className="absolute inset-0 rounded-full border border-cyan-500/20 animate-ping opacity-25" />
          <div className="absolute inset-4 rounded-full border border-cyan-500/30 animate-pulse" />
          <div className="absolute inset-12 rounded-full border border-white/10" />
          <div className="absolute inset-20 rounded-full border border-white/5" />
          
          {/* Radar Sweeper */}
          <div className="absolute inset-0 rounded-full bg-[conic-gradient(from_0deg,transparent_0_300deg,rgba(34,211,238,0.3)_360deg)] animate-[spin_3s_linear_infinite]" />

          {/* Center Timer */}
          <div className="relative z-20 flex flex-col items-center justify-center bg-zinc-950/90 border border-cyan-500/40 w-36 h-36 rounded-full shadow-[0_0_30px_rgba(34,211,238,0.25)]">
            <span className="text-3xl font-black font-mono tracking-wider text-white">
              {formatTime(secondsElapsed)}
            </span>
            <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase mt-1">
              IN QUEUE
            </span>
          </div>
        </div>

        {/* Status Messages */}
        <div className="space-y-1">
          <p className="text-sm font-mono text-slate-300 animate-pulse">
            Analyzing Skill Rating & Finding Balanced Squads...
          </p>
          <p className="text-xs text-zinc-500">
            Estimated wait time: &lt; 00:15
          </p>
        </div>

        {/* Cancel Queue Action */}
        <button
          onClick={handleCancelBtn}
          className="px-8 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/60 text-red-400 hover:text-red-300 font-bold uppercase tracking-widest text-xs transition-all duration-200 shadow-lg active:scale-95 cursor-pointer"
        >
          Cancel Queue
        </button>

      </div>
    </div>
  );
};

export default QueueScreen;
