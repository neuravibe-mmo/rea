# EduChat.vn Backend API & Database

Máy chủ Backend hiệu năng cao viết bằng **Node.js, Express, TypeScript và SQLite (better-sqlite3)** phục vụ cho Mạng Xã Hội Giáo Dục EduChat.vn.

## 1. Công nghệ sử dụng

- **Runtime & Ngôn ngữ**: Node.js 24 + TypeScript (ES2022 / NodeNext).
- **Framework API**: Express 4.x + CORS + JSON body parser.
- **Cơ sở dữ liệu**: SQLite (qua thư viện C++ native `better-sqlite3` với chế độ WAL cho tốc độ truy vấn cực cao, zero config).
- **Xác thực & Bảo mật**: JWT (JSON Web Tokens) + Zod schema validation.

## 2. Cấu trúc Cơ sở dữ liệu (SQLite `educhat.db`)

- `users`: Quản lý người dùng, học viên, giảng viên theo chuẩn MXH VN (họ tên, email, mật khẩu, CCCD, số điện thoại, vai trò).
- `articles`: Lưu bài viết, danh mục, tác giả, số lượt xem (`views`), số lượt thích (`likes`).
- `comments`: Lưu bình luận theo từng bài viết (`ON DELETE CASCADE`).
- `courses`: Danh mục khóa học trực tuyến (Unica/EduChat partnership), học phí, đánh giá, số học viên.
- `documents`: Tài liệu, giáo án số, đề thi minh họa và bộ đếm lượt tải về.
- `videos`: Kho video ngắn EdChat Shorts.

## 3. Danh sách RESTful APIs

| Phương thức | Endpoint                      | Mô tả                                                              |
| :---------- | :---------------------------- | :----------------------------------------------------------------- |
| `GET`       | `/api/health`                 | Kiểm tra tình trạng hoạt động của backend                          |
| `POST`      | `/api/auth/register`          | Đăng ký tài khoản (họ tên, email, CCCD, SĐT, role)                 |
| `POST`      | `/api/auth/login`             | Đăng nhập nhận JWT Token & thông tin người dùng                    |
| `GET`       | `/api/auth/me`                | Lấy thông tin user qua Bearer Token                                |
| `GET`       | `/api/articles`               | Danh sách bài viết (hỗ trợ lọc `category`, `search`, phân trang)   |
| `GET`       | `/api/articles/:id`           | Xem chi tiết bài viết kèm danh sách bình luận (tự động tăng views) |
| `POST`      | `/api/articles/:id/like`      | Thả tim / tăng like cho bài viết                                   |
| `POST`      | `/api/articles/:id/comments`  | Gửi bình luận mới vào bài viết                                     |
| `GET`       | `/api/courses`                | Danh sách khóa học theo danh mục                                   |
| `GET`       | `/api/documents`              | Danh sách tài liệu & đề thi                                        |
| `POST`      | `/api/documents/:id/download` | Ghi nhận lượt tải tài liệu                                         |
| `GET`       | `/api/videos`                 | Danh sách video ngắn EdChat Shorts                                 |
| `GET`       | `/api/stats`                  | Thống kê số lượng thành viên, giảng viên, khóa học                 |

### Tương thích ngược với EduChat.vn cũ:

- Hỗ trợ các query parameters cũ: `/?mod=archive&act=login`, `/?mod=archive&act=signup`, `/?mod=iframe&act=load_more` tự động chuyển hướng chuẩn 307.

## 4. Hướng dẫn chạy

```bash
cd /Users/hoangkien/project/rea/educhat-server
export PATH="/opt/homebrew/opt/node@24/bin:$PATH"

# Cài đặt thư viện (nếu chưa cài):
npm install

# Seed dữ liệu mẫu ban đầu:
npm run seed

# Chạy server ở chế độ Development (tự reload):
npm run dev

# Hoặc Build & Chạy Production:
npm run build
npm start
```

Server chạy mặc định tại: `http://127.0.0.1:5001`
