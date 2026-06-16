import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { env } from '../config/env';

export interface SkillMetadata {
  id: string; // The folder name
  name: string;
  description: string;
  path: string; // Full path to the markdown file
}

export class SkillLoader {
  public static loadAvailableSkills(): SkillMetadata[] {
    const skillsPath = env.SKILLS_PATH;
    const skills: SkillMetadata[] = [];

    if (!fs.existsSync(skillsPath)) {
      console.warn(`[SkillLoader] Skills path does not exist: ${skillsPath}`);
      return skills;
    }

    const folders = fs.readdirSync(skillsPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    for (const folder of folders) {
      const mdPath = path.join(skillsPath, folder, 'SKILL.md');
      if (fs.existsSync(mdPath)) {
        try {
          const content = fs.readFileSync(mdPath, 'utf-8');
          // Parse YAML frontmatter
          const match = content.match(/^---\n([\s\S]*?)\n---/);
          if (match) {
            const frontmatter = yaml.load(match[1] || '') as any;
            if (frontmatter && frontmatter.name) {
              skills.push({
                id: folder,
                name: frontmatter.name,
                description: frontmatter.description || '',
                path: mdPath
              });
            }
          }
        } catch (e: any) {
          console.warn(`[SkillLoader] Failed to parse SKILL.md in ${folder}: ${e.message}`);
        }
      }
    }

    return skills;
  }
}
