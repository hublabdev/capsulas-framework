export const DEFAULT_WEBHOOK_CONFIG = {
  timeout: 30000,
  retries: 3,
  verifySignature: false
};

export const INITIAL_STATS = {
  totalSent: 0,
  totalSuccess: 0,
  totalFailed: 0,
  averageDuration: 0
};

export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'User-Agent': 'Capsulas-Webhook/1.0'
};
