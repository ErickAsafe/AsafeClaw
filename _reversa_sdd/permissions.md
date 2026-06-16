# Matriz de Permissões — SandeClaw

O sistema possui um controle de acesso binário baseado no ID do Telegram.

| Ação | Usuário Autorizado | Usuário Não Autorizado |
|------|--------------------|------------------------|
| Iniciar Conversa | Permitido | Negado (Ignorado) |
| Enviar Mensagem | Permitido | Negado (Ignorado) |
| Usar Ferramentas | Permitido | Negado (Ignorado) |
| Acessar MCPs | Permitido | Negado (Ignorado) |

A verificação ocorre no middleware `TelegramInputHandler.handleAuth`.
