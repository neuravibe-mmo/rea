import { initViewport } from "./core/viewport.ts";
import { Engine } from "./core/engine.ts";
import {
  AudioManager,
  triggerHaptic,
  CHANT_TRACKS,
  ZEN_MUSIC_TRACKS,
} from "./audio/audioManager.ts";
import { NetworkClient } from "./net/client.ts";
import { RITUAL_TYPES, ANIM_TYPES } from "./net/protocol.ts";
import { getTodayLunar } from "./rituals/lunarCalendar.ts";
import { getTodayQue, markTaskComplete } from "./rituals/queCards.ts";
import { getGroundHeight } from "./campus/campus.ts";

// 1. Tối ưu khung nhìn di động
initViewport();

// 2. Khởi tạo 3D Canvas
const canvas = document.getElementById("webgl-canvas") as HTMLCanvasElement;
const engine = new Engine(canvas);
(window as unknown as { engine: Engine }).engine = engine;

// Cho phép điều chỉnh vị trí và góc nhìn kiểm tra kiểm thử qua URL params (?spawnX=..&spawnZ=..&yaw=..)
const initialUrlParams = new URLSearchParams(window.location.search);
if (initialUrlParams.has("spawnX") && initialUrlParams.has("spawnZ")) {
  const sx = parseFloat(initialUrlParams.get("spawnX")!);
  const sz = parseFloat(initialUrlParams.get("spawnZ")!);
  engine.player.position.set(sx, getGroundHeight(sx, sz), sz);
  engine.player.mesh.position.copy(engine.player.position);
}
if (initialUrlParams.has("yaw")) {
  engine.cameraCtrl.yaw = parseFloat(initialUrlParams.get("yaw")!);
}
if (initialUrlParams.has("dist")) {
  engine.cameraCtrl.distance = parseFloat(initialUrlParams.get("dist")!);
}

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
  updateContextPrompt(player.position.x, player.position.z);
};

// 4. Khởi tạo Mạng WebSocket
const net = new NetworkClient();

const roomLabelEl = document.getElementById("room-label");

net.onConnectionChange = (connected) => {
  const dot = document.querySelector(".hud-room__dot") as HTMLElement;
  if (dot) {
    dot.style.backgroundColor = connected ? "var(--jade)" : "#f87171";
    dot.style.boxShadow = connected ? "0 0 6px var(--jade)" : "0 0 6px #f87171";
  }
  if (!connected && roomLabelEl) {
    roomLabelEl.textContent = "Đang kết nối lại sảnh...";
  }
};

net.onPlayersUpdate = (remotePlayers) => {
  engine.updateRemotePlayers(remotePlayers);
};

net.onRitualReceived = (ritualId) => {
  if (ritualId === RITUAL_TYPES.BELL) audio.playBell();
  else if (ritualId === RITUAL_TYPES.CHANT) audio.playMo();
};

net.onLanternReceived = (l) => {
  engine.addLantern(l.id, l.x, l.z);
};

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

// 6. Quản Lý Nhân Vật (Onboarding & Character Customization)
interface CharacterProfile {
  name: string;
  gender: "nam" | "nu";
  outfit: string;
  color: string;
}

const CHAR_STORAGE_KEY = "chua-online:character";
const DHARMA_NAMES = [
  "Chân Giác",
  "Tuệ Tâm",
  "An Nhiên",
  "Minh Triết",
  "Thiện Nhân",
  "Tịnh Độ",
  "Phúc An",
  "Diệu Âm",
  "Tâm An",
  "Như Nguyện",
  "Trí Dũng",
  "Thanh Tịnh",
  "Bảo Quang",
  "Liên Hoa",
  "Từ Bi",
];

let currentProfile: CharacterProfile = {
  name: "Chân Giác",
  gender: "nam",
  outfit: "trang-lam",
  color: "#5a8ac4",
};

const savedChar = localStorage.getItem(CHAR_STORAGE_KEY);
const shouldAutoEnter = Boolean(savedChar) || new URLSearchParams(window.location.search).has("enter");
if (savedChar) {
  try {
    currentProfile = JSON.parse(savedChar);
  } catch {
    // Bỏ qua lỗi
  }
}

