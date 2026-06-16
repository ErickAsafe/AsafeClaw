import { BaseProvider } from './providers/BaseProvider';
import { MemoryManager } from '../memory/MemoryManager';
import { ToolRegistry } from '../tools/ToolRegistry';
import { env } from '../config/env';

export class AgentLoop {
  private memory: MemoryManager;

  constructor(memory: MemoryManager) {
    this.memory = memory;
  }

  public async run(
    provider: BaseProvider,
    conversationId: string,
    systemInstruction: string,
    tools: ToolRegistry
  ): Promise<string> {
    let iterations = 0;
    const maxIterations = env.MAX_ITERATIONS;
    const toolSchemas = tools.getAllSchemas();

    while (iterations < maxIterations) {
      iterations++;
      console.log(`[AgentLoop] Iteration ${iterations}/${maxIterations}`);

      const context = this.memory.getContext(conversationId);

      try {
        const response = await provider.generate(context, systemInstruction, toolSchemas);

        // Save token usage
        if (response.usage) {
          try {
            const TokenUsageRepo = require('../memory/TokenUsageRepository').TokenUsageRepository;
            const ConvRepo = require('../memory/ConversationRepository').ConversationRepository;
            const conv = new ConvRepo().getById(conversationId);
            if (conv) {
              new TokenUsageRepo().create({
                user_id: conv.user_id,
                provider: response.providerName || provider.constructor.name,
                prompt_tokens: response.usage.prompt,
                completion_tokens: response.usage.completion
              });
            }
          } catch (err) {
            console.error('[AgentLoop] Error saving token usage:', err);
          }
        }

        if (response.toolCall) {
          const { name, arguments: args } = response.toolCall;
          console.log(`[AgentLoop] Tool Call: ${name}`, args);

          const tool = tools.getTool(name);
          if (!tool) {
            this.memory.addMessage(conversationId, 'user', `Error: Tool ${name} not found.`);
            continue;
          }

          try {
            const toolResult = await tool.execute(args, { conversationId });
            console.log(`[AgentLoop] Tool Result: ${toolResult}`);
            this.memory.addMessage(conversationId, 'assistant', `Executei a ferramenta ${name} com os argumentos: ${JSON.stringify(args)}`);
            this.memory.addMessage(conversationId, 'user', `Resultado da ferramenta ${name}:\n${toolResult}\n\nPor favor, responda à minha pergunta original baseado nestes dados. Se não precisar de mais ferramentas, gere sua resposta final.`);
          } catch (error: any) {
            console.error(`[AgentLoop] Tool Error:`, error);
            this.memory.addMessage(conversationId, 'assistant', `Tentei executar a ferramenta ${name}.`);
            this.memory.addMessage(conversationId, 'user', `Erro ao executar a ferramenta ${name}: ${error.message}`);
          }
        } else if (response.text) {
          console.log(`[AgentLoop] Final Response: ${response.text}`);
          this.memory.addMessage(conversationId, 'assistant', response.text);
          return response.text;
        } else {
          return "I don't know how to respond.";
        }
      } catch (error: any) {
        console.error(`[AgentLoop] LLM Generation Error:`, error);
        
        // Auto-healing: If the LLM hallucinates or creates invalid JSON for a tool call (like Groq's tool_use_failed)
        if (error.message && (error.message.includes('tool_use_failed') || error.message.includes('failed_generation'))) {
          console.log('[AgentLoop] Auto-healing from tool_use_failed...');
          this.memory.addMessage(conversationId, 'user', `Erro interno: Você tentou chamar uma ferramenta mas a sintaxe JSON estava inválida ou você usou tags XML incorretas. Por favor, tente chamar a ferramenta novamente usando estritamente o formato de chamada de função nativo do sistema.`);
          continue; // Retry the loop
        }

        return `Ocorreu um erro no processamento: ${error.message}`;
      }
    }

    throw new Error('Max iterations reached without final answer.');
  }
}
