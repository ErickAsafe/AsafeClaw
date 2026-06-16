# Questões de Validação (Revisor)

> **Status:** ✅ TODAS AS QUESTÕES RESOLVIDAS (Data: 16/06/2026)

As decisões arquiteturais foram debatidas e aprovadas pela Mesa Redonda de Especialistas:

1. **Testes Unitários (config):** Decidido pelo uso do `Vitest` (TDD Workflow / Fail-Fast).
2. **Timeout Global (core):** Decidido pelo timeout dinâmico de 60s/180s com cancellation tokens (Performance Engineer).
3. **Limpeza Temporária (handlers):** Deleção imediata (ephemeral storage) ao concluir a transcrição (Security Auditor).
4. **Múltiplos MCPs (mcps):** Registry dinâmico com leitura de diretório para escalabilidade e OCP (Senior Architect).
5. **Context Window Pruning (memory):** Sliding Window com sumarização assíncrona usando modelo menor em background (Cost Optimization).
6. **Skills por Similaridade (skills):** Uso do `sqlite-vss` / `sqlite-vec` para roteamento semântico de skills (Embedding Strategies).
7. **Humano In-The-Loop (tools):** Aprovação interativa forçada via botão Inline no Telegram antes de rodar comandos mutáveis no SO (Security Auditor).