const bootScreen = document.getElementById("boot");
const bootFill = document.getElementById("bootFill");
const bootStatus = document.getElementById("bootStatus");
const onboardingRoot = document.getElementById("onboarding-root");
const hud = document.getElementById("hud");

if (shouldAutoEnter) {
  onboardingRoot?.classList.add("hidden");
  hud?.classList.remove("hidden");
}

const inputDharmaName = document.getElementById(
  "input-dharma-name",
) as HTMLInputElement;
const btnRandomName = document.getElementById("btn-random-name");
const onbPlate = document.getElementById("onb-plate");
const onbFigure = document.getElementById("onb-figure") as HTMLElement | null;
const genderChips = document.getElementById("gender-chips");
const outfitChips = document.getElementById("outfit-chips");
const colorSwatches = document.getElementById("color-swatches");
const btnEnterTemple = document.getElementById("btn-enter-temple");
const btnCharCustom = document.getElementById("btn-char-custom");

function adjustColorBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace("#", ""), 16);
  const amt = Math.round(2.55 * percent);
  const R = Math.max(0, Math.min(255, (num >> 16) + amt));
  const G = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amt));
  const B = Math.max(0, Math.min(255, (num & 0x0000ff) + amt));
  return `#${(0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1)}`;
}

function updateSvgPreview(): void {
  if (onbFigure) {
    onbFigure.dataset.look = currentProfile.gender;
    const f =
      currentProfile.outfit === "ba-ba"
        ? "baba"
        : currentProfile.outfit === "ao-dai"
          ? "aodai"
          : "trang";
    onbFigure.dataset.family = f;
    onbFigure.style.setProperty("--onb-robe", currentProfile.color);
    onbFigure.style.setProperty(
      "--onb-robe-shade",
      adjustColorBrightness(currentProfile.color, -25),
    );
    onbFigure.classList.remove("is-pop");
    void onbFigure.offsetWidth; // trigger reflow
    onbFigure.classList.add("is-pop");
  }
  if (onbPlate) onbPlate.textContent = currentProfile.name;
  if (inputDharmaName) inputDharmaName.value = currentProfile.name;

  // Cập nhật nhân vật Chibi 3D chuẩn Chùa Sen theo profile hiện tại
  if (engine.player) {
    engine.player.setProfile({
      name: currentProfile.name,
      gender: currentProfile.gender as "nam" | "nu",
      color: currentProfile.color,
    });
  }
}

btnRandomName?.addEventListener("click", () => {
  const rand = DHARMA_NAMES[Math.floor(Math.random() * DHARMA_NAMES.length)];
  currentProfile.name = rand;
  updateSvgPreview();
});

inputDharmaName?.addEventListener("input", () => {
  currentProfile.name = inputDharmaName.value.trim() || "Chân Giác";
  if (onbPlate) onbPlate.textContent = currentProfile.name;
});

genderChips?.addEventListener("click", (e) => {
  const target = (e.target as HTMLElement).closest(".chip") as HTMLElement;
  if (!target) return;
  genderChips
    .querySelectorAll(".chip")
    .forEach((c) => c.classList.remove("active"));
  target.classList.add("active");
  currentProfile.gender = (target.dataset.gender || "nam") as "nam" | "nu";
  updateSvgPreview();
});

outfitChips?.addEventListener("click", (e) => {
  const target = (e.target as HTMLElement).closest(".chip") as HTMLElement;
  if (!target) return;
  outfitChips
    .querySelectorAll(".chip")
    .forEach((c) => c.classList.remove("active"));
  target.classList.add("active");
  currentProfile.outfit = target.dataset.outfit || "trang-lam";
  updateSvgPreview();
});

colorSwatches?.addEventListener("click", (e) => {
  const target = (e.target as HTMLElement).closest(
    ".onb__swatch",
  ) as HTMLElement;
  if (!target) return;
  colorSwatches
    .querySelectorAll(".onb__swatch")
    .forEach((c) => c.classList.remove("active"));
  target.classList.add("active");
  currentProfile.color = target.dataset.color || "#5a8ac4";
  updateSvgPreview();
});

function enterTemple(): void {
  localStorage.setItem(CHAR_STORAGE_KEY, JSON.stringify(currentProfile));
  updateSvgPreview();
  onboardingRoot?.classList.add("hidden");
  hud?.classList.remove("hidden");
  showToast(`A Di Đà Phật! Chào mừng đạo hữu ${currentProfile.name}`);
}

