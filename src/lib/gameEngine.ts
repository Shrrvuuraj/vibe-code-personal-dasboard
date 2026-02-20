// ═══════════════════════════════════════════
// GAME ENGINE — Strict EXP math, no inflation
// ═══════════════════════════════════════════

export interface Quest {
  id: string;
  title: string;
  difficulty: 'trivial' | 'easy' | 'medium' | 'hard' | 'legendary';
  completed: boolean;
  failed: boolean;
  createdAt: number;
  completedAt?: number;
}

export interface PlayerState {
  totalExp: number;
  currentStreak: number;
  longestStreak: number;
  quests: Quest[];
  expHistory: { date: string; gained: number; lost: number }[];
  lastActiveDate: string;
  tierIndex: number;
}

export interface TierInfo {
  name: string;
  threshold: number;
  color: string;
  cssVar: string;
  badge: string;
}

export const TIERS: TierInfo[] = [
  { name: 'Awakened Initiate', threshold: 0, color: 'hsl(220, 15%, 55%)', cssVar: '--tier-initiate', badge: '◇' },
  { name: 'Iron Body', threshold: 200, color: 'hsl(30, 50%, 50%)', cssVar: '--tier-iron', badge: '◆' },
  { name: 'Shadow Candidate', threshold: 600, color: 'hsl(270, 60%, 55%)', cssVar: '--tier-shadow-candidate', badge: '▲' },
  { name: 'Dungeon Conqueror', threshold: 1500, color: 'hsl(210, 80%, 55%)', cssVar: '--tier-dungeon', badge: '★' },
  { name: 'Elite Hunter', threshold: 3500, color: 'hsl(150, 70%, 45%)', cssVar: '--tier-elite', badge: '✦' },
  { name: 'Shadow Commander', threshold: 7000, color: 'hsl(45, 90%, 55%)', cssVar: '--tier-commander', badge: '⬡' },
  { name: "Monarch's Vessel", threshold: 14000, color: 'hsl(0, 75%, 55%)', cssVar: '--tier-vessel', badge: '♛' },
  { name: 'Shadow Monarch', threshold: 25000, color: 'hsl(0, 0%, 90%)', cssVar: '--tier-monarch', badge: '👑' },
];

const DIFFICULTY_EXP: Record<Quest['difficulty'], number> = {
  trivial: 5,
  easy: 15,
  medium: 30,
  hard: 60,
  legendary: 120,
};

const STREAK_MULTIPLIER = (streak: number): number => {
  if (streak >= 30) return 1.5;
  if (streak >= 14) return 1.3;
  if (streak >= 7) return 1.15;
  if (streak >= 3) return 1.05;
  return 1.0;
};

const STREAK_BREAK_PENALTY = (streak: number): number => {
  // Losing a longer streak hurts more
  return Math.min(streak * 10, 150);
};

export function getTierForExp(exp: number): number {
  let tier = 0;
  for (let i = TIERS.length - 1; i >= 0; i--) {
    if (exp >= TIERS[i].threshold) {
      tier = i;
      break;
    }
  }
  return tier;
}

export function getExpForCompletion(quest: Quest, streak: number): number {
  const base = DIFFICULTY_EXP[quest.difficulty];
  const multiplier = STREAK_MULTIPLIER(streak);
  return Math.round(base * multiplier);
}

export function getExpForFailure(quest: Quest): number {
  const base = DIFFICULTY_EXP[quest.difficulty];
  return Math.round(base * 0.5);
}

export function getTierProgress(exp: number, tierIndex: number): number {
  const current = TIERS[tierIndex].threshold;
  const next = TIERS[tierIndex + 1]?.threshold ?? current;
  if (next === current) return 1; // Max tier
  return Math.min((exp - current) / (next - current), 1);
}

export function createQuest(title: string, difficulty: Quest['difficulty']): Quest {
  return {
    id: crypto.randomUUID(),
    title,
    difficulty,
    completed: false,
    failed: false,
    createdAt: Date.now(),
  };
}

export function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

export function getDefaultState(): PlayerState {
  return {
    totalExp: 0,
    currentStreak: 0,
    longestStreak: 0,
    quests: [],
    expHistory: [],
    lastActiveDate: '',
    tierIndex: 0,
  };
}

