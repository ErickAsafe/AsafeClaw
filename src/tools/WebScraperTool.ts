import { BaseTool, ToolSchema } from './BaseTool';
import axios from 'axios';
import * as cheerio from 'cheerio';

export class WebScraperTool implements BaseTool {
  name = 'web_scraper';
  description = 'Baixa e extrai o texto de uma página web a partir de uma URL. Use para ler artigos, documentações e notícias completas.';
  
  getSchema(): ToolSchema {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          url: {
            type: 'string',
            description: 'A URL completa da página a ser lida (ex: https://pt.wikipedia.org/wiki/Inteligência_artificial)'
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
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        },
        timeout: 10000 // 10s timeout
      });

      const html = response.data;
      const $ = cheerio.load(html);

      // Remove unwanted elements
      $('script, style, noscript, iframe, img, svg, video, audio, nav, footer, header').remove();

      // Extract text from the body
      let text = $('body').text();

      // Clean up whitespace
      text = text.replace(/\s+/g, ' ').trim();

      // Limit size if it's too large to avoid blowing up the context window
      if (text.length > 15000) {
        text = text.substring(0, 15000) + '... [Conteúdo Truncado por ser longo demais]';
      }

      return JSON.stringify({
        url,
        title: $('title').text() || 'Sem título',
        content: text
      });
    } catch (error: any) {
      return JSON.stringify({ error: `Falha ao acessar a URL: ${error.message}` });
    }
  }
}
