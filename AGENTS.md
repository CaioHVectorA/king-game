<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AI Kingdom Simulator — Guia do Agente de Código

Este documento contém todas as instruções, convenções e regras que agentes de IA e desenvolvedores devem seguir estritamente ao trabalhar neste repositório.

---

## 1. Princípios Fundamentais do Projeto

1. **Liberdade do Jogador com Consistência do Engine**:
   - O jogador pode digitar qualquer decisão em linguagem natural.
   - A IA **nunca** resolve o jogo diretamente ("o reino prosperou"). Ela apenas sugere intenções e ações estruturadas.
   - O **Game Engine** valida, clampa, aplica limites matemáticos e decide os resultados.
2. **Simplicidade e Performance**:
   - Manter a stack minimalista (Next.js, TypeScript, Tailwind, Zod).
   - **NÃO** introduzir microsserviços, Redis, filas pesadas, WebSockets ou arquiteturas distribuídas desnecessárias.
   - O projeto deve rodar localmente com `npm run dev` e `npm test` de forma 100% autônoma.
3. **Economia de Tokens**:
   - Apenas **1 chamada de IA por turno**.
   - Contexto enxuto: estado resumido + evento atual + últimos 3 fatos da história + decisão do jogador.
   - Saída curta: JSON puro com ações estruturadas e narrativa de 1 a 3 frases evocativas em português.

---

## 2. Mapa da Arquitetura de Código

```text
src/
  app/
    api/
      game/route.ts       # Criação, listagem e carregamento de campanhas
      turn/route.ts       # Endpoint autoritativo processTurn() com save automático
    page.tsx              # View principal do jogo (HUD, eventos, decisões e gavetas)
    layout.tsx            # Fonte Cinzel (Google Fonts) e tema dark real
    globals.css           # Paleta nobre, bordas douradas e utilitários visuais
  components/
    dashboard/            # HeaderBar (reino, datação) e ResourceBar (5 métricas centrais)
    event/                # EventCard, DecisionBox (opções + texto livre), TurnFeedback
    drawers/              # HistoryDrawer, CourtDrawer, FactionsDrawer, DiplomacyDrawer
    modals/               # SuccessionModal, GameOverModal, NewGameModal
  content/
    storylines/           # Linhas de História e Lore parametrizáveis (Game Design modular)
      types.ts            # Tipos StorylineDefinition
      index.ts            # Catálogo e helper de seleção
      valoria-classic.ts  # Cenário clássico de intriga feudal
      khar-invasion.ts    # Cenário de guerra total contra a Horda de Khar
      dark-plague.ts      # Cenário dark fantasy de epidemia e inquisição
  lib/
    game/
      engine.ts           # processTurn() e game loop autoritativo
      actions.ts          # Zod schema de GameAction, sanitização e applyAction()
      rules.ts            # LIMITS, clamps e checagens de morte/sucessão/game over
      state.ts            # Estado inicial, herdeiros, leis, recursos e clone imutável
      events.ts           # Catálogo de 16+ eventos, delayed events e seleção ponderada
      consequences.ts     # Envelhecimento, manutenção sazonal, fome e desgaste bélico
      characters.ts       # Conselho da corte (Lorde Vane, General Thorne, etc.)
      realms.ts           # Reinos vizinhos (Arvandor, Eldoria, Khar)
      rng.ts              # PRNG determinístico Mulberry32 por seed de campanha
    ai/
      provider.ts         # Factory AIProvider
      wrapper.ts          # UnifiedAIWrapper com fallback em cascata (Groq -> Gemini -> OpenAI -> Mock)
      groq.ts             # Provedor Groq Cloud (Llama 3.3 70B / Llama 3.1 8B)
      gemini.ts           # Implementação com @google/generative-ai
      openai.ts           # Implementação OpenAI / OpenRouter
      mock.ts             # Provedor inteligente offline em português
      prompts.ts          # Prompts versionados (v1.1) com injeção dinâmica de lore
      parser.ts           # Parser resiliente com validação Zod
    db/
      repository.ts       # Interface IGameRepository
      file-repository.ts  # Persistência server-side local (.data/games)
      supabase.ts         # Persistência Supabase / PostgreSQL com JSONB
      index.ts            # Factory singleton com fallback automático
  types/
    game.ts               # Tipos do reino, facções, ações, eventos e histórico
    ai.ts                 # Contratos de entrada e saída da IA
  tests/
    engine.test.ts        # Testes automatizados do motor de regras
supabase/
  schema.sql              # Script SQL com tabelas e índices para Supabase
```

---

## 3. Regras Invioláveis para Agentes de Código

### A. Validação de Ações da IA
* Toda resposta da IA **deve** passar pelo `AIInterpretationResponseSchema` em `src/lib/ai/parser.ts`.
* Cada ação estruturada **deve** ser sanitizada via `sanitizeAction(action)` em `src/lib/game/actions.ts`.
* **Nunca** confie em magnitudes brutas vindas da IA:
  - `ADD_GOLD` e `ADD_FOOD` são limitados a deltas de ±600.
  - Atributos morais e de facções são limitados a deltas de ±35/±40.
  - Se a IA retornar tipos inexistentes ou fora do schema, descarte silenciosamente a ação inválida e mantenha a narrativa.

### B. O Servidor é a Autoridade
* O cliente **nunca** envia estado modificado (ex: `{ gold: 99999 }`).
* O cliente envia apenas `{ gameId, choiceId }` ou `{ gameId, freeTextDecision }`.
* O backend carrega o estado do banco/arquivo, processa o turno, salva e devolve o novo estado.

### C. Sucessão Dinástica
* A campanha representa uma **dinastia**, não apenas um personagem individual.
* Quando o governante morre (por idade, assassinato, guerra ou revolta), promova o próximo elemento de `state.heirs` para `state.currentRuler`, grave a entrada em `rulersHistory` e continue a partida.
* Somente acione `isGameOver = true` se a população for 0, se o reino sofrer colapso total anárquico ou se não houver mais herdeiros disponíveis.

### D. Adição de Novos Conteúdos
* **Para adicionar um novo evento**: basta incluir um novo objeto `GameEvent` no array `GAME_EVENTS` em `src/lib/game/events.ts`. Não é necessário alterar nenhum outro arquivo.
* **Para adicionar uma nova Linha de História / Lore de Cenário**:
  1. Crie um arquivo em `src/content/storylines/nome-do-cenario.ts` implementando `StorylineDefinition` (com título, lore descritiva, personagens e eventos exclusivos).
  2. Exporte e adicione ao array `STORYLINES` em `src/content/storylines/index.ts`.
  3. O novo cenário aparecerá automaticamente no seletor de Nova Campanha e sua lore guiará o modelo de IA.
* **Para adicionar uma nova ação de jogo**:
  1. Adicione a variante em `GameAction` (`src/types/game.ts`).
  2. Adicione ao `GameActionSchema` (`src/lib/game/actions.ts`).
  3. Adicione o executor em `applyAction()` (`src/lib/game/actions.ts`).
  4. Adicione ao `SYSTEM_PROMPT` em `src/lib/ai/prompts.ts`.

---

## 4. Testes e Verificação

Sempre rode os testes antes e depois de qualquer alteração no motor de jogo:

```bash
# Executa a suíte de testes com Node e TSX
npm test

# Valida compilação e TypeScript sem erros
npm run build
```

A suíte de testes cobre:
1. Clamping e limites numéricos de ouro, comida, estabilidade e facções.
2. Morte do monarca e ascensão do herdeiro.
3. Simulação contínua de 30 turnos sem quebras, `NaN` ou corrupção de dados.

