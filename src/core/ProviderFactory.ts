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
          new GroqProvider(),
          new GeminiProvider()
        ]);
      default:
        throw new Error(`Unsupported provider: ${providerName}`);
    }
  }
}