export function completeQuest(state: PlayerState, questId: string): { state: PlayerState; expGained: number; tierChanged: boolean } {
  const quest = state.quests.find(q => q.id === questId);
  if (!quest || quest.completed || quest.failed) return { state, expGained: 0, tierChanged: false };

  const expGained = getExpForCompletion(quest, state.currentStreak);
  const today = getTodayKey();
  const newTotalExp = state.totalExp + expGained;
  const newTierIndex = getTierForExp(newTotalExp);
  const tierChanged = newTierIndex !== state.tierIndex;

  // Update streak
  let newStreak = state.currentStreak;
  if (state.lastActiveDate !== today) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().split('T')[0];
    newStreak = state.lastActiveDate === yesterdayKey ? state.currentStreak + 1 : 1;
  }

  // Update history
  const history = [...state.expHistory];
  const todayEntry = history.find(h => h.date === today);
  if (todayEntry) {
    todayEntry.gained += expGained;
  } else {
    history.push({ date: today, gained: expGained, lost: 0 });
  }

  return {
    state: {
      ...state,
      totalExp: newTotalExp,
      tierIndex: newTierIndex,
      currentStreak: newStreak,
      longestStreak: Math.max(state.longestStreak, newStreak),
      lastActiveDate: today,
      quests: state.quests.map(q => q.id === questId ? { ...q, completed: true, completedAt: Date.now() } : q),
      expHistory: history.slice(-30), // Keep 30 days
    },
    expGained,
    tierChanged,
  };
}

export function failQuest(state: PlayerState, questId: string): { state: PlayerState; expLost: number } {
  const quest = state.quests.find(q => q.id === questId);
  if (!quest || quest.completed || quest.failed) return { state, expLost: 0 };

  const expLost = getExpForFailure(quest);
  const streakPenalty = state.currentStreak > 0 ? STREAK_BREAK_PENALTY(state.currentStreak) : 0;
  const totalLost = expLost + streakPenalty;
  const newTotalExp = Math.max(0, state.totalExp - totalLost);

  const today = getTodayKey();
  const history = [...state.expHistory];
  const todayEntry = history.find(h => h.date === today);
  if (todayEntry) {
    todayEntry.lost += totalLost;
  } else {
    history.push({ date: today, gained: 0, lost: totalLost });
  }

  return {
    state: {
      ...state,
      totalExp: newTotalExp,
      tierIndex: getTierForExp(newTotalExp),
      currentStreak: 0,
      quests: state.quests.map(q => q.id === questId ? { ...q, failed: true } : q),
      expHistory: history.slice(-30),
    },
    expLost: totalLost,
  };
}

export function generateEvaluation(state: PlayerState): {
  expGained: number;
  expLost: number;
  weakZone: string;
  suggestion: string;
} {
  const today = getTodayKey();
  const todayData = state.expHistory.find(h => h.date === today);
  const gained = todayData?.gained ?? 0;
  const lost = todayData?.lost ?? 0;

  const todayQuests = state.quests.filter(q => {
    const d = new Date(q.createdAt).toISOString().split('T')[0];
    return d === today;
  });

  const failedCount = todayQuests.filter(q => q.failed).length;
  const completedCount = todayQuests.filter(q => q.completed).length;
  const pendingCount = todayQuests.filter(q => !q.completed && !q.failed).length;

  let weakZone = 'None detected';
  let suggestion = 'Maintain current trajectory.';

  if (failedCount > completedCount) {
    weakZone = 'Task completion ratio is below threshold';
    suggestion = 'Reduce task difficulty. Complete 3 easy tasks before attempting hard ones.';
  } else if (pendingCount > 3) {
    weakZone = 'Task accumulation without resolution';
    suggestion = 'Clear pending queue. Unfinished tasks erode discipline over time.';
  } else if (gained === 0 && lost === 0) {
    weakZone = 'Zero activity detected';
    suggestion = 'Inaction is regression. Add one trivial quest to restart momentum.';
  } else if (state.currentStreak === 0 && state.longestStreak > 3) {
    weakZone = 'Streak broken — momentum lost';
    suggestion = 'Rebuild with 3 consecutive days of easy completions before scaling up.';
  }

  return { expGained: gained, expLost: lost, weakZone, suggestion };
}
