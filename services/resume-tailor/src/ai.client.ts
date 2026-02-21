import { EventEmitter } from 'events';

// --- Type Definitions ---
export interface AIClientOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: 'text' | 'json';
}

export interface PromptPayload {
  systemPrompt?: string;
  userText: string;
}

export interface AIResponse {
  success: boolean;
  data?: string | Record<string, any>;
  error?: string;
  retries?: number;
}

// --- Internal Queue & Rate Limit Guard ---
class RequestQueue {
  private concurrency: number;
  private running: number;
  private queue: Array<() => void>;

  constructor(concurrency: number) {
    this.concurrency = concurrency;
    this.running = 0;
    this.queue = [];
  }

  async add<T>(task: () => Promise<T>): Promise<T> {
    if (this.running >= this.concurrency) {
      await new Promise<void>((resolve) => this.queue.push(resolve));
    }
    this.running++;
    try {
      return await task();
    } finally {
      this.running--;
      if (this.queue.length > 0) {
        const next = this.queue.shift();
        if (next) next();
      }
    }
  }
}

// Global queue for the service to prevent model rate-limiting and overload
// Max 5 concurrent requests
const aiQueue = new RequestQueue(5);

// --- AI Client Logic ---
export class AIClient {
  private apiKey: string;
  private maxRetries = 3;
  private chunkMaxLength = 4000; // Characters roughly

  constructor() {
    this.apiKey = process.env.AI_API_KEY || '';
    if (!this.apiKey) {
      console.warn('Warning: AI_API_KEY environment variable is not set.');
    }
  }

  /**
   * Main entry point for generating content with retry, queueing, and validation.
   */
  public async generateContent(prompt: PromptPayload, options?: AIClientOptions): Promise<AIResponse> {
    return aiQueue.add(() => this._generateContentWithRetry(prompt, options));
  }

  private async _generateContentWithRetry(prompt: PromptPayload, options?: AIClientOptions): Promise<AIResponse> {
    // 1. Validation & Chunking Warning
    if (!prompt.userText || prompt.userText.trim().length === 0) {
      return { success: false, error: 'Prompt validation failed: userText cannot be empty.' };
    }

    // Basic length validation/chunking flag (in a real app, you actually map/reduce chunks)
    if (prompt.userText.length > this.chunkMaxLength) {
      console.info(`[AI Client] Input text exceeds typical length (${prompt.userText.length} chars). It will be processed. Consider chunking for best results.`);
    }

    let attempt = 0;
    let delayMs = 1000;

    while (attempt <= this.maxRetries) {
      try {
        const result = await this._callExternalAPI(prompt, options);
        return { success: true, data: result, retries: attempt };
      } catch (error: any) {
        attempt++;
        const isTransient = this._isTransientError(error);

        if (!isTransient || attempt > this.maxRetries) {
          // SCRUBBED ERROR LOGGING: Never log PII user text or API Keys
          console.error(`[AI Client] Error after ${attempt} attempts: ${error.message || 'Unknown Error'}`);
          return { success: false, error: error.message || 'Failed to generate content' };
        }

        console.info(`[AI Client] Transient error, retrying in ${delayMs}ms (attempt ${attempt}/${this.maxRetries})...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
        delayMs *= 2; // Exponential backoff
      }
    }
    return { success: false, error: 'Max retries reached.' };
  }

  /**
   * Mocked external API call. 
   * In a real app, use fetch to OpenAI/Anthropic/etc. using `this.apiKey`.
   */
  private async _callExternalAPI(prompt: PromptPayload, options?: AIClientOptions): Promise<any> {
    if (!this.apiKey) {
      throw new Error('API key is missing.');
    }

    // Simulate transient network errors ~20% of the time for testing retry logic
    if (Math.random() < 0.2) {
      throw Object.assign(new Error('Simulated transient network timeout'), { code: 'ETIMEDOUT' });
    }

    // Simulate network delay
    await new Promise((r) => setTimeout(r, 800));

    // Handle JSON format requirement
    if (options?.responseFormat === 'json') {
      return {
        tailoredResume: 'Mock Output...',
        originalTextLength: prompt.userText.length,
        notes: 'This is a JSON formatted dummy response.'
      };
    }

    return `Mock Output for prompt length ${prompt.userText.length}`;
  }

  private _isTransientError(error: any): boolean {
    // Determine if it's transient, e.g. 429, 500, 502, 503, 504 or network timeout
    const status = error?.status;
    const code = error?.code;
    if (status && (status === 429 || status >= 500)) return true;
    if (code && ['ETIMEDOUT', 'ECONNRESET', 'ENOTFOUND'].includes(code)) return true;
    return false;
  }
}

export const aiClient = new AIClient();
