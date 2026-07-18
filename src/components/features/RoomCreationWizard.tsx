// =====================================================
// components/features/RoomCreationWizard.tsx
// Multi-step wizard for creating a group link.
// No jargon — "group link", "shared list", "collection" — never "ledger".
// Errors are graphic: red border + icon + animated message slide-in.
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
  isSubmitting?: boolean;
}

/** Graphic, glanceable error block — icon + message, animated in. */
const FieldError: React.FC<{ message?: string }> = ({ message }) => {
  if (!message) return null;
  return (
    <div className="mt-2 flex items-center gap-2 text-red-600 animate-fadeIn">
      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      </span>
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};

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

  const currencyOptions: SelectOption[] = CURRENCY_LIST.map((c) => ({
    value: c.code,
    label: `${c.flag} ${c.code} - ${c.name}`,
  }));

  const validateStep1 = (): boolean => {
    const newErrors: Record<string, string> = {};
    const titleValidation = ValidationService.validateTitle(formData.title || '');
    if (!titleValidation.isValid) newErrors.title = titleValidation.error || 'Please enter a name';
    const descValidation = ValidationService.validateDescription(formData.description || '');
    if (!descValidation.isValid)
      newErrors.description = descValidation.error || 'Please check the description';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (formData.targetAmount) {
      const v = ValidationService.validateTargetAmount(formData.targetAmount);
      if (!v.isValid) newErrors.targetAmount = v.error || 'Please check the amount';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = (): boolean => {
    const newErrors: Record<string, string> = {};
    const pinValidation = ValidationService.validatePIN(formData.pin || '');
    if (!pinValidation.isValid) newErrors.pin = pinValidation.error || 'Please enter a 4-digit PIN';
    if (formData.pin !== pinConfirm) newErrors.pinConfirm = 'PINs do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    let isValid = false;
    if (step === 1) isValid = validateStep1();
    else if (step === 2) isValid = validateStep2();
    else if (step === 3) isValid = validateStep3();
    if (isValid) {
      if (step < totalSteps) setStep(step + 1);
      else handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setErrors({});
    }
  };

  const handleSubmit = async () => {
    await onSubmit(formData as CreateRoomDTO);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div>
        {/* Step indicator */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Step {step} of {totalSteps}
            </span>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
              {step === 1 ? 'Basics' : step === 2 ? 'Goal' : 'Protect it'}
            </span>
          </div>
          <ProgressBar value={progress} className="mt-1 h-2" />
        </div>

        {/* ───────── Step 1: What are you collecting for? ───────── */}
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
                placeholder="e.g., Sarah's Wedding, Farewell Gift"
                required
                autoFocus
              />
              <FieldError message={errors.title} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Tell your members what it's for{' '}
                <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <TextArea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                error={errors.description}
                placeholder="e.g., Please pay by Dec 15th. Send M-Pesa to 0712 345 678."
                rows={4}
              />
              <FieldError message={errors.description} />
            </div>
          </div>
        )}

        {/* ───────── Step 2: Goal ───────── */}
        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Which currency?
              </label>
              <Select
                options={currencyOptions}
                value={formData.currency}
                onChange={(value) =>
                  setFormData({ ...formData, currency: value as Currency })
                }
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
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    targetAmount: parseFloat(e.target.value) || undefined,
                  })
                }
                error={errors.targetAmount}
                placeholder="Leave empty for open-ended collection"
              />
              <FieldError message={errors.targetAmount} />
              {!errors.targetAmount && (
                <p className="mt-2 text-xs text-slate-500">
                  A target helps everyone see how close you are.
                </p>
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
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    expiresInDays: parseInt(e.target.value) || 30,
                  })
                }
                hint="The list becomes read-only after this period."
              />
            </div>
          </div>
        )}

        {/* ───────── Step 3: Protect it ───────── */}
        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-2">
              <div className="flex gap-3">
                <span className="text-2xl shrink-0">🔐</span>
                <div>
                  <h3 className="font-semibold text-amber-900 mb-1">
                    Protect your link with a PIN
                  </h3>
                  <p className="text-sm text-amber-800 leading-relaxed">
                    You'll need this PIN plus your admin link to add payments later. Keep
                    it somewhere safe — there's no reset by design.
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
                onChange={(e) =>
                  setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '') })
                }
                error={errors.pin}
                placeholder="••••"
                required
                className="text-center text-xl tracking-widest"
              />
              <FieldError message={errors.pin} />
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
              <FieldError message={errors.pinConfirm} />
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-8 pt-6 border-t border-slate-100">
          {step > 1 ? (
            <Button variant="secondary" onClick={handleBack} disabled={isSubmitting}>
              Back
            </Button>
          ) : (
            onCancel && (
              <Button variant="ghost" onClick={onCancel}>
                Cancel
              </Button>
            )
          )}
          <Button onClick={handleNext} loading={isSubmitting} fullWidth className="flex-1">
            {step === totalSteps ? 'Create My Link' : 'Next Step'}
          </Button>
        </div>
      </div>
    </div>
  );
};
