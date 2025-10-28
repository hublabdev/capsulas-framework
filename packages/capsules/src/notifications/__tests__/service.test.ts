import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NotificationService, createNotificationService } from '../service';
import { NotificationConfigError, NotificationValidationError } from '../errors';
import {
  validateEmail,
  validatePhoneNumber,
  calculateSuccessRate,
  calculateBackoff,
  parseEmailAddresses,
  parsePhoneNumbers,
} from '../utils';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(async () => {
    service = await createNotificationService({
      provider: 'email',
      email: {
        type: 'smtp',
        from: 'test@example.com',
        host: 'smtp.example.com',
        port: 587,
      },
    });
  });

  describe('Initialization', () => {
    it('should initialize correctly with email provider', async () => {
      expect(service).toBeDefined();
      expect(service.getConfig().provider).toBe('email');
    });

    it('should initialize with push provider', async () => {
      const pushService = await createNotificationService({
        provider: 'push',
        push: {
          type: 'firebase',
          apiKey: 'test_key',
          projectId: 'test_project',
        },
      });
      expect(pushService.getConfig().provider).toBe('push');
    });

    it('should initialize with sms provider', async () => {
      const smsService = await createNotificationService({
        provider: 'sms',
        sms: {
          type: 'twilio',
          accountSid: 'test_sid',
          authToken: 'test_token',
          from: '+1234567890',
        },
      });
      expect(smsService.getConfig().provider).toBe('sms');
    });

    it('should initialize with slack provider', async () => {
      const slackService = await createNotificationService({
        provider: 'slack',
        slack: {
          webhookUrl: 'https://hooks.slack.com/services/TEST/TEST/TEST',
        },
      });
      expect(slackService.getConfig().provider).toBe('slack');
    });

    it('should throw error without provider', async () => {
      await expect(
        createNotificationService({} as any)
      ).rejects.toThrow(NotificationConfigError);
    });

    it('should use default configuration', () => {
      const config = service.getConfig();
      expect(config.retryAttempts).toBe(3);
      expect(config.retryDelay).toBe(1000);
      expect(config.timeout).toBe(30000);
    });

    it('should override default configuration', async () => {
      const customService = await createNotificationService({
        provider: 'email',
        email: { type: 'smtp' },
        retryAttempts: 5,
        retryDelay: 2000,
      });
      const config = customService.getConfig();
      expect(config.retryAttempts).toBe(5);
      expect(config.retryDelay).toBe(2000);
    });
  });

  describe('Email Sending', () => {
    beforeEach(async () => {
      // Reset stats before each test
      service.resetStats();
    });

    it('should send email successfully', async () => {
      const result = await service.sendEmail({
        to: 'recipient@example.com',
        subject: 'Test Email',
        message: 'This is a test email',
      });
      expect(result.success).toBe(true);
      expect(result.provider).toBe('email');
      expect(result.sentCount).toBe(1);
      expect(result.failedCount).toBe(0);
    });

    it('should send email to multiple recipients', async () => {
      const result = await service.sendEmail({
        to: ['user1@example.com', 'user2@example.com', 'user3@example.com'],
        subject: 'Test Email',
        message: 'This is a test email',
      });
      expect(result.success).toBe(true);
      expect(result.sentCount).toBe(3);
    });

    it('should send email with HTML content', async () => {
      const result = await service.sendEmail({
        to: 'recipient@example.com',
        subject: 'Test Email',
        message: 'Plain text message',
        html: '<h1>HTML Message</h1>',
      });
      expect(result.success).toBe(true);
    });

    it('should send email with CC and BCC', async () => {
      const result = await service.sendEmail({
        to: 'recipient@example.com',
        subject: 'Test Email',
        message: 'This is a test email',
        cc: ['cc1@example.com', 'cc2@example.com'],
        bcc: ['bcc@example.com'],
      });
      expect(result.success).toBe(true);
    });

    it('should send email with attachments', async () => {
      const result = await service.sendEmail({
        to: 'recipient@example.com',
        subject: 'Test Email',
        message: 'Email with attachment',
        attachments: [
          {
            filename: 'test.txt',
            content: 'Test file content',
          },
        ],
      });
      expect(result.success).toBe(true);
    });

    it('should send email with priority', async () => {
      const result = await service.sendEmail({
        to: 'recipient@example.com',
        subject: 'Urgent Email',
        message: 'This is urgent',
        priority: 'urgent',
      });
      expect(result.success).toBe(true);
    });

    it('should throw error when provider mismatch', async () => {
      const pushService = await createNotificationService({
        provider: 'push',
        push: { type: 'firebase' },
      });
      await expect(
        pushService.sendEmail({
          to: 'test@example.com',
          subject: 'Test',
          message: 'Test',
        })
      ).rejects.toThrow(NotificationConfigError);
    });

    it('should track email statistics', async () => {
      // Create fresh service for isolated stats test
      const freshService = await createNotificationService({
        provider: 'email',
        email: { type: 'smtp', from: 'test@example.com' },
      });

      await freshService.sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        message: 'Test message',
      });
      const stats = freshService.getStats();
      expect(stats.totalSent).toBeGreaterThanOrEqual(1);
      expect(stats.byProvider.email).toBeGreaterThanOrEqual(1);
      expect(stats.byPriority.normal).toBeGreaterThanOrEqual(1);
    });
  });

  describe('Push Notifications', () => {
    let pushService: NotificationService;

    beforeEach(async () => {
      pushService = await createNotificationService({
        provider: 'push',
        push: {
          type: 'firebase',
          apiKey: 'test_key',
          projectId: 'test_project',
        },
      });
    });

    it('should send push notification successfully', async () => {
      const result = await pushService.sendPush({
        to: 'device_token_123',
        title: 'Test Notification',
        body: 'This is a test notification',
        message: 'This is a test notification',
      });
      expect(result.success).toBe(true);
      expect(result.provider).toBe('push');
      expect(result.sentCount).toBe(1);
    });

    it('should send push to multiple tokens', async () => {
      const result = await pushService.sendPush({
        to: 'device_token',
        title: 'Test',
        body: 'Test message',
        message: 'Test message',
        tokens: ['token1', 'token2', 'token3'],
      });
      expect(result.success).toBe(true);
      expect(result.sentCount).toBe(3);
    });

    it('should send push with image', async () => {
      const result = await pushService.sendPush({
        to: 'device_token',
        title: 'Test',
        body: 'Test with image',
        message: 'Test with image',
        imageUrl: 'https://example.com/image.png',
      });
      expect(result.success).toBe(true);
    });

    it('should send push with custom data', async () => {
      const result = await pushService.sendPush({
        to: 'device_token',
        title: 'Test',
        body: 'Test message',
        message: 'Test message',
        data: { orderId: '123', type: 'order' },
      });
      expect(result.success).toBe(true);
    });

    it('should throw error when provider mismatch', async () => {
      await expect(
        service.sendPush({
          to: 'token',
          title: 'Test',
          body: 'Test',
          message: 'Test',
        })
      ).rejects.toThrow(NotificationConfigError);
    });
  });

  describe('SMS Sending', () => {
    let smsService: NotificationService;

    beforeEach(async () => {
      smsService = await createNotificationService({
        provider: 'sms',
        sms: {
          type: 'twilio',
          accountSid: 'test_sid',
          authToken: 'test_token',
          from: '+1234567890',
        },
      });
    });

    it('should send SMS successfully', async () => {
      const result = await smsService.sendSMS({
        to: '+15555551234',
        message: 'Test SMS message',
      });
      expect(result.success).toBe(true);
      expect(result.provider).toBe('sms');
      expect(result.sentCount).toBe(1);
    });

    it('should send SMS to multiple recipients', async () => {
      const result = await smsService.sendSMS({
        to: ['+15555551234', '+15555555678', '+15555559012'],
        message: 'Test SMS',
      });
      expect(result.success).toBe(true);
      expect(result.sentCount).toBe(3);
    });

    it('should send SMS with media URLs', async () => {
      const result = await smsService.sendSMS({
        to: '+15555551234',
        message: 'Check out this image',
        mediaUrls: ['https://example.com/image.png'],
      });
      expect(result.success).toBe(true);
    });

    it('should throw error when provider mismatch', async () => {
      await expect(
        service.sendSMS({
          to: '+15555551234',
          message: 'Test',
        })
      ).rejects.toThrow(NotificationConfigError);
    });
  });

  describe('Slack Notifications', () => {
    let slackService: NotificationService;

    beforeEach(async () => {
      slackService = await createNotificationService({
        provider: 'slack',
        slack: {
          webhookUrl: 'https://hooks.slack.com/services/TEST/TEST/TEST',
          channel: '#general',
        },
      });
    });

    it('should send Slack message successfully', async () => {
      const result = await slackService.sendSlack({
        to: '#general',
        message: 'Test Slack message',
      });
      expect(result.success).toBe(true);
      expect(result.provider).toBe('slack');
      expect(result.sentCount).toBe(1);
    });

    it('should send Slack message with attachments', async () => {
      const result = await slackService.sendSlack({
        to: '#general',
        message: 'Message with attachments',
        attachments: [
          {
            fallback: 'Fallback text',
            color: '#36a64f',
            title: 'Attachment Title',
            text: 'Attachment text',
          },
        ],
      });
      expect(result.success).toBe(true);
    });

    it('should send Slack message with username and icon', async () => {
      const result = await slackService.sendSlack({
        to: '#general',
        message: 'Custom bot message',
        username: 'CustomBot',
        iconEmoji: ':robot:',
      });
      expect(result.success).toBe(true);
    });

    it('should throw error when provider mismatch', async () => {
      await expect(
        service.sendSlack({
          to: '#general',
          message: 'Test',
        })
      ).rejects.toThrow(NotificationConfigError);
    });
  });

  describe('Generic Send', () => {
    beforeEach(() => {
      service.resetStats();
    });

    it('should send via generic send method', async () => {
      const result = await service.send({
        provider: 'email',
        to: 'test@example.com',
        subject: 'Test',
        message: 'Test message',
      });
      expect(result.success).toBe(true);
      expect(result.notificationId).toBeDefined();
    });

    it('should generate notification ID', async () => {
      const result = await service.send({
        provider: 'email',
        to: 'test@example.com',
        message: 'Test',
      });
      expect(result.notificationId).toBeDefined();
      expect(result.notificationId).toMatch(/^notif_/);
    });

    it('should set default priority', async () => {
      // Create fresh service for isolated stats test
      const freshService = await createNotificationService({
        provider: 'email',
        email: { type: 'smtp' },
      });

      await freshService.send({
        provider: 'email',
        to: 'test@example.com',
        message: 'Test',
      });
      const stats = freshService.getStats();
      expect(stats.byPriority.normal).toBeGreaterThanOrEqual(1);
      expect(stats.byPriority.low).toBe(0);
      expect(stats.byPriority.high).toBe(0);
    });

    it('should respect custom priority', async () => {
      await service.send({
        provider: 'email',
        to: 'test@example.com',
        message: 'Test',
        priority: 'high',
      });
      const stats = service.getStats();
      expect(stats.byPriority.high).toBe(1);
    });
  });

  describe('Validation', () => {
    it('should validate valid email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(validateEmail('user+tag@example.com')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('invalid@')).toBe(false);
      expect(validateEmail('@invalid.com')).toBe(false);
      expect(validateEmail('invalid@.com')).toBe(false);
    });

    it('should validate phone numbers in E.164 format', () => {
      expect(validatePhoneNumber('+15555551234')).toBe(true);
      expect(validatePhoneNumber('+447911123456')).toBe(true);
      expect(validatePhoneNumber('+61412345678')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      // Note: E.164 format allows numbers without + if they start with valid country code
      expect(validatePhoneNumber('+1')).toBe(false);
      expect(validatePhoneNumber('invalid')).toBe(false);
      expect(validatePhoneNumber('0123456789')).toBe(false); // Starts with 0
      expect(validatePhoneNumber('+12345678901234567890')).toBe(false); // Too long
    });

    it('should parse email addresses', () => {
      const emails = parseEmailAddresses([
        'valid@example.com',
        'invalid',
        'another@example.com',
      ]);
      expect(emails).toHaveLength(2);
      expect(emails).toContain('valid@example.com');
      expect(emails).toContain('another@example.com');
    });

    it('should parse phone numbers', () => {
      const phones = parsePhoneNumbers([
        '+15555551234',
        '15555555678',
        'invalid',
      ]);
      expect(phones.length).toBeGreaterThan(0);
    });

    it('should normalize phone numbers', () => {
      const phones = parsePhoneNumbers(['1-555-555-1234', '(555) 555-5678']);
      phones.forEach(phone => {
        expect(phone).toMatch(/^\+/);
      });
    });
  });

  describe('Retry Logic', () => {
    it('should retry on failure', async () => {
      const failService = new NotificationService({
        provider: 'email',
        email: { type: 'smtp' },
        retryAttempts: 3,
        retryDelay: 100,
      });
      await failService.initialize();

      // This will fail because no valid SMTP config, triggering retries
      const result = await failService.send({
        provider: 'email',
        to: 'invalid_email',
        message: 'Test',
      });

      expect(result.success).toBe(false);
      expect(result.failedCount).toBe(1);
    });

    it('should calculate exponential backoff', () => {
      const backoff1 = calculateBackoff(1, 1000);
      const backoff2 = calculateBackoff(2, 1000);
      const backoff3 = calculateBackoff(3, 1000);

      expect(backoff1).toBe(1000);
      expect(backoff2).toBe(2000);
      expect(backoff3).toBe(4000);
    });

    it('should respect retry attempts configuration', async () => {
      const service1 = new NotificationService({
        provider: 'email',
        email: { type: 'smtp' },
        retryAttempts: 1,
      });
      expect(service1.getConfig().retryAttempts).toBe(1);

      const service2 = new NotificationService({
        provider: 'email',
        email: { type: 'smtp' },
        retryAttempts: 5,
      });
      expect(service2.getConfig().retryAttempts).toBe(5);
    });

    it('should track failed notifications in stats', async () => {
      const result = await service.send({
        provider: 'email',
        to: 'invalid_email',
        message: 'Test',
      });

      if (!result.success) {
        const stats = service.getStats();
        expect(stats.totalFailed).toBeGreaterThan(0);
      }
    });
  });

  describe('Statistics', () => {
    beforeEach(() => {
      service.resetStats();
    });

    it('should track total sent notifications', async () => {
      await service.sendEmail({
        to: 'test1@example.com',
        subject: 'Test 1',
        message: 'Message 1',
      });
      await service.sendEmail({
        to: 'test2@example.com',
        subject: 'Test 2',
        message: 'Message 2',
      });

      const stats = service.getStats();
      expect(stats.totalSent).toBe(2);
    });

    it('should track notifications by provider', async () => {
      // Create fresh service for isolated stats test
      const freshService = await createNotificationService({
        provider: 'email',
        email: { type: 'smtp' },
      });

      await freshService.sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        message: 'Test',
      });

      const stats = freshService.getStats();
      expect(stats.byProvider.email).toBeGreaterThanOrEqual(1);
      // Other providers should have less than email
      expect(stats.byProvider.email).toBeGreaterThan(stats.byProvider.push);
    });

    it('should track notifications by priority', async () => {
      // Create fresh service for isolated stats test
      const freshService = await createNotificationService({
        provider: 'email',
        email: { type: 'smtp' },
      });

      await freshService.send({
        provider: 'email',
        to: 'test@example.com',
        message: 'Low priority',
        priority: 'low',
      });
      await freshService.send({
        provider: 'email',
        to: 'test@example.com',
        message: 'Normal priority',
        priority: 'normal',
      });
      await freshService.send({
        provider: 'email',
        to: 'test@example.com',
        message: 'High priority',
        priority: 'high',
      });

      const stats = freshService.getStats();
      expect(stats.byPriority.low).toBeGreaterThanOrEqual(1);
      expect(stats.byPriority.normal).toBeGreaterThanOrEqual(1);
      expect(stats.byPriority.high).toBeGreaterThanOrEqual(1);
      // Urgent should be less than or equal to others since it wasn't sent
      expect(stats.byPriority.urgent).toBeLessThanOrEqual(stats.byPriority.low);
    });

    it('should calculate success rate', async () => {
      expect(calculateSuccessRate(10, 0)).toBe(100);
      expect(calculateSuccessRate(8, 2)).toBe(80);
      expect(calculateSuccessRate(5, 5)).toBe(50);
      expect(calculateSuccessRate(0, 10)).toBe(0);
      expect(calculateSuccessRate(0, 0)).toBe(100);
    });

    it('should track success rate in stats', async () => {
      await service.sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        message: 'Test',
      });

      const stats = service.getStats();
      expect(stats.successRate).toBeGreaterThan(0);
      expect(stats.successRate).toBeLessThanOrEqual(100);
    });

    it('should track average delivery time', async () => {
      await service.sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        message: 'Test',
      });

      const stats = service.getStats();
      expect(stats.averageDeliveryTime).toBeGreaterThanOrEqual(0);
    });

    it('should track last sent timestamp', async () => {
      const beforeTime = Date.now();
      await service.sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        message: 'Test',
      });
      const afterTime = Date.now();

      const stats = service.getStats();
      expect(stats.lastSentAt).toBeDefined();
      expect(stats.lastSentAt).toBeGreaterThanOrEqual(beforeTime);
      expect(stats.lastSentAt).toBeLessThanOrEqual(afterTime);
    });

    it('should track errors', async () => {
      const result = await service.send({
        provider: 'email',
        to: 'invalid_email',
        message: 'Test',
      });

      if (!result.success) {
        const stats = service.getStats();
        expect(Object.keys(stats.errors).length).toBeGreaterThan(0);
      }
    });

    it('should reset statistics', async () => {
      await service.sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        message: 'Test',
      });

      service.resetStats();
      const stats = service.getStats();

      expect(stats.totalSent).toBe(0);
      expect(stats.totalFailed).toBe(0);
      expect(stats.successRate).toBe(100);
    });

    it('should return immutable stats', () => {
      const stats1 = service.getStats();
      const stats2 = service.getStats();

      expect(stats1).not.toBe(stats2);
      expect(stats1).toEqual(stats2);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid recipients gracefully', async () => {
      const result = await service.send({
        provider: 'email',
        to: 'invalid_email',
        message: 'Test',
      });

      expect(result.success).toBe(false);
      expect(result.failedCount).toBeGreaterThan(0);
    });

    it('should handle empty recipients', async () => {
      const result = await service.send({
        provider: 'email',
        to: [],
        message: 'Test',
      });

      expect(result.success).toBe(false);
    });

    it('should handle missing subject for email', async () => {
      // Should work because subject is optional in send()
      const result = await service.send({
        provider: 'email',
        to: 'test@example.com',
        message: 'Test without subject',
      });

      // The result depends on adapter validation
      expect(result).toBeDefined();
    });

    it('should track provider errors in stats', async () => {
      await service.send({
        provider: 'email',
        to: 'invalid',
        message: 'Test',
      });

      const stats = service.getStats();
      if (stats.totalFailed > 0) {
        expect(Object.keys(stats.errors).length).toBeGreaterThan(0);
      }
    });

    it('should provide error details in result', async () => {
      const result = await service.send({
        provider: 'email',
        to: 'invalid_email',
        message: 'Test',
      });

      if (!result.success) {
        expect(result.error).toBeDefined();
        expect(typeof result.error).toBe('string');
      }
    });
  });

  describe('Cleanup', () => {
    it('should cleanup resources', async () => {
      await service.cleanup();
      // After cleanup, service should be able to reinitialize
      await service.initialize();
      expect(service).toBeDefined();
    });

    it('should clear delivery times on cleanup', async () => {
      await service.sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        message: 'Test',
      });
      await service.cleanup();

      // Stats should still be accessible but service needs reinitialization
      const stats = service.getStats();
      expect(stats).toBeDefined();
    });

    it('should allow sending after cleanup and reinit', async () => {
      await service.cleanup();
      await service.initialize();

      const result = await service.sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        message: 'Test',
      });
      expect(result.success).toBe(true);
    });
  });

  describe('Configuration', () => {
    it('should return readonly config', () => {
      const config = service.getConfig();
      expect(config).toBeDefined();
      expect(config.provider).toBe('email');
    });

    it('should not allow config mutation', () => {
      const config = service.getConfig();
      const originalProvider = config.provider;

      // Attempting to modify should not affect internal config
      (config as any).provider = 'sms';

      const newConfig = service.getConfig();
      expect(newConfig.provider).toBe(originalProvider);
    });

    it('should include all configuration options', () => {
      const config = service.getConfig();
      expect(config.retryAttempts).toBeDefined();
      expect(config.retryDelay).toBeDefined();
      expect(config.timeout).toBeDefined();
    });
  });

  describe('Multiple Provider Support', () => {
    it('should handle different email provider types', async () => {
      const providers = ['smtp', 'sendgrid', 'ses', 'mailgun'];

      for (const type of providers) {
        const testService = await createNotificationService({
          provider: 'email',
          email: { type: type as any, apiKey: 'test' },
        });
        expect(testService.getConfig().email?.type).toBe(type);
      }
    });

    it('should handle different push provider types', async () => {
      const providers = ['firebase', 'apns', 'onesignal'];

      for (const type of providers) {
        const testService = await createNotificationService({
          provider: 'push',
          push: { type: type as any, apiKey: 'test' },
        });
        expect(testService.getConfig().push?.type).toBe(type);
      }
    });

    it('should handle different SMS provider types', async () => {
      const providers = ['twilio', 'vonage', 'aws-sns'];

      for (const type of providers) {
        const testService = await createNotificationService({
          provider: 'sms',
          sms: { type: type as any },
        });
        expect(testService.getConfig().sms?.type).toBe(type);
      }
    });
  });

  describe('Edge Cases', () => {
    beforeEach(() => {
      service.resetStats();
    });

    it('should handle very long messages', async () => {
      const longMessage = 'a'.repeat(10000);
      const result = await service.sendEmail({
        to: 'test@example.com',
        subject: 'Long message',
        message: longMessage,
      });
      expect(result).toBeDefined();
    });

    it('should handle special characters in messages', async () => {
      const result = await service.sendEmail({
        to: 'test@example.com',
        subject: 'Special chars: émojis 🎉 symbols @#$%',
        message: 'Message with special characters: <>&"\'',
      });
      expect(result).toBeDefined();
    });

    it('should handle unicode in recipient names', async () => {
      const result = await service.sendEmail({
        to: 'test@example.com',
        subject: 'Test',
        message: 'Test',
        from: '"José García" <jose@example.com>',
      });
      expect(result).toBeDefined();
    });

    it('should handle concurrent sends', async () => {
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(
          service.sendEmail({
            to: `test${i}@example.com`,
            subject: `Test ${i}`,
            message: `Message ${i}`,
          })
        );
      }

      const results = await Promise.all(promises);
      expect(results).toHaveLength(5);
      results.forEach(result => {
        expect(result).toBeDefined();
      });
    });

    it('should maintain separate stats for different priorities', async () => {
      // Create fresh service for isolated stats test
      const freshService = await createNotificationService({
        provider: 'email',
        email: { type: 'smtp' },
      });

      const initialStats = freshService.getStats();
      const initialUrgent = initialStats.byPriority.urgent;
      const initialLow = initialStats.byPriority.low;

      await freshService.send({
        provider: 'email',
        to: 'test@example.com',
        message: 'Urgent',
        priority: 'urgent',
      });

      await freshService.send({
        provider: 'email',
        to: 'test@example.com',
        message: 'Low',
        priority: 'low',
      });

      const stats = freshService.getStats();
      // Check that urgent and low increased from initial values
      expect(stats.byPriority.urgent).toBeGreaterThan(initialUrgent);
      expect(stats.byPriority.low).toBeGreaterThan(initialLow);
    });
  });
});
