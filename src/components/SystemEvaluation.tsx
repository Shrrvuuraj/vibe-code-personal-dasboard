import { memo, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { generateEvaluation, type PlayerState } from '@/lib/gameEngine';
import { Terminal } from 'lucide-react';

interface SystemEvaluationProps {
  state: PlayerState;
}

export const SystemEvaluation = memo(({ state }: SystemEvaluationProps) => {
  const [open, setOpen] = useState(false);
  const evaluation = useMemo(() => generateEvaluation(state), [state]);

  return (
    <div className="system-panel">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 text-left"
      >
        <Terminal className="h-4 w-4 text-primary" />
        <h3 className="font-system text-sm uppercase tracking-widest text-muted-foreground flex-1">
          System Evaluation
        </h3>
        <span className="text-[10px] font-system text-primary">
          {open ? '[CLOSE]' : '[OPEN]'}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 space-y-3 font-system text-xs">
              {/* Lines appear sequentially */}
              {[
                { label: 'EXP ACQUIRED', value: `+${evaluation.expGained}`, color: 'text-green-400' },
                { label: 'EXP DEDUCTED', value: `-${evaluation.expLost}`, color: 'text-destructive' },
                { label: 'WEAK ZONE', value: evaluation.weakZone, color: 'text-yellow-400' },
              ].map((line, i) => (
                <motion.div
                  key={line.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.15 }}
                  className="flex gap-2"
                >
                  <span className="text-muted-foreground shrink-0">{'>'}</span>
                  <span className="text-muted-foreground shrink-0">{line.label}:</span>
                  <span className={line.color}>{line.value}</span>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
                className="pt-2 border-t border-border"
              >
                <p className="text-muted-foreground mb-1">{'>'} RECOMMENDATION:</p>
                <p className="text-primary pl-4">{evaluation.suggestion}</p>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

SystemEvaluation.displayName = 'SystemEvaluation';
