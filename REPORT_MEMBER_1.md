# BÁO CÁO CÁ NHÂN

# ỨNG DỤNG QUẢN LÝ TÀI CHÍNH CÁ NHÂN — CASH FLOW WAVE

## THÀNH VIÊN 1

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

**Khối A — Tài khoản, Giao dịch và Tổng quan tài chính**

Đây là khối chức năng cốt lõi của ứng dụng, bao gồm toàn bộ luồng quản lý tài khoản, ghi nhận giao dịch thu/chi/chuyển khoản, và màn hình Dashboard tổng quan với biểu đồ trực quan hóa dữ liệu tài chính.

### Vai trò trong nhóm

Phụ trách phát triển tầng dữ liệu giao dịch, triển khai Observer pattern và Factory pattern cho hệ thống event-driven, xây dựng Dashboard với biểu đồ, và phát triển các modal CRUD cho tài khoản và giao dịch.

### Các phần dùng chung có tham gia

Ngoài khối chức năng chính, tham gia đóng góp vào các phần chung của nhóm:

- Thiết lập project ban đầu (Expo SDK 54, WatermelonDB, babel config với decorators)
- Thiết kế database schema (bảng `accounts`, `transactions` và quan hệ giữa chúng)
- Hệ thống theme (`theme.ts`) và đa ngôn ngữ (`i18n.ts`)
- Zustand store (`appStore.ts`) — các thuộc tính liên quan đến hiển thị tiền tệ (`currencySymbol`, `currencyPosition`, `showDecimals`)
- Tiện ích `currencyFormatter.ts` và `seedCategories.ts`
- Type definitions (`types/index.ts`)
- Viết test cho component thuộc Khối A
- Fix bug tích hợp giữa hai khối

Phân công này thống nhất với bảng phân công trong báo cáo nhóm (`bao_cao_di_dong.md`, mục 4).

---

## 2. Mục tiêu phần việc

### Bài toán cần giải quyết

Khối A giải quyết bài toán trung tâm của ứng dụng: *cho phép người dùng ghi nhận và theo dõi dòng tiền cá nhân*. Cụ thể:

- Người dùng cần tạo nhiều tài khoản tài chính (ví tiền mặt, ngân hàng, thẻ tín dụng) với phân biệt rõ giữa tài sản (Asset) và nợ (Liability)
- Mỗi giao dịch thu nhập hoặc chi tiêu phải được gắn với một tài khoản cụ thể, và số dư tài khoản phải được cập nhật tự động
- Người dùng cần một cái nhìn tổng quan nhanh về tình hình tài chính: tài sản ròng, xu hướng chi tiêu, phân bổ theo danh mục

### Đầu ra mong muốn

- Màn hình Dashboard hoàn chỉnh với NetWorthCard, biểu đồ cột và tròn, danh sách tài khoản, giao dịch gần đây
- Các modal CRUD: tạo tài khoản, tạo giao dịch, xem lịch sử, xem chi tiết
- Observer pattern tự động cập nhật số dư tài khoản khi giao dịch thay đổi
- Factory pattern tập trung hóa tạo/sửa/xóa giao dịch với atomic batch writes
- Facade pattern đơn giản hóa truy vấn báo cáo cho biểu đồ

### Tiêu chí hoàn thành

- Tạo tài khoản Asset/Liability với số dư ban đầu, soft delete
- Tạo giao dịch Income/Expense/Transfer với validation đầy đủ
- Số dư tài khoản tự động cập nhật qua Observer chain
- Dashboard hiển thị đúng tài sản ròng, biểu đồ 7 ngày và theo danh mục
- Test coverage cho các component: AddAccountModal, AddTransactionModal, NetWorthCard, TransactionDetailsModal, TransactionHistoryModal

---

## 3. Nội dung đã thực hiện

### 3.1. Màn hình Dashboard

`DashboardScreen.tsx` (743 dòng) là màn hình chính và lớn nhất của ứng dụng. Giao diện chia thành 5 khu vực:

**Header:** Hiển thị lời chào theo thời gian trong ngày thông qua `TimeService.getGreeting()` (sáng/chiều/tối/đêm), ngày tháng hiện tại format theo locale, và nút toggle theme xoay vòng Light → Dark → System.

**NetWorthCard:** Component nổi bật nhất, hiển thị tài sản ròng (tổng tài sản − tổng nợ) trên nền gradient SVG. Phía dưới chia hai chỉ số: tổng tài sản (xanh, icon ArrowUpRight) và tổng nợ (đỏ, icon ArrowDownRight).

