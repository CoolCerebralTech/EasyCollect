// =====================================================
// components/features/ContributionForm.tsx
// Form for adding/editing contributions
// =====================================================

import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { Select, type SelectOption } from '../ui/Select';
import { TextArea } from '../ui/TextArea';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Divider } from '../ui/Divider';
import { SmartPasteInput } from './SmartPasteInput';
import { ValidationService } from '../../services/validation.service';
import { PAYMENT_METHODS } from '../../constants/payment-methods';
import type { AddContributionDTO, PaymentMethod, Currency } from '../../lib/app.types';
import type { ParsedMpesaTransaction } from '../../services/mpesa-parser.service';

export interface ContributionFormProps {
  onSubmit: (contribution: AddContributionDTO) => Promise<boolean>;
  currency: Currency;
  onCancel?: () => void;
  initialData?: Partial<AddContributionDTO>;
}

export const ContributionForm: React.FC<ContributionFormProps> = ({
  onSubmit,
  currency,
  onCancel,
  initialData,
}) => {
  const [mode, setMode] = useState<'smart' | 'manual'>('smart');
  const [formData, setFormData] = useState<Partial<AddContributionDTO>>({
    name: '',
    amount: 0,
    paymentMethod: 'MPESA',
    transactionRef: '',
    status: 'confirmed',
    notes: '',
    isAnonymous: false,
    ...initialData,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleSmartParse = (transaction: ParsedMpesaTransaction) => {
    setFormData({
      ...formData,
      name: transaction.sender,
      amount: transaction.amount,
      paymentMethod: 'MPESA',
      transactionRef: transaction.code,
      status: 'confirmed',
    });
    setMode('manual');
    setErrors({});
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const nameValidation = ValidationService.validateName(formData.name || '');
    if (!nameValidation.isValid) {
      newErrors.name = nameValidation.error || 'Invalid name';
    }

    const amountValidation = ValidationService.validateAmount(formData.amount || 0);
    if (!amountValidation.isValid) {
      newErrors.amount = amountValidation.error || 'Invalid amount';
    }

    const refValidation = ValidationService.validateTransactionRef(
      formData.transactionRef,
      formData.paymentMethod as PaymentMethod
    );
    if (!refValidation.isValid) {
      newErrors.transactionRef = refValidation.error || 'Invalid transaction reference';
    }

    const notesValidation = ValidationService.validateNotes(formData.notes);
    if (!notesValidation.isValid) {
      newErrors.notes = notesValidation.error || 'Notes too long';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    const success = await onSubmit(formData as AddContributionDTO);
    setSubmitting(false);

    if (success) {
      // Reset form
      setFormData({
        name: '',
        amount: 0,
        paymentMethod: 'MPESA',
        transactionRef: '',
        status: 'confirmed',
        notes: '',
        isAnonymous: false,
      });
      setMode('smart');
    }
  };

  const paymentMethodOptions: SelectOption[] = Object.values(PAYMENT_METHODS).map(pm => ({
    value: pm.id,
    label: `${pm.icon} ${pm.name}`,
  }));

  const statusOptions: SelectOption[] = [
    { value: 'confirmed', label: '✓ Confirmed' },
    { value: 'pledged', label: '⏳ Pledged' },
  ];

  return (
    <Card>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Add Contribution
      </h2>

      {mode === 'smart' ? (
        <SmartPasteInput
          onParsed={handleSmartParse}
          onManualEntry={() => setMode('manual')}
        />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Contributor Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
            placeholder="e.g., John Kamau"
            required
          />

          <Input
            label={`Amount (${currency})`}
            type="number"
            step="0.01"
            min="0"
            value={formData.amount || ''}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
            error={errors.amount}
            placeholder="0.00"
            required
          />

          <Select
            label="Payment Method"
            options={paymentMethodOptions}
            value={formData.paymentMethod}
            onChange={(value) => setFormData({ ...formData, paymentMethod: value as PaymentMethod })}
          />

          {PAYMENT_METHODS[formData.paymentMethod as PaymentMethod]?.requiresTransactionRef && (
            <Input
              label="Transaction Reference"
              value={formData.transactionRef}
              onChange={(e) => setFormData({ ...formData, transactionRef: e.target.value })}
              error={errors.transactionRef}
              placeholder={PAYMENT_METHODS[formData.paymentMethod as PaymentMethod].placeholder}
              required
            />
          )}

          <Select
            label="Status"
            options={statusOptions}
            value={formData.status}
            onChange={(value) => setFormData({ ...formData, status: value as 'confirmed' | 'pledged' })}
          />

          <TextArea
            label="Notes (Optional)"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            error={errors.notes}
            placeholder="Additional information..."
            rows={3}
          />

          <div className="flex items-center">
            <input
              type="checkbox"
              id="anonymous"
              checked={formData.isAnonymous}
              onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
              className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
            />
            <label htmlFor="anonymous" className="ml-2 text-sm text-gray-700">
              Mark as anonymous (name hidden from viewers)
            </label>
          </div>

          <Divider />

          <div className="flex gap-3">
            <Button type="submit" loading={submitting} fullWidth>
              Add Contribution
            </Button>
            {onCancel && (
              <Button type="button" variant="secondary" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>

          <Button
            type="button"
            variant="ghost"
            fullWidth
            onClick={() => setMode('smart')}
          >
            ← Back to Smart Paste
          </Button>
        </form>
      )}
    </Card>
  );
};