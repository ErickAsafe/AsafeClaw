import fs from 'fs';
import { SkillMetadata } from './SkillLoader';

export class SkillExecutor {
  public static getSkillContent(skill: SkillMetadata): string {
    try {
      const content = fs.readFileSync(skill.path, 'utf-8');
      // Strip frontmatter for the system prompt
      const contentWithoutFrontmatter = content.replace(/^---\n[\s\S]*?\n---/, '').trim();
      return contentWithoutFrontmatter;
    } catch (e: any) {
      console.error(`[SkillExecutor] Failed to read skill ${skill.id}:`, e);
      return '';
    }
  }
}
