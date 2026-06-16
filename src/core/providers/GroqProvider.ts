import Groq from 'groq-sdk';
import { BaseProvider, ProviderResponse } from './BaseProvider';
import { Message } from '../../memory/MessageRepository';
import { ToolSchema } from '../../tools/BaseTool';
import { env } from '../../config/env';

export class GroqProvider extends BaseProvider {
  private groq: Groq;

  constructor() {
    super();
    this.groq = new Groq({ apiKey: env.GROQ_API_KEY });
  }

  public async generate(
    messages: Message[],
    systemInstruction: string,
    tools: ToolSchema[]
  ): Promise<ProviderResponse> {
    const formattedMessages: any[] = [];
    
    // Add system instruction
    if (systemInstruction) {
      formattedMessages.push({ role: 'system', content: systemInstruction });
    }

    // Add conversation history
    for (const msg of messages) {
      formattedMessages.push({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      });
    }

    // Format tools for Groq if any
    const groqTools = tools.length > 0 ? tools.map(t => ({
      type: 'function',
      function: {
        name: t.name,
        description: t.description,
        parameters: t.parameters
      }
    })) : undefined;

    const response = await this.groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: formattedMessages,
      tools: groqTools as any,
      tool_choice: groqTools ? 'auto' : 'none'
    });

    const choice = response.choices?.[0];

    if (!choice) {
      return { text: '' };
    }

    // Check if the response contains a tool call
    if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
      const call = choice.message.tool_calls[0]?.function;
      if (call && call.name) {
        return {
          toolCall: {
            name: call.name,
            arguments: JSON.parse(call.arguments || '{}')
          }
        };
      }
    }

    // Otherwise return text
    return {
      text: choice.message.content || ''
    };
  }
}
