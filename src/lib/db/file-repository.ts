import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { KingdomState } from "@/types/game";
import { GameSummary, IGameRepository } from "./repository";

// Cache em memória para garantir persistência mesmo em instâncias serverless
const globalMemoryCache = new Map<string, KingdomState>();

export class FileGameRepository implements IGameRepository {
  private baseDir: string;

  constructor() {
    // Na Vercel e AWS Lambda, o diretório raiz é estritamente read-only (EROFS).
    // Usamos os.tmpdir() (/tmp) que é 100% gravável no ambiente serverless.
    const isServerless = Boolean(
      process.env.VERCEL ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.NODE_ENV === "production"
    );

    if (isServerless) {
      this.baseDir = path.join(os.tmpdir(), "king-game-data");
    } else {
      this.baseDir = path.join(process.cwd(), ".data", "games");
    }
  }

  private async ensureDir(): Promise<void> {
    try {
      await fs.mkdir(this.baseDir, { recursive: true });
    } catch (err: any) {
      // Se falhar em process.cwd(), faz fallback para os.tmpdir()
      if (err?.code === "EROFS" || err?.code === "EACCES") {
        this.baseDir = path.join(os.tmpdir(), "king-game-data");
        try {
          await fs.mkdir(this.baseDir, { recursive: true });
        } catch {
          // Ignora se já existir
        }
      }
    }
  }

  private getFilePath(id: string): string {
    const safeId = id.replace(/[^a-zA-Z0-9_-]/g, "_");
    return path.join(this.baseDir, `${safeId}.json`);
  }

  async saveGame(state: KingdomState): Promise<void> {
    // Atualiza cache em memória
    globalMemoryCache.set(state.id, state);

    await this.ensureDir();
    const filePath = this.getFilePath(state.id);
    const data = JSON.stringify(state, null, 2);
    try {
      await fs.writeFile(filePath, data, "utf-8");
    } catch (err) {
      console.warn("[FileGameRepository] Não foi possível gravar em disco, retido em memória:", err);
    }
  }

  async loadGame(id: string): Promise<KingdomState | null> {
    // 1. Tenta carregar do cache em memória
    if (globalMemoryCache.has(id)) {
      return globalMemoryCache.get(id)!;
    }

    // 2. Tenta carregar do disco/tmp
    await this.ensureDir();
    const filePath = this.getFilePath(id);
    try {
      const data = await fs.readFile(filePath, "utf-8");
      const state = JSON.parse(data) as KingdomState;
      globalMemoryCache.set(id, state);
      return state;
    } catch {
      return null;
    }
  }

  async listGames(): Promise<GameSummary[]> {
    await this.ensureDir();
    const summariesMap = new Map<string, GameSummary>();

    // Carrega do cache de memória
    for (const state of globalMemoryCache.values()) {
      summariesMap.set(state.id, {
        id: state.id,
        name: state.name,
        turn: state.turn,
        year: state.year,
        month: state.month,
        rulerName: state.currentRuler?.name ?? "Soberano",
        isGameOver: state.isGameOver,
        updatedAt: new Date().toISOString(),
      });
    }

    // Lê arquivos em disco se houver
    try {
      const files = await fs.readdir(this.baseDir);
      for (const file of files) {
        if (!file.endsWith(".json")) continue;
        try {
          const content = await fs.readFile(path.join(this.baseDir, file), "utf-8");
          const state = JSON.parse(content) as KingdomState;
          if (!summariesMap.has(state.id)) {
            summariesMap.set(state.id, {
              id: state.id,
              name: state.name,
              turn: state.turn,
              year: state.year,
              month: state.month,
              rulerName: state.currentRuler?.name ?? "Soberano",
              isGameOver: state.isGameOver,
              updatedAt: new Date().toISOString(),
            });
          }
        } catch {
          // Pula arquivo corrompido
        }
      }
    } catch {
      // Ignora erro ao listar diretório
    }

    return Array.from(summariesMap.values()).sort((a, b) => b.turn - a.turn);
  }

  async deleteGame(id: string): Promise<void> {
    globalMemoryCache.delete(id);
    await this.ensureDir();
    const filePath = this.getFilePath(id);
    try {
      await fs.unlink(filePath);
    } catch {
      // Já deletado
    }
  }
}
