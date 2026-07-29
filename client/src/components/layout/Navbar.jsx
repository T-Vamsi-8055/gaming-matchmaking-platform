import React from 'react';
import { useNavigate } from 'react-router-dom';

export const Navbar = ({ onLogout }) => {
  const navigate = useNavigate();

  return (
    <div className="fixed flex flex-row z-999 min-w-screen min-h-10 sm:flex-row sm:items-center justify-between bg-neutral-900 border-b border-b-neutral-700 p-2">
      <button 
        onClick={() => navigate("/profile")} 
        className="hover:bg-neutral-600 text-xs w-24 font-mono tracking-widest text-zinc-400 uppercase bg-neutral-700 border border-neutral-500 p-0 rounded inline-block h-6 cursor-pointer"
      >
        Profile
      </button>
      <button 
        onClick={onLogout} 
        className="hover:bg-neutral-600 text-xs w-24 font-mono tracking-widest text-zinc-400 uppercase bg-neutral-700 border border-neutral-500 p-0 rounded inline-block h-6 cursor-pointer"
      >
        Log out
      </button>
      <button 
        onClick={() => navigate("/party")} 
        className="hover:bg-neutral-600 text-xs w-24 font-mono tracking-widest text-zinc-400 uppercase bg-neutral-700 border border-neutral-500 p-0 rounded inline-block h-6 cursor-pointer"
      >
        Parties
      </button>
    </div>
  );
};

export default Navbar;
