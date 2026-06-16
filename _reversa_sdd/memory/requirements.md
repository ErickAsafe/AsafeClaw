# Unit: memory

## Visão Geral
Gerencia o estado de curto e longo prazo do agente, incluindo persistência do histórico do Telegram em banco de dados SQLite e sincronização bidirecional com o Obsidian do usuário.

## Responsabilidades
- Persistir e recuperar histórico do chat (mensagens).
- Rastrear a contagem de tokens gastos por usuário/provedor para controle financeiro (FinOps).
- Arquivar "fatos" do usuário (long-term memory) extraídos pelo LLM e exportá-los em Markdown.

## Regras de Negócio
- Todo fato armazenado na tabela `user_facts` deve disparar uma sincronização (criação/edição) de arquivo Markdown no Obsidian. 🟡
- A conexão com SQLite deve usar o PRAGMA `journal_mode = WAL` para evitar "database is locked" com múltiplas chamadas assíncronas concorrentes do Telegram. 🟢

## Requisitos Funcionais
| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Histórico Local | Must | O Agente recupera mensagens passadas da mesma sessão via DB. |
| RF-02 | Rastreio de Custos | Must | `TokenUsageRepository` armazena `prompt_tokens` e `completion_tokens`. |
| RF-03 | Vault Sync | Should | Os fatos são persistidos no cofre do Obsidian como arquivos `.md`. |

## Rastreabilidade de Código
| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `src/memory/db.ts` | Configuração SQLite | 🟢 |
| `src/memory/ObsidianSync.ts` | Sincronizador | 🟢 |
| `src/memory/MemoryManager.ts` | Fachada de Contexto | 🟢 |
