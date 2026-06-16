# Unit Design: core

## Propósito Técnico
Fornecer o motor lógico principal do bot através de um loop assíncrono determinístico que conecta memória, provedores de IA e execução de ferramentas.

## Estrutura de Arquivos
- `AgentLoop.ts`: Classe que orquestra a conversação.
- `providers/`: Interfaces e implementações que abstraem serviços de IA (Gemini).

## Fluxos Principais
### Execução do Turno (Turn)
1. Recebe a requisição através do Telegram.
2. Inicia o `AgentLoop.run` passando contexto, provider e schema de tools.
3. Repete a chamada ao provedor até receber uma resposta de texto final.
4. Entre as iterações, se `toolCall` for detectada, executa a ferramenta usando `ToolRegistry` e injeta a resposta no contexto como `user`.

## Componentes Internos
- **`AgentLoop`**: Controlador principal de estado da sessão.

## Tratamento de Erros
- Implementa try/catch no método gerador do provedor.
- Caso o erro contenha `tool_use_failed`, adiciona uma string de *auto-healing* no contexto instruindo o LLM a consertar o formato.
