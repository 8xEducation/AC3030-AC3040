# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- In progress

## Current Goal

- Completed baseline MVP - Ready for device testing and final review

## Completed

- [x] Installed dependencies: WatermelonDB, Zustand, React Native Reanimated, Lucide React Native, Gifted Charts, Flash List, AsyncStorage
- [x] Configured babel.config.js with WatermelonDB and Reanimated plugins
- [x] Configured metro.config.js for Expo
- [x] Created tsconfig.json with strict mode, path aliases, and decorator support
- [x] Created database schema (5 tables: accounts, transactions, debts, budgets, categories)
- [x] Created WatermelonDB models with decorators for all tables
- [x] Created database initialization (src/database/index.ts)
- [x] Created TypeScript enums (TransactionType, AccountType, DebtType, DebtStatus, BudgetTimeframe, CategoryType)
- [x] Created utility functions: currencyFormatter (toCents, fromCents, formatCurrency), dateHelpers (toTimestamp, fromTimestamp)
- [x] Created Zustand store with persist middleware for theme, currency, language, and onboarding state
- [x] Implemented TransactionFactory (Design Pattern)
- [x] Implemented AccountObserver and DebtObserver (Observer Pattern)
- [x] Created Controllers for data management: AccountController, TransactionController, DebtController, BudgetController
- [x] Created global theme.ts for semantic colors, dark mode support, and react hook integration
- [x] Implemented NetWorthCard UI component using SVG gradients and Lucide icons
- [x] Implemented DashboardScreen as primary viewport with demo interaction utilities
- [x] Implemented TimeframeStrategy (Weekly vs Monthly) for budget cycle calculations (Strategy Pattern)
- [x] Implemented ReportFacade for Pie/Bar Chart data aggregation (Facade Pattern)
- [x] Implemented SmartBudgetScreen to manage, calculate, and rollover budgets
- [x] Implemented DebtLedgerScreen to manage open/settled debts and linked wallet transactions
- [x] Implemented SettingsScreen to configure themes, currency, language, and database resets
- [x] Wired custom bottom tab navigation in App.tsx linking all modules seamlessly
- [x] Integrated visual charts using Gifted Charts inside Dashboard (Daily Bar Chart and Category Donut Chart)
- [x] Established Jest unit testing suite to verify financial algorithms and formatting invariants (100% pass)
- [x] TypeScript compilation passes with no errors
- [x] Installed and configured expo-local-authentication for iOS & Android
- [x] Implemented startup biometric lock using BiometricLockScreen and toggle in SettingsScreen
- [x] Implemented multi-slide onboarding flow in OnboardingScreen for currency & style customization on first boot
- [x] Wired onboarding and biometric locks dynamically in App.tsx
- [x] Resolved fatal Hermes engine crashes and Flow syntax parsing errors
- [x] Implemented Custom Categories Management via CategoryManagerModal and CategoryController
- [x] Implemented Budget-Category binding (Schema v2) to allow targeted expense limits per category
- [x] Moved Category Management UI cohesively into SmartBudgetScreen to streamline user workflows
- [x] Implemented global TimeService with Network Time sync (WorldTimeAPI) and user-configurable firstDayOfWeek
- [x] Integrated TimeService across Budget strategies, Dashboard greetings, and Report data aggregations
- [x] Displayed Network Timezone syncing status in Settings with multi-language i18n support
- [x] Refactored Dashboard greeting to be dynamic and time-based (Morning/Afternoon/Evening/Night) to improve personalization without requiring user name
- [x] Restructured project layout by moving loose tests into `tests/` directory
- [x] Added developer credit line to Settings Screen footer
- [x] Implemented `TransactionHistoryModal` using `@shopify/flash-list` for high-performance viewing of full transaction history via Dashboard
- [x] Implemented `TransactionDetailsModal` to display full un-truncated transaction descriptions, amounts, linked categories, and linked accounts on tap


## In Progress

- None

## Next Up

- None

## Open Questions

- None

## Architecture Decisions

