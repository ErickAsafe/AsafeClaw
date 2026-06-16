import db from './db';

export interface Fact {
  id?: number;
  user_id: string;
  fact: string;
  created_at?: string;
}

export class FactRepository {
  public create(fact: Fact): void {
    const stmt = db.prepare(`
      INSERT INTO user_facts (user_id, fact)
      VALUES (@user_id, @fact)
    `);
    stmt.run(fact);
  }

  public getByUserId(userId: string): Fact[] {
    const stmt = db.prepare(`
      SELECT * FROM user_facts 
      WHERE user_id = ? 
      ORDER BY created_at ASC
    `);
    return stmt.all(userId) as Fact[];
  }

  public searchByUserId(userId: string, query: string): Fact[] {
    // Simple SQLite LIKE search for semantic memory
    // (In a real RAG app, this would use a vector database, but this works well for facts)
    const stmt = db.prepare(`
      SELECT * FROM user_facts 
      WHERE user_id = ? AND fact LIKE ?
      ORDER BY created_at DESC
      LIMIT 10
    `);
    const likeQuery = `%${query}%`;
    return stmt.all(userId, likeQuery) as Fact[];
  }
}
