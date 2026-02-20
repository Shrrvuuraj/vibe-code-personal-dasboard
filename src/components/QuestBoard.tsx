import { memo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Plus, Trash2 } from 'lucide-react';
import type { Quest } from '@/lib/gameEngine';

const DIFFICULTY_LABELS: Record<Quest['difficulty'], { label: string; color: string }> = {
  trivial: { label: 'TRIVIAL', color: 'hsl(220, 15%, 55%)' },
  easy: { label: 'EASY', color: 'hsl(150, 70%, 45%)' },
  medium: { label: 'MEDIUM', color: 'hsl(45, 90%, 55%)' },
  hard: { label: 'HARD', color: 'hsl(0, 75%, 55%)' },
  legendary: { label: 'LEGENDARY', color: 'hsl(270, 60%, 55%)' },
};

interface QuestBoardProps {
  quests: Quest[];
  onComplete: (id: string) => void;
  onFail: (id: string) => void;
  onAdd: (title: string, difficulty: Quest['difficulty']) => void;
  onDelete: (id: string) => void;
}

export const QuestBoard = memo(({ quests, onComplete, onFail, onAdd, onDelete }: QuestBoardProps) => {
  const [title, setTitle] = useState('');
  const [difficulty, setDifficulty] = useState<Quest['difficulty']>('medium');
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd(title.trim(), difficulty);
    setTitle('');
    setShowForm(false);
  }, [title, difficulty, onAdd]);

  const active = quests.filter(q => !q.completed && !q.failed);
  const done = quests.filter(q => q.completed || q.failed);

  return (
    <div className="system-panel flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-system text-sm uppercase tracking-widest text-muted-foreground">
          Quest Board
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 text-xs font-system text-primary hover:text-primary/80 transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          NEW
        </button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.form
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            onSubmit={handleSubmit}
            className="overflow-hidden mb-3"
          >
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Quest objective..."
              autoFocus
              className="w-full bg-secondary border border-border rounded px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 font-system"
            />
            <div className="flex gap-1.5 mt-2">
              {(Object.keys(DIFFICULTY_LABELS) as Quest['difficulty'][]).map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`px-2 py-1 rounded text-[10px] font-system uppercase border transition-all ${
                    difficulty === d ? 'border-current' : 'border-transparent opacity-50'
                  }`}
                  style={{ color: DIFFICULTY_LABELS[d].color }}
                >
                  {DIFFICULTY_LABELS[d].label}
                </button>
              ))}
            </div>
            <button
              type="submit"
              className="mt-2 w-full py-1.5 text-xs font-system uppercase bg-primary/10 text-primary border border-primary/20 rounded hover:bg-primary/20 transition-colors"
            >
              Accept Quest
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      <div className="flex-1 overflow-y-auto space-y-1.5 min-h-0">
        <AnimatePresence>
          {active.map(quest => (
            <motion.div
              key={quest.id}
              layout
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20, height: 0 }}
              className="flex items-center gap-2 py-2 px-3 rounded bg-secondary/50 border border-border group"
            >
              <div
                className="h-1.5 w-1.5 rounded-full shrink-0"
                style={{ backgroundColor: DIFFICULTY_LABELS[quest.difficulty].color }}
              />
              <span className="flex-1 text-sm text-foreground truncate">{quest.title}</span>
              <span className="text-[10px] font-system uppercase text-muted-foreground shrink-0" style={{ color: DIFFICULTY_LABELS[quest.difficulty].color }}>
                {DIFFICULTY_LABELS[quest.difficulty].label}
              </span>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => onComplete(quest.id)}
                  className="p-1 rounded text-green-400 hover:bg-green-400/10 transition-colors"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => onFail(quest.id)}
                  className="p-1 rounded text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {active.length === 0 && (
          <p className="text-center text-xs font-system text-muted-foreground py-8">
            No active quests. The system awaits.
          </p>
        )}

        {done.length > 0 && (
          <div className="pt-3 mt-3 border-t border-border">
            <p className="text-[10px] font-system uppercase text-muted-foreground mb-2">Resolved</p>
            {done.slice(0, 5).map(quest => (
              <div
                key={quest.id}
                className="flex items-center gap-2 py-1.5 px-3 rounded opacity-40 group"
              >
                <span className={`text-sm line-through flex-1 truncate ${quest.failed ? 'text-destructive' : 'text-foreground'}`}>
                  {quest.title}
                </span>
                <span className="text-[10px] font-system">
                  {quest.completed ? 'CLEARED' : 'FAILED'}
                </span>
                <button
                  onClick={() => onDelete(quest.id)}
                  className="p-1 rounded text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

QuestBoard.displayName = 'QuestBoard';
