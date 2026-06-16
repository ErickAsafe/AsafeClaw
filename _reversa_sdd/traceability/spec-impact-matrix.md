# Spec Impact Matrix

| Componente Alterado | Impacta | Risco | Motivo |
|---------------------|---------|-------|--------|
| `AgentLoop` | `MemoryManager`, `ToolRegistry` | Alto | Mudança no fluxo do agente quebra iterações e chamadas de tools. |
| `TelegramInputHandler` | `AgentLoop` | Médio | Se a extração de texto falhar, o loop recebe input quebrado. |
| `MemoryManager` | `AgentLoop`, `ObsidianSync` | Alto | Alterar formato de DB pode quebrar histórico. |
| `ToolRegistry` | `AgentLoop` | Baixo | Adicionar tools não quebra o core, apenas expande capacidades. |
