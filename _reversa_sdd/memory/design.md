# Unit Design: memory

## Propósito Técnico
Fornecer uma camada de persistência resiliente, acoplando banco relacional embutido (SQLite) com armazenamento textual descentralizado (Obsidian/Markdown).

## Estrutura de Arquivos
- `db.ts`: Instancia o `better-sqlite3`, executa migrações estruturais simples no boot e configura o WAL.
- `MemoryManager.ts`: Fachada usada pelo `AgentLoop` para ler/escrever o "Context Window".
- `*Repository.ts`: Implementações do padrão DAO.
- `ObsidianSync.ts`: Driver do sistema de arquivos para dual-write de anotações.

## Fluxos Principais
1. **Nova Mensagem:** O AgentLoop chama `MemoryManager.addMessage`. O dado é salvo na tabela `messages`.
2. **Nova Sessão:** Verifica se a `conversation_id` existe; se não, inicializa e rastreia o provedor logado.
3. **Persistência de Fato:** Quando a tool de memória detecta um fato relevante, grava no SQLite e o `ObsidianSync` cria/modifica um `.md` no diretório pré-configurado do usuário.

## Tratamento de Erros
- Cria as pastas do banco caso não existam (`fs.mkdirSync(dataDir)`).
