import { describe, it, expect, beforeEach } from 'vitest';
import { FormBuilderService, createFormBuilderService } from '../service';
import { FormBuilderError } from '../errors';

describe('FormBuilderService', () => {
  let service: FormBuilderService;

  beforeEach(async () => {
    service = await createFormBuilderService({
      validateOnChange: true,
    });
  });

  describe('Form Creation', () => {
    it('should create form', () => {
      const form = service.createForm({
        fields: [
          { name: 'email', type: 'email', required: true },
          { name: 'password', type: 'password', required: true },
        ],
      });
      expect(form).toBeDefined();
      expect(form.getFields()).toHaveLength(2);
    });

    it('should validate required fields', () => {
      const form = service.createForm({
        fields: [
          { name: 'email', type: 'email', required: true },
        ],
      });
      form.validate();
      const errors = form.getErrors();
      expect(errors.email).toBeDefined();
    });
  });

  describe('Field Validation', () => {
    it('should validate email format', () => {
      const form = service.createForm({
        fields: [
          { name: 'email', type: 'email', required: true },
        ],
      });
      form.setValue('email', 'invalid');
      form.validate();
      const errors = form.getErrors();
      expect(errors.email).toBeDefined();
    });

    it('should accept valid email', () => {
      const form = service.createForm({
        fields: [
          { name: 'email', type: 'email', required: true },
        ],
      });
      form.setValue('email', 'test@example.com');
      form.validate();
      const errors = form.getErrors();
      expect(errors.email).toBeUndefined();
    });

    it('should validate number fields', () => {
      const form = service.createForm({
        fields: [
          { name: 'age', type: 'number', min: 18, max: 100 },
        ],
      });
      form.setValue('age', 15);
      form.validate();
      const errors = form.getErrors();
      expect(errors.age).toBeDefined();
    });
  });

  describe('Dynamic Fields', () => {
    it('should add field', () => {
      const form = service.createForm({ fields: [] });
      form.addField({ name: 'newField', type: 'text' });
      expect(form.getFields()).toHaveLength(1);
    });

    it('should remove field', () => {
      const form = service.createForm({
        fields: [{ name: 'field1', type: 'text' }],
      });
      form.removeField('field1');
      expect(form.getFields()).toHaveLength(0);
    });
  });

  describe('Form Values', () => {
    it('should set field value', () => {
      const form = service.createForm({
        fields: [{ name: 'email', type: 'email' }],
      });
      form.setValue('email', 'test@example.com');
      expect(form.getValue('email')).toBe('test@example.com');
    });

    it('should get all values', () => {
      const form = service.createForm({
        fields: [
          { name: 'email', type: 'email' },
          { name: 'name', type: 'text' },
        ],
      });
      form.setValue('email', 'test@example.com');
      form.setValue('name', 'John');
      const values = form.getValues();
      expect(values.email).toBe('test@example.com');
      expect(values.name).toBe('John');
    });
  });

  describe('Form Submission', () => {
    it('should trigger submit handler', () => {
      let submitted = false;
      const form = service.createForm({
        fields: [{ name: 'email', type: 'email', required: true }],
      });
      form.onSubmit((values) => {
        submitted = true;
      });
      form.setValue('email', 'test@example.com');
      form.submit();
      expect(submitted).toBe(true);
    });

    it('should prevent submit if invalid', () => {
      let submitted = false;
      const form = service.createForm({
        fields: [{ name: 'email', type: 'email', required: true }],
      });
      form.onSubmit(() => {
        submitted = true;
      });
      form.submit();
      expect(submitted).toBe(false);
    });
  });

  describe('Statistics', () => {
    it('should track form operations', () => {
      const form = service.createForm({ fields: [] });
      form.addField({ name: 'test', type: 'text' });
      const stats = service.getStats();
      expect(stats.totalForms).toBe(1);
    });
  });
});