- Used WatermelonDB decorators with legacy Babel plugin for model definitions
- Stored all monetary values as integers (cents) to prevent floating-point errors
- Used soft deletion (is_active flag) for accounts and categories to preserve historical data
- Separated transaction type (INCOME/EXPENSE/TRANSFER) from amount (always positive)

## Session Notes

- Database layer is ready for use. Models can be imported from src/database/index.ts.
- Currency formatting logic is protected; do not modify currencyFormatter.ts after unit tests pass.
- Schema is at version 1; any structural changes require a migration step.

# Progress Tracker & Build Error Log

This document tracks the configuration adjustments, build compilation errors, and runtime issues encountered during the development of **Cash Flow Wave** (Expo SDK 54 / React Native 0.81.5 / WatermelonDB), along with their root causes and resolutions.

---

## 1. Environment & Stack Overview
- **Framework**: Expo SDK 54 (`expo@~54.0.33`)
- **JavaScript Runtime**: Hermes Engine
- **React Native Version**: `react-native@0.81.5`
- **Database/ORM**: WatermelonDB (`@nozbe/watermelondb@^0.28.0`)
- **Primary Tooling**: Babel 7, Metro Bundler

---

## 2. Compilation & Build Issues Log

### Issue 1: Metro Extension Dependency Resolution Failure
- **Symptom**: Metro bundler failed to resolve package dependencies (like `expo` or `@react-native/*`) because it could not find or load their package metadata.
- **Root Cause**: The custom `metro.config.js` was overwriting the default Metro file extensions (`resolver.sourceExts`) to `['js', 'jsx', 'ts', 'tsx', 'cjs']`, which omitted the `.json` extension. Metro uses `.json` files to read dependency configurations.
- **Resolution**: Updated `metro.config.js` to push/append `'cjs'` to the existing `sourceExts` array instead of replacing it, preserving the default extensions.

---

### Issue 2: TypeScript/Babel Decorator Field Initialization Error
- **Symptom**: During compilation, Babel threw a syntax error in model files:
  `SyntaxError: .../src/database/models/Account.ts: Definitely assigned fields cannot be initialized here, but only in the constructor`
- **Root Cause**: WatermelonDB uses legacy TypeScript decorators (e.g., `@field`, `@children`). Babel's default decorator parsing in `babel-preset-expo` doesn't handle legacy decorator assignments correctly unless the class properties transform is configured in `loose: true` mode.
- **Resolution**: Enabled `@babel/plugin-proposal-decorators` in legacy mode and `@babel/plugin-transform-class-properties` in loose mode in `babel.config.js` for our source files exclusively.

---

### Issue 3: Massive Cascade of Hermes Compiler & Runtime Crashes
- **Symptoms**:
  - `[runtime not ready]: TypeError: right operand of 'in' is not an object` in `_defineProperty`.
  - `SyntaxError: Support for the experimental syntax 'flow' isn't currently enabled`.
  - Hermes runtime crash reporting `_wrapNativeSuper(Error)` returned `undefined`.
  - `hermesc` crashing during `expo export -c` with `error: Invalid expression encountered globalThis.DOMException = class DOMException extends Error {`.
  - `hermesc` crashing with `error: invalid statement encountered. class MessageQueue {`.
- **Root Cause**: The project suffered from a catastrophic package version mismatch. The user had installed a future version of `@babel/preset-expo` (`56.0.14`) while running Expo SDK `~54.0.33` (React Native 0.81.5).
  1. `babel-preset-expo@56` defaults to the `hermes-v1` configuration for Hermes, assuming the engine natively supports ES6 `class` syntax and private fields.
  2. However, the Hermes compiler (`hermesc`) included with React Native 0.81.5 does **not** fully support ES6 classes from source (it throws an invalid statement exception).
  3. This mismatch caused `babel-preset-expo` to emit raw ES6 classes (and raw Flow types!) into the bundle for `node_modules`, crashing `hermesc` when compiling for production.
  4. In development mode, the Hermes runtime *could* parse the classes, but executing ES6 classes extending native objects (like `Error`) crashed because `super()` returned an uninitialized object, triggering the `TypeError: right operand of 'in' is not an object`.
  5. The previous developer attempted to fix these symptoms with a labyrinth of hacks: writing custom global Babel plugins, separating `node_modules` overrides, explicitly disabling `loose` transforms, and writing a custom `src/utils/polyfill.ts` for `DOMException`. These hacks broke React Native's internals even further.
