/**
 * Hệ thống 48 Quẻ Tu Tập Chánh Niệm & Chuỗi Chuyên Cần (Streak) Hàng Ngày.
 *
 * - 48 quẻ chánh niệm mang tinh thần Phật giáo và nuôi dưỡng tâm an lành.
 * - Thuật toán băm: hash(userSeed + YYYY-MM-DD) % 48 để mỗi ngày người dùng chỉ bốc đúng 1 quẻ cố định.
 * - Lưu trữ tiến trình vào localStorage và đồng bộ lên Supabase nếu có cấu hình.
 */

export interface QueCard {
  id: number;
  title: string;
  tagline: string;
  desc: string;
  practice: string;
}

export interface PracticeProgress {
  streak: number;
  lastDate: string;
  todayCardId: number;
  tasksDone: {
    bow: boolean;
    incense: boolean;
    mala: boolean;
    meditate: boolean;
    que: boolean;
  };
  totalBows: number;
  totalBeads: number;
  totalMeditationSeconds: number;
}

export const QUE_48_LIST: QueCard[] = [
  {
    id: 1,
    title: "Một hơi thở sâu",
    tagline: "Hơi thở là mỏ neo",
    desc: "Dừng lại ba giây, thở vào một hơi thật sâu và mỉm cười với thân tâm trong giây phút này.",
    practice:
      "Mỗi khi chuyển đổi công việc, hãy dừng lại thở 3 hơi chánh niệm trước khi bắt đầu.",
  },
  {
    id: 2,
    title: "Nước lắng tự trong",
    tagline: "Tâm tĩnh lặng",
    desc: "Tâm ta như ly nước khuấy đục; khi để yên, cặn bã tự lắng xuống đáy và mặt nước tự nhiên trong trẻo.",
    practice:
      "Khi cảm thấy bối rối hay tức giận, đừng vội hành động. Hãy ngồi yên 5 phút.",
  },
  {
    id: 3,
    title: "Bước chân an lạc",
    tagline: "Tiếp xúc đất mẹ",
    desc: "Mỗi bước chân chạm đất đều là một phép mầu. Ta đang bước đi trên mặt đất bằng đôi chân khỏe mạnh.",
    practice:
      "Hôm nay khi đi lại, hãy bước chậm lại nửa nhịp và cảm nhận lòng bàn chân tiếp xúc mặt đất.",
  },
  {
    id: 4,
    title: "Một lời chúc thầm",
    tagline: "Nuôi dưỡng từ tâm",
    desc: "Bất cứ ai bạn gặp trên đường hay trong công việc hôm nay, hãy thầm gửi đến họ một lời chúc bình an.",
    practice:
      'Gửi ý niệm: "Nguyện cho bạn được an lành, mạnh khỏe và vượt qua mọi khó khăn".',
  },
  {
    id: 5,
    title: "Buông đôi vai xuống",
    tagline: "Thả lỏng cơ thể",
    desc: "Chúng ta vô tình gồng gánh quá nhiều lo toan trên đôi vai suốt ngày dài mà không hề hay biết.",
    practice: "Hạ vai xuống, thả lỏng cơ mặt, mở một nụ cười nhẹ hàm tiếu.",
  },
  {
    id: 6,
    title: "Lắng nghe trọn vẹn",
    tagline: "Lắng tai nghe như Bồ Tát",
    desc: "Lắng nghe với tâm không phán xét, không chuẩn bị câu trả lời trước, chỉ để người khác được sẻ chia.",
    practice:
      "Trong một cuộc trò chuyện hôm nay, hãy để người kia nói hết câu mà không ngắt lời.",
  },
  {
    id: 7,
    title: "Biết ơn bữa ăn",
    tagline: "Công phu thọ trai",
    desc: "Hạt cơm thơm ngon là kết tinh của đất trời, mưa nắng và bao giọt mồ hôi của người gieo trồng.",
    practice:
      "Trước khi ăn, hãy dành 5 giây nhìn vào món ăn và thầm cảm ơn công sức của muôn loài.",
  },
  {
    id: 8,
    title: "Nụ cười hàm tiếu",
    tagline: "Bình an từ nét mặt",
    desc: "Khuôn mặt là tấm gương của tâm. Khi bạn mỉm cười, hệ thần kinh lập tức dịu lại và lan tỏa sự ấm áp.",
    practice:
      "Mỉm cười nhẹ nhàng khi vừa thức dậy hoặc mỗi lần nhìn thấy hình ảnh hoa sen.",
  },
  {
    id: 9,
    title: "Rửa bát, quét nhà",
    tagline: "Thiền trong đời thường",
    desc: "Khi rửa bát, chỉ biết mình đang rửa bát; khi quét nhà, chỉ biết mình đang quét nhà.",
    practice:
      "Làm trọn vẹn một việc nhà nhỏ hôm nay với 100% sự chú tâm, không vội vã.",
  },
  {
    id: 10,
    title: "Một lời xin lỗi",
    tagline: "Hóa giải oán kết",
    desc: "Lời xin lỗi chân thành từ đáy lòng là chìa khóa mở tung cánh cửa của những hiểu lầm và ngăn cách.",
    practice:
      "Nếu trong lòng còn lấn cấn với ai, hãy can đảm nhắn một lời xin lỗi hoặc lời hòa ái.",
  },
  {
    id: 11,
    title: "Một điều tử tế",
    tagline: "Hạt giống thiện lành",
    desc: "Một việc làm tốt dù rất nhỏ không cần ai biết tới cũng đủ tưới mát một ngày của chính bạn.",
    practice:
      "Làm một việc tốt âm thầm: nhặt một nhánh rác, nhường đường, hoặc giúp ai đó một việc nhỏ.",
  },
  {
    id: 12,
    title: "Tâm không vội vã",
    tagline: "Thong dong ngày tháng",
    desc: "Vũ trụ không bao giờ vội vàng mà mọi điều vẫn đơm hoa kết trái. Cớ sao ta lại phải cuống cuồng?",
    practice:
      "Giảm tốc độ đi lại và nói chuyện hôm nay xuống 10% để giữ sự khoan thai.",
  },
  {
    id: 13,
    title: "Uống trà đi bạn",
    tagline: "Chánh niệm trong chén trà",
    desc: "Cầm ly nước ấm trên tay, cảm nhận hơi ấm lan tỏa qua lòng bàn tay trước khi nhấp từng ngụm.",
    practice:
      "Uống một ly trà hoặc nước lọc thật chậm rãi mà không nhìn vào màn hình điện thoại.",
  },
  {
    id: 14,
    title: "Nhìn sâu vào mây trời",
    tagline: "Vô thường và mầu nhiệm",
    desc: "Đám mây trắng trôi trên bầu trời bao la không có hình dáng cố định, đến rồi đi nhẹ nhàng.",
    practice:
      "Dành 2 phút ngước nhìn lên bầu trời hoặc cây xanh xung quanh nơi bạn đang sống.",
  },
  {
    id: 15,
    title: "Không tích giữ ấm ức",
    tagline: "Tâm xả ly",
    desc: "Giữ giận dữ trong lòng giống như nắm một hòn than nóng với ý định ném vào người khác: ta bị bỏng trước.",
    practice:
      'Thở ra và tự nhủ: "Chuyện này không đáng để làm hao tổn sự bình yên của tâm hồn ta".',
  },
  {
    id: 16,
    title: "Biết đủ là giàu",
    tagline: "Tri túc tâm an",
    desc: "Người biết đủ dù nằm trên đất cát vẫn thấy an lạc; người không biết đủ dù ở cung điện vẫn thấy thiếu thốn.",
    practice:
      "Viết ra 3 điều giản dị mà bạn đang có trong đời: một mái nhà, một bữa cơm, một sức khỏe tốt.",
  },
  {
    id: 17,
    title: "Tập nói lời hòa ái",
    tagline: "Ái ngữ",
    desc: "Một lời nói dịu dàng có thể sưởi ấm ba tháng mùa đông. Lời nói tổn thương làm rét buốt sáu tháng ròng.",
    practice:
      'Trước khi nói điều gì gay gắt, hãy tự hỏi: "Lời này có thật, có ích và có tình thương không?".',
  },
  {
    id: 18,
    title: "Tâm từ bi với chính mình",
    tagline: "Khoan dung bản thân",
    desc: "Bạn đã cố gắng rất nhiều rồi. Hãy cho phép bản thân được nghỉ ngơi và tha thứ cho những vụng về của mình.",
    practice:
      "Đặt bàn tay lên ngực trái, thở nhẹ và gửi tình thương vỗ về chính bản thân mình.",
  },
  {
    id: 19,
    title: "Dọn dẹp một góc nhỏ",
    tagline: "Không gian tĩnh lặng",
    desc: "Không gian sống ngăn nắp phản chiếu một tâm trí quang đãng và có trật tự.",
    practice:
      "Dọn dẹp lại bàn làm việc hoặc một góc phòng ngủ ngay hôm nay cho thật thoáng đãng.",
  },
  {
    id: 20,
    title: "Rời xa màn hình",
    tagline: "Tìm lại sự tĩnh lặng",
    desc: "Thế giới số ngập tràn kích thích khiến tâm ta bị lôi kéo liên tục ra bên ngoài.",
    practice:
      "Tắt điện thoại hoặc để chế độ máy bay 30 phút trước khi đi ngủ để tâm trí thư thái.",
  },
  {
    id: 21,
    title: "Nhận diện vô thường",
    tagline: "Biết ơn khoảnh khắc",
    desc: "Mọi sự trên đời đều luôn biến đổi. Nhận biết vô thường không phải để bi quan, mà để trân quý phút giây hiện tại.",
    practice:
      'Nhìn những người thân yêu và tự nhắc: "Chúng ta ở bên nhau hôm nay là một nhân duyên quý giá".',
  },
  {
    id: 22,
    title: "Thắp nến tâm hương",
    tagline: "Thanh lọc ý nghĩ",
    desc: "Nén tâm hương thơm ngát tỏa khắp mười phương là lòng thành kính, sự thanh tịnh và đức hạnh.",
    practice:
      "Giữ ý nghĩ trong sạch, không nói xấu sau lưng và không nuôi dưỡng lòng ganh tỵ.",
  },
  {
    id: 23,
    title: "Gặp gỡ một bông hoa",
    tagline: "Chiêm ngưỡng sự sống",
    desc: "Bông hoa bên vệ đường vẫn nở rực rỡ mà không cần ai khen ngợi hay so đo cùng loài hoa khác.",
    practice:
      "Hãy sống tự nhiên, cống hiến hết vẻ đẹp chân thật của chính mình như một đóa hoa.",
  },
  {
    id: 24,
    title: "Chấp nhận thực tại",
    tagline: "Như thị",
    desc: "Mọi việc xảy ra đều có lý do của nó. Khi không thể thay đổi hoàn cảnh, hãy thay đổi thái độ đón nhận.",
    practice:
      'Khi gặp việc không như ý, hít sâu và nói thầm: "Việc này đang xảy ra như nó là, mình sẽ bình tĩnh xử lý".',
  },
  {
    id: 25,
    title: "Nâng niu giấc ngủ",
    tagline: "Phục hồi năng lượng",
    desc: "Khi nằm xuống, buông bỏ toàn bộ công việc và toan tính của ngày hôm nay ngoài cửa phòng.",
    practice:
      "Thả lỏng từ đỉnh đầu đến gót chân, đếm từng hơi thở êm dịu để đi vào giấc ngủ an lành.",
  },
  {
    id: 26,
    title: "Hạt giống bồ đề",
    tagline: "Trí tuệ sáng suốt",
    desc: "Bên trong mỗi con người đều có sẵn hạt giống giác ngộ và lòng thương yêu nguyên sơ.",
    practice:
      "Hôm nay hãy tin tưởng vào tiềm năng lương thiện và sự sáng suốt của chính mình.",
  },
  {
    id: 27,
    title: "Lắng đọng như cây cổ thụ",
    tagline: "Vững chãi trước gió",
    desc: "Cây bồ đề cắm rễ sâu vào đất mẹ, dù giông bão thổi qua ngọn lá thì gốc rễ vẫn vững vàng bất động.",
    practice:
      "Khi cảm xúc xáo động, hãy ngồi thẳng lưng, cảm nhận sự vững chãi của thân thể như một ngọn núi.",
  },
  {
    id: 28,
    title: "Thực tập hạnh kiên nhẫn",
    tagline: "Nhẫn nhục ba la mật",
    desc: "Kiên nhẫn không phải là chịu đựng trong uất ức, mà là hiểu rõ nhân duyên nên không nóng nảy.",
    practice:
      "Khi phải xếp hàng hoặc chờ đợi, đừng rút điện thoại ra vội; hãy dùng thời gian đó để thở.",
  },
  {
    id: 29,
    title: "Tự do trong tâm",
    tagline: "Không vướng mắc",
    desc: "Sự tự do đích thực không phải là muốn làm gì thì làm, mà là tâm không bị trói buộc bởi tham, sân, si.",
    practice:
      'Nhận biết khi nào mình đang thèm muốn một thứ gì đó quá mức và tự hỏi: "Mình có thực sự cần nó không?".',
  },
  {
    id: 30,
    title: "Lòng biết ơn cha mẹ",
    tagline: "Uống nước nhớ nguồn",
    desc: "Cha mẹ là hai vị Phật sống trong nhà. Công lao sinh thành và dưỡng dục cao sâu như trời biển.",
    practice:
      "Gọi một cuộc điện thoại thăm hỏi hoặc thầm cầu nguyện cho cha mẹ được bình an, mạnh khỏe.",
  },
  {
    id: 31,
    title: "Một cử chỉ dịu dàng",
    tagline: "Tưới mát tâm hồn",
    desc: "Một cái chạm tay ấm áp, một ánh mắt thấu hiểu có sức mạnh xoa dịu nỗi đau hơn ngàn lời nói.",
    practice:
      "Hãy đối xử dịu dàng với mọi người xung quanh, từ người thân đến người phục vụ trên đường.",
  },
  {
    id: 32,
    title: "Gieo hạt nhân lành",
    tagline: "Luật nhân quả",
    desc: "Gieo suy nghĩ gặt hành động, gieo hành động gặt thói quen, gieo thói quen gặt số phận an hòa.",
    practice:
      "Mỗi hành động trong ngày hôm nay, hãy tự hỏi nó đem lại hoa trái an lành hay khổ đau mai sau.",
  },
  {
    id: 33,
    title: "Hỷ xả mọi thị phi",
    tagline: "Ngoài tai tiếng gió",
    desc: "Khen chê của thế gian như cơn gió thoảng qua cành cây; không bám víu thì gió tự nhiên tan biến.",
    practice:
      "Đừng bận tâm quá mức về những lời đàm tiếu. Giữ tâm mình trong sạch là quý giá nhất.",
  },
  {
    id: 34,
    title: "Nguyện đem an vui",
    tagline: "Từ bi hỷ xả",
    desc: "Hạnh phúc lớn nhất là khi ta mang lại nụ cười và niềm tin cho những người xung quanh.",
    practice:
      "Khen ngợi một điểm tốt của đồng nghiệp hoặc bạn bè một cách chân thành và không tính toán.",
  },
  {
    id: 35,
    title: "Ngồi thẳng lưng lên",
    tagline: "Thân ngay tâm chính",
    desc: "Tư thế của thân thể quyết định dòng chảy năng lượng. Thân thẳng thớm thì tâm trí minh mẫn.",
    practice:
      "Kiểm tra lại tư thế ngồi: giữ thẳng cột sống, ngực mở nhẹ, hít thở thông suốt.",
  },
  {
    id: 36,
    title: "Học từ lỗi lầm",
    tagline: "Kinh nghiệm quý báu",
    desc: "Vấp ngã không phải là thất bại; vấp ngã là cơ hội để học bài học sâu sắc của sự trưởng thành.",
    practice:
      "Nhìn lại một điều bạn làm chưa tốt gần đây và rút ra một bài học thay vì tự trách móc.",
  },
  {
    id: 37,
    title: "Tâm rộng mở như biển",
    tagline: "Dung chứa muôn sông",
    desc: "Muối hòa vào một chén nước thì chén nước mặn chát; muối hòa vào dòng sông lớn thì nước vẫn ngọt lành.",
    practice:
      "Mở rộng dung lượng trái tim để bao dung cho những thiếu sót của người khác.",
  },
  {
    id: 38,
    title: "Cảm nhận giọt sương mai",
    tagline: "Khoảnh khắc thuần khiết",
    desc: "Mỗi buổi sáng thức dậy là một món quà tái sinh mới tinh khôi của sự sống.",
    practice:
      'Hít thở bầu không khí buổi sớm và tự nhắc: "Hôm nay là một ngày mới đầy ắp cơ hội lành".',
  },
  {
    id: 39,
    title: "Buông bỏ kỳ vọng quá mức",
    tagline: "Thuận theo tự nhiên",
    desc: "Kỳ vọng quá nhiều là nguồn gốc của thất vọng. Cứ nỗ lực hết mình và để kết quả tự do diễn ra.",
    practice: "Làm hết trách nhiệm hôm nay và bình thản trước kết quả.",
  },
  {
    id: 40,
    title: "Thực tập thiền buông thư",
    tagline: "Tái tạo năng lượng",
    desc: "Cho phép toàn bộ các cơ quan nội tạng và tế bào trong cơ thể được nghỉ ngơi không làm việc.",
    practice:
      "Dành 10 phút buổi trưa nằm thẳng thả lỏng hoàn toàn mà không suy nghĩ gì.",
  },
  {
    id: 41,
    title: "Sống thật với lòng",
    tagline: "Chân thật là an lành",
    desc: "Không cần mang mặt nạ để làm hài lòng tất cả mọi người. Sự chân thành mộc mạc là sức hấp dẫn nhất.",
    practice:
      "Nói những gì bạn thực sự nghĩ với thái độ tôn trọng và nhã nhặn.",
  },
  {
    id: 42,
    title: "Thương yêu muôn loài",
    tagline: "Tâm bình đẳng",
    desc: "Mỗi con chim sẻ, con kiến, ngọn cỏ đều có quyền được sống trong bình an và tôn trọng.",
    practice:
      "Hãy cẩn thận từng bước chân để không vô tình giẫm đạp lên những sinh vật bé nhỏ.",
  },
  {
    id: 43,
    title: "Tự tại trước khen chê",
    tagline: "Tâm bất biến",
    desc: "Được khen không kiêu ngạo, bị chê không nản lòng. Bạn hiểu rõ giá trị thực chất bên trong mình.",
    practice:
      "Lắng nghe phản hồi với sự khách quan, xem đó như chiếc gương soi để hoàn thiện.",
  },
  {
    id: 44,
    title: "Một chén nước thanh lọc",
    tagline: "Tinh khiết thân tâm",
    desc: "Uống từng ngụm nước trong mát và quán tưởng dòng nước rửa trôi mọi mệt mỏi và độc tố trong thân.",
    practice:
      "Uống đủ nước trong ngày và cảm nhận sự thanh mát của từng ngụm nước đi vào tế bào.",
  },
  {
    id: 45,
    title: "Hạnh phúc trong tầm tay",
    tagline: "Hiện tại lạc trú",
    desc: "Đừng chờ đến khi có đủ tiền tài danh vọng mới hạnh phúc. Hạnh phúc đang có mặt ngay đây và bây giờ.",
    practice:
      "Tìm thấy một niềm vui nhỏ ngay trong công việc thường nhật của buổi chiều hôm nay.",
  },
  {
    id: 46,
    title: "Mỉm cười trước gian nan",
    tagline: "Lửa thử vàng",
    desc: "Thử thách là người thầy dạy ta bài học về sức bền và sự can đảm phi thường.",
    practice:
      'Khi gặp khó khăn, hít sâu một hơi và tự nhủ: "Đây là bài kiểm tra giúp mình mạnh mẽ hơn".',
  },
  {
    id: 47,
    title: "Quán chiếu nhân duyên",
    tagline: "Vạn vật tương tức",
    desc: "Không có gì tồn tại độc lập. Ta nương tựa vào muôn loài và muôn loài cũng đang nuôi dưỡng ta.",
    practice:
      "Nhận diện sự kết nối sâu sắc giữa bạn với thiên nhiên, xã hội và mọi người xung quanh.",
  },
  {
    id: 48,
    title: "Tâm sen ngát hương",
    tagline: "Gần bùn mà chẳng hôi tanh",
    desc: "Như hoa sen vươn lên từ bùn lầy tăm tối để nở bung những cánh hoa trắng hồng thơm ngát cho đời.",
    practice:
      "Dù hoàn cảnh xung quanh có xáo động, hãy giữ tâm hồn mình luôn thanh tịnh và tỏa hương thơm.",
  },
];

