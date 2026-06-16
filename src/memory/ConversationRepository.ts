import db from './db';

export interface Conversation {
  id: string;
  user_id: string;
  provider: string;
  created_at?: string;
}

export class ConversationRepository {
  public create(conversation: Conversation): void {
    const stmt = db.prepare(`
      INSERT INTO conversations (id, user_id, provider)
      VALUES (@id, @user_id, @provider)
    `);
    stmt.run(conversation);
  }

  public getById(id: string): Conversation | undefined {
    const stmt = db.prepare('SELECT * FROM conversations WHERE id = ?');
    return stmt.get(id) as Conversation | undefined;
  }

  public getByUserId(userId: string): Conversation[] {
    const stmt = db.prepare('SELECT * FROM conversations WHERE user_id = ? ORDER BY created_at DESC');
    return stmt.all(userId) as Conversation[];
  }
}
