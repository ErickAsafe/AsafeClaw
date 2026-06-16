import { BaseProvider } from './providers/BaseProvider';
import { GeminiProvider } from './providers/GeminiProvider';
import { GroqProvider } from './providers/GroqProvider';
import { OpenRouterProvider } from './providers/OpenRouterProvider';
import { FallbackProvider } from './providers/FallbackProvider';

export class ProviderFactory {
  public static create(providerName: string): BaseProvider {
    switch (providerName.toLowerCase()) {
      case 'gemini':
        return new GeminiProvider('gemini-2.5-flash');
      case 'groq':
        return new GroqProvider();
      case 'openrouter':
        return new OpenRouterProvider('meta-llama/llama-3.3-70b-instruct:free');
      case 'fallback':
        return new FallbackProvider([
          new OpenRouterProvider('meta-llama/llama-3.3-70b-instruct:free'),// 1st try (OpenRouter - Great context & free limit)
          new GeminiProvider('gemini-2.0-flash'),      // 2nd try (Stable and working!)
          new GeminiProvider('gemini-1.5-flash-8b'),   // 3rd try (Higher rate limit free tier)
          new GroqProvider('llama-3.3-70b-versatile'), // 4th try (Smartest, but often hits 429)
          new GroqProvider('llama-3.1-8b-instant')     // 5th try (Backup Groq)
        ]);
      default:
        throw new Error(`Unsupported provider: ${providerName}`);
    }
  }
}
