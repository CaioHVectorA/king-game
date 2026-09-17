import fs from "node:fs/promises";
import path from "node:path";
import { KingdomState } from "@/types/game";
import { GameSummary, IGameRepository } from "./repository";

export class FileGameRepository implements IGameRepository {
  private baseDir: string;

  constructor() {
    this.baseDir = path.join(process.cwd(), ".data", "games");
  }

  private async ensureDir(): Promise<void> {
    try {
      await fs.mkdir(this.baseDir, { recursive: true });
    } catch {
      // Ignora se já existir
    }
  }

  private getFilePath(id: string): string {
    // Sanitiza id para evitar path traversal
    const safeId = id.replace(/[^a-zA-Z0-9_-]/g, "_");
    return path.join(this.baseDir, `${safeId}.json`);
  }

  async saveGame(state: KingdomState): Promise<void> {
    await this.ensureDir();
    const filePath = this.getFilePath(state.id);
    const data = JSON.stringify(state, null, 2);
    await fs.writeFile(filePath, data, "utf-8");
  }

  async loadGame(id: string): Promise<KingdomState | null> {
    await this.ensureDir();
    const filePath = this.getFilePath(id);
    try {
      const data = await fs.readFile(filePath, "utf-8");
      return JSON.parse(data) as KingdomState;
    } catch {
      return null;
    }
  }

  async listGames(): Promise<GameSummary[]> {
    await this.ensureDir();
    try {
      const files = await fs.readdir(this.baseDir);
      const summaries: GameSummary[] = [];

      for (const file of files) {
        if (!file.endsWith(".json")) continue;
        try {
          const content = await fs.readFile(path.join(this.baseDir, file), "utf-8");
          const state = JSON.parse(content) as KingdomState;
          summaries.push({
            id: state.id,
            name: state.name,
            turn: state.turn,
            year: state.year,
            month: state.month,
            rulerName: state.currentRuler?.name ?? "Soberano",
            isGameOver: state.isGameOver,
            updatedAt: new Date().toISOString(),
          });
        } catch {
          // Arquivo corrompido ou inacessível, pula
        }
      }

      return summaries.sort((a, b) => b.turn - a.turn);
    } catch {
      return [];
    }
  }

  async deleteGame(id: string): Promise<void> {
    await this.ensureDir();
    const filePath = this.getFilePath(id);
    try {
      await fs.unlink(filePath);
    } catch {
      // Já deletado ou inexistente
    }
  }
}
