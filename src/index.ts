import { Bot } from 'grammy';
import fs from 'fs';
import { env } from './config/env';
import { TelegramInputHandler } from './handlers/TelegramInputHandler';
import { TelegramOutputHandler } from './handlers/TelegramOutputHandler';
import { AgentController } from './core/AgentController';

if (!env.TELEGRAM_BOT_TOKEN) {
  console.error('FATAL: TELEGRAM_BOT_TOKEN is not defined in .env');
  process.exit(1);
}

const bot = new Bot(env.TELEGRAM_BOT_TOKEN);
const controller = new AgentController();

// Use authentication middleware
bot.use(TelegramInputHandler.handleAuth.bind(TelegramInputHandler));

import { SkillLoader } from './skills/SkillLoader';

bot.command('skills', async (ctx) => {
  const userId = ctx.from?.id.toString();
  if (!userId) return;
  console.log(`[Bot] /skills command from ${userId}`);
  
  await ctx.replyWithChatAction('typing');
  const skills = SkillLoader.loadAvailableSkills();
  if (skills.length === 0) {
    await ctx.reply('Nenhuma skill disponível no momento.');
    return;
  }
  
  const skillsList = skills.map(s => `🔹 *${s.name}*\n_${s.description}_`).join('\n\n');
  await ctx.reply(`🧠 *Skills Disponíveis no AsafeClaw:*\n\n${skillsList}\n\n💡 _Dica: Peça algo como "Atue como o [Nome] e avalie minha ideia"_`, { parse_mode: 'Markdown' });
});

bot.command('vps', async (ctx) => {
  const userId = ctx.from?.id.toString();
  const chatId = ctx.chat.id.toString();
  if (!userId) return;
  console.log(`[Bot] /vps command from ${userId}`);
  
  await ctx.replyWithChatAction('typing');
  try {
    const response = await controller.handleMessage(chatId, userId, "Execute a ferramenta de monitorar VPS e me dê um relatório completo de uso de CPU, RAM, disco e uptime do servidor atual.");
    await TelegramOutputHandler.sendResponse(ctx, response);
  } catch (error: any) {
    console.error('[Bot] VPS command error:', error);
    await ctx.reply('Erro ao buscar status da VPS.');
  }
});

bot.command('status', async (ctx) => {
  const userId = ctx.from?.id.toString();
  const chatId = ctx.chat.id.toString();
  if (!userId) return;
  console.log(`[Bot] /status command from ${userId}`);
  
  try {
    const messageCount = controller.getMessageCount(chatId);
    // rough estimation: ~15 tokens per short message
    const estimatedTokens = messageCount * 50; 
    
    const statusMsg = `📊 *Status da Memória e LLMs*\n\n` +
      `*🧠 Memória Curta (Contexto Atual):*\n` +
      `Mensagens trocadas: ${messageCount}\n` +
      `Tokens estimados: ~${estimatedTokens}\n\n` +
      `*🤖 Pilha de Modelos (Fallback Automático):*\n` +
      `1️⃣ Gemini 2.0 Flash (Principal)\n` +
      `2️⃣ Llama 3.3 70B (Backup Gratuito)\n` +
      `3️⃣ Gemini 1.5 Flash 8B (Último Recurso)\n\n` +
      `_A troca entre eles acontece automaticamente e invisivelmente caso a cota gratuita do modelo principal acabe._`;
      
    await ctx.reply(statusMsg, { parse_mode: 'Markdown' });
  } catch (error: any) {
    console.error('[Bot] Status command error:', error);
    await ctx.reply('Erro ao buscar o status de tokens.');
  }
});

import { TokenUsageRepository } from './memory/TokenUsageRepository';

bot.command('tokens', async (ctx) => {
  const userId = ctx.from?.id.toString();
  if (!userId) return;
  console.log(`[Bot] /tokens command from ${userId}`);
  
  try {
    const repo = new TokenUsageRepository();
    const stats = repo.getTodayUsageByProvider(userId);
    
    if (stats.length === 0) {
      await ctx.reply('📈 *Painel de Tokens*\nNenhum token gasto no dia de hoje.', { parse_mode: 'Markdown' });
      return;
    }
    
    let msg = `📈 *Painel de Tokens (Hoje)*\n\n`;
    for (const stat of stats) {
      const total = stat.total_prompt + stat.total_completion;
      msg += `🔹 *${stat.provider}*\n`;
      msg += `   Entrada (Prompt): ${stat.total_prompt}\n`;
      msg += `   Saída (Resposta): ${stat.total_completion}\n`;
      msg += `   *Total: ${total} tokens*\n\n`;
    }
    
    msg += `_Este uso é reiniciado automaticamente amanhã._`;
    await ctx.reply(msg, { parse_mode: 'Markdown' });
  } catch (error: any) {
    console.error('[Bot] Tokens command error:', error);
    await ctx.reply('Erro ao buscar painel de tokens.');
  }
});

