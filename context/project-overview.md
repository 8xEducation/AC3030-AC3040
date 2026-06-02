# Cash flow

## Overview

This application is a mobile-first, completely offline personal finance tracker designed for individuals who want strict control over their cash flow, assets, and debts without the friction of complex accounting tools. By utilizing a simplified dual-entry accounting system under the hood, the app ensures mathematically perfect net worth calculations while providing an intuitive, lightning-fast manual data entry experience. 

## Goals

1. Enable users to record any daily financial transaction (income, expense, or transfer) in under 3 seconds.
2. Guarantee 100% mathematical accuracy for Net Worth and budget tracking by enforcing strict Integer-based database storage, completely eliminating floating-point errors.
3. Consolidate cash flow, physical assets, and peer-to-peer debts into a single, cohesive financial lifecycle.

## Core User Flow

1. User launches the app for the first time and configures their preferred UI currency symbol and position (e.g., `$` prefix or `VNĐ` suffix).
2. User initializes their primary financial resources (e.g., creating a "Cash Wallet" asset and a "Credit Card" liability).
3. User logs daily transactions using the rapid Numpad interface, categorizing them as Income, Expense, or Transfer.
4. User initiates a Debt record (Lending or Borrowing), optionally linking it to an asset to automatically deduct or add funds.
5. User monitors their overall financial health via the real-time Net Worth dashboard, adjusting spending based on Smart Budget progression bars.
6. User logs a partial or full Debt Repayment, automatically syncing their asset balances and closing the debt lifecycle.

## Features

### Asset & Liability Management
- **Account Creation:** Add custom accounts categorized as Assets (Cash, Bank) or Liabilities (Credit Cards).
- **Initial Balances:** Automatically generate adjustment transactions when declaring starting balances.
- **Soft Deletion:** Archive old accounts without breaking historical transaction data or past Net Worth calculations.

### Transaction Engine
- **Rapid Input:** Custom Numpad view optimized for one-handed mobile use.
- **Tri-State Logic:** Support for Expenses (deducts from asset), Incomes (adds to asset), and Transfers (moves money between assets without affecting Net Worth).
- **Dual-Entry Integrity:** Every money movement is strictly tied to an account, ensuring no "orphaned" cash flows.

### Debt Ledger
- **Lifecycle Tracking:** Track "Lent" and "Borrowed" money with due dates and open/settled statuses.
- **Integrated Payments:** Repaying a debt automatically generates the corresponding Income/Expense transaction and updates the selected Wallet balance.
- **Status Automation:** Debts automatically move to the "Settled" tab once the remaining amount hits zero.

### Smart Budgeting
- **Custom Timeframes:** Set budgets to reset weekly (e.g., every Monday) or monthly (e.g., the 5th of every month).
- **Edge-Case Handling:** Automatically clamps dates for short months (e.g., anchoring to the 31st will safely resolve to the 28th in February).
- **Multi-Tier Alerts:** Visual progress bars and in-app warnings when spending crosses 80% and 100% thresholds.

### Dashboard & Analytics
- **Real-Time Net Worth:** Live calculation of `Sum(Assets) - Sum(Liabilities)`.
- **Visual Reports:** Pie charts for expense categorization and Bar charts for spending trends over time.

## Scope

### In Scope
- Local-first data storage using WatermelonDB (SQLite).
- Manual transaction and debt entry.
- Integer-based absolute currency storage and UI-level formatting.
- Dual-entry accounting logic (Account Observer, Transaction Factory).
- Dynamic budget cycle calculations.

### Out of Scope
- Bank webhooks, SMS parsing, or any automated transaction fetching.
- Cloud synchronization, remote database backups, or multi-device sync.
- User authentication, login screens, or cloud accounts.
- Multi-currency wallets with real-time exchange rate conversions.

## Success Criteria

1. **Transaction Integrity:** A user can create a new asset and log an expense; the asset's balance and the total Net Worth decrease by the exact inputted amount.
2. **Float Prevention:** The system handles decimal inputs (e.g., entering `10.50`) by successfully converting and storing them as integers (`1050`) in the database, while rendering them correctly on the UI.
3. **Debt Synchronization:** Repaying a partial amount of a debt automatically generates an underlying transaction and perfectly updates both the debt's remaining balance and the selected asset's balance.
4. **Budget Accuracy:** The budget algorithm correctly calculates the current billing cycle based on a custom anchor day, accurately identifying the start and end dates regardless of leap years or month lengths.