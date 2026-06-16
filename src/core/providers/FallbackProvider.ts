import { BaseProvider, ProviderResponse } from './BaseProvider';
import { Message } from '../../memory/MessageRepository';
import { ToolSchema } from '../../tools/BaseTool';

export class FallbackProvider extends BaseProvider {
  private providers: BaseProvider[];

  constructor(providers: BaseProvider[]) {
    super();
    this.providers = providers;
  }

  public async generate(
    messages: Message[],
    systemInstruction: string,
    tools: ToolSchema[]
  ): Promise<ProviderResponse> {
    let lastError: any;
    
    for (const provider of this.providers) {
      try {
        console.log(`[FallbackProvider] Tentando gerar com provedor: ${provider.constructor.name}`);
        return await provider.generate(messages, systemInstruction, tools);
      } catch (error: any) {
        console.error(`[FallbackProvider] Provedor ${provider.constructor.name} falhou:`, error.message);
        if (error.status) console.error(`[FallbackProvider] Status do erro:`, error.status);
        if (error.response?.data) console.error(`[FallbackProvider] Resposta:`, JSON.stringify(error.response.data));
        
        // Se o erro for de sintaxe (como JSON quebrado de tool_calls), nós não queremos pular de provedor
        // Nós queremos jogar de volta para o AgentLoop para ele auto-corrigir.
        if (error.message && (error.message.includes('tool_use_failed') || error.message.includes('failed_generation'))) {
            console.log(`[FallbackProvider] Erro de sintaxe detectado. Repassando erro para AgentLoop fazer auto-healing.`);
            throw error;
        }
        
        // Se for rate limit (429) ou erro 500, salva o erro e tenta o próximo
        lastError = error;
      }
    }
    
    throw lastError;
  }
}
