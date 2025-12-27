import type { Express } from "express";
import { createServer, type Server } from "http";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // No backend API routes needed for this client-side only app.
  // The frontend handles data persistence via IndexedDB.

  return httpServer;
}
