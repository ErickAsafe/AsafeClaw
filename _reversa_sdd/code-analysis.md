# Análise de Código e Arquitetura — SandeClaw

## Fluxo de Controle e Algoritmos Principais

### AgentLoop (`src/core/AgentLoop.ts`)
O coração do AsafeClaw. Controla a iteração de interações com o LLM (Gemini):
1. Recupera o contexto da conversa (`memory.getContext`).
2. Chama o provedor (`BaseProvider.generate`) com os schemas das ferramentas.
3. Se houver uso de tokens (`response.usage`), registra no banco de dados SQLite (`TokenUsageRepository`).
4. Se o provedor retornar uma chamada de ferramenta (`response.toolCall`), a ferramenta é executada via `ToolRegistry`. O resultado é adicionado ao contexto e uma nova iteração começa.
5. Possui lógica de "Auto-healing": Se o modelo falhar ao usar ferramentas (ex: `tool_use_failed`), injeta uma mensagem corretiva forçando a chamada nativa.

### Telegram Handlers (`src/handlers/`)
- `TelegramInputHandler`: Valida a autorização via `TELEGRAM_ALLOWED_USER_IDS`. Faz download de arquivos em diretório temporário, analisa PDFs e Markdown, e transcreve áudios com a API da Groq (Whisper-large-v3-turbo).
- `TelegramOutputHandler`: Quebra mensagens longas usando markdown seguro e envia de volta ao usuário.

### Sincronização com Obsidian (`src/memory/ObsidianSync.ts`)
Possui dual-write: ao registrar fatos no banco (`user_facts`), também sincroniza gravando no Obsidian via manipulação de arquivos Markdown.

## Estruturas de Dados e Domínio

A persistência utiliza o `better-sqlite3` no modo WAL para concorrência.
As definições de DDL ficam centralizadas em `src/memory/db.ts` mapeando para os repositórios correspondentes (Conversations, Messages, User Facts e Token Usage).

## Confiança
🟢 **CONFIRMADO**: Algoritmo AgentLoop, Handlers e schema de banco de dados diretamente analisados.
