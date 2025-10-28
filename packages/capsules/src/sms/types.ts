/**
 * SMS Capsule - Types
 * Send SMS messages via multiple providers
 */

export type SMSProvider = 'twilio' | 'aws-sns' | 'vonage' | 'messagebird';

export interface SMSConfig {
  provider: SMSProvider;
  accountSid?: string;
  authToken?: string;
  fromNumber?: string;
  apiKey?: string;
  apiSecret?: string;
  region?: string;
}

export interface SMSRequest {
  to: string;
  message: string;
  from?: string;
  mediaUrls?: string[];
}

export interface SMSResult {
  success: boolean;
  messageId: string;
  provider: SMSProvider;
  to: string;
  status: 'sent' | 'queued' | 'failed';
  timestamp: Date;
  error?: string;
}

export interface SMSStats {
  totalSent: number;
  totalFailed: number;
  totalQueued: number;
  lastSent?: Date;
}
