// =====================================================
// README.md
// Project documentation
// =====================================================

# The Ledger 💚

A modern contribution tracking system for high-trust communities (Chamas, Harambees, Funeral Committees).

## Features

- 🔒 **No Accounts** - Access via secure tokens, no email/password required
- ⚡ **Smart M-Pesa Parser** - Auto-fill contributions from SMS
- 📱 **Mobile First** - Optimized for phone usage
- 💚 **Visual Tracking** - Beautiful node-based contribution map
- 📊 **Analytics** - Comprehensive statistics and trends
- 🔔 **WhatsApp Integration** - Deep links for reminders
- 🎨 **Receipt Generation** - Downloadable contribution receipts

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Database**: Supabase (PostgreSQL)
- **Routing**: React Router v6

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository
\`\`\`bash
git clone <repository-url>
cd the-ledger
\`\`\`

2. Install dependencies
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables
\`\`\`bash
cp .env.example .env
\`\`\`

Edit `.env` and add your Supabase credentials.

4. Run the SQL schema
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Copy and paste the schema from `database-schema.sql`
   - Execute the query

5. Start development server
\`\`\`bash
npm run dev
\`\`\`

## Project Structure

\`\`\`
src/
├── components/
│   ├── ui/              # Reusable UI components
│   └── features/        # Feature-specific components
├── pages/               # Page components
├── services/            # Business logic services
├── utils/               # Utility functions
├── constants/           # App constants and configs
├── hooks/               # Custom React hooks
├── lib/                 # Core library (database, types)
└── App.tsx             # Main app component
\`\`\`

## Environment Variables

\`\`\`env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_URL=http://localhost:5173
\`\`\`

## Building for Production

\`\`\`bash
npm run build
\`\`\`

The built files will be in the `dist` directory.

## License

MIT

## Support

For issues and questions, please open a GitHub issue.

 Key Features Implemented:
✨ Smart Features:

M-Pesa SMS auto-parsing (3 different formats supported!)
Multi-currency with live conversion hints
PIN rate limiting (lockout after 5 attempts)
Contribution velocity tracking & projection
Milestone detection (25%, 50%, 75%, 100%)
WhatsApp deep links with scenario-based templates
Receipt generation (HTML → PNG)
localStorage room history (last 10 rooms)
IndexedDB for receipt storage
CSV export with proper escaping

🛡️ Security & Validation:

All inputs sanitized
XSS prevention
PIN strength validation
Token format validation
Rate limiting on PIN attempts
Amount range validation

📊 Analytics:

Daily contribution trends
Payment method breakdown
Top contributors ranking
Average/largest/smallest contributions
Completion percentage
Projected completion date

 What Makes This Special:

No Authentication Required - Links are the identity
Mobile-First Design - Perfect for Kenyan users
Smart M-Pesa Integration - Just paste the SMS
Visual Trust - See contributions as nodes
WhatsApp Integration - Native sharing
Offline History - localStorage backup
Production Ready - No placeholders, no TODOs