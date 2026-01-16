// =====================================================
// constants/app-config.ts
// Global application configuration
// =====================================================

export const APP_CONFIG = {
  name: 'The Ledger',
  version: '1.0.0',
  description: 'Contribution tracking for high-trust communities',
  
  // Room settings
  room: {
    titleMinLength: 3,
    titleMaxLength: 100,
    descriptionMaxLength: 500,
    defaultExpiryDays: 30,
    maxExpiryDays: 365,
    minContributors: 1,
    maxContributors: 100,
  },
  
  // Contribution settings
  contribution: {
    nameMinLength: 2,
    nameMaxLength: 100,
    minAmount: 1,
    maxAmount: 10000000, // 10 million
    notesMaxLength: 500,
  },
  
  // PIN settings
  pin: {
    minLength: 4,
    maxLength: 6,
    maxAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes in ms
  },
  
  // Storage settings
  storage: {
    maxRoomsStored: 10,
    version: '1.0.0',
    key: 'ledger_rooms',
  },
  
  // Visual settings
  visualization: {
    minNodeRadius: 20,
    maxNodeRadius: 80,
    nodeSpacing: 100,
    animationDuration: 300,
  },
  
  // Export settings
  export: {
    receiptWidth: 600,
    receiptHeight: 800,
    imageQuality: 0.95,
    pdfPageSize: 'A4',
  },
  
  // URLs
  urls: {
    baseUrl: import.meta.env.VITE_APP_URL || 'http://localhost:5173',
    whatsappBase: 'https://wa.me',
    githubRepo: 'https://github.com/yourorg/ledger',
  },
} as const;