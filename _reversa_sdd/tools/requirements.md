# Unit: tools

## Visão Geral
Gerencia e implementa as ferramentas e comandos de sistema operacional / web que o AsafeClaw tem permissão de chamar ativamente em nome do usuário.

## Responsabilidades
- Prover abstrações de execução (`BaseTool.ts`).
- Registrar cada ferramenta com os Schemas padrão do Gemini (OpenAI Formats).
- Dar acesso à rede e ao sistema de arquivos de forma controlada.

## Regras de Negócio
- Uma ferramenta não registrada não pode ser ativada. Erros de ferramentas devolvem feedback amigável ao LLM. 🟢
- A execução local deve ser validada por segurança caso o `SystemMonitorTool` seja invocado. 🟡

## Requisitos Funcionais
| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Busca Web | Should | Executa varreduras de SEO/Pesquisa via API de buscas (Tavily). |
| RF-02 | Raspagem Web | Should | Baixa e lê HTML via Cheerio (`WebScraperTool`). |
| RF-03 | Integração de Schemas | Must | Expõe JSON Schema Properties para o modelo. |

## Rastreabilidade de Código
| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `src/tools/BaseTool.ts` | Interface principal | 🟢 |
| `src/tools/ToolRegistry.ts` | Registrador global | 🟢 |
