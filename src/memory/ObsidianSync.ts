import fs from 'fs';
import path from 'path';

export class ObsidianSync {
  private baseDir: string;

  constructor() {
    // Defines the directory for the Obsidian Vault relative to the project root
    this.baseDir = path.join(process.cwd(), 'obsidian_brain');
    
    // Ensure the directory exists
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  public writeFact(userId: string, fact: string) {
    try {
      // Create a markdown file for the user
      const fileName = `User_${userId}.md`;
      const filePath = path.join(this.baseDir, fileName);

      const timestamp = new Date().toLocaleString('pt-BR');
      const factEntry = `- [${timestamp}] ${fact}\n`;

      if (!fs.existsSync(filePath)) {
        // Create new file with header
        const header = `# Cérebro AsafeClaw - Memórias do Usuário ${userId}\n\n## Fatos Aprendidos\n\n`;
        fs.writeFileSync(filePath, header + factEntry, 'utf8');
      } else {
        // Append to existing file
        fs.appendFileSync(filePath, factEntry, 'utf8');
      }
    } catch (error) {
      console.error('[ObsidianSync] Failed to write fact to obsidian vault:', error);
    }
  }
}
