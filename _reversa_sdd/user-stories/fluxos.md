# Fluxos Principais (User Stories)

## Story 1: Interação Básica de Texto
**Como** usuário autorizado do Telegram
**Eu quero** enviar uma mensagem de texto para o bot
**Para que** eu receba uma resposta inteligente baseada no meu contexto passado

**Critérios de Aceite:**
1. O bot deve ignorar a mensagem (sem erro ou crash) se o ID do remetente não estiver na lista de usuários permitidos.
2. O bot deve persistir a mensagem enviada na tabela `messages`.
3. A IA deve gerar a resposta e registrar o custo no `TokenUsageRepository`.

## Story 2: Transcrição de Voz
**Como** usuário
**Eu quero** enviar uma nota de áudio no Telegram
**Para que** eu não precise digitar, e o bot compreenda meu pedido

**Critérios de Aceite:**
1. O arquivo `oga` ou similar é salvo no `/tmp`.
2. A API Whisper do Groq é chamada para gerar o transcript.
3. O AgentLoop trata a mensagem como texto normal daquele ponto em diante.

## Story 3: Chamada de MCP
**Como** usuário
**Eu quero** perguntar sobre minha agenda do Google
**Para que** o bot leia ativamente meus dados externos antes de responder

**Critérios de Aceite:**
1. O LLM decide chamar a ferramenta de calendário exportada pelo MCP.
2. O AgentLoop executa o MCP passando os argumentos solicitados.
3. O LLM recebe o JSON da agenda como Role `user` e finalmente formula a resposta.
