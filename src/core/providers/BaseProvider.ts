import { Message } from '../../memory/MessageRepository';
import { ToolSchema } from '../../tools/BaseTool';

export interface ToolCall {
  name: string;
  arguments: Record<string, any>;
}

export interface ProviderResponse {
  text?: string;
  toolCall?: ToolCall;
  usage?: {
    prompt: number;
    completion: number;
  };
  providerName?: string;
}

export abstract class BaseProvider {
  /**
   * Generates a response from the LLM based on conversation history and available tools.
   */
  public abstract generate(
    messages: Message[],
    systemInstruction: string,
    tools: ToolSchema[]
  ): Promise<ProviderResponse>;
}
