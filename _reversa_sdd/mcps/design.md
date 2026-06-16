# Unit Design: mcps

## Propósito Técnico
Integrar a especificação do Anthropic MCP (Model Context Protocol) ao sistema, atuando como ponte cliente para que o modelo possa interagir via JSON RPC.

## Estrutura de Arquivos
- `google.ts`: Módulo encapsulando o servidor MCP do Google (Calendar/Gmail).

## Fluxos Principais
1. No boot da aplicação, o cliente local do MCP sobe.
2. Ele obtém a lista de ferramentas que o MCP possui (`mcp_list_tools`).
3. Registra essas ferramentas na instância do `ToolRegistry`.
4. Quando o modelo solicita o uso, o tráfego é reencaminhado via JSON RPC.