bot.on('message:text', async (ctx) => {
  const userId = ctx.from?.id.toString();
  const chatId = ctx.chat.id.toString();
  const text = ctx.message.text;

  if (!userId || !text) return;

  console.log(`[Bot] Received message from ${userId}`);
  
  // Indicate processing
  await ctx.replyWithChatAction('typing');

  try {
    const response = await controller.handleMessage(chatId, userId, text);
    await TelegramOutputHandler.sendResponse(ctx, response);
  } catch (error: any) {
    console.error('[Bot] Unhandled error:', error);
    await ctx.reply('Ocorreu um erro interno ao processar sua mensagem.');
  }
});

bot.on('message:document', async (ctx) => {
  const userId = ctx.from?.id.toString();
  const chatId = ctx.chat.id.toString();
  
  if (!userId) return;
  console.log(`[Bot] Received document from ${userId}`);
  
  const mimeType = ctx.message.document.mime_type || '';
  const fileName = ctx.message.document.file_name || '';
  
  if (mimeType !== 'application/pdf' && !fileName.endsWith('.md')) {
    await ctx.reply('Formato não suportado. Envie PDF ou MD.');
    return;
  }
  
  await ctx.replyWithChatAction('typing');
  
  try {
    const file = await ctx.getFile();
    const url = `https://api.telegram.org/file/bot${env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;
    const extension = fileName.split('.').pop() || 'tmp';
    
    const localPath = await TelegramInputHandler.downloadFile(url, extension);
    const textContent = await TelegramInputHandler.parseDocument(localPath, mimeType);
    
    fs.unlinkSync(localPath);
    
    const contextMsg = `[Conteúdo do arquivo ${fileName}]:\n${textContent}`;
    const response = await controller.handleMessage(chatId, userId, contextMsg);
    await TelegramOutputHandler.sendResponse(ctx, response);
  } catch (error: any) {
    console.error('[Bot] Document error:', error);
    await ctx.reply('Erro ao processar documento.');
  }
});

bot.on(['message:voice', 'message:audio'], async (ctx) => {
  const userId = ctx.from?.id.toString();
  const chatId = ctx.chat.id.toString();
  
  if (!userId) return;
  console.log(`[Bot] Received audio/voice from ${userId}`);
  
  await ctx.replyWithChatAction('record_voice');
  
  try {
    const file = await ctx.getFile();
    const url = `https://api.telegram.org/file/bot${env.TELEGRAM_BOT_TOKEN}/${file.file_path}`;
    
    const localPath = await TelegramInputHandler.downloadFile(url, 'ogg');
    const transcribedText = await TelegramInputHandler.transcribeAudio(localPath);
    
    fs.unlinkSync(localPath);
    
    const response = await controller.handleMessage(chatId, userId, transcribedText, { requiresAudioReply: true });
    await TelegramOutputHandler.sendResponse(ctx, response);
  } catch (error: any) {
    console.error('[Bot] Audio error:', error);
    await ctx.reply('Erro ao processar áudio.');
  }
});

bot.catch((err) => {
  console.error('[Grammy] Error:', err);
});

console.log('[SandecoClaw] Setting up commands...');
bot.api.setMyCommands([
  { command: 'skills', description: 'Listar todas as personas/skills disponíveis' },
  { command: 'vps', description: 'Obter relatório de status da VPS' },
  { command: 'status', description: 'Checar memória atual e pilha de modelos LLM' },
  { command: 'tokens', description: 'Monitorar uso diário de tokens por LLM' }
]).catch(console.error);

console.log('[SandecoClaw] Starting bot...');
bot.start({
  onStart: (botInfo) => {
    console.log(`[SandecoClaw] Bot @${botInfo.username} started successfully.`);
  }
});
