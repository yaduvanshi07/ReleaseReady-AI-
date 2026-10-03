import { GoogleGenAI } from '@google/genai';
import { SYSTEM_INSTRUCTION } from './prompts.js';

export class GeminiProvider {
  /**
   * @param {string} [apiKey]
   * @param {string} [modelName]
   */
  constructor(apiKey = null, modelName = null) {
    this.apiKey = apiKey || process.env.GEMINI_API_KEY || '';
    this.modelName = modelName || process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    this.client = null;

    if (this.apiKey) {
      try {
        this.client = new GoogleGenAI({ apiKey: this.apiKey });
      } catch (err) {
        console.error('Failed to initialize Google GenAI client:', err.message);
      }
    }
  }

  /**
   * Checks if the Gemini API key is configured.
   */
  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  /**
   * Generates structured analysis content from Gemini with timeout and error handling.
   * @param {string} prompt
   * @param {number} [timeoutMs=30000]
   */
  async generateAnalysis(prompt, timeoutMs = 30000) {
    if (!this.isConfigured() || !this.client) {
      throw new Error('Gemini API key is not configured. Please set GEMINI_API_KEY in your server environment.');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await this.client.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          responseMimeType: 'application/json',
          temperature: 0.2
        }
      });

      clearTimeout(timeoutId);

      const text = response.text;
      if (!text) {
        throw new Error('Gemini model returned an empty response.');
      }

      // Clean up markdown fences if present
      let cleanJson = text.trim();
      if (cleanJson.startsWith('```json')) {
        cleanJson = cleanJson.slice(7);
      } else if (cleanJson.startsWith('```')) {
        cleanJson = cleanJson.slice(3);
      }
      if (cleanJson.endsWith('```')) {
        cleanJson = cleanJson.slice(0, -3);
      }

      return {
        rawText: text,
        parsedJson: JSON.parse(cleanJson.trim()),
        modelUsed: this.modelName
      };
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error(`AI request timed out after ${timeoutMs / 1000}s. Please check your network connection and retry.`);
      }
      if (err.message && err.message.includes('API_KEY_INVALID')) {
        throw new Error('Invalid Gemini API Key. Please verify your GEMINI_API_KEY configuration.');
      }
      if (err.message && err.message.includes('RESOURCE_EXHAUSTED')) {
        throw new Error('Gemini rate limit or quota exceeded. Please wait a moment before trying again.');
      }
      throw err;
    }
  }
}
