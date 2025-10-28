export class WebhookError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WebhookError';
  }
}

export class WebhookTimeoutError extends WebhookError {
  constructor(url: string) {
    super(`Webhook request to ${url} timed out`);
    this.name = 'WebhookTimeoutError';
  }
}

export class WebhookSignatureError extends WebhookError {
  constructor() {
    super('Invalid webhook signature');
    this.name = 'WebhookSignatureError';
  }
}