btnEnterTemple?.addEventListener("click", enterTemple);
btnCharCustom?.addEventListener("click", () => {
  onboardingRoot?.classList.remove("hidden");
});

// 7. Khởi động Boot Splash & Cảnh 3D
if (bootFill) bootFill.style.width = "100%";
if (bootStatus) bootStatus.textContent = "Đang hoàn tất cảnh chùa…";

setTimeout(() => {
  if (bootScreen) {
    bootScreen.classList.add("is-hidden");
    setTimeout(() => bootScreen.remove(), 600);
  }

  engine.start();

  if (!savedChar && !shouldAutoEnter) {
    onboardingRoot?.classList.remove("hidden");
  } else {
    hud?.classList.remove("hidden");
    updateSvgPreview();
  }
}, 750);

// 8. Tương Tác Ngữ Cảnh [F] (Context Prompts)
const hudContextWrap = document.getElementById("hud-context-wrap");
const hudContextBtn = document.getElementById("hud-context-btn");
const hudContextText = document.getElementById("hud-context-text");

let currentContextAction:
  | "incense"
  | "bell"
  | "bow"
  | "lantern"
  | "meditate"
  | null = null;

function updateContextPrompt(playerX: number, playerZ: number): void {
  const dist = (x: number, z: number) => Math.hypot(playerX - x, playerZ - z);

  // 1. Gần Lư hương Tam Bảo (0, -2.5)
  if (dist(0, -2.5) < 3.8) {
    showContextPrompt("Dâng một nén tâm hương", "incense");
    return;
  }
  // 2. Gần Tháp Chuông (15.5, 4.0)
  if (dist(15.5, 4.0) < 4.5) {
    showContextPrompt("Đánh Đại Hồng Chung", "bell");
    return;
  }
  // 3. Gần Bàn thờ Chánh Điện (0, -18.0)
  if (dist(0, -18.0) < 4.5) {
    showContextPrompt("Lễ Phật Tam Bảo", "bow");
    return;
  }
  // 4. Gần Cầu gỗ Hồ sen (0, 18.0)
  if (dist(0, 18.0) < 5.0) {
    showContextPrompt("Thả hoa đăng cầu bình an", "lantern");
    return;
  }

  hideContextPrompt();
}

function showContextPrompt(
  label: string,
  action: typeof currentContextAction,
): void {
  currentContextAction = action;
  if (hudContextText) hudContextText.textContent = label;
  hudContextWrap?.classList.remove("hidden");
}

function hideContextPrompt(): void {
  currentContextAction = null;
  hudContextWrap?.classList.add("hidden");
}

function triggerCurrentContext(): void {
  if (!currentContextAction) return;
  if (currentContextAction === "incense") doIncense();
  else if (currentContextAction === "bell") doBell();
  else if (currentContextAction === "bow") doBow();
  else if (currentContextAction === "lantern") doLantern();
  else if (currentContextAction === "meditate") toggleMeditate();
}

hudContextBtn?.addEventListener("click", triggerCurrentContext);
window.addEventListener("keydown", (e) => {
  if ((e.key === "f" || e.key === "F") && currentContextAction) {
    triggerCurrentContext();
  }
});

// 9. Kết Nối Nút Công Phu & Nghi Lễ
const btnBow = document.getElementById("btn-bow");
const btnPray = document.getElementById("btn-pray");
const btnSweep = document.getElementById("btn-sweep");
const btnIncense = document.getElementById("btn-incense");
const btnBell = document.getElementById("btn-bell");
const btnChant = document.getElementById("btn-chant");
const btnMala = document.getElementById("btn-mala");
const btnMeditate = document.getElementById("btn-meditate");
const btnLantern = document.getElementById("btn-lantern");
const btnSound = document.getElementById("btn-sound");

function doBow(): void {
  // Lễ Phật chu kỳ đầy đủ 8 keyframe trong 2.6s chuẩn Chùa Sen
  engine.player.bow(() => {
    showToast("Đã hoàn tất lễ bái Tam Bảo");
  });
  triggerHaptic("bead");
  markTaskComplete("bow");
  showToast("🙇 Thành tâm kính lễ Tam Bảo");
}

