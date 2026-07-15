import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { socket } from './socket.js'

const API_PORT = 3000

const home = () => {
  const navigate = useNavigate();

{/* States for Segment1: QUICK MATCHMAKING */}

  // Authentication & Profile States
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Matchmaking Interactive States
  const [isQueueing, setIsQueueing] = useState(false);
  const [queueTime, setQueueTime] = useState(0);
  const [game, setGame] = useState('');
  const [region, setRegion] = useState('');
  const [roomCode, setRoomCode] = useState('');
  
{/* States for Segment2: Game Discovery Grid */}
  // Mock Data for Games
  const gamesData = [
    { id: 1, title: 'Valorant', genre: 'FPS', platform: 'PC', activePlayers: 14205},
    { id: 2, title: 'Counter-Strike 2', genre: 'FPS', platform: 'PC', activePlayers: 28410 },
    { id: 3, title: 'League of Legends', genre: 'MOBA', platform: 'PC', activePlayers: 45190},
    { id: 4, title: 'Apex Legends', genre: 'FPS', platform: 'Multi', activePlayers: 8940},
    { id: 5, title: 'Dota 2', genre: 'MOBA', platform: 'PC', activePlayers: 12450},
  ];

  // Filtering States
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedPlatform, setSelectedPlatform] = useState('All');

  // Filtered Games Logic
  const filteredGames = gamesData.filter(game => {
    const genreMatch = selectedGenre === 'All' || game.genre === selectedGenre;
    const platformMatch = selectedPlatform === 'All' || game.platform === selectedPlatform;
    return genreMatch && platformMatch;
  });

