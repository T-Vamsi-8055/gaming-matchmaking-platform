import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { socket } from "../services/socket.js";
import { useNavigate } from "react-router-dom";
import { API_PORT, AVAILABLE_GAMES } from "../utils/constants";
import { Button, Input, Badge, Spinner } from "../components/common";
import { Navbar } from "../components/layout/Navbar";

const PartyRoom = () => {
  const { id } = useParams();
  const [party, setParty] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const [livePartyState, setLivePartyState] = useState({
    game: "",
    queueType: "",
    readyMembers: [],
    members: [],
    leaderId: null,
  });
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    const fetchParty = async () => {
      try {
        const token = localStorage.getItem("jwt-auth-token");

        const [partyResponse, meResponse] = await Promise.all([
          fetch(`http://localhost:${API_PORT}/api/party/${id}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),

          fetch(`http://localhost:${API_PORT}/api/auth/me`, {
            method: "GET",
            credentials: "include",
          }),
        ]);

        const partyData = await partyResponse.json();
        const meData = await meResponse.json();

        if (!partyResponse.ok) {
          alert(partyData.message || "Failed to load party");
          return;
        }

        if (!meResponse.ok) {
          alert(meData.message || "Failed to load user details");
          return;
        }

        setUserId(meData.id);
        setParty(partyData.party);
        setMessages(partyData.messages || []);
        socket.emit("open-party", partyData.party.id);

      } catch (error) {
        console.error("Error fetching party:", error);
      }
    };

    fetchParty();
  }, [id]);

  useEffect(() => {
    if (!id) return;

    const joinPartyRoom = () => {
      socket.emit("join-party-room", id);
    };

    const handleMessage = (data) => {
      setMessages((previousMessages) => [...previousMessages, data]);
    };

    const handlePartyReady = (data) => {
      console.log("Party is ready for matchmaking:", data);
      const game = data.game;
      const queueType = data.queueType;
      navigate("/queueScreen", { state: { game, queueType, partyId: id, from: `party/${id}` } });
    };

    const handleConnectError = (error) => {
      console.error("Socket connection error:", error.message);
    };
    const handleConnectSystemError = (error) => {
      console.error("Socket connection error:", error.message);
    };

    const handlePartyError = (error) => {
      console.error("Party error:", error.message);
    };

    const handleChangeState = (state) => {
      setLivePartyState(state);
      if (state.readyMembers.includes(userId)) setIsReady(true);
    };

    socket.on("connect", joinPartyRoom);
    socket.on("party-message", handleMessage);
    socket.on("changed-party-state", handleChangeState);
    socket.on("party-ready-for-matchmaking", handlePartyReady);
    socket.on("connect_error", handleConnectSystemError);
    socket.on("connect-error", handleConnectError);
    socket.on("party-error", handlePartyError);

    if (!socket.connected) {
      const token = localStorage.getItem("jwt-auth-token");
      if (token) {
        socket.auth = { token };
      }
      socket.connect();
    } else {
      joinPartyRoom();
    }

    return () => {
      socket.off("connect", joinPartyRoom);
      socket.off("party-message", handleMessage);
      socket.off("changed-party-state", handleChangeState);
      socket.off("party-ready-for-matchmaking", handlePartyReady);
      socket.off("connect_error", handleConnectSystemError);
      socket.off("connect-error", handleConnectError);
      socket.off("party-error", handlePartyError);

      if (!socket.connected) {
        socket.emit("leave-party-room", id);
      }
    };
  }, [id, navigate, userId]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    socket.emit("send-party-message", {
      partyId: id,
      message: trimmedMessage,
    });

    setMessage("");
  };

  const handleStartMatch = () => {
    if (!party) return;
    try {
      if (livePartyState.readyMembers.includes(userId)) {
        const newState = livePartyState.readyMembers;
        const index = newState.indexOf(userId);
        newState.splice(index, 1);

        setLivePartyState((prev) => ({ ...prev, readyMembers: newState }));
        setIsReady(false);
        const temp = { ...livePartyState, readyMembers: newState };
        socket.emit("change-party-state", {
          partyId: id,
          partyState: temp,
        });
        return;
      }

      if (!livePartyState.game || !livePartyState.queueType) {
        if (!livePartyState.game && !livePartyState.queueType) {
          alert("Please select both a game and a queue type before starting.");
        } else if (!livePartyState.game) {
          alert("Please select a game before starting.");
        } else {
          alert("Please select a queue type before starting.");
        }
        return;
      }
      const newState = livePartyState.readyMembers;
      newState.push(userId);
      setIsReady(true);

      setLivePartyState((prev) => ({ ...prev, readyMembers: newState }));
      const temp = { ...livePartyState, readyMembers: newState };
      socket.emit("change-party-state", {
        partyId: id,
        partyState: temp,
      });

      socket.emit("party-click-start", {
        partyId: id,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleLivePartyStateChange = (e) => {
    setLivePartyState((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    const temp = { ...livePartyState, [e.target.name]: e.target.value };
    socket.emit("change-party-state", {
      partyId: id,
      partyState: temp,
    });
  };

  const handleLeaveParty = async () => {
    const confirmLeave = window.confirm("Leave this party?");
    if (!confirmLeave) return;

    try {
      const token = localStorage.getItem("jwt-auth-token");
      const response = await fetch(
        `http://localhost:${API_PORT}/api/leave-party/${id}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (!response.ok) {
        alert(data.message);
        return;
      }

      socket.emit("leave-party-room", id);
      navigate("/");
    } catch (err) {
      console.error(err);
    }
  };

  if (!party) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const isHost = Number(livePartyState.leaderId || party.leader_id) === Number(userId);
  const allMembersReady = livePartyState.readyMembers.length === livePartyState.members.length && livePartyState.members.length > 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-400 relative overflow-hidden">
      <Navbar />

      {/* Main Content Area */}
      <div className="max-w-[1600px] mx-auto px-4 pt-20 pb-12 flex justify-center relative z-10">
        <main className="w-full max-w-3xl space-y-6">

          {/* Party Header */}
          <div className="flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl p-5 shadow-xl">
            <div className="space-y-1 text-left">
              <h1 className="text-xl font-black tracking-wider uppercase text-slate-100">{party.party_name}</h1>
              <div className="flex items-center gap-2">
                <Badge size="sm" variant="info">Code: {party.invite_code}</Badge>
                <Badge size="sm" variant={party.visibility === "PUBLIC" ? "success" : "warning"}>{party.visibility}</Badge>
              </div>
            </div>
            <Button onClick={handleLeaveParty} variant="danger" size="sm">
              Leave Party
            </Button>
          </div>

          {/* Members */}
          <section className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3 shadow-xl">
            <h2 className="text-xs font-bold tracking-wider uppercase text-zinc-400 text-left">Members</h2>
            <div className="space-y-2">
              {( party.members).map((member) => (
                <div key={member.userId?member.userId:member} className="flex items-center justify-between bg-zinc-950/60 border border-white/10 rounded-xl p-3">
                  <span className="text-sm font-bold text-slate-200">{member.username}</span>
                  <div className="flex items-center gap-2">
                    {Number(member.userId?member.userId:member) === Number(livePartyState.leaderId || party.leader_id) && (
                      <Badge size="sm" variant="warning">👑 Host</Badge>
                    )}
                    <span className="text-xs font-mono text-zinc-500">#{member.userId?member.userId:member}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Game & Queue Selection */}
          <section className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
            <h2 className="text-xs font-bold tracking-wider uppercase text-zinc-400 text-left">Match Settings</h2>
            {isHost ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="text-left space-y-1.5">
                  <label className="text-xs uppercase tracking-widest text-zinc-400 font-bold">Preferred Game</label>
                  <select
                    name="game"
                    value={livePartyState.game}
                    onChange={handleLivePartyStateChange}
                    className="w-full bg-zinc-950/80 border border-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-slate-200 rounded-xl p-2.5 outline-none transition-all duration-200 text-sm cursor-pointer"
                  >
                    <option value="">Select Game...</option>
                    {AVAILABLE_GAMES.map((g) => (
                      <option key={g.slug} value={g.slug}>{g.label}</option>
                    ))}
                  </select>
                </div>

                <div className="text-left space-y-1.5">
                  <label className="text-xs uppercase tracking-widest text-zinc-400 font-bold">Queue Type</label>
                  <select
                    name="queueType"
                    value={livePartyState.queueType}
                    onChange={handleLivePartyStateChange}
                    className="w-full bg-zinc-950/80 border border-white/10 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 text-slate-200 rounded-xl p-2.5 outline-none transition-all duration-200 text-sm cursor-pointer"
                  >
                    <option value="">Select Queue Type...</option>
                    <option value="1">Solo</option>
                    <option value="2">Duo</option>
                    <option value="4">Squad</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Badge variant="info">Game: {livePartyState.game || "Not selected"}</Badge>
                <Badge variant="info">Queue: {livePartyState.queueType || "Not selected"}</Badge>
              </div>
            )}
          </section>

          {/* Ready Status & Start */}
          <section className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="space-y-1 text-left">
                <h2 className="text-xs font-bold tracking-wider uppercase text-zinc-400">Party Status</h2>
                <div className="flex items-center gap-2">
                  <Badge variant={allMembersReady ? "success" : "warning"}>
                    {allMembersReady ? "All Ready" : "Waiting"}
                  </Badge>
                  <span className="text-xs font-mono text-zinc-400">
                    {livePartyState.readyMembers.length}/{livePartyState.members.length} ready
                  </span>
                </div>
              </div>
              <Button
                onClick={handleStartMatch}
                disabled={allMembersReady}
                variant={isReady ? "danger" : "success"}
              >
                {(allMembersReady && isReady) ? "Everyone Ready" : (!allMembersReady && isReady) ? "Exit Match" : "Start Match"}
              </Button>
            </div>
          </section>

          {/* Party Chat */}
          <section className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl">
            <h2 className="text-xs font-bold tracking-wider uppercase text-zinc-400 text-left">Party Chat</h2>

            <div className="max-h-60 overflow-y-auto space-y-2 text-left scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {messages.map((item) => (
                <div key={item.id} className="bg-zinc-900/60 border border-white/5 rounded-xl p-3">
                  <span className="text-xs font-bold text-cyan-400">{item.username}</span>
                  <span className="text-xs text-zinc-500 ml-1 font-mono">#{item.userId}</span>
                  <p className="text-sm text-slate-300 mt-0.5">{item.message}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                name="chatMessage"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1"
              />
              <Button type="submit" size="md" variant="secondary">
                Send
              </Button>
            </form>
          </section>

        </main>
      </div>
    </div>
  );
};

export default PartyRoom;