const STREAK_KEY = "chua-online:streak";
const SEED_KEY = "chua-online:user-seed";
const PROGRESS_KEY = "chua-online:progress";

/**
 * Lấy hoặc khởi tạo Seed người dùng duy nhất
 */
export function getUserSeed(): string {
  let seed = localStorage.getItem(SEED_KEY);
  if (!seed) {
    seed =
      "seed_" +
      Math.random().toString(36).slice(2, 10) +
      Date.now().toString(36);
    localStorage.setItem(SEED_KEY, seed);
  }
  return seed;
}

/**
 * Thuật toán băm: hash(userSeed + YYYY-MM-DD) % totalCards
 * Đảm bảo mỗi người dùng mỗi ngày chỉ bốc được đúng 1 quẻ cố định
 */
export function getDailyCardIndex(
  dateKey: string,
  seed: string,
  totalCards = 48,
): number {
  const combined = `${seed}:${dateKey}`;
  let hash = 5381;
  for (let i = 0; i < combined.length; i++) {
    hash = (hash << 5) + hash + combined.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % totalCards;
}

/**
 * Lấy tiến trình tu tập và tính toán chuỗi chuyên cần (Streak)
 */
export function getPracticeProgress(): PracticeProgress {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const vnDate = new Date(utc + 3600000 * 7);
  const todayKey = vnDate.toISOString().slice(0, 10);

  const seed = getUserSeed();
  const cardIndex = getDailyCardIndex(todayKey, seed, QUE_48_LIST.length);

  let progress: PracticeProgress = {
    streak: 1,
    lastDate: todayKey,
    todayCardId: cardIndex + 1,
    tasksDone: {
      bow: false,
      incense: false,
      mala: false,
      meditate: false,
      que: false,
    },
    totalBows: 0,
    totalBeads: 0,
    totalMeditationSeconds: 0,
  };

  const raw = localStorage.getItem(PROGRESS_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      const yesterday = new Date(vnDate.getTime() - 86400000)
        .toISOString()
        .slice(0, 10);

      if (parsed.lastDate === todayKey) {
        progress = { ...parsed, todayCardId: cardIndex + 1 };
      } else if (parsed.lastDate === yesterday) {
        // Tiếp nối streak thành công
        progress = {
          streak: (parsed.streak || 0) + 1,
          lastDate: todayKey,
          todayCardId: cardIndex + 1,
          tasksDone: {
            bow: false,
            incense: false,
            mala: false,
            meditate: false,
            que: false,
          },
          totalBows: parsed.totalBows || 0,
          totalBeads: parsed.totalBeads || 0,
          totalMeditationSeconds: parsed.totalMeditationSeconds || 0,
        };
      } else {
        // Đứt chuỗi streak, bắt đầu lại ngày 1
        progress = {
          streak: 1,
          lastDate: todayKey,
          todayCardId: cardIndex + 1,
          tasksDone: {
            bow: false,
            incense: false,
            mala: false,
            meditate: false,
            que: false,
          },
          totalBows: parsed.totalBows || 0,
          totalBeads: parsed.totalBeads || 0,
          totalMeditationSeconds: parsed.totalMeditationSeconds || 0,
        };
      }
    } catch {
      // Bỏ qua lỗi parse
    }
  }

  savePracticeProgress(progress);
  return progress;
}

