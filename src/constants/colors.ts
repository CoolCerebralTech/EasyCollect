// =====================================================
// src/constants/colors.ts
// Color scheme for visualizations
// =====================================================

export const COLORS = {
  // Primary palette (Safaricom inspired)
  primary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#00A651', // Main Safaricom green
    600: '#009944',
    700: '#007d37',
    800: '#00632c',
    900: '#004d22',
  },
  
  // Status colors
  status: {
    confirmed: '#10B981', // Green-500
    pledged: '#F59E0B',   // Amber-500
    cancelled: '#EF4444', // Red-500
    active: '#00A651',
    archived: '#6B7280',
    closed: '#374151',
  },
  
  // Payment method colors
  payment: {
    MPESA: '#00A651',
    AIRTEL: '#ED1C24',
    BANK: '#3B82F6',
    CASH: '#10B981',
    OTHER: '#6B7280',
  },
  
  // Steward mode alert (Admin Mode)
  steward: {
    bg: '#FFF7ED',    // Orange-50
    border: '#FB923C', // Orange-400
    text: '#C2410C',   // Orange-700
  },
  
  // Node visualization (D3/Canvas)
  node: {
    empty: '#E5E7EB',
    pending: '#FCD34D',
    confirmed: '#10B981',
    selected: '#8B5CF6',
  },
} as const;