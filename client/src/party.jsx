
import React, { useState,useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { socket } from "./services/socket";
const API_PORT = 3000;

const Party = () => {
    const [inviteCode, setInviteCode] = useState("");
    const [partyName, setPartyName] = useState("");
    const [visibility, setVisibility] = useState("PUBLIC");
    const [loading, setLoading] = useState(false);
    const navigate=useNavigate();
    const [myParties, setMyParties] = useState([]);
    const [searchItem,setSearchItem]=useState("");
    const [results,setResults]=useState([]);

    const handleJoinParty = async (e) => {
        e.preventDefault();
        console.log(e);
        if (!inviteCode.trim() && !e.target.value) {
            alert("Please enter a party code");
            return;
        }

        setLoading(true);
        let finalCode="";
        if(e.target.value){finalCode=e.target.value;}
        else finalCode=inviteCode;
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
            socket.emit("created-party",data.party.id);

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
    useEffect(()=>{
        if(!searchItem.trim()){
            setResults([]);
            return;
        }
        const timer=setTimeout(()=>{
            searchParties(searchItem);
        },300);
        return()=>clearTimeout(timer);
    },[searchItem])
    const searchParties=async (item)=>{
        try{
            const token = localStorage.getItem("jwt-auth-token");

            const response=await fetch(`http://localhost:${API_PORT}/api/search-parties?searchItem=${item}`,{
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    })
            const data=await response.json();
            console.log(data.parties);
            setResults(data.parties);
        }catch(err){
            console.log(err);
        }
    }
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
            <div>
                <h2>Search parties:</h2><input type="text" placeholder="Enter public party name" value={searchItem} onChange={(e)=>setSearchItem(e.target.value)}/>
                <div className="border-2">{results.map((el)=>{return <div style={{display:"flex",gap:"10px"}}> <h3>{el[0]}</h3> <button onClick={handleJoinParty} value={el[1]} style={{backgroundColor:"#ccc",borderRadius:"5px"}}>Join Party</button></div>})}</div>
            </div>
            <div>
                <h2>My Parties</h2>

                {myParties.length === 0 ? (
                    <p>You are not in any parties.</p>
                ) : (
                    myParties.map((party) => (
                                        <div key={party.id}>
                        <h3>{party.party_name}</h3>

                        <p>
                            Members: {party.member_count}
                        </p>

                        <p>
                            Visibility: {party.visibility}
                        </p>

                        <button
                            onClick={() =>
                                navigate(`/party/${party.id}`)
                            }
                        >
                            Enter Party
                        </button>
                    </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Party;

