import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { socket, ensureSocketConnected } from "../services/socket.js";

const Match = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const chatEndRef = useRef(null);

    // Retrieve teams from location state
    const rawTeams = location.state?.gameTeam || location.state?.matchData?.teams;

    // Default testing array (kept intact for demo mode)
    const defaultTeams = [
        [
            { userId: "101", gamerId: "ShadowViper#NA1", gameScore: 820, username: "ShadowViper", rank: "Ascendant" },
            { userId: "102", gamerId: "CyberKnight#EUW", gameScore: 640, username: "CyberKnight", rank: "Diamond" }
        ],
        [
            { userId: "201", gamerId: "NexusReaper#KR1", gameScore: 790, username: "NexusReaper", rank: "Ascendant" },
            { userId: "202", gamerId: "GhostRider#OCE", gameScore: 610, username: "GhostRider", rank: "Platinum" }
        ]
    ];

    // Priority: Real backend data first -> location.state.players -> default test arrays
    const rawPlayersList = location.state?.players;
    const teams = rawTeams && rawTeams.length > 0
        ? (rawTeams.length >= 2 ? rawTeams : [rawTeams[0], []])
        : defaultTeams;

    // Use backend players list if passed directly, otherwise flatten teams array
    const players = (rawPlayersList && rawPlayersList.length > 0)
        ? rawPlayersList
        : (rawTeams && rawTeams.length > 0 ? rawTeams.flat() : teams.flat());

    const [inputText, setInputText] = useState("");
    const [isReady, setIsReady] = useState(false);
    const [copied, setCopied] = useState(false);
    const [roomCode] = useState(() => "MATCH-" + Math.floor(100000 + Math.random() * 900000));
    const [readyPlayers, setReadyPlayers] = useState({});

    // Calculate rank title from score if rank/title is not explicitly provided
    const getRankFromScore = (score) => {
        if (!score) return "Silver";
        if (score >= 900) return "Radiant";
        if (score >= 800) return "Immortal";
        if (score >= 700) return "Ascendant";
        if (score >= 600) return "Diamond";
        if (score >= 500) return "Platinum";
        if (score >= 400) return "Gold";
        if (score >= 300) return "Silver";
        return "Bronze";
    };

    const getRankColor = (rank) => {
        switch (rank) {
            case "Radiant": return "from-amber-400 to-yellow-500 text-yellow-300 border-yellow-400/40";
            case "Immortal": return "from-red-500 to-rose-600 text-rose-300 border-rose-500/40";
            case "Ascendant": return "from-emerald-400 to-teal-500 text-emerald-300 border-emerald-400/40";
            case "Diamond": return "from-cyan-400 to-blue-500 text-cyan-300 border-cyan-400/40";
            case "Platinum": return "from-teal-300 to-cyan-400 text-teal-200 border-teal-300/40";
            case "Gold": return "from-yellow-400 to-amber-500 text-amber-200 border-amber-400/40";
            default: return "from-slate-400 to-zinc-500 text-slate-300 border-slate-400/40";
        }
    };

    // Toggle Ready State
    const handleToggleReady = () => {
        const nextState = !isReady;
        setIsReady(nextState);

        const readyMsgText = nextState 
            ? "✅ Status update: READY FOR MATCH!" 
            : "⏳ Status update: NOT READY";

        socket.emit("toggle-ready", { matchId: roomCode });
        handleQuickShare(readyMsgText);
    };

    // Copy Lobby Code to Clipboard
    const handleCopyCode = () => {
        navigator.clipboard.writeText(roomCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Exit Match Lobby
    const handleExitLobby = () => {
        if (confirm("Are you sure you want to exit the Match Lobby?")) {
            socket.emit("leave-match-lobby", { matchId: roomCode });
            navigate("/");
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-400 p-4 md:p-8 flex flex-col justify-between relative overflow-x-hidden">
            {/* Background Glows */}
            <div className="fixed top-0 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
            <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[140px] pointer-events-none" />

            <div className="max-w-7xl mx-auto w-full space-y-6 relative z-10 flex-1 flex flex-col">
                
                {/* LOBBY HEADER BAR */}
                <header className="bg-slate-900/80 border border-white/10 backdrop-blur-xl rounded-2xl p-4 md:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black text-zinc-950 text-xl shadow-[0_0_20px_rgba(34,211,238,0.4)] shrink-0">
                            VS
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 font-bold px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
                                    LOBBY ACTIVE
                                </span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-wider text-white mt-0.5">
                                MATCH ARENA LOBBY
                            </h1>
                        </div>
                    </div>

                    {/* Room Code & Leave Action */}
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                        <button
                            onClick={handleExitLobby}
                            className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200"
                        >
                            Exit Lobby
                        </button>
                    </div>
                </header>

                {/* MAIN CONTENT AREA */}
                <div className="flex justify-center flex-1">
                    
                    {/* PLAYERS SHOWCASE AREA */}
                    <div className="w-full max-w-4xl flex flex-col space-y-6">
                        
                        {/* 4-PLAYER GRID CONTAINER */}
                        <div className="bg-gradient-to-br from-cyan-950/40 via-slate-900/60 to-zinc-950 border border-cyan-500/30 rounded-2xl p-5 shadow-xl space-y-4">
                            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
                                    <h2 className="font-black text-lg uppercase tracking-wider text-cyan-300">
                                        MATCH PLAYERS
                                    </h2>
                                </div>
                                <span className="text-xs font-mono text-cyan-400/80 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                                    {players.length} PLAYERS
                                </span>
                            </div>

                            {/* 2x2 Grid Layout for 4 Players */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {players.map((member, idx) => {
                                    // Handles backend vs testing object keys smoothly
                                    const usernameDisplay = member.username || member.name || `User #${member.userId || idx + 1}`;
                                    const rankName = member.rank || member.title || getRankFromScore(member.gameScore);
                                    const gamerIdDisplay = member.gamerId || member.gameId || `ID#${member.userId || idx}`;

                                    return (
                                        <div 
                                            key={member.userId || member.id || idx}
                                            className="bg-zinc-950/80 border border-cyan-500/20 hover:border-cyan-400/50 rounded-xl p-4 flex items-center justify-between transition-all duration-200 group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center font-bold text-cyan-400 font-mono text-sm">
                                                    P{idx + 1}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-100 group-hover:text-cyan-400 transition-colors text-sm">
                                                        {usernameDisplay}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-gradient-to-r ${getRankColor(rankName)} border`}>
                                                            {rankName}
                                                        </span>
                                                        <span className="text-[11px] font-mono text-zinc-400">
                                                            Gamer ID: <strong className="text-slate-200">{gamerIdDisplay}</strong>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                    </div>

                </div>

            </div>
        </div>
    );
};

export default Match;