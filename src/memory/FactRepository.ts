import db from './db';
import { ObsidianSync } from './ObsidianSync';

export interface Fact {
  id?: number;
  user_id: string;
  fact: string;
  created_at?: string;
}

export class FactRepository {
  private obsidian: ObsidianSync;

  constructor() {
    this.obsidian = new ObsidianSync();
  }

  public create(fact: Fact): number | bigint {
    const stmt = db.prepare(`
      INSERT INTO user_facts (user_id, fact)
      VALUES (@user_id, @fact)
    `);
    const result = stmt.run(fact);

    // Dual-write to Obsidian Markdown file
    this.obsidian.writeFact(fact.user_id, fact.fact);

    return result.lastInsertRowid;
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
