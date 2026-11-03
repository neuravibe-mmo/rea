import { initViewport } from "./core/viewport.ts";
import { Engine } from "./core/engine.ts";
import { AudioManager, triggerHaptic } from "./audio/audioManager.ts";
import { NetworkClient } from "./net/client.ts";
import { RITUAL_TYPES, ANIM_TYPES } from "./net/protocol.ts";
import { getTodayLunar } from "./rituals/lunarCalendar.ts";
import {
  getTodayQue,
  markTaskComplete,
  type PracticeProgress,
} from "./rituals/queCards.ts";

// 1. Tối ưu khung nhìn di động
initViewport();

// 2. Khởi tạo 3D Canvas
const canvas = document.getElementById("webgl-canvas") as HTMLCanvasElement;
const engine = new Engine(canvas);

// 3. Khởi tạo Âm thanh (Spatial Audio Engine & Ducking)
const audio = new AudioManager();

// Cập nhật vị trí tai nghe AudioListener theo vị trí người chơi mỗi khung hình
engine.onUpdate = (player) => {
  audio.updateListener(
    player.position.x,
    player.position.y,
    player.position.z,
    player.facing,
  );
};

// 4. Khởi tạo Mạng WebSocket
const net = new NetworkClient();

// Đèn trạng thái kết nối trên HUD
const statusDot = document.querySelector(".status-dot") as HTMLElement;
const roomLabelEl = document.getElementById("room-label");

net.onConnectionChange = (connected) => {
  if (statusDot) {
    statusDot.style.backgroundColor = connected ? "#4ade80" : "#f87171";
    statusDot.style.boxShadow = connected
      ? "0 0 8px #4ade80"
      : "0 0 8px #f87171";
  }
  if (!connected && roomLabelEl) {
    roomLabelEl.textContent = "Đang kết nối lại sảnh...";
  }
};

// Nhận cập nhật danh sách người chơi từ xa
net.onPlayersUpdate = (remotePlayers) => {
  engine.updateRemotePlayers(remotePlayers);
};

// Nhận broadcast nghi lễ từ máy chủ (chuông, mõ)
net.onRitualReceived = (ritualId) => {
  if (ritualId === RITUAL_TYPES.BELL) audio.playBell();
  else if (ritualId === RITUAL_TYPES.CHANT) audio.playMo();
};

// Nhận broadcast hoa đăng thả trên hồ sen
net.onLanternReceived = (l) => {
  engine.addLantern(l.id, l.x, l.z);
};

// Cập nhật tên phòng & số lượng người online lên thanh HUD
net.onRoomInfoUpdate = (info) => {
  if (roomLabelEl) {
    roomLabelEl.textContent = info.label;
  }
};

net.connect();

// Gửi đồng bộ di chuyển 15 lần/giây (Binary Opcode 1)
let currentSeatId = 255;
setInterval(() => {
  const p = engine.player;
  net.sendMovement(p.position.x, p.position.z, p.facing, p.anim, currentSeatId);
}, 66);

// 5. Toast Thông Báo HUD
const toastEl = document.getElementById("hud-toast");
let toastTimer: number | null = null;
function showToast(message: string, durationMs = 2400): void {
  if (!toastEl) return;
  toastEl.textContent = message;
  toastEl.classList.remove("hidden");
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => {
    toastEl.classList.add("hidden");
  }, durationMs);
}

// 6. Loading Screen
const loadingScreen = document.getElementById("loading-screen");
const hud = document.getElementById("hud");
const progressBar = document.getElementById("loading-progress");

if (progressBar) progressBar.style.width = "100%";
setTimeout(() => {
  if (loadingScreen) {
    loadingScreen.style.opacity = "0";
    setTimeout(() => loadingScreen.classList.add("hidden"), 600);
  }
  hud?.classList.remove("hidden");
  engine.start();
}, 600);

// 7. Kết nối Nút Tương Tác Nghi Lễ & Âm Thanh Xúc Giác
const btnBow = document.getElementById("btn-bow");
const btnIncense = document.getElementById("btn-incense");
const btnBell = document.getElementById("btn-bell");
const btnChant = document.getElementById("btn-chant");
const btnMala = document.getElementById("btn-mala");
const btnMeditate = document.getElementById("btn-meditate");
const btnLantern = document.getElementById("btn-lantern");
const btnSound = document.getElementById("btn-sound");
const btnToday = document.getElementById("btn-today");

