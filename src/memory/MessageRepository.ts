import db from './db';

export interface Message {
  id?: number;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at?: string;
}

export class MessageRepository {
  public create(message: Message): void {
    const stmt = db.prepare(`
      INSERT INTO messages (conversation_id, role, content)
      VALUES (@conversation_id, @role, @content)
    `);
    stmt.run(message);
  }

  public getByConversationId(conversationId: string, limit: number = 50): Message[] {
    const stmt = db.prepare(`
      SELECT * FROM (
        SELECT * FROM messages 
        WHERE conversation_id = ? 
        ORDER BY created_at DESC 
        LIMIT ?
      ) ORDER BY created_at ASC
    `);
    return stmt.all(conversationId, limit) as Message[];
  }
}
