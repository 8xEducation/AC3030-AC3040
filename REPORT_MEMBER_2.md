# BÁO CÁO CÁ NHÂN

# ỨNG DỤNG QUẢN LÝ TÀI CHÍNH CÁ NHÂN — CASH FLOW WAVE

## THÀNH VIÊN 2

---

**Họ và tên:** `[Họ tên]`

**MSSV:** `[MSSV]`

**Lớp:** `[Lớp]`

**Vai trò:** `[Vai trò trong nhóm]`

**Ngày nộp:** `[Ngày nộp]`

---

## Mục lục

- [1. Thông tin cá nhân và phạm vi phụ trách](#1-thông-tin-cá-nhân-và-phạm-vi-phụ-trách)
- [2. Mục tiêu phần việc](#2-mục-tiêu-phần-việc)
- [3. Nội dung đã thực hiện](#3-nội-dung-đã-thực-hiện)
- [4. Giải thích kỹ thuật](#4-giải-thích-kỹ-thuật)
- [5. Minh chứng đóng góp](#5-minh-chứng-đóng-góp)
- [6. Khó khăn và cách giải quyết](#6-khó-khăn-và-cách-giải-quyết)
- [7. Tự đánh giá](#7-tự-đánh-giá)
- [8. Kết luận](#8-kết-luận)

---

## 1. Thông tin cá nhân và phạm vi phụ trách

### Khối chức năng được giao

**Khối B — Ngân sách, Công nợ và Cài đặt hệ thống**

Khối này bao gồm 3 nhóm chức năng: quản lý ngân sách thông minh (tự cuốn chiếu theo tuần/tháng), sổ công nợ cá nhân (cho vay/đi vay với thanh toán từng phần), và toàn bộ cấu hình hệ thống — giao diện, ngôn ngữ, bảo mật sinh trắc học, onboarding.

### Vai trò trong nhóm

Phụ trách phát triển 5 màn hình (SmartBudget, DebtLedger, Settings, Onboarding, BiometricLock), triển khai Strategy pattern cho tính toán chu kỳ ngân sách, DebtObserver trong observer chain, tích hợp sinh trắc học, và quản lý danh mục thu/chi.

### Các phần dùng chung có tham gia

Ngoài khối chức năng chính, tham gia đóng góp vào các phần chung:

- Thiết lập project ban đầu (Expo SDK 54, WatermelonDB, cấu hình native permissions)
- Thiết kế database schema (bảng `budgets`, `debts`, `categories` và migration v1→v2)
- Hệ thống theme (`theme.ts`) và đa ngôn ngữ (`i18n.ts`) — đặc biệt các key cho settings, onboarding, budget, debt
- Zustand store (`appStore.ts`) — các thuộc tính: `hasCompletedOnboarding`, `isBiometricEnabled`, `theme`, `language`, `firstDayOfWeek`
- Tiện ích `seedCategories.ts` (5 danh mục mặc định)
- Type definitions (`types/index.ts`) — enum `BudgetTimeframe`, `DebtType`, `DebtStatus`, `CategoryType`
- Viết test cho Strategy pattern
- Fix bug tích hợp giữa hai khối

Phân công này thống nhất với bảng phân công trong báo cáo nhóm (`bao_cao_di_dong.md`, mục 4).

---

## 2. Mục tiêu phần việc

### Bài toán cần giải quyết

Khối B giải quyết 3 bài toán bổ trợ cho quản lý tài chính:

1. **Lập ngân sách:** Người dùng cần thiết lập giới hạn chi tiêu theo chu kỳ (tuần/tháng), theo dõi tiến độ chi tiêu so với giới hạn, và nhận cảnh báo khi gần vượt hoặc đã vượt ngưỡng. Chu kỳ ngân sách cần tự động cuốn chiếu khi hết hạn mà không cần can thiệp thủ công.

2. **Quản lý công nợ:** Người dùng cần ghi nhận các khoản cho vay/đi vay giữa bạn bè, người thân, theo dõi số tiền còn lại, ghi nhận thanh toán từng phần, và tự động đánh dấu đã tất toán khi trả hết.

3. **Cấu hình hệ thống:** Ứng dụng cần hỗ trợ cá nhân hóa (theme, ngôn ngữ, tiền tệ), bảo mật (sinh trắc học), và onboarding cho lần đầu sử dụng.

### Đầu ra mong muốn

- SmartBudgetScreen với tạo/xóa ngân sách, progress bar 3 mức, self-rolling
- DebtLedgerScreen với tạo/thanh toán công nợ, filter OPEN/SETTLED, tích hợp observer chain
- SettingsScreen với 6 section cấu hình độc lập
- OnboardingScreen wizard 3 bước
- BiometricLockScreen với expo-local-authentication
- CategoryManagerModal quản lý danh mục tùy chỉnh
- Strategy pattern tính chu kỳ ngân sách tuần/tháng
- DebtObserver xử lý cập nhật công nợ trong observer chain

### Tiêu chí hoàn thành

- Ngân sách self-rolling hoạt động đúng khi hết chu kỳ
- Thanh toán công nợ kích hoạt observer chain đúng cách
- Biometric lock kiểm tra hardware, enrollment, fallback an toàn
- Onboarding lưu preferences và chuyển sang main app
- Strategy pattern đạt 100% test coverage

---

## 3. Nội dung đã thực hiện

### 3.1. Quản lý ngân sách thông minh

**SmartBudgetScreen** (`src/screens/SmartBudgetScreen.tsx`, 719 dòng)

Màn hình quản lý ngân sách với giao diện chia thành:

- *Danh sách ngân sách:* Mỗi ngân sách hiển thị tên, tag danh mục có màu (nếu gắn category), chu kỳ ngày bắt đầu–kết thúc (Calendar icon), thanh progress bar 3 mức màu: xanh khi <80%, vàng khi ≥80%, đỏ khi ≥100%. Hiển thị số tiền đã chi / giới hạn, trạng thái (CheckCircle/AlertTriangle icon), số tiền còn lại. Nút Trash2 xóa ngân sách.

- *Modal tạo ngân sách:* Form slide-up gồm: tên ngân sách (useRef — uncontrolled), chọn danh mục (FlatList ngang với CategoryPill — React.memo, hoặc "All Expenses"), nhập giới hạn (decimal-pad), segmented control Weekly/Monthly, nhập anchor day. Validation: tên không rỗng, amount > 0, anchor day trong giới hạn.

- *Tự động rollover:* Khi `BudgetController.getBudgetsProgress()` phát hiện `now > endDate`, nó gọi `BudgetStrategyResolver.getStrategy(timeframe).calculateCycle(anchorDay)` để tính chu kỳ mới, persist vào database, rồi truy vấn lại giao dịch Expense trong khoảng mới. Người dùng không cần làm gì — ngân sách tự cuốn chiếu.

> TODO: Chèn ảnh màn hình Smart Budget.

**BudgetController** (`src/controllers/BudgetController.ts`): 3 phương thức chính:
- `createBudget({name, amountInCents, timeframe, anchorDay, categoryId?})` — validate inputs, gọi strategy để tính cycle, tạo budget record
- `getBudgetsProgress()` — fetch budgets, rollover nếu hết hạn, truy vấn Expense transactions trong date range (filter thêm categoryId nếu có), tính spentAmount/remainingAmount/progressPercent, build category lookup Map cho O(1) access
- `deleteBudget(id)` — hard delete qua `destroyPermanently()`

### 3.2. Sổ công nợ

**DebtLedgerScreen** (`src/screens/DebtLedgerScreen.tsx`, 830 dòng — màn hình lớn nhất)

Giao diện phức tạp nhất của ứng dụng, gồm:

- *Tab bar:* 2 segment OPEN (đang hoạt động) và SETTLED (đã tất toán) với bottom-border accent cho tab đang chọn.

- *Thẻ công nợ:* Icon loại (ArrowUpRight xanh = Lent, ArrowDownLeft đỏ = Borrowed), tên người, badge "Paid" (nếu tất toán), số tiền còn lại vs tổng (lớn, color-coded), divider, footer với Calendar icon + ngày hết hạn + cảnh báo overdue (so sánh `dueDate` với `currentTimestamp`), Landmark icon + tên ví liên kết, nút "Record Payment" (chỉ với OPEN).

- *Modal tạo công nợ:* Tên người (useRef), số tiền, segmented Lent/Borrowed (xanh/đỏ), thời hạn (nhập số ngày → tính Unix timestamp), chọn ví (Pressable buttons cho mỗi account), checkbox "Deduct/Add to wallet balance". Khi bật checkbox, controller tạo giao dịch tương ứng: cho vay → Expense, đi vay → Income.

- *Modal thanh toán:* Số tiền (mặc định = toàn bộ còn lại), chọn ví. `DebtController.recordRepayment()` tạo giao dịch ngược (Lent repayment → Income, Borrowed repayment → Expense) với context `{debtId}` → `TransactionFactory.create()` → observer chain → `DebtObserver.onTransactionCreated()` giảm `remainingAmount`, tự động `SETTLED` nếu về 0.

> TODO: Chèn ảnh màn hình Debt Ledger.

**DebtController** (`src/controllers/DebtController.ts`): 3 phương thức chính:
- `createDebt({personName, type, totalAmountInCents, dueDate, accountId, linkToAccount})` — tạo debt record, nếu `linkToAccount=true` thì tạo giao dịch (Lent → Expense, Borrowed → Income)
- `recordRepayment(debtId, repaymentAmountInCents, accountId)` — validate debt chưa settled, repayment ≤ remaining, tạo giao dịch ngược với context `{debtId}`
- `getDebts()` — fetch tất cả debts

### 3.3. Cài đặt hệ thống

**SettingsScreen** (`src/screens/SettingsScreen.tsx`, 593 dòng)

Được thiết kế theo kiểu tách biệt — 6 sub-component độc lập, mỗi cái truy cập Zustand store cho phần dữ liệu của mình:

1. **ThemeSection:** 3 nút Light/Dark/System (Sun/Moon/Laptop icons). `setTheme()` ghi vào store, `useThemeColors()` ở mọi component lập tức phản ứng.

2. **CurrencySection:** Input ký hiệu tiền tệ + nút Save (local state `symbolInput`), toggle Prefix/Suffix, toggle Show/Hide decimals. Mỗi thay đổi ghi store ngay.

3. **LocalizationSection:** Badge buttons EN/VI. `setLanguage()` → `useTranslation()` ở mọi component cập nhật tức thì.

4. **TimeDateSection:** Selector Sunday/Monday cho `firstDayOfWeek`. Giá trị này ảnh hưởng trực tiếp đến `WeeklyBudgetStrategy` qua `TimeService.getFirstDayOfWeek()`.

5. **SecuritySection:** Toggle sinh trắc học dạng custom pill (44×24, knob di chuyển). Luồng: `hasHardwareAsync()` → `isEnrolledAsync()` → `authenticateAsync()` trước khi bật. Nếu thiết bị không hỗ trợ → alert thông báo.

6. **DangerZone:** Nút đỏ "Reset All Data" → `Alert.alert()` xác nhận lần 1 → `Alert.alert()` xác nhận lần 2 → `database.write(() => database.unsafeResetDatabase())`.

> TODO: Chèn ảnh màn hình Settings.

### 3.4. Onboarding và Biometric Lock

**OnboardingScreen** (`src/screens/OnboardingScreen.tsx`, 404 dòng)

Wizard 3 bước, render khi `hasCompletedOnboarding === false`:

- *Bước 0 (Welcome):* Icon Wallet 96px, chào mừng, chọn ngôn ngữ (EN/VI buttons), chọn theme (Light/Dark/System). Các thay đổi ghi store ngay lập tức.
- *Bước 1 (Currency Config):* Icon Compass, input ký hiệu tiền tệ, toggle Prefix/Suffix với preview trực tiếp, toggle Show/Hide decimals.
- *Bước 2 (Ready):* Icon ShieldCheck, tổng hợp tất cả lựa chọn trong summary card. Nút "Get Started" → `setCurrencySymbol(customSymbol)` + `setHasCompletedOnboarding(true)` → App.tsx render main app.

Progress dots 3 chấm ở trên, active dot rộng 24px + accent color. Nút Back (bordered) + Next/Get Started (filled).

**BiometricLockScreen** (`src/screens/BiometricLockScreen.tsx`, 121 dòng)

Màn hình nhỏ nhất, render khi `isBiometricEnabled && !isUnlocked`:

- Card trung tâm (maxWidth 340, rounded 24px, shadow) chứa: Lock icon 80px, "App Locked", mô tả, nút "Unlock App".
- Bấm nút → `hasHardwareAsync()` → `isEnrolledAsync()` → nếu không có hardware hoặc chưa enroll → auto-unlock (fallback an toàn). Nếu có → `authenticateAsync()` → thành công → `onUnlock()` → parent `setIsUnlocked(true)`.
- Hiển thị `ActivityIndicator` khi đang xác thực.

> TODO: Chèn ảnh màn hình Onboarding và Biometric Lock.

### 3.5. Quản lý danh mục

**CategoryManagerModal** (`src/components/CategoryManagerModal.tsx`, 336 dòng)

Modal quản lý danh mục thu/chi, mở từ SmartBudgetScreen (Tag icon header button):

- *Form thêm danh mục:* Toggle Expense/Income, tên (useRef, key-based reset via `resetKey`), bảng chọn 8 màu predefined (red, orange, amber, green, cyan, blue, purple, pink), nút "Add Category".
- *Danh sách hiện có:* Chia nhóm Expense và Income. Mỗi danh mục hiển thị ô màu + tên + nút Trash2. Xóa qua `Alert.alert()` confirm → soft delete (`isActive = false`).

**CategoryController** (`src/controllers/CategoryController.ts`):
- `getActiveCategories()` — fetch tất cả, filter `isActive === true`
- `createCategory(name, type, color, icon)` — tạo category mới (icon mặc định "Tag")
- `deleteCategory(id)` — soft delete, giữ lại cho giao dịch cũ

### 3.6. Design patterns đã triển khai

#### Strategy Pattern (4 file)

Giải quyết bài toán: cùng một thao tác "tính chu kỳ ngân sách" nhưng thuật toán khác nhau cho weekly vs monthly.

**BudgetTimeframeStrategy** (`src/patterns/BudgetTimeframeStrategy.ts`): Interface định nghĩa `calculateCycle(anchorDay, referenceDate?) → { startDate, endDate }`.

**WeeklyBudgetStrategy** (`src/patterns/WeeklyBudgetStrategy.ts`): Tính từ anchor day (thứ trong tuần, 1–7) đến 7 ngày sau. Sử dụng `TimeService.getFirstDayOfWeek()` để xử lý locale — nếu user chọn Sunday/Monday trong Settings, strategy tính toán tương ứng. Start time = 00:00:00.000, end time = 23:59:59.999.

**MonthlyBudgetStrategy** (`src/patterns/MonthlyBudgetStrategy.ts`): Tính từ anchor day (ngày trong tháng, 1–31) đến anchor day tháng sau. Xử lý edge cases:
- Tháng ngắn: anchor=31 trong tháng 2 → clamp xuống 28 (hoặc 29 năm nhuận)
- Chuyển năm: anchor=15, tháng 12 → cycle từ 15/12 đến 14/01 năm sau
- Reference date trước/sau anchor: quyết định cycle là tháng trước hay tháng hiện tại

**BudgetStrategyResolver** (`src/patterns/BudgetStrategyResolver.ts`): Simple factory giữ singleton instances, `getStrategy(timeframe)` trả về strategy phù hợp. Default: MonthlyBudgetStrategy.

#### DebtObserver (1 file, thuộc Observer Pattern chung)

**DebtObserver** (`src/patterns/DebtObserver.ts`): Concrete observer trong observer chain do Khối A xây dựng. Chỉ phản ứng khi giao dịch mang `context.debtId`:
- `onTransactionCreated` → giảm `remainingAmount` của debt, đặt `status = SETTLED` nếu remaining = 0
- `onTransactionUpdated` → revert old amount, apply new amount
- `onTransactionDeleted` → cộng lại amount vào remaining, re-evaluate status

Trả về `Model[]` (prepared updates) — không tự ghi database, để TransactionFactory batch cùng giao dịch.

### 3.7. Database models

**Budget** (`src/database/models/Budget.ts`): `@table('budgets')`. Fields: `name`, `categoryId` (optional FK, thêm qua migration v2), `amount` (limit in cents), `timeframe` (WEEKLY/MONTHLY), `anchorDay` (1–7 hoặc 1–31), `startDate`, `endDate`, `createdAt`, `updatedAt`.

**Debt** (`src/database/models/Debt.ts`): `@table('debts')`. Fields: `personName`, `type` (LENT/BORROWED), `totalAmount` (cents), `remainingAmount` (cents), `dueDate`, `accountId` (FK), `status` (OPEN/SETTLED), `createdAt`, `updatedAt`.

**Category** (`src/database/models/Category.ts`): `@table('categories')`. Fields: `name`, `type` (INCOME/EXPENSE), `icon`, `color`, `isActive` (soft delete), `createdAt`, `updatedAt`.

### 3.8. Bảng tổng hợp file chính

| File | Vai trò |
|------|---------|
| `src/screens/SmartBudgetScreen.tsx` | Màn hình quản lý ngân sách |
| `src/screens/DebtLedgerScreen.tsx` | Màn hình sổ công nợ |
| `src/screens/SettingsScreen.tsx` | Màn hình cài đặt (6 sub-components) |
| `src/screens/OnboardingScreen.tsx` | Wizard onboarding 3 bước |
| `src/screens/BiometricLockScreen.tsx` | Màn hình khóa sinh trắc |
| `src/components/CategoryManagerModal.tsx` | Modal quản lý danh mục |
| `src/controllers/BudgetController.ts` | Logic ngân sách, rollover, progress |
| `src/controllers/DebtController.ts` | Logic công nợ, repayment, liên kết ví |
| `src/controllers/CategoryController.ts` | CRUD danh mục, soft delete |
| `src/patterns/BudgetTimeframeStrategy.ts` | Strategy interface |
| `src/patterns/WeeklyBudgetStrategy.ts` | Strategy tuần |
| `src/patterns/MonthlyBudgetStrategy.ts` | Strategy tháng |
| `src/patterns/BudgetStrategyResolver.ts` | Strategy resolver |
| `src/patterns/DebtObserver.ts` | Observer cập nhật công nợ |
| `src/database/models/Budget.ts` | WatermelonDB model ngân sách |
| `src/database/models/Debt.ts` | WatermelonDB model công nợ |
| `src/database/models/Category.ts` | WatermelonDB model danh mục |
| `tests/patterns/budgetStrategies.spec.ts` | Test Strategy pattern (6 cases, 100%) |

---

## 4. Giải thích kỹ thuật

### 4.1. Strategy pattern và anchor day

Thay vì dùng `if/else` rải rác để tính chu kỳ ngân sách, toàn bộ logic được đóng gói trong strategy classes. `BudgetController` chỉ cần gọi `BudgetStrategyResolver.getStrategy(timeframe).calculateCycle(anchorDay)` — không cần biết đang tính weekly hay monthly.

Khái niệm "anchor day" là điểm thiết kế quan trọng: thay vì bắt buộc ngân sách tháng bắt đầu ngày 1, người dùng có thể chọn ngày bất kỳ (ví dụ ngày 25 — ngày nhận lương). Strategy tính toán startDate/endDate dựa trên anchor day và ngày hiện tại.

### 4.2. Self-rolling budgets

`getBudgetsProgress()` thực hiện lazy rollover: mỗi lần fetch, nếu `now > endDate`, nó tính chu kỳ mới và persist ngay. Cách này không cần background task hay cron job — budget tự cuốn chiếu khi được truy cập. Trade-off: lần đầu mở app sau thời gian dài có thể chậm hơn (phải tính nhiều chu kỳ), nhưng với data nhỏ thì không đáng kể.

### 4.3. DebtObserver và integration với Khối A

DebtObserver là concrete observer đăng ký trong `TransactionSubject` — cùng chain với `AccountObserver` (Khối A). Khi `DebtController.recordRepayment()` tạo giao dịch qua `TransactionFactory.create()` với context `{debtId}`, observer chain kích hoạt:
1. AccountObserver → cập nhật số dư ví (Income nếu lent repayment, Expense nếu borrowed repayment)
2. DebtObserver → nhận `context.debtId`, giảm `remainingAmount`, auto-settle nếu = 0

Tất cả gom vào một `database.batch()` nguyên tử. DebtObserver trả về `Model[]` (prepared updates) — tuân thủ đúng contract của `TransactionObserver` interface mà Khối A thiết kế.

### 4.4. SettingsScreen với 6 sub-components

Mỗi section của Settings là một React component riêng (ThemeSection, CurrencySection, LocalizationSection, TimeDateSection, SecuritySection, DangerZone). Lý do tách: mỗi section truy cập slice khác nhau của Zustand store — nếu gộp vào một component lớn, khi user thay đổi theme thì toàn bộ Settings re-render (kể cả CurrencySection, SecuritySection...). Tách ra giúp mỗi section chỉ re-render khi slice state của nó thay đổi.

### 4.5. Biometric authentication flow

Luồng xác thực sinh trắc học qua expo-local-authentication cần 3 bước kiểm tra:
1. `hasHardwareAsync()` — thiết bị có sensor vân tay/Face ID không?
2. `isEnrolledAsync()` — user đã đăng ký ít nhất một vân tay/face?
3. `authenticateAsync()` — xác thực thực tế

Nếu bước 1 hoặc 2 thất bại → auto-unlock (fallback an toàn, tránh user bị khóa ngoài). Bước 3 thất bại → hiển thị alert, cho phép retry.

Permissions được khai báo trong `app.json`: Android `USE_BIOMETRIC` + `USE_FINGERPRINT`, iOS `faceIDPermission`.

### 4.6. Onboarding state gate

`hasCompletedOnboarding` trong Zustand store (persisted) đóng vai trò gate:
- `false` (mặc định) → `App.tsx` render `OnboardingScreen`
- `true` (sau "Get Started") → `App.tsx` render main app

Mọi preference chọn trong onboarding (language, theme, currency) được ghi store ngay lập tức — nếu user thoát app giữa chừng, các lựa chọn đã lưu. Chỉ cờ `hasCompletedOnboarding` quyết định có hiển thị onboarding lại hay không.

### 4.7. Validation trong BudgetController

BudgetController validate anchor day theo giới hạn: 1–7 cho weekly (ngày trong tuần), 1–31 cho monthly (ngày trong tháng). MonthlyBudgetStrategy xử lý thêm edge case khi anchor day vượt quá số ngày thực tế của tháng (clamp). Validation diễn ra ở cả tầng UI (SmartBudgetScreen check trước khi gọi controller) và tầng controller (kiểm tra lại trước khi gọi strategy).

---

## 5. Minh chứng đóng góp

### 5.1. Test coverage cho Strategy pattern

File `tests/patterns/budgetStrategies.spec.ts` chứa 6 test cases đạt 100% coverage:

| File | Line Coverage | Function Coverage |
|------|--------------|-------------------|
| `BudgetStrategyResolver.ts` | 100% (5/5) | 100% (1/1) |
| `MonthlyBudgetStrategy.ts` | 100% (23/23) | 100% (2/2) |
| `WeeklyBudgetStrategy.ts` | 100% (13/13) | 100% (1/1) |

Các test case bao gồm:
1. Weekly cycle với Monday anchor cho Tuesday reference → Mon–Sun
2. Weekly cycle với Wednesday anchor cho Tuesday reference → Wed–Tue
3. Monthly cycle khi reference trước anchor day → chu kỳ tháng trước
4. Monthly cycle khi reference sau anchor day → chu kỳ tháng hiện tại
5. Monthly cycle anchor=31 trong tháng 2 (28 ngày, non-leap)
6. Monthly cycle anchor=31 trong tháng 2 (29 ngày, leap year)

Controller layer coverage còn thấp:

| File | Line Coverage | Ghi chú |
|------|--------------|--------|
| `DebtController.ts` | 21.6% (8/37) | Chưa có unit test riêng, chỉ touch gián tiếp |
| `CategoryManagerModal.tsx` | 67.4% (31/46) | Luồng xóa chưa test đầy đủ |

### 5.2. Ảnh giao diện

> TODO: Người dùng bổ sung ảnh chụp màn hình SmartBudget, DebtLedger, Settings, Onboarding (3 bước), BiometricLock, CategoryManagerModal.

### 5.3. Git history

> TODO: Người dùng bổ sung ảnh commit hoặc lịch sử Git cho các file thuộc Khối B.

---

## 6. Khó khăn và cách giải quyết

### 6.1. Xử lý edge case trong MonthlyBudgetStrategy

Tháng 2 có 28 hoặc 29 ngày, nhưng anchor day có thể là 31. Nếu không xử lý, `new Date(2026, 1, 31)` sẽ trả về ngày 3/3 (JavaScript tự cộng thêm ngày). Giải pháp: clamp anchor day xuống số ngày thực tế của tháng bằng `Math.min(anchorDay, daysInMonth)`. Test case kiểm tra cả non-leap (28) và leap year (29).

### 6.2. Tích hợp DebtObserver vào observer chain

DebtObserver cần hoạt động song song với AccountObserver trong cùng `TransactionSubject`. Khó khăn: phải tuân thủ đúng interface `TransactionObserver` (trả về `Model[]`, không tự ghi database), và chỉ phản ứng khi giao dịch mang `context.debtId` — bỏ qua mọi giao dịch thường. Giải pháp: kiểm tra `context?.debtId` ngay đầu mỗi phương thức, return `[]` nếu không có.

### 6.3. SettingsScreen quá lớn khi gộp chung

Ban đầu toàn bộ settings gộp trong một component → mỗi thay đổi nhỏ trigger re-render toàn bộ form. Giải pháp: tách thành 6 sub-component độc lập, mỗi cái subscribe vào slice state riêng của Zustand — đây là ưu điểm của Zustand so với Context API (Context re-render toàn bộ consumer tree).

### 6.4. Biometric fallback logic

Nếu thiết bị không có hardware sinh trắc hoặc user chưa đăng ký, việc hiển thị BiometricLockScreen sẽ khóa user vĩnh viễn. Giải pháp: auto-unlock khi `hasHardwareAsync()` hoặc `isEnrolledAsync()` trả về `false`. Đồng thời, SecuritySection trong Settings cũng kiểm tra hardware/enrollment trước khi cho phép bật toggle.

---

## 7. Tự đánh giá

### Mức độ hoàn thành

Toàn bộ chức năng trong Khối B đã hoàn thành:
- SmartBudget: tạo/xóa/self-rolling, progress bar 3 mức, anchor day, gắn category
- DebtLedger: tạo debt, thanh toán từng phần, auto-settle, filter OPEN/SETTLED, overdue warning
- Settings: 6 section hoạt động độc lập, biometric toggle, database reset 2 bước
- Onboarding: wizard 3 bước, persist preferences, gate flag
- BiometricLock: 3-step auth, fallback an toàn
- CategoryManager: CRUD danh mục, 8 màu, soft delete
- Strategy pattern: 100% test coverage, edge cases (leap year, month clamping)
- DebtObserver: tích hợp observer chain, atomic batch

Điểm chưa hoàn thiện: DebtController chỉ đạt 21.6% coverage — cần bổ sung unit test riêng. Một số chuỗi trong CategoryManagerModal vẫn hardcode tiếng Anh.

### Kiến thức học được

- Áp dụng Strategy pattern cho bài toán tính toán chu kỳ thời gian với nhiều biến thể
- Triển khai Observer concrete (DebtObserver) tuân thủ interface contract do thành viên khác thiết kế
- Tích hợp expo-local-authentication cho xác thực sinh trắc học trên cả Android và iOS
- Thiết kế onboarding flow với state gate qua Zustand persist
- Tách component lớn thành sub-components để tối ưu re-render (Zustand slice subscription)

### Kỹ năng cải thiện

- Xử lý edge case phức tạp trong logic ngày tháng (month clamping, leap year, year boundary)
- Viết test thuần cho logic tính toán không phụ thuộc UI
- Làm việc nhóm: triển khai module dựa trên interface contract từ module khác

---

## 8. Kết luận

Phần việc Khối B — Ngân sách, Công nợ và Cài đặt hệ thống — đã hoàn thành đầy đủ 5 màn hình và các module hỗ trợ. Đóng góp kỹ thuật chính nằm ở Strategy pattern cho tính toán chu kỳ ngân sách (hỗ trợ anchor day linh hoạt, xử lý edge case tháng ngắn và năm nhuận), và DebtObserver tích hợp vào observer chain để tự động cập nhật công nợ khi giao dịch thanh toán được tạo.

Màn hình DebtLedgerScreen (830 dòng) là màn hình lớn nhất của ứng dụng, xử lý luồng phức tạp nhất: tạo công nợ liên kết ví, thanh toán từng phần kích hoạt observer chain, filter/sort, overdue detection. SettingsScreen với kiến trúc 6 sub-component chứng minh khả năng tối ưu re-render thực tế.

Kinh nghiệm rút ra: tuân thủ interface contract (`TransactionObserver`) giúp DebtObserver hoạt động chính xác trong observer chain mà không cần hiểu chi tiết implementation bên trong TransactionSubject hay AccountObserver — đây là giá trị thực tế của design pattern trong làm việc nhóm.

---

## GHI CHÚ NGƯỜI DÙNG CẦN HOÀN THIỆN

> ⚠️ Phần này **không phải nội dung chính thức** của báo cáo. Đây là danh sách cần rà soát trước khi nộp.

- [ ] Điền họ tên đầy đủ
- [ ] Điền MSSV
- [ ] Điền lớp
- [ ] Điền vai trò chính thức trong nhóm
- [ ] Điền ngày nộp
- [ ] Bổ sung ảnh commit liên quan đến Khối B
- [ ] Bổ sung ảnh pull request (nếu có)
- [ ] Bổ sung nhật ký công việc cá nhân
- [ ] Chèn ảnh giao diện: SmartBudget, DebtLedger, Settings, Onboarding (3 bước), BiometricLock, CategoryManagerModal
- [ ] Bổ sung minh chứng chạy chương trình (ảnh/video)
- [ ] Ghi tỷ lệ đóng góp thực tế đã thống nhất với nhóm
- [ ] Ghi nhận những thay đổi cuối cùng chưa có trong source code (nếu có)
- [ ] Sửa các chuỗi hardcode tiếng Anh trong CategoryManagerModal nếu đã fix
