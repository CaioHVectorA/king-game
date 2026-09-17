import { KingdomState } from "@/types/game";

export type GameSummary = {
  id: string;
  name: string;
  turn: number;
  year: number;
  month: number;
  rulerName: string;
  isGameOver: boolean;
  updatedAt: string;
};

export interface IGameRepository {
  saveGame(state: KingdomState): Promise<void>;
  loadGame(id: string): Promise<KingdomState | null>;
  listGames(): Promise<GameSummary[]>;
  deleteGame(id: string): Promise<void>;
}
