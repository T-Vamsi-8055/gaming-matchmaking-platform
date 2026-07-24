
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { socket } from "./socket.js";

const API_PORT = 3000;

const PartyRoom = () => {
    const { id } = useParams();

    const [party, setParty] = useState(null);
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);

    // Fetch party details and previous messages
    useEffect(() => {
        if (!id) return;

        const fetchParty = async () => {
            try {
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
                    alert(
                        data.message ||
                        "Failed to load party"
                    );
                    return;
                }

                setParty(data.party);
                setMessages(data.messages || []);

            } catch (error) {
                console.error(
                    "Error fetching party:",
                    error
                );
            }
        };

        fetchParty();
    }, [id]);


    // Socket connection and party chat
    useEffect(() => {
        if (!id) return;

        const joinPartyRoom = () => {
            socket.emit(
                "join-party-room",
                id
            );
        };

        const handleMessage = (data) => {
            setMessages((previousMessages) => [
                ...previousMessages,
                data,
            ]);
        };

        const handleConnectError = (error) => {
            console.error(
                "Socket connection error:",
                error.message
            );
        };

        // Register listeners
        socket.on(
            "connect",
            joinPartyRoom
        );

        socket.on(
            "party-message",
            handleMessage
        );

        socket.on(
            "connect_error",
            handleConnectError
        );


        // Connect if necessary
        if (!socket.connected) {
            const token = localStorage.getItem(
                "jwt-auth-token"
            );

            socket.auth = {
                token,
            };

            socket.connect();

        } else {
            // Already connected
            joinPartyRoom();
        }


        // Cleanup
        return () => {
            socket.off(
                "connect",
                joinPartyRoom
            );

            socket.off(
                "party-message",
                handleMessage
            );

            socket.off(
                "connect_error",
                handleConnectError
            );

            if (socket.connected) {
                socket.emit(
                    "leave-party-room",
                    id
                );
            }
        };

    }, [id]);


    const handleSendMessage = (e) => {
        e.preventDefault();

        const trimmedMessage = message.trim();

        if (!trimmedMessage) {
            return;
        }

        socket.emit(
            "send-party-message",
            {
                partyId: id,
                message: trimmedMessage,
            }
        );

        setMessage("");
    };


    if (!party) {
        return (
            <div>
                Loading party...
            </div>
        );
    }


    return (
        <div>

            <h1>
                {party.party_name}
            </h1>


            <p>
                Invite Code: {party.invite_code}
            </p>


            <p>
                Visibility: {party.visibility}
            </p>


            <h2>
                Members
            </h2>


            {party.members.map((member) => (
                <div key={member.userId}>

                    {member.username}

                    {member.userId === party.leader_id && (
                        <span>
                            {" "}👑 Host
                        </span>
                    )}

                </div>
            ))}


            <hr />


            <h2>
                Party Chat
            </h2>


            <div>
                {messages.map((item) => (
                    <div key={item.id}>

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

