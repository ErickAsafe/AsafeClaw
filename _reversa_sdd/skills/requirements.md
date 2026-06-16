# Unit: skills

## Visão Geral
Habilita as "Skills" (habilidades modulares em formato Markdown) dando capacidade ao SandeClaw de desempenhar múltiplos papéis arquiteturais e de engenharia reversa de maneira orientada.

## Responsabilidades
- Carregar habilidades da pasta `.agents/skills/`.
- Fazer parse do cabeçalho YAML para extrair metadados e configuração de agente.
- Decidir qual Skill deve ser ativada dinamicamente com base no comando do usuário.

## Regras de Negócio
- Uma Skill é validada com base na estrutura de pastas contendo `SKILL.md`. 🟢
- Todo comportamento instrucional deve ser injetado como `systemInstruction` para alterar a "persona" do modelo. 🟢

## Requisitos Funcionais
| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Loader de SKILL.md | Must | Converte o arquivo físico num objeto utilizável. |
| RF-02 | Roteamento | Must | O texto do usuário ativa skills explicitamente via nome. |

## Rastreabilidade de Código
| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `src/skills/SkillLoader.ts` | Parsing de FS | 🟢 |
| `src/skills/SkillRouter.ts` | Injeção no Agente | 🟢 |
