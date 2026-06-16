import { BaseProvider } from './providers/BaseProvider';
import { GeminiProvider } from './providers/GeminiProvider';
import { GroqProvider } from './providers/GroqProvider';
import { FallbackProvider } from './providers/FallbackProvider';

export class ProviderFactory {
  public static create(providerName: string): BaseProvider {
    switch (providerName.toLowerCase()) {
      case 'gemini':
        return new GeminiProvider();
      case 'groq':
        return new GroqProvider();
      case 'fallback':
        return new FallbackProvider([
          new GroqProvider('llama-3.3-70b-versatile'), // 1st try (Fastest, Smartest, 100k TPD)
          new GeminiProvider('gemini-1.5-flash'),      // 2nd try (Smart, 1500 RPD)
          new GroqProvider('llama-3.1-8b-instant'),    // 3rd try (Fast, Backup Groq)
          new GeminiProvider('gemini-2.5-flash'),      // 4th try (Newest, 20 RPD)
          new GeminiProvider('gemini-1.5-flash-8b')    // 5th try (Small, 1500 RPD)
        ]);
      default:
        throw new Error(`Unsupported provider: ${providerName}`);
    }
  }
}