**Khu vực biểu đồ:** Tab chuyển đổi giữa BarChart (chi tiêu 7 ngày) và PieChart dạng donut (phân bổ theo danh mục). Dữ liệu lấy qua `ReportFacade.getDailyExpenseTrend(7)` và `ReportFacade.getExpensesByCategory()`.

**Danh sách tài khoản:** Tất cả tài khoản đang hoạt động, phân biệt Asset (icon Wallet) và Liability (icon CreditCard). Có nút "+" thêm tài khoản mới và nút refresh.

**Giao dịch gần đây:** 5 giao dịch mới nhất với icon thu/chi, mô tả, ngày và số tiền. Bấm vào để xem chi tiết, "See All" mở lịch sử đầy đủ.

Luồng dữ liệu: `useEffect` → `seedDefaultCategories()` (idempotent) → `loadData()` fetch song song qua `Promise.all` 4 nguồn: tài khoản hoạt động, giao dịch, chi tiêu theo danh mục, xu hướng 7 ngày. Tài sản ròng tính derived từ filter accounts theo type.

> TODO: Chèn ảnh giao diện Dashboard.

### 3.2. Modal quản lý tài khoản và giao dịch

**AddAccountModal** (`src/components/AddAccountModal.tsx`): Modal bottom-sheet tạo tài khoản. Form gồm: toggle Asset/Liability (2 nút Wallet/CreditCard), tên tài khoản (useRef — uncontrolled input), số dư ban đầu (bàn phím decimal-pad, filter regex `/[^0-9.]/g`). Khi lưu, nếu số dư ≠ 0, `AccountController.createAccount()` tự động tạo giao dịch "Starting Balance Adjustment" qua `TransactionFactory` để đảm bảo Observer chain cập nhật số dư đúng cách.

**AddTransactionModal** (`src/components/AddTransactionModal.tsx`, 425 dòng): Modal tạo giao dịch, phức tạp nhất trong các component. Sử dụng `useReducer` để quản lý nhiều trường form. Giao diện gồm: toggle Expense/Income, input số tiền lớn, chọn tài khoản (FlatList ngang với `AccountPill` — `React.memo`), chọn danh mục (FlatList ngang với `CategoryPill` — `React.memo`, filter theo loại giao dịch), mô tả (useRef). Validation: amount > 0, phải chọn account, phải chọn category (trừ transfer).

**TransactionHistoryModal** (`src/components/TransactionHistoryModal.tsx`): Danh sách giao dịch toàn bộ, sử dụng `FlashList` (Shopify) với `estimatedItemSize={60}` thay vì FlatList để tối ưu render danh sách dài. Mỗi item hiển thị icon loại (xanh/đỏ), mô tả, ngày và số tiền. Bấm vào item mở `TransactionDetailsModal` lồng bên trong.

**TransactionDetailsModal** (`src/components/TransactionDetailsModal.tsx`): Hiển thị chi tiết read-only của một giao dịch. Banner số tiền (xanh cho income, đỏ cho expense), các dòng detail: mô tả, ngày giờ, tài khoản, danh mục. Thông tin tài khoản và danh mục được truy vấn bổ sung từ database khi modal mở (`onShow` → `loadDetails()`).

**NetWorthCard** (`src/components/NetWorthCard.tsx`, 175 dòng): Component hiển thị thuần, không có tương tác. Sử dụng `react-native-svg` vẽ `LinearGradient` từ `#4F46E5` sang `#818CF8` ở góc 45°, fill vào `Rect` bo góc. Nhận `totalAssets` và `totalLiabilities` (cents), tính net worth và format hiển thị. Responsive width qua `useWindowDimensions()`.

> TODO: Chèn ảnh giao diện các modal.

### 3.3. Controller và logic nghiệp vụ

**AccountController** (`src/controllers/AccountController.ts`): 3 phương thức tĩnh:
- `createAccount(name, type, initialBalanceInCents)` — tạo account, nếu balance ≠ 0 thì tạo giao dịch "Starting Balance Adjustment" (Income cho Asset có số dư dương, Expense cho Liability)
- `getActiveAccounts()` — fetch tất cả, filter `isActive === true` trong memory
- `archiveAccount(id)` — soft delete bằng cách đặt `isActive = false`

