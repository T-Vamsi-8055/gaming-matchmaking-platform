import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { socket } from '../services/socket.js'
import { Navbar } from '../components/layout/Navbar'
import { GameCard } from '../components/gaming/GameCard'
import { Button, Badge, Spinner } from '../components/common'
import { API_PORT, AVAILABLE_GAMES } from '../utils/constants'
import { useAuth } from '../hooks/useAuth'
import { useSocket } from '../hooks/useSocket'

const Home = () => {
  const navigate = useNavigate();

{/* States for Segment1: QUICK MATCHMAKING */}

  // Authentication State via Custom Hook
  const { user, loading } = useAuth();
  const [preferredGames, setPreferredGames] = useState([]);
  const [gameAnalytics, setGameAnalytics] = useState({});
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Matchmaking Interactive States
  const [isQueueing, setIsQueueing] = useState(false);
  const [queueTime, setQueueTime] = useState(0);
  const [game, setGame] = useState('');
  const [queueType, setQueueType] = useState('');
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


  // 1. Fetch Profile & Analytics when authenticated
  useEffect(() => {
    if (!user) return;

    const fetchProfileAndAnalytics = async () => {
      const token = localStorage.getItem("jwt-auth-token");
      try {
        const profileResponse = await fetch(`http://localhost:${API_PORT}/api/profile`, {
          method: "GET",
          credentials: "include",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          const games = profileData?.data?.preferred_games || [];
          setPreferredGames(games);

          if (games.length > 0) {
            setAnalyticsLoading(true);
            const analyticsResults = await Promise.all(
              games.map(async (game) => {
                const matchingGame = AVAILABLE_GAMES.find((item) => item.label === game);
                const slug = matchingGame?.slug || game.toLowerCase().replace(/\s+/g, "-");
                try {
                  const analyticsResponse = await fetch(`http://localhost:${API_PORT}/api/game-data/${slug}`, {
                    method: "GET",
                    credentials: "include",
                    headers: {
                      Authorization: `Bearer ${token}`,
                    },
                  });
                  if (!analyticsResponse.ok) {
                    return null;
                  }
                  const parsed = await analyticsResponse.json();
                  return { game, data: parsed.gameData };
                } catch (error) {
                  console.error(`Failed to load analytics for ${game}`, error);
                  return null;
                }
              })
            );

            const analyticsMap = analyticsResults.reduce((acc, entry) => {
              if (entry) {
                acc[entry.game] = entry.data;
              }
              return acc;
            }, {});

            setGameAnalytics(analyticsMap);
          }
        }
      } catch (error) {
        console.error("Failed to load profile/analytics:", error);
      } finally {
        setAnalyticsLoading(false);
      }
    };

    fetchProfileAndAnalytics();
  }, [user]);

  // 2. Socket Event Subscriptions via Custom Hook
  useSocket("joined-user-queue", ({ userId, game, queueType }) => {
    navigate("/queueScreen", {
      state: {
        game, queueType, partyId: "", from: ""
      }
    });
  });

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
  const handleFindMatch=() => {
    setIsQueueing(!isQueueing);
    socket.emit("join-user-queue",game,queueType);
    
  }
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  const handleLogOut =()=>{
    const response=confirm("Are you sure to Log out?")
      if(response){
      console.log(socket.connected)
      socket.disconnect();
            console.log(socket.connected)
localStorage.removeItem("jwt-auth-token");
      navigate("/auth");}
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
      <Navbar user={user} onLogout={handleLogOut} />
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
                    <label className="text-xs uppercase tracking-widest text-zinc-400 font-bold">Queue Type</label>
                    <select 
                      value={queueType}
                      onChange={(e) => setQueueType(e.target.value)}
                      disabled={isQueueing}
                      className="w-full bg-zinc-950/80 border border-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-slate-200 rounded-lg p-2.5 outline-none transition-all duration-200 text-sm cursor-pointer disabled:opacity-50"
                    >
                      <option value="">Select Queue Type...</option>
                      <option value="1">Solo</option>
                      <option value="2">Duo</option>
                      <option value="4">Squad</option>
                    </select>
                  </div>
                </div>

                {/*Matchmaking Trigger Button */}
                <button
                  onClick={handleFindMatch}
                  disabled={!game || !queueType}
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
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold tracking-wider uppercase text-slate-100">Connected Games</h2>
                  <p className="text-xs text-zinc-400">Your preferred games with live stats from the analytics feed</p>
                </div>
                {analyticsLoading && <span className="text-xs text-cyan-400 font-mono">Loading stats...</span>}
              </div>
              {preferredGames.length === 0 ? (
                <p className="mt-3 text-sm text-zinc-500">Pick your preferred games in the profile screen to see analytics here.</p>
              ) : (
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {preferredGames.map((game) => {
                    const analytics = gameAnalytics[game];
                    return (
                      <div key={game} className="rounded-xl border border-white/10 bg-zinc-950/70 p-3">
                        <div className="flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-slate-100">{game}</h3>
                          <span className="text-[10px] uppercase tracking-widest text-cyan-400">{analytics?.rank || 'Unranked'}</span>
                        </div>
                        {analytics ? (
                          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
                            <div className="rounded-lg bg-white/5 p-2">
                              <div className="text-zinc-500">SR</div>
                              <div className="mt-1 font-semibold text-slate-100">{analytics.skill_rating}</div>
                            </div>
                            <div className="rounded-lg bg-white/5 p-2">
                              <div className="text-zinc-500">Games</div>
                              <div className="mt-1 font-semibold text-slate-100">{analytics.games_played}</div>
                            </div>
                            <div className="rounded-lg bg-white/5 p-2">
                              <div className="text-zinc-500">Wins</div>
                              <div className="mt-1 font-semibold text-slate-100">{analytics.wins}</div>
                            </div>
                          </div>
                        ) : (
                          <p className="mt-3 text-sm text-zinc-500">No analytics data is available for this game yet.</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
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
                  <GameCard
                    key={g.id}
                    game={g}
                    onClick={() => setGame(g.title.toLowerCase())}
                  />
                ))
              ) : (
                <div className="w-full text-center py-12 bg-white/5 border border-white/10 border-dashed rounded-xl text-zinc-500 text-sm">
                  No matching games deploying parameters found.
                </div>
              )}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

export default Home