/**
 * Notifications Capsule - Adapters
 */

import type {
  NotificationConfig,
  Notification,
  EmailNotification,
  PushNotification,
  SMSNotification,
  SlackNotification,
  NotificationResult,
} from './types';
import {
  NotificationSendError,
  NotificationProviderError,
  NotificationValidationError,
} from './errors';
import {
  generateNotificationId,
  validateEmail,
  validatePhoneNumber,
  formatMessage,
} from './utils';

export abstract class NotificationAdapter {
  constructor(protected config: NotificationConfig) {}

  abstract send(notification: Notification): Promise<NotificationResult>;

  protected generateResult(
    success: boolean,
    sentCount: number,
    failedCount: number,
    error?: string
  ): NotificationResult {
    return {
      success,
      notificationId: generateNotificationId(),
      provider: this.config.provider,
      sentCount,
      failedCount,
      timestamp: Date.now(),
      error,
    };
  }
}

export class EmailAdapter extends NotificationAdapter {
  async send(notification: EmailNotification): Promise<NotificationResult> {
    try {
      // Validate recipients
      const recipients = Array.isArray(notification.to) ? notification.to : [notification.to];
      const validRecipients = recipients.filter(email => validateEmail(email));

      if (validRecipients.length === 0) {
        throw new NotificationValidationError('No valid email recipients');
      }

      // Simulate email sending based on provider type
      const providerType = this.config.email?.type || 'smtp';

      switch (providerType) {
        case 'smtp':
          return await this.sendViaSMTP(notification, validRecipients);
        case 'sendgrid':
          return await this.sendViaSendGrid(notification, validRecipients);
        case 'ses':
          return await this.sendViaSES(notification, validRecipients);
        case 'mailgun':
          return await this.sendViaMailgun(notification, validRecipients);
        default:
          throw new NotificationProviderError(`Unknown email provider: ${providerType}`);
      }
    } catch (error: any) {
      return this.generateResult(false, 0, 1, error.message);
    }
  }

  private async sendViaSMTP(
    notification: EmailNotification,
    recipients: string[]
  ): Promise<NotificationResult> {
    // Stub: In production, use nodemailer
    // const transporter = nodemailer.createTransport(config);
    // await transporter.sendMail({...});

    return this.generateResult(true, recipients.length, 0);
  }

  private async sendViaSendGrid(
    notification: EmailNotification,
    recipients: string[]
  ): Promise<NotificationResult> {
    // Stub: In production, use @sendgrid/mail
    // sgMail.setApiKey(apiKey);
    // await sgMail.send({...});

    return this.generateResult(true, recipients.length, 0);
  }

  private async sendViaSES(
    notification: EmailNotification,
    recipients: string[]
  ): Promise<NotificationResult> {
    // Stub: In production, use AWS SDK
    // const ses = new AWS.SES({...});
    // await ses.sendEmail({...}).promise();

    return this.generateResult(true, recipients.length, 0);
  }

  private async sendViaMailgun(
    notification: EmailNotification,
    recipients: string[]
  ): Promise<NotificationResult> {
    // Stub: In production, use mailgun-js
    // const mailgun = require('mailgun-js')({...});
    // await mailgun.messages().send({...});

    return this.generateResult(true, recipients.length, 0);
  }
}

export class PushAdapter extends NotificationAdapter {
  async send(notification: PushNotification): Promise<NotificationResult> {
    try {
      const providerType = this.config.push?.type || 'firebase';
      const tokens = notification.tokens || [notification.to as string];

      switch (providerType) {
        case 'firebase':
          return await this.sendViaFirebase(notification, tokens);
        case 'apns':
          return await this.sendViaAPNS(notification, tokens);
        case 'onesignal':
          return await this.sendViaOneSignal(notification, tokens);
        default:
          throw new NotificationProviderError(`Unknown push provider: ${providerType}`);
      }
    } catch (error: any) {
      return this.generateResult(false, 0, 1, error.message);
    }
  }

  private async sendViaFirebase(
    notification: PushNotification,
    tokens: string[]
  ): Promise<NotificationResult> {
    // Stub: In production, use firebase-admin
    // const admin = require('firebase-admin');
    // await admin.messaging().sendMulticast({...});

    return this.generateResult(true, tokens.length, 0);
  }

