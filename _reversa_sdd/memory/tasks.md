# Unit Tasks: memory

- [x] Criar esquema SQLite embutido no arquivo `db.ts` para tabelas: `conversations`, `messages`, `user_facts`, `token_usage`. 🟢
- [x] Implementar DAO para registro de tokens. 🟢
- [x] Construir a fachada `MemoryManager` para carregar mensagens anteriores da thread. 🟢
- [x] Escrever rotina para gravação no Obsidian via sistema de arquivos baseada em inserções no `user_facts`. 🟢
- [x] Implementar *Sliding Window com Compressão Semântica*, mantendo 10-15 mensagens brutas e usando LLM leve em background para sumarizar o histórico antigo. 🟢 *(Decisão: Cost Optimization)*
