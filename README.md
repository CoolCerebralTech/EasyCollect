💚 The Ledger: Contribution Room

Trust-First Financial Coordination for Communities.
No Accounts. No App Store. Just a Link.

The Ledger is a lightweight, mobile-first web application designed for Chamas, Harambees, Funeral Committees, and Short-term Fundraisers. It replaces Excel spreadsheets and WhatsApp lists with a live, visual, and transparent digital room.

🚀 Core Philosophy

Rooms, Not Users: We do not require emails, passwords, or phone verification. The "Room" is the atomic unit.

Link is Identity:

Steward Link: (Secret) Allows editing, marking payments, and settings. Protected by a PIN.

Viewer Link: (Public) Read-only access for the community to track progress.

Visual Trust: Contributions are visualized as a node map to create social momentum without shaming.

Low Friction: Optimized for WhatsApp sharing and M-Pesa behavior.

⚡ Key Features

SMART M-Pesa Paste: Copy an M-Pesa SMS -> Paste into the app -> It auto-extracts Name, Amount, and Code.

Visual Contribution Map: An SVG-based visualization where every contribution is a node.

Offline-First Architecture: Works with poor connectivity. Queues updates and syncs when online.

WhatsApp Integration: Deep links for reminders and sharing (no business API required).

Social Receipts: Generates downloadable PNG receipts for proof of payment.

Analytics Dashboard: Velocity tracking, daily trends, and completion projections.

🛠 Tech Stack

Frontend: React 18, Vite, TypeScript

Styling: Tailwind CSS (Custom Design System)

State Management: React Hooks + Context (No heavy Redux/Zustand)

Backend: Supabase (PostgreSQL)

Security: Row Level Security (RLS) via Postgres RPCs (No Supabase Auth)

Persistence: LocalStorage (Session) + IndexedDB (Receipts)

📂 Project Structure
code
Bash
download
content_copy
expand_less
src/
├── components/
│   ├── common/       # Reusable UI atoms (Button, Input, Card)
│   ├── features/     # Complex blocks (VisualMap, Timeline, Wizard)
│   └── layout/       # Page wrappers
├── constants/        # Config, Colors, Currencies
├── hooks/            # Custom React Hooks (useRoom, useOfflineQueue)
├── lib/              # Database clients and Types
├── pages/            # Route Views (Home, Room, Create)
├── services/         # Business Logic (M-Pesa Regex, Analytics, Storage)
└── utils/            # Helpers (Formatting, Colors, Validation)
🚦 Getting Started
1. Prerequisites

Node.js 18+

npm or yarn

2. Installation
code
Bash
download
content_copy
expand_less
# Clone the repository
git clone https://github.com/your-org/the-ledger.git

# Enter directory
cd the-ledger

# Install dependencies
npm install
3. Environment Setup

Create a .env file in the root directory:

code
Env
download
content_copy
expand_less
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_APP_URL=http://localhost:5173
4. Database Setup (Supabase)

Since we use a custom security model, you must run the SQL scripts provided in the /sql folder (or documented below) in your Supabase SQL Editor.

Enable Extensions: pgcrypto, uuid-ossp.

Create Tables: rooms, contributions, room_activity_log.

Create RPC Functions: This app relies on create_room, get_room_details, etc.

Enable RLS: Run the "Lockdown Script" to prevent direct API access to tables.

5. Run Local Server
code
Bash
download
content_copy
expand_less
npm run dev

Open http://localhost:5173 to see the app.

🔐 Security Model (The "Serverless Fortress")

This app uses a unique security architecture suitable for high-trust, low-tech environments:

No auth.users: We do not use Supabase Authentication.

Token-Based Access: Access is granted solely by possessing a UUID token in the URL.

RPC Gatekeepers:

The frontend cannot run SELECT * FROM rooms. It is blocked by RLS.

The frontend must call rpc/get_room_details(token).

The Database Function validates the token and decides what data to return (e.g., hiding the Steward Token if you are a Viewer).

PIN Protection: Sensitive write operations require a 4-6 digit PIN, hashed via bcrypt inside the database.

📱 Mobile Optimizations

Touch Targets: All buttons are min 48px height.

Whatsapp Friendly: Text receipts and share messages are pre-formatted for WhatsApp.

Data Saver: SVG visualizations are lightweight compared to heavy charts.

🤝 Contributing

Consistency: Use the services/ layer for logic. Do not write complex logic inside Components.

Styling: Use the src/components/ui primitives. Avoid writing raw Tailwind classes for buttons/inputs in feature files.

Types: Update src/types/index.ts if you modify the database schema.

📄 License

MIT License. Built for the Community.