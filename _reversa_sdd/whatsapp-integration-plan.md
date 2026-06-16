# Integração AsafeClaw + WhatsApp Cloud API (Oficial)

Este plano detalha a implementação da interface do WhatsApp para o AsafeClaw, permitindo que o bot funcione no WhatsApp Oficial (com foco na transcrição do Transcreva.ai).

## Sobre o uso de MCP vs Variáveis Nativas

O MCP é perfeito para dar "superpoderes" ao bot (como ler seu Google Drive ou Calendário). Mas para o WhatsApp ser a "boca e os ouvidos" do bot, o próprio código fonte (Node.js) precisa receber as mensagens (através de um Webhook) e enviar as respostas. Portanto, **é estritamente necessário** que as chaves sejam geradas no Meta for Developers e colocadas no `.env`. Não podemos usar um MCP terceirizado para isso, pois o bot precisa de um servidor HTTP interno rodando na porta 3000 para receber os áudios do WhatsApp em tempo real e passar para a IA.

## Mudanças Propostas Arquiteturais

### Dependências
- Adicionar `express` e `@types/express` para rodar o servidor HTTP que vai escutar os Webhooks da Meta.

### Configuração `.env`
- `WHATSAPP_TOKEN` (O token de acesso da API Graph).
- `WHATSAPP_PHONE_ID` (O ID do número de telefone).
- `WHATSAPP_VERIFY_TOKEN` (Um token criado por nós para autenticar a conexão inicial do Webhook).

### Handlers (Os braços do WhatsApp)

#### `src/handlers/WhatsappInputHandler.ts`
- Responsável por levantar o servidor Express e expor a rota `GET /webhook` (para verificação da Meta) e `POST /webhook` (para receber as mensagens de texto e áudio enviadas pelos clientes).
- Terá a lógica para baixar os arquivos `.ogg` dos servidores da Meta de forma segura usando o token.
- Passará o bastão para o cérebro da IA via `controller.handleMessage()`.

#### `src/handlers/WhatsappOutputHandler.ts`
- Responsável por enviar a transcrição e os textos gerados pela IA de volta para o cliente, fazendo requisições POST nativas para a API do Facebook Graph (`v19.0`).

### Ponto de Entrada (`src/index.ts`)
- Inicializar a aplicação `express` na porta 3000 em paralelo ao Telegram.
- Registrar as rotas do WhatsApp para receber notificações de mensagens recebidas (`messages`) e status de leitura.
