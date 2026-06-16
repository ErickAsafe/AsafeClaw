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
          new OpenRouterProvider('meta-llama/llama-3.3-70b-instruct:free'), // 1st try (Can hit 429 if upstream is busy)
          new OpenRouterProvider('google/gemma-4-31b-it:free'), // 2nd try (OpenRouter backup free model)
          new OpenRouterProvider('openrouter/free'), // 3rd try (Auto-routes to any free model)
          new GeminiProvider('gemini-flash-latest'), // 4th try (Native Google)
          new GeminiProvider('gemini-pro-latest'),   // 5th try (Native Google Pro)
          new GroqProvider('llama-3.3-70b-versatile'), // 6th try (Hits 429 easily but good to have)
          new GroqProvider('llama-3.1-8b-instant')     // 7th try
        ]);
      default:
        throw new Error(`Unsupported provider: ${providerName}`);
    }
  }
}
