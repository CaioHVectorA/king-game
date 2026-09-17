# CONTEXT.md — AI Kingdom Simulator

Documentação abrangente sobre o conceito, arquitetura, regras de negócio, mecânicas de simulação e decisões técnicas do projeto.

---

## 1. Visão Geral do Projeto

O **AI Kingdom Simulator** é um jogo web de gerenciamento narrativo de reino em turnos, inspirado na simplicidade e fluidez de clássicos como *Reigns*, mas com um diferencial central:

> **O jogador possui liberdade total para ditar suas próprias decisões como governante em texto livre, e uma IA interpreta essas intenções dentro de um mundo rigorosamente simulado por um Game Engine autoritativo.**

O foco primordial é:
1. **Liberdade de decisão**: o jogador não está restrito apenas a opções A e B pré-fabricadas.
2. **Consistência do mundo**: a IA **nunca** decide o resultado de forma arbitrária; ela sugere intenções e ações, e o Game Engine decide o que é matematicamente e logicamente válido.
3. **Baixo custo de IA e economia de tokens**: apenas 1 chamada compacta por turno (~250 tokens de resposta), com contexto enxuto e estruturado.
4. **Interface nobre e responsiva**: layout minimalista, moderno e com estética medieval imersiva.

---

## 2. Princípio Arquitetural Fundamental

### ⚔️ Game Engine (O Árbitro Autoritativo)
O servidor possui autoridade absoluta sobre o estado da partida. Ele controla:
* Estoques de recursos (Ouro, Comida, População).
* Indicadores morais e bélicos (Estabilidade 0..100, Poder Militar 0..100).
* Aprovação das 5 facções sociais (-100 a +100).
* Regras de transição de tempo (meses, anos, estações).
* Envelhecimento, morte e sucessão dinástica.
* Consequências atrasadas (*delayed events*) e ativação de marcadores (*flags*).
* Sanitização estrita contra trapaças e alucinações (ex: uma IA nunca pode conceder 999.999 de ouro).

### 🧠 Inteligência Artificial (O Escriba e Intérprete)
A IA atua exclusivamente como intérprete semântico e narradora evocativa:
* Traduz a linguagem natural do jogador em ações tipadas (`ADD_GOLD`, `MODIFY_FACTION`, `START_WAR`, etc.).
* Descreve em 1 a 3 frases evocativas a reação imediata do povo e da corte.
* Retorna JSON estrito validado por schema Zod. Se falhar, o motor aciona fallbacks amigáveis sem travar o jogo.

---

## 3. Estado do Reino (`KingdomState`)

O estado é conciso, serializável em JSON e imutável entre turnos:

| Campo | Tipo | Descrição |
|---|---|---|
| `gold` | `number` | Tesouro real. Abaixo de 0 representa dívida pública (penaliza estabilidade). |
| `food` | `number` | Silos de grãos. Se esgotar (0), ocorre fome com mortalidade da população. |
| `population` | `number` | Cidadãos do reino. Gera tributos mensais e consome comida. |
| `stability` | `number` (0–100) | Ordem interna e coesão social. Próximo a 0 desencadeia motins e golpes. |
| `military` | `number` (0–100) | Força e prontidão dos exércitos. Usado na defesa contra invasões. |
| `factions` | `Factions` | Aprovação das 5 facções: Nobres, Comerciantes, Clero, Camponeses, Exército (-100 a +100). |
| `relations` | `Record<string, number>` | Relações diplomáticas com reinos vizinhos (-100 a +100). |
| `flags` | `Record<string, boolean>` | Marcadores de decisões passadas (ex: `nobles_angry`, `spring_season`). |
| `activeWars` | `string[]` | Guerras ativas que geram desgaste mensal de ouro e soldados. |
| `currentRuler` | `Ruler` | Monarca governante atual (nome, título, idade, anos de reinado, traços). |
| `heirs` | `Ruler[]` | Linha sucessória de herdeiros prontos para assumir a coroa. |
| `history` | `GameHistoryEntry[]` | Crônica detalhada gravada a cada turno. |
| `delayedEvents` | `DelayedEvent[]` | Eventos agendados para turnos futuros decorrentes de decisões passadas. |

---

## 4. As 5 Facções Sociais

1. **Nobres e Barões**: Proprietários de terras. Exigem privilégios e terras; descontentamento gera conspirações e sonegação de tropas.
2. **Guildas de Mercadores**: Controlam as rotas comerciais e trazem ouro; descontentamento gera greves fiscais e redes de contrabando.
3. **Alto Clero**: Guardiões da fé; concedem legitimidade sagrada ao trono ou incitam desobediência moral.
4. **Povo e Camponeses**: A base trabalhadora agrária; impostos extorsivos ou fome geram levantes populares sangrentos.
5. **Exército e Guardas**: Protegem as muralhas e fronteiras; soldos em atraso causam deserção e motins militares.

---

