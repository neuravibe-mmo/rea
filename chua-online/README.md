# Chùa Sen 3D (Chùa Online) – Kiến trúc Tối giản Siêu Nhẹ

Dự án Chùa Sen 3D online thời gian thực, mô phỏng kiến trúc và nghi lễ Phật giáo truyền thống Việt Nam, xây dựng bằng **Three.js Thủ tục (Procedural 3D)**, **Giao thức Nhị phân Binary WebSocket** và **Web Audio API**.

---

## 🌟 Tính Năng Nổi Bật

### 1. Dựng Khuôn Viên 3D Thủ Tục (Procedural Generation)

- Dựng toàn bộ Chánh điện (mái cong 2 tầng đao, 22 cột gỗ, tượng Phật & thị giả), lư hương đồng 3 chân, hồ sen 18m có cầu gỗ uốn cong, tháp chuông, vườn Quan Âm, giếng ngọc và hàng đèn lồng đá.
- **Không tải bất kỳ file model 3D (GLTF/GLB) nặng**: Toàn bộ kiến trúc được sinh bằng thuật toán toán học với `GeometryBuilder`, nén toàn bộ bundle JS ứng dụng chỉ còn ~25 kB.
- Tối ưu hóa cực hạn: Gom mesh theo vật liệu, tắt `matrixAutoUpdate` cho kiến trúc tĩnh, giảm draw calls xuống dưới 10 calls.

### 2. Camera, Điều Khiển Đa Nền Tảng & Tối Ưu Mobile

- **Desktop**: Phím `W, A, S, D` / Mũi tên để di chuyển (theo hướng camera yaw), chuột kéo xoay góc nhìn Orbit mượt mà.
- **Mobile**: Cần điều khiển ảo (Virtual Joystick) trên màn hình cảm ứng, chống giật cuộn (`overscroll-behavior: none`).
- **Hệ thống va chạm (Collision Detection)**: Mảng bounding box ngăn xuyên tường, cột và lư hương; cho phép trượt mượt dọc cạnh va chạm.
- **Chống méo bố cục bàn phím ảo**: Đồng bộ `window.visualViewport` neo giữ HUD cố định.

### 3. Multiplayer Thời Gian Thực bằng Binary WebSocket

- **Gói tin nhị phân 8 bytes** đóng gói qua `DataView`:
  - Byte 0: Opcode (1 = Di chuyển, 2 = Emote, 3 = Nghi lễ, 4 = Đèn hoa đăng).
  - Byte 1-4: Tọa độ $X$ và $Z$ nhân 100 dạng `Int16` (độ chính xác centimet).
  - Byte 5: Góc quay $0 \to 255$ ánh xạ $0 \to 2\pi$.
  - Byte 6: Hoạt họa (0=Idle, 1=Walk, 2=Sit, 3=Bow).
  - Byte 7: Vị trí bồ đoàn (Seat ID, 255 = không ngồi).
- **Server Snapshot Broadcast (Opcode 16)**: Gom trạng thái người chơi phát sóng 15 tick/giây, hỗ trợ phân chia phòng tự động (Lobby).

### 4. Hệ Thống Âm Thanh (Audio Engine) & Xúc Giác (Haptics)

- **Web Audio API & Spatial Sound 3D**: `PannerNode HRTF` định vị Tháp Chuông $(15.5, 3.5, 4.0)$ và Gian Mõ $(5.25, 1.5, -18.0)$, âm thanh to dần khi đến gần và định vị chính xác tai trái/phải.
- **Audio Ducking tự động**: Giảm nhạc nền xuống $25\%$ khi tụng kinh/gõ mõ/đánh chuông, giảm sâu xuống $12\%$ khi ngồi thiền tĩnh tâm.
- **Haptic Feedback**: Rung xúc giác ngân vang (`[40, 60, 20]`) khi đánh chuông, rung dứt khoát ($25\text{ms}$) khi gõ mõ, rung nhẹ ($15\text{ms}$) khi lần từng hạt chuỗi.
- **Lần chuỗi 108 hạt & Ngồi thiền**: Bộ đếm tràng hạt từ 1 đến 108 hạt, tiếng khánh thanh thoát, hoàn thành chuỗi 108 hạt tự động ngân chuông đại hồng.

### 5. Thuật Toán Âm Lịch Thiên Văn & 48 Quẻ Chánh Niệm

- **Thuật toán Âm lịch Hồ Ngọc Đức (UTC+7)**: Tính toán điểm Sóc và 24 tiết khí, chuyển đổi chuẩn xác Dương lịch $\leftrightarrow$ Âm lịch, Can Chi Năm/Tháng/Ngày.
- **Tự động Highlight ngày lễ**: Mùng Một, Ngày Rằm, Đại lễ Phật Đản (15/4 âm), Vu Lan Báo Hiếu (15/7 âm), Vía Quán Thế Âm...
- **48 Quẻ Chánh Niệm**: Thuật toán băm `hash(userSeed + YYYY-MM-DD) % 48` đảm bảo mỗi ngày người dùng chỉ bốc đúng 1 quẻ cố định mang bài tập thực hành nuôi dưỡng tâm an.
- **Chuỗi ngày tu tập (Streak)**: Theo dõi chuỗi ngày công phu với 7 cấp bậc hoa sen (Hạt sen, Mầm sen, Lá sen, Nụ sen, Sen hé, Sen nở, Sen ngàn cánh) và checklist công phu trong ngày.

### 6. Bầu Trời Thủ Tục Ngày/Đêm & Đóng Gói PWA

- **Chu kỳ Ngày/Đêm (Day/Night Sky)**: Theo giờ Việt Nam (bình minh 6h, ban ngày nắng ấm, hoàng hôn ráng chiều 17h45, ban đêm trăng sao mây trôi và dàn đèn lồng đá sân chùa rực sáng).
- **PWA Standalone & Service Worker**: Cài đặt ứng dụng trực tiếp lên màn hình chính điện thoại, hỗ trợ mở ngay lập tức cả khi ngoại tuyến (Offline Caching).

---

## 🚀 Hướng Dẫn Cài Đặt & Chạy Thử

### 1. Khởi động Ứng Dụng (Frontend + Tự động Bật WebSocket Server)

```bash
cd chua-online
npm install
npm run dev
```

Mở trình duyệt truy cập: **`http://localhost:3000`**

_(Ghi chú: Vite plugin tích hợp sẵn `autoStartWebSocketPlugin`, tự động chạy WebSocket server tại cổng 8080)._

### 2. Build Bản Production

```bash
cd chua-online
npm run build
```

Kết quả xuất ra thư mục `dist/`, sẵn sàng triển khai lên Cloudflare Pages, Vercel, hoặc bất kỳ máy chủ tĩnh nào.
