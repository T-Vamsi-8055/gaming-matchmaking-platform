import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { socket, ensureSocketConnected } from "../services/socket.js";

const Match = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const chatEndRef = useRef(null);

    // Retrieve teams from location state or construct demo teams if testing directly
    const rawTeams = location.state?.gameTeam || location.state?.matchData?.teams || [];

    const defaultTeams = [
        [
            { userId: "101", gameScore: 820, username: "ShadowViper", rank: "Ascendant" },
            { userId: "102", gameScore: 640, username: "CyberKnight", rank: "Diamond" }
        ],
        [
            { userId: "201", gameScore: 790, username: "NexusReaper", rank: "Ascendant" },
            { userId: "202", gameScore: 610, username: "GhostRider", rank: "Platinum" }
        ]
    ];

    const teams = rawTeams.length >= 2 ? rawTeams : (rawTeams.length === 1 ? [rawTeams[0], []] : defaultTeams);

    // Component States
    const [messages, setMessages] = useState([
        {
            id: "sys_1",
            senderId: "SYSTEM",
            senderName: "SYSTEM ANNOUNCEMENT",
            text: "🎮 Match Lobby Created! Coordinate with your team & opponents below.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSystem: true
        },
        {
            id: "sys_2",
            senderId: "SYSTEM",
            senderName: "SYSTEM ANNOUNCEMENT",
            text: "💡 Tip: Share your In-Game ID (e.g. Riot Tag, Steam ID) or Lobby Code in the chat to start the game.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSystem: true
        }
    ]);

    const [inputText, setInputText] = useState("");
    const [isReady, setIsReady] = useState(false);
    const [copied, setCopied] = useState(false);
    const [roomCode] = useState(() => "MATCH-" + Math.floor(100000 + Math.random() * 900000));
    const [readyPlayers, setReadyPlayers] = useState({});

    // Calculate rank title from score if not provided
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

    // Auto-scroll chat to bottom
    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Socket integration for match chat
    useEffect(() => {
        ensureSocketConnected();

        const handleReceiveMessage = (msgData) => {
            setMessages((prev) => [...prev, msgData]);
        };

        const handleMatchUpdated = (matchData) => {
            if (matchData && matchData.teams) {
                const newReadyMap = {};
                matchData.teams.forEach(team => {
                    team.forEach(player => {
                        if (player.isReady) newReadyMap[player.userId] = true;
                    });
                });
                setReadyPlayers(newReadyMap);
            }
        };

        socket.on("receive-match-message", handleReceiveMessage);
        socket.on("match-updated", handleMatchUpdated);

        return () => {
            socket.off("receive-match-message", handleReceiveMessage);
            socket.off("match-updated", handleMatchUpdated);
        };
    }, []);

    // Send chat message
    const handleSendMessage = (e) => {
        e?.preventDefault();
        if (!inputText.trim()) return;

        const newMsg = {
            id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            senderId: socket.userId || "YOU",
            senderName: socket.userId ? `Player_${socket.userId}` : "You",
            text: inputText.trim(),
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSystem: false
        };

        // Emit over socket if connected
        socket.emit("send-match-message", {
            matchId: roomCode,
            text: inputText.trim(),
            senderName: newMsg.senderName
        });

        // Add to local state
        setMessages((prev) => [...prev, newMsg]);
        setInputText("");
    };

    // Share quick actions in chat
    const handleQuickShare = (text) => {
        const newMsg = {
            id: `msg_${Date.now()}`,
            senderId: socket.userId || "YOU",
            senderName: socket.userId ? `Player_${socket.userId}` : "You",
            text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isSystem: false
        };
        socket.emit("send-match-message", { matchId: roomCode, text, senderName: newMsg.senderName });
        setMessages((prev) => [...prev, newMsg]);
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
                                <span className="text-xs font-mono text-zinc-400 uppercase tracking-widest">
                                    • REAL-TIME CHAT ROOM
                                </span>
                            </div>
                            <h1 className="text-2xl md:text-3xl font-black uppercase tracking-wider text-white mt-0.5">
                                MATCH ARENA LOBBY
                            </h1>
                        </div>
                    </div>

                    {/* Room Code & Leave Action */}
                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                        <div className="flex items-center bg-zinc-950 border border-white/10 rounded-xl px-3 py-1.5 font-mono text-xs text-zinc-300 gap-2">
                            <span className="text-zinc-500 uppercase">ROOM CODE:</span>
                            <span className="font-bold text-cyan-400 tracking-wider">{roomCode}</span>
                            <button 
                                onClick={handleCopyCode} 
                                className="ml-1 text-xs bg-white/5 hover:bg-white/10 hover:text-white px-2 py-1 rounded transition-colors"
                                title="Copy Room Code"
                            >
                                {copied ? "✓ Copied" : "📋 Copy"}
                            </button>
                        </div>

                        <button
                            onClick={handleExitLobby}
                            className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200"
                        >
                            Exit Lobby
                        </button>
                    </div>
                </header>

                {/* MAIN CONTENT GRID: PLAYERS & CHAT */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
                    
                    {/* TEAMS SHOWCASE AREA (8 Cols) */}
                    <div className="lg:col-span-7 flex flex-col space-y-6">
                        
                        {/* TEAM 1 (YOUR SQUAD) */}
                        <div className="bg-gradient-to-br from-cyan-950/40 via-slate-900/60 to-zinc-950 border border-cyan-500/30 rounded-2xl p-5 shadow-xl space-y-4">
                            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-cyan-400 animate-pulse" />
                                    <h2 className="font-black text-lg uppercase tracking-wider text-cyan-300">
                                        TEAM 1 (BLUE SQUAD)
                                    </h2>
                                </div>
                                <span className="text-xs font-mono text-cyan-400/80 bg-cyan-500/10 px-2.5 py-0.5 rounded-full border border-cyan-500/20">
                                    {teams[0]?.length || 0} PLAYERS
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {teams[0]?.map((member, idx) => {
                                    const rankName = member.rank || getRankFromScore(member.gameScore);
                                    const isPlayerReady = readyPlayers[member.userId] || (idx === 0 && isReady);

                                    return (
                                        <div 
                                            key={member.userId || idx}
                                            className="bg-zinc-950/80 border border-cyan-500/20 hover:border-cyan-400/50 rounded-xl p-4 flex items-center justify-between transition-all duration-200 group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center font-bold text-cyan-400 font-mono text-sm">
                                                    P{idx + 1}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-100 group-hover:text-cyan-400 transition-colors text-sm">
                                                        {member.username || `User #${member.userId}`}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-gradient-to-r ${getRankColor(rankName)} border`}>
                                                            {rankName}
                                                        </span>
                                                        <span className="text-[11px] font-mono text-zinc-400">
                                                            Score: <strong className="text-slate-200">{member.gameScore}</strong>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <span className={`text-[10px] font-mono uppercase font-bold tracking-widest px-2 py-1 rounded border ${isPlayerReady ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
                                                    {isPlayerReady ? '✓ READY' : 'WAITING'}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* VS DIVIDER */}
                        <div className="relative flex items-center justify-center my-1">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10" />
                            </div>
                            <div className="relative z-10 px-4 py-1 rounded-full bg-zinc-900 border border-white/20 text-cyan-400 font-black font-mono text-xs uppercase tracking-widest shadow-lg">
                                ⚔️ MATCHUP VERSUS ⚔️
                            </div>
                        </div>

                        {/* TEAM 2 (RED SQUAD) */}
                        <div className="bg-gradient-to-br from-purple-950/40 via-slate-900/60 to-zinc-950 border border-purple-500/30 rounded-2xl p-5 shadow-xl space-y-4">
                            <div className="flex items-center justify-between border-b border-purple-500/20 pb-3">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-purple-400 animate-pulse" />
                                    <h2 className="font-black text-lg uppercase tracking-wider text-purple-300">
                                        TEAM 2 (RED SQUAD)
                                    </h2>
                                </div>
                                <span className="text-xs font-mono text-purple-400/80 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                                    {teams[1]?.length || 0} PLAYERS
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {teams[1]?.map((member, idx) => {
                                    const rankName = member.rank || getRankFromScore(member.gameScore);
                                    const isPlayerReady = readyPlayers[member.userId];

                                    return (
                                        <div 
                                            key={member.userId || idx}
                                            className="bg-zinc-950/80 border border-purple-500/20 hover:border-purple-400/50 rounded-xl p-4 flex items-center justify-between transition-all duration-200 group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center font-bold text-purple-400 font-mono text-sm">
                                                    E{idx + 1}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-100 group-hover:text-purple-400 transition-colors text-sm">
                                                        {member.username || `User #${member.userId}`}
                                                    </div>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-gradient-to-r ${getRankColor(rankName)} border`}>
                                                            {rankName}
                                                        </span>
                                                        <span className="text-[11px] font-mono text-zinc-400">
                                                            Score: <strong className="text-slate-200">{member.gameScore}</strong>
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <span className={`text-[10px] font-mono uppercase font-bold tracking-widest px-2 py-1 rounded border ${isPlayerReady ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
                                                    {isPlayerReady ? '✓ READY' : 'WAITING'}
                                                </span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* READY UP ACTION BUTTON */}
                        <div className="pt-2">
                            <button
                                onClick={handleToggleReady}
                                className={`w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all duration-300 shadow-xl cursor-pointer transform active:scale-[0.99] flex items-center justify-center gap-2 text-sm ${
                                    isReady 
                                        ? "bg-emerald-500 text-zinc-950 hover:bg-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.4)]" 
                                        : "bg-gradient-to-r from-cyan-500 to-blue-600 text-black hover:from-cyan-400 hover:to-blue-500 shadow-[0_0_20px_rgba(34,211,238,0.3)]"
                                }`}
                            >
                                <span>{isReady ? "✓ YOU ARE READY!" : "READY UP NOW"}</span>
                                <span className="font-normal text-xs opacity-75">({isReady ? "Click to un-ready" : "Signal squad"})</span>
                            </button>
                        </div>

                    </div>

                    {/* REAL-TIME CHAT ROOM PANEL (5 Cols) */}
                    <div className="lg:col-span-5 flex flex-col bg-slate-900/80 border border-white/10 rounded-2xl overflow-hidden shadow-2xl max-h-[720px]">
                        
                        {/* CHAT HEADER */}
                        <div className="bg-zinc-950 p-4 border-b border-white/10 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                                <h3 className="font-bold text-sm uppercase tracking-wider text-slate-100">
                                    Lobby Chat & ID Exchange
                                </h3>
                            </div>
                            <span className="text-[11px] font-mono text-zinc-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                                Live Stream
                            </span>
                        </div>

                        {/* QUICK SHARE ACTIONS BAR */}
                        <div className="bg-zinc-900/60 p-2.5 border-b border-white/5 flex gap-2 overflow-x-auto scrollbar-none">
                            <button
                                onClick={() => handleQuickShare(`My Gamer ID / Tag is: Player_${socket.userId || 'Me'}`)}
                                className="text-[11px] font-mono font-semibold bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2.5 py-1 rounded-lg shrink-0 transition-colors"
                            >
                                📋 Share My Gamer ID
                            </button>
                            <button
                                onClick={() => handleQuickShare(`Lobby Code: ${roomCode}`)}
                                className="text-[11px] font-mono font-semibold bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-1 rounded-lg shrink-0 transition-colors"
                            >
                                🔑 Share Room Code
                            </button>
                        </div>

                        {/* MESSAGES STREAM */}
                        <div className="flex-1 p-4 space-y-3 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 bg-zinc-950/50 min-h-[380px]">
                            {messages.map((msg) => (
                                <div key={msg.id} className="space-y-1">
                                    {msg.isSystem ? (
                                        <div className="bg-cyan-950/30 border border-cyan-500/20 rounded-xl p-2.5 text-xs text-cyan-300 font-mono space-y-0.5">
                                            <div className="flex items-center justify-between text-[10px] text-cyan-400/70 font-bold uppercase tracking-wider">
                                                <span>{msg.senderName}</span>
                                                <span>{msg.timestamp}</span>
                                            </div>
                                            <p className="leading-relaxed">{msg.text}</p>
                                        </div>
                                    ) : (
                                        <div className={`p-3 rounded-xl max-w-[90%] text-xs space-y-1 border ${
                                            msg.senderId === (socket.userId || "YOU")
                                                ? "ml-auto bg-cyan-950/60 border-cyan-500/30 text-cyan-100"
                                                : "mr-auto bg-zinc-900 border-white/10 text-slate-200"
                                        }`}>
                                            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 gap-3 border-b border-white/5 pb-1">
                                                <span className="font-bold text-cyan-400">{msg.senderName}</span>
                                                <span>{msg.timestamp}</span>
                                            </div>
                                            <p className="leading-relaxed break-words">{msg.text}</p>
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>

                        {/* CHAT INPUT FORM */}
                        <form onSubmit={handleSendMessage} className="p-3 bg-zinc-950 border-t border-white/10 flex gap-2">
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Type a message or share in-game ID..."
                                className="flex-1 bg-zinc-900 border border-white/10 focus:border-cyan-400 text-xs text-slate-100 rounded-xl px-3.5 py-2.5 outline-none transition-colors placeholder-zinc-500"
                            />
                            <button
                                type="submit"
                                disabled={!inputText.trim()}
                                className="bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-zinc-950 font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all shadow-md shrink-0 cursor-pointer"
                            >
                                Send
                            </button>
                        </form>

                    </div>

                </div>

            </div>
        </div>
    );
};

export default Match;