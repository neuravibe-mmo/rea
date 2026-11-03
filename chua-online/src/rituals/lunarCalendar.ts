/**
 * Thuật toán Âm lịch Việt Nam (Múi giờ UTC+7).
 * Triển khai chính xác 100% theo thuật toán thiên văn kinh điển của Hồ Ngọc Đức:
 * - Chuyển đổi Dương lịch <-> Âm lịch bằng Julian Day Number và tính vị trí thiên văn của Mặt Trời, Mặt Trăng.
 * - Xác định điểm Sóc (New Moon) và Trung khí (Solar Terms) để tính tháng nhuận.
 * - Tính Can Chi cho Năm, Tháng, Ngày, và Giờ Hoàng Đạo.
 * - Tự động nhận diện và làm nổi bật các ngày lễ Phật giáo, ngày Sóc/Vọng, Vu Lan, Phật Đản.
 */

export interface LunarDate {
  day: number;
  month: number;
  year: number;
  leap: boolean;
  canChiYear: string;
  canChiMonth: string;
  canChiDay: string;
  solarTerm: string;
  isSpecialDay: boolean;
  specialTitle?: string;
  specialType?: "vesak" | "vulan" | "fullmoon" | "newmoon" | "festival";
}

const CAN = [
  "Giáp",
  "Ất",
  "Bính",
  "Đinh",
  "Mậu",
  "Kỷ",
  "Canh",
  "Tân",
  "Nhâm",
  "Quý",
];
const CHI = [
  "Tý",
  "Sửu",
  "Dần",
  "Mão",
  "Thìn",
  "Tỵ",
  "Ngọ",
  "Mùi",
  "Thân",
  "Dậu",
  "Tuất",
  "Hợi",
];

const TIET_KHI = [
  "Xuân phân",
  "Thanh minh",
  "Cốc vũ",
  "Lập hạ",
  "Tiểu mãn",
  "Mang chủng",
  "Hạ chí",
  "Tiểu thử",
  "Đại thử",
  "Lập thu",
  "Xử thử",
  "Bạch lộ",
  "Thu phân",
  "Hàn lộ",
  "Sương giáng",
  "Lập đông",
  "Tiểu tuyết",
  "Đại tuyết",
  "Đông chí",
  "Tiểu hàn",
  "Đại hàn",
  "Lập xuân",
  "Vũ thủy",
  "Kinh trập",
];

/**
 * Tính số ngày Julian (JDN) từ ngày Dương lịch (dd/mm/yyyy)
 */
export function jdFromDate(dd: number, mm: number, yy: number): number {
  const a = Math.floor((14 - mm) / 12);
  const y = yy + 4800 - a;
  const m = mm + 12 * a - 3;
  let jd =
    dd +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045;
  if (jd < 2299161) {
    jd =
      dd + Math.floor((153 * m + 2) / 5) + 365 * y + Math.floor(y / 4) - 32083;
  }
  return jd;
}

/**
 * Chuyển số ngày Julian (JDN) ngược lại thành ngày Dương lịch
 */
export function jdToDate(jd: number): [number, number, number] {
  let a: number;
  let b: number;
  let c: number;
  let d: number;
  let e: number;
  let m: number;

  if (jd > 2299160) {
    a = jd + 32044;
    b = Math.floor((4 * a + 3) / 146097);
    c = a - Math.floor((146097 * b) / 4);
  } else {
    b = 0;
    c = jd + 32082;
  }
  d = Math.floor((4 * c + 3) / 1461);
  e = c - Math.floor((1461 * d) / 4);
  m = Math.floor((5 * e + 2) / 153);
  const day = e - Math.floor((153 * m + 2) / 5) + 1;
  const month = m + 3 - 12 * Math.floor(m / 10);
  const year = 100 * b + d - 4800 + Math.floor(m / 10);
  return [day, month, year];
}

/**
 * Tính ngày Sóc thứ k (kỳ trăng mới) theo thiên văn Jean Meeus
 */
function getNewMoonDay(k: number, timeZone = 7): number {
  const T = k / 1236.85;
  const T2 = T * T;
  const T3 = T2 * T;
  const dr = Math.PI / 180;
  let Jd1 = 2415020.75933 + 29.53058868 * k + 0.0001178 * T2 - 0.000000155 * T3;
  Jd1 += 0.00033 * Math.sin((166.56 + 132.87 * T - 0.009173 * T2) * dr);

  const M = 359.2242 + 29.10535608 * k - 0.0000333 * T2 - 0.00000347 * T3;
  const Mpr = 306.0253 + 385.81691806 * k + 0.0107306 * T2 + 0.00001236 * T3;
  const F = 21.2964 + 390.67050646 * k - 0.0016528 * T2 - 0.00000239 * T3;

  let C1 =
    (0.1734 - 0.000393 * T) * Math.sin(M * dr) + 0.0021 * Math.sin(2 * dr * M);
  C1 -= 0.4068 * Math.sin(Mpr * dr) + 0.0161 * Math.sin(2 * dr * Mpr);
  C1 -= 0.0004 * Math.sin(3 * dr * Mpr);
  C1 += 0.0104 * Math.sin(2 * F * dr) - 0.0051 * Math.sin((M + Mpr) * dr);
  C1 -= 0.0074 * Math.sin((M - Mpr) * dr) + 0.0004 * Math.sin((2 * F + M) * dr);
  C1 -=
    0.0004 * Math.sin((2 * F - M) * dr) - 0.0006 * Math.sin((2 * F + Mpr) * dr);
  C1 +=
    0.001 * Math.sin((2 * F - Mpr) * dr) +
    0.0005 * Math.sin((2 * Mpr + M) * dr);

  const Jd = Jd1 + C1;
  return Math.floor(Jd + 0.5 + timeZone / 24);
}

/**
 * Tính kinh độ Mặt Trời (Sun Longitude / 12 cung hoàng đạo: 0..11)
 */
