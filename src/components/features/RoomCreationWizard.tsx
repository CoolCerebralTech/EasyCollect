// =====================================================
// components/features/RoomCreationWizard.tsx
// Multi-step wizard for creating rooms
// =====================================================

import React, { useState } from 'react';
import { Input } from '../ui/Input';
import { TextArea } from '../ui/TextArea';
import { Select, type SelectOption } from '../ui/Select';
import { Button } from '../ui/Button';
import { ProgressBar } from '../ui/ProgressBar';
import { ValidationService } from '../../services/validation.service';
import { CURRENCY_LIST } from '../../constants/currencies';
import type { CreateRoomDTO, Currency } from '../../lib/app.types';

export interface RoomCreationWizardProps {
  onSubmit: (data: CreateRoomDTO) => Promise<void>;
  onCancel?: () => void;
  // ✅ Added proper prop to receive loading state from parent
  isSubmitting?: boolean;
}

export const RoomCreationWizard: React.FC<RoomCreationWizardProps> = ({
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<CreateRoomDTO>>({
    title: '',
    description: '',
    targetAmount: undefined,
    currency: 'KES',
    pin: '',
    expiresInDays: 30,
  });
  const [pinConfirm, setPinConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const currencyOptions: SelectOption[] = CURRENCY_LIST.map(c => ({
    value: c.code,
    label: `${c.flag} ${c.code} - ${c.name}`,
  }));

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};

    const titleValidation = ValidationService.validateTitle(formData.title || '');
    if (!titleValidation.isValid) {
      newErrors.title = titleValidation.error || 'Invalid title';
    }

    const descValidation = ValidationService.validateDescription(formData.description || '');
    if (!descValidation.isValid) {
      newErrors.description = descValidation.error || 'Invalid description';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (formData.targetAmount) {
      const amountValidation = ValidationService.validateTargetAmount(formData.targetAmount);
      if (!amountValidation.isValid) {
        newErrors.targetAmount = amountValidation.error || 'Invalid amount';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: Record<string, string> = {};

    const pinValidation = ValidationService.validatePIN(formData.pin || '');
    if (!pinValidation.isValid) {
      newErrors.pin = pinValidation.error || 'Invalid PIN';
    }

    if (formData.pin !== pinConfirm) {
      newErrors.pinConfirm = 'PINs do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    let isValid = false;

    switch (step) {
      case 1:
        isValid = validateStep1();
        break;
      case 2:
        isValid = validateStep2();
        break;
      case 3:
        isValid = validateStep3();
        break;
    }

    if (isValid) {
      if (step < totalSteps) {
        setStep(step + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setErrors({});
    }
  };

  const handleSubmit = async () => {
    // We rely on the parent (CreateRoomPage) to handle the async call state
    // via the isSubmitting prop
    await onSubmit(formData as CreateRoomDTO);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* We use standard div instead of Card if parent provides container style, 
          but keeping Card here if it's reused elsewhere. 
          If styling duplicates, you can remove <Card> wrapper. */}
      <div>
        <div className="mb-6">
          <div className="flex justify-between items-end mb-2">
             <h2 className="text-xl font-bold text-gray-900">
              Create New Room
            </h2>
            <span className="text-sm font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
              Step {step} of {totalSteps}
            </span>
          </div>
          
          <ProgressBar value={progress} className="mt-2 h-2" />
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <Input
              label="Room Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              error={errors.title}
              placeholder="e.g., Wedding Committee, Office Party"
              required
              autoFocus
            />

            <TextArea
              label="Description (Optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              error={errors.description}
              placeholder="Add details about this contribution..."
              rows={4}
            />
          </div>
        )}

        {/* Step 2: Financial Details */}
        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <Select
              label="Currency"
              options={currencyOptions}
              value={formData.currency}
              onChange={(value) => setFormData({ ...formData, currency: value as Currency })}
            />

            <Input
              label="Target Amount (Optional)"
              type="number"
              step="0.01"
              min="0"
              value={formData.targetAmount || ''}
              onChange={(e) => setFormData({ ...formData, targetAmount: parseFloat(e.target.value) || undefined })}
              error={errors.targetAmount}
              placeholder="Leave empty for open-ended collection"
              hint="Setting a target helps track progress"
            />

            <Input
              label="Expires in (days)"
              type="number"
              min="1"
              max="365"
              value={formData.expiresInDays}
              onChange={(e) => setFormData({ ...formData, expiresInDays: parseInt(e.target.value) || 30 })}
              hint="Room will become read-only after this period"
            />
          </div>
        )}

        {/* Step 3: Security */}
        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
              <div className="flex gap-3">
                <span className="text-xl">🔐</span>
                <div>
                  <h3 className="font-semibold text-amber-900 mb-1">
                    Secure Your Room
                  </h3>
                  <p className="text-sm text-amber-800 leading-relaxed">
                    Create a PIN to protect admin access. You will need this PIN (plus the admin link) to edit the room later.
                  </p>
                </div>
              </div>
            </div>

            <Input
              label="Create PIN (4 digits)"
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={formData.pin}
              onChange={(e) => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '') })}
              error={errors.pin}
              placeholder="••••"
              required
              className="text-center text-xl tracking-widest"
            />

            <Input
              label="Confirm PIN"
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              value={pinConfirm}
              onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, ''))}
              error={errors.pinConfirm}
              placeholder="••••"
              required
              className="text-center text-xl tracking-widest"
            />
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-8 pt-6 border-t border-slate-100">
          {step > 1 ? (
            <Button
              variant="secondary"
              onClick={handleBack}
              disabled={isSubmitting}
            >
              Back
            </Button>
          ) : (
             // Show cancel only on first step
             onCancel && (
              <Button
                variant="ghost"
                onClick={onCancel}
              >
                Cancel
              </Button>
            )
          )}
          
          <Button
            onClick={handleNext}
            loading={isSubmitting}
            fullWidth
            className="flex-1"
          >
            {step === totalSteps ? 'Create Room' : 'Next Step'}
          </Button>
        </div>
      </div>
    </div>
  );
};