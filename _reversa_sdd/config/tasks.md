# Unit Tasks: config

- [x] Criar schema de validação para Zod com fallback para logs claros em caso de chave faltando. 🟢
- [x] Criar injetores (`loadEnv`, `getMcpConfig`) exportando funções tipadas que crasham a app no boot se inválidas. 🟢
- [x] Implementar suíte de testes unitários em Vitest que garantam o fail-fast caso as env vars não sejam carregadas no boot. 🟢 *(Decisão: TDD Workflow - Vitest ESM)*
