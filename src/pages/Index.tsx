import { useGameState } from '@/hooks/useGameState';
import { PlayerStatus } from '@/components/PlayerStatus';
import { QuestBoard } from '@/components/QuestBoard';
import { StatsPanel } from '@/components/StatsPanel';
import { SystemEvaluation } from '@/components/SystemEvaluation';
import { TierRoadmap } from '@/components/TierRoadmap';
import { ExpAnimation } from '@/components/ExpAnimation';
import { TierEvolutionOverlay } from '@/components/TierEvolutionOverlay';
import { TIERS } from '@/lib/gameEngine';

const Index = () => {
  const {
    state,
    addQuest,
    completeQuest,
    failQuest,
    deleteQuest,
    lastExpEvent,
    clearExpEvent,
    tierEvolution,
    clearTierEvolution,
  } = useGameState();

  const tier = TIERS[state.tierIndex];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient background energy */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-[0.03] blur-3xl rounded-full pointer-events-none"
        style={{ backgroundColor: tier.color }}
      />

      {/* Floating EXP animation */}
      <ExpAnimation event={lastExpEvent} onDone={clearExpEvent} />

      {/* Tier evolution overlay */}
      <TierEvolutionOverlay evolution={tierEvolution} onDone={clearTierEvolution} />

      {/* Header */}
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-system text-primary text-lg">◈</span>
            <h1 className="font-system text-sm uppercase tracking-[0.2em] text-foreground">
              Shadow System
            </h1>
          </div>
          <div className="font-system text-[10px] text-muted-foreground uppercase tracking-widest">
            v1.0 — Arise
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left column — Status + Roadmap */}
          <div className="lg:col-span-4 space-y-4">
            <PlayerStatus state={state} />
            <TierRoadmap state={state} />
          </div>

          {/* Center column — Quest Board */}
          <div className="lg:col-span-5">
            <QuestBoard
              quests={state.quests}
              onComplete={completeQuest}
              onFail={failQuest}
              onAdd={addQuest}
              onDelete={deleteQuest}
            />
          </div>

          {/* Right column — Stats + Evaluation */}
          <div className="lg:col-span-3 space-y-4">
            <StatsPanel state={state} />
            <SystemEvaluation state={state} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
