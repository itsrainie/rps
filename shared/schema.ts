import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export type Move = "rock" | "paper" | "scissors" | null;
export type GameStatus = "waiting" | "playing" | "finished";

export const gameRooms = pgTable("game_rooms", {
  id: text("id").primaryKey(),
  player1: text("player1").notNull(),
  player2: text("player2"),
  player1Move: text("player1_move"),
  player2Move: text("player2_move"),
  player1Score: integer("player1_score").default(0).notNull(),
  player2Score: integer("player2_score").default(0).notNull(),
  status: text("status").notNull().default("waiting"),
});

export const insertGameRoomSchema = createInsertSchema(gameRooms).pick({
  id: true,
  player1: true,
});

export type InsertGameRoom = z.infer<typeof insertGameRoomSchema>;
export type GameRoom = typeof gameRooms.$inferSelect;
