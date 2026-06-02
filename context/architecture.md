# Architecture Context

## Stack

| Layer | Technology | Role |
| :--- | :--- | :--- |
| Framework | React Native (Expo) + TypeScript | Builds the cross-platform application shell (iOS/Android) with strict static typing. |
| UI | StyleSheet + react-native-reanimated | Manages the user interface, layouts, and smooth animations (60fps) on mobile devices. |
| Charts | react-native-gifted-charts | Renders visual data (Pie Charts, Bar Charts) for the Dashboard and Analytics Reports. |
| State | Zustand | Manages Client State (UI configurations, Currency symbols, Theme) in a lightweight manner without boilerplate. |
| Database | WatermelonDB (SQLite-based) | Handles offline-first data storage, optimized for querying thousands of records (Transactions) without blocking the UI thread. |
| Architecture | MVC + 4 Core Design Patterns | Ensures scalability and strict separation of concerns (Strategy, Observer, Factory, Facade). |
| Testing | Jest + React Native Testing Library | Unit tests financial algorithms and business logic, ensuring zero calculation errors. |

## System Boundaries

- `src/database` — Owns all local data structures. Contains Schemas, Models (`Account`, `Transaction`, `Debt`, `Budget`), and WatermelonDB connection configurations.
- `src/patterns` — The "Brain" of the system. Encapsulates core business logic classes: `TransactionFactory` (input standardization), `AccountObserver` / `DebtObserver` (chain updates), `TimeframeStrategy` (budget cycle calculation), and `ReportFacade` (chart data aggregation).
- `src/controllers` — The intermediary layer. Receives UI interactions, invokes Design Patterns to process logic, and coordinates Database read/write flows.
- `src/screens` — Owns the UI Views grouped by business modules: `/Dashboard`, `/Transaction`, `/DebtLedger`, `/SmartBudget`, `/Settings`.
- `src/components` — Owns reusable and shared UI components: `Numpad`, `NetWorthCard`, `ProgressBar`, `CategoryPicker`.
- `src/store` — Manages static Global State (Zustand). Stores user preferences unrelated to accounting logic (Currency symbol, Language, Dark Mode).
- `src/utils` — Owns pure utility functions. Most notably `currencyFormatter.ts` (Integer <-> String conversion for UI rendering) and Date/Time formatting helpers.

## Storage Model

- **Database (WatermelonDB / SQLite)**: Stores all core business data (Master Data & Transaction Data) following the Dual-Entry accounting principle. This includes: Accounts, Transactions, Debts, Budgets, and Categories.
- **Key-Value Store (AsyncStorage / Zustand Persist)**: Stores lightweight application metadata for fast booting. This includes: Onboarding state (has the user seen the setup screen), Currency symbol configuration, Currency position (Prefix/Suffix), and UI Theme preferences.

## Auth and Access Model

- The application is designed to be **Offline-first & Local-only** (No Backend/Cloud integration for the MVP). Users are not required to create an account (Zero-login), entirely eliminating onboarding friction. All data resides physically and exclusively on the user's local device.
- **Ownership**: A single physical device represents a single user instance. The user has full, unrestricted access and ownership of all generated data on that device.
- **Local Security**: The application supports OS-level biometric authentication (FaceID / TouchID / Passcode). When enabled in Settings, the user must authenticate at the Splash screen before accessing or mutating any financial resources within the app.

## Invariants

1. **Anti-Float Trap**: The codebase must never use `Float` or `Decimal` data types for database storage. All currency values across the system—Transactions (`amount`), Accounts (`current_balance`), and Debts (`remaining_amount`)—**must be stored as absolute Integers**. Currency formatting (inserting commas or decimal points) is strictly relegated to the UI (View) layer.
2. **Positive Amounts Only**: The `amount` field in any database table must never contain negative numbers. Determining whether cash flows in or out is dictated exclusively by the `type` field (INCOME / EXPENSE / TRANSFER) in conjunction with the logic inside the Observer Pattern.
3. **Dual-Entry Integrity**: The UI layer (Screens/Components) is strictly prohibited from mutating (Create/Update/Delete) the Database directly. All Transaction mutations must pass through the `TransactionFactory` for standardization and must synchronously trigger the `AccountObserver` / `DebtObserver` to ensure related Account/Debt balances are updated. Money cannot move without a corresponding transaction record.
4. **No Orphaned Data**: Master Data, such as Accounts or Categories, must never be Hard Deleted if they possess linked transactions. The system must enforce Soft Deletion (`is_active = false`) to preserve the integrity of historical reports and the overarching Net Worth calculation.