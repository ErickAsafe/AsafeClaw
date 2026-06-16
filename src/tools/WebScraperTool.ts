import { BaseTool, ToolSchema } from './BaseTool';
import axios from 'axios';

export class WebScraperTool implements BaseTool {
  name = 'web_scraper';
  description = 'Acessa uma URL específica e retorna o conteúdo textual principal da página (em formato Markdown). Útil para ler artigos, documentações ou sites específicos.';
  
  getSchema(): ToolSchema {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          url: {
            type: 'string',
            description: 'A URL completa da página a ser lida (ex: https://pt.wikipedia.org/wiki/IA)'
          }
        },
        required: ['url']
      }
    };
  }

  async execute(args: Record<string, any>): Promise<string> {
    const { url } = args;

    if (!url) {
      return JSON.stringify({ error: 'URL é obrigatória' });
    }

    try {
      // Usa o Jina Reader API para extrair o markdown limpo da página
      const response = await axios.get(`https://r.jina.ai/${url}`, {
        headers: {
          'Accept': 'text/plain',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 15000 // 15s timeout
      });

      const markdownContent = response.data;
      
      if (!markdownContent || markdownContent.trim().length === 0) {
        return JSON.stringify({
          url,
          error: 'Página retornou vazia ou não pôde ser processada.'
        });
      }

      // Limit characters to avoid exploding the context window
      const MAX_LENGTH = 12000;
      const truncatedContent = markdownContent.length > MAX_LENGTH 
        ? markdownContent.substring(0, MAX_LENGTH) + '...\n\n(Conteúdo truncado devido ao tamanho)' 
        : markdownContent;

      return JSON.stringify({
        url,
        content: truncatedContent
      });
    } catch (error: any) {
      return JSON.stringify({ error: `Falha ao acessar a URL: ${error.message}` });
    }
  }
}