function doPray(): void {
  const phrases = [
    "🙏 Nam Mô A Di Đà Phật",
    "🙏 A Di Đà Phật",
    "🙏 Chắp tay cung kính",
    "🙏 Nguyện an lành",
  ];
  const chosen = phrases[Math.floor(Math.random() * phrases.length)];
  engine.player.showChatBubble(chosen, 3200);
  triggerHaptic("bead");
  showToast(chosen);
}

let isSweeping = false;
function toggleSweep(): void {
  isSweeping = !isSweeping;
  if (isSweeping) {
    if (isMeditating) toggleMeditate();
    engine.player.setCarry("broom");
    engine.player.setSubtitle("đang quét lá");
    btnSweep?.classList.add("active");
    showToast("🧹 Cầm chổi quét lá sân chùa thanh tịnh tâm ý");
  } else {
    engine.player.setCarry(null);
    engine.player.setSubtitle("");
    btnSweep?.classList.remove("active");
    showToast("Đã cất chổi");
  }
}

function doIncense(): void {
  triggerHaptic("bead");
  markTaskComplete("incense");
  net.sendRitual(RITUAL_TYPES.INCENSE);
  showToast("🪔 Đã dâng một nén tâm hương cầu nguyện an lành");
}

function doBell(): void {
  audio.playBell();
  net.sendRitual(RITUAL_TYPES.BELL);
  showToast("🔔 Chuông đại hồng ngân vang thức tỉnh lòng người");
}

let chantSubtitleTimer: number | null = null;
function doMo(): void {
  audio.playMo();
  net.sendRitual(RITUAL_TYPES.CHANT);
  engine.player.setSubtitle("đang tụng kinh");
  if (chantSubtitleTimer) clearTimeout(chantSubtitleTimer);
  chantSubtitleTimer = window.setTimeout(() => {
    if (!isMeditating && !isSweeping) {
      engine.player.setSubtitle("");
    }
  }, 3500);
  showToast("🪵 Tiếng mõ thanh tịnh nhịp nhàng");
}

let malaCount = 0;
let malaSubtitleTimer: number | null = null;
function doMala(): void {
  malaCount = (malaCount % 108) + 1;
  audio.playChime();
  markTaskComplete("mala");
  engine.player.setSubtitle("đang niệm Phật");
  if (malaSubtitleTimer) clearTimeout(malaSubtitleTimer);
  malaSubtitleTimer = window.setTimeout(() => {
    if (!isMeditating && !isSweeping) {
      engine.player.setSubtitle("");
    }
  }, 4000);

  if (malaCount === 108) {
    audio.playBell();
    showToast(
      "🎉 Hoàn thành tràng 108 hạt niệm Phật – Công đức viên mãn!",
      3600,
    );
  } else {
    showToast(`📿 Lần chuỗi hạt: ${malaCount} / 108`);
  }
}

let isMeditating = false;
function toggleMeditate(): void {
  isMeditating = !isMeditating;
  if (isMeditating) {
    if (isSweeping) toggleSweep();
    engine.player.sit(true);
    engine.player.setSubtitle("đang thiền");
    audio.updateAudioLevels(false, true); // Duck âm nền xuống 12%
    markTaskComplete("meditate");
    btnMeditate?.classList.add("active");
    showToast("🧘 Đang ngồi thiền tĩnh tâm (Nhạc nền giảm sâu 12%)");
  } else {
    engine.player.sit(false);
    engine.player.setSubtitle("");
    audio.updateAudioLevels(false, false);
    btnMeditate?.classList.remove("active");
    showToast("Đã xả thiền");
  }
}

function doLantern(): void {
  triggerHaptic("bead");
  net.sendLantern();
  showToast("🏮 Đã thả hoa đăng lung linh cầu an lành trên hồ sen");
}

btnBow?.addEventListener("click", doBow);
btnPray?.addEventListener("click", doPray);
btnSweep?.addEventListener("click", toggleSweep);
btnIncense?.addEventListener("click", doIncense);
btnBell?.addEventListener("click", doBell);
btnChant?.addEventListener("click", doMo);
btnMala?.addEventListener("click", doMala);
btnMeditate?.addEventListener("click", toggleMeditate);
btnLantern?.addEventListener("click", doLantern);

