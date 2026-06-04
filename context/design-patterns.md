# Phân tích MVC & Design Patterns trong Cash Flow Wave

Hệ thống của Cash Flow Wave được xây dựng trên một kiến trúc chặt chẽ nhằm đảm bảo tính toàn vẹn dữ liệu (đặc biệt trong nghiệp vụ kế toán) và khả năng mở rộng. Kiến trúc này là sự kết hợp của mô hình **MVC** và **4 Core Design Patterns**.

---

## 1. Kiến trúc MVC (Model - View - Controller)

Mô hình MVC giúp chia tách ứng dụng thành 3 lớp rõ rệt, ngăn chặn tình trạng "Spaghetti code" (code rối rắm) thường gặp trong phát triển di động.

### a. Model (Dữ liệu & Cấu trúc)
- **Vị trí**: `src/database/models/` (bao gồm `Account.ts`, `Transaction.ts`, `Debt.ts`, `Budget.ts`, `Category.ts`) và `schema.ts`.
- **Vai trò**: Quản lý và định nghĩa cấu trúc dữ liệu lưu trữ offline. Thông qua WatermelonDB, các Model này không chỉ lưu trữ mà còn có tính chất **Reactive** — khi dữ liệu thay đổi, giao diện sẽ tự động cập nhật mà không cần truy vấn lại.
- **Tác động**: Đảm bảo mọi bản ghi đều tuân thủ các quy tắc dữ liệu khắt khe (ví dụ: cấm số tiền âm).

### b. View (Giao diện hiển thị)
- **Vị trí**: `src/screens/` (như `DashboardScreen`, `DebtLedgerScreen`) và `src/components/` (như `AddTransactionModal`).
- **Vai trò**: Lớp này chỉ chịu trách nhiệm render giao diện bằng React Native. View tuân thủ nguyên tắc "Dumb/Skinny View" (Giao diện ngu ngốc/mỏng) — nó **không bao giờ** tương tác trực tiếp với Database.
- **Tác động**: Khi người dùng thao tác (ví dụ bấm "Lưu giao dịch"), View chỉ việc lấy dữ liệu nhập vào và gửi tới Controller.

### c. Controller (Điều khiển & Trung chuyển)
- **Vị trí**: `src/controllers/` (như `TransactionController.ts`, `AccountController.ts`, `CategoryController.ts` *(Bổ sung)*).
- **Vai trò**: Là cầu nối trung gian. Controller nhận yêu cầu từ View, thực hiện **Validation** (Kiểm tra tính hợp lệ của input, ví dụ: kiểm tra số tiền > 0, tài khoản nguồn khác tài khoản đích), xử lý lỗi, sau đó ra lệnh cho các Design Patterns để cập nhật Database.
- **Tác động**: Chặn đứng mọi dữ liệu bẩn trước khi chúng có cơ hội chạm vào Database, giữ cho View không chứa logic nghiệp vụ. Đặc biệt:
  - `CategoryController` đảm bảo chính sách **Xóa mềm (Soft Delete)**: khi người dùng xóa danh mục tùy chỉnh, nó chỉ chuyển trạng thái `isActive = false` thay vì xóa hẳn khỏi DB, bảo toàn lịch sử giao dịch và báo cáo.
  - `BudgetController` giờ đây thông minh hơn khi hỗ trợ liên kết Danh mục (Category-linked Budgets). Nó sẽ tự động lọc và chỉ cộng dồn các giao dịch thuộc đúng danh mục đã gài vào ngân sách.

### d. Kiến trúc Modal Stacking (Giao diện xếp chồng lớp)
- **Vấn đề iOS**: Trên iOS, việc trình bày (present) một Modal mới đè lên root view (Dashboard) trong khi đã có một Modal khác đang che phủ sẽ gây ra lỗi "Silent Freeze" (đóng băng ứng dụng).
- **Giải pháp áp dụng**: Áp dụng cơ chế **Nested Modals (Modal lồng nhau)**. Các Modal con (như `TransactionDetailsModal`) được render trực tiếp bên trong phân cấp Component của Modal cha (như `TransactionHistoryModal`) thay vì ném ngược sự kiện ra ngoài Screen chính. Điều này giúp hệ điều hành quản lý luồng hiển thị chính xác theo cấu trúc cây DOM.

---

## 2. Các Mẫu Thiết Kế Cốt Lõi (4 Core Design Patterns)

Được đặt tại `src/patterns/`, các Patterns này xử lý phần phức tạp nhất của ứng dụng: **Nghiệp vụ kế toán (Business Logic)**.

