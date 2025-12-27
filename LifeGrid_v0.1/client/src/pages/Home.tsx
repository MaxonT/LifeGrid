import { useState, useMemo } from "react";
import { useSettings, useWeeks } from "@/hooks/use-life-data";
import { Onboarding } from "@/components/Onboarding";
import { WeekCell } from "@/components/WeekCell";
import { WeekEditor } from "@/components/WeekEditor";
import { StatsSidebar } from "@/components/StatsSidebar";
import { addWeeks, differenceInWeeks, parseISO, startOfWeek, endOfWeek, formatISO } from "date-fns";
import { Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export default function Home() {
  const { data: settings, isLoading: isLoadingSettings } = useSettings();
  const { data: weeks = [] } = useWeeks(); // Saved weeks with data
  
  const [selectedWeek, setSelectedWeek] = useState<{
    id: string;
    index: number;
    startDate: string;
    endDate: string;
    isPast: boolean;
  } | null>(null);

  // --- Grid Calculation ---
  const gridData = useMemo(() => {
    if (!settings) return null;
    
    const dob = parseISO(settings.dob);
    const now = new Date();
    const totalWeeks = settings.lifeExpectancy * 52;
    
    // Map saved weeks by index for O(1) lookup
    const weeksMap = new Map(weeks.map(w => [w.weekIndex, w]));
    
    const currentWeekIndex = differenceInWeeks(now, dob);
    
    // We don't generate 4000+ objects. We render them dynamically. 
    // Just need the basic stats for rendering loop.
    return {
      dob,
      totalWeeks,
      currentWeekIndex,
      weeksMap
    };
  }, [settings, weeks]);

  // Handle cell click
  const handleCellClick = (index: number) => {
    if (!gridData) return;
    
    const weekStart = startOfWeek(addWeeks(gridData.dob, index));
    const weekEnd = endOfWeek(weekStart);
    const id = `${formatISO(weekStart, { representation: 'date' })}`;
    
    setSelectedWeek({
      id,
      index,
      startDate: formatISO(weekStart),
      endDate: formatISO(weekEnd),
      isPast: index <= gridData.currentWeekIndex
    });
  };

  if (isLoadingSettings) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // If no settings, show onboarding wizard
  if (!settings) {
    return <Onboarding />;
  }

  if (!gridData) return null; // Should not happen if settings exist

  // Grid renderer
  // Note: Rendering 4000 divs can be heavy.
  // We'll use a responsive CSS grid.
  const renderGrid = () => {
    const cells = [];
    const { totalWeeks, currentWeekIndex, weeksMap } = gridData;
    
    for (let i = 0; i < totalWeeks; i++) {
      const savedWeek = weeksMap.get(i);
      let status: "past" | "present" | "future" = "future";
      
      if (i < currentWeekIndex) status = "past";
      if (i === currentWeekIndex) status = "present";

      cells.push(
        <WeekCell
          key={i}
          index={i}
          status={status}
          hasData={!!savedWeek}
          color={savedWeek?.color}
          onClick={() => handleCellClick(i)}
        />
      );
    }
    return cells;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row overflow-hidden">
      
      {/* Mobile Header - only show stats if onboarding complete */}
      <div className="md:hidden p-4 border-b flex justify-between items-center bg-card z-20">
        <h1 className="font-display font-bold text-xl">LifeGrid</h1>
        {settings && (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px]">
               <StatsSidebar settings={settings} weeks={weeks} />
            </SheetContent>
          </Sheet>
        )}
      </div>

      {/* Main Grid Area */}
      <div className="flex-1 overflow-hidden relative flex flex-col">
        <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none md:block hidden" />
        
        <ScrollArea className="flex-1 h-full px-4 md:px-8 py-6">
          <div className="max-w-5xl mx-auto">
            <header className="mb-8 hidden md:block">
              <h1 className="text-3xl font-display font-bold text-foreground">
                LifeGrid
              </h1>
              {settings.name && (
                <p className="text-muted-foreground mt-1">{settings.name}'s life map • {settings.lifeExpectancy} years</p>
              )}
              <p className="text-muted-foreground text-sm mt-3">Each box represents one week. Click to reflect.</p>
            </header>

            <div className="grid grid-cols-[repeat(auto-fill,minmax(12px,1fr))] sm:grid-cols-[repeat(auto-fill,minmax(14px,1fr))] gap-1 md:gap-1.5 pb-20">
              {renderGrid()}
            </div>
          </div>
        </ScrollArea>
        
        <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
      </div>

      {/* Desktop Sidebar - only show if onboarding complete */}
      {settings && (
        <div className="w-80 border-l bg-card hidden md:flex flex-col p-6 z-20 shadow-xl shadow-black/5">
          <StatsSidebar settings={settings} weeks={weeks} />
        </div>
      )}

      {/* Editor Modal */}
      <WeekEditor 
        isOpen={!!selectedWeek} 
        onClose={() => setSelectedWeek(null)} 
        weekData={selectedWeek} 
      />
    </div>
  );
}
