# Kiểm tra các tiêu chí

| Giai đoạn | Chi tiết | Trạng thái | Ghi chú |
|-----------|---------|:---:|---------|
| Kick off | "Chọn đề tài, xác định mục tiêu.<br>Chốt phạm vi MVP." | v | Đã chốt ở `project-overview.md`. |
| Review MVP | "Viết user stories/use cases.<br>Mô tả dữ liệu vào ra<br>Loại bỏ chức năng phụ của MVP" | v | Đã xác định rõ luồng dữ liệu, loại bỏ những phần thừa. |
| Thiết kế kiến trúc | "Chia mô đun (presentation, appication, domain, infrastructure).<br>Xác định nơi áp dụng pattern." | v | Cấu trúc phân lớp rõ ràng: `screens`/`components` (UI), `controllers` (App), `patterns` (Domain), `database` (Infra). |
| Xây domain model và service lõi | Dựng project Electron + TypeScript: cấu hình lint, test, tạo skeleton source code<br>"Xây domain model và service lõi.<br>Viết unit test đầu tiên." | 0 | Đã hoàn thiện toàn bộ skeleton, test, domain model nhưng bằng **React Native/Expo** (không dùng Electron nên không đạt tuyệt đối về mặt wording). |
| Review draft version | "Hoàn thiện nghiệp vụ chính.<br>Cài pattern thứ 2.<br>Mở rộng test business logic." | v | Đã cài đặt 4 Design Patterns, pass 100% các unit test logic. |
| Tạo dữ liệu mẫu, Test | Làm repository và lưu dữ liệu; mock repository để test | v | DB WatermelonDB hoạt động tốt, mock dữ liệu trong test. |
| First UI | "Xây UI.<br>Nối UI với service.<br>Xử lý validate cơ bản." | v | Hoàn thành toàn bộ flow UI từ Onboarding đến Dashboard, Budget, Debt. |
| Hoàn thiện chức năng phụ tối thiểu | Như tìm kiếm, lọc, thống kê, preview | v | Đã có biểu đồ thống kê, lịch sử giao dịch chi tiết, danh mục. |
| Review (refactor) | Refactor theo SOLID, tăng test coverage, sửa code smell và chuẩn hóa cấu trúc mã | 0 | Đã dọn dẹp và refactor, nhưng coverage có thể mở rộng thêm và đánh giá SOLID sâu hơn trước khi nộp. |
| Viết báo cáo, slide | "Giải thích pattern/SOLID/test cases.<br>Chuẩn bị dữ liệu demo." | 0 | Đã có tài liệu giải thích (markdown) nhưng chưa đóng gói thành báo cáo/slide chính thức và data demo cho buổi bảo vệ. |
| Kiểm thử cuối, build bản demo | Chốt tài liệu nộp (trước 23h59' 21/06) | 0 | Đã test build thành công hbc/app, nhưng chưa chốt phiên bản nộp cuối cùng do chưa đến hạn. |