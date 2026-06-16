# Unit: mcps

## Visão Geral
Gerencia a instanciação e o envelopamento dos servidores Model Context Protocol (MCP) para que ferramentas ricas (como integrações do Google) possam ser usadas no bot.

## Responsabilidades
- Traduzir os métodos e schemas do servidor MCP para o formato nativo suportado pelo LLM.
- Isolar a lógica de autenticação dos serviços remotos (ex: Google OAuth) do agente.

## Regras de Negócio
- Cada MCP deve registrar suas ferramentas no `ToolRegistry` do bot. 🟡

## Requisitos Funcionais
| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Integração Google | Should | Permite leitura de calendário e e-mails de forma local via pacote MCP. |

## Rastreabilidade de Código
| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `src/mcps/google.ts` | Servidor Google | 🟢 |