/**
 * Lưu tiến trình vào localStorage & thử đồng bộ Supabase nếu có cấu hình
 */
export function savePracticeProgress(progress: PracticeProgress): void {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress));
    localStorage.setItem(STREAK_KEY, String(progress.streak));
    syncToSupabase(progress);
  } catch {
    // Bỏ qua nếu localStorage đầy
  }
}

/**
 * Đồng bộ tiến trình tu tập lên Supabase (khi có cấu hình token/API)
 */
export async function syncToSupabase(
  progress: PracticeProgress,
): Promise<boolean> {
  const supabaseUrl =
    (window as unknown as { __SUPABASE_URL__?: string }).__SUPABASE_URL__ || "";
  const supabaseKey =
    (window as unknown as { __SUPABASE_KEY__?: string }).__SUPABASE_KEY__ || "";

  if (!supabaseUrl || !supabaseKey) {
    // Không có Supabase: lưu cục bộ an toàn
    return false;
  }

  try {
    const seed = getUserSeed();
    const res = await fetch(`${supabaseUrl}/rest/v1/user_progress`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        Prefer: "resolution=merge-duplicates",
      },
      body: JSON.stringify({
        user_seed: seed,
        streak: progress.streak,
        last_date: progress.lastDate,
        today_card_id: progress.todayCardId,
        tasks_done: progress.tasksDone,
        updated_at: new Date().toISOString(),
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Trả về Quẻ chánh niệm hôm nay kèm thông tin tiến trình
 */
export function getTodayQue(): {
  card: QueCard;
  streak: number;
  progress: PracticeProgress;
} {
  const progress = getPracticeProgress();
  const card = QUE_48_LIST[progress.todayCardId - 1] || QUE_48_LIST[0];
  return { card, streak: progress.streak, progress };
}

/**
 * Đánh dấu một bài tập hoàn thành trong ngày (Lễ Phật, Thắp hương, Lần chuỗi, Thiền, Đọc quẻ)
 */
export function markTaskComplete(
  task: keyof PracticeProgress["tasksDone"],
): PracticeProgress {
  const progress = getPracticeProgress();
  progress.tasksDone[task] = true;
  savePracticeProgress(progress);
  return progress;
}
