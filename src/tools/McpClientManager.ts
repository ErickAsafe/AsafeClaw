import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { BaseTool, ToolSchema } from './BaseTool';
import { ToolRegistry } from './ToolRegistry';

export class DynamicMcpTool extends BaseTool {
  public readonly name: string;
  public readonly description: string;
  private schema: ToolSchema;
  private client: Client;

  constructor(client: Client, mcpToolDef: any) {
    super();
    this.client = client;
    this.name = mcpToolDef.name;
    this.description = mcpToolDef.description || `MCP Tool: ${this.name}`;
    
    // Convert JSON schema to the ToolSchema used by the bot
    const properties: Record<string, any> = {};
    if (mcpToolDef.inputSchema && mcpToolDef.inputSchema.properties) {
      for (const [key, val] of Object.entries<any>(mcpToolDef.inputSchema.properties)) {
        const prop: any = {
          type: val.type || 'string',
          description: val.description || ''
        };
        
        if (val.enum) prop.enum = val.enum;
        
        if (val.type === 'array') {
          prop.items = val.items || { type: 'string' };
        }
        
        if (val.type === 'object' && val.properties) {
          prop.properties = val.properties;
        }

        properties[key] = prop;
      }
    }
    
    this.schema = {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties,
        required: mcpToolDef.inputSchema?.required || []
      }
    };
  }

  public getSchema(): ToolSchema {
    return this.schema;
  }

  public async execute(args: Record<string, any>): Promise<string> {
    try {
      console.log(`[DynamicMcpTool] Executing ${this.name} with args:`, args);
      const response = await this.client.callTool({
        name: this.name,
        arguments: args
      });
      
      if (response.content && Array.isArray(response.content)) {
        const textBlocks = response.content
          .filter((c: any) => c.type === 'text')
          .map((c: any) => c.text);
        
        if (textBlocks.length > 0) {
          return textBlocks.join('\n');
        }
      }
      
      return JSON.stringify(response.content, null, 2);
    } catch (err: any) {
      console.error(`[DynamicMcpTool] Error executing ${this.name}:`, err);
      return `Error executing MCP tool ${this.name}: ${err.message}`;
    }
  }
}

export interface McpServerConfig {
  name: string;
  command: string;
  args: string[];
  env?: Record<string, string>;
}

export class McpClientManager {
  private clients: Client[] = [];
  private transports: StdioClientTransport[] = [];

  public async connectAll(servers: McpServerConfig[]): Promise<void> {
    for (const server of servers) {
      try {
        console.log(`[McpClientManager] Connecting to ${server.name} via ${server.command}...`);
        const transport = new StdioClientTransport({
          command: server.command,
          args: server.args,
          env: { ...process.env, ...server.env } as Record<string, string>
        });

        const client = new Client(
          { name: `AsafeClaw-MCP-${server.name}`, version: "1.0.0" },
          { capabilities: {} }
        );

        await client.connect(transport);
        this.clients.push(client);
        this.transports.push(transport);
        console.log(`[McpClientManager] Connected to ${server.name}.`);
      } catch (err: any) {
        console.error(`[McpClientManager] Failed to connect to ${server.name}:`, err.message);
      }
    }
  }

  public async registerTools(registry: ToolRegistry): Promise<void> {
    for (const client of this.clients) {
      try {
        const toolsResponse = await client.listTools();
        if (toolsResponse.tools) {
          for (const mcpToolDef of toolsResponse.tools) {
            const dynamicTool = new DynamicMcpTool(client, mcpToolDef);
            registry.register(dynamicTool);
            console.log(`[McpClientManager] Registered MCP tool: ${dynamicTool.name}`);
          }
        }
      } catch (err: any) {
        console.error(`[McpClientManager] Failed to register tools for a client:`, err.message);
      }
    }
  }
}
