# Worth — Money, made clear.

<p align="center">
  <img src="public/favicon.png" alt="Worth Logo" width="96" height="96" />
</p>

<p align="center">
  <strong>A minimal, fast, and private personal finance tracker and friend settlement ledger.</strong>
</p>

<p align="center">
  <a href="#features"><img src="https://img.shields.io/badge/UX-Mobile--First-6366f1?style=for-the-badge" alt="Mobile First" /></a>
  <a href="#tech-stack"><img src="https://img.shields.io/badge/Stack-TanStack%20Start%20%7C%20React-06b6d4?style=for-the-badge" alt="TanStack Start" /></a>
  <a href="#tech-stack"><img src="https://img.shields.io/badge/TypeScript-5.0-3178c6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" /></a>
  <a href="#tech-stack"><img src="https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS v4" /></a>
  <a href="#privacy--offline-first"><img src="https://img.shields.io/badge/Privacy-100%25%20Offline-10b981?style=for-the-badge" alt="100% Offline" /></a>
</p>

---

## Overview

**Worth** is designed for everyday clarity. It eliminates the bloat of traditional accounting apps, intrusive bank-sync permissions, and paywalled dashboards in favor of speed, simplicity, and complete privacy.

Record an expense in under three seconds, glance at your real available balance, track friend debts and split bills effortlessly—all wrapped in a frosted **Midnight Glass** dark UI.

> [!NOTE]
> **100% Local & Private**: All data stays strictly on your device using local storage. No accounts required, no tracking, and no external servers storing your financial records.

---

## ✨ Key Features

### 🛡️ Available Balance & Privacy Shield
- **At-a-Glance Liquidity**: Instant total aggregated across all your active accounts (Banks, Cash, Wallets).
- **Privacy Mode**: Tap the eye toggle to mask your balance (`₹ •••••`) when in public or sharing your screen.
- **Stationary Toggle**: Right-anchored toggle button stays steady regardless of number length, preventing layout shifts.

### ⚡ Lightning-Fast Quick Add
- **Add Expense**: Enter amount, pick a category, and save in seconds.
- **Add Money**: Log income from Salary, Family, Freelance, or Refunds.
- **Split Bills**: Automatically split meals or purchases with friends evenly or with per-friend custom overrides.
- **Transfers**: Seamlessly shift funds between accounts without altering net worth or counting as an expense.
- **More Details**: Optional fields (dates, descriptions, accounts, notes) stay neatly tucked away until you need them.

### 🤝 Friends & Ledger Management
- **Shared Expenses**: Keep track of who owes you and what you owe.
- **Friend Ledger**: View full transaction histories per person.
- **One-Tap Settle**: Mark entries as settled or reopen them with a single tap without distorting your current balance.

### 📊 Clean Analytics & Insights
- **Monthly Spending Breakdown**: Track total spent, income received, and net remaining for the month.
- **Top Category Analysis**: Interactive visualizations highlighting your biggest spending habits.

### 🏦 Multi-Account Support
- Manage separate balances for multiple **Bank Accounts**, **Cash in Hand**, and digital **Wallets**.
- Edit starting balances and account names dynamically.

---

## 🎨 Design & Interaction

Worth is built on the **Midnight Glass** design system:
- **Dark-First Atmosphere**: Rich `#08090F` OLED background with layered frosted-glass cards (`backdrop-blur`).
- **Tactile Micro-interactions**: Native-feeling spring-press physics (`scale-95 duration-75`) on all buttons, chips, and cards.
- **Haptic Feedback**: Physical vibrations via Web Haptics API on taps, selections, confirmations, and warnings.
- **Mobile Optimized**:
  - Auto-focuses the Amount field whenever modals or sheets open.
  - Opens decimal numeric keypads (`inputMode="decimal"`) automatically.
  - Tap-anywhere backdrop dismiss for sheets and modals.
  - Subtle 2-second floating action toasts above the navigation bar.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [TanStack Start](https://tanstack.com/start) (Fullstack React framework with SSR) |
| **Routing** | [TanStack Router](https://tanstack.com/router) (Fully typesafe file-based routing) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) with OKLCH color spaces |
| **State Management** | [TanStack Query](https://tanstack.com/query) + Custom reactive LocalStore |
| **Icons** | [Lucide React](https://lucide.dev/) |
| **Charts** | [Recharts](https://recharts.org/) |
| **Notifications** | [Sonner](https://sonner.emilkowal.ski/) |
| **Bundler / Server** | [Vite](https://vitejs.dev/) + [Nitro](https://nitro.unjs.io/) |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18.0.0 or higher recommended)
- **npm**, **pnpm**, or **bun**

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/your-username/worth.git
   cd worth
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   bun install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Build for production**:
   ```bash
   npm run build
   ```

5. **Preview production build**:
   ```bash
   npm run preview
   ```

---

## 📁 Project Structure

```
├── public/                  # Static assets & PWA manifest
│   ├── app-icon-*.png
│   ├── favicon.png
│   └── manifest.webmanifest # PWA configuration
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── app-shell.tsx    # Header, navigation, and quick-add sheet
│   │   ├── bottom-sheet.tsx # Backdrop-dismissable modal sheet
│   │   ├── primitives.tsx   # GlassCard, AmountField, Buttons, Chips
│   │   ├── quick-add.tsx    # Expense, Income, Split, Transfer forms
│   │   ├── transaction-row.tsx # Transaction list row component
│   │   └── ui/              # Toast (Sonner) and UI primitives
│   ├── lib/                 # Core logic and helpers
│   │   ├── categories.ts    # Expense categories & icons
│   │   ├── data.ts          # Reactive hooks for accounts, ledger, transactions
│   │   ├── haptics.ts       # Mobile vibration feedback
│   │   ├── local-store.ts   # LocalStorage persistence engine
│   │   ├── money.ts         # Currency formatting & splitting math (paise-safe)
│   │   └── theme.ts         # Dark/Light theme manager
│   ├── routes/              # TanStack file-based routes
│   │   ├── __root.tsx       # Root layout & meta configuration
│   │   ├── index.tsx        # Home dashboard
│   │   ├── transactions.tsx # Activity timeline & transaction editor
│   │   ├── friends.tsx      # Friends list & owed balances
│   │   ├── friends.$friendId.tsx # Individual friend ledger & settlement
│   │   ├── insights.tsx     # Monthly spending analytics
│   │   ├── settings.tsx     # Account configuration, theme, data reset
│   │   ├── spent-transactions.tsx
│   │   ├── received-transactions.tsx
│   │   └── to-pay-transactions.tsx
│   └── styles.css           # Tailwind v4 theme tokens & animations
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🔒 Privacy & Offline-First

Worth does not ask for bank credentials, does not require an email address, and never transmits your transactions across the internet. 

All financial amounts are stored safely on device as integers (paise) to guarantee complete precision without floating-point math issues.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
