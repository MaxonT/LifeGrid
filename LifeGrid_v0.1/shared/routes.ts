import { z } from "zod";
import { userSettingsSchema, weekSchema } from "./schema";

// Even though we have no backend, we define the structure here for the frontend generator
// to understand the domain model and operations.
export const api = {
  settings: {
    get: {
      method: "GET",
      path: "/local/settings",
      responses: { 200: userSettingsSchema.nullable() }
    },
    save: {
      method: "POST",
      path: "/local/settings",
      input: userSettingsSchema,
      responses: { 200: userSettingsSchema }
    }
  },
  weeks: {
    list: {
      method: "GET",
      path: "/local/weeks",
      responses: { 200: z.array(weekSchema) }
    },
    get: {
        method: "GET",
        path: "/local/weeks/:id",
        responses: { 200: weekSchema.nullable() }
    },
    update: {
      method: "PUT",
      path: "/local/weeks/:id",
      input: weekSchema.partial(),
      responses: { 200: weekSchema }
    }
  }
};