// Lễ Phật
btnBow?.addEventListener("click", () => {
  engine.player.anim = ANIM_TYPES.BOW;
  triggerHaptic("bead");
  markTaskComplete("bow");
  showToast("🙏 Thành tâm kính lễ Tam Bảo");
  setTimeout(() => {
    if (engine.player.anim === ANIM_TYPES.BOW) {
      engine.player.anim = ANIM_TYPES.IDLE;
    }
  }, 1600);
});

// Thắp hương
btnIncense?.addEventListener("click", () => {
  triggerHaptic("bead");
  markTaskComplete("incense");
  net.sendRitual(RITUAL_TYPES.INCENSE);
  showToast("🪔 Đã dâng một nén tâm hương cầu an");
});

// Đánh chuông chùa (Spatial Sound tại Tháp Chuông + Ducking + Haptic)
btnBell?.addEventListener("click", () => {
  audio.playBell();
  net.sendRitual(RITUAL_TYPES.BELL);
  showToast("🔔 Chuông đại hồng ngân vang thức tỉnh lòng người");
});

// Gõ mõ tụng kinh (Spatial Sound tại Chánh Điện + Ducking + Haptic)
btnChant?.addEventListener("click", () => {
  audio.playMo();
  net.sendRitual(RITUAL_TYPES.CHANT);
  showToast("🪵 Tiếng mõ thanh tịnh nhịp nhàng");
});

// Lần chuỗi hạt Bồ đề 108 hạt (Chime + Haptic từng hạt)
let malaCount = 0;
btnMala?.addEventListener("click", () => {
  malaCount = (malaCount % 108) + 1;
  audio.playChime();
  markTaskComplete("mala");
  if (malaCount === 108) {
    audio.playBell();
    showToast(
      "🎉 Hoàn thành tràng 108 hạt niệm Phật – Công đức viên mãn!",
      3600,
    );
  } else {
    showToast(`📿 Lần chuỗi hạt: ${malaCount} / 108`);
  }
});

// Ngồi thiền (Audio Ducking sâu xuống 12% + Hoạt họa Sit)
let isMeditating = false;
btnMeditate?.addEventListener("click", () => {
  isMeditating = !isMeditating;
  if (isMeditating) {
    engine.player.anim = ANIM_TYPES.SIT;
    audio.updateAudioLevels(false, true); // Giảm âm nền xuống 12%
    markTaskComplete("meditate");
    btnMeditate.style.borderColor = "var(--accent-gold)";
    showToast("🧘 Đang ngồi thiền tĩnh tâm (Nhạc nền giảm sâu 12%)");
  } else {
    engine.player.anim = ANIM_TYPES.IDLE;
    audio.updateAudioLevels(false, false); // Trở về mức âm nền thông thường
    btnMeditate.style.borderColor = "";
    showToast("Đã xả thiền");
  }
});

// Nếu người chơi di chuyển trong lúc ngồi thiền -> tự động xả thiền
const origPlayerUpdate = engine.player.update.bind(engine.player);
engine.player.update = (deltaSec: number, cameraYaw: number) => {
  origPlayerUpdate(deltaSec, cameraYaw);
  if (isMeditating && engine.player.anim === ANIM_TYPES.WALK) {
    isMeditating = false;
    audio.updateAudioLevels(false, false);
    if (btnMeditate) btnMeditate.style.borderColor = "";
  }
};

// Thả hoa đăng trên hồ sen
btnLantern?.addEventListener("click", () => {
  triggerHaptic("bead");
  net.sendLantern();
  showToast("🏮 Đã thả hoa đăng lung linh cầu an lành trên hồ sen");
});

// Bật / Tắt âm thanh
btnSound?.addEventListener("click", () => {
  const muted = audio.toggleMute();
  if (btnSound) btnSound.textContent = muted ? "🔇" : "🔊";
  showToast(muted ? "🔇 Đã tắt âm thanh" : "🔊 Đã bật âm thanh");
});

// 8. Cấp bậc hoa sen theo Streak (Giống Chùa Sen)
function getLotusTier(streak: number): { name: string; icon: string } {
  if (streak >= 50) return { name: "Cấp 7 · Sen ngàn cánh", icon: "🪷" };
  if (streak >= 30) return { name: "Cấp 6 · Sen nở", icon: "🪷" };
  if (streak >= 20) return { name: "Cấp 5 · Sen hé", icon: "🪷" };
  if (streak >= 15) return { name: "Cấp 4 · Nụ sen", icon: "🌸" };
  if (streak >= 10) return { name: "Cấp 3 · Lá sen", icon: "🍃" };
  if (streak >= 5) return { name: "Cấp 2 · Mầm sen", icon: "🌱" };
  return { name: "Cấp 1 · Hạt sen", icon: "🌰" };
}

