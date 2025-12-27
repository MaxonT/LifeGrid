import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "@/lib/db";
import { UserSettings, Week, userSettingsSchema, weekSchema } from "@shared/schema";
import { z } from "zod";

// Keys for cache
const KEYS = {
  settings: ["settings"],
  weeks: ["weeks"],
  week: (id: string) => ["weeks", id],
};

// --- Settings Hooks ---

export function useSettings() {
  return useQuery({
    queryKey: KEYS.settings,
    queryFn: async () => {
      const data = await db.getSettings();
      // Validate if data exists, return null if not (triggers onboarding)
      return data ? userSettingsSchema.parse(data) : null;
    },
  });
}

export function useSaveSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (settings: UserSettings) => {
      const validated = userSettingsSchema.parse(settings);
      return db.saveSettings(validated);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: KEYS.settings });
    },
  });
}

// --- Week Hooks ---

export function useWeeks() {
  return useQuery({
    queryKey: KEYS.weeks,
    queryFn: async () => {
      const weeks = await db.getWeeks();
      return z.array(weekSchema).parse(weeks);
    },
  });
}

export function useWeek(id: string | null) {
  return useQuery({
    queryKey: KEYS.week(id || ""),
    queryFn: async () => {
      if (!id) return null;
      const week = await db.getWeek(id);
      return week ? weekSchema.parse(week) : null;
    },
    enabled: !!id,
  });
}

export function useSaveWeek() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (week: Week) => {
      const validated = weekSchema.parse(week);
      return db.saveWeek(validated);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: KEYS.weeks });
      queryClient.invalidateQueries({ queryKey: KEYS.week(variables.id) });
    },
  });
}
