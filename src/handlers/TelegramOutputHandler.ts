import { Context } from 'grammy';

export class TelegramOutputHandler {
  public static async sendResponse(ctx: Context, response: { text: string, requiresAudioReply: boolean }) {
    try {
      if (response.requiresAudioReply) {
        console.log('[TelegramOutputHandler] Audio reply requested (TTS not implemented yet)');
      }
      
      // Send typing action
      await ctx.replyWithChatAction('typing');
      
      // Simple text output for now
      // Could be expanded to handle long messages splitting, markdown parsing, etc.
      await ctx.reply(response.text, { parse_mode: 'Markdown' });
    } catch (e: any) {
      console.error(`[TelegramOutputHandler] Error sending message:`, e);
      // Fallback without markdown if parse error
      try {
        await ctx.reply(response.text);
      } catch (innerE) {
        console.error(`[TelegramOutputHandler] Failed fallback:`, innerE);
      }
    }
  }
}
