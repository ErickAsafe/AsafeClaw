# Dicionário de Dados — SandeClaw

Abaixo o schema detalhado do SQLite localizado em `src/memory/db.ts`:

### Tabela `conversations`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | TEXT | ID da conversa (Primary Key) |
| `user_id` | TEXT | Identificador do usuário no Telegram |
| `provider` | TEXT | Nome do provedor LLM usado na sessão |
| `created_at` | DATETIME | Data e hora da criação |

### Tabela `messages`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INTEGER | ID autoincremento (Primary Key) |
| `conversation_id` | TEXT | Chave estrangeira para `conversations` |
| `role` | TEXT | Papel da mensagem (`user`, `assistant`, `system`) |
| `content` | TEXT | Conteúdo da mensagem |
| `created_at` | DATETIME | Data e hora do registro |

### Tabela `user_facts`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INTEGER | ID autoincremento (Primary Key) |
| `user_id` | TEXT | Identificador do usuário |
| `fact` | TEXT | Fato lembrado ou preferência do usuário |
| `created_at` | DATETIME | Data e hora do registro |

### Tabela `token_usage`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | INTEGER | ID autoincremento (Primary Key) |
| `user_id` | TEXT | Identificador do usuário |
| `provider` | TEXT | Nome do modelo/provedor usado |
| `prompt_tokens` | INTEGER | Qtd de tokens enviados |
| `completion_tokens`| INTEGER | Qtd de tokens gerados |
| `created_at` | DATETIME | Data e hora do registro |
