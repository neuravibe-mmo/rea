import { db, initDatabase } from "./database.js";

export function seedData() {
  initDatabase();

  const userCount = db.prepare("SELECT count(*) as count FROM users").get() as {
    count: number;
  };
  if (userCount.count === 0) {
    console.log("Seeding initial users and articles...");

    console.log("Seeding initial data into SQLite database...");

    // Seed Users
    const insertUser = db.prepare(`
    INSERT INTO users (id, email, password, fullname, phone, cccd, role, avatar, bio)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

    insertUser.run(
      "usr_teacher_1",
      "nguyenvana@educhat.vn",
      "password123",
      "TS. Nguyễn Văn An",
      "0912345678",
      "001200001234",
      "teacher",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
      "Giảng viên cao cấp tại Đại học Sư phạm Hà Nội, chuyên gia đổi mới giáo dục phổ thông.",
    );

    insertUser.run(
      "usr_teacher_2",
      "tranthimai@educhat.vn",
      "password123",
      "ThS. Trần Thị Mai",
      "0987654321",
      "001200005678",
      "teacher",
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
      "Chuyên gia giáo dục sớm, tác giả nhiều đầu sách phương pháp dạy tiếng Anh chuẩn Cambridge.",
    );

    insertUser.run(
      "usr_student_1",
      "student@educhat.vn",
      "password123",
      "Lê Hoàng Long",
      "0909123456",
      "001200009999",
      "student",
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
      "Học viên đam mê công nghệ EdTech và lập trình ứng dụng.",
    );

    // Seed Articles
    const insertArticle = db.prepare(`
    INSERT INTO articles (id, title, slug, excerpt, content, cover_image, category, author_id, author_name, author_role, author_avatar, views, likes, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

    insertArticle.run(
      "art_1",
      "Đổi mới phương pháp dạy học theo Chương trình GDPT 2018: Cơ hội và Thách thức",
      "doi-moi-phuong-phap-day-hoc-2018",
      "Phân tích chi tiết những điểm trọng yếu trong việc chuyển đổi từ truyền thụ kiến thức sang phát triển năng lực và phẩm chất người học.",
      "Chương trình Giáo dục phổ thông 2018 đặt trọng tâm vào việc phát triển năng lực và phẩm chất cho học sinh, đòi hỏi giáo viên phải đổi mới căn bản phương pháp giảng dạy. Thay vì phương pháp đọc - chép truyền thống, giáo viên đóng vai trò là người thiết kế, hướng dẫn và tạo điều kiện cho học sinh tự khám phá tri thức thông qua các hoạt động trải nghiệm, dự án học tập, thảo luận nhóm.\n\nMột trong những thách thức lớn nhất là chuyển đổi cách thức kiểm tra đánh giá từ việc ghi nhớ lý thuyết sang đánh giá năng lực thực hành giải quyết vấn đề thực tiễn. Thầy cô cần xây dựng các rubric đánh giá đa chiều, tận dụng các công cụ kỹ thuật số trong lớp học tương tác.",
      "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=1200",
      "Phương pháp giảng dạy",
      "usr_teacher_1",
      "TS. Nguyễn Văn An",
      "Giảng viên ĐH Sư Phạm",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
      1420,
      188,
      "2026-10-24 08:30:00",
    );

    insertArticle.run(
      "art_2",
      "Cập nhật cấu trúc đề thi tốt nghiệp THPT từ năm 2025: Những điều thí sinh cần biết",
      "cau-truc-de-thi-thpt-2025",
      "Tổng hợp dạng câu hỏi trắc nghiệm đúng/sai, trả lời ngắn và chiến lược phân bổ thời gian làm bài đạt kết quả tối ưu.",
      "Kỳ thi tốt nghiệp THPT từ năm 2025 có sự thay đổi đột phá về dạng thức câu hỏi. Bên cạnh dạng trắc nghiệm 4 lựa chọn truyền thống, đề thi bổ sung hai dạng mới:\n1. Câu hỏi trắc nghiệm Đúng/Sai với 4 mệnh đề nhỏ trong 1 câu hỏi, đòi hỏi nắm chắc kiến thức toàn diện.\n2. Câu hỏi trắc nghiệm Trả lời ngắn, giảm thiểu tối đa yếu tố đoán mò và yêu cầu tính toán logic chính xác.\n\nThí sinh cần rèn luyện khả năng đọc hiểu nhanh và luyện tập các đề thi minh họa của Bộ GD&ĐT ngay từ đầu năm học.",
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=1200",
      "Tuyển sinh & Đề thi",
      "usr_teacher_2",
      "ThS. Trần Thị Mai",
      "Chuyên gia Khảo thí",
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
      3890,
      420,
      "2026-10-25 14:15:00",
    );

    insertArticle.run(
      "art_3",
      "Ứng dụng Trí tuệ Nhân tạo (AI) trong việc soạn giáo án và tạo bài giảng tương tác",
      "ung-dung-ai-soan-giao-an",
      "Hướng dẫn sử dụng các công cụ AI hỗ trợ giáo viên tiết kiệm 60% thời gian chuẩn bị học liệu và tăng hứng thú học tập.",
      "Trí tuệ nhân tạo (AI) đang trở thành trợ thủ đắc lực giúp giáo viên nâng cao năng suất công việc. Thay vì mất nhiều giờ soạn giáo án, giáo viên có thể dùng các mô hình ngôn ngữ lớn để tạo dàn ý bài học, gợi ý trò chơi mở đầu (warm-up), tạo ngân hàng câu hỏi phân hóa theo các mức độ Bloom.\n\nNgoài ra, các công cụ tạo slide thông minh giúp biến giáo án thành bài thuyết trình trực quan, sinh động trong chốc lát.",
      "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?auto=format&fit=crop&q=80&w=1200",
      "Công nghệ EdTech",
      "usr_teacher_1",
      "TS. Nguyễn Văn An",
      "Chuyên gia EdTech",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
      2150,
      275,
      "2026-10-26 10:00:00",
    );

    // Seed Comments
    const insertComment = db.prepare(`
    INSERT INTO comments (id, article_id, user_id, author_name, author_avatar, content, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

    insertComment.run(
      "cmt_1",
      "art_1",
      "usr_student_1",
      "Lê Hoàng Long",
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
      "Bài viết phân tích rất chuẩn xác thầy ạ, giáo viên chúng em ở vùng cao cũng đang cố gắng áp dụng.",
      "2026-10-24 09:15:00",
    );

    insertComment.run(
      "cmt_2",
      "art_1",
      "usr_teacher_2",
      "ThS. Trần Thị Mai",
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
      "Cảm ơn thầy An đã chia sẻ bảng rubric đánh giá năng lực rất thực tế!",
      "2026-10-24 10:45:00",
    );

    // Seed Courses
    const insertCourse = db.prepare(`
    INSERT INTO courses (id, title, slug, instructor, instructor_avatar, thumbnail, price, original_price, duration, rating, students_count, category, level)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

    insertCourse.run(
      "crs_1",
      "Kỹ năng Thiết kế Bài giảng E-learning Chuẩn Quốc Tế",
      "thiet-ke-bai-giang-elearning",
      "TS. Nguyễn Văn An",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800",
      399000,
      799000,
      "18 giờ học",
      4.9,
      1840,
      "Kỹ năng sư phạm",
      "Nâng cao",
    );

    insertCourse.run(
      "crs_2",
      "Luyện Thi THPT Quốc Gia Môn Toán - Đột Phá Điểm 8+",
      "luyen-thi-thpt-mon-toan",
      "Thầy Trần Bá Đạt",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=800",
      499000,
      990000,
      "32 giờ học",
      4.8,
      3250,
      "Luyện thi THPT",
      "Chuyên sâu",
    );

    insertCourse.run(
      "crs_3",
      "Tiếng Anh Giao Tiếp Học Thuật Cho Giảng Viên & Sinh Viên",
      "tieng-anh-giao-tiep-hoc-thuat",
      "ThS. Trần Thị Mai",
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=800",
      350000,
      700000,
      "24 giờ học",
      4.9,
      2100,
      "Ngoại ngữ",
      "Trung cấp",
    );

    // Seed Documents
    const insertDoc = db.prepare(`
    INSERT INTO documents (id, title, file_type, file_size, downloads_count, category, author_name, download_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

    insertDoc.run(
      "doc_1",
      "Bộ Đề Minh Họa Tốt Nghiệp THPT 2025 Môn Toán (Có Lời Giải Chi Tiết)",
      "PDF",
      "4.8 MB",
      1240,
      "Đề thi",
      "Ban Chuyên Môn Toán EduChat",
      "/downloads/de-minh-hoa-toan-2025.pdf",
    );

    insertDoc.run(
      "doc_2",
      "Sổ Tay Hướng Dẫn Soạn Giáo Án Theo Công Văn 5512/BGDĐT-GDTrH",
      "DOCX",
      "2.1 MB",
      3890,
      "Giáo án",
      "TS. Nguyễn Văn An",
      "/downloads/huong-dan-cv-5512.docx",
    );

    insertDoc.run(
      "doc_3",
      "Tuyển Tập 100 Hoạt Động Khởi Động (Warm-up) Tương Tác Sôi Động",
      "PDF",
      "6.5 MB",
      2410,
      "Phương pháp",
      "ThS. Trần Thị Mai",
      "/downloads/100-warmup-activities.pdf",
    );

    // Seed Videos
    const insertVideo = db.prepare(`
    INSERT INTO videos (id, title, author, views, likes, duration, video_url, thumbnail)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

    insertVideo.run(
      "vid_1",
      "Mẹo ghi nhớ nhanh bảng công thức đạo hàm trong 30 giây",
      "Thầy Trần Bá Đạt",
      5200,
      340,
      "0:45",
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=400",
    );

    insertVideo.run(
      "vid_2",
      "3 bước phân bổ thời gian bài thi tiếng Anh không bị sót câu",
      "ThS. Trần Thị Mai",
      3800,
      290,
      "0:58",
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&q=80&w=400",
    );
  }

  // Seed Quizzes
  const insertQuiz = db.prepare(`
    INSERT OR IGNORE INTO quizzes (id, title, course_id, teacher_id, teacher_name, duration_minutes, total_questions, subject)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertQuiz.run(
    "qz_1",
    "Kiểm tra Đánh giá Năng lực Môn Toán THPT - Đề số 01",
    "crs_2",
    "usr_teacher_1",
    "TS. Nguyễn Văn An",
    50,
    25,
    "Toán học",
  );

  insertQuiz.run(
    "qz_2",
    "Trắc nghiệm Từ vựng & Ngữ pháp IELTS Speaking & Writing",
    "crs_3",
    "usr_teacher_2",
    "ThS. Trần Thị Mai",
    30,
    20,
    "Tiếng Anh",
  );

  // Seed Enrollments
  const insertEnrollment = db.prepare(`
    INSERT OR IGNORE INTO enrollments (id, user_id, course_id, progress_percent, status)
    VALUES (?, ?, ?, ?, ?)
  `);

  insertEnrollment.run("enr_1", "usr_student_1", "crs_1", 65, "active");
  insertEnrollment.run("enr_2", "usr_student_1", "crs_2", 30, "active");

  // Seed Study Groups
  const insertGroup = db.prepare(`
    INSERT OR IGNORE INTO study_groups (id, name, description, teacher_id, teacher_name, members_count, subject)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertGroup.run(
    "grp_1",
    "Cộng đồng Giáo viên Sáng tạo & STEM Việt Nam",
    "Diễn đàn kết nối hơn 1.200 thầy cô chia sẻ giáo án STEM và đổi mới phương pháp giảng dạy.",
    "usr_teacher_1",
    "TS. Nguyễn Văn An",
    1240,
    "Phương pháp sư phạm",
  );

  insertGroup.run(
    "grp_2",
    "Nhóm Ôn thi THPT Quốc gia 2026 - Môn Toán & Khoa học",
    "Nhóm học tập tương tác trực tiếp, hỏi đáp bài tập khó và giải đề thi thử mỗi tối thứ 7.",
    "usr_teacher_1",
    "TS. Nguyễn Văn An",
    3450,
    "Luyện thi THPT",
  );

  // Seed Lessons for Course crs_1 (Kỹ năng Thiết kế Bài giảng E-learning)
  const insertLesson = db.prepare(`
    INSERT OR IGNORE INTO lessons (id, course_id, title, duration, video_url, order_index, is_free_preview)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  insertLesson.run(
    "lsn_1",
    "crs_1",
    "Bài 1: Tổng quan về Thiết kế Bài giảng E-learning Chuẩn Quốc tế (SCORM/xAPI)",
    "12:45",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    1,
    1,
  );

  insertLesson.run(
    "lsn_2",
    "crs_1",
    "Bài 2: Cấu trúc kịch bản sư phạm hiện đại theo Thông tư Bộ GD&ĐT",
    "18:20",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    2,
    1,
  );

  insertLesson.run(
    "lsn_3",
    "crs_1",
    "Bài 3: Nguyên tắc phối màu, Typography và đồ họa trực quan trong bài giảng số",
    "24:10",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    3,
    0,
  );

  insertLesson.run(
    "lsn_4",
    "crs_1",
    "Bài 4: Kỹ thuật xây dựng câu hỏi tương tác H5P và trắc nghiệm gamification",
    "19:50",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    4,
    0,
  );

  insertLesson.run(
    "lsn_5",
    "crs_1",
    "Bài 5: Xuất bản, tích hợp LMS EduChat và đo lường mức độ tương tác học viên",
    "16:30",
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    5,
    0,
  );

  // Seed Real Students
  const insertStudent = db.prepare(`
    INSERT OR REPLACE INTO users (id, email, password, fullname, phone, cccd, role, avatar, bio)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertStudent.run(
    "usr_student_1",
    "student@educhat.vn",
    "password123",
    "Lê Hoàng Long",
    "0909123456",
    "001200009999",
    "student",
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
    "Học viên đam mê công nghệ EdTech và lập trình ứng dụng.",
  );

  insertStudent.run(
    "usr_student_2",
    "thao.nguyen@gmail.com",
    "password123",
    "Nguyễn Thị Phương Thảo",
    "0918765432",
    "001200008888",
    "student",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200",
    "Giáo viên THCS Chu Văn An, đam mê đổi mới bài giảng số.",
  );

  insertStudent.run(
    "usr_student_3",
    "tuananh.edu@outlook.com",
    "password123",
    "Phạm Tuấn Anh",
    "0922334455",
    "001200007777",
    "student",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    "Giảng viên thực hành STEM và thiết kế học liệu tương tác.",
  );

  insertStudent.run(
    "usr_student_4",
    "thuha.teacher@gmail.com",
    "password123",
    "Đỗ Thu Hà",
    "0933445566",
    "001200006666",
    "student",
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200",
    "Tổ trưởng chuyên môn Ngoại ngữ, THPT Chuyên Hà Nội - Amsterdam.",
  );

  insertStudent.run(
    "usr_student_5",
    "baotran.stem@yahoo.com",
    "password123",
    "Trần Quốc Bảo",
    "0944556677",
    "001200005555",
    "student",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
    "Chuyên viên công nghệ đào tạo, trung tâm bồi dưỡng sư phạm.",
  );

  insertStudent.run(
    "usr_student_6",
    "mailinh.edtech@gmail.com",
    "password123",
    "Vũ Mai Linh",
    "0955667788",
    "001200004444",
    "student",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
    "Sinh viên năm cuối ĐH Sư Phạm Hà Nội.",
  );

  // Seed Enrollments for Course crs_1
  const insertCourseEnrollment = db.prepare(`
    INSERT OR REPLACE INTO enrollments (id, user_id, course_id, progress_percent, status, enrolled_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  insertCourseEnrollment.run(
    "enr_1",
    "usr_student_1",
    "crs_1",
    85,
    "active",
    "2026-10-20 09:30:00",
  );
  insertCourseEnrollment.run(
    "enr_2",
    "usr_student_2",
    "crs_1",
    100,
    "completed",
    "2026-10-21 14:15:00",
  );
  insertCourseEnrollment.run(
    "enr_3",
    "usr_student_3",
    "crs_1",
    60,
    "active",
    "2026-10-22 10:00:00",
  );
  insertCourseEnrollment.run(
    "enr_4",
    "usr_student_4",
    "crs_1",
    45,
    "active",
    "2026-10-23 16:45:00",
  );
  insertCourseEnrollment.run(
    "enr_5",
    "usr_student_5",
    "crs_1",
    92,
    "active",
    "2026-10-24 11:20:00",
  );
  insertCourseEnrollment.run(
    "enr_6",
    "usr_student_6",
    "crs_1",
    25,
    "active",
    "2026-10-25 08:10:00",
  );

  // Seed Reviews for Course crs_1
  const insertReview = db.prepare(`
    INSERT OR REPLACE INTO course_reviews (id, course_id, user_id, author_name, author_avatar, rating, content, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertReview.run(
    "rev_1",
    "crs_1",
    "usr_student_2",
    "ThS. Hoàng Thị Lan",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=120",
    5,
    "Khóa học rất thực chiến, các tài liệu hướng dẫn xây dựng bài giảng SCORM theo chuẩn Công văn 5512 áp dụng được ngay vào giảng dạy tại trường.",
    "2026-10-22 15:30:00",
  );

  insertReview.run(
    "rev_2",
    "crs_1",
    "usr_student_3",
    "Thầy Đỗ Minh Tuấn",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=120",
    5,
    "Nội dung bài giảng chỉn chu, thầy An giảng giải trực quan và nhiệt tình giải đáp thắc mắc của giáo viên trong diễn đàn.",
    "2026-10-23 09:20:00",
  );

  insertReview.run(
    "rev_3",
    "crs_1",
    "usr_student_4",
    "Cô Nguyễn Thị Bích Ngọc",
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=120",
    5,
    "Phần hướng dẫn đóng gói bài giảng điện tử tương thích với LMS EduChat rất chi tiết, tôi đã xuất bản thành công bài giảng đầu tiên.",
    "2026-10-24 18:45:00",
  );

  insertReview.run(
    "rev_4",
    "crs_1",
    "usr_student_5",
    "Thầy Phan Thanh Sơn",
    "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120",
    4,
    "Kiến thức cập nhật xu hướng 2026 rất hay, mong thầy bổ sung thêm các template mẫu cho môn Toán và Vật lý.",
    "2026-10-25 10:15:00",
  );

  insertReview.run(
    "rev_5",
    "crs_1",
    "usr_student_6",
    "Cô Lê Thu Hằng",
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120",
    5,
    "Bộ công cụ H5P được thầy hướng dẫn ứng dụng cực kỳ sinh động, học sinh lớp tôi rất thích thú khi làm bài tập.",
    "2026-10-26 14:00:00",
  );

  // Sync courses table stats with real count from database
  const countRes = db
    .prepare(
      "SELECT count(*) as count FROM enrollments WHERE course_id = 'crs_1'",
    )
    .get() as { count: number };
  const avgReview = db
    .prepare(
      "SELECT avg(rating) as avg FROM course_reviews WHERE course_id = 'crs_1'",
    )
    .get() as { avg: number };
  db.prepare(
    "UPDATE courses SET students_count = ?, rating = ? WHERE id = 'crs_1'",
  ).run(countRes.count, Number(avgReview.avg.toFixed(1)));

  console.log("Seed completed successfully with real students and reviews!");
}

if (process.argv[1] && process.argv[1].endsWith("seed.ts")) {
  seedData();
}
