/**
 * Webhook Capsule - Types
 * Send and receive webhooks
 */

export type WebhookMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface WebhookConfig {
  secret?: string;
  timeout?: number;
  retries?: number;
  verifySignature?: boolean;
}

export interface WebhookPayload {
  url: string;
  method?: WebhookMethod;
  headers?: Record<string, string>;
  body?: any;
  query?: Record<string, string>;
}

export interface WebhookResponse {
  success: boolean;
  statusCode: number;
  headers: Record<string, string>;
  body: any;
  duration: number;
  attempt: number;
}

export interface WebhookStats {
  totalSent: number;
  totalSuccess: number;
  totalFailed: number;
  averageDuration: number;
  lastSent?: Date;
}

export interface WebhookSignature {
  algorithm: 'sha256' | 'sha512';
  header: string;
  secret: string;
}
