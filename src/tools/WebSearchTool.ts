import { BaseTool, ToolSchema } from './BaseTool';
import google from 'googlethis';

export class WebSearchTool implements BaseTool {
  name = 'web_search';
  description = 'Realiza uma pesquisa na internet (usando Google) e retorna os resultados principais. Use para encontrar fatos recentes, notícias ou dados que você não possui na memória.';
  
  getSchema(): ToolSchema {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'O termo de busca a ser pesquisado (ex: "últimas notícias inteligência artificial")'
          }
        },
        required: ['query']
      }
    };
  }

  async execute(args: Record<string, any>): Promise<string> {
    const { query } = args;

    if (!query) {
      return JSON.stringify({ error: 'Query é obrigatória' });
    }

    try {
      const options = {
        page: 0, 
        safe: false, // Safe Search
        parse_ads: false, // If set to true sponsored results will be parsed
        additional_params: { 
          hl: 'pt-BR' 
        }
      };
      
      const searchResults = await google.search(query, options);

      if (!searchResults.results || searchResults.results.length === 0) {
        return JSON.stringify({ message: 'Nenhum resultado encontrado para esta busca.' });
      }

      // Limit to top 5 results to avoid too much context
      const topResults = searchResults.results.slice(0, 5).map((result: any) => ({
        title: result.title,
        url: result.url,
        snippet: result.description
      }));

      return JSON.stringify({
        query,
        results: topResults
      });
    } catch (error: any) {
      return JSON.stringify({ error: `Falha na pesquisa: ${error.message}` });
    }
  }
}
