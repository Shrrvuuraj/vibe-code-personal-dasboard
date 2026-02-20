import { memo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TIERS } from '@/lib/gameEngine';
import { TierBadge } from './TierBadge';

interface TierEvolutionOverlayProps {
  evolution: { from: number; to: number } | null;
  onDone: () => void;
}

export const TierEvolutionOverlay = memo(({ evolution, onDone }: TierEvolutionOverlayProps) => {
  useEffect(() => {
    if (evolution) {
      const t = setTimeout(onDone, 4000);
      return () => clearTimeout(t);
    }
  }, [evolution, onDone]);

  return (
    <AnimatePresence>
      {evolution && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
          onClick={onDone}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />

          {/* Content */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.1, opacity: 0 }}
            transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
            className="relative text-center"
          >
            {/* Energy burst */}
            <motion.div
              className="absolute inset-0 -m-20 rounded-full opacity-20 blur-3xl"
              style={{ backgroundColor: TIERS[evolution.to].color }}
              animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.3, 0.1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />

            <p className="font-system text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
              System Notice
            </p>

            <p className="font-system text-sm text-muted-foreground mb-6">
              Evolution detected
            </p>

            <TierBadge tierIndex={evolution.to} size="lg" />

            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-3xl font-bold mt-6"
              style={{ color: TIERS[evolution.to].color }}
            >
              {TIERS[evolution.to].name}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="font-system text-xs text-muted-foreground mt-3 tracking-wide"
            >
              [CLICK TO DISMISS]
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

TierEvolutionOverlay.displayName = 'TierEvolutionOverlay';
