
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_PORT = 3000;

const Party = () => {
    const [inviteCode, setInviteCode] = useState("");
    const [partyName, setPartyName] = useState("");
    const [visibility, setVisibility] = useState("PUBLIC");
    const [loading, setLoading] = useState(false);
    const navigate=useNavigate();
    const handleJoinParty = async (e) => {
        e.preventDefault();

        if (!inviteCode.trim()) {
            alert("Please enter a party code");
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem("jwt-auth-token");

            const response = await fetch(
                `http://localhost:${API_PORT}/api/join-party`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        inviteCode: inviteCode.trim(),
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Failed to join party");
                return;
            }

            navigate(`/party/${data.partyId}`);

            alert("Joined party successfully");

            console.log("Joined party:", data);

        } catch (err) {
            console.error("Error joining party:", err);
            alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateParty = async (e) => {
        e.preventDefault();

        if (!partyName.trim()) {
            alert("Please enter a party name");
            return;
        }

        setLoading(true);

        try {
            const token = localStorage.getItem("jwt-auth-token");

            const response = await fetch(
                `http://localhost:${API_PORT}/api/create-party`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        partyName: partyName.trim(),
                        visibility,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                alert(data.message || "Failed to create party");
                return;
            }

            alert("Party created successfully");

           console.log("Created party:", data);

            navigate(`/party/${data.party.id}`);

          

        } catch (err) {
            console.error("Error creating party:", err);
            alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {/* Join Party */}
            <div>
                <h2>Join Party</h2>

                <form onSubmit={handleJoinParty}>
                    <label htmlFor="inviteCode">
                        Enter the party code
                    </label>

                    <input
                        id="inviteCode"
                        name="inviteCode"
                        type="text"
                        value={inviteCode}
                        onChange={(e) => setInviteCode(e.target.value)}
                        placeholder="Enter party code"
                    />

                    <button type="submit" disabled={loading}>
                        {loading ? "Please wait..." : "Join Party"}
                    </button>
                </form>
            </div>

            {/* Create Party */}
            <div>
                <h2>Create Party</h2>

                <form onSubmit={handleCreateParty}>
                    <label htmlFor="partyName">
                        Party Name
                    </label>

                    <input
                        id="partyName"
                        name="partyName"
                        type="text"
                        value={partyName}
                        onChange={(e) => setPartyName(e.target.value)}
                        placeholder="Enter party name"
                    />

                    <div>
                        <label>
                            <input
                                type="radio"
                                name="visibility"
                                value="PUBLIC"
                                checked={visibility === "PUBLIC"}
                                onChange={(e) =>
                                    setVisibility(e.target.value)
                                }
                            />
                            Public
                        </label>

                        <label>
                            <input
                                type="radio"
                                name="visibility"
                                value="PRIVATE"
                                checked={visibility === "PRIVATE"}
                                onChange={(e) =>
                                    setVisibility(e.target.value)
                                }
                            />
                            Private
                        </label>
                    </div>

                    <button type="submit" disabled={loading}>
                        {loading ? "Creating..." : "Create Party"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Party;

