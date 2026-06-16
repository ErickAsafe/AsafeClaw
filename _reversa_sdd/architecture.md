# Arquitetura — SandeClaw

SandeClaw é um Telegram Bot autônomo baseado em TypeScript e Node.js. Ele atua como um agente IA avançado utilizando os modelos da Google (Gemini) e MCPs (Model Context Protocol).

## Princípios
- **Modularidade:** Componentes separados por domínio (core, memory, handlers, mcps, tools).
- **Extensibilidade:** Sistema de Skills baseado em Markdown e Tools integradas ao AgentLoop.

## Dívidas Técnicas Identificadas
1. 🔴 Ausência de testes unitários ou de integração automatizados.
2. 🟡 Tratamento de erro nos middlewares poderia ter fallback para o usuário.
