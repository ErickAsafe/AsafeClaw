# Inventário do Projeto - SandeClaw

## Estrutura de Diretórios

```
/
├── .env
├── .env.example
├── .gitignore
├── AGENTS.md
├── package.json
├── package-lock.json
├── tsconfig.json
├── src/
│   ├── config/
│   ├── core/
│   │   ├── AgentController.ts
│   │   ├── AgentLoop.ts
│   │   ├── ProviderFactory.ts
│   │   └── providers/
│   ├── handlers/
│   │   ├── TelegramInputHandler.ts
│   │   └── TelegramOutputHandler.ts
│   ├── mcps/
│   ├── memory/
│   │   ├── ConversationRepository.ts
│   │   ├── FactRepository.ts
│   │   ├── MemoryManager.ts
│   │   ├── MessageRepository.ts
│   │   ├── ObsidianSync.ts
│   │   ├── TokenUsageRepository.ts
│   │   └── db.ts
│   ├── skills/
│   ├── tools/
│   └── index.ts
└── data/ (arquivos gerados, DB)
```

## Tecnologias e Frameworks
- **Linguagem Principal**: TypeScript
- **Runtime**: Node.js
- **Telegram Bot API**: grammy
- **Integração IA**: @google/genai, groq-sdk
- **Banco de Dados**: SQLite (better-sqlite3)
- **Ferramentas**: Model Context Protocol (@modelcontextprotocol/sdk)

## Pontos de Entrada
- `src/index.ts` (App principal e inicialização do bot)
- Scripts (package.json): `npm run dev` (`npx tsx src/index.ts`)

## Esquema de Banco de Dados
- Manipulado via `better-sqlite3` em `src/memory/db.ts`
- Repositórios: `ConversationRepository`, `FactRepository`, `MessageRepository`, `TokenUsageRepository`

## Cobertura de Testes
- Nenhuma identificada no `package.json` (script test vazio).
