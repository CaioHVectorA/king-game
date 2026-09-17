# TODO & Roadmap — AI Kingdom Simulator

Lista de tarefas concluídas, melhorias contínuas e planejamento de próximas funcionalidades do projeto.

---

## 🚀 Concluído no MVP (v1.0)

- [x] **Setup & Bootstrap**
  - [x] Next.js 16 (App Router) + TypeScript + Tailwind CSS v4.
  - [x] Configuração de tipografia nobre com Google Fonts (`Cinzel` e `Geist`).
  - [x] Estilização medieval com bordas douradas, tons escuros nobres e micro-animações.

- [x] **Game Engine Autoritativo**
  - [x] Definição estrita do `KingdomState` (recursos, facções, flags, história, delayed events, etc.).
  - [x] Validação e sanitização matemática com limites em `LIMITS` e Zod Schema em `actions.ts`.
  - [x] Resolução autoritativa do loop de jogo `processTurn()` sem delegação de simulação para a IA.
  - [x] Sistema de envelhecimento, manutenção sazonal, consumo de grãos e desgaste bélico em `consequences.ts`.
  - [x] Checagem e regras de Sucessão Dinástica e Morte de Monarca com continuidade de herdeiros.
  - [x] Checagens de Game Over e queda da dinastia.

- [x] **Sistema de Eventos & Delayed Consequences**
  - [x] Catálogo balanceado de mais de 16 eventos fundamentais (seca, peste, guerra, intriga, etc.).
  - [x] Suporte a pré-requisitos lógicos e ponderação com RNG determinístico (`Mulberry32`).
  - [x] Agendamento e disparo de consequências atrasadas (*delayed events*).

- [x] **Integração de IA com Wrapper Universal & Baixo Custo**
  - [x] Prompt unificado versionado (`v1.1`) gerando JSON com apenas 1 chamada por turno (~250 tokens) e injeção dinâmica de Lore.
  - [x] Parser resiliente com limpeza de markdown e validação Zod Schema (`AIInterpretationResponseSchema`).
  - [x] `UnifiedAIWrapper` com fallback automático em cascata e suporte a:
    - [x] Groq Cloud (inferência ultrarrápida com `llama-3.3-70b-versatile` e `llama-3.1-8b-instant`)
    - [x] Google Gemini (`@google/generative-ai` com `gemini-1.5-flash`)
    - [x] OpenAI / OpenRouter (`gpt-4o-mini` e outros modelos via endpoint customizado)
    - [x] Mock Heurístico Inteligente Offline (compreensão semântica em português).

- [x] **Sistema Modular de Lore e Linhas de História (`src/content/storylines/`)**
  - [x] Desacoplamento total de game design em módulos TypeScript parametrizáveis (`StorylineDefinition`).
  - [x] 3 Linhas Narrativas completas prontas para jogar:
    - [x] 👑 *As Crônicas de Valoria* (Intriga feudal, política e comércio clássico)
    - [x] ⚔️ *A Fúria das Estepes* (Guerra total contra a Horda de Khar, cerco militar e sobrevivência)
    - [x] 🩸 *A Praga das Sombras* (Dark fantasy, epidemia mortal, Inquisição fanática e escassez)
  - [x] Seletor visual de Storylines na interface ao criar nova dinastia (`NewGameModal`).
  - [x] Injeção dinâmica da Lore específica de cada cenário no prompt do sistema da IA.

- [x] **Persistência de Dados**
  - [x] Repositório autoritativo em arquivo local (`.data/games`) para execução imediata sem dependências externas.
  - [x] Suporte nativo a PostgreSQL / Supabase com schema pronto (`supabase/schema.sql`).
  - [x] Salva automático no servidor após cada turno.

- [x] **Interface do Usuário (UI/UX)**
  - [x] Barra de Recursos Centrais (Ouro, Comida, População, Estabilidade, Militar).
  - [x] Card do Evento Ativo com emissário e narrativa imersiva.
  - [x] Caixa de Decisões com opções rápidas e campo livre de decreto com sugestões da corte.
  - [x] Gaveta de Crônica Histórica Dinástica (histórico turno a turno).
  - [x] Gaveta do Conselho da Corte com personagens, lealdade e influência.
  - [x] Gaveta de Opinião Pública das 5 Facções com medidores de -100 a +100.
  - [x] Gaveta de Diplomacia com reinos vizinhos e status de guerra.
  - [x] Modais de Sucessão, Game Over e Gestão/Criação de Campanhas.

- [x] **Testes Automatizados**
  - [x] Testes de limites e sanitização anti-cheat/alucinação.
  - [x] Teste de sucessão dinástica e troca de governante.
  - [x] Teste de simulação contínua de 30 turnos sem corrupção ou quebra de estado.

---

## 🔮 Backlog & Próximas Fases (v1.1+)

### 1. Áudio & Imersão
- [ ] Adicionar efeitos sonoros sutis (virada de pergaminho, carimbo de cera real, trombetas de guerra).
- [ ] Trilha sonora ambiental medieval minimalista (opcional e desativada por padrão).

### 2. Expansão Narrativa & Eventos
- [ ] Ampliar catálogo de eventos para mais de 50 eventos temáticos.
- [ ] Adicionar eventos em cadeia com arcos narrativos contínuos de 3 a 5 partes.
- [ ] Sistema de traços adquiridos pelo governante com base em suas escolhas (ex: *"O Tirano"*, *"O Magnânimo"*, *"O Construtor"*).

### 3. Diplomacia Avançada & Mapa
- [ ] Visualização em mapa estilizado minimalista dos 4 reinos e rotas comerciais.
- [ ] Missões de espionagem e assassinato político direcionadas a vizinhos.
- [ ] Tratados de casamento inter-reinos com concessões de territórios.

### 4. Gestão de Corte & Intrigas
- [ ] Possibilidade de nomear ou destituir membros do conselho real.
- [ ] Conspirações secretas detectáveis pela rede de espiões antes do estouro do golpe.

### 5. Configurações & Preferências
- [ ] Painel de configurações no jogo para alternar entre modelos de IA (Gemini Flash vs Pro vs GPT-4o).
- [ ] Modo Hardcore (morte permanente e instabilidade agravada).
- [ ] Exportação da Crônica Real em formato Markdown / PDF para leitura da história da dinastia.