// Nếu người chơi di chuyển trong lúc ngồi thiền -> tự động xả thiền
const origPlayerUpdate = engine.player.update.bind(engine.player);
engine.player.update = (deltaSec: number, cameraYaw: number) => {
  origPlayerUpdate(deltaSec, cameraYaw);
  if (isMeditating && engine.player.anim === ANIM_TYPES.WALK) {
    isMeditating = false;
    engine.player.setSubtitle(isSweeping ? "đang quét lá" : "");
    audio.updateAudioLevels(false, false);
    btnMeditate?.classList.remove("active");
  }
};

// 9. Cài đặt Âm thanh & Nhạc Thiền chuasen.com
const btnChantAudio = document.getElementById("btn-chant-audio");
const hudChantLabel = document.getElementById("hud-chant-label");
const modalSound = document.getElementById("modal-sound");
const btnCloseSoundModal = document.getElementById("btn-close-sound-modal");
const btnToggleChantModal = document.getElementById("btn-toggle-chant-modal");
const btnToggleMusicModal = document.getElementById("btn-toggle-music-modal");
const chantTrackList = document.getElementById("chant-track-list");
const musicTrackList = document.getElementById("music-track-list");
const sliderChantVol = document.getElementById(
  "slider-chant-vol",
) as HTMLInputElement | null;
const sliderMusicVol = document.getElementById(
  "slider-music-vol",
) as HTMLInputElement | null;
const sliderMasterVol = document.getElementById(
  "slider-master-vol",
) as HTMLInputElement | null;
const sliderSfxVol = document.getElementById(
  "slider-sfx-vol",
) as HTMLInputElement | null;
const btnToggleMuteAll = document.getElementById("btn-toggle-mute-all");

function renderChantTracks(): void {
  if (!chantTrackList) return;
  chantTrackList.innerHTML = "";
  const currentIdx = audio.currentChantIndex;
  const isPlaying = audio.getIsChantPlaying();

  CHANT_TRACKS.forEach((track, idx) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = `sound-track-chip ${idx === currentIdx && isPlaying ? "active" : ""}`;
    chip.innerHTML = `
      <span>${idx === currentIdx && isPlaying ? "▶ " : ""}${track.title}</span>
      <span class="track-meta">${track.durationSec}s · ${track.credit.split("·")[0].trim()}</span>
    `;
    chip.addEventListener("click", () => {
      audio.playChant(idx);
      showToast(`📿 Đang phát: ${track.title}`);
    });
    chantTrackList.appendChild(chip);
  });
}

function renderMusicTracks(): void {
  if (!musicTrackList) return;
  musicTrackList.innerHTML = "";
  const currentIdx = audio.currentMusicIndex;
  const isPlaying = audio.getIsMusicPlaying();

  ZEN_MUSIC_TRACKS.forEach((track, idx) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = `sound-track-chip ${idx === currentIdx && isPlaying ? "active" : ""}`;
    chip.innerHTML = `
      <span>${idx === currentIdx && isPlaying ? "▶ " : ""}${track.title}</span>
      <span class="track-meta">${track.durationSec}s</span>
    `;
    chip.addEventListener("click", () => {
      audio.playZenMusic(idx);
      showToast(`🎶 Đang phát nhạc thiền: ${track.title}`);
    });
    musicTrackList.appendChild(chip);
  });
}

function syncSoundUI(): void {
  const isChanting = audio.getIsChantPlaying();
  const currentChant = audio.getCurrentChant();
  const isMusic = audio.getIsMusicPlaying();

  if (btnChantAudio && hudChantLabel) {
    if (isChanting) {
      btnChantAudio.classList.add("active");
      hudChantLabel.textContent = `${currentChant.title} ⏸`;
    } else {
      btnChantAudio.classList.remove("active");
      hudChantLabel.textContent = "Nghe niệm Phật";
    }
  }

  if (btnToggleChantModal) {
    btnToggleChantModal.textContent = isChanting ? "Dừng niệm" : "Phát ngay";
  }

  if (btnToggleMusicModal) {
    btnToggleMusicModal.textContent = isMusic ? "Dừng nhạc" : "Phát ngay";
  }

  if (btnSound) {
    btnSound.textContent = audio.isMuted ? "🔇" : "🔊";
  }

  if (btnToggleMuteAll) {
    btnToggleMuteAll.textContent = audio.isMuted ? "Bật tiếng" : "Tắt tiếng";
  }

  renderChantTracks();
  renderMusicTracks();
}

