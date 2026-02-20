import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { TIERS, getTierProgress } from '@/lib/gameEngine';
import type { PlayerState } from '@/lib/gameEngine';
import { TierBadge } from './TierBadge';

interface PlayerStatusProps {
  state: PlayerState;
}

export const PlayerStatus = memo(({ state }: PlayerStatusProps) => {
  const tier = TIERS[state.tierIndex];
  const nextTier = TIERS[state.tierIndex + 1];
  const progress = useMemo(
    () => getTierProgress(state.totalExp, state.tierIndex),
    [state.totalExp, state.tierIndex]
  );

  return (
    <div className="system-panel relative overflow-hidden">
      {/* Ambient tier glow */}
      <div
        className="absolute -top-20 -right-20 h-40 w-40 rounded-full opacity-10 blur-3xl"
        style={{ backgroundColor: tier.color }}
      />

      <div className="relative flex items-center gap-5">
        <TierBadge tierIndex={state.tierIndex} size="lg" />

        <div className="flex-1 min-w-0">
          <p className="font-system text-xs uppercase tracking-widest text-muted-foreground mb-1">
            Current Rank
          </p>
          <h2 className="text-xl font-bold truncate" style={{ color: tier.color }}>
            {tier.name}
          </h2>

          {/* EXP Bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs font-system text-muted-foreground mb-1">
              <span>EXP {state.totalExp.toLocaleString()}</span>
              {nextTier && <span>{nextTier.threshold.toLocaleString()}</span>}
            </div>
            <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: tier.color }}
                initial={{ width: 0 }}
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              />
            </div>
            {nextTier && (
              <p className="text-xs font-system text-muted-foreground mt-1">
                {Math.round(progress * 100)}% → {nextTier.name}
              </p>
            )}
          </div>

          {/* Stats row */}
          <div className="flex gap-4 mt-3">
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{state.currentStreak}</p>
              <p className="text-[10px] font-system uppercase text-muted-foreground">Streak</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">{state.longestStreak}</p>
              <p className="text-[10px] font-system uppercase text-muted-foreground">Best</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-foreground">
                {state.quests.filter(q => q.completed).length}
              </p>
              <p className="text-[10px] font-system uppercase text-muted-foreground">Cleared</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

PlayerStatus.displayName = 'PlayerStatus';