**TransactionController** (`src/controllers/TransactionController.ts`): 4 phương thức:
- `createTransaction(params, context?)` — validate (accountId required, amount > 0, type hợp lệ, transfer cần source ≠ destination), delegate sang `TransactionFactory.create()`
- `updateTransaction(id, params, context?)` — validate partial, merge, delegate sang `TransactionFactory.update()`
- `deleteTransaction(id, context?)` — delegate sang `TransactionFactory.delete()`
- `getTransactions()` — fetch tất cả, sort by date descending

Cả hai controller đều trả về envelope `{ success: boolean, data?: T, error?: string }`.

### 3.4. Design patterns đã triển khai

#### Observer Pattern (3 file chính)

Đây là pattern trung tâm mà phần việc chịu trách nhiệm. Mục tiêu: khi giao dịch thay đổi, số dư tài khoản phải được cập nhật tự động.

**TransactionObserver** (`src/patterns/TransactionObserver.ts`): Interface định nghĩa contract `onTransactionCreated()`, `onTransactionUpdated()`, `onTransactionDeleted()`. Điểm quan trọng: mỗi phương thức trả về `Promise<Model[]>` — danh sách model cần cập nhật, không tự ghi database. Thiết kế này cho phép Factory gom tất cả changes vào một batch nguyên tử.

**TransactionSubject** (`src/patterns/TransactionSubject.ts`): Subject duy trì mảng observer tĩnh, lazy-initialize với `[AccountObserver, DebtObserver]`. Các phương thức `notifyCreated/Updated/Deleted` lặp qua observer bằng `Promise.all()`, gom flat toàn bộ `Model[]` trả về.

**AccountObserver** (`src/patterns/AccountObserver.ts`): Concrete observer xử lý cập nhật số dư. Logic phân biệt loại tài khoản:
- Asset: Income → +amount, Expense → -amount
- Liability: Income → -amount, Expense → +amount
- Transfer: source -amount, destination +amount (đảo chiều cho Liability)

Khi giao dịch bị xóa, `onTransactionDeleted` đảo ngược thay đổi. Khi cập nhật, `onTransactionUpdated` revert cũ rồi apply mới.

#### Factory Pattern (1 file)

**TransactionFactory** (`src/patterns/TransactionFactory.ts`): Điểm truy cập duy nhất cho mọi thao tác giao dịch:
- `create(params, context?)` → `database.write()` → `prepareCreate` → `TransactionSubject.notifyCreated()` → `database.batch(transaction, ...observerModels)`
- `update(transaction, params, context?)` → snapshot old → `prepareUpdate` → `notifyUpdated` → batch
- `delete(transaction, context?)` → `notifyDeleted` → batch(`destroyPermanently` + observer models)

Mọi thao tác đều gom bản ghi giao dịch và side-effects (cập nhật số dư, công nợ) vào một `database.batch()` duy nhất — nếu bất kỳ bước nào thất bại, toàn bộ rollback.

#### Facade Pattern (1 file)

**ReportFacade** (`src/patterns/ReportFacade.ts`): Đơn giản hóa truy vấn báo cáo cho Dashboard:
- `getExpensesByCategory(startDate, endDate)` — truy vấn Expense trong khoảng thời gian, nhóm theo category, tra cứu màu/tên → trả về mảng sẵn sàng cho PieChart
- `getDailyExpenseTrend(daysCount=7)` — tính tổng chi tiêu mỗi ngày trong N ngày gần nhất → trả về mảng cho BarChart

Facade ẩn toàn bộ logic truy vấn WatermelonDB, build lookup map, tính tỷ lệ phần trăm — DashboardScreen chỉ cần gọi một phương thức và nhận dữ liệu đã format.

### 3.5. Database models

**Account** (`src/database/models/Account.ts`): WatermelonDB model với `@table('accounts')`. Fields: `name`, `accountType` (ASSET/LIABILITY), `currentBalance` (cents), `isActive`, `createdAt`, `updatedAt`.

**Transaction** (`src/database/models/Transaction.ts`): WatermelonDB model với `@table('transactions')`. Fields: `accountId` (FK), `type` (INCOME/EXPENSE/TRANSFER), `amount` (cents), `description`, `date` (Unix timestamp seconds), `categoryId` (optional FK), `toAccountId` (optional, for transfers), `createdAt`, `updatedAt`.

### 3.6. Bảng tổng hợp file chính

