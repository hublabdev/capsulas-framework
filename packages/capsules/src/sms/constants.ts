export const DEFAULT_SMS_CONFIG = {
  provider: 'twilio' as const,
  maxRetries: 3,
  timeout: 30000
};

export const SMS_PROVIDERS = ['twilio', 'aws-sns', 'vonage', 'messagebird'] as const;

export const INITIAL_STATS = {
  totalSent: 0,
  totalFailed: 0,
  totalQueued: 0
};
