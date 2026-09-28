import { KingdomState } from "@/types/game";

export type AutoSaveMode = "interval_5" | "every_turn" | "manual_only";

export type SavedSessionMeta = {
  id: string;
  name: string;
  rulerName: string;
  rulerTitle: string;
  storylineId: string;
  storylineTitle: string;
  turn: number;
  year: number;
  month: number;
  savedAt: string;
  saveType: "manual" | "autosave";
};

const STORAGE_KEY_PREFIX = "kingdom_game_save_";
const SESSIONS_INDEX_KEY = "kingdom_saved_sessions_index";
const CONFIG_AUTOSAVE_KEY = "kingdom_autosave_config";

/**
 * Salva o estado completo da sessão no LocalStorage
 */
export function saveSessionToLocalStorage(
  state: KingdomState,
  saveType: "manual" | "autosave" = "manual"
): boolean {
  if (typeof window === "undefined" || !state || !state.id) return false;

  try {
    const key = `${STORAGE_KEY_PREFIX}${state.id}`;
    window.localStorage.setItem(key, JSON.stringify(state));

    // Atualiza o índice de sessões salvas
    const meta: SavedSessionMeta = {
      id: state.id,
      name: state.name || "Reino Desconhecido",
      rulerName: state.currentRuler?.name || "Soberano",
      rulerTitle: state.currentRuler?.title || "Majestade",
      storylineId: state.storylineId || "valoria_classic",
      storylineTitle: state.storylineTitle || "Cenário",
      turn: state.turn,
      year: state.year,
      month: state.month || 1,
      savedAt: new Date().toISOString(),
      saveType,
    };

    const currentSessions = getSavedSessionsIndex();
    const updated = [meta, ...currentSessions.filter((s) => s.id !== state.id)].slice(0, 20);
    window.localStorage.setItem(SESSIONS_INDEX_KEY, JSON.stringify(updated));

    return true;
  } catch (err) {
    console.error("Falha ao salvar no LocalStorage:", err);
    return false;
  }
}

/**
 * Carrega a sessão salva do LocalStorage
 */
export function loadSessionFromLocalStorage(gameId: string): KingdomState | null {
  if (typeof window === "undefined" || !gameId) return null;

  try {
    const raw = window.localStorage.getItem(`${STORAGE_KEY_PREFIX}${gameId}`);
    if (!raw) return null;
    return JSON.parse(raw) as KingdomState;
  } catch (err) {
    console.error("Falha ao carregar do LocalStorage:", err);
    return null;
  }
}

/**
 * Retorna o índice de todas as sessões salvas localmente
 */
export function getSavedSessionsIndex(): SavedSessionMeta[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(SESSIONS_INDEX_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SavedSessionMeta[];
  } catch {
    return [];
  }
}

/**
 * Remove uma sessão do LocalStorage
 */
export function deleteSessionFromLocalStorage(gameId: string): boolean {
  if (typeof window === "undefined" || !gameId) return false;

  try {
    window.localStorage.removeItem(`${STORAGE_KEY_PREFIX}${gameId}`);
    const current = getSavedSessionsIndex();
    const filtered = current.filter((s) => s.id !== gameId);
    window.localStorage.setItem(SESSIONS_INDEX_KEY, JSON.stringify(filtered));
    return true;
  } catch {
    return false;
  }
}

/**
 * Configuração de Auto-Save
 */
export function getAutoSaveMode(): AutoSaveMode {
  if (typeof window === "undefined") return "interval_5";
  try {
    const val = window.localStorage.getItem(CONFIG_AUTOSAVE_KEY);
    if (val === "every_turn" || val === "interval_5" || val === "manual_only") return val;
    return "interval_5"; // Padrão: auto-save a cada 5 turnos
  } catch {
    return "interval_5";
  }
}

export function setAutoSaveMode(mode: AutoSaveMode): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CONFIG_AUTOSAVE_KEY, mode);
  } catch (err) {
    console.error("Erro ao salvar config de auto-save:", err);
  }
}

/**
 * Verifica se um turno específico deve disparar auto-save
 */
export function shouldAutoSaveAtTurn(turn: number, mode: AutoSaveMode): boolean {
  if (mode === "manual_only") return false;
  if (mode === "every_turn") return true;
  // interval_5: a cada 5 turnos (5, 10, 15, 20...)
  return turn > 1 && turn % 5 === 0;
}
