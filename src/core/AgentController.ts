import { MemoryManager } from '../memory/MemoryManager';
import { ProviderFactory } from './ProviderFactory';
import { AgentLoop } from './AgentLoop';
import { SkillLoader } from '../skills/SkillLoader';
import { SkillRouter } from '../skills/SkillRouter';
import { SkillExecutor } from '../skills/SkillExecutor';
import { ToolRegistry } from '../tools/ToolRegistry';
import { McpClientManager } from '../tools/McpClientManager';
import { mcpServers } from '../config/mcp';

import { SystemMonitorTool } from '../tools/SystemMonitorTool';
import { WebScraperTool } from '../tools/WebScraperTool';
import { WebSearchTool } from '../tools/WebSearchTool';
import { SaveMemoryTool, SearchMemoryTool } from '../tools/MemoryTool';

export class AgentController {
  private memoryManager: MemoryManager;
  private toolRegistry: ToolRegistry;
  private mcpManager: McpClientManager;
  private isMcpInitialized: boolean = false;

  constructor() {
    this.memoryManager = new MemoryManager();
    this.toolRegistry = new ToolRegistry();
    this.mcpManager = new McpClientManager();
    
    // Register native tools
    this.toolRegistry.register(new SystemMonitorTool());
    this.toolRegistry.register(new WebScraperTool());
    this.toolRegistry.register(new WebSearchTool());
    this.toolRegistry.register(new SaveMemoryTool());
    this.toolRegistry.register(new SearchMemoryTool());
  }

  public async handleMessage(
    conversationId: string, 
    userId: string, 
    text: string,
    options?: { requiresAudioReply?: boolean, image?: import('./providers/BaseProvider').ImagePayload }
  ): Promise<{ text: string, requiresAudioReply: boolean }> {
    let providerName = 'fallback'; // Changed to Fallback to use both Groq and Gemini and avoid limits
    if (options?.image) {
      providerName = 'gemini'; // Force Gemini for multimodality since Llama3 doesn't support images
    }
    this.memoryManager.ensureConversation(conversationId, userId, providerName);

    // Initialize MCP tools if not already done
    if (!this.isMcpInitialized) {
      try {
        console.log('[AgentController] Initializing MCP servers...');
        await this.mcpManager.connectAll(mcpServers);
        await this.mcpManager.registerTools(this.toolRegistry);
        this.isMcpInitialized = true;
      } catch (err) {
        console.error('[AgentController] Failed to initialize MCP:', err);
      }
    }

    // Save user message
    this.memoryManager.addMessage(conversationId, 'user', text);

    // Load skills
    const skills = SkillLoader.loadAvailableSkills();
    
    // Route skill
    const skillId = await SkillRouter.route(text, skills);
    console.log(`[AgentController] Routed skill: ${skillId}`);

    const now = new Date();
    const currentDate = now.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
    const timeContext = `\nAtenção: A data e hora atual do usuário é ${currentDate} (Fuso Horário: America/Sao_Paulo / BRT). Assuma este fuso horário e data atual para todos os agendamentos e buscas caso o usuário não especifique.`;
    
    const mcpContext = `\n\nMemória e Cérebro (MCP):
- Subconsciente (Grafo de Conhecimento): Use as ferramentas de entidades e observações para salvar fatos, preferências ou contexto longo permanentemente (ex: o usuário gosta de X, o app dele faz Y).
- Cérebro Visual (Obsidian): Use ferramentas de arquivo (read_file, write_file em /home/ubuntu/asafeclaw-brain) para escrever notas livres em Markdown (.md).
- Cérebro Visual (Notion): Use as ferramentas do Notion para pesquisar e criar páginas/tabelas no Notion do usuário.
Escolha com sabedoria onde salvar cada informação.`;
    
    let systemInstruction = 'Você é um assistente pessoal IA útil. Responda de forma clara e amigável.' + timeContext + mcpContext;
    if (skillId) {
      const skill = skills.find(s => s.id === skillId);
      if (skill) {
        const skillContent = SkillExecutor.getSkillContent(skill);
        if (skillContent) {
          systemInstruction = `Você está operando sob a diretiva de uma Skill especializada:\n\n${skillContent}` + timeContext;
        }
      }
    }

    // RF-03: Inject available skills into the subsequent loop
    if (skills.length > 0) {
      const skillsDesc = skills.map(s => `- ${s.name}: ${s.description}`).join('\n');
      systemInstruction += `\n\nSkills disponíveis que você pode usar ou discutir com o usuário:\n${skillsDesc}`;
    }

    const provider = ProviderFactory.create(providerName);
    const agentLoop = new AgentLoop(this.memoryManager);

    const response = await agentLoop.run(provider, conversationId, systemInstruction, this.toolRegistry, options?.image);
    return { text: response, requiresAudioReply: options?.requiresAudioReply || false };
  }

  public getMessageCount(conversationId: string): number {
    return this.memoryManager.getMessageCount(conversationId);
  }
}
