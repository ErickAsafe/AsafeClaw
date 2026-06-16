# Unit: core

## Visão Geral
Gerencia a orquestração do bot, executando o loop de agente (AgentLoop) e interagindo com os provedores de inteligência artificial (LLMs).

## Responsabilidades
- Executar o loop iterativo do agente, controlando o limite máximo de iterações.
- Manter o fluxo de chamada para o LLM, registrar uso de tokens, interceptar requisições de ferramentas e tratar os resultados.
- Fornecer um mecanismo de auto-healing em caso de falhas nas chamadas do LLM (ex: falhas de formatação JSON).

## Regras de Negócio
- O AgentLoop não pode ultrapassar `MAX_ITERATIONS` definidos no ambiente. 🟢
- Qualquer uso de tokens gerado pela interação com o provedor deve ser registrado em `TokenUsageRepository`. 🟢
- Erros de ferramenta (`tool_use_failed`) devem gerar uma injeção no histórico forçando o modelo a corrigir o formato. 🟢

## Requisitos Funcionais
| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Loop de Iteração | Must | O agente deve iterar chamadas LLM e execução de tools sequencialmente. |
| RF-02 | Tratamento de Falhas | Must | Exceções de APIs não devem travar o processo inteiro. |

## Rastreabilidade de Código
| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `src/core/AgentLoop.ts` | `AgentLoop` | 🟢 |
