import { memo } from 'react';
import { motion } from 'framer-motion';
import { TIERS } from '@/lib/gameEngine';

interface TierBadgeProps {
  tierIndex: number;
  size?: 'sm' | 'lg';
}

export const TierBadge = memo(({ tierIndex, size = 'sm' }: TierBadgeProps) => {
  const tier = TIERS[tierIndex];
  const isLarge = size === 'lg';

  return (
    <motion.div
      className="relative inline-flex items-center justify-center"
      animate={{ scale: [1, 1.05, 1] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* Glow ring */}
      <div
        className="absolute inset-0 rounded-full opacity-40 blur-md"
        style={{ backgroundColor: tier.color }}
      />
      {/* Badge */}
      <div
        className={`relative flex items-center justify-center rounded-full border-2 ${isLarge ? 'h-20 w-20 text-3xl' : 'h-10 w-10 text-lg'}`}
        style={{
          borderColor: tier.color,
          background: `radial-gradient(circle, ${tier.color}22, transparent)`,
        }}
      >
        <span className="tier-glow" style={{ color: tier.color }}>
          {tier.badge}
        </span>
      </div>
    </motion.div>
  );
});

TierBadge.displayName = 'TierBadge';
