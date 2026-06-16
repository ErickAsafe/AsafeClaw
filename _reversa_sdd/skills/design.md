# Unit Design: skills

## Propósito Técnico
Permitir a extensão de funcionalidades sem recompilação ou refatoração profunda. As Skills são "prompts engarrafados" associados a permissões e rotinas específicas.

## Estrutura de Arquivos
- `SkillLoader.ts`: Utilitário FS que procura pastas contendo arquivos `SKILL.md` e lê seu conteúdo e frontmatter (YAML).
- `SkillRouter.ts`: Avalia qual skill melhor se enquadra à mensagem do usuário.
- `SkillExecutor.ts`: Invoca a skill selecionada no ciclo do `AgentLoop`.

## Fluxos Principais
1. Sistema inicializa, o `SkillLoader` mapeia o diretório `.agents/skills`.
2. Usuário manda comando (ex: `reversa`).
3. O `SkillRouter` intercepta a chamada, extrai a especificação YAML de `.agents/skills/reversa/SKILL.md`.
4. O texto base do markdown passa a ser a "Personalidade" (system prompt) principal para aquela iteração/sessão do AgentLoop.

## Componentes Internos
- **Frontmatter Parser**: Interpretador embutido para ler configurações de versão, limites de contexto e autorização localizados no topo das SKILLs.
