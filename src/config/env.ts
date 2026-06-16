import { config } from 'dotenv';
import path from 'path';

// Load .env file
config({ path: path.resolve(__dirname, '../../.env') });

export const env = {
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',
  TELEGRAM_ALLOWED_USER_IDS: (process.env.TELEGRAM_ALLOWED_USER_IDS || '').split(',').map(id => id.trim()),
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || '',
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || '',
  MEMORY_WINDOW_SIZE: parseInt(process.env.MEMORY_WINDOW_SIZE || '10', 10),
  MAX_ITERATIONS: parseInt(process.env.MAX_ITERATIONS || '5', 10),
  DB_PATH: path.resolve(__dirname, '../../data/db.sqlite'),
  TMP_PATH: path.resolve(__dirname, '../../tmp'),
  SKILLS_PATH: path.resolve(__dirname, '../../.agents/skills')
};

// Validations
if (!env.TELEGRAM_BOT_TOKEN) {
  console.warn('⚠️ TELEGRAM_BOT_TOKEN is not set');
}

if (!env.GEMINI_API_KEY && !env.GROQ_API_KEY && !env.OPENROUTER_API_KEY) {
  console.warn('⚠️ No LLM API KEY is set (GEMINI_API_KEY, GROQ_API_KEY, or OPENROUTER_API_KEY)');
}
