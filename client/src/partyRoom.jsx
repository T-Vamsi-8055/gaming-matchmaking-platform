
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { socket } from "./socket.js";

const API_PORT = 3000;

const PartyRoom = () => {
    const { id } = useParams();

    const [party, setParty] = useState(null);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        const fetchParty = async () => {
            try {
                console.log("Fetching party:", id);
                const token = localStorage.getItem("jwt-auth-token");

                const response = await fetch(
                    `http://localhost:${API_PORT}/api/party/${id}`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    alert(data.message || "Failed to load party");
                    return;
                }

                setParty(data.party);

            } catch (error) {
                console.error("Error fetching party:", error);
            }
        };

        fetchParty();
    }, [id]);

    useEffect(() => {
        if (!socket.connected) {
            socket.connect();
        }

        // Join the Socket.IO party room
        socket.emit("join-party-room", id);

        const handleMessage = (data) => {
            setMessages((previousMessages) => [
                ...previousMessages,
                data,
            ]);
        };

        socket.on("party-message", handleMessage);

        return () => {
            socket.off("party-message", handleMessage);
            socket.emit("leave-party-room", id);
        };
    }, [id]);

    const handleSendMessage = (e) => {
        e.preventDefault();

        if (!message.trim()) {
            return;
        }

        socket.emit("send-party-message", {
            partyId: id,
            message: message.trim(),
        });

        setMessage("");
    };

    if (!party) {
        return <div>Loading party...</div>;
    }
    useEffect(() => {
        if (!partyId) return;

        socket.emit(
            "join-party-room",
            partyId
        );

        return () => {
            socket.emit(
                "leave-party-room",
                partyId
            );
        };
    }, [partyId]);
    useEffect(() => {

        const handleMessage = (message) => {
            setMessages((prev) => [
                ...prev,
                message
            ]);
        };

        socket.on(
            "party-message",
            handleMessage
        );

        return () => {
            socket.off(
                "party-message",
                handleMessage
            );
        };

    }, []);
    return (
        <div>
            <h1>{party.party_name}</h1>

            <p>
                Invite Code: {party.invite_code}
            </p>

            <p>
                Visibility: {party.visibility}
            </p>

            <h2>Members</h2>

            {party.members.map((member) => (
                <div key={member.userId}>
                    {member.username}

                    {member.userId === party.leader_id && (
                        <span> 👑 Host</span>
                    )}
                </div>
            ))}

            

            

            <hr />

            <h2>Party Chat</h2>

            <div>
                {messages.map((item, index) => (
                    <div key={index}>
                        <strong>
                            {item.username}:
                        </strong>{" "}
                        {item.message}
                    </div>
                ))}
            </div>

            <form onSubmit={handleSendMessage}>
                <input
                    type="text"
                    value={message}
                    onChange={(e) =>
                        setMessage(e.target.value)
                    }
                    placeholder="Type a message..."
                />

                <button type="submit">
                    Send
                </button>
            </form>
        </div>
    );
};

export default PartyRoom;

