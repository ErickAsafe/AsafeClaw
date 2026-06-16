# Unit Design: handlers

## Propósito Técnico
Atuar como camada de Adapter (Interface de Adaptação) isolando as complexidades e limitações da API do Telegram do núcleo inteligente do agente.

## Estrutura de Arquivos
- `TelegramInputHandler.ts`: Processamento de entrada (webhooks/polling), verificação (middleware), parsing e download.
- `TelegramOutputHandler.ts`: Processamento seguro de markdown, quebra de texto e requisições HTTP de envio.

## Fluxos Principais
### Recebimento de Áudio/Voz
1. O Telegram envia um arquivo de voz via payload.
2. O `TelegramInputHandler.downloadFile` baixa o arquivo em `.tmp/`.
3. Chama a função `transcribeAudio` usando o endpoint Groq.
4. Retorna a transcrição para ser alimentada no `AgentLoop`.

## Tratamento de Erros e Casos de Borda
- **Limitação de Tamanho**: O Telegram não permite mensagens maiores que ~4096 caracteres. O Output Handler deve garantir a entrega sem cortes bruscos de formatação.
