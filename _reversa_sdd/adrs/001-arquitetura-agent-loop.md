# ADR 001: Arquitetura AgentLoop para LLMs

## Status
Aceito

## Contexto
O bot precisa iterar chamadas de ferramentas de forma autônoma (até um `MAX_ITERATIONS`) usando o protocolo do Gemini. O estado não pode ser mantido apenas na memória da biblioteca, precisa ser resiliente.

## Decisão
Implementamos um `AgentLoop` customizado que gerencia o estado da conversa e as chamadas de ferramentas interativamente, suportando *auto-healing* no caso de falhas de formato JSON por parte do LLM.

## Consequências
- 🟢 **Positivo**: Controle total sobre as iterações e falhas do modelo.
- 🔴 **Negativo**: Complexidade extra para gerenciar as chamadas e as respostas assíncronas em loop `while`.
