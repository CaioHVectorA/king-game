# 📱 Modo de Teste Mobile na Vercel (Preview Standalone)

> **Status:** Configurado para teste autônomo na rua / celular via Vercel, sem necessidade de banco de dados externo ou chaves de IA.

---

## ⚡ Como Funciona Este Modo de Teste

Para permitir que você teste o jogo no celular imediatamente (apenas subindo o repositório na Vercel):

1. **Banco de Dados / Persistência Autônoma:**
   - O repositório [`FileGameRepository`](file:///src/lib/db/file-repository.ts) está operando com fallback automático para `/tmp/king-game-data` (diretório gravável do AWS Lambda / Vercel Serverless) aliado a um cache em memória.
   - **Zero configuração:** você não precisa conectar Supabase nem criar tabelas para conseguir jogar.

2. **Inteligência Artificial (Mock Heurístico em Português):**
   - Como nenhuma chave de API (`GROQ_API_KEY`, `GEMINI_API_KEY`) foi configurada, o [`UnifiedAIWrapper`](file:///src/lib/ai/wrapper.ts) ativa o [`MockAIProvider`](file:///src/lib/ai/mock.ts).
   - Ele analisa sintaticamente as decisões que você digitar em português (palavras-chave como *ouro, imposto, colheita, trigo, guerra, paz, treinar, muralhas, festa, igreja*), gera deltas de recursos balanceados e devolve narrativas dinâmicas sem latência de rede.

---

## 🚀 Como Subir na Vercel

1. Faça o commit e push das alterações para o seu repositório Git.
2. No painel da **[Vercel](https://vercel.com)**:
   - Clique em **"Add New Project"** e importe este repositório.
   - **Não precisa configurar nenhuma variável de ambiente** neste momento.
   - Clique em **"Deploy"**.
3. Em cerca de 1 minuto o link estará disponível (ex: `https://king-game.vercel.app`).
4. Abra no navegador do celular e jogue!

---

## 📲 O que Testar no Celular (Checklist de Playtest)

- [ ] **Nova Campanha:** Escolha entre os 3 cenários disponíveis (*Valoria*, *Horda de Khar* ou *A Praga das Sombras*).
- [ ] **Decisões Rápidas:** Toque nas opções sugeridas no card de evento.
- [ ] **Decisões Livres (Texto Livre):** Digite um decreto com o teclado do celular (ex: *"Cobrar mais tributos dos nobres e doar comida aos camponeses"*).
- [ ] **Gavetas & Menus:** Abra a Crônica Histórica, Conselho da Corte, Facções e Diplomacia para checar a ergonomia no mobile.
- [ ] **Troca de Turno:** Verifique o feedback narrativo e as barras de recursos após cada turno.

---

## 🔮 Como Ativar a Produção Definitiva Depois

Quando você quiser ativar a persistência permanente no banco e os modelos de IA em nuvem (Groq / Gemini):

1. **Supabase (Banco de Dados Permanente):**
   - Crie um projeto no [Supabase](https://supabase.com).
   - Execute o script [`supabase/schema.sql`](file:///supabase/schema.sql) no SQL Editor.
   - Adicione na Vercel:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `SUPABASE_SERVICE_ROLE_KEY`

2. **IA em Nuvem (Llama 3.3 ou Gemini 1.5):**
   - Obtenha uma chave gratuita no [Groq Console](https://console.groq.com) ou [Google AI Studio](https://aistudio.google.com).
   - Adicione na Vercel:
     - `GROQ_API_KEY` (Recomendado pela velocidade ultrarrápida) ou `GEMINI_API_KEY`.
