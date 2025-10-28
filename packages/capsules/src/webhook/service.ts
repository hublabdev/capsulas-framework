import { WebhookConfig, WebhookPayload, WebhookResponse, WebhookStats } from './types';
import { WebhookError, WebhookTimeoutError } from './errors';
import { DEFAULT_WEBHOOK_CONFIG, INITIAL_STATS, DEFAULT_HEADERS } from './constants';
import { sleep } from './utils';

export class WebhookService {
  private config: WebhookConfig;
  private stats: WebhookStats = { ...INITIAL_STATS };
  private durations: number[] = [];

  constructor(config: WebhookConfig = {}) {
    this.config = { ...DEFAULT_WEBHOOK_CONFIG, ...config };
  }

  async initialize(): Promise<void> {
    // No initialization needed
  }

  async send(payload: WebhookPayload): Promise<WebhookResponse> {
    const startTime = Date.now();
    let lastError: Error | null = null;
    const maxAttempts = (this.config.retries || 3) + 1;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await this.makeRequest(payload);
        const duration = Date.now() - startTime;

        this.updateStats(true, duration);

        return {
          ...response,
          duration,
          attempt
        };
      } catch (error) {
        lastError = error as Error;

        if (attempt < maxAttempts) {
          await sleep(Math.pow(2, attempt) * 1000); // Exponential backoff
        }
      }
    }

    this.updateStats(false, Date.now() - startTime);

    throw new WebhookError(
      `Failed after ${maxAttempts} attempts: ${lastError?.message}`
    );
  }

  private async makeRequest(payload: WebhookPayload): Promise<Omit<WebhookResponse, 'duration' | 'attempt'>> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const url = new URL(payload.url);
      if (payload.query) {
        Object.entries(payload.query).forEach(([key, value]) => {
          url.searchParams.append(key, value);
        });
      }

      const response = await fetch(url.toString(), {
        method: payload.method || 'POST',
        headers: {
          ...DEFAULT_HEADERS,
          ...payload.headers
        },
        body: payload.body ? JSON.stringify(payload.body) : undefined,
        signal: controller.signal
      });

      const headers: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        headers[key] = value;
      });

      let body: any;
      const contentType = response.headers.get('content-type');
      if (contentType?.includes('application/json')) {
        body = await response.json();
      } else {
        body = await response.text();
      }

      return {
        success: response.ok,
        statusCode: response.status,
        headers,
        body
      };
    } catch (error: any) {
      if (error.name === 'AbortError') {
        throw new WebhookTimeoutError(payload.url);
      }
      throw new WebhookError(error.message);
    } finally {
      clearTimeout(timeout);
    }
  }

  private updateStats(success: boolean, duration: number): void {
    this.stats.totalSent++;

    if (success) {
      this.stats.totalSuccess++;
    } else {
      this.stats.totalFailed++;
    }

    this.durations.push(duration);
    this.stats.averageDuration =
      this.durations.reduce((a, b) => a + b, 0) / this.durations.length;

    this.stats.lastSent = new Date();
  }

  getStats(): WebhookStats {
    return { ...this.stats };
  }
}