| File | Vai trò |
|------|---------|
| `src/screens/DashboardScreen.tsx` | Màn hình tổng quan tài chính chính |
| `src/components/AddAccountModal.tsx` | Modal tạo tài khoản mới |
| `src/components/AddTransactionModal.tsx` | Modal tạo giao dịch thu/chi |
| `src/components/TransactionHistoryModal.tsx` | Danh sách giao dịch đầy đủ (FlashList) |
| `src/components/TransactionDetailsModal.tsx` | Chi tiết một giao dịch |
| `src/components/NetWorthCard.tsx` | Card tài sản ròng với SVG gradient |
| `src/controllers/AccountController.ts` | CRUD tài khoản, soft delete, tạo giao dịch số dư ban đầu |
| `src/controllers/TransactionController.ts` | Validation và điều phối giao dịch |
| `src/patterns/TransactionFactory.ts` | Factory — điểm truy cập duy nhất cho giao dịch |
| `src/patterns/TransactionSubject.ts` | Subject — phân phối sự kiện cho observer |
| `src/patterns/TransactionObserver.ts` | Interface cho observer |
| `src/patterns/AccountObserver.ts` | Observer — cập nhật số dư tài khoản |
| `src/patterns/ReportFacade.ts` | Facade — truy vấn báo cáo cho biểu đồ |
| `src/database/models/Account.ts` | WatermelonDB model tài khoản |
| `src/database/models/Transaction.ts` | WatermelonDB model giao dịch |
| `tests/components/AccountsAndCategories.spec.tsx` | Test AddAccountModal, NetWorthCard |
| `tests/components/Transactions.spec.tsx` | Test AddTransactionModal, TransactionDetails/History |

---

## 4. Giải thích kỹ thuật

### 4.1. Hooks và quản lý state

Trong DashboardScreen, `useState` quản lý nhiều trạng thái cục bộ: `refreshing`, `accounts[]`, `transactions[]`, `chartTab`, `dailyTrend[]`, `categoryExpenses[]`, 4 biến visibility cho modal, `selectedTx`, `currentDateString`, `greetingKey`. Dữ liệu được load bằng `useCallback` wrapping `loadData()` để ổn định reference qua render cycles.

`useMemo` được dùng để cache `RefreshControl` node (tránh tạo lại mỗi render) và `dateFormatter` (Intl.DateTimeFormat instance).

Trong AddTransactionModal, `useReducer` quản lý state form phức tạp: type, amount, selectedAccountId, selectedCategoryId, accounts[], categories[], loading, error — tất cả trong một merged object. `useRef` cho description input (uncontrolled) để tránh re-render toàn bộ form mỗi keystroke.

`useEffect` trong AddTransactionModal theo dõi `state.type` — khi chuyển Expense ↔ Income, tự động reload danh mục lọc theo type và auto-select account/category đầu tiên.

### 4.2. Tối ưu render với React.memo

Hai sub-component `AccountPill` và `CategoryPill` trong AddTransactionModal được wrap bằng `React.memo()`. Vì FlatList render nhiều pill cùng lúc, nếu không memo thì mỗi lần parent re-render (ví dụ user gõ số tiền), tất cả pill đều re-render dù props không đổi. Kết hợp với `useCallback` cho `renderItem`, số lần render giảm đáng kể.

### 4.3. FlashList thay FlatList

`TransactionHistoryModal` sử dụng `@shopify/flash-list` thay vì FlatList mặc định. FlashList sử dụng cơ chế recycling (tái sử dụng cell view) thay vì tạo mới, hiệu năng cao hơn đáng kể khi danh sách giao dịch có thể lên hàng trăm, hàng nghìn item. `estimatedItemSize={60}` giúp FlashList tính toán layout trước khi render.

### 4.4. Observer pattern và tính nguyên tử

Điểm kỹ thuật quan trọng nhất: Observer không tự ghi database mà trả về `Model[]`. TransactionFactory thu thập tất cả model từ mọi observer rồi gom vào `database.batch()` duy nhất. Nếu đang tạo giao dịch expense 100.000đ từ ví tiền mặt:

1. `TransactionFactory.create()` tạo Transaction record (prepareCreate)
2. `TransactionSubject.notifyCreated()` → AccountObserver trả về Account model với balance -100.000
3. `TransactionSubject.notifyCreated()` → DebtObserver trả về [] (không liên quan)
4. `database.batch(newTransaction, updatedAccount)` — ghi cả hai cùng lúc

