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
    // Return recent messages truncated by MEMORY_WINDOW_SIZE
    return this.msgRepo.getByConversationId(conversationId, env.MEMORY_WINDOW_SIZE);
  }

  public getMessageCount(conversationId: string): number {
    return this.msgRepo.countByConversationId(conversationId);
  }
}
