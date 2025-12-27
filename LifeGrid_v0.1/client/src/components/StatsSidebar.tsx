import { UserSettings, Week } from "@shared/schema";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { differenceInWeeks, parseISO, addYears } from "date-fns";
import { Loader2 } from "lucide-react";

interface StatsSidebarProps {
  settings: UserSettings;
  weeks: Week[];
}

export function StatsSidebar({ settings, weeks }: StatsSidebarProps) {
  const dob = parseISO(settings.dob);
  const now = new Date();
  
  // Calculations
  const weeksLived = Math.max(0, differenceInWeeks(now, dob));
  const totalWeeks = settings.lifeExpectancy * 52;
  const weeksRemaining = Math.max(0, totalWeeks - weeksLived);
  const percentageLived = Math.min(100, (weeksLived / totalWeeks) * 100);
  
  // Mood Data
  const moodCounts = weeks.reduce((acc, week) => {
    if (week.mood) {
      acc[week.mood] = (acc[week.mood] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const moodData = [
    { name: "Great", value: moodCounts.great || 0, color: "#22c55e" },
    { name: "Good", value: moodCounts.good || 0, color: "#84cc16" },
    { name: "Neutral", value: moodCounts.neutral || 0, color: "#94a3b8" },
    { name: "Bad", value: moodCounts.bad || 0, color: "#f59e0b" },
    { name: "Terrible", value: moodCounts.terrible || 0, color: "#ef4444" },
  ].filter(d => d.value > 0);

  const hasMoodData = moodData.length > 0;

  // Format percentage display - show "<0.1%" for very small values, otherwise 2 decimals
  const formatPercentage = (percent: number) => {
    if (percent === 0) return "0%";
    if (percent < 0.1) return "<0.1%";
    return percent.toFixed(2) + "%";
  };

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm bg-stone-50/50 dark:bg-stone-900/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Life Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-4xl font-display font-bold mb-1">{formatPercentage(percentageLived)}</div>
          <div className="text-sm text-muted-foreground mb-4">
            {weeksLived} / {totalWeeks.toLocaleString()} weeks
          </div>
          
          <div className="h-2 w-full bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-1000 ease-out"
              style={{ width: `${percentageLived}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className="border-none shadow-sm bg-stone-50/50 dark:bg-stone-900/50">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold font-mono">{weeksLived.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground uppercase mt-1">Weeks Lived</div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-stone-50/50 dark:bg-stone-900/50">
          <CardContent className="pt-6">
            <div className="text-2xl font-bold font-mono">{weeksRemaining.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground uppercase mt-1">Weeks Left</div>
          </CardContent>
        </Card>
      </div>

      {hasMoodData && (
        <Card className="border-none shadow-sm bg-stone-50/50 dark:bg-stone-900/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Mood Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={moodData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {moodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                    formatter={(value) => `${value} week${value > 1 ? 's' : ''}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {moodData.map((mood) => (
                <div key={mood.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: mood.color }} />
                  <span className="text-muted-foreground">
                    {mood.name} ({mood.value})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="text-center text-xs text-muted-foreground pt-4">
        Target age: {settings.lifeExpectancy} years
      </div>
    </div>
  );
}
