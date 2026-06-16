# Unit: config

## Visão Geral
Gerencia a configuração central do bot, variáveis de ambiente (tokens de API, banco de dados) e URLs de servidores MCP.

## Responsabilidades
- Carregar e validar variáveis de ambiente a partir do `.env`.
- Exportar os endpoints dos servidores MCPs.

## Regras de Negócio
- A inicialização deve falhar caso variáveis obrigatórias (ex: `GROQ_API_KEY`, tokens) estejam ausentes. 🟡

## Requisitos Funcionais
| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Carregar configurações | Must | As configurações estão disponíveis num objeto centralizado. |
| RF-02 | Prover URLs MCP | Must | O sistema pode ler as rotas para acessar ferramentas MCP. |

## Requisitos Não Funcionais
| Tipo | Requisito inferido | Evidência no código | Confiança |
|------|--------------------|---------------------|-----------|
| Segurança | Variáveis sensíveis vêm do ambiente e não do código fonte | `src/config/env.ts` | 🟢 |

## Critérios de Aceitação
```gherkin
Dado que o arquivo .env contém todas as chaves
Quando o módulo config for importado
Então as variáveis devem estar tipadas e acessíveis

Dado que falte uma variável obrigatória
Quando o módulo config for importado
Então o sistema deve falhar silenciosamente ou lançar erro
```

## Prioridade (MoSCoW)
| Requisito | MoSCoW | Justificativa |
|-----------|--------|---------------|
| Variáveis de Ambiente | Must | Caminho crítico absoluto do bot |

## Rastreabilidade de Código
| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `src/config/env.ts` | `env` | 🟢 |
| `src/config/mcp.ts` | `mcpEndpoints` | 🟢 |