### 2.1. Factory Pattern (Mẫu Khởi tạo)
- **File Implement**: `src/patterns/TransactionFactory.ts`
- **Vai trò**: Đóng gói quy trình tạo dữ liệu phức tạp. 
- **Tác động tới ứng dụng**: 
  Mọi giao dịch mới trong hệ thống đều bị ép buộc phải sinh ra qua hàm `TransactionFactory.create()` hoặc `update()`. Nó đóng vai trò "Nhạc trưởng", thu thập bản ghi giao dịch mới tạo cùng toàn bộ các bản ghi cập nhật số dư từ các Observers, sau đó gom tất cả lại và thực thi trong **duy nhất một lệnh `database.batch()`** nguyên tử. Điều này đảm bảo tính nhất quán tuyệt đối của cơ sở dữ liệu và khắc phục triệt để lỗi "Lock ActionQueue" của React Native khi chạy các tác vụ bất đồng bộ.

### 2.2. Observer Pattern (Mẫu Quan sát)
- **File Implement**: `src/patterns/TransactionSubject.ts` (Đóng vai trò nhà xuất bản), `AccountObserver.ts`, `DebtObserver.ts` (Đóng vai trò người theo dõi).
- **Vai trò**: Đồng bộ hóa dữ liệu chéo nhau theo nguyên tắc kế toán kép.
- **Tác động tới ứng dụng**: 
  Khi bạn ghi một giao dịch "Chi tiêu 50k", `AccountObserver` (đang lắng nghe) sẽ nhận được thông báo. Thay vì tự ý can thiệp vào Database, nó chỉ tính toán lại số dư Ví và trả về một bản nháp cập nhật (`prepareUpdate` - `Promise<Model[]>`). Nhờ vậy, logic cập nhật số dư được tách biệt hoàn toàn nhưng vẫn đảm bảo thực thi an toàn trong 1 Batch.
  Đồng thời, `TransactionSubject` sử dụng cơ chế **Khởi tạo lười (Lazy Initialization)** qua hàm `getObservers()` để chống lại hiện tượng "Nuốt mất Observer" của bộ đệm Fast Refresh trong môi trường phát triển Expo.

### 2.3. Strategy Pattern (Mẫu Chiến lược)
- **File Implement**: `src/patterns/BudgetTimeframeStrategy.ts` (Interface) cùng các class thực thi `WeeklyBudgetStrategy.ts` và `MonthlyBudgetStrategy.ts` (Được gọi qua `BudgetStrategyResolver.ts`).
- **Vai trò**: Trừu tượng hóa các thuật toán tính toán thời gian cho Ngân sách.
- **Tác động tới ứng dụng**: 
  Tính năng Ngân sách Thông minh (Smart Budget) cho phép người dùng đặt ngân sách theo Tuần hoặc Tháng. Mỗi khung thời gian lại có công thức tính ngày bắt đầu/kết thúc và số tiền đã tiêu khác nhau. Nhờ Strategy Pattern, thay vì nhét hàng loạt lệnh `if (type === 'WEEKLY') else if (type === 'MONTHLY')` vào code, ứng dụng chỉ cần lấy đúng class chiến lược ra và gọi hàm `calculate()`. 
  Hơn nữa, các Strategy này hiện được tích hợp chặt chẽ với `TimeService`, cho phép chúng tự động thích ứng với cấu hình "Ngày đầu tiên của tuần" (First Day of Week) của người dùng và đồng bộ giờ mạng (Network Time Sync) thay vì phụ thuộc vào giờ hệ thống thiết bị.

### 2.4. Facade Pattern (Mẫu Mặt tiền)
- **File Implement**: `src/patterns/ReportFacade.ts`
- **Vai trò**: Che giấu sự phức tạp của việc truy vấn cơ sở dữ liệu và xử lý báo cáo.
- **Tác động tới ứng dụng**: 
  Để vẽ được biểu đồ tròn (Pie Chart) trong Dashboard, hệ thống phải query hàng trăm giao dịch, nhóm chúng lại theo Category, lọc theo thời gian và tính tổng. `ReportFacade` cung cấp một API cực kỳ tinh gọn ra bên ngoài: `ReportFacade.getExpensesByCategory(startDate, endDate)`. Nhờ vậy, `DashboardScreen` chỉ việc gọi 1 dòng code đó để lấy Data vẽ biểu đồ, không cần bận tâm bên dưới tính toán bằng SQL hay vòng lặp thế nào.
