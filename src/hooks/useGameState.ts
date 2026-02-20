import { useState, useCallback, useRef } from 'react';
import {
  PlayerState,
  getDefaultState,
  completeQuest,
  failQuest,
  createQuest,
  type Quest,
} from '@/lib/gameEngine';

const STORAGE_KEY = 'shadow-system-state';

function loadState(): PlayerState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return getDefaultState();
}

function saveState(state: PlayerState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useGameState() {
  const [state, setState] = useState<PlayerState>(loadState);
  const [lastExpEvent, setLastExpEvent] = useState<{ amount: number; type: 'gain' | 'loss' } | null>(null);
  const [tierEvolution, setTierEvolution] = useState<{ from: number; to: number } | null>(null);
  const eventIdRef = useRef(0);

  const update = useCallback((newState: PlayerState) => {
    setState(newState);
    saveState(newState);
  }, []);

  const addQuest = useCallback((title: string, difficulty: Quest['difficulty']) => {
    setState(prev => {
      const quest = createQuest(title, difficulty);
      const next = { ...prev, quests: [quest, ...prev.quests] };
      saveState(next);
      return next;
    });
  }, []);

  const doCompleteQuest = useCallback((questId: string) => {
    setState(prev => {
      const result = completeQuest(prev, questId);
      saveState(result.state);
      if (result.expGained > 0) {
        eventIdRef.current++;
        setLastExpEvent({ amount: result.expGained, type: 'gain' });
      }
      if (result.tierChanged) {
        setTierEvolution({ from: prev.tierIndex, to: result.state.tierIndex });
      }
      return result.state;
    });
  }, []);

  const doFailQuest = useCallback((questId: string) => {
    setState(prev => {
      const result = failQuest(prev, questId);
      saveState(result.state);
      if (result.expLost > 0) {
        eventIdRef.current++;
        setLastExpEvent({ amount: result.expLost, type: 'loss' });
      }
      return result.state;
    });
  }, []);

  const clearExpEvent = useCallback(() => setLastExpEvent(null), []);
  const clearTierEvolution = useCallback(() => setTierEvolution(null), []);

  const deleteQuest = useCallback((questId: string) => {
    setState(prev => {
      const next = { ...prev, quests: prev.quests.filter(q => q.id !== questId) };
      saveState(next);
      return next;
    });
  }, []);

  return {
    state,
    addQuest,
    completeQuest: doCompleteQuest,
    failQuest: doFailQuest,
    deleteQuest,
    lastExpEvent,
    clearExpEvent,
    tierEvolution,
    clearTierEvolution,
  };
}
