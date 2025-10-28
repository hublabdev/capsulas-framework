import { SMSConfig, SMSRequest, SMSResult, SMSStats } from './types';
import { SMSAdapter, TwilioSMSAdapter, AWSSNSAdapter } from './adapters';
import { SMSError } from './errors';
import { validatePhoneNumber, validateMessage, formatPhoneNumber } from './utils';
import { INITIAL_STATS } from './constants';

export class SMSService {
  private adapter: SMSAdapter | null = null;
  private config: SMSConfig;
  private stats: SMSStats = { ...INITIAL_STATS };
  private initialized = false;

  constructor(config: SMSConfig) {
    this.config = config;
  }

  async initialize(): Promise<void> {
    switch (this.config.provider) {
      case 'twilio':
        if (!this.config.accountSid || !this.config.authToken || !this.config.fromNumber) {
          throw new SMSError('Twilio requires accountSid, authToken, and fromNumber');
        }
        this.adapter = new TwilioSMSAdapter(
          this.config.accountSid,
          this.config.authToken,
          this.config.fromNumber
        );
        break;

      case 'aws-sns':
        if (!this.config.region || !this.config.apiKey) {
          throw new SMSError('AWS SNS requires region and apiKey');
        }
        this.adapter = new AWSSNSAdapter(this.config.region, this.config.apiKey);
        break;

      default:
        throw new SMSError(`Unsupported provider: ${this.config.provider}`);
    }

    this.initialized = true;
  }

  async send(request: SMSRequest): Promise<SMSResult> {
    if (!this.initialized || !this.adapter) {
      throw new SMSError('Service not initialized');
    }

    validateMessage(request.message);

    if (!validatePhoneNumber(request.to)) {
      throw new SMSError('Invalid phone number format');
    }

    const formattedRequest = {
      ...request,
      to: formatPhoneNumber(request.to),
      from: request.from || this.config.fromNumber
    };

    try {
      const result = await this.adapter.send(formattedRequest);

      if (result.success) {
        this.stats.totalSent++;
      } else {
        this.stats.totalFailed++;
      }

      this.stats.lastSent = new Date();

      return result;
    } catch (error) {
      this.stats.totalFailed++;
      throw error;
    }
  }

  getStats(): SMSStats {
    return { ...this.stats };
  }
}
