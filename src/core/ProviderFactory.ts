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
        return new OpenRouterProvider('meta-llama/llama-3.3-70b-instruct');
      case 'fallback':
        return new FallbackProvider([
          new OpenRouterProvider('meta-llama/llama-3.3-70b-instruct'),// 1st try (OpenRouter - Great context & free limit)
          new OpenRouterProvider('google/gemini-2.0-flash-exp:free'), // 2nd try (OpenRouter free tier that definitely supports tools)
          new GeminiProvider('gemini-2.5-flash'),      // 3rd try (Newest and working!)
          new GeminiProvider('gemini-1.5-flash-latest'),// 4th try (Higher rate limit free tier)
          new GroqProvider('llama-3.3-70b-versatile'), // 5th try (Smartest, but often hits 429)
          new GroqProvider('llama-3.1-8b-instant')     // 6th try (Backup Groq)
        ]);
      default:
        throw new Error(`Unsupported provider: ${providerName}`);
    }
  }
}
