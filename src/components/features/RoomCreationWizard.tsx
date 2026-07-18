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
import { CURRENCY_LIST } from '../../lib/constants';
import type { CreateRoomDTO, Currency } from '../../lib/types';

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
          <div className="flex justify-between items-center mb-3">
             <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Step {step} of {totalSteps}
            </span>
            <span className="text-xs font-medium text-green-700 bg-green-50 px-3 py-1 rounded-full">
              {step === 1 ? 'Basics' : step === 2 ? 'Goal' : 'Security'}
            </span>
          </div>
          
          <ProgressBar value={progress} className="mt-1 h-2" />
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                What are you collecting for?
              </label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                error={errors.title}
                placeholder="e.g., Sarah's Wedding, Office Farewell Gift"
                required
                autoFocus
              />
              {errors.title && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  {errors.title}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Tell your members what it's for <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <TextArea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                error={errors.description}
                placeholder="e.g., Please contribute by Dec 15th. Send M-Pesa to 0712 345 678."
                rows={4}
              />
              {errors.description && (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  {errors.description}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Financial Details */}
        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Which currency?
              </label>
              <Select
                options={currencyOptions}
                value={formData.currency}
                onChange={(value) => setFormData({ ...formData, currency: value as Currency })}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Set a target <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.targetAmount || ''}
                onChange={(e) => setFormData({ ...formData, targetAmount: parseFloat(e.target.value) || undefined })}
                error={errors.targetAmount}
                placeholder="Leave empty for open-ended collection"
              />
              {errors.targetAmount ? (
                <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                  {errors.targetAmount}
                </p>
              ) : (
                <p className="mt-2 text-xs text-slate-500">A target helps your group see how close you are.</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Lock after how many days?
              </label>
              <Input
                type="number"
                min="1"
                max="365"
                value={formData.expiresInDays}
                onChange={(e) => setFormData({ ...formData, expiresInDays: parseInt(e.target.value) || 30 })}
                hint="The room becomes read-only after this period."
              />
            </div>
          </div>
        )}

        {/* Step 3: Security */}
        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-2">
              <div className="flex gap-3">
                <span className="text-2xl shrink-0">🔐</span>
                <div>
                  <h3 className="font-semibold text-amber-900 mb-1">
                    Lock your room with a PIN
                  </h3>
                  <p className="text-sm text-amber-800 leading-relaxed">
                    You'll need this PIN plus your admin link to add payments later. Keep it somewhere safe — there's no password reset by design.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Create a 4-digit PIN
              </label>
              <Input
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
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Confirm PIN
              </label>
              <Input
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