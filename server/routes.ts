import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGameRoomSchema } from "@shared/schema";
import { nanoid } from "nanoid";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/rooms", async (req, res) => {
    const result = insertGameRoomSchema.safeParse({
      id: nanoid(6),
      player1: req.body.player1,
    });

    if (!result.success) {
      return res.status(400).json({ message: "Invalid input" });
    }

    const room = await storage.createRoom(result.data);
    res.json(room);
  });

  app.get("/api/rooms/:id", async (req, res) => {
    const room = await storage.getRoom(req.params.id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }
    res.json(room);
  });

  app.post("/api/rooms/:id/join", async (req, res) => {
    const room = await storage.joinRoom(req.params.id, req.body.player2);
    if (!room) {
      return res.status(404).json({ message: "Room not found or already full" });
    }
    res.json(room);
  });

  app.post("/api/rooms/:id/move", async (req, res) => {
    const room = await storage.makeMove(req.params.id, req.body.player, req.body.move);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }
    res.json(room);
  });

  app.post("/api/rooms/:id/reset", async (req, res) => {
    const room = await storage.resetRoom(req.params.id);
    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }
    res.json(room);
  });

  const httpServer = createServer(app);
  return httpServer;
}
