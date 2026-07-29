import React from 'react';
import Badge from '../common/Badge';

export const GameCard = ({ game, onSelect, isSelected = false }) => {
  const { title, genre, platform, activePlayers } = game;

  return (
    <div
      onClick={() => onSelect && onSelect(game)}
      className={`group relative overflow-hidden rounded-2xl bg-slate-900/80 border p-5 transition-all duration-300 cursor-pointer hover:-translate-y-1 ${
        isSelected
          ? 'border-indigo-500 ring-2 ring-indigo-500/50 shadow-lg shadow-indigo-500/20'
          : 'border-slate-800 hover:border-slate-700 hover:shadow-xl hover:shadow-slate-900/50'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-bold text-slate-100 group-hover:text-indigo-400 transition-colors">
          {title}
        </h3>
        <Badge variant={genre === 'FPS' ? 'danger' : 'purple'}>{genre}</Badge>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 mt-4 pt-3 border-t border-slate-800/80">
        <span className="flex items-center gap-1.5 font-medium">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          {activePlayers?.toLocaleString()} Active Players
        </span>
        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-semibold uppercase tracking-wider text-[10px]">
          {platform}
        </span>
      </div>
    </div>
  );
};

export default GameCard;
