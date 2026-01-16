// =====================================================
// components/features/SmartPasteInput.tsx
// M-Pesa SMS smart paste component
// =====================================================

import React, { useState } from 'react';
import { TextArea } from '../ui/TextArea';
import { Button } from '../ui/Button';
import { Alert } from '../ui/Alert';
import { MpesaParserService } from '../../services/mpesa-parser.service';
import type { ParsedMpesaTransaction } from '../../services/mpesa-parser.service';

export interface SmartPasteInputProps {
  onParsed: (transaction: ParsedMpesaTransaction) => void;
  onManualEntry: () => void;
}

export const SmartPasteInput: React.FC<SmartPasteInputProps> = ({
  onParsed,
  onManualEntry,
}) => {
  const [smsText, setSmsText] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData('text');
    setSmsText(pastedText);
    
    // Auto-parse on paste
    setTimeout(() => handleParse(pastedText), 100);
  };

  const handleParse = (text?: string) => {
    setParsing(true);
    setParseError(null);

    const textToParse = text || smsText;

    if (!textToParse.trim()) {
      setParseError('Please paste an M-Pesa SMS message');
      setParsing(false);
      return;
    }

    const result = MpesaParserService.parseSMS(textToParse);

    if (result.success && result.transaction) {
      onParsed(result.transaction);
    } else {
      setParseError(result.error || 'Could not parse SMS. Please enter details manually.');
    }

    setParsing(false);
  };

  const handleTryExample = () => {
    const example = MpesaParserService.generateExampleSMS();
    setSmsText(example);
    handleParse(example);
  };

  return (
    <div className="space-y-4">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-sm font-semibold text-green-800 mb-1">
              Smart Paste
            </h3>
            <p className="text-sm text-green-700">
              Paste your M-Pesa confirmation SMS below, and we'll automatically fill in the details for you!
            </p>
          </div>
        </div>
      </div>

      <TextArea
        placeholder="Paste M-Pesa SMS here... (e.g., RGH7K2L9XM Confirmed. Ksh5,000.00 sent to John Kamau...)"
        value={smsText}
        onChange={(e) => setSmsText(e.target.value)}
        onPaste={handlePaste}
        rows={4}
        className="font-mono text-sm"
      />

      {parseError && (
        <Alert type="warning">
          {parseError}
        </Alert>
      )}

      <div className="flex gap-3">
        <Button
          onClick={() => handleParse()}
          loading={parsing}
          disabled={!smsText.trim()}
          variant="primary"
        >
          Parse SMS
        </Button>
        <Button
          onClick={onManualEntry}
          variant="secondary"
        >
          Enter Manually
        </Button>
        <Button
          onClick={handleTryExample}
          variant="ghost"
        >
          Try Example
        </Button>
      </div>
    </div>
  );
};
