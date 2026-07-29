import React from 'react';

export const GameCard = ({ game, onClick }) => {
  if (!game) return null;

  return (
    <div
      onClick={onClick}
      className="group relative flex-none w-64 h-40 rounded-xl overflow-hidden border border-white/10 bg-zinc-900 snap-start transition-all duration-300 hover:scale-[1.03] hover:border-cyan-500/50 cursor-pointer shadow-lg"
    >
      {/* Card Banner Background Asset */}
      <div 
        className="absolute inset-0 bg-cover bg-center brightness-[0.4] group-hover:brightness-[0.5] transition-all duration-300 transform group-hover:scale-105"
        style={{ backgroundImage: `url(${game.bg})` }}
      />
      
      {/* Glass Surface Overlay Content */}
      <div className="absolute inset-0 p-4 flex flex-col justify-between z-10 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent">
        {/* Top Badges */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-bold">
            {game.genre}
          </span>
          <span className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase bg-black/40 px-2 py-0.5 rounded border border-white/5">
            {game.platform}
          </span>
        </div>

        {/* Bottom Details */}
        <div className="space-y-1">
          <h3 className="font-black text-base tracking-wide text-white group-hover:text-cyan-400 transition-colors duration-200">
            {game.title}
          </h3>
          <div className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-xs font-mono text-zinc-400">
              <span className="text-emerald-400 font-bold">{game.activePlayers?.toLocaleString()}</span> Queueing
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameCard;