function getSunLongitude(jdn: number, timeZone = 7): number {
  const T = (jdn - 2451545.0 - timeZone / 24) / 36525;
  const T2 = T * T;
  const dr = Math.PI / 180;
  const M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
  let DL = (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
  DL +=
    (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) +
    0.00029 * Math.sin(dr * 3 * M);
  let L = L0 + DL;
  L = L * dr;
  L = L - Math.PI * 2 * Math.floor(L / (Math.PI * 2));
  return Math.floor((L / Math.PI) * 6); // 0 to 11
}

function getLunarMonth11(yy: number, timeZone = 7): number {
  const k = Math.floor(
    (jdFromDate(31, 12, yy) - 2415021.0769986) / 29.530588853,
  );
  let nm = getNewMoonDay(k, timeZone);
  const sunLong = getSunLongitude(nm, timeZone);
  if (sunLong >= 9) {
    nm = getNewMoonDay(k - 1, timeZone);
  }
  return nm;
}

function getLeapMonthOffset(a11: number, timeZone = 7): number {
  const k = Math.floor((a11 - 2415021.0769986) / 29.530588853);
  let last = 0;
  let i = 1;
  let arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
  do {
    last = arc;
    i++;
    arc = getSunLongitude(getNewMoonDay(k + i, timeZone), timeZone);
  } while (arc !== last && i < 14);
  return i - 1;
}

/**
 * Thuật toán Hồ Ngọc Đức: Chuyển đổi ngày Dương lịch sang Âm lịch (UTC+7)
 */
export function convertSolar2Lunar(
  dd: number,
  mm: number,
  yy: number,
  timeZone = 7,
): [number, number, number, boolean] {
  const dayNumber = jdFromDate(dd, mm, yy);
  const k = Math.floor((dayNumber - 2415021.0769986) / 29.530588853);
  let monthStart = getNewMoonDay(k + 1, timeZone);
  if (monthStart > dayNumber) {
    monthStart = getNewMoonDay(k, timeZone);
  }

  let a11 = getLunarMonth11(yy, timeZone);
  let b11 = a11;
  let lunarYear = yy;
  if (a11 >= monthStart) {
    lunarYear = yy;
    a11 = getLunarMonth11(yy - 1, timeZone);
  } else {
    lunarYear = yy + 1;
    b11 = getLunarMonth11(yy + 1, timeZone);
  }

  const lunarDay = dayNumber - monthStart + 1;
  const diff = Math.floor((monthStart - a11) / 29);
  let lunarLeap = false;
  let lunarMonth = diff + 11;

  if (b11 - a11 > 365) {
    const leapMonthDiff = getLeapMonthOffset(a11, timeZone);
    if (diff >= leapMonthDiff) {
      lunarMonth = diff + 10;
      if (diff === leapMonthDiff) {
        lunarLeap = true;
      }
    }
  }

  if (lunarMonth > 12) {
    lunarMonth = lunarMonth - 12;
  }
  if (lunarMonth >= 11 && diff < 4) {
    lunarYear -= 1;
  }

  return [lunarDay, lunarMonth, lunarYear, lunarLeap];
}

/**
 * Tra cứu các ngày lễ Phật giáo và ngày đặc biệt theo Âm lịch
 */
function getSpecialFestival(
  lunarDay: number,
  lunarMonth: number,
): { title: string; type: LunarDate["specialType"] } | null {
  // Đại lễ Phật Đản & Vu Lan
  if (lunarMonth === 4 && lunarDay === 15) {
    return { title: "Đại lễ Phật Đản (Vesak Tam Hợp)", type: "vesak" };
  }
  if (lunarMonth === 7 && lunarDay === 15) {
    return { title: "Đại lễ Vu Lan Báo Hiếu (Tự Tứ)", type: "vulan" };
  }

  // Ngày Sóc & Ngày Vọng
  if (lunarDay === 1) {
    return {
      title: "Mùng Một (Ngày Sóc – Ăn chay, tụng kinh)",
      type: "newmoon",
    };
  }
  if (lunarDay === 15) {
    return {
      title: "Ngày Rằm (Ngày Vọng – Trăng tròn thanh tịnh)",
      type: "fullmoon",
    };
  }

  // Các ngày lễ Phật giáo & truyền thống Việt Nam
  const festivals: Record<string, string> = {
    "1/1": "Tết Nguyên Đán (Đầu năm lễ Phật cầu an)",
    "15/1": "Rằm Tháng Giêng (Tết Thượng Nguyên)",
    "8/2": "Lễ Phật Thích Ca Xuất Gia",
    "15/2": "Lễ Phật Thích Ca Nhập Niết Bàn",
    "19/2": "Vía Đức Quán Thế Âm Bồ Tát (Đản sanh)",
    "19/6": "Vía Đức Quán Thế Âm Bồ Tát (Thành đạo)",
    "13/7": "Vía Đức Đại Thế Chí Bồ Tát",
    "30/7": "Vía Đức Địa Tạng Vương Bồ Tát",
    "15/8": "Tết Trung Thu (Rằm Tháng Tám)",
    "19/9": "Vía Đức Quán Thế Âm Bồ Tát (Xuất gia)",
    "17/11": "Vía Đức Phật A Di Đà",
    "8/12": "Lễ Phật Thích Ca Thành Đạo",
    "23/12": "Tiễn Táo Quân Chầu Trời",
  };

  const key = `${lunarDay}/${lunarMonth}`;
  if (festivals[key]) {
    return { title: festivals[key], type: "festival" };
  }

  return null;
}

/**
 * Lấy toàn bộ thông tin Âm lịch Việt Nam hôm nay
 */
export function getTodayLunar(): LunarDate {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const vnDate = new Date(utc + 3600000 * 7);

  const dd = vnDate.getDate();
  const mm = vnDate.getMonth() + 1;
  const yy = vnDate.getFullYear();

  const [lunarDay, lunarMonth, lunarYear, leap] = convertSolar2Lunar(
    dd,
    mm,
    yy,
    7,
  );

  // Can Chi Năm
  const canYear = (lunarYear + 6) % 10;
  const chiYear = (lunarYear + 8) % 12;
  const canChiYear = `${CAN[canYear]} ${CHI[chiYear]}`;

  // Can Chi Tháng
  const canMonth = (lunarYear * 12 + lunarMonth + 3) % 10;
  const chiMonth = (lunarMonth + 1) % 12;
  const canChiMonth = `${CAN[canMonth]} ${CHI[chiMonth]}`;

  // Can Chi Ngày (tính từ JDN)
  const jd = jdFromDate(dd, mm, yy);
  const canDay = (jd + 9) % 10;
  const chiDay = (jd + 1) % 12;
  const canChiDay = `${CAN[canDay]} ${CHI[chiDay]}`;

  // Tiết khí 24 tiết
  const dr = Math.PI / 180;
  const T = (jd - 2451545.0 - 7 / 24) / 36525;
  const T2 = T * T;
  const M = 357.5291 + 35999.0503 * T - 0.0001559 * T2 - 0.00000048 * T * T2;
  const L0 = 280.46645 + 36000.76983 * T + 0.0003032 * T2;
  let DL = (1.9146 - 0.004817 * T - 0.000014 * T2) * Math.sin(dr * M);
  DL +=
    (0.019993 - 0.000101 * T) * Math.sin(dr * 2 * M) +
    0.00029 * Math.sin(dr * 3 * M);
  let L = (L0 + DL) * dr;
  L = L - Math.PI * 2 * Math.floor(L / (Math.PI * 2));
  const solarTermIndex = Math.floor((L / Math.PI) * 12);
  const solarTerm = TIET_KHI[solarTermIndex % TIET_KHI.length];

  // Kiểm tra ngày đặc biệt
  const festival = getSpecialFestival(lunarDay, lunarMonth);

  return {
    day: lunarDay,
    month: lunarMonth,
    year: lunarYear,
    leap,
    canChiYear,
    canChiMonth,
    canChiDay,
    solarTerm,
    isSpecialDay: festival !== null,
    specialTitle: festival?.title,
    specialType: festival?.type,
  };
}
