# Unit Design: config

## Propósito Técnico
Centralizar e encapsular a leitura, validação e tipagem forte das variáveis de ambiente e configurações globais (como rotas para MCPs).

## Estrutura de Arquivos
- `env.ts`: Lê variáveis do ambiente (process.env), aplica valores padrão quando apropriado e exporta um objeto tipado e consolidado.
- `mcp.ts`: Configura os metadados e possíveis rotas/urls dos servidores MCP (Model Context Protocol).

## Fluxos Principais (Design)

### Inicialização e Validação do Ambiente
1. O Node.js é inicializado e o módulo `config/env.ts` é requerido por outras partes (ex: `AgentLoop` ou `TelegramInputHandler`).
2. O código do módulo avalia a presença de propriedades críticas no `process.env` (ex: tokens e chaves de API).
3. Se alguma propriedade crítica não for encontrada, o fluxo falha prematuramente (fail-fast), prevenindo falhas obscuras mais tarde durante a execução.

## Componentes Internos
- **`env`**: Constante/objeto global provendo acesso semantico às variáveis de configuração.
- **`mcpEndpoints`**: Configuração estática do registro de MCPs locais ou remotos disponíveis para a aplicação.

## Tratamento de Erros e Casos de Borda
- **Formatação Flexível**: Transforma variáveis textuais em estruturas nativas adequadas (ex: conversão do `TELEGRAM_ALLOWED_USER_IDS` em Array listado).
- **Graceful degradation**: Ausência de variáveis não-críticas recebe tratamento via default pre-configurado para que o sistema suba com features desabilitadas ou parciais em vez de crashear.
