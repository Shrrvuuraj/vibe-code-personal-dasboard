import { memo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ExpAnimationProps {
  event: { amount: number; type: 'gain' | 'loss' } | null;
  onDone: () => void;
}

export const ExpAnimation = memo(({ event, onDone }: ExpAnimationProps) => {
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (event) {
      setKey(k => k + 1);
      const t = setTimeout(onDone, 1500);
      return () => clearTimeout(t);
    }
  }, [event, onDone]);

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <AnimatePresence>
        {event && (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 1.1 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`font-system text-2xl font-bold ${
              event.type === 'gain' ? 'text-green-400' : 'text-destructive'
            }`}
            style={{
              textShadow: event.type === 'gain'
                ? '0 0 20px hsl(150 70% 50% / 0.6)'
                : '0 0 20px hsl(0 72% 51% / 0.6)',
            }}
          >
            {event.type === 'gain' ? '+' : '-'}{event.amount} EXP
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

ExpAnimation.displayName = 'ExpAnimation';
