import React from 'react'

const API_PORT=3000
const party = () => {
    const handleJoinParty=()=>{
        try {
            const response=await fetch(`http://localhost:${API_PORT}/api/join-party`);
        }catch(err){
            console.log("Error",err);
        }
    }
    const handleCreateParty=()=>{
        try {
            const response=await fetch(`http://localhost:${API_PORT}/api/create-party`);
        }catch(err){
            console.log("Error",err);
        }
    }
  return (
    <div>
      <div>
        <form onSubmit={handleJoinParty}>
        <label htmlFor="partName" >Enter the party code to join</label><input name="partName" type="text" /><button type="submit">Join Party</button>
        </form>
        <form onSubmit={}>
            <h2>Create Party</h2>
            <button type="radio">Public</button>
            <button type="radio">Private</button>
            <button type="submit">Create Party</button>
        </form>
      </div>
    </div>
  )
}

export default party
