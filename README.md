📂 Project: Contribution Room (Internal Name: "The Ledger")

Status: High Priority / Full Build
Stack: React (Vite/TS), Tailwind, Supabase (No Auth)

1. Product Philosophy

We are building a contribution visualization tool optimized for high-trust, informal communities (Chamas, Harambees, Funeral Committees).

The Golden Rules:

No Accounts: We do not ask for email, password, or phone number verification.

Rooms, not Users: The atomic unit of the app is the "Room."

Link is Identity: Your permission level is determined solely by the URL you possess.

Visual Trust: We replace spreadsheets with visual nodes and timelines to create social momentum.

2. Core Architecture: "The Two-Link System"

We are abandoning traditional RBAC (Role-Based Access Control) for a Token-Based Access system.

A. The Steward (Admin)

Access: via domain.com/room/[steward-token]

Capabilities: Create room, edit settings, add/edit payments, delete payments, close room.

Security Layer: To prevent accidental sharing of the admin link, accessing this route must require a 4-digit PIN (set during creation).

B. The Witness (Viewer)

Access: via domain.com/room/[viewer-token]

Capabilities: View timeline, view visualization, export summary, download receipt.

Restriction: Read-only.

3. Feature Specifications (The "Must-Haves")
Feature 1: The "Smart Paste" Input

The Steward should never manually type a transaction if they have the SMS.

UI: A text area labeled "Paste M-Pesa SMS or Type Manually".

Logic:

User pastes text.

System runs Regex to detect: Code, Amount, Sender Name, Time.

Auto-fills the input fields.

Steward confirms and saves.

Regex Pattern (Reference):

code
Regex
download
content_copy
expand_less
([A-Z0-9]{10})\sConfimed\.\sKsh([0-9,.]+)\ssent\sto\s(.+)\son\s(\d{1,2}/\d{1,2}/\d{2})\sat\s(\d{1,2}:\d{2}\s[AP]M)
Feature 2: Visual Contribution Map

Instead of a list, we show momentum.

Component: Canvas/SVG based layout.

Logic:

Gray Node: A generic "potential" slot (if target amount exists) or omitted entirely in "Open Mode".

Green Node: A confirmed payment.

Node Radius: Proportional to contribution_amount.

Interaction: Clicking a node opens the details card (Name, Time, Amount).

Feature 3: The "Soft Reminder" Generator

We do not integrate with WhatsApp Business API. We use Deep Links.

UI: A "Remind" button next to a pledged/unpaid member (or generic reminder for group).

Logic:

App checks current_date vs deadline_date.

App selects template:

Scenario A (Early): "Hi [Name], just a gentle reminder for the contribution..."

Scenario B (Urgent): "Hey [Name], we are finalizing the list today..."

Scenario C (Late): "Hi [Name], we missed your contribution..."

Action: Triggers window.open('https://wa.me/?text=[encoded_message]').

Feature 4: Social Receipt Cards

Digital bragging rights.

Trigger: Viewer clicks on their own transaction -> "Get Receipt".

Output: Generates a downloadable PNG (using html-to-image or similar).

Design: Professional card showing: "Certified Contribution," Room Name, Amount, Date, and a QR code linking back to the Room.

Feature 5: LocalStorage History

Since there are no accounts, we must prevent Stewards from losing their links.

Logic:

On Room Create, save room_id, title, and steward_token to browser localStorage.

On Home Page load, check localStorage.

Display: "Resume Active Rooms" list.

4. Technical Implementation & Database
Database Schema (Supabase / PostgreSQL)

We need strict Row Level Security (RLS) or Rpc-based access because we have no auth.uid().

Table: rooms

code
SQL
download
content_copy
expand_less
id              UUID PK
title           TEXT
description     TEXT
target_amount   NUMERIC (Optional)
currency        TEXT (Default 'KES')
steward_token   UUID (Index, Secret)
viewer_token    UUID (Index, Public)
pin_hash        TEXT (Bcrypt hash of the 4-digit PIN)
status          TEXT ('active', 'archived')
created_at      TIMESTAMPTZ
expires_at      TIMESTAMPTZ
settings        JSONB (e.g., { "allow_pledges": true })

Table: contributions

code
SQL
download
content_copy
expand_less
id              UUID PK
room_id         UUID FK -> rooms.id
name            TEXT
amount          NUMERIC
payment_method  TEXT ('MPESA', 'CASH')
transaction_ref TEXT (Optional, e.g., M-Pesa Code)
status          TEXT ('confirmed', 'pledged')
confirmed_at    TIMESTAMPTZ
notes           TEXT
Security Logic (The "Link-Native" approach)

Since we are not using Supabase Auth, we cannot use standard RLS policies based on user ID. We will use PostgreSQL Functions (RPC) for all sensitive operations to ensure the token is validated on the server side.

1. Viewing Data (Viewer Token)

Create a Postgres Function get_room_details(token_input uuid).

Logic: Selects data only if rooms.viewer_token OR rooms.steward_token matches input.

2. Modifying Data (Steward Token)

Create Postgres Functions: add_contribution, update_contribution.

Logic: Each function accepts steward_token_input.

Validation: IF (SELECT count(*) FROM rooms WHERE steward_token = steward_token_input) = 0 THEN RAISE EXCEPTION 'Unauthorized';

3. The PIN Challenge

The UI for the Steward Link asks for a PIN first.

The frontend compares the hash (or sends PIN to server to validate) before unlocking the "Edit" UI.

5. Development Roadmap (No MVPs, Parallel Build)

Phase 1: The Engine (Backend & Logic)

Set up Supabase project.

Implement the SQL Tables.

Write the RPC functions (Server-side logic for token validation).

Test: Ensure you cannot edit a room using the Viewer Token.

Phase 2: The Steward Experience

Room Creation Wizard (Title -> Target -> PIN).

The Dashboard (Timeline View).

Complex Task: Implement the "Smart Paste" M-Pesa Parser.

Phase 3: The Viewer Experience

Read-only view.

The "Visual Nodes" Component (D3.js or simple SVG).

Receipt Generation (Canvas API).

Phase 4: Polish & Resilience

LocalStorage implementation for history.

WhatsApp deep-linking logic.

Edge cases: What happens if the room expires? (Make it Read-Only).

6. Design System Guidelines (Tailwind)

Vibe: Clean, Trustworthy, "Kenyan Modern".

Colors:

Primary: Safaricom Green variants (Trust/Money).

Steward Mode Alert: Burnt Orange (Warning: You are Admin).

Pending/Pledged: Slate Gray.

Typography: Large, legible sans-serif (Inter or DM Sans).

Mobile First: 100% of users are on phones. Buttons must be thumb-friendly (48px height min).

7. Immediate Next Steps

Backend Lead: Initialize Supabase and script the RPC security functions.

Frontend Lead: Set up the routing logic (/room/:token) and the PIN barrier.

Let's build the standard for informal finance.