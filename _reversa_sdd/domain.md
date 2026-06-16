# Domínio de Negócio — SandeClaw

## Glossário
- **Conversa (Conversation):** Sessão contínua entre um usuário e o bot.
- **Mensagem (Message):** Uma interação única dentro de uma conversa.
- **Fato (User Fact):** Conhecimento extraído das conversas e persistido como memória de longo prazo do usuário.
- **MCP (Model Context Protocol):** Protocolo para integração de ferramentas externas (Google Calendar, Gmail).

## Regras de Negócio (Implícitas)
1. **Autorização:** Apenas usuários com ID listado em `TELEGRAM_ALLOWED_USER_IDS` podem interagir com o bot.
2. **Auto-healing:** Se a IA falhar ao estruturar uma chamada de ferramenta, o sistema tenta recuperar a interação introduzindo uma mensagem de correção.
3. **Dual-write:** A gravação de memórias de longo prazo (fatos) no banco de dados desencadeia também a gravação em um cofre no Obsidian via sistema de arquivos.

## Confiança
🟡 **INFERIDO**: Regras baseadas na leitura dos handlers e gerenciador de memória.
