# Unit Tasks: core

- [x] Mover o loop principal (chamada do provider LLM) para uma classe robusta (`AgentLoop`) que intercepte callbacks e gerencie a janela de contexto. 🟢
- [x] Implementar log nativo de conversas no `better-sqlite3`. 🟢
- [x] Tratamento recursivo automático de `tool_use_failed`. 🟢
- [x] Implementar timeout dinâmico (60s default / 180s para tools pesadas) com AbortController para evitar travamentos na VPS. 🟢 *(Decisão: Performance Engineer)*
