import { z } from "zod";

// User Settings (DOB is crucial for the grid)
export const userSettingsSchema = z.object({
  dob: z.string(), // ISO date string
  lifeExpectancy: z.number().default(90),
  name: z.string().optional(),
});

// Week Data
export const weekSchema = z.object({
  id: z.string(), // e.g., "2023-45" or "week-2300"
  weekIndex: z.number(), // 0 to 5200
  startDate: z.string(), // ISO date
  endDate: z.string(), // ISO date
  title: z.string().optional(),
  notes: z.string().optional(),
  mood: z.enum(["great", "good", "neutral", "bad", "terrible"]).optional(),
  color: z.string().optional(), // Custom hex color
});

export type UserSettings = z.infer<typeof userSettingsSchema>;
export type Week = z.infer<typeof weekSchema>;
