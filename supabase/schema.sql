-- Schema do AI Kingdom Simulator para Supabase / PostgreSQL

-- 1. Campanhas
CREATE TABLE IF NOT EXISTS games (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  seed BIGINT NOT NULL,
  turn INT NOT NULL DEFAULT 1,
  year INT NOT NULL DEFAULT 1142,
  month INT NOT NULL DEFAULT 3,
  is_game_over BOOLEAN NOT NULL DEFAULT FALSE,
  game_over_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Estado do Reino (armazenado como documento JSONB completo com autoridade do servidor)
CREATE TABLE IF NOT EXISTS kingdom_states (
  game_id TEXT PRIMARY KEY REFERENCES games(id) ON DELETE CASCADE,
  state JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Histórico de Decisões e Crônica
CREATE TABLE IF NOT EXISTS game_history (
  id TEXT PRIMARY KEY,
  game_id TEXT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  turn INT NOT NULL,
  year INT NOT NULL,
  month INT NOT NULL,
  event_title TEXT NOT NULL,
  player_decision TEXT NOT NULL,
  narrative TEXT NOT NULL,
  effects_summary JSONB NOT NULL DEFAULT '[]'::jsonb,
  ruler_name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para busca rápida
CREATE INDEX IF NOT EXISTS idx_games_updated_at ON games(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_history_game_turn ON game_history(game_id, turn DESC);
