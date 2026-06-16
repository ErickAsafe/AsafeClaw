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

console.log('[SandecoClaw] Starting bot...');
bot.start({
  onStart: (botInfo) => {
    console.log(`[SandecoClaw] Bot @${botInfo.username} started successfully.`);
  }
});
