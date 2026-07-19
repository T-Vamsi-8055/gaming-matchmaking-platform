import React,{useEffect} from 'react'
import {socket} from './socket.js'
import { useNavigate } from 'react-router-dom'
import { useLocation } from 'react-router-dom'

const queueScreen = () => {
  const navigate=useNavigate();
  const location=useLocation();
  const handleCancelBtn=()=>{
    socket.emit("exit-queue",location.state.game,location.state.queueType);
    navigate("/");
  }
  
  useEffect(() => {
    const handleJoinedMatch = (gameTeam) => {
        navigate("/match", {
            state: { gameTeam }
        });
    };

    socket.on("joined-match", handleJoinedMatch);

    return () => {
        socket.off("joined-match", handleJoinedMatch);
    };
}, [navigate]);

  return (
    <div className="min-h-screen opacity-30">
      <button onClick={handleCancelBtn}>Cancel</button>
    </div>
  )
}

export default queueScreen