Nếu bước 2 hoặc 3 thất bại, bước 4 không xảy ra → số dư không bị sai lệch.

### 4.5. SVG gradient trong NetWorthCard

`NetWorthCard` sử dụng `react-native-svg` thay vì `expo-linear-gradient` để vẽ gradient background. Cách triển khai: `<Svg>` chứa `<Defs>` với `<LinearGradient>` từ `#4F46E5` sang `#818CF8`, fill vào `<Rect>` bo góc. Ưu điểm so với `expo-linear-gradient`: kiểm soát được góc gradient chính xác hơn và tránh thêm một native dependency.

### 4.6. Validation hai tầng

Validation diễn ra ở 2 nơi:
- **Tầng UI** (modal): kiểm tra input rỗng, format số, hiển thị inline error
- **Tầng Controller**: kiểm tra logic nghiệp vụ (amount > 0, accountId không rỗng, transfer source ≠ destination)

Cả hai tầng đều cần thiết: tầng UI cho phản hồi nhanh, tầng Controller đảm bảo an toàn khi có thay đổi UI hoặc khi giao dịch được tạo từ nơi khác (ví dụ: AccountController tạo giao dịch số dư ban đầu).

### 4.7. Currency formatting

Mọi giá trị tiền tệ trong database lưu dưới dạng integer (cents) qua `toCents()` để tránh sai số floating-point. Khi hiển thị, `fromCents()` chuyển về decimal rồi `formatCurrency(cents, symbol, position, showDecimals)` format với dấu phẩy ngàn, ký hiệu tiền tệ (prefix/suffix), và tùy chọn thập phân. Settings cho currency lấy từ Zustand store.

---

## 5. Minh chứng đóng góp

### 5.1. Test coverage cho component thuộc Khối A

Các component thuộc phạm vi đã được test với kết quả coverage:

| File | Line Coverage | Function Coverage |
|------|--------------|-------------------|
| `AddAccountModal.tsx` | 77.8% (28/36) | 100% (6/6) |
| `AddTransactionModal.tsx` | 79.2% (57/72) | 80.8% (21/26) |
| `NetWorthCard.tsx` | 100% (11/11) | 100% (1/1) |
| `TransactionDetailsModal.tsx` | 87.0% (20/23) | 100% (2/2) |
| `TransactionHistoryModal.tsx` | 86.4% (19/22) | 50% (3/6) |
| `TransactionController.ts` | 35.0% (14/40) | 20% (1/5) |

Test file `AccountsAndCategories.spec.tsx` chứa 6 test case: tạo tài khoản Asset, tạo tài khoản Liability, validation input số dư, tạo danh mục, xóa danh mục, render NetWorthCard.

Test file `Transactions.spec.tsx` chứa 5 test case: tạo giao dịch Expense, tạo giao dịch Income, render chi tiết, render lịch sử.

### 5.2. Ảnh giao diện

> TODO: Người dùng bổ sung ảnh chụp màn hình Dashboard, AddAccountModal, AddTransactionModal, TransactionHistoryModal, TransactionDetailsModal.

### 5.3. Git history

> TODO: Người dùng bổ sung ảnh commit hoặc lịch sử Git cho các file thuộc Khối A.

---

## 6. Khó khăn và cách giải quyết

### 6.1. Thiết kế Observer trả về Model[] thay vì tự ghi database

Ban đầu Observer có thể được thiết kế đơn giản hơn: mỗi observer tự gọi `database.write()` khi nhận sự kiện. Tuy nhiên, cách này dẫn đến nhiều write transaction riêng lẻ — nếu AccountObserver ghi thành công nhưng DebtObserver thất bại, dữ liệu sẽ không nhất quán. Giải pháp: thiết kế observer trả về `Model[]` (prepared updates), để Factory gom vào một `database.batch()` nguyên tử duy nhất.

### 6.2. Quản lý state phức tạp trong AddTransactionModal

Modal tạo giao dịch có nhiều trường liên quan lẫn nhau: khi đổi type (Expense ↔ Income), danh sách category phải reload, category đang chọn có thể không còn hợp lệ, account cũng cần reset. Giải pháp: sử dụng `useReducer` thay vì nhiều `useState` riêng lẻ, và `useEffect` theo dõi `state.type` để tự động cập nhật dependent states.

### 6.3. Hiệu năng render danh sách giao dịch

