import { memo, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts';
import type { PlayerState } from '@/lib/gameEngine';

interface StatsPanelProps {
  state: PlayerState;
}

export const StatsPanel = memo(({ state }: StatsPanelProps) => {
  const data = useMemo(() => {
    const last7 = state.expHistory.slice(-7);
    return last7.map(d => ({
      date: d.date.slice(5), // MM-DD
      net: d.gained - d.lost,
      gained: d.gained,
      lost: d.lost,
    }));
  }, [state.expHistory]);

  if (data.length === 0) {
    return (
      <div className="system-panel">
        <h3 className="font-system text-sm uppercase tracking-widest text-muted-foreground mb-4">
          EXP Analytics
        </h3>
        <p className="text-xs font-system text-muted-foreground text-center py-8">
          Insufficient data. Complete quests to generate analytics.
        </p>
      </div>
    );
  }

  return (
    <div className="system-panel">
      <h3 className="font-system text-sm uppercase tracking-widest text-muted-foreground mb-4">
        EXP Analytics
      </h3>
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} barCategoryGap="20%">
            <XAxis
              dataKey="date"
              tick={{ fill: 'hsl(215, 15%, 50%)', fontSize: 10, fontFamily: 'JetBrains Mono' }}
              axisLine={{ stroke: 'hsl(222, 20%, 18%)' }}
              tickLine={false}
            />
            <YAxis hide />
            <Bar dataKey="net" radius={[3, 3, 0, 0]}>
              {data.map((entry, i) => (
                <Cell
                  key={i}
                  fill={entry.net >= 0 ? 'hsl(150, 70%, 45%)' : 'hsl(0, 72%, 51%)'}
                  opacity={0.8}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
});

StatsPanel.displayName = 'StatsPanel';
