import db from './db';

export interface TokenUsage {
  id?: number;
  user_id: string;
  provider: string;
  prompt_tokens: number;
  completion_tokens: number;
  created_at?: string;
}

export class TokenUsageRepository {
  public create(usage: TokenUsage): number | bigint {
    const stmt = db.prepare(`
      INSERT INTO token_usage (user_id, provider, prompt_tokens, completion_tokens)
      VALUES (@user_id, @provider, @prompt_tokens, @completion_tokens)
    `);
    const result = stmt.run(usage);
    return result.lastInsertRowid;
  }

  public getTodayUsageByProvider(userId: string): { provider: string, total_prompt: number, total_completion: number }[] {
    const stmt = db.prepare(`
      SELECT provider, SUM(prompt_tokens) as total_prompt, SUM(completion_tokens) as total_completion
      FROM token_usage
      WHERE user_id = ? AND date(created_at, 'localtime') = date('now', 'localtime')
      GROUP BY provider
    `);
    return stmt.all(userId) as any;
  }
}
