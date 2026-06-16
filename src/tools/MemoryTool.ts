import { BaseTool, ToolSchema, ToolContext } from './BaseTool';
import { FactRepository } from '../memory/FactRepository';

export class SaveMemoryTool extends BaseTool {
  public readonly name = 'save_memory';
  public readonly description = 'Salva um fato importante sobre o usuário (ou preferências) na memória de longo prazo (Cérebro Invisível). Use isso para guardar fatos que podem ser úteis no futuro.';
  private factRepo: FactRepository;

  constructor() {
    super();
    this.factRepo = new FactRepository();
  }

  public getSchema(): ToolSchema {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          fact: {
            type: 'string',
            description: 'O fato a ser guardado. Exemplo: "O app do usuário será focado em advogados."'
          }
        },
        required: ['fact']
      }
    };
  }

  public async execute(args: Record<string, any>, context?: ToolContext): Promise<string> {
    try {
      if (!args.fact) {
        return JSON.stringify({ error: 'Fato não fornecido.' });
      }

      const userId = context?.conversationId || 'default';

      this.factRepo.create({
        user_id: userId,
        fact: args.fact
      });

      return JSON.stringify({ success: true, message: `Fato guardado na memória longa do usuário: ${args.fact}` });
    } catch (error: any) {
      return JSON.stringify({ error: error.message });
    }
  }
}

export class SearchMemoryTool extends BaseTool {
  public readonly name = 'search_memory';
  public readonly description = 'Pesquisa fatos salvos na memória de longo prazo (Cérebro Invisível) do usuário. Use isso sempre que o usuário perguntar se você lembra de algo que ele te contou no passado.';
  private factRepo: FactRepository;

  constructor() {
    super();
    this.factRepo = new FactRepository();
  }

  public getSchema(): ToolSchema {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'A palavra-chave para buscar na memória. Exemplo: "advogados", "foco do app", "time"'
          }
        },
        required: ['query']
      }
    };
  }

  public async execute(args: Record<string, any>, context?: ToolContext): Promise<string> {
    try {
      if (!args.query) {
        return JSON.stringify({ error: 'Query não fornecida.' });
      }

      const userId = context?.conversationId || 'default';

      const results = this.factRepo.searchByUserId(userId, args.query);
      
      if (results.length === 0) {
        return JSON.stringify({ message: 'Nenhum fato encontrado na memória longa para esta busca.' });
      }

      const facts = results.map(r => r.fact);
      return JSON.stringify({ facts });
    } catch (error: any) {
      return JSON.stringify({ error: error.message });
    }
  }
}
