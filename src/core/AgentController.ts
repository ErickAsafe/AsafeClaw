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
  }

  public async handleMessage(
    conversationId: string, 
    userId: string, 
    text: string,
    options?: { requiresAudioReply?: boolean }
  ): Promise<{ text: string, requiresAudioReply: boolean }> {
    const providerName = 'groq'; // Changed to Groq to avoid Gemini free tier quota limits
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
    
    let systemInstruction = 'Você é um assistente pessoal IA útil. Responda de forma clara e amigável.' + timeContext;
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

    const response = await agentLoop.run(provider, conversationId, systemInstruction, this.toolRegistry);
    return { text: response, requiresAudioReply: options?.requiresAudioReply || false };
  }
}
