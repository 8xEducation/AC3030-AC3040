# Hướng dẫn Build và Chạy Ứng Dụng trong môi trường Dev (Manual)

> **LƯU Ý QUAN TRỌNG TỪ BAN ĐẦU:** 
> Tóm tắt: BUILD RA 1 APP RIÊNG, KHÔNG CHẠY NATIVE TRONG EXPO GO VÌ CÓ C++, và Expo Go không hỗ trợ :/ 
> Dài dòng hơn: Dự án này sử dụng Database WatermelonDB (chứa lõi SQLite bằng C++), do đó ứng dụng Expo Go thông thường trên điện thoại sẽ không thể biên dịch được. Bạn bắt buộc phải biên dịch mã Native (Custom Dev Client).

Dưới đây là hướng dẫn từ bước bạn vừa `git pull` mã nguồn về máy tính.

---

## 0. Cài đặt Dependencies

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

## 1. Chạy phục vụ Phát triển (Development) trên Simulator / Emulator

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

## 2. Build ứng dụng để Phát hành hoặc Cài đặt thật (Build Release / IPA / APK)

Để tạo ra file ứng dụng có thể cài đặt độc lập (không cần cắm cáp vào máy tính), cách dễ nhất cho dự án Expo là sử dụng dịch vụ **EAS Build** (Cloud Build của Expo) thay vì phải vật lộn với cấu hình Xcode/Android Studio phức tạp.

**Bước chuẩn bị chung:**
Cài đặt EAS CLI toàn cục và đăng nhập tài khoản Expo (tạo miễn phí tại expo.dev):
```bash
npm install -g eas-cli
eas login
```

### A. Build cho Android (.apk)
Nếu bạn chỉ muốn tạo file `.apk` để gửi cho bạn bè cài trực tiếp:
1. Đảm bảo file `eas.json` của dự án có profile cấu hình xuất file APK (thường gọi là preview).
2. Chạy lệnh:
```bash
eas build --platform android --profile preview
```
Hệ thống sẽ đẩy code lên Cloud, build xong sẽ trả về cho bạn một đường link tải file `.apk`.

### B. Build cho iOS (.ipa)
Việc build file `.ipa` để cài đặt trực tiếp lên iPhone khắt khe hơn rất nhiều vì Apple yêu cầu **chữ ký điện tử**. Bạn **bắt buộc** phải mua gói Apple Developer Program ($99/năm).
```bash
eas build --platform ios
```
Khi chạy lệnh này:
- EAS sẽ yêu cầu bạn đăng nhập tài khoản Apple.
- Hệ thống sẽ tự động tạo Certificates và Provisioning Profiles phù hợp.
- Sau khi build xong trên Cloud, bạn sẽ nhận được file `.ipa` để đẩy lên TestFlight thông qua Transporter hoặc OTA cài đặt qua web.

---

**Tóm lại chu trình hàng ngày của Dev:**
Code `->` Mở máy ảo `->` Gõ `npm run ios` hoặc `npm run android` `->` Ứng dụng tự reload khi sửa code `.ts/.tsx`.