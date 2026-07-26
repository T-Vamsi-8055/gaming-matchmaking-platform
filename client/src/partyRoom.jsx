import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { socket } from "./socket.js";

const API_PORT = 3000;

const PartyRoom = () => {
  const { id } = useParams();
  const [party, setParty] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [livePartyState, setLivePartyState] = useState({
    game: "",
    queueType: "",
    readyUsers: [],
    members: [],
    leaderId: null,
  });
  const [userId, setUserId] = useState(null);

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

        /*
         * The party object should ideally contain:
         *
         * party.game
         * party.queue_type
         * party.start_count
         *
         * If these are not currently returned by your API,
         * the socket events below will populate them after
         * another member changes them.
         */
        if (partyData.party.game) {
        }

        if (partyData.party.queue_type) {
        }

        if (typeof partyData.party.start_count === "number") {
          setStartClicks(partyData.party.start_count);
        }
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
      navigate("/queueScreen");
    };

    const handleConnectError = (error) => {
      console.error("Socket connection error:", error.message);
    };

    const handlePartyError = (error) => {
      console.error("Party error:", error.message);
    };

    socket.on("connect", joinPartyRoom);

    socket.on("party-message", handleMessage);

    socket.on("changed-party-state", (state) => {
      setLivePartyState(state);
    });

    socket.on("party-ready-for-matchmaking", handlePartyReady);

    socket.on("connect_error", handleConnectError);

    if (!socket.connected) {
      const token = localStorage.getItem("jwt-auth-token");

      if (token) {
        socket.auth = {
          token,
        };
      }

      socket.connect();
    } else {
      joinPartyRoom();
    }

    return () => {
      socket.off("connect", joinPartyRoom);

      socket.off("party-message", handleMessage);

      socket.off("changed-party-state");

      socket.off("party-ready-for-matchmaking", handlePartyReady);

      socket.off("connect_error", handleConnectError);
      socket.off("party-error", handlePartyError);

      if (socket.connected) {
        socket.emit("leave-party-room", id);
      }
    };
  }, [id]);

  const handleSendMessage = (e) => {
    e.preventDefault();

    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return;
    }

    socket.emit("send-party-message", {
      partyId: id,
      message: trimmedMessage,
    });

    setMessage("");
  };

  const handleStartMatch = () => {
    if (!party) {
      return;
    }



    socket.emit("party-click-start", {
      partyId: id,
    });
  };



  

  const isHost = Number(party.leader_id) === Number(userId);
  const allMembersReady = livePartyState.readyUsers.length==livePartyState.members.length;

  const handleLivePartyStateChange=(e)=>{
    livePartyState[e.target.name]=e.targe.value;

    socket.emit("change-party-state",{
        partyId:id,
        partyState:livePartyState
    })
  }

  const handleLeaveParty = async () => {
    const confirmLeave = window.confirm("Leave this party?");

    if (!confirmLeave) return;

    try {
      const token = localStorage.getItem("jwt-auth-token");

      const response = await fetch(
        `http://localhost:${API_PORT}/api/party/${id}/leave`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.message);
        return;
      }

      socket.emit("leave-party-room", id);

      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };
  if (!party) {
    return <div>Loading party...</div>;
  }
  return (
    <div>
      <h1>{party.party_name}</h1>

      <p>Invite Code: {party.invite_code}</p>

      <p>Visibility: {party.visibility}</p>

      <button
        onClick={handleLeaveParty}
        className="bg-red-600 text-white px-4 py-2 rounded"
      >
        Leave Party
      </button>
      <h2>Members</h2>

      {party.members.map((member) => (
        <div key={member.userId}>
          {member.userId}: {member.username}
          {Number(member.userId) === Number(party.leader_id) && (
            <span> 👑 Host</span>
          )}
        </div>
      ))}

      <hr />

      {isHost ? (
        <div>
          <div>
            <label>Preferred Game</label>

            <select name='game' value={livePartyState.game} onChange={handleLivePartyStateChange}>
              <option value="">Select Game...</option>

              <option value="valorant">Valorant</option>

              <option value="cs2">Counter-Strike 2</option>

              <option value="lol">League of Legends</option>

              <option value="apex">Apex Legends</option>

              <option value="dota2">Dota 2</option>
            </select>
          </div>

          <div>
            <label>Queue Type</label>

            <select name='queueType' value={livePartyState.queueType} onChange={handleLivePartyStateChange}>
              <option value="">Select Queue Type...</option>

              <option value="1">Solo</option>

              <option value="2">Duo</option>

              <option value="4">Squad</option>
            </select>
          </div>
        </div>
      ) : (
        <h2>
          Game: {livePartyState.game || "Not selected"}
          <br />
          Queue Type: {livePartyState.queueType || "Not selected"}
        </h2>
      )}

      <hr />

      <div>
        <h3>Party State: {allMembersReady ? "Ready" : "Waiting"}</h3>

        <h3>
          Ready: {livePartyState.readyUsers.length}/{party.members.length}
        </h3>

        <button onClick={handleStartMatch} disabled={allMembersReady}>
          {allMembersReady ? "Everyone Ready" : "Start Match"}
        </button>
      </div>

      <hr />

      <h2>Party Chat</h2>

      <div>
        {messages.map((item) => (
          <div key={item.id}>
            <strong>
              {item.userId}: {item.username}:
            </strong>{" "}
            {item.message}
          </div>
        ))}
      </div>

      <form onSubmit={handleSendMessage}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />

        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default PartyRoom;