Khi số lượng giao dịch lớn, FlatList mặc định gây lag vì tạo mới mỗi cell view. Giải pháp: chuyển sang `@shopify/flash-list` sử dụng cơ chế recycling, kết hợp với `estimatedItemSize` để tối ưu layout calculation.

### 6.4. Tính toán tài sản ròng derived

Net worth không được lưu trong database mà tính derived mỗi lần Dashboard load. Nếu có nhiều tài khoản, việc filter + sum mỗi lần render có thể tốn chi phí. Tuy nhiên, vì số lượng tài khoản thường nhỏ (5-10), chi phí này không đáng kể nên không cần cache riêng.

---

## 7. Tự đánh giá

### Mức độ hoàn thành

Toàn bộ chức năng trong Khối A đã hoàn thành theo yêu cầu:
- Dashboard hiển thị đầy đủ: NetWorthCard, 2 loại biểu đồ, danh sách tài khoản, giao dịch gần đây
- CRUD tài khoản và giao dịch hoạt động đúng với validation
- Observer pattern cập nhật số dư tự động và nguyên tử
- Factory pattern tập trung hóa thao tác giao dịch
- Facade pattern cung cấp dữ liệu cho biểu đồ
- Test coverage trung bình ~85% cho component UI

Điểm chưa hoàn thiện: TransactionController chỉ đạt 35% coverage do test gián tiếp qua component. Cần bổ sung unit test riêng cho controller layer.

### Kiến thức học được

- Áp dụng Observer pattern trong bối cảnh database ORM (WatermelonDB) với batch writes nguyên tử
- Thiết kế Factory pattern kết hợp event-driven để tách biệt tạo record và xử lý side-effects
- Sử dụng Facade pattern để đơn giản hóa truy vấn phức tạp cho tầng UI
- Tối ưu render React Native: React.memo, useCallback, useMemo, FlashList, uncontrolled inputs
- Làm việc với WatermelonDB: decorators, schema, model relationships, batch operations

### Kỹ năng cải thiện

- Thiết kế kiến trúc event-driven trong ứng dụng mobile
- Viết unit test với Jest và Testing Library cho React Native
- Làm việc nhóm: tách module rõ ràng, giao tiếp qua interface (Observer contract)

---

## 8. Kết luận

Phần việc Khối A — Tài khoản, Giao dịch và Tổng quan tài chính — đã hoàn thành đầy đủ các chức năng cốt lõi của ứng dụng Cash Flow Wave. Đóng góp chính nằm ở việc triển khai kiến trúc event-driven thông qua Observer pattern và Factory pattern: mỗi thao tác giao dịch tự động kích hoạt chuỗi cập nhật số dư tài khoản trong một batch nguyên tử, đảm bảo toàn vẹn dữ liệu.

Dashboard với biểu đồ trực quan (BarChart, PieChart) thông qua ReportFacade cung cấp cái nhìn tổng quan nhanh cho người dùng. Các modal CRUD được thiết kế với validation hai tầng và tối ưu hiệu năng render.

Kinh nghiệm rút ra: thiết kế interface rõ ràng (TransactionObserver contract) giúp hai khối chức năng tích hợp mượt mà — Khối B (DebtObserver) hoạt động chính xác trong cùng observer chain mà không cần sửa đổi code phía Khối A.

---

## GHI CHÚ NGƯỜI DÙNG CẦN HOÀN THIỆN

> ⚠️ Phần này **không phải nội dung chính thức** của báo cáo. Đây là danh sách cần rà soát trước khi nộp.

- [ ] Điền họ tên đầy đủ
- [ ] Điền MSSV
- [ ] Điền lớp
- [ ] Điền vai trò chính thức trong nhóm
- [ ] Điền ngày nộp
- [ ] Bổ sung ảnh commit liên quan đến Khối A
- [ ] Bổ sung ảnh pull request (nếu có)
- [ ] Bổ sung nhật ký công việc cá nhân
- [ ] Chèn ảnh giao diện: Dashboard, AddAccountModal, AddTransactionModal, TransactionHistoryModal, TransactionDetailsModal, NetWorthCard
- [ ] Bổ sung minh chứng chạy chương trình (ảnh/video)
- [ ] Ghi tỷ lệ đóng góp thực tế đã thống nhất với nhóm
- [ ] Ghi nhận những thay đổi cuối cùng chưa có trong source code (nếu có)
