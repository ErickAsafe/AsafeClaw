import { ConversationRepository } from './ConversationRepository';
import { MessageRepository, Message } from './MessageRepository';
import { env } from '../config/env';

export class MemoryManager {
  private convRepo: ConversationRepository;
  private msgRepo: MessageRepository;

  constructor() {
    this.convRepo = new ConversationRepository();
    this.msgRepo = new MessageRepository();
  }

  public ensureConversation(id: string, userId: string, provider: string) {
    const existing = this.convRepo.getById(id);
    if (!existing) {
      this.convRepo.create({ id, user_id: userId, provider });
    }
  }

  public addMessage(conversationId: string, role: 'user' | 'assistant' | 'system', content: string) {
    this.msgRepo.create({
      conversation_id: conversationId,
      role,
      content
    });
  }

  public getContext(conversationId: string): Message[] {
    // 1. Fetch a larger set of recent messages
    const limit = env.MEMORY_WINDOW_SIZE * 3; // We fetch more, but filter by length
    const rawMessages = this.msgRepo.getByConversationId(conversationId, limit);
    
    // 2. Sliding Window (Context Pruning by Characters)
    // About 8000 characters is ~2000 tokens. This is a very safe limit for free tier LLMs.
    const MAX_CHARS = 8000;
    let currentChars = 0;
    const finalMessages: Message[] = [];

    // We iterate from newest to oldest. 
    // MessageRepository returns ASC (oldest first), so we reverse to go newest first.
    const reversed = [...rawMessages].reverse();

    for (const msg of reversed) {
      const msgLen = msg.content.length;

      if (currentChars + msgLen <= MAX_CHARS) {
        // Fits entirely
        finalMessages.unshift(msg); // Put back in chronological order
        currentChars += msgLen;
      } else {
        // Exceeds limit
        // If this is the VERY FIRST message (the newest one), we must include it, but truncated,
        // so the model at least knows what the user is asking right now.
        if (finalMessages.length === 0) {
          finalMessages.unshift({
            ...msg,
            content: msg.content.substring(0, MAX_CHARS) + '\\n...[Conteúdo truncado por segurança de tokens]...'
          });
          break; // Stop adding more history
        } else {
          // We already have some context, so we just skip older messages to save tokens.
          break;
        }
      }
    }

    return finalMessages;
  }

  public getMessageCount(conversationId: string): number {
    return this.msgRepo.countByConversationId(conversationId);
  }
}
