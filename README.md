# Cash Flow Wave
Sản phẩm MVP cho ý tưởng ứng dụng quản lý tài chính cá nhân cho học phần AC3030 Phát triển ứng dụng và AC3040 Lập trình di động, hoàn thiện vào kỳ học 20252.

Xây dựng với Expo SDK 54, React Native, bug tràn lan và những trí tưởng tượng bay xa. 

Hoàn thiện tại Khoa Khoa học và Công Nghệ Giáo Dục, Đại học Bách Khoa Hà Nội

GVHD: [TS. Nguyễn Việt Tùng](https://www.mica.edu.vn/perso/Nguyen-Viet-Tung/)

Nhóm sinh viên thực hiện:
- [Nguyễn Quốc Đạt 20231570](https://tdcq.me/)
- [Trần Đình Tùng 20231646](http://itscyra.me/)

(c) 2026 @tadcouq._ and @cyra.23.05 . This software is released on behalf of 8xEducation under the terms of the BEER-GPL License.

# Hướng dẫn Build và Chạy Ứng Dụng trong môi trường Dev (Manual)

> **LƯU Ý QUAN TRỌNG TỪ BAN ĐẦU:** 
> Tóm tắt: BUILD RA 1 APP RIÊNG, KHÔNG CHẠY NATIVE TRONG EXPO GO VÌ CÓ C++, và Expo Go không hỗ trợ :/ 
> Dài dòng hơn: Dự án này sử dụng Database WatermelonDB (chứa lõi SQLite bằng C++), do đó ứng dụng Expo Go thông thường trên điện thoại sẽ không thể biên dịch được. Bạn bắt buộc phải biên dịch mã Native (Custom Dev Client).

Dưới đây là hướng dẫn từ bước bạn vừa `git pull` mã nguồn về máy tính.

---
## 0. Chuẩn bị
- Cài đặt [Node.js](https://nodejs.org/en/download/current) hoặc [Bun](https://bun.com/). (Recommend Bun vì nhanh hơn)
- Nếu build app cho Android:
  - Cài đặt [Android Studio](https://developer.android.com/studio).
  - Tạo 1 Virtual Device (máy ảo).
  - Bật [USB Debugging](https://developer.android.com/studio/debug/dev-options) trong [Developer Options](https://developer.android.com/studio/debug/dev-options). Nếu dùng Android Studio, USB Debugging đã được bật mặc định.
  - Cài đặt [Usb Driver](https://developer.android.com/studio/run/win-usb).
  - Cài đặt [Java version 21](https://www.oracle.com/java/technologies/downloads/).
- Nếu build app cho iOS:
  - Cài đặt [Xcode](https://developer.apple.com/xcode/). (Chỉ dành cho MacOS)

## 1. Cài đặt Dependencies

Trước khi chạy bất kỳ thứ gì, hãy đảm bảo bạn cài đặt toàn bộ các gói thư viện Node.js cần thiết.
Mở Terminal tại thư mục gốc của dự án và chạy:
```bash
npm install
```

Nếu bạn đủ turf và sigma, hãy dùng bun, bun gud
```bash
bun install
```

*(Lưu ý: Môi trường máy tính của bạn phải được cài sẵn **Xcode** (nếu dùng Mac) và **Android Studio** giống như yêu cầu mặc định của React Native CLI).*
*(Lưu ý số 2: `bun test` không thay thế hoàn toàn trong việc chạy jest test với lệnh `npx test` trong 1 số trường hợp cụ thể, nên là dùng song song vẫn sẽ là 1 quyết định đúng đắn, dù hơi ngu độn)*

---
Tiếp theo chạy lệnh sau:
```bash
bun start
```
## 2. Chạy phục vụ Phát triển (Development) trên Simulator / Emulator

Lệnh này sẽ biên dịch mã Native cục bộ trên máy tính của bạn (Local Build) và cài đặt một phiên bản "Dev Client" lên máy ảo.

### Chạy trên iOS Simulator (Chỉ dành cho macOS)
Chạy lệnh sau:
```bash
npm run ios
# (Tương đương: npx expo run:ios)
```
- Lệnh này sẽ tự động tìm thư mục `ios/`, chạy `pod install` để kéo các thư viện Native (bao gồm cả thư viện C++ của WatermelonDB) về.
- Sau đó, nó dùng Xcode để build và tự động mở ứng dụng trên iOS Simulator.

### Chạy trên Android Emulator
Mở sẵn máy ảo Android Emulator thông qua Android Studio (hoặc cắm điện thoại Android thật đã bật USB Debugging), sau đó chạy:
```bash
npm run android
# (Tương đương: npx expo run:android)
```
- Hệ thống sẽ gọi Gradle để build project. Lần build đầu tiên có thể mất từ 2-5 phút vì C++ cần thời gian biên dịch.

---

**Tóm lại chu trình hàng ngày của Dev:**
Code `->` Mở máy ảo `->` Gõ `npm run ios` hoặc `npm run android` `->` Ứng dụng tự reload khi sửa code `.ts/.tsx`.

### Nếu bạn đọc đến đây mà vẫn muốn dùng bun, chắc cũng không cần đâu nhỉ, động não đi hì hì.

---

## 3. Các lỗi Build Android phổ biến và cách khắc phục

Trong quá trình chạy `npm run android` hoặc `bun run android`, bạn có thể gặp một số lỗi cấu hình môi trường dưới đây:

### Lỗi 1: Unsupported class file major version 69
- **Dấu hiệu**: Gradle báo lỗi `BUG! exception in phase 'semantic analysis' in source unit '_BuildScript_' Unsupported class file major version 69`.
- **Nguyên nhân**: Máy bạn đang dùng mặc định Java 25 (version 69), nhưng Gradle 8.14.3 chỉ hỗ trợ đến Java 24.
- **Cách sửa**: Chuyển sang sử dụng Java 21 bằng lệnh:
  ```bash
  export JAVA_HOME=$(/usr/libexec/java_home -v 21)
  ```
  *(Mẹo: Bạn nên thêm dòng này vào file `~/.zshrc` để máy luôn tự nhận Java 21 mỗi khi mở Terminal).*

### Lỗi 2: SDK location not found
- **Dấu hiệu**: Lỗi `SDK location not found. Define a valid SDK location with an ANDROID_HOME...`
- **Nguyên nhân**: Project chưa biết đường dẫn đến Android SDK.
- **Cách sửa**: Tạo file `android/local.properties` và thêm đường dẫn SDK vào (thường trên macOS là `/Users/<username>/Library/Android/sdk`):
  ```properties
  sdk.dir=/Users/mac/Library/Android/sdk
  ```

### Lỗi 3: Unresolved reference 'OptimizedRecord' (expo-dev-client)
- **Dấu hiệu**: Lỗi biên dịch Kotlin ở task `:expo-dev-menu:compileDebugKotlin` báo `Unresolved reference 'OptimizedRecord'`.
- **Nguyên nhân**: Bất đồng bộ phiên bản giữa `expo` và `expo-dev-client`.
- **Cách sửa**: Hãy đảm bảo bạn cài đặt phiên bản `expo-dev-client` tương thích với phiên bản Expo hiện tại bằng lệnh:
  ```bash
  bunx expo install expo-dev-client
  ```

### Lỗi 4: Unresolved reference 'JSIModulePackage'
- **Dấu hiệu**: Lỗi biên dịch `:app:compileDebugKotlin` báo `Unresolved reference 'JSIModulePackage'`.
- **Nguyên nhân**: Class `JSIModulePackage` đã bị loại bỏ khỏi React Native 0.74+. Plugin của WatermelonDB đôi khi tự động chèn import này vào file `MainApplication.kt` gây lỗi.
- **Cách sửa**: Mở file `android/app/src/main/java/com/anonymous/cashflowwave/MainApplication.kt` và xoá dòng import thừa sau:
  ```kotlin
  import com.facebook.react.bridge.JSIModulePackage;
  ```