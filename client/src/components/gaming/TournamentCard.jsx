import React from 'react';
import Badge from '../common/Badge';
import Button from '../common/Button';

export const TournamentCard = ({ tournament, onAction }) => {
  const { title, type, joinedTeams, maxTeams, status, game, reward, actionText } = tournament;
  const isFull = joinedTeams >= maxTeams;

  return (
    <div className="flex flex-col justify-between rounded-2xl bg-slate-900/90 border border-slate-800 p-6 hover:border-slate-700 transition-all duration-300 shadow-lg">
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <Badge variant={status === 'Registering' ? 'success' : 'warning'}>
            {status}
          </Badge>
          <span className="text-xs font-semibold text-slate-400 uppercase">{game}</span>
        </div>

        <h4 className="text-lg font-bold text-slate-100 mb-1">{title}</h4>
        <p className="text-xs text-slate-400 mb-4">{type}</p>

        <div className="mb-4">
          <div className="flex items-center justify-between text-xs text-slate-300 font-medium mb-1.5">
            <span>Teams Registered</span>
            <span>{joinedTeams} / {maxTeams}</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                isFull ? 'bg-amber-500' : 'bg-indigo-500'
              }`}
              style={{ width: `${Math.min((joinedTeams / maxTeams) * 100, 100)}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 rounded-xl mb-4">
          🏆 <span>{reward}</span>
        </div>
      </div>

      <Button
        variant={status === 'Registering' ? 'primary' : 'secondary'}
        size="sm"
        disabled={isFull}
        onClick={() => onAction && onAction(tournament)}
        className="w-full"
      >
        {isFull ? 'Tournament Full' : actionText || 'Join Tournament'}
      </Button>
    </div>
  );
};

export default TournamentCard;