function updateTaskChips(tasks: PracticeProgress["tasksDone"]): void {
  document.getElementById("task-bow")?.classList.toggle("done", tasks.bow);
  document
    .getElementById("task-incense")
    ?.classList.toggle("done", tasks.incense);
  document.getElementById("task-mala")?.classList.toggle("done", tasks.mala);
  document
    .getElementById("task-meditate")
    ?.classList.toggle("done", tasks.meditate);
  document.getElementById("task-que")?.classList.toggle("done", tasks.que);
}

// 9. Modal Hôm nay & Quẻ Chánh Niệm Hàng Ngày (Giai đoạn 6)
const modalToday = document.getElementById("modal-today");
const btnCloseModal = document.getElementById("btn-close-modal");
const specialDayBanner = document.getElementById("special-day-banner");
const specialDayTitle = document.getElementById("special-day-title");
const modalSolarDate = document.getElementById("modal-solar-date");
const modalLunarDate = document.getElementById("modal-lunar-date");
const modalCanchiDate = document.getElementById("modal-canchi-date");

const queCardNum = document.getElementById("que-card-num");
const queTitle = document.getElementById("que-title");
const queTagline = document.getElementById("que-tagline");
const queDesc = document.getElementById("que-desc");
const quePractice = document.getElementById("que-practice");

const streakIcon = document.getElementById("streak-icon");
const streakText = document.getElementById("streak-text");
const streakTier = document.getElementById("streak-tier");

btnToday?.addEventListener("click", () => {
  // Lấy lịch âm Hồ Ngọc Đức chính xác
  const lunar = getTodayLunar();

  // Đánh dấu nhiệm vụ đọc quẻ hôm nay
  const updatedProgress = markTaskComplete("que");
  const { card, streak } = getTodayQue();

  // Dương lịch
  const now = new Date();
  const days = [
    "Chủ nhật",
    "Thứ Hai",
    "Thứ Ba",
    "Thứ Tư",
    "Thứ Năm",
    "Thứ Sáu",
    "Thứ Bảy",
  ];
  if (modalSolarDate) {
    const pad = (n: number) => n.toString().padStart(2, "0");
    modalSolarDate.textContent = `${days[now.getDay()]}, ${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`;
  }

  // Âm lịch & Can Chi
  if (modalLunarDate) {
    modalLunarDate.textContent = `Âm lịch: Ngày ${lunar.day} tháng ${lunar.month}, năm ${lunar.canChiYear}`;
  }
  if (modalCanchiDate) {
    modalCanchiDate.textContent = `Ngày ${lunar.canChiDay} · Tháng ${lunar.canChiMonth} · Tiết ${lunar.solarTerm}`;
  }

  // Highlight ngày lễ đặc biệt (Phật Đản, Vu Lan, Sóc, Vọng...)
  if (lunar.isSpecialDay && specialDayBanner && specialDayTitle) {
    specialDayTitle.textContent = lunar.specialTitle || "Ngày Lễ Phật Giáo";
    specialDayBanner.classList.remove("hidden");
  } else if (specialDayBanner) {
    specialDayBanner.classList.add("hidden");
  }

  // Quẻ Chánh Niệm 48 lá
  if (queCardNum) queCardNum.textContent = `#${card.id} / 48`;
  if (queTitle) queTitle.textContent = card.title;
  if (queTagline) queTagline.textContent = card.tagline;
  if (queDesc) queDesc.textContent = card.desc;
  if (quePractice) quePractice.textContent = card.practice;

  // Streak & Cấp Bậc Sen
  const tier = getLotusTier(streak);
  if (streakText) streakText.textContent = `${streak} ngày công phu tinh tấn`;
  if (streakTier) streakTier.textContent = tier.name;
  if (streakIcon) streakIcon.textContent = tier.icon;

  // Cập nhật checklist
  updateTaskChips(updatedProgress.tasksDone);

  modalToday?.classList.remove("hidden");
});

btnCloseModal?.addEventListener("click", () => {
  modalToday?.classList.add("hidden");
});

// 10. Cập nhật chu kỳ Ngày/Đêm định kỳ mỗi phút
setInterval(() => {
  engine.sky.updateTimeOfDay();
}, 60000);

// 11. Đăng ký Service Worker (PWA Offline Caching & Tải Ngay Lập Tức)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch((err) => {
      console.warn("[PWA] Đăng ký Service Worker không thành công:", err);
    });
  });
}