{/* States for Segment3: Tournament Panel */}
  // Mock Data for Tournaments & Scrims
  const tournamentsData = [
    {
      id: 1,
      title: "Valorant Radiant Clash",
      type: "Championship Tournament",
      joinedTeams: 24,
      maxTeams: 32,
      status: "Registering",
      game: "Valorant",
      reward: "$5,000 Prize Pool",
      actionText: "Register Team"
    },
    {
      id: 2,
      title: "CS2 EU Masters Qualifier",
      type: "Pro Scrim / Bracket",
      joinedTeams: 16,
      maxTeams: 16,
      status: "Live Progress",
      game: "Counter-Strike 2",
      reward: "Tier-1 Seed Spot",
      actionText: "Watch Live"
    },
    {
      id: 3,
      title: "League of Legends Rift Rivalry",
      type: "Community Cup",
      joinedTeams: 58,
      maxTeams: 64,
      status: "Registering",
      game: "League of Legends",
      reward: "Premium Loot Drops",
      actionText: "Register Team"
    }
  ];

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
  const handleLogOut =()=>{
    socket.disconnect();
    localStorage.removeItem("jwt-auth-token");
    navigate("/auth");
  }
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
      <div className="fixed flex flex-row z-999 min-w-screen min-h-10 sm:flex-row sm:items-center justify-between bg-neutral-900 border-b border-b-neutral-700 p-2">
         <button onClick={() => navigate("/profile")} className="hover:bg-neutral-600 text-xs w-24 font-mono tracking-widest text-zinc-400 uppercase bg-neutral-700 border border-neutral-500 p-0 rounded inline-block h-6">
            Profile
          </button>
         <button onClick={handleLogOut} className="hover:bg-neutral-600 text-xs w-24 font-mono tracking-widest text-zinc-400 uppercase bg-neutral-700 border border-neutral-500 p-0 rounded inline-block h-6">
            Log out
          </button>
         <input className="hover:bg-neutral-600 focus:bg-neutral-600 focus:outline-0 text-xs font-mono tracking-widest text-zinc-400 bg-neutral-700 border border-neutral-500 p-0 rounded inline-block h-6 p-1" placeholder='Search parties'/>
            
      </div>
      {/*Main Layout*/}
      <div className="max-w-[1600px] mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/*MAIN CONTENT AREA (Center Columns)*/}
        <main className="col-span-1 lg:col-span-2 space-y-8">
          
          {/* Welcome*/}
         

          {/* Segment1: QUICK MATCHMAKING */}
          <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-zinc-900 to-black border border-white/10 rounded-2xl my-7 p-6 md:p-8 shadow-2xl">
            {/* Ambient Background Glows */}
            <div className="absolute  -top-24 -left-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
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
                      <option value="apex">Apex Legends</option>
                      <option value="dota2">Dota 2</option>
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

              {/* Instant Lobby Creation Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button className="flex items-center justify-center space-x-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200 p-3 rounded-xl text-sm font-semibold tracking-wide">
                  <span>➕</span>
                  <span>Create Public Lobby</span>
                </button>
                
                <div className="flex bg-white/5 border border-white/10 focus-within:border-white/20 focus-within:ring-1 focus-within:ring-white/10 transition-all duration-200 rounded-xl overflow-hidden p-1">
                  <input 
                    type="text" 
                    placeholder="Room Code" 
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value)}
                    className="w-full bg-transparent px-3 py-2 text-sm text-slate-200 outline-none placeholder-zinc-500 min-w-0"
                  />
                  <button className="flex items-center justify-center space-x-1 bg-white/10 hover:bg-white/20 transition-all duration-200 px-4 py-2 rounded-lg text-sm font-semibold shrink-0 whitespace-nowrap">
                    <span>🔒</span>
                    <span>Private</span>
                  </button>
                </div>
              </div>

            </div>
          </section>
          
          {/* Segment2: Game Discovery Grid*/}
          <section className="space-y-4">
            {/* Header & Filters Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white/5 border border-white/10 rounded-xl p-4">
              <div>
                <h2 className="text-lg font-bold tracking-wider uppercase text-slate-100">Game Discovery</h2>
                <p className="text-xs text-zinc-400">Explore titles and check active queues</p>
              </div>
              
              {/* Filter Dropdowns */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedGenre}
                  onChange={(e) => setSelectedGenre(e.target.value)}
                  className="bg-zinc-950 border border-white/10 text-xs text-slate-300 rounded-lg p-2 outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="All">All Genres</option>
                  <option value="FPS">FPS</option>
                  <option value="MOBA">MOBA</option>
                </select>

                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="bg-zinc-950 border border-white/10 text-xs text-slate-300 rounded-lg p-2 outline-none focus:border-cyan-400 cursor-pointer"
                >
                  <option value="All">All Platforms</option>
                  <option value="PC">PC</option>
                  <option value="Multi">Cross-Platform</option>
                </select>
              </div>
            </div>

            {/* Horizontal Sliding Card List */}
            <div className="flex gap-4 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent snap-x snap-mandatory">
              {filteredGames.length > 0 ? (
                filteredGames.map((g) => (
                  <div
                    key={g.id}
                    className="group relative flex-none w-64 h-40 rounded-xl overflow-hidden border border-white/10 bg-zinc-900 snap-start transition-all duration-300 hover:scale-[1.03] hover:border-cyan-500/50 cursor-pointer shadow-lg"
                  >
                    {/* Card Banner Background Asset */}
                    <div 
                      className="absolute inset-0 bg-cover bg-center brightness-[0.4] group-hover:brightness-[0.5] transition-all duration-300 transform group-hover:scale-105"
                      style={{ backgroundImage: `url(${g.bg})` }}
                    />
                    
                    {/* Glass Surface Overlay Content */}
                    <div className="absolute inset-0 p-4 flex flex-col justify-between z-10 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent">
                      {/* Top Badges */}
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-bold">
                          {g.genre}
                        </span>
                        <span className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase bg-black/40 px-2 py-0.5 rounded border border-white/5">
                          {g.platform}
                        </span>
                      </div>

                      {/* Bottom Details */}
                      <div className="space-y-1">
                        <h3 className="font-black text-base tracking-wide text-white group-hover:text-cyan-400 transition-colors duration-200">
                          {g.title}
                        </h3>
                        <div className="flex items-center space-x-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <p className="text-xs font-mono text-zinc-400">
                            <span className="text-emerald-400 font-bold">{g.activePlayers.toLocaleString()}</span> Queueing
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="w-full text-center py-12 bg-white/5 border border-white/10 border-dashed rounded-xl text-zinc-500 text-sm">
                  No matching games deploying parameters found.
                </div>
              )}
            </div>
          </section>

        {/*Segment3: Tournament Panel */}        
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold tracking-wider uppercase text-slate-100">Tournaments & Scrims</h2>
                <p className="text-xs text-zinc-400">Join active brackets or spectate pro divisions</p>
              </div>
              
              {/* Carousel Navigation Indicator Dots */}
              <div className="flex space-x-1.5 bg-white/5 p-1.5 rounded-lg border border-white/5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-white/20"></span>
              </div>
            </div>

            {/* Horizontal Carousel Track Wrapper */}
            <div className="flex gap-4 overflow-x-auto pb-3 pt-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent snap-x snap-mandatory">
              {tournamentsData.map((event) => {
                const isFull = event.joinedTeams === event.maxTeams;
                const isLive = event.status === "Live Progress";
                const progressPercentage = (event.joinedTeams / event.maxTeams) * 100;

                return (
                  <div
                    key={event.id}
                    className="flex-none w-full md:w-[420px] bg-gradient-to-b from-slate-900 to-zinc-950 border border-white/10 rounded-xl p-5 snap-start relative overflow-hidden flex flex-col justify-between min-h-[190px] shadow-xl group"
                  >
                    {/* Event Type Accent Line Accent */}
                    <div className={`absolute top-0 left-0 right-0 h-[2px] 
                      ${isLive ? 'bg-magenta-500 bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gradient-to-r from-cyan-500 to-blue-500'}`} 
                    />

                    {/* Top Row Context Details */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] font-mono tracking-wider">
                        <span className="text-zinc-400 uppercase font-medium">{event.type}</span>
                        <span className={`px-2 py-0.5 rounded-md font-bold uppercase tracking-widest border
                          ${isLive 
                            ? 'bg-purple-500/10 border-purple-500/30 text-purple-400 animate-pulse' 
                            : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                          }`}
                        >
                          ● {event.status}
                        </span>
                      </div>
                      
                      <h3 className="text-base font-black tracking-wide text-white group-hover:text-cyan-400 transition-colors duration-200 mt-1">
                        {event.title}
                      </h3>
                      <p className="text-xs font-semibold text-emerald-400 tracking-wide font-mono">
                        🏆 {event.reward}
                      </p>
                    </div>

                    {/* Middle Progress Track Section */}
                    <div className="my-4 space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                        <span>Slots Filled</span>
                        <span className="font-bold text-slate-200">
                          {event.joinedTeams} / {event.maxTeams} Teams
                        </span>
                      </div>
                      <div className="w-full bg-zinc-900 border border-white/5 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500
                            ${isLive ? 'bg-purple-500' : isFull ? 'bg-emerald-500' : 'bg-cyan-500'}`}
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>

                    {/* Action Hub Row Footer */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-xs font-mono bg-white/5 px-2.5 py-1 rounded border border-white/5 text-zinc-300">
                        ⚔️ {event.game}
                      </span>
                      
                      <button className={`text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-1 border
                        ${isLive 
                          ? 'bg-purple-500 text-white border-purple-400/20 hover:bg-purple-600 shadow-[0_0_15px_rgba(168,85,247,0.3)]' 
                          : 'bg-white/5 text-slate-200 border-white/10 hover:border-cyan-400/50 hover:text-cyan-400 hover:bg-cyan-500/5'
                        }`}
                      >
                        <span>{event.actionText}</span>
                        <span>{isLive ? '📺' : '→'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default home