import { GoogleGenAI } from '@google/genai';
import { BaseProvider, ProviderResponse } from './BaseProvider';
import { Message } from '../../memory/MessageRepository';
import { ToolSchema } from '../../tools/BaseTool';
import { env } from '../../config/env';

export class GeminiProvider extends BaseProvider {
  private ai: GoogleGenAI;
  private model: string;

  constructor(model: string = 'gemini-1.5-flash') {
    super();
    this.model = model;
    this.ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
  }

  public async generate(
    messages: Message[],
    systemInstruction: string,
    tools: ToolSchema[]
  ): Promise<ProviderResponse> {
    // Format messages for Gemini
    const contents = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    // Format tools for Gemini if any
    const geminiTools = tools.length > 0 ? [{
      functionDeclarations: tools.map(t => ({
        name: t.name,
        description: t.description,
        parameters: t.parameters as any
      }))
    }] : undefined;

    const config: any = { systemInstruction };
    if (geminiTools) {
      config.tools = geminiTools;
    }

    const response = await this.ai.models.generateContent({
      model: this.model,
      contents,
      config
    });

    const usage = response.usageMetadata ? {
      prompt: response.usageMetadata.promptTokenCount || 0,
      completion: response.usageMetadata.candidatesTokenCount || 0
    } : undefined;

    // Check if the response contains a function call
    if (response.functionCalls && response.functionCalls.length > 0) {
      const call = response.functionCalls[0];
      if (call && call.name) {
        return {
          toolCall: {
            name: call.name,
            arguments: call.args as Record<string, any>
          },
          usage
        };
      }
    }

    // Otherwise return text
    if (!response.text) {
      console.log('[GeminiProvider] Warning: Response text is empty! Raw response:', JSON.stringify(response, null, 2));
    }
    return {
      text: response.text || '',
      usage
    };
  }
}
