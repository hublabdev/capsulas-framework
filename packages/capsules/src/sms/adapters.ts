import { SMSRequest, SMSResult, SMSProvider } from './types';

export abstract class SMSAdapter {
  abstract send(request: SMSRequest): Promise<SMSResult>;
  abstract getName(): SMSProvider;
}

export class TwilioSMSAdapter extends SMSAdapter {
  constructor(
    private accountSid: string,
    private authToken: string,
    private fromNumber: string
  ) {
    super();
  }

  getName(): SMSProvider {
    return 'twilio';
  }

  async send(request: SMSRequest): Promise<SMSResult> {
    // Production: Use Twilio SDK
    // const client = require('twilio')(this.accountSid, this.authToken);
    // const message = await client.messages.create({...});

    return {
      success: true,
      messageId: `twilio_${Date.now()}`,
      provider: 'twilio',
      to: request.to,
      status: 'sent',
      timestamp: new Date()
    };
  }
}

export class AWSSNSAdapter extends SMSAdapter {
  constructor(private region: string, private apiKey: string) {
    super();
  }

  getName(): SMSProvider {
    return 'aws-sns';
  }

  async send(request: SMSRequest): Promise<SMSResult> {
    // Production: Use AWS SDK
    // const AWS = require('aws-sdk');
    // const sns = new AWS.SNS({region: this.region});

    return {
      success: true,
      messageId: `sns_${Date.now()}`,
      provider: 'aws-sns',
      to: request.to,
      status: 'sent',
      timestamp: new Date()
    };
  }
}
