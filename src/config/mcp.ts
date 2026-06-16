import { McpServerConfig } from '../tools/McpClientManager';
import dotenv from 'dotenv';

dotenv.config();

export const mcpServers: McpServerConfig[] = [
  {
    name: 'google',
    command: 'npx',
    args: ['tsx', 'src/mcps/google.ts'],
    env: {
      GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
      GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
      GOOGLE_REFRESH_TOKEN: process.env.GOOGLE_REFRESH_TOKEN || ''
    }
  },
  {
    name: 'memory',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-memory'],
    env: {}
  },
  {
    name: 'obsidian',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem', '/home/ubuntu/asafeclaw-brain'],
    env: {}
  },
  {
    name: 'notion',
    command: 'npx',
    args: ['-y', '@notionhq/notion-mcp-server'],
    env: {
      NOTION_API_KEY: process.env.NOTION_TOKEN || ''
    }
  }
];