## 5. Sistema de Sucessão e Dinastia

O jogo não se encerra com a morte do governante inicial:
* Governantes envelhecem anualmente (a cada 12 meses).
* A partir dos 65 anos, há probabilidade crescente de morte natural por velhice.
* O governante também pode ser vítima de assassinatos, ferimentos em guerra ou golpes de estado.
* Quando o monarca morre, o herdeiro primogênito é coroado imediatamente com novos traços, e a campanha continua.
* O jogo só tem **Game Over definitivo** se:
  1. Toda a população perecer (`population <= 0`).
  2. O reino sofrer colapso total por anarquia (`stability <= 0` com apoio popular e militar nulos).
  3. O monarca morrer sem deixar nenhum herdeiro vivo.

---

## 6. Camada de Inteligência Artificial

A arquitetura usa uma abstração desacoplada (`AIProvider`):
### Unified AI Wrapper
O sistema utiliza o `UnifiedAIWrapper` (`src/lib/ai/wrapper.ts`), que seleciona e orquestra a chamada de LLM com tolerância a falhas e fallback em cascata automático:

* **`GroqAIProvider`**: Inferência ultrarrápida via Groq Cloud (`llama-3.3-70b-versatile` ou `llama-3.1-8b-instant`).
* **`GeminiAIProvider`**: Integração com a família Google Gemini (padrão: `gemini-1.5-flash`), com alta velocidade e baixo custo.
* **`OpenAIAIProvider`**: Integração com `gpt-4o-mini` ou `OpenRouter` via HTTP fetch nativo (sem dependências extras).
* **`MockAIProvider`**: Heurística inteligente offline com análise léxica em português para testes e jogabilidade instantânea sem necessidade de chaves de API.

Configuração via `.env.local`:
```env
AI_PROVIDER=groq # ou gemini, openai, openrouter, mock
GROQ_API_KEY=gsk_...
GEMINI_API_KEY=AIzaSy...
OPENAI_API_KEY=sk-...
```

### Prompting e Sanitização
* **Prompt Versionado**: `v1.1` em `src/lib/ai/prompts.ts`, com **injeção dinâmica da Lore** do cenário ativo.
* **Esquema de Resposta**:
  ```json
  {
    "intent": "Resumo conciso da intenção",
    "actions": [
      { "type": "ADD_FOOD", "amount": -80 },
      { "type": "MODIFY_FACTION", "faction": "peasants", "amount": 15 }
    ],
    "narrative": "1 a 3 frases descritivas do desfecho régio.",
    "confidence": 0.9
  }
  ```
* **Sanitização de Magnitudes**: Mesmo que o LLM retorne números excessivos, o motor trunca deltas numéricos para faixas seguras definidas em `LIMITS`.

---

## 7. Arquitetura Modular de Lore e Storylines (`src/content/storylines/`)

Todo o game design é modular e parametrizável através da interface `StorylineDefinition`:

```
src/content/storylines/
  ├── types.ts             # Interface StorylineDefinition
  ├── index.ts             # Catálogo de Storylines disponíveis
  ├── valoria-classic.ts   # Cenário 1: As Crônicas de Valoria (Intriga política e comércio)
  ├── khar-invasion.ts     # Cenário 2: A Fúria das Estepes (Guerra e cerco militar)
  └── dark-plague.ts       # Cenário 3: A Praga das Sombras (Dark fantasy e inquisição)
```

Cada storyline define de forma isolada:
1. **Lore do Mundo**: Injetada no prompt da IA para que o modelo fale e reaja dentro do vocabulário e mitos daquele universo.
2. **Condições Iniciais**: Ano, ouro, comida, estabilidade, força militar, leis e guerras ativas.
3. **Personagens Específicos**: Nomes, títulos, retratos, lealdade e traços de personalidade da corte.
4. **Reinos Vizinhos**: Geopolítica, riquezas, poder militar e relações iniciais.
5. **Eventos Exclusivos**: Conjunto de dilemas narrativos criados sob medida para aquele cenário.

Para adicionar um novo universo ou cenário, basta criar um arquivo `.ts` em `src/content/storylines/` e exportá-lo no `index.ts`. O jogo e o seletor visual adaptarão tudo automaticamente sem precisar alterar o Game Engine.

---

## 8. Banco de Dados e Persistência

* **Repositório em Arquivos (`FileGameRepository`)**:
  - Salva em `.data/games/[id].json`.
  - Ativo por padrão no ambiente local.
* **Supabase / PostgreSQL (`SupabaseGameRepository`)**:
  - Ativado automaticamente ao fornecer `NEXT_PUBLIC_SUPABASE_URL` e chaves do Supabase.
  - Script pronto em `supabase/schema.sql`.

---

## 9. Comandos Essenciais

```bash
# Rodar em desenvolvimento
npm run dev

# Rodar a suíte de testes do motor
npm test

# Compilar para produção
npm run build
```
