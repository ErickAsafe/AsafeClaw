import { BaseProvider, ProviderResponse } from './BaseProvider';
import { Message } from '../../memory/MessageRepository';
import { ToolSchema } from '../../tools/BaseTool';
import { env } from '../../config/env';

export class OpenRouterProvider extends BaseProvider {
  private model: string;

  constructor(model: string = 'meta-llama/llama-3.3-70b-instruct') {
    super();
    this.model = model;
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

    // Format tools for OpenRouter (OpenAI compatible)
    const orTools = tools.length > 0 ? tools.map(t => ({
      type: 'function',
      function: {
        name: t.name,
        description: t.description,
        parameters: t.parameters
      }
    })) : undefined;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/ErickAsafe/AsafeClaw', // Optional but recommended by OpenRouter
        'X-Title': 'AsafeClaw'
      },
      body: JSON.stringify({
        model: this.model,
        messages: formattedMessages,
        tools: orTools,
        tool_choice: orTools ? 'auto' : undefined
      })
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} ${errorBody}`);
    }

    const data = await response.json();
    const choice = data.choices?.[0];

    if (!choice) {
      return { text: '' };
    }

    const usage = data.usage ? {
      prompt: data.usage.prompt_tokens || 0,
      completion: data.usage.completion_tokens || 0
    } : undefined;

    // Check if the response contains a tool call
    if (choice.message.tool_calls && choice.message.tool_calls.length > 0) {
      const call = choice.message.tool_calls[0]?.function;
      if (call && call.name) {
        return {
          toolCall: {
            name: call.name,
            arguments: JSON.parse(call.arguments || '{}')
          },
          usage
        };
      }
    }

    // Otherwise return text
    return {
      text: choice.message.content || '',
      usage
    };
  }
}
