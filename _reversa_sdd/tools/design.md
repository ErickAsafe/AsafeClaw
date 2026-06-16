# Unit Design: tools

## Propósito Técnico
Atuar como os "braços e pernas" do bot. Utiliza o paradigma de *Function Calling* (Chamada de Ferramentas) para dar side-effects seguros ao LLM sem recompilar.

## Estrutura de Arquivos
- `BaseTool.ts`: Fornece herança. Possui o nome, a descrição, e os parâmetros (JSON schema).
- `ToolRegistry.ts`: Mantém o array de ferramentas ativas. Exporta uma lista de Schemas compaginados antes do `AgentLoop.run()`.
- Ferramentas Específicas: `WebSearchTool`, `WebScraperTool`, `SystemMonitorTool`, `MemoryTool`.

## Fluxos Principais
1. No boot, `ToolRegistry` instancia as classes.
2. Durante a conversa, se o LLM decidir "Eu preciso saber os processos rodando no Windows", ele envia um `{name: "system_monitor", args: {}}`.
3. O AgentLoop identifica isso e intercepta enviando para `ToolRegistry.getTool(name)`.
4. A promessa `execute()` da classe resolve. A resposta em String é repassada para o `AgentLoop` num segundo turno, com a role `user`.

## Componentes Internos
- **Tipagem Schema**: As descrições em `args` das ferramentas são rigorosamente tipadas como `JSON Schema` nativo, compatível com a validação estrita da especificação OpenAI.
