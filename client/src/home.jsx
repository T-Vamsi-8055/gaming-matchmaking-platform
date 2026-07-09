import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const API_PORT = 3000

const home = () => {
  const navigate = useNavigate();

  // Authentication & Profile States
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Matchmaking Interactive States
  const [isQueueing, setIsQueueing] = useState(false);
  const [queueTime, setQueueTime] = useState(0);
  const [game, setGame] = useState('');
  const [region, setRegion] = useState('');
  const [roomCode, setRoomCode] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`http://localhost:${API_PORT}/api/auth/me`, {
          credentials: "include"
        });

        if (!response.ok) {
          navigate("/auth");
          return;
        }

        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error("Auth verification failed:", error);
        navigate("/auth");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [navigate]);

  // 2. Queue Timer Effect
  useEffect(() => {
    let timer;
    if (isQueueing) {
      timer = setInterval(() => {
        setQueueTime((prev) => prev + 1);
      }, 1000);
    } else {
      setQueueTime(0);
    }
    return () => clearInterval(timer);
  }, [isQueueing]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Prevent UI flashing or undefined crashes while checking user details
  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-cyan-400 font-mono tracking-widest text-sm">
        INITIALIZING AGENT SYSTEM...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-400">
      {/*Main Layout*/}
      <div className="max-w-[1600px] mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/*MAIN CONTENT AREA (Center Columns)*/}
        <main className="col-span-1 lg:col-span-2 space-y-8">
          
          {/* Welcome*/}
          <div className="text-xs font-mono tracking-widest text-zinc-400 uppercase bg-white/5 border border-white/5 px-4 py-2 rounded-lg inline-block">
            WELCOME
          </div>

          {/* QUICK MATCHMAKING */}
          <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-zinc-900 to-black border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl">
            {/* Ambient Background Glows */}
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 text-center max-w-xl mx-auto space-y-6">
              {/* Bold Platform CTA*/}
              <h1 className="text-4xl md:text-5xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-zinc-400 uppercase drop-shadow-sm">
                GEAR UP <span className="text-cyan-400 animate-pulse">{user?.username || 'GUEST'}</span>
              </h1>

              {/* Matchmaking Selector */}
              <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4 md:p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Preferred Game Select dropdown */}
                  <div className="text-left space-y-1.5">
                    <label className="text-xs uppercase tracking-widest text-zinc-400 font-bold">Preferred Game</label>
                    <select 
                      value={game}
                      onChange={(e) => setGame(e.target.value)}
                      disabled={isQueueing}
                      className="w-full bg-zinc-950/80 border border-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-slate-200 rounded-lg p-2.5 outline-none transition-all duration-200 text-sm cursor-pointer disabled:opacity-50"
                    >
                      <option value="">Select Game...</option>
                      <option value="valorant">Valorant</option>
                      <option value="cs2">Counter-Strike 2</option>
                      <option value="lol">League of Legends</option>
                    </select>
                  </div>

                  {/* Regional Deploy Select dropdown */}
                  <div className="text-left space-y-1.5">
                    <label className="text-xs uppercase tracking-widest text-zinc-400 font-bold">Region</label>
                    <select 
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      disabled={isQueueing}
                      className="w-full bg-zinc-950/80 border border-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-slate-200 rounded-lg p-2.5 outline-none transition-all duration-200 text-sm cursor-pointer disabled:opacity-50"
                    >
                      <option value="">Select Region...</option>
                      <option value="na">North America</option>
                      <option value="euw">Europe West</option>
                      <option value="ap">Asia Pacific</option>
                    </select>
                  </div>
                </div>

                {/*Matchmaking Trigger Button */}
                <button
                  onClick={() => setIsQueueing(!isQueueing)}
                  disabled={!game || !region}
                  className={`w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all duration-300 transform active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
                    ${isQueueing 
                      ? 'bg-emerald-500 text-zinc-950 shadow-[0_0_25px_rgba(16,185,129,0.5)] hover:bg-emerald-400' 
                      : 'bg-cyan-500 text-zinc-950 shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:bg-cyan-400'
                    }`}
                >
                  {isQueueing ? 'Finding Match...' : 'Find Match'}
                </button>

                {/* Visual Spin & Time Increment Tracker */}
                {isQueueing && (
                  <div className="flex items-center justify-center space-x-3 text-emerald-400 animate-fade-in py-1">
                    <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-mono font-bold tracking-widest">
                      IN QUEUE • {formatTime(queueTime)}
                    </span>
                  </div>
                )}
              </div>



            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default home