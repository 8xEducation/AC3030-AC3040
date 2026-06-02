# UI Context

## Theme

The application supports both **Light Mode** and **Dark Mode**, with the ability to automatically synchronize with the operating system's settings (System Default). 
- **Light Mode:** Delivers a clean, transparent, and structured feel, akin to a traditional accounting ledger. Utilizes white/light gray backgrounds with crisp dark text for high legibility.
- **Dark Mode:** Creates a focused, professional workspace that reduces eye strain in low-light environments. Utilizes deep slate/near-black backgrounds with high-contrast accent colors.

The UI must feel "Zero-Friction," meaning inputs are prominent, typography is highly legible for quick scanning, and animations are fluid (60fps).

## Colors

All components must strictly use semantic color tokens (e.g., via NativeWind or Unistyles). **Do not use hardcoded hex values in component files.** The styling engine will handle color swapping automatically based on the active theme.

| Role                   | CSS Variable / Token | Light Mode Value        | Dark Mode Value         |
| ---------------------- | -------------------- | ----------------------- | ----------------------- |
| **Page background** | `--bg-base`          | `#F8FAFC` (Slate 50)    | `#0F172A` (Slate 900)   |
| **Surface / Cards** | `--bg-surface`       | `#FFFFFF` (White)       | `#1E293B` (Slate 800)   |
| **Surface Elevated** | `--bg-elevated`      | `#F1F5F9` (Slate 100)   | `#334155` (Slate 700)   |
| **Primary text** | `--text-primary`     | `#0F172A` (Slate 900)   | `#F8FAFC` (Slate 50)    |
| **Muted text** | `--text-muted`       | `#64748B` (Slate 500)   | `#94A3B8` (Slate 400)   |
| **Primary accent** | `--accent-primary`   | `#4F46E5` (Indigo 600)  | `#6366F1` (Indigo 500)  |
| **Border** | `--border-default`   | `#E2E8F0` (Slate 200)   | `#334155` (Slate 700)   |
| **Expense / Error** | `--state-error`      | `#EF4444` (Red 500)     | `#F87171` (Red 400)     |
| **Income / Success** | `--state-success`    | `#10B981` (Emerald 500) | `#34D399` (Emerald 400) |
| **Warning / Alerts** | `--state-warning`    | `#F59E0B` (Amber 500)   | `#FBBF24` (Amber 400)   |

## Typography

Use system-native fonts or highly legible sans-serif typefaces to ensure financial numbers are easy to read at a glance.

| Role                    | Font                      | Variable      |
| ----------------------- | ------------------------- | ------------- |
| UI text (Labels, forms) | Inter / System Sans       | `--font-sans` |
| Financial Numbers       | Inter / System Sans       | `--font-sans` |
| Monospace / Dev IDs     | Fira Code / System Mono   | `--font-mono` |

## Border Radius

Soft, approachable corners to make the financial data feel less intimidating.

| Context                              | Tailwind Class  | React Native Value |
| ------------------------------------ | --------------- | ------------------ |
| Inline elements, small tags, badges  | `rounded-md`    | `6px`              |
| Buttons, inputs, dropdowns           | `rounded-xl`    | `12px`             |
| Main Cards, Wallet Panels, Charts    | `rounded-2xl`   | `16px`             |
| Bottom Sheets, Modals, Numpad Canvas | `rounded-t-3xl` | `24px` (Top only)  |
| FABs, circular avatars               | `rounded-full`  | `9999px`           |

## Component Library

We utilize a custom component library built on top of **NativeWind** (Tailwind CSS for React Native). 
- Components live in `src/components/`. 
- We prioritize building accessible, highly optimized custom components over heavy third-party UI kits to maintain 60fps performance on the mobile UI thread.
- Animations and transitions must use `react-native-reanimated`.

## Layout Patterns

- **Dashboard / Home:** Vertical `ScrollView` with a sticky top header displaying the Total Net Worth. Content flows as a stack of Cards (Recent Transactions, Budget Progress, Debts).
- **Transaction Entry (Zero-Friction):** A Bottom Sheet modal that slides up instantly over the current context. It contains a segmented control (Expense/Income/Transfer) at the top, a large prominent amount display, and a custom Numpad filling the bottom half of the screen. No full-page navigation required.
- **Card Lists:** Vertical `@shopify/flash-list` for rendering transaction history and debt lists efficiently. Items are separated by a subtle 1px border or distinct card backgrounds with an 8px gap.
- **Modals / Dialogs:** Centered overlays with a semi-transparent black backdrop (`bg-black/60`). Used for destructive actions (e.g., deleting a wallet or debt).
- **Navigation:** Standard Bottom Tab Navigator containing 4 primary tabs: Home, Transactions, Debt Ledger, Settings.

## Icons

Use **Lucide React Native**. 
- Stroke-based icons only (stroke width: 2px).
- **Sizes:** `size={16}` for inline labels/badges, `size={24}` for standard buttons and bottom tabs, `size={32}` for empty states and prominent actions.
- **Colors:** Icons must inherit from the surrounding text (`color={currentColor}`) or explicitly use the state colors (e.g., red arrow for expense, green arrow for income).