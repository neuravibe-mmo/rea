# Đặc Tả Kỹ Thuật (SPEC) — Mạng Xã Hội Giáo Dục EduChat.vn

> **Tài liệu đặc tả kiến trúc, hành vi JavaScript, hệ thống xác thực và API của trang web [https://educhat.vn/](https://educhat.vn/)**  
> Thu thập và xác minh thực nghiệm bằng công cụ **REA (Reverse Engineering Anything) Browser Analysis**.  
> **Evidence ID:** `ev_15106bc674d44621997271cae206f0d17d8178749147b7ac92093ca2180287da`  
> **Thời điểm trích xuất:** `2026-10-27`

---

## 1. Tổng Quan Hệ Thống & Pháp Lý (System Overview)

### 1.1 Thông Tin Nền Tảng & Bản Quyền

- **Tên nền tảng:** EduChat.vn — Mạng xã hội giáo dục
- **URL chính thức:** `https://educhat.vn/`
- **Đơn vị chủ quản:** CÔNG TY CỔ PHẦN TƯ VẤN DỊCH VỤ TRUYỀN THÔNG ATHENA
- **Căn cứ pháp lý:** Giấy phép thiết lập Mạng xã hội số **380/GP-BTTTT**, do Bộ Thông tin và Truyền thông cấp ngày 16/12/2024.
- **Người chịu trách nhiệm nội dung:** Lê Thị Minh Hằng
- **Trụ sở:** Số 4/148 Hoàng Ngân, phường Trung Hòa, quận Cầu Giấy, TP Hà Nội.
- **Thỏa thuận dịch vụ:** `/thoathuan.pdf`

### 1.2 Hạ Tầng Máy Chủ & Mạng

- **Giao thức:** `HTTP/2`, `TLS 1.3`, `gzip/brotli`
- **CDN & Phân phối nội dung:**
  - Cloudflare Edge (`server: cloudflare`, `cf-cache-status: DYNAMIC/BYPASS`)
  - CDN chuyên dụng cho Media & Assets: `sf2.ex-cdn.com` (Scripts, CSS, Images), `i2.ex-cdn.com` (Uploads, Avatars), `t2.ex-cdn.com` (Thumbnails).
- **Backend CMS Engine:** Kiến trúc PHP MVC Module-Action (`?mod={module}&act={action}`) kết hợp Nginx/1.20.1 và FastCGI (`x-fastcgi-cache: BYPASS`).

---

## 2. Cấu Trúc DOM & Giao Diện Người Dùng (Page Architecture)

### 2.1 Metadata & Head Tags

- **Ngôn ngữ:** `vi` (`<meta http-equiv="content-language" content="vi">`)
- **Responsive Viewport:** `<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=yes">`
- **Tác giả & Bản quyền:** `<meta name="AUTHOR" content="EduChat">`, `<meta name="COPYRIGHT" content="EduChat">`
- **OpenGraph:** `og:url="https://educhat.vn"`, `og:type="website"`

### 2.2 Thư Viện Frontend & Tài Nguyên Sử Dụng

- **Core Library:** `jQuery 3.6.0` (`https://code.jquery.com/jquery-3.6.0.min.js`)
- **Cookie Helper:** `jquery.cookie.min.js` (v1.4.1)
- **Hiệu ứng Trượt / Slider:** `swiper-bundle.min.js` & `swiper-bundle.min.css`
- **Xem ảnh & phóng to (Lightbox):** `jquery.fancybox.min.js` & `jquery.fancybox.min.css`
- **Thanh cuộn & Sidebar dính:** `theia-sticky-sidebar.js` & `ResizeSensor.js`
- **Iframe Resizer:** `iframeResizer.min.js`
- **Trình phát Video:** `JWPlayer` HTML5 (`lib/player/jwplayer/jwplayer.js`, `player.css`)
- **Bản đồ nhúng:** Google Maps Embed API (`https://www.google.com/maps/embed`)
- **Typography:**
  - Bộ font Helvetica (`HelveticaNeue.otf`, `HelveticaNeue-Medium.otf`, `HelveticaNeue-Bold.otf`) từ CDN `sf2.ex-cdn.com`.
  - Google Fonts: `Mulish` (weights 300..800) và `Noto Serif` (weights 300..800).

### 2.3 Cấu Trúc Menu Điều Hướng (Navigation Bar)

Nằm trong thẻ `<nav class="navbar">` trên thanh Header:

1. **Trang chủ:** `/`
2. **Bài viết:** `https://educhat.vn/bai-viet/`
3. **Hồ sơ:** `https://educhat.vn/ho-so/`
4. **Khóa học:** `https://educhat.vn/khoa-hoc/` (chứa menu con `Khóa học mới` tại `https://educhat.vn/khoa-hoc-moi/`)
5. **Tài liệu:** `https://educhat.vn/tai-lieu/`
6. **Giới thiệu:** `/about/`
7. **Đăng nhập / Đăng ký:** `/login/`

### 2.4 Các Phân Khu Nội Dung Trang Chủ (Page Sections)

1. **Header (`#header`):** Logo `Mạng xã hội giáo dục`, mạng xã hội liên kết (Facebook, TikTok, YouTube, Twitter, Instagram), ô tìm kiếm và nút trạng thái tài khoản.
2. **Banner Chính (`.section-primary`):** Trình diễn Slide tương tác (`js__oneSlidesContainer`) giới thiệu tầm nhìn của EduChat.
3. **Tiêu Điểm & Bài Viết Mới (`.section-secondary`):** Lưới bài viết 4 cột (`col-4`) chia làm bài viết lớn nổi bật (`article-large`) và danh sách bài viết chuyên mục.
4. **Khu Vực Video Ngắn / Shorts (`.section-senary`):** Danh sách video dạng thẻ (`.exp_short_player`), tích hợp trình phát video JWPlayer.
5. **Khu Vực Bản Đồ & Pháp Lý (`.section-septernary`):** Hiển thị giấy phép MXH của Bộ TTTT và vị trí công ty trên Google Maps.
6. **Footer (`#footer`):** Thông tin bản quyền, nút cuộn lên đầu trang (`#back-top`) và liên kết mạng xã hội.

---

## 3. Hệ Thống Tài Khoản & Cơ Chế Xác Thực (Auth & Session Spec)

Khác với các trang landing page thông thường, **EduChat.vn sở hữu hệ thống tài khoản đầy đủ (Authentication System)**.

### 3.1 Quản Lý Trạng Thái Đăng Nhập Client-Side

- **Lưu trữ phiên:** Sử dụng `localStorage` với key `"user"`.
- **Cơ chế hoạt động (Inline Script #1):**
  ```javascript
  document.addEventListener("DOMContentLoaded", function () {
    const user = localStorage.getItem("user");
    const notLogged = document.querySelector(".not-logged");
    const logged = document.querySelector(".logged");

    if (user) {
      // Đã đăng nhập: Ẩn nút đăng nhập, hiển thị avatar & tên
      notLogged.style.display = "none";
      logged.style.display = "block";

      try {
        const userData = JSON.parse(user);
        const nameEl = document.querySelector(".logged-heading h3");
        if (nameEl && userData.fullname) {
          nameEl.textContent = userData.fullname;
        }

        const avatarEl = document.querySelector(".avatar img");
        if (avatarEl && userData.avatar) {
          avatarEl.src = "https://i2.ex-cdn.com/educhat.vn" + userData.avatar;
        }
      } catch (e) {
        console.error("Lỗi phân tích user từ localStorage:", e);
      }

      // Xử lý đăng xuất
      const logoutBtn = document.querySelector(".log-out");
      if (logoutBtn) {
        logoutBtn.addEventListener("click", function () {
          localStorage.removeItem("user");
          window.location.reload();
        });
      }
    } else {
      // Chưa đăng nhập
      logged.style.display = "none";
      notLogged.style.display = "block";
    }
  });
  ```

---

### 3.2 Giao Diện & Form Đăng Nhập / Đăng Ký (`/login/`)

Trang `/login/` hỗ trợ chuyển đổi linh hoạt giữa 2 form thông qua hàm `toggleForms()`:

#### A. Form Đăng Nhập (`#login_form`)

- **Các trường dữ liệu:**
  - `email` (Tên đăng nhập / Email, kiểu `text`, `required`).
  - `password` (Mật khẩu, kiểu `password`, `required`).
- **Nút bấm:** `#login_submit`.
- **Hành vi JavaScript:**
  1. Chặn submit form mặc định: `e.preventDefault()`.
  2. Gom dữ liệu bằng `new FormData(form)`.
  3. Gửi AJAX POST tới: `/?mod=archive&act=login`.
  4. Nếu `res.success === true`:
     - Lưu thông tin người dùng: `localStorage.setItem("user", JSON.stringify(res.user))`.
     - Điều hướng về trang chủ: `window.location.href = "/"`.
  5. Nếu `res.success === false`:
     - Báo lỗi: `alert("Đăng nhập thất bại: " + (res.error || "Không rõ lỗi"))`.

#### B. Form Đăng Ký Tài Khoản (`#register_form`)

Tuân thủ quy định pháp luật Việt Nam đối với Mạng xã hội (xác thực số CCCD và vai trò):

- **Các trường dữ liệu:**
  - `fullname`: Tên đăng nhập / Họ tên (`required`).
  - `phone`: Số điện thoại liên hệ (`type="tel"`, `required`).
  - `cccd`: Số căn cước công dân (`type="number"`, `required`).
  - `chucvu`: Chức vụ/vai trò trong giáo dục (`<select>` gồm 2 lựa chọn: `"Học viên"` hoặc `"Giảng viên"`).
  - `avatar`: Tệp ảnh đại diện (`type="file"`, accept: `image/jpg,image/jpeg,image/png`, bắt buộc).
  - `password`: Mật khẩu đăng nhập (`required`).
  - `email`: Hộp thư điện tử (`type="email"`, `required`).
- **Nút bấm:** `#register_submit`.
- **Đích xử lý:** `POST /?mod=archive&act=signup`.

---

## 4. Đặc Tả JavaScript Khách & Các Tính Năng Tương Tác

### 4.1 Cơ Chế Trình Tải Lười Script (Lazy Script Loader)

Trong `Inline Script #14`, trang tối ưu hóa tốc độ tải ban đầu bằng cơ chế Lazy JS:

```javascript
function run_js() {
    if(is_run) return true; is_run = true;
    $('script[type='+device+'js][src]').each(function(){ ... $.getScript(url); });
    $('script[type=lazyjs][src]').each(function(){ ... $.getScript(url); });
    $('script[type=lazyjs]:not([src])').each(function(){ ... eval(sc); });
}
$(window).focus(function() { run_js(); });
if (!document.hidden) { run_js(); }
```

- Phân biệt thiết bị client (`mobile` hoặc `desktop`).
- Các script chỉ định `lazyjs` (như hệ thống bình luận `expluscmt.js`) chỉ được nạp khi trang đang active (`!document.hidden`) hoặc nhận được sự kiện focus của người dùng.

### 4.2 Trình Phát Video Shorts (JWPlayer Integration)

- **Selector:** `.exp_short_player[data-video]`
- **Cơ chế:**
  - Tự động gắn icon SVG nút Play màu trắng.
  - Khi người dùng click:
    1. Hủy bất kỳ JWPlayer nào đang phát trước đó để tránh xung đột âm thanh (`.jwplayer.detach()`).
    2. Đọc link video từ thuộc tính `data-video` và ảnh bìa từ thẻ `<img>`.
    3. Tạo thẻ container ID ngẫu nhiên `player-{random}`.
    4. Khởi tạo JWPlayer HTML5 (`autostart: true`, `volume: 100`, `androidhls: true`).

### 4.3 Tính Năng Tải Thêm Bài Viết Phân Trang (Load More AJAX)

- **Selector:** `.loadmore_here`
- **Cơ chế hoạt động:**
  1. Khi người dùng click nút xem thêm, tăng biến đếm `page++`.
  2. Gửi AJAX POST tới: `/?mod=iframe&act=load_more&v={timestamp}`.
  3. Tham số: `{ category_id, page, slug_search }`.
  4. Nối HTML nhận được vào vùng chứa `.apppen_box`.
  5. Khi hết bài viết, hiển thị thông báo: `<p>Bạn đã xem hết bài viết!</p>` và ẩn nút `.loadmore_here`.

### 4.4 Hiển Thị Thời Gian Động Theo Chuẩn Tiếng Việt

- **Đồng hồ hệ thống:** Tự động tính toán ngày trong tuần (`Chủ Nhật`, `Thứ Hai`,...), ngày, tháng, năm, giờ, phút GMT+7 và hiển thị vào phần tử `.time`.
- **Định dạng Relative Time (`getTimeInterval`):** Chuyển timestamp UNIX từ thuộc tính `data-date` thành định dạng tiếng Việt thân thiện:
  - `< 60s`: "vừa xong"
  - `>= 60s`: "X phút trước"
  - `>= 3600s`: "X giờ trước"
  - `>= 86400s`: "X ngày trước"
  - `>= 31536000s`: "X năm trước"

### 4.5 Chia Sẻ Nội Dung (Web Share API)

- Sử dụng API trình duyệt chuẩn `navigator.share`:
  ```javascript
  const shareData = {
    title: $(".infornews").attr("name"),
    url: $(".infornews").attr("link"),
  };
  document.querySelector(".datashare").addEventListener("click", async () => {
    await navigator.share(shareData);
  });
  ```

---

## 5. Đặc Tả Chi Tiết Các Yêu Cầu Mạng & API (API Contracts)

### 5.1 `POST /?mod=archive&act=login` — Đăng Nhập Người Dùng

Xác thực thông tin tài khoản người dùng và thiết lập phiên làm việc.

- **Request URL:** `https://educhat.vn/?mod=archive&act=login`
- **Method:** `POST`
- **Request Headers:**
  - `Content-Type: multipart/form-data` hoặc `application/x-www-form-urlencoded`
- **Request Body:**

  | Tên trường | Kiểu dữ liệu | Bắt buộc | Mô tả                            |
  | :--------- | :----------: | :------: | :------------------------------- |
  | `email`    |    String    |    Có    | Tên đăng nhập hoặc địa chỉ email |
  | `password` |    String    |    Có    | Mật khẩu tài khoản               |

- **Bằng chứng phản hồi từ máy chủ thực tế (Thất bại):**
  ```http
  HTTP/2 200 OK
  content-type: text/html; charset=utf-8

  {"success":false,"error":"Tài khoản hoặc mật khẩu không đúng."}
  ```
- **Phản hồi khi Đăng nhập thành công (Theo đặc tả code client):**
  ```json
  {
    "success": true,
    "user": {
      "fullname": "Nguyễn Văn A",
      "avatar": "/files/avatar/user123.jpg",
      "email": "user@example.com"
    }
  }
  ```

---

### 5.2 `POST /?mod=archive&act=signup` — Đăng Ký Tài Khoản Mạng Xã Hội

Đăng ký tài khoản mạng xã hội giáo dục mới theo quy định pháp lý.

- **Request URL:** `https://educhat.vn/?mod=archive&act=signup`
- **Method:** `POST`
- **Request Headers:**
  - `Content-Type: multipart/form-data`
- **Request Body:**

  | Tên trường | Kiểu dữ liệu  | Bắt buộc | Mô tả                               |
  | :--------- | :-----------: | :------: | :---------------------------------- |
  | `fullname` |    String     |    Có    | Họ và tên người dùng                |
  | `phone`    |    String     |    Có    | Số điện thoại liên hệ               |
  | `cccd`     |    String     |    Có    | Số Căn cước công dân                |
  | `chucvu`   |    String     |    Có    | `"Học viên"` hoặc `"Giảng viên"`    |
  | `avatar`   | Binary (File) |    Có    | File ảnh đại diện định dạng JPG/PNG |
  | `email`    |    String     |    Có    | Hộp thư điện tử                     |
  | `password` |    String     |    Có    | Mật khẩu khởi tạo                   |

- **Trạng thái thực tế:** Backend hiện phản hồi `Not found act template signup` do chức năng đang tạm bảo trì/chuyển giao sang quy trình duyệt thủ công.

---

### 5.3 `POST /?mod=iframe&act=load_more` — Tải Thêm Danh Sách Bài Viết

Phân trang tải thêm bài viết không tải lại trang.

- **Request URL:** `https://educhat.vn/?mod=iframe&act=load_more&v={timestamp}`
- **Method:** `POST`
- **Request Parameters:**
  | Tên trường    |  Kiểu   | Mô tả                                                |
  | :------------ | :-----: | :--------------------------------------------------- |
  | `category_id` | Integer | ID chuyên mục cần nạp thêm                           |
  | `page`        | Integer | Số thứ tự trang cần lấy (`2`, `3`,...)               |
  | `slug_search` | String  | Từ khóa tìm kiếm (nếu đang ở trang kết quả tìm kiếm) |
- **Response:** Chuỗi HTML chứa các thẻ `<article>` để append vào `.apppen_box`.

---

### 5.4 `GET /?mod=archive&act=search` — Tìm Kiếm Nội Dung (SEO Rewrite)

Xử lý tìm kiếm bài viết, giáo viên hoặc khóa học.

- **Request URL:** `https://educhat.vn/?mod=archive&act=search&search={keyword}`
- **Hành vi điều hướng thực tế:** Máy chủ thực hiện chuyển hướng 301 sang định dạng URL thân thiện SEO:
  ```http
  HTTP/2 301 Moved Permanently
  location: /{keyword}-search/
  ```
  _(Ví dụ: Tìm kiếm `toan` sẽ chuyển hướng về `/toan-search/`)_.

---

## 6. Bảng Nhật Ký Bằng Chứng Thu Thập Được (REA Evidence Log)

| Tiêu chí                  | Bằng chứng thực tế thu thập                                                           | Phương thức xác minh                         |
| :------------------------ | :------------------------------------------------------------------------------------ | :------------------------------------------- |
| **REA Evidence ID**       | `ev_15106bc674d44621997271cae206f0d17d8178749147b7ac92093ca2180287da`                 | `rea capture-browser-scenario`               |
| **Kích thước DOM**        | 62,676 bytes                                                                          | Snapshot DOM trích xuất từ REA               |
| **Sự kiện mạng ghi nhận** | 383 network events                                                                    | Snapshot Event Timeline từ REA               |
| **Cơ chế Đăng nhập**      | Form `#login_form`, API `/?mod=archive&act=login`, lưu `localStorage.getItem("user")` | Phân tích JavaScript DOM Inline #1 & #11     |
| **Xác thực API Login**    | Trả về JSON `{"success":false,"error":"Tài khoản hoặc mật khẩu không đúng."}`         | Kiểm thử trực tiếp qua cURL                  |
| **Cơ chế Phân vai trò**   | Trường CCCD & chức vụ `Học viên` / `Giảng viên`                                       | Bóc tách form `#register_form` tại `/login/` |
| **Thư viện Media Player** | JWPlayer tích hợp tùy chỉnh cho video shorts                                          | Script Inline #13 & jwplayer.js              |
| **Tối ưu Lazy Loading**   | Script loader kích hoạt khi `window.focus`                                            | Script Inline #14                            |
