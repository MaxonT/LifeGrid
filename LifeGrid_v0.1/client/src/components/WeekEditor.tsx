import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format, parseISO } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useWeek, useSaveWeek } from "@/hooks/use-life-data";
import { weekSchema, type Week } from "@shared/schema";
import { Loader2, CalendarIcon } from "lucide-react";

// Extend the schema for the form
const formSchema = weekSchema.omit({ id: true, weekIndex: true, startDate: true, endDate: true });

type FormValues = z.infer<typeof formSchema>;

interface WeekEditorProps {
  isOpen: boolean;
  onClose: () => void;
  weekData: {
    id: string;
    index: number;
    startDate: string;
    endDate: string;
    isPast: boolean;
  } | null;
}

const MOODS = [
  { value: "great", label: "Great", color: "#22c55e" }, // Green
  { value: "good", label: "Good", color: "#84cc16" },   // Lime
  { value: "neutral", label: "Neutral", color: "#94a3b8" }, // Slate
  { value: "bad", label: "Bad", color: "#f59e0b" },     // Amber
  { value: "terrible", label: "Terrible", color: "#ef4444" }, // Red
];

export function WeekEditor({ isOpen, onClose, weekData }: WeekEditorProps) {
  const { data: existingData, isLoading } = useWeek(weekData?.id || null);
  const { mutate: saveWeek, isPending: isSaving } = useSaveWeek();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      notes: "",
      mood: undefined,
      color: "#000000",
    },
  });

  // Reset form when data loads or changes
  useEffect(() => {
    if (existingData) {
      form.reset({
        title: existingData.title || "",
        notes: existingData.notes || "",
        mood: existingData.mood,
        color: existingData.color || "#000000",
      });
    } else {
      form.reset({
        title: "",
        notes: "",
        mood: undefined,
        color: "#000000",
      });
    }
  }, [existingData, form, isOpen]);

  if (!weekData) return null;

  const onSubmit = (values: FormValues) => {
    // If selecting a mood, use the mood color if no custom color is explicitly picked? 
    // Logic: If mood is selected, let's auto-set color if user didn't pick a custom one.
    // For simplicity, we just save what's in the form.
    
    let colorToSave = values.color;
    if (values.mood && (!values.color || values.color === "#000000")) {
      const moodObj = MOODS.find(m => m.value === values.mood);
      if (moodObj) colorToSave = moodObj.color;
    }

    const payload: Week = {
      id: weekData.id,
      weekIndex: weekData.index,
      startDate: weekData.startDate,
      endDate: weekData.endDate,
      ...values,
      color: colorToSave
    };

    saveWeek(payload, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  const startDateFormatted = format(parseISO(weekData.startDate), "MMM d, yyyy");
  const endDateFormatted = format(parseISO(weekData.endDate), "MMM d, yyyy");

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <CalendarIcon className="w-4 h-4" />
            <span className="text-sm font-mono uppercase tracking-wide">Week {weekData.index + 1}</span>
          </div>
          <DialogTitle className="text-2xl font-display">
            {weekData.isPast ? "Reflect on this week" : "Plan for this week"}
          </DialogTitle>
          <DialogDescription>
            {startDateFormatted} — {endDateFormatted}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
              
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Highlight / Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Big promotion, Trip to Japan, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mood"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>How was it?</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex justify-between"
                      >
                        {MOODS.map((mood) => (
                          <FormItem key={mood.value} className="flex flex-col items-center space-y-1 cursor-pointer group">
                            <FormControl>
                              <RadioGroupItem value={mood.value} className="sr-only" />
                            </FormControl>
                            <div 
                              className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer ${field.value === mood.value ? 'scale-125 ring-2 ring-offset-2 ring-primary' : 'hover:scale-110'}`}
                              style={{ backgroundColor: mood.color, borderColor: mood.color }}
                              onClick={() => field.onChange(mood.value)}
                            />
                            <span className={`text-[10px] uppercase font-medium transition-colors ${field.value === mood.value ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {mood.label}
                            </span>
                          </FormItem>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Journal</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="What happened? What did you learn?" 
                        className="min-h-[120px] resize-none" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4 items-center">
                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Custom Color</FormLabel>
                      <div className="flex items-center gap-3">
                        <FormControl>
                          <input 
                            type="color" 
                            className="w-10 h-10 rounded border p-0.5 cursor-pointer bg-transparent"
                            {...field}
                          />
                        </FormControl>
                        <span className="text-xs text-muted-foreground font-mono">{field.value}</span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Memory"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
