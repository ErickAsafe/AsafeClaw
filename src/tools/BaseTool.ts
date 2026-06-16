export interface ToolParameter {
  type: string;
  description: string;
  enum?: string[];
}

export interface ToolSchema {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, ToolParameter>;
    required: string[];
  };
}

export interface ToolContext {
  conversationId: string;
}

export abstract class BaseTool {
  public abstract readonly name: string;
  public abstract readonly description: string;
  
  public abstract getSchema(): ToolSchema;
  
  // Arguments will be a record parsed from LLM JSON response
  public abstract execute(args: Record<string, any>, context?: ToolContext): Promise<string>;
}
