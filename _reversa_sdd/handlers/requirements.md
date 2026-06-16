# Unit: handlers

## Visão Geral
Gerencia a entrada e saída das mensagens interagindo diretamente com o SDK do Telegram (grammy). 

## Responsabilidades
- Processar mensagens de texto, documentos PDF e de áudio.
- Verificar a permissão de usuários (autenticação).
- Quebrar mensagens muito longas antes de enviar ao Telegram.

## Regras de Negócio
- Apenas usuários no array `TELEGRAM_ALLOWED_USER_IDS` podem passar pela etapa de autorização. 🟢
- Áudios são transcritos usando a API de transcrição Whisper do Groq. 🟢
- Mensagens que excedam o limite de caracteres do Telegram devem ser particionadas ou enviadas em blocos adequados. 🟡

## Requisitos Funcionais
| ID | Requisito | Prioridade | Critério de Aceite |
|----|-----------|-----------|-------------------|
| RF-01 | Receber Áudio | Must | O áudio é baixado, transcrito e injetado no contexto como texto. |
| RF-02 | Receber Documentos | Should | Arquivos `.pdf` e `.md` são extraídos usando ferramentas adequadas. |

## Rastreabilidade de Código
| Arquivo | Função / Classe | Cobertura |
|---------|-----------------|-----------|
| `src/handlers/TelegramInputHandler.ts` | `TelegramInputHandler` | 🟢 |
