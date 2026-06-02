# Code Standards

## General

- **Separation of Concerns**: Strictly adhere to the MVC architecture. UI components must only handle rendering and user interactions; business logic must reside in Controllers and Pattern classes.
- **Single Responsibility Principle**: Keep modules, classes, and functions small and focused on a single task. 
- **Fix Root Causes**: Do not layer workarounds. If a calculation is off, fix the underlying logic (e.g., currency formatting) rather than patching the output.
- **Offline-First Mindset**: Assume the application is always offline. All read/write operations must be executed against the local WatermelonDB instance seamlessly.

## TypeScript

- **Strict Mode**: `strict: true` is required in `tsconfig.json`. No implicit `any` is allowed.
- **Explicit Typing**: Avoid `any` completely. Use explicit interfaces, types, or narrowly scoped types for all database models, controller arguments, and component props.
- **Enums for Constants**: Use TypeScript `enum` for fixed categorical data (e.g., `TransactionType.INCOME`, `AccountType.ASSET`, `DebtStatus.OPEN`) to prevent string typo bugs.
- **Boundary Validation**: Validate all raw inputs from UI forms before passing them to the Factory or Database layer.

## React Native & Expo

- **Functional Components**: Use functional components with React Hooks exclusively. Do not use legacy Class components.
- **Performance Optimization**: Use `React.memo`, `useMemo`, and `useCallback` strategically to prevent unnecessary re-renders, especially for heavy lists (e.g., using `@shopify/flash-list` for transaction history).
- **UI Thread Animations**: Use `react-native-reanimated` for all animations to ensure they run on the native UI thread, guaranteeing 60fps performance.
- **Clean Side Effects**: Keep components pure. Delegate complex side effects to custom hooks or Controllers.

## Styling

- **Design Tokens**: Use centralized design tokens for colors, spacing, and typography defined in a global theme file. Absolutely no hardcoded hex values or arbitrary margins inside components.
- **StyleSheet Instantiation**: Define styles using `StyleSheet.create` *outside* of the component render cycle to prevent memory reallocation on every render.
- **Theme Awareness**: Build UI components to inherently support Dark/Light mode by subscribing to the global Zustand theme state.
- **Dark/Light Mode Implementation**: Components must strictly use semantic color tokens (e.g., `bg-surface`, `text-primary`) instead of static colors (e.g., `bg-white`, `text-black`). Rely on the styling engine (NativeWind/Unistyles) to handle the color swapping automatically.

## Controllers & Business Logic (Local API)

- **Input Validation**: Controllers must validate and parse user input (e.g., ensuring `amount` is positive) before triggering any Pattern logic.
- **Encapsulation**: UI must never import WatermelonDB directly to mutate data. All mutations must go through the respective Controller and Factory.
- **Atomic Operations**: Operations affecting multiple tables (e.g., saving a `Transaction` and updating an `Account` balance via the `Observer`) must be wrapped in a single WatermelonDB `database.action()` batch to prevent data corruption.
- **Predictable Returns**: Controllers should return consistent, predictable shapes (e.g., `{ success: boolean, data?: T, error?: string }`) to the UI layer.

## Data and Storage

- **The Integer Rule (Crucial)**: Currency values MUST be stored as absolute Integers in the database. Never store monetary values as `Float` or `Decimal`.
- **Absolute Values**: Transaction amounts are always stored as positive integers. Cash flow direction is strictly determined by the `type` field.
- **Soft Deletion**: Master data (Accounts, Categories, Debts) must never be hard-deleted. Use `is_active = false` to archive data and preserve historical Net Worth accuracy.
- **AsyncStorage for Config**: Use `AsyncStorage` (via Zustand persist) ONLY for lightweight app metadata (e.g., currency symbol, language, theme). Do not store transactional data here.
- **Theme Persistence**: The user's theme preference (`light` | `dark` | `system`) must be stored in `AsyncStorage` via Zustand's `persist` middleware to ensure the app doesn't flash the wrong theme upon cold boot.

## File Organization

- `src/components/` — Dumb, reusable UI components (e.g., `Numpad`, `Button`, `NetWorthCard`) that rely solely on props and have no direct database awareness.
- `src/screens/` — Smart components (Views) representing full application pages, responsible for layout and calling Controllers.
- `src/database/` — WatermelonDB setup, including `schema.ts`, database initialization, and Model classes (`Account.ts`, `Transaction.ts`, etc.).
- `src/patterns/` — The core business logic encapsulating the 4 key design patterns: `TransactionFactory`, `AccountObserver`, `TimeframeStrategy`, and `ReportFacade`.
- `src/controllers/` — Mediator functions/classes that bridge the UI layer with the `patterns` and `database` layers.
- `src/store/` — Zustand state slices for global app configuration (Theme, Localization, Selected Currency Symbol).
- `src/utils/` — Pure helper functions, most notably `currencyFormatter.ts`, date manipulation helpers, and constants.
- `tests/` — Jest unit test files, mirroring the structure of `src` (e.g., `tests/utils/currencyFormatter.spec.ts`).