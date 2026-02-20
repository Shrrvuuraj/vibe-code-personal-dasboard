import { memo } from 'react';
import { TIERS, type PlayerState } from '@/lib/gameEngine';

interface TierRoadmapProps {
  state: PlayerState;
}

export const TierRoadmap = memo(({ state }: TierRoadmapProps) => {
  return (
    <div className="system-panel">
      <h3 className="font-system text-sm uppercase tracking-widest text-muted-foreground mb-4">
        Evolution Path
      </h3>
      <div className="space-y-1.5">
        {TIERS.map((tier, i) => {
          const isActive = i === state.tierIndex;
          const isPast = i < state.tierIndex;
          const isFuture = i > state.tierIndex;

          return (
            <div
              key={tier.name}
              className={`flex items-center gap-3 py-1.5 px-2 rounded text-xs font-system transition-all ${
                isActive ? 'bg-secondary/80' : ''
              } ${isFuture ? 'opacity-30' : ''}`}
            >
              <span
                className="text-base w-6 text-center"
                style={{ color: isPast || isActive ? tier.color : undefined }}
              >
                {tier.badge}
              </span>
              <span
                className="flex-1 truncate"
                style={{ color: isActive ? tier.color : undefined }}
              >
                {tier.name}
              </span>
              <span className="text-muted-foreground text-[10px]">
                {tier.threshold.toLocaleString()}
              </span>
              {isActive && (
                <span className="text-[10px] text-primary">◄</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

TierRoadmap.displayName = 'TierRoadmap';
