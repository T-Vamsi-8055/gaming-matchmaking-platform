import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "../services/socket";
import { API_PORT } from "../utils/constants";
import { Button, Input, Badge } from "../components/common";
import { Navbar } from "../components/layout/Navbar";

const Party = () => {
    const [inviteCode, setInviteCode] = useState("");
    const [partyName, setPartyName] = useState("");
    const [visibility, setVisibility] = useState("PUBLIC");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const [myParties, setMyParties] = useState([]);
    const [searchItem, setSearchItem] = useState("");
    const [results, setResults] = useState([]);

    const handleJoinParty = async (e) => {
        e.preventDefault();
        console.log(e);
        if (!inviteCode.trim() && !e.target.value) {
            alert("Please enter a party code");
            return;
        }

        setLoading(true);
        let finalCode = "";
        if (e.target.value) { finalCode = e.target.value; }
        else finalCode = inviteCode;
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
                        inviteCode: finalCode.trim(),
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
            socket.emit("created-party", data.party.id);

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

    useEffect(() => {
        const fetchMyParties = async () => {
            try {
                const token = localStorage.getItem("jwt-auth-token");

                const response = await fetch(
                    `http://localhost:${API_PORT}/api/my-parties`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(
                        data.message || "Failed to fetch parties"
                    );
                }
                setMyParties(data.parties);

            } catch (error) {
                console.error(
                    "Error fetching my parties:",
                    error
                );
            }
        };

        fetchMyParties();
    }, []);

    useEffect(() => {
        if (!searchItem.trim()) {
            setResults([]);
            return;
        }
        const timer = setTimeout(() => {
            searchParties(searchItem);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchItem]);

    const searchParties = async (item) => {
        try {
            const token = localStorage.getItem("jwt-auth-token");

            const response = await fetch(`http://localhost:${API_PORT}/api/search-parties?searchItem=${item}`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await response.json();
            console.log(data.parties);
            setResults(data.parties);
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-400 relative overflow-hidden">
            <Navbar />

            {/* Ambient Background Glows */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[140px] pointer-events-none" />

            {/* Main Content Area */}
            <div className="max-w-[1600px] mx-auto px-4 pt-20 pb-12 flex justify-center relative z-10">
                <main className="w-full max-w-2xl space-y-8">

                    {/* Join Party */}
                    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-zinc-900 to-black border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl space-y-4">
                        <h2 className="text-lg font-bold tracking-wider uppercase text-slate-100">Join Party</h2>

                        <form onSubmit={handleJoinParty} className="space-y-4">
                            <Input
                                label="Party Code"
                                name="inviteCode"
                                value={inviteCode}
                                onChange={(e) => setInviteCode(e.target.value)}
                                placeholder="Enter party code"
                            />

                            <Button type="submit" variant="primary" isLoading={loading} disabled={loading} className="w-full">
                                Join Party
                            </Button>
                        </form>
                    </section>

                    {/* Create Party */}
                    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-zinc-900 to-black border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl space-y-4">
                        <h2 className="text-lg font-bold tracking-wider uppercase text-slate-100">Create Party</h2>

                        <form onSubmit={handleCreateParty} className="space-y-4">
                            <Input
                                label="Party Name"
                                name="partyName"
                                value={partyName}
                                onChange={(e) => setPartyName(e.target.value)}
                                placeholder="Enter party name"
                            />

                            <div className="flex items-center gap-6 pt-1">
                                <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-300">
                                    <input
                                        type="radio"
                                        name="visibility"
                                        value="PUBLIC"
                                        checked={visibility === "PUBLIC"}
                                        onChange={(e) => setVisibility(e.target.value)}
                                        className="accent-cyan-400"
                                    />
                                    <span>Public</span>
                                </label>

                                <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-300">
                                    <input
                                        type="radio"
                                        name="visibility"
                                        value="PRIVATE"
                                        checked={visibility === "PRIVATE"}
                                        onChange={(e) => setVisibility(e.target.value)}
                                        className="accent-cyan-400"
                                    />
                                    <span>Private</span>
                                </label>
                            </div>

                            <Button type="submit" variant="success" isLoading={loading} disabled={loading} className="w-full">
                                Create Party
                            </Button>
                        </form>
                    </section>

                    {/* Search Parties */}
                    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-zinc-900 to-black border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl space-y-4">
                        <h2 className="text-lg font-bold tracking-wider uppercase text-slate-100">Search Public Parties</h2>
                        <Input
                            name="searchParties"
                            placeholder="Enter public party name"
                            value={searchItem}
                            onChange={(e) => setSearchItem(e.target.value)}
                        />
                        <div className="space-y-2">
                            {results.map((el) => (
                                <div key={el[1]} className="flex items-center justify-between bg-zinc-950/60 border border-white/10 rounded-xl p-3">
                                    <span className="text-sm font-bold text-slate-200">{el[0]}</span>
                                    <Button onClick={handleJoinParty} value={el[1]} size="sm" variant="secondary">
                                        Join Party
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* My Parties */}
                    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-zinc-900 to-black border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl space-y-4">
                        <h2 className="text-lg font-bold tracking-wider uppercase text-slate-100">My Parties</h2>

                        {myParties.length === 0 ? (
                            <p className="text-sm text-zinc-500 font-mono">You are not in any parties.</p>
                        ) : (
                            <div className="space-y-3">
                                {myParties.map((party) => (
                                    <div key={party.id} className="flex items-center justify-between bg-zinc-950/60 border border-white/10 rounded-xl p-4">
                                        <div className="space-y-1">
                                            <h3 className="text-sm font-bold text-slate-100">{party.party_name}</h3>
                                            <div className="flex items-center gap-2">
                                                <Badge size="sm" variant="info">{party.member_count} members</Badge>
                                                <Badge size="sm" variant={party.visibility === "PUBLIC" ? "success" : "warning"}>{party.visibility}</Badge>
                                            </div>
                                        </div>
                                        <Button onClick={() => navigate(`/party/${party.id}`)} size="sm" variant="outline">
                                            Enter Party
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>
                </main>
            </div>
        </div>
    );
};

export default Party;