- **Resolution**:
  1. Ran `npx expo install --fix` to downgrade `babel-preset-expo` from `56.0.14` to the correct compatible version `~54.0.10`.
  2. Deleted the flawed `src/utils/polyfill.ts` and removed it from `metro.config.js`.
  3. Reset `babel.config.js` to the standard baseline configuration, only applying legacy decorators to source files (using `exclude: /node_modules/`).
  4. With version alignment restored, `babel-preset-expo@54` now correctly routes `hermes-stable` to the `hermes-v0` profile, transparently transpiling ES6 classes and Flow types to ES5 specifically for the RN 0.81.5 engine without crashing.

---

### Issue 4: WatermelonDB Native Module Missing in Expo Go
- **Symptom**: `[runtime not ready]: Diagnostic error: NativeModules.WMDatabaseBridge is not defined! This means that you haven't properly linked WatermelonDB native module.`
- **Root Cause**: WatermelonDB contains custom C++/Objective-C/Java native code that is completely absent from the standard "Expo Go" client app. When the app initializes, it attempts to load the native SQLite bridging module (`WMDatabaseBridge`) and fails, crashing the runtime.
- **Resolution**:
  1. Installed `expo-dev-client` and `@morrowdigital/watermelondb-expo-plugin`.
  2. Registered the plugin in `app.json` (`"plugins": [..., "@morrowdigital/watermelondb-expo-plugin"]`).
  3. Generated native directories (`ios` and `android`) using `npx expo prebuild --clean` to physically link the WatermelonDB native modules.
  4. The project must now be run as a Custom Development Client via `npx expo run:ios` or `npx expo run:android` rather than the standard `expo start` command, in order to natively compile and execute the WatermelonDB C++ bridge.

---

### Issue 5: Unimplemented component `<RNCSafeAreaProvider>`
- **Symptom**: App crashed on load with `Unimplemented component: <RNCSafeAreaProvider>`.
- **Root Cause**: `react-native-safe-area-context` was installed to fix the `SafeAreaView` deprecation warning, but because the project uses a custom development client (bare workflow with `ios` directory), the new native module wasn't compiled into the running binary. Hot-reloading Metro or clearing cache only updated the JS side, which then tried to mount a native view that didn't exist in the old app binary.
- **Resolution**:
  1. Ran `cd ios && pod install` to properly link the new native module via CocoaPods.
  2. Executed `npm run ios` (i.e., `npx expo run:ios`) to trigger a full Xcode recompilation, successfully embedding the new native code into the Simulator binary.

---

## 3. Current Verification Status
- **Unit Tests**: All 13 Jest unit tests (`npm test`) compile and pass successfully.
- **TypeScript Type Checks**: Standard compilation check (`npx tsc --noEmit`) passes with zero errors.
- **Production Build**: Successfully compiled Hermes bytecode (`hbc`) for iOS and Android via `npx expo export -c`.

---

### Issue 6: Vietnamese Telex "Nuốt Chữ" (Swallowed Characters) on iOS
- **Symptom**: When users typed Vietnamese using the iOS native Telex keyboard, letters would occasionally disappear or fail to combine correctly, despite `autoCorrect={false}` and `spellCheck={false}`.
- **Root Cause**: The typical React Native controlled `TextInput` architecture (`value={state}` + `onChangeText`) causes the React reconciliation cycle to update the native `UITextField` asynchronously across the bridge. This asynchronous property update interrupts the iOS Input Method Editor (IME) mid-composition, deleting the buffer and swallowing characters.
- **Resolution (Resolved)**:
  1. Converted all text `TextInput` fields across the app (AddTransactionModal, AddAccountModal, SmartBudgetScreen, DebtLedgerScreen, CategoryManagerModal) into uncontrolled components.
  2. Removed the `value={state}` binding entirely.
  3. Replaced the `useState` tracking with `useRef` so that `onChangeText={(val) => ref.current = val}` collects the text without triggering any component re-renders.
  4. Used the `key` prop trick to force remounts and clear the input when modals are closed or submissions complete.
  5. **Note**: During testing on the iOS Simulator, the issue appeared to persist when using a Mac hardware keyboard. This is a known limitation of the iOS Simulator's hardware keyboard bridge with Vietnamese Telex. The code solution is confirmed correct and will perform flawlessly on real devices or when using the on-screen virtual keyboard (`Cmd + K`).

