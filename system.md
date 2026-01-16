📂 Project Structure: src/
src/
├── assets/              # Static files (logos, illustrations)
├── components/          # React Components
│   ├── common/          # Reusable UI (Buttons, Cards, Modals - "Atoms")
│   ├── layout/          # Page wrappers (StewardLayout, ViewerLayout)
│   ├── features/        # Complex blocks (Timeline, VisualMap, SmartPaste)
│   └── ui/              # If using Shadcn/UI or HeadlessUI, put them here
├── hooks/               # Custom React Hooks (useDebounce, useMediaQuery)
├── lib/                 # Third-party configurations (Supabase, Utils)
├── logic/               # Pure business logic (M-Pesa Regex, Reminder Generators)
├── pages/               # Route components (Home, RoomViewer, StewardDashboard)
├── services/            # API/Supabase calls (separation of concerns)
├── store/               # Global State (Zustand)
├── types/               # TypeScript Definitions (Interfaces, Enums)
├── App.tsx              # Main Entry + Routing Logic
└── main.tsx             # DOM rendering
📝 Detailed Breakdown (What goes where)

Here is exactly what files the team should create inside these folders.

1. src/lib/ (The Core Infrastructure)

This is for configuration and helper functions that don't contain "business rules."

supabaseClient.ts: Initialize the Supabase connection.

utils.ts: Class name merger (clsx/tailwind-merge) and basic formatters (currency).

constants.ts: Fixed values (e.g., maximum room life, default currency).

2. src/types/ (The Contract)

Since we are using TypeScript, nothing gets built until the types are defined.

database.types.ts: Auto-generated from Supabase.

index.ts: Application specific types.
// src/types/index.ts
export type RoomRole = 'steward' | 'viewer';

export interface Contribution {
  id: string;
  name: string;
  amount: number;
  status: 'confirmed' | 'pledged';
  confirmedAt: string;
}
3. src/logic/ (The "Brain" - Innovative Part)

This is where your unique features live. These should be pure TypeScript functions (no React code). This makes them easy to test.

mpesaParser.ts: The Regex logic that takes a raw SMS and returns { name, amount, code }.

reminderGenerator.ts: The function that takes a name + date and returns the "Soft Reminder" text.

4. src/services/ (The Data Layer)

Don't call Supabase directly inside your components. Wrap them here so you can change logic later easily.

roomService.ts: createRoom(), getRoomByToken().

contributionService.ts: addContribution(), markAsPaid().

5. src/store/ (State Management)

We use Zustand for simple global state.

useRoomStore.ts: Holds the currently loaded room data so you don't have to fetch it on every click.

6. src/components/ (The Visuals)

common/:

Button.tsx

Input.tsx

Card.tsx

features/ (The big unique pieces):

VisualMap/ (The D3/SVG node visualization).

Timeline/ (The vertical list of payments).

SmartInput/ (The text box that handles the M-Pesa paste).

🚀 Recommended tsconfig.json Path Aliases

To make the code look professional and avoid ../../../../, tell the team to add this to tsconfig.json (under compilerOptions):

"paths": {
  "@/*": ["./src/*"]
}

Note: You will need to install @types/node and configure vite.config.ts to support this.

🛠 Quick Start Commands for the Team

# 1. Init Project
npm create vite@latest contribution-room -- --template react-ts

