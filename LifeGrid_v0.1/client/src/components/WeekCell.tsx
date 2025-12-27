import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface WeekCellProps {
  status: "past" | "present" | "future";
  hasData: boolean;
  color?: string;
  onClick: () => void;
  index: number;
}

export function WeekCell({ status, hasData, color, onClick, index }: WeekCellProps) {
  // Determine base styles
  const baseStyles = "w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-sm cursor-pointer transition-all duration-300";
  
  let visualStyles = "";
  let inlineStyles = {};

  if (color) {
    // Custom user color overrides everything except future outline
    visualStyles = "hover:scale-150 shadow-sm hover:shadow-md hover:z-10";
    inlineStyles = { backgroundColor: color };
  } else {
    switch (status) {
      case "past":
        visualStyles = "bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700";
        break;
      case "present":
        visualStyles = "bg-primary animate-pulse-subtle shadow-[0_0_8px_rgba(0,0,0,0.2)] dark:shadow-[0_0_8px_rgba(255,255,255,0.2)] z-10 scale-125";
        break;
      case "future":
        visualStyles = "border border-stone-100 dark:border-stone-800 bg-transparent hover:border-stone-300 dark:hover:border-stone-600";
        break;
    }
  }

  const tooltipText = status === "present" 
    ? "This Week • Click to reflect" 
    : `Week ${index} • Click to add a memory`;

  // Staggered fade in animation
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: Math.min(index * 0.0005, 1.5), duration: 0.5 }}
          onClick={onClick}
          className={cn(baseStyles, visualStyles)}
          style={inlineStyles}
          data-testid={`cell-week-${index}`}
        />
      </TooltipTrigger>
      <TooltipContent side="top" className="text-xs bg-foreground text-background">
        {tooltipText}
      </TooltipContent>
    </Tooltip>
  );
}