audio.onStateChange = () => {
  syncSoundUI();
};

btnChantAudio?.addEventListener("click", () => {
  const playing = audio.toggleChant();
  if (playing) {
    showToast(`📿 Đang phát niệm Phật: ${audio.getCurrentChant().title}`);
  } else {
    showToast("Đã dừng niệm Phật");
  }
});

btnSound?.addEventListener("click", () => {
  modalSound?.classList.remove("hidden");
  syncSoundUI();
});

btnCloseSoundModal?.addEventListener("click", () => {
  modalSound?.classList.add("hidden");
});

btnToggleChantModal?.addEventListener("click", () => {
  audio.toggleChant();
});

btnToggleMusicModal?.addEventListener("click", () => {
  audio.toggleZenMusic();
});

sliderChantVol?.addEventListener("input", (e) => {
  const val = Number((e.target as HTMLInputElement).value);
  audio.setChantVolume(val / 100);
});

sliderMusicVol?.addEventListener("input", (e) => {
  const val = Number((e.target as HTMLInputElement).value);
  audio.setMusicVolume(val / 100);
});

sliderMasterVol?.addEventListener("input", (e) => {
  const val = Number((e.target as HTMLInputElement).value);
  audio.setMasterVolume(val / 100);
});

sliderSfxVol?.addEventListener("input", (e) => {
  const val = Number((e.target as HTMLInputElement).value);
  audio.setSfxVolume(val / 100);
});

btnToggleMuteAll?.addEventListener("click", () => {
  const muted = audio.toggleMute();
  showToast(muted ? "🔇 Đã tắt toàn bộ âm thanh" : "🔊 Đã bật âm thanh");
});

// Render khởi tạo ban đầu
renderChantTracks();
renderMusicTracks();

// 10. Cập Nhật Tiến Trình & Cấp Bậc Lên HUD
function getLotusTier(streak: number): { name: string; icon: string } {
  if (streak >= 50) return { name: "Cấp 7 · Sen ngàn cánh", icon: "🪷" };
  if (streak >= 30) return { name: "Cấp 6 · Sen nở", icon: "🪷" };
  if (streak >= 20) return { name: "Cấp 5 · Sen hé", icon: "🪷" };
  if (streak >= 15) return { name: "Cấp 4 · Nụ sen", icon: "🌸" };
  if (streak >= 10) return { name: "Cấp 3 · Lá sen", icon: "🍃" };
  if (streak >= 5) return { name: "Cấp 2 · Mầm sen", icon: "🌱" };
  return { name: "Cấp 1 · Hạt sen", icon: "🌰" };
}

function syncHudProgress(): void {
  const { streak } = getTodayQue();
  const tier = getLotusTier(streak);
  const hudStreakCount = document.getElementById("hud-streak-count");
  const hudTierEmblem = document.getElementById("hud-tier-emblem");
  if (hudStreakCount) hudStreakCount.textContent = String(streak);
  if (hudTierEmblem) hudTierEmblem.textContent = tier.icon;
}

syncHudProgress();

// 11. Modal Hôm Nay, Âm Lịch & 48 Quẻ Chánh Niệm
const modalToday = document.getElementById("modal-today");
const btnCloseModal = document.getElementById("btn-close-modal");
const btnJourney = document.getElementById("btn-journey");
const btnStreak = document.getElementById("btn-streak");

const specialDayBanner = document.getElementById("special-day-banner");
const specialDayTitle = document.getElementById("special-day-title");
const specialDayImg = document.getElementById(
  "special-day-img",
) as HTMLImageElement | null;
const modalSolarDate = document.getElementById("modal-solar-date");
const modalLunarDate = document.getElementById("modal-lunar-date");
const modalCanchiDate = document.getElementById("modal-canchi-date");

const queCardNum = document.getElementById("que-card-num");
const queTitle = document.getElementById("que-title");
const queTagline = document.getElementById("que-tagline");
const queDesc = document.getElementById("que-desc");
const quePractice = document.getElementById("que-practice");
const queImg = document.getElementById("que-img") as HTMLImageElement | null;

const streakIcon = document.getElementById("streak-icon");
const streakText = document.getElementById("streak-text");
const streakTier = document.getElementById("streak-tier");