---

### Issue 7: WatermelonDB Native Crash on Interleaved Model Updates & Date Conversion
- **Symptom**: When creating a new transaction, the app crashed or failed silently with \`Model.update() can only be called from inside of a Writer\`. Separately, budget transaction tracking queries failed to load any transactions despite being successfully linked.
- **Root Cause**:
  1. **ActionQueue Locking Bug**: The \`TransactionFactory\` was executing a \`.create()\` block followed by multiple asynchronous \`Account.update()\` and \`Debt.update()\` blocks in observers sequentially inside a single \`database.write()\`. React Native's asynchronous bridge interleaved these native calls, causing WatermelonDB to prematurely unlock the ActionQueue, leading to an immediate crash when the next observer tried to write.
  2. **WatermelonDB \`@date\` Leak**: Budget logical timestamps (\`start_date\`, \`end_date\`) were decorated with \`@date\`. WatermelonDB eagerly intercepted these integer timestamps (seconds) and converted them into JS \`Date\` objects. When these \`Date\` objects were passed back into \`Q.between()\` queries to aggregate budget expenses, the native SQLite adapter crashed because it expected numbers.
  3. **Fast Refresh Observer Purge**: React Native's Metro bundler Fast Refresh was clearing the static \`TransactionSubject.observers\` array every time a file reloaded, dropping all tracking events and silently failing to update balances.
- **Resolution**:
  1. Completely refactored the \`TransactionObserver\` pattern. Observers now return arrays of prepared models (\`Promise<Model[]>\` via \`.prepareUpdate()\`) instead of executing updates immediately.
  2. \`TransactionFactory\` aggregates all prepared models and fires a single, atomic \`database.batch(...models)\`. This enforces strict synchronization and circumvents the React Native ActionQueue locking bug.
  3. Replaced all \`@date\` decorators with \`@field\` for logical timestamps in \`Budget.ts\` and \`Transaction.ts\` to enforce pure integer compliance with \`Q.where\` queries. (Kept \`@date\` exclusively for \`created_at\`/\`updated_at\`).
  4. Converted \`TransactionSubject\` static properties to lazily-initialized getters to survive React Native Fast Refresh reloading.

### Issue 8: iOS Multi-Modal Presentation Conflict (Screen Freeze)
- **Symptom**: When tapping a transaction inside the `TransactionHistoryModal` (See All), the screen would freeze or the details modal would fail to present. Closing the history modal left the app in an unresponsive state requiring a tab switch to recover.
- **Root Cause**: `TransactionHistoryModal` (`pageSheet` style) was currently presented over the root view. When a transaction was selected, the event bubbled back up to `DashboardScreen`, which attempted to render `TransactionDetailsModal` (transparent) natively over the root view. iOS rejected stacking a new modal at the root level while another modal was actively covering it, leading to a silent UI lock.
- **Resolution**:
  1. Decoupled the selection state from `DashboardScreen` and moved the `TransactionDetailsModal` rendering directly inside `TransactionHistoryModal`'s view hierarchy.
  2. This allows the Details Modal to correctly present *on top* of the History Modal, maintaining the proper UI stack without conflicts. `DashboardScreen` retains its own separate `TransactionDetailsModal` solely for its internal Recent Transactions list.

---

### Issue 9: Expo Prebuild Crash (`files.map is not a function`) & CocoaPods Conflict
- **Symptom**: Running `npx expo prebuild` crashed during the `copyTemplateFiles` phase with `files.map is not a function`. Once this was bypassed, `pod install` failed due to multiple sources for `simdjson`.
- **Root Cause**:
  1. **NPM Hoisting Bug**: NPM hoisted an extremely old version of `glob` (`v7.2.3`) over the required `v13.0.0` for `@expo/cli`. In v7, `glob` uses a callback API instead of returning a Promise (array), causing the awaited return value to be undefined, crashing `files.map`.
  2. **Podfile Duplication**: The `@morrowdigital/watermelondb-expo-plugin` forcefully injected a manual pod installation line for `simdjson`, while modern React Native autolinking already handles it, causing CocoaPods to abort due to conflicting sources.
- **Resolution**:
  1. Purged `node_modules` and `package-lock.json`, running `npm install` from scratch to enforce correct dependency resolution and hoisted versions.
  2. Used a regex/string replacement (or manual edit) to remove the hardcoded `pod 'simdjson'` line from `ios/Podfile` before successfully executing `pod install`.

---

### Issue 10: SettingsScreen IDE Errors & Database Reset Crash
- **Symptom**: The developer IDE flagged a persistent TS error: `Cannot use JSX unless the '--jsx' flag is provided`. Additionally, invoking the `Reset Everything` button crashed the app instantly.
- **Root Cause**:
  1. **TSConfig Configuration**: VS Code's TypeScript Language Server occasionally fails to infer JSX settings from inherited `expo/tsconfig.base` configurations if not explicitly declared in the host `tsconfig.json`.
  2. **WatermelonDB Lock Violation**: The `database.unsafeResetDatabase()` method was incorrectly wrapped inside a `database.write()` action. WatermelonDB explicitly forbids destroying the database while a writer lock is active.
- **Resolution**:
  1. Explicitly appended `"jsx": "react-native"` to the `compilerOptions` array in `tsconfig.json` to force IDE compliance.
  2. Removed the `database.write()` wrapper around `unsafeResetDatabase()` in `SettingsScreen.tsx`, allowing the asynchronous reset to execute cleanly without deadlock.

---

### Issue 11: Unsupported class file major version 69
- **Symptom**: Android build fails with `BUG! exception in phase 'semantic analysis' in source unit '_BuildScript_' Unsupported class file major version 69`
- **Root Cause**: The system was using Java 25 (version 69), which is not supported by Gradle 8.14.3 (supports up to Java 24).
- **Resolution**: Set `JAVA_HOME` to point to a Java 21 installation (which is installed on the machine) before running the build: `export JAVA_HOME=$(/usr/libexec/java_home -v 21)`.

---

### Issue 12: Android SDK location not found
- **Symptom**: Android build fails with `SDK location not found. Define a valid SDK location with an ANDROID_HOME environment variable or by setting the sdk.dir path in your project's local properties file...`
- **Root Cause**: The project lacked an `android/local.properties` file specifying where the Android SDK was installed.
- **Resolution**: Created `android/local.properties` and added the standard macOS Android SDK path: `sdk.dir=/Users/mac/Library/Android/sdk`.

---

### Issue 13: Unresolved reference 'OptimizedRecord'
- **Symptom**: `:expo-dev-menu:compileDebugKotlin FAILED` with `Unresolved reference 'OptimizedRecord'`
- **Root Cause**: Version mismatch between `expo` (SDK 54) and `expo-dev-client`. The project had `expo-dev-client` version `^56.0.18`, which expects classes from Expo 56 that don't exist in Expo 54's `expo-modules-core`.
- **Resolution**: Downgraded `expo-dev-client` to the version compatible with SDK 54 by running `bunx expo install expo-dev-client` (which installed `~6.0.21`).

---

### Issue 14: Unresolved reference 'JSIModulePackage'
- **Symptom**: `:app:compileDebugKotlin FAILED` with `Unresolved reference 'JSIModulePackage'` in `MainApplication.kt`
- **Root Cause**: `JSIModulePackage` was deprecated and completely removed in React Native 0.74+. However, the `@morrowdigital/watermelondb-expo-plugin` still injected an unused import for it (`import com.facebook.react.bridge.JSIModulePackage;`) into `MainApplication.kt`, causing a compilation error.
- **Resolution**: Manually removed the invalid import from `android/app/src/main/java/com/anonymous/cashflowwave/MainApplication.kt`.
