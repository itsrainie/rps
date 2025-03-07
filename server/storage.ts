import { GameRoom, InsertGameRoom, type Move } from "@shared/schema";
import { nanoid } from "nanoid";

export interface IStorage {
  createRoom(room: InsertGameRoom): Promise<GameRoom>;
  getRoom(id: string): Promise<GameRoom | undefined>;
  joinRoom(roomId: string, player2: string): Promise<GameRoom | undefined>;
  makeMove(roomId: string, player: string, move: Move): Promise<GameRoom | undefined>;
  resetRoom(roomId: string): Promise<GameRoom | undefined>;
}

export class MemStorage implements IStorage {
  private rooms: Map<string, GameRoom>;

  constructor() {
    this.rooms = new Map();
  }

  async createRoom(insertRoom: InsertGameRoom): Promise<GameRoom> {
    const room: GameRoom = {
      ...insertRoom,
      player2: null,
      player1Move: null,
      player2Move: null,
      player1Score: 0,
      player2Score: 0,
      status: "waiting",
    };
    this.rooms.set(room.id, room);
    return room;
  }

  async getRoom(id: string): Promise<GameRoom | undefined> {
    return this.rooms.get(id);
  }

  async joinRoom(roomId: string, player2: string): Promise<GameRoom | undefined> {
    const room = this.rooms.get(roomId);
    if (!room || room.player2) return undefined;

    const updatedRoom = {
      ...room,
      player2,
      status: "playing",
    };
    this.rooms.set(roomId, updatedRoom);
    return updatedRoom;
  }

  async makeMove(roomId: string, player: string, move: Move): Promise<GameRoom | undefined> {
    const room = this.rooms.get(roomId);
    if (!room) return undefined;

    const isPlayer1 = player === room.player1;
    const isPlayer2 = player === room.player2;
    if (!isPlayer1 && !isPlayer2) return undefined;

    const updatedRoom = {
      ...room,
      player1Move: isPlayer1 ? move : room.player1Move,
      player2Move: isPlayer2 ? move : room.player2Move,
    };

    // Check if both players have made their moves
    if (updatedRoom.player1Move && updatedRoom.player2Move) {
      const result = this.determineWinner(updatedRoom.player1Move, updatedRoom.player2Move);
      if (result === 1) {
        updatedRoom.player1Score += 1;
      } else if (result === 2) {
        updatedRoom.player2Score += 1;
      }
      updatedRoom.status = "finished";
    }

    this.rooms.set(roomId, updatedRoom);
    return updatedRoom;
  }

  async resetRoom(roomId: string): Promise<GameRoom | undefined> {
    const room = this.rooms.get(roomId);
    if (!room) return undefined;

    const updatedRoom = {
      ...room,
      player1Move: null,
      player2Move: null,
      status: "playing",
    };
    this.rooms.set(roomId, updatedRoom);
    return updatedRoom;
  }

  private determineWinner(move1: string, move2: string): number {
    if (move1 === move2) return 0;
    if (
      (move1 === "rock" && move2 === "scissors") ||
      (move1 === "paper" && move2 === "rock") ||
      (move1 === "scissors" && move2 === "paper")
    ) {
      return 1;
    }
    return 2;
  }
}

export const storage = new MemStorage();