const QUE_TEMPLE_IMAGES = [
  "./images/thien-online.png",
  "./images/cay-bo-de.png",
  "./images/quan-the-am-bo-tat.png",
  "./images/tha-den-hoa-dang.png",
  "./images/thap-huong-online.png",
  "./images/niem-phat-online.png",
];

function openTodayModal(): void {
  const lunar = getTodayLunar();
  const updatedProgress = markTaskComplete("que");
  const { card, streak } = getTodayQue();

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

  if (modalLunarDate) {
    modalLunarDate.textContent = `Âm lịch: Ngày ${lunar.day} tháng ${lunar.month}, năm ${lunar.canChiYear}`;
  }
  if (modalCanchiDate) {
    modalCanchiDate.textContent = `Ngày ${lunar.canChiDay} · Tháng ${lunar.canChiMonth} · Tiết ${lunar.solarTerm}`;
  }

  if (lunar.isSpecialDay && specialDayBanner && specialDayTitle) {
    specialDayTitle.textContent = lunar.specialTitle || "Ngày Lễ Phật Giáo";
    if (specialDayImg) {
      if (lunar.specialTitle?.includes("Phật Đản")) {
        specialDayImg.src = "./images/phat-dan.png";
      } else if (lunar.specialTitle?.includes("Vu Lan")) {
        specialDayImg.src = "./images/le-vu-lan.png";
      } else if (
        lunar.specialTitle?.includes("Rằm") ||
        lunar.specialTitle?.includes("Mùng một")
      ) {
        specialDayImg.src = "./images/ngay-ram-mung-mot.png";
      } else {
        specialDayImg.src = "./images/lich-am.png";
      }
    }
    specialDayBanner.classList.remove("hidden");
  } else if (specialDayBanner) {
    specialDayBanner.classList.add("hidden");
  }

  if (queCardNum) queCardNum.textContent = `#${card.id} / 48`;
  if (queTitle) queTitle.textContent = card.title;
  if (queTagline) queTagline.textContent = card.tagline;
  if (queDesc) queDesc.textContent = card.desc;
  if (quePractice) quePractice.textContent = card.practice;

  if (queImg) {
    queImg.src = QUE_TEMPLE_IMAGES[card.id % QUE_TEMPLE_IMAGES.length];
  }

  const tier = getLotusTier(streak);
  if (streakText) streakText.textContent = `${streak} ngày công phu tinh tấn`;
  if (streakTier) streakTier.textContent = tier.name;
  if (streakIcon) streakIcon.textContent = tier.icon;

  document
    .getElementById("task-bow")
    ?.classList.toggle("done", updatedProgress.tasksDone.bow);
  document
    .getElementById("task-incense")
    ?.classList.toggle("done", updatedProgress.tasksDone.incense);
  document
    .getElementById("task-mala")
    ?.classList.toggle("done", updatedProgress.tasksDone.mala);
  document
    .getElementById("task-meditate")
    ?.classList.toggle("done", updatedProgress.tasksDone.meditate);
  document
    .getElementById("task-que")
    ?.classList.toggle("done", updatedProgress.tasksDone.que);

  modalToday?.classList.remove("hidden");
  syncHudProgress();
}

btnJourney?.addEventListener("click", openTodayModal);
btnStreak?.addEventListener("click", openTodayModal);
btnCloseModal?.addEventListener("click", () => {
  modalToday?.classList.add("hidden");
});

// 12. Modal Thắng Cảnh & Chiêm Bái Chùa Sen (Gallery)
const btnGallery = document.getElementById("btn-gallery");
const modalGallery = document.getElementById("modal-gallery");
const btnCloseGalleryModal = document.getElementById("btn-close-gallery-modal");

btnGallery?.addEventListener("click", () => {
  modalGallery?.classList.remove("hidden");
});

btnCloseGalleryModal?.addEventListener("click", () => {
  modalGallery?.classList.add("hidden");
});

// 12. Cập nhật chu kỳ Ngày/Đêm định kỳ mỗi phút
setInterval(() => {
  engine.sky.updateTimeOfDay();
}, 60000);

// 13. Đăng ký Service Worker PWA Offline
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch((err) => {
      console.warn("[PWA] Service Worker registration failed:", err);
    });
  });
}
