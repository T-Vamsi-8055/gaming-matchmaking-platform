import React from 'react';
import { useNavigate } from 'react-router-dom';
import { socket } from '../../services/socket';
import { API_PORT } from '../../utils/constants';

export const Navbar = ({ onLogout }) => {
  const navigate = useNavigate();

  const handleDefaultLogout = async () => {
    const confirmed = window.confirm("Are you sure to Log out?");

    if (!confirmed) return;

    if (socket?.connected) {
        socket.disconnect();
    }

    try {
        await fetch(`http://localhost:${API_PORT}/api/auth/log-out`, {
            method: "POST",
            credentials: "include"
        });
    } catch (err) {
        console.error("Logout failed:", err);
    } finally {
        localStorage.removeItem("jwt-auth-token");
        navigate("/auth");
    }
  };

  const handleLogoutClick = onLogout || handleDefaultLogout;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex flex-row items-center justify-between bg-neutral-900/90 backdrop-blur-md border-b border-neutral-800 p-2.5 px-4 min-h-10">
      <div className="flex items-center gap-2">
        <button 
          onClick={() => navigate("/")} 
          className="hover:bg-neutral-800 text-xs font-mono tracking-widest text-zinc-300 uppercase bg-neutral-900 border border-neutral-700 px-3 py-1 rounded transition-colors cursor-pointer"
        >
          Home
        </button>
        <button 
          onClick={() => navigate("/profile")} 
          className="hover:bg-neutral-800 text-xs font-mono tracking-widest text-zinc-300 uppercase bg-neutral-900 border border-neutral-700 px-3 py-1 rounded transition-colors cursor-pointer"
        >
          Profile
        </button>
        <button 
          onClick={() => navigate("/party")} 
          className="hover:bg-neutral-800 text-xs font-mono tracking-widest text-zinc-300 uppercase bg-neutral-900 border border-neutral-700 px-3 py-1 rounded transition-colors cursor-pointer"
        >
          Parties
        </button>
      </div>

      <button 
        onClick={handleLogoutClick} 
        className="hover:bg-red-900/40 hover:border-red-600/50 text-xs font-mono tracking-widest text-red-400 uppercase bg-neutral-900 border border-neutral-700 px-3 py-1 rounded transition-colors cursor-pointer"
      >
        Log out
      </button>
    </div>
  );
};

export default Navbar;
