import { BaseProvider } from './providers/BaseProvider';
import { GeminiProvider } from './providers/GeminiProvider';
import { GroqProvider } from './providers/GroqProvider';
import { FallbackProvider } from './providers/FallbackProvider';

export class ProviderFactory {
  public static create(providerName: string): BaseProvider {
    switch (providerName.toLowerCase()) {
      case 'gemini':
        return new GeminiProvider('gemini-2.5-flash');
      case 'groq':
        return new GroqProvider();
      case 'fallback':
        return new FallbackProvider([
          new GeminiProvider('gemini-2.5-flash'),      // 1st try (Newest and working!)
          new GeminiProvider('gemini-1.5-flash'),      // 2nd try (Higher rate limit free tier)
          new GroqProvider('llama-3.3-70b-versatile'), // 3rd try (Smartest, but often hits 429)
          new GroqProvider('llama-3.1-8b-instant')     // 4th try (Backup Groq)
        ]);
      default:
        throw new Error(`Unsupported provider: ${providerName}`);
    }
  }
}
