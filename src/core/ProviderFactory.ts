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
          new GroqProvider('llama-3.3-70b-versatile'), // 2nd try (Smartest, but often hits 429)
          new GroqProvider('llama-3.1-8b-instant')     // 3rd try (Backup Groq)
        ]);
      default:
        throw new Error(`Unsupported provider: ${providerName}`);
    }
  }
}
