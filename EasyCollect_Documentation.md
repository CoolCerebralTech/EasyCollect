## Project Documentation: The Ledger (Contribution Room)

### 1. Project Overview & Purpose

The Ledger is a community-focused, mobile-first web application designed to simplify financial coordination for Kenyan informal groups like Chamas, Harambees, and fundraisers. It aims to provide a transparent and easy-to-use platform for tracking contributions, replacing manual methods like spreadsheets and WhatsApp messages.

### 2. Core Philosophy & Value Proposition

*   **Trust-First:** Emphasizes transparency and security without handling actual funds directly.
*   **Link-Based Access:** Utilizes steward (editable) and viewer (read-only) links, eliminating the need for user accounts or app downloads for members.
*   **Visual Momentum:** Uses visualizations to encourage participation.
*   **Low Friction Experience:** Optimized for mobile sharing and seamless integration with M-Pesa workflows.

### 3. Key Features & Functionalities

*   **Room Creation:** Users can create new contribution rooms via a wizard, setting a title, description, target amount, and currency.
*   **Contribution Tracking:**
    *   **SMART M-Pesa Paste:** Parses M-Pesa SMS messages to automatically extract sender, amount, and transaction code. This is handled by `mpesa-parser.service.ts`.
    *   **Manual Entry:** Allows Stewards to manually add contributions.
    *   **Contribution Form:** (`ContributionForm.tsx`) captures payment details.
*   **Data Visualization:**
    *   **Visual Contribution Map:** (`VisualContributionMap.tsx`) uses an SVG-based node map to visualize contributions, potentially showing progress towards the goal.
    *   **Contribution Timeline:** (`ContributionTimeline.tsx`) displays contributions chronologically.
    *   **Statistics Dashboard:** (`StatisticsDashboard.tsx`) provides analytics on contributions, contributors, and progress, powered by `analytics.service.ts`.
*   **Room Management:**
    *   **Steward/Viewer Roles:** Access is controlled via unique links. Stewards manage the room, while Viewers can only see contributions.
    *   **PIN Gate:** Stewards must enter a PIN to access editing functionalities, enhancing security. Handled by `PINGate.tsx`.
    *   **Room Sharing:** Facilitates sharing the public viewer link via WhatsApp (`ShareRoomModal.tsx`, `whatsapp.service.ts`).
*   **Offline Capabilities:** The application is designed with an offline-first architecture, queuing updates locally using `useOfflineQueue.ts` and syncing when connectivity is restored.
*   **Data Persistence:** Uses `LocalStorageService.ts` for session data and room history, and potentially IndexedDB for receipts.
*   **Receipt Generation:** Creates downloadable PNG receipts for contributions (`receipt-generator.service.ts`).
*   **Notifications:** Uses `NotificationService.ts` to manage deadline status and other alerts.

### 4. Technology Stack & Architecture

*   **Frontend Framework:** React 18 with Vite for build tooling.
*   **Language:** TypeScript for type safety.
*   **Styling:** Tailwind CSS for utility-first CSS, with a custom design system implemented in `src/components/ui`.
*   **State Management:** Primarily React Hooks and Context API, with `zustand` also listed as a dependency.
*   **Backend:** Supabase is used for the database (PostgreSQL).
*   **Database Interaction:** Utilizes Supabase RPC functions (`db.service.ts`) for data operations, enforcing security via Row Level Security (RLS) on tables. This is a key aspect of their "Serverless Fortress" security model, avoiding standard Supabase Auth.
*   **Utilities:** Various utility functions for formatting (dates, currencies), validation, token generation, and color manipulation.
*   **Hooks:** Custom hooks (`useRoom`, `useContributions`, `useContributionSearch`, `useLocalStorage`, etc.) abstract complex logic and state management.

### 5. Security Model ("Serverless Fortress")

*   **No `auth.users`:** Supabase authentication is not used.
*   **Token-Based Access:** Access is granted solely via unique UUID tokens in the URL (steward\_token, viewer\_token).
*   **RPC Gatekeepers:** Frontend cannot directly query tables; it must call specific RPC functions (e.g., `get_room_details(token)`).
*   **RLS Enforcement:** Database functions and RLS policies control data access based on the provided token and role.
*   **PIN Protection:** Sensitive actions by Stewards are protected by a hashed PIN stored within the database.

### 6. Project Structure

The project follows a clean, organized structure:
*   `src/components/`: UI primitives and feature-specific components.
*   `src/hooks/`: Custom React hooks.
*   `src/lib/`: Database types and constants.
*   `src/pages/`: Route-level components.
*   `src/services/`: Business logic, API interactions, and utility services.
*   `src/utils/`: Helper functions.
*   Root: Configuration files (`.env`, `package.json`, `vite.config.ts`, `tailwind.config.js`, etc.) and static assets.

### 7. Development & Contribution Guidelines

*   **Consistency:** Business logic should reside in `services/`, not components.
*   **Styling:** Use provided UI primitives (`src/components/ui`) for consistency.
*   **Types:** Update `src/lib/app.types.ts` when modifying database schemas.

---

**Next Steps & Potential Areas for Improvement/Debugging:**

Based on the code analysis, here are some areas that might benefit from further attention, debugging, or upgrades:

1.  **Supabase RPC Functions:** The documentation and code rely heavily on custom RPC functions in Supabase. Understanding these functions (their implementation in SQL and how they are called) is crucial for debugging backend-related issues.
2.  **Error Handling:** While some error handling is present (e.g., `try-catch` blocks, `Alert` components), a more robust, centralized error management strategy could be beneficial, especially for network failures or Supabase-specific errors.
3.  **State Management:** For larger projects, consider if React Context is sufficient or if a more specialized state management library (like Zustand, which is a dependency) might be leveraged more consistently for complex global states.
4.  **M-Pesa Parsing Logic:** The `mpesa-parser.service.ts` likely uses regular expressions. These can be brittle if M-Pesa SMS formats change. Ensuring this parsing is robust or has fallback mechanisms could be valuable.
5.  **Offline Sync Logic:** Thoroughly test the offline queuing and syncing mechanism (`useOfflineQueue.ts`) to ensure data integrity under various network conditions.
6.  **Security Model:** While innovative, the token-based security model requires careful implementation of RLS and RPC functions. Auditing these Supabase-side configurations would be essential for long-term security.
7.  **Testing:** Adding comprehensive unit and integration tests (especially for services and complex hooks) would significantly improve maintainability and reliability.

**To proceed with Debugging and Upgrades:**

To effectively debug or plan upgrades, I need to be able to run the project. Could you confirm if the Supabase URL and key I have are correct, and if there are any specific commands needed to start the Supabase services locally or to interact with them?

Once the project can be run, I can start identifying and addressing specific issues or implementing planned upgrades.

Let me know your thoughts!