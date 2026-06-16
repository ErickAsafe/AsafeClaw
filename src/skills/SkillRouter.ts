import { ProviderFactory } from '../core/ProviderFactory';
import { SkillMetadata } from './SkillLoader';
import { env } from '../config/env';

export class SkillRouter {
  public static async route(userMessage: string, availableSkills: SkillMetadata[]): Promise<string | null> {
    if (availableSkills.length === 0) {
      return null;
    }

    const provider = ProviderFactory.create('gemini'); // Using gemini for cheap zero-shot

    const skillsDesc = availableSkills.map(s => `- ID: ${s.id}\n  Name: ${s.name}\n  Description: ${s.description}`).join('\n\n');

    const prompt = `
Você é um roteador de intenções. O usuário disse: "${userMessage}"

Aqui estão as skills disponíveis:
${skillsDesc}

Responda SOMENTE em JSON com a seguinte estrutura:
{"skillId": "id_da_skill_aqui" | null}
Retorne null se nenhuma skill corresponder à mensagem. Não inclua Markdown como \`\`\`json.
`;

    try {
      const response = await provider.generate([{ conversation_id: 'router', role: 'user', content: prompt }], 'Você é um roteador JSON estrito.', []);
      if (response.text) {
        let text = response.text.trim();
        // Remove markdown formatting if any
        if (text.startsWith('```json')) {
          text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        }
        const json = JSON.parse(text);
        return json.skillId || null;
      }
    } catch (e: any) {
      console.error(`[SkillRouter] Error parsing router response:`, e);
    }
    
    return null;
  }
}