  private async sendViaAPNS(
    notification: PushNotification,
    tokens: string[]
  ): Promise<NotificationResult> {
    // Stub: In production, use apn
    // const apn = require('apn');
    // const provider = new apn.Provider({...});
    // await provider.send(notification, tokens);

    return this.generateResult(true, tokens.length, 0);
  }

  private async sendViaOneSignal(
    notification: PushNotification,
    tokens: string[]
  ): Promise<NotificationResult> {
    // Stub: In production, use OneSignal REST API
    // await fetch('https://onesignal.com/api/v1/notifications', {...});

    return this.generateResult(true, tokens.length, 0);
  }
}

export class SMSAdapter extends NotificationAdapter {
  async send(notification: SMSNotification): Promise<NotificationResult> {
    try {
      const recipients = Array.isArray(notification.to) ? notification.to : [notification.to];
      const validRecipients = recipients.filter(phone => validatePhoneNumber(phone));

      if (validRecipients.length === 0) {
        throw new NotificationValidationError('No valid phone numbers');
      }

      const providerType = this.config.sms?.type || 'twilio';

      switch (providerType) {
        case 'twilio':
          return await this.sendViaTwilio(notification, validRecipients);
        case 'vonage':
          return await this.sendViaVonage(notification, validRecipients);
        case 'aws-sns':
          return await this.sendViaSNS(notification, validRecipients);
        default:
          throw new NotificationProviderError(`Unknown SMS provider: ${providerType}`);
      }
    } catch (error: any) {
      return this.generateResult(false, 0, 1, error.message);
    }
  }

  private async sendViaTwilio(
    notification: SMSNotification,
    recipients: string[]
  ): Promise<NotificationResult> {
    // Stub: In production, use twilio
    // const client = require('twilio')(accountSid, authToken);
    // await client.messages.create({...});

    return this.generateResult(true, recipients.length, 0);
  }

  private async sendViaVonage(
    notification: SMSNotification,
    recipients: string[]
  ): Promise<NotificationResult> {
    // Stub: In production, use @vonage/server-sdk
    // const vonage = new Vonage({...});
    // await vonage.message.sendSms({...});

    return this.generateResult(true, recipients.length, 0);
  }

  private async sendViaSNS(
    notification: SMSNotification,
    recipients: string[]
  ): Promise<NotificationResult> {
    // Stub: In production, use AWS SDK
    // const sns = new AWS.SNS({...});
    // await sns.publish({...}).promise();

    return this.generateResult(true, recipients.length, 0);
  }
}

export class SlackAdapter extends NotificationAdapter {
  async send(notification: SlackNotification): Promise<NotificationResult> {
    try {
      const webhookUrl = this.config.slack?.webhookUrl;
      const token = this.config.slack?.token;

      if (!webhookUrl && !token) {
        throw new NotificationProviderError('Slack webhook URL or token is required');
      }

      if (webhookUrl) {
        return await this.sendViaWebhook(notification);
      } else {
        return await this.sendViaAPI(notification);
      }
    } catch (error: any) {
      return this.generateResult(false, 0, 1, error.message);
    }
  }

  private async sendViaWebhook(notification: SlackNotification): Promise<NotificationResult> {
    // Stub: In production, use fetch or axios
    // await fetch(webhookUrl, {
    //   method: 'POST',
    //   body: JSON.stringify({ text: notification.message, ... })
    // });

    return this.generateResult(true, 1, 0);
  }

  private async sendViaAPI(notification: SlackNotification): Promise<NotificationResult> {
    // Stub: In production, use @slack/web-api
    // const { WebClient } = require('@slack/web-api');
    // const client = new WebClient(token);
    // await client.chat.postMessage({...});

    return this.generateResult(true, 1, 0);
  }
}

export function createAdapter(config: NotificationConfig): NotificationAdapter {
  switch (config.provider) {
    case 'email':
      return new EmailAdapter(config);
    case 'push':
      return new PushAdapter(config);
    case 'sms':
      return new SMSAdapter(config);
    case 'slack':
      return new SlackAdapter(config);
    default:
      throw new NotificationProviderError(`Unsupported provider: ${config.provider}`);
  }
}
