import { Context } from 'grammy';
import fs from 'fs';
import path from 'path';
// @ts-ignore
import pdfParse from 'pdf-parse';
import Groq from 'groq-sdk';
import { env } from '../config/env';

export class TelegramInputHandler {
  public static isAllowed(userId: number | undefined): boolean {
    if (!userId) return false;
    return env.TELEGRAM_ALLOWED_USER_IDS.includes(userId.toString());
  }

  public static handleAuth(ctx: Context, next: () => Promise<void>) {
    if (this.isAllowed(ctx.from?.id)) {
      return next();
    } else {
      console.warn(`[Auth] Unauthorized access attempt from user: ${ctx.from?.id}`);
      // Silently ignore as per specs
      return;
    }
  }

  public static async downloadFile(fileUrl: string, extension: string): Promise<string> {
    if (!fs.existsSync(env.TMP_PATH)) {
      fs.mkdirSync(env.TMP_PATH, { recursive: true });
    }
    const filename = `temp_${Date.now()}_${Math.floor(Math.random() * 10000)}.${extension}`;
    const filePath = path.join(env.TMP_PATH, filename);
    
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filePath, buffer);
    return filePath;
  }

  public static async downloadImageAsBase64(fileUrl: string): Promise<{ base64: string, mimeType: string }> {
    const response = await fetch(fileUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return {
      base64: buffer.toString('base64'),
      mimeType: contentType
    };
  }

  public static async parseDocument(filePath: string, mimetype: string): Promise<string> {
    if (mimetype === 'application/pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    } else if (filePath.endsWith('.md')) {
      return fs.readFileSync(filePath, 'utf-8');
    }
    throw new Error('Unsupported document format');
  }

  public static async transcribeAudio(filePath: string): Promise<string> {
    const groq = new Groq({ apiKey: env.GROQ_API_KEY });
    const response = await groq.audio.transcriptions.create({
      file: fs.createReadStream(filePath),
      model: 'whisper-large-v3-turbo',
    });
    return response.text;
  }
}
