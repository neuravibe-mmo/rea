/**
 * Giai đoạn 5: Hệ thống Âm thanh (Audio Engine) & Xúc giác (Haptics)
 * Tích hợp nguồn tài nguyên âm thanh & nhạc thiền chính thức từ chuasen.com:
 * 1. Web Audio API & Spatial Sound:
 *    - Sử dụng AudioContext kết hợp PannerNode HRTF để khi người chơi đi lại gần
 *      Tháp Chuông hay Chánh Điện, âm thanh sẽ to dần và định vị theo tai trái/tai phải.
 * 2. Cơ chế Giảm Âm Nền Tự Động (Audio Ducking):
 *    - updateAudioLevels(isChanting, isMeditating, bgGainNode)
 *    - Giảm nhạc nền xuống 25% khi tụng kinh/gõ mõ; giảm sâu xuống 12% khi ngồi thiền.
 * 3. Mô phỏng Gõ Chuông, Mõ & Lần Chuỗi (Haptic Feedback):
 *    - triggerHaptic('bell' | 'bead' | 'mo')
 *    - Sử dụng Navigator Vibration API với các xung nhịp đặc trưng.
 * 4. Phát tệp Niệm Phật & Nhạc Thiền tịnh tâm (MP3/WebM từ chuasen.com)
 */

export interface AudioTrack {
  id: string;
  title: string;
  src: string;
  durationSec: number;
  license: string;
  credit: string;
  sourceUrl?: string;
}

export const CHANT_TRACKS: AudioTrack[] = [
  {
    id: "niem-phat-ky-duyen",
    title: "Niệm Phật Kỳ Duyên",
    src: "./audio/niem-phat-ky-duyen.mp3",
    durationSec: 176.4,
    license: "CC0 1.0",
    credit: "SieuAmThanh · Niệm Nam Mô A Di Đà Phật trầm hùng",
  },
  {
    id: "kinh-a-di-da",
    title: "Kinh A Di Đà",
    src: "./audio/kinh-a-di-da.mp3",
    durationSec: 179.95,
    license: "CC0 1.0",
    credit: "SieuAmThanh · Tụng kinh A Di Đà truyền thống",
  },
  {
    id: "niem-phat-ngay-ram",
    title: "Niệm Phật Ngày Rằm",
    src: "./audio/niem-phat-ngay-ram.mp3",
    durationSec: 70.09,
    license: "CC0 1.0",
    credit: "SieuAmThanh · Niệm Phật thanh tịnh ngày sóc vọng",
  },
  {
    id: "chua-bai-dinh",
    title: "Chuông Chùa Bái Đính",
    src: "./audio/chua-bai-dinh.mp3",
    durationSec: 27.8,
    license: "CC0 1.0",
    credit: "SieuAmThanh · Tiếng đại hồng chung ngân vang",
  },
];

export const ZEN_MUSIC_TRACKS: AudioTrack[] = [
  {
    id: "nhac-dan-tranh",
    title: "Đàn tranh độc tấu",
    src: "./audio/nhac/dan-tranh.mp3",
    durationSec: 85.09,
    license: "CC0 1.0",
    credit: "neolein (đàn tranh, thang ngũ cung) · Freesound",
    sourceUrl: "https://freesound.org/people/neolein/sounds/472707/",
  },
  {
    id: "nhac-nui-da",
    title: "Núi đá vôi",
    src: "./audio/nhac/nui-da.mp3",
    durationSec: 104.5,
    license: "CC0 1.0",
    credit: "neolein (đàn tranh trên nền nhạc núi rừng) · Freesound",
    sourceUrl: "https://freesound.org/people/neolein/sounds/664200/",
  },
  {
    id: "nhac-hoa-sen",
    title: "Hoa sen",
    src: "./audio/nhac/hoa-sen.mp3",
    durationSec: 120,
    license: "CC0 1.0",
    credit: "nemaavla (đàn phím, chuông, tiếng ngân) · Freesound",
    sourceUrl: "https://freesound.org/people/nemaavla/sounds/507957/",
  },
];

// Singleton AudioContext toàn cục
let globalAudioCtx: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (!globalAudioCtx) {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    globalAudioCtx = new AudioCtx();
  }
  if (globalAudioCtx.state === "suspended") {
    globalAudioCtx.resume().catch(() => {});
  }
  return globalAudioCtx;
}

/**
 * 2. Cơ chế Giảm Âm Nền Tự Động (Audio Ducking)
 */
export function updateAudioLevels(
  isChanting: boolean,
  isMeditating: boolean,
  bgGainNode: GainNode,
): void {
  const audioCtx = getAudioContext();
  let targetVolume = 0.5; // Âm lượng chuẩn
  if (isChanting) targetVolume = 0.25; // Giảm nhạc nền xuống 25% khi tụng kinh/gõ mõ
  if (isMeditating) targetVolume = 0.12; // Giảm sâu xuống 12% khi ngồi thiền

  bgGainNode.gain.setTargetAtTime(targetVolume, audioCtx.currentTime, 0.5);
}

/**
 * 3. Mô phỏng Gõ Chuông, Mõ & Lần Chuỗi (Haptic Feedback)
 */
export function triggerHaptic(type: "bell" | "bead" | "mo"): void {
  if ("vibrate" in navigator) {
    try {
      if (type === "bell") navigator.vibrate([40, 60, 20]); // Rung ngân vang
      else if (type === "mo") navigator.vibrate(25); // Rung nhát dứt khoát
      else if (type === "bead") navigator.vibrate(15); // Rung nhẹ từng hạt
    } catch {
      // Bỏ qua nếu trình duyệt chặn rung
    }
  }
}

/**
 * Quản lý toàn diện Audio Engine, Nhạc Thiền, Tụng Kinh & Spatial Panner cho Chùa Sen
 */
export class AudioManager {
  public ctx: AudioContext | null = null;
  public masterGain: GainNode | null = null;
  public bgGain: GainNode | null = null;
  public sfxGain: GainNode | null = null;
  public chantGain: GainNode | null = null;
  public musicGain: GainNode | null = null;

  public isMuted: boolean = false;
  private isAmbientPlaying: boolean = false;
  private ambientOscillators: OscillatorNode[] = [];

  // Vị trí Panner 3D cho các công trình trong chùa
  public bellPanner: PannerNode | null = null; // Tháp Chuông (15.5, 3.5, 4.0)
  public moPanner: PannerNode | null = null; // Gian Mõ Chánh Điện (5.25, 1.5, -18.0)
  public chantPanner: PannerNode | null = null; // Tòa Sen Chánh Điện (0, 1.5, -16.0)

  // Quản lý Track Tụng Kinh & Nhạc Thiền từ chuasen.com
  private chantAudio: HTMLAudioElement | null = null;
  private chantSourceNode: MediaElementAudioSourceNode | null = null;
  public currentChantIndex: number = 0;
  private isChantPlaying: boolean = false;

  private musicAudio: HTMLAudioElement | null = null;
  private musicSourceNode: MediaElementAudioSourceNode | null = null;
  public currentMusicIndex: number = 0;
  private isMusicPlaying: boolean = false;

  // Lắng nghe thay đổi trạng thái phát
  public onStateChange?: () => void;

  constructor() {
    this.initUserGestureAudio();
  }

  private initUserGestureAudio(): void {
    const unlock = () => {
      this.ensureContext();
      window.removeEventListener("click", unlock);
      window.removeEventListener("touchstart", unlock);
      window.removeEventListener("keydown", unlock);
    };

    window.addEventListener("click", unlock, { once: true });
    window.addEventListener("touchstart", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
  }

  public ensureContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = getAudioContext();

      // Cấu hình âm thanh nền trên iOS Safari
      try {
        const nav = navigator as unknown as { audioSession?: { type: string } };
        if (nav.audioSession) {
          nav.audioSession.type = "playback";
        }
      } catch {
        // Trình duyệt không hỗ trợ audioSession
      }

      // Master Gain
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      // Kênh Nhạc Nền / Drone Tổng Hợp
      this.bgGain = this.ctx.createGain();
      this.bgGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      this.bgGain.connect(this.masterGain);

      // Kênh Nhạc Thiền Đàn Tranh / Núi Đá / Hoa Sen
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.6, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      // Kênh Tụng Kinh / Niệm Phật
      this.chantGain = this.ctx.createGain();
      this.chantGain.gain.setValueAtTime(0.85, this.ctx.currentTime);
      this.chantGain.connect(this.masterGain);

      // Kênh Hiệu Ứng (SFX Gain)
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      // 1. Web Audio API & Spatial Sound: Tháp Chuông (x: 15.5, y: 3.5, z: 4.0)
      this.bellPanner = this.createSpatialPanner(15.5, 3.5, 4.0);

      // 1. Web Audio API & Spatial Sound: Gian Mõ Chánh Điện (x: 5.25, y: 1.5, z: -18.0)
      this.moPanner = this.createSpatialPanner(5.25, 1.5, -18.0);

      // 1. Web Audio API & Spatial Sound: Chánh Điện Niệm Phật (x: 0, y: 1.5, z: -16.0)
      this.chantPanner = this.createSpatialPanner(0, 1.5, -16.0);

      // Bật drone thiền ambient tĩnh tâm
      const navConn = (
        navigator as unknown as { connection?: { saveData?: boolean } }
      ).connection;
      if (!navConn || navConn.saveData !== true) {
        this.startZenAmbientDrone();
      }
    }

    if (this.ctx.state === "suspended") {
      this.ctx.resume().catch(() => {});
    }

    return this.ctx;
  }

  /**
   * Tạo bộ định vị âm thanh không gian 3D (PannerNode HRTF)
   */
  private createSpatialPanner(x: number, y: number, z: number): PannerNode {
    const ctx = this.ctx!;
    const panner = ctx.createPanner();
    panner.panningModel = "HRTF";
    panner.distanceModel = "exponential";
    panner.refDistance = 4.0;
    panner.maxDistance = 65.0;
    panner.rolloffFactor = 1.2;
    panner.coneInnerAngle = 360;

    if (panner.positionX) {
      panner.positionX.setValueAtTime(x, ctx.currentTime);
      panner.positionY.setValueAtTime(y, ctx.currentTime);
      panner.positionZ.setValueAtTime(z, ctx.currentTime);
    } else {
      panner.setPosition(x, y, z);
    }

    panner.connect(this.sfxGain!);
    return panner;
  }

  /**
   * 1. Cập nhật vị trí và hướng nhìn của tai nghe (AudioListener) theo vị trí người chơi
   */
  public updateListener(
    playerX: number,
    playerY: number,
    playerZ: number,
    facing: number,
  ): void {
    if (!this.ctx || !this.ctx.listener) return;
    const now = this.ctx.currentTime;
    const listener = this.ctx.listener;

    // Tọa độ tai nghe (ngang tầm đầu nhân vật: cao 1.4m)
    const earY = playerY + 1.4;
    if (listener.positionX) {
      listener.positionX.setTargetAtTime(playerX, now, 0.05);
      listener.positionY.setTargetAtTime(earY, now, 0.05);
      listener.positionZ.setTargetAtTime(playerZ, now, 0.05);
    } else {
      listener.setPosition(playerX, earY, playerZ);
    }

    // Hướng nhìn (Forward Vector)
    const fwdX = Math.sin(facing);
    const fwdZ = -Math.cos(facing);
    if (listener.forwardX) {
      listener.forwardX.setTargetAtTime(fwdX, now, 0.05);
      listener.forwardY.setTargetAtTime(0, now, 0.05);
      listener.forwardZ.setTargetAtTime(fwdZ, now, 0.05);
      listener.upX.setValueAtTime(0, now);
      listener.upY.setValueAtTime(1, now);
      listener.upZ.setValueAtTime(0, now);
    } else {
      listener.setOrientation(fwdX, 0, fwdZ, 0, 1, 0);
    }
  }

  /**
   * 2. Cơ chế Giảm Âm Nền Tự Động (Audio Ducking)
   */
  public updateAudioLevels(isChanting: boolean, isMeditating: boolean): void {
    if (!this.bgGain) return;
    const isAnyChanting = isChanting || this.isChantPlaying;
    updateAudioLevels(isAnyChanting, isMeditating, this.bgGain);

    if (this.musicGain && this.ctx) {
      let musicTarget = 0.6;
      if (isAnyChanting) musicTarget = 0.18; // Giảm nhạc nền xuống khi niệm Phật
      if (isMeditating) musicTarget = 0.35; // Giữ êm dịu khi thiền
      this.musicGain.gain.setTargetAtTime(
        musicTarget,
        this.ctx.currentTime,
        0.5,
      );
    }
  }

  /**
   * Phát hoặc Chuyển bài Tụng Kinh / Niệm Phật (Authentic Audio from chuasen.com)
   */
  public playChant(trackIdOrIndex?: string | number): void {
    this.ensureContext();
    if (trackIdOrIndex !== undefined) {
      if (typeof trackIdOrIndex === "number") {
        this.currentChantIndex =
          (trackIdOrIndex + CHANT_TRACKS.length) % CHANT_TRACKS.length;
      } else {
        const found = CHANT_TRACKS.findIndex((t) => t.id === trackIdOrIndex);
        if (found !== -1) this.currentChantIndex = found;
      }
    }

    const track = CHANT_TRACKS[this.currentChantIndex];
    if (!this.chantAudio) {
      this.chantAudio = new Audio();
      this.chantAudio.crossOrigin = "anonymous";
      this.chantAudio.loop = true;

      try {
        if (this.ctx && this.chantGain) {
          this.chantSourceNode = this.ctx.createMediaElementSource(
            this.chantAudio,
          );
          this.chantSourceNode.connect(this.chantGain);
        }
      } catch {
        // Dự phòng nếu trình duyệt giới hạn routing MediaElement
      }

      this.chantAudio.addEventListener("ended", () => {
        this.playNextChant();
      });
    }

    this.chantAudio.src = track.src;
    this.chantAudio
      .play()
      .then(() => {
        this.isChantPlaying = true;
        this.updateAudioLevels(true, false);
        this.onStateChange?.();
      })
      .catch((err) => {
        console.warn("Không thể tự động phát niệm Phật:", err);
      });
  }

  public stopChant(): void {
    if (this.chantAudio) {
      this.chantAudio.pause();
      this.chantAudio.currentTime = 0;
    }
    this.isChantPlaying = false;
    this.updateAudioLevels(false, false);
    this.onStateChange?.();
  }

  public toggleChant(trackIdOrIndex?: string | number): boolean {
    if (this.isChantPlaying) {
      this.stopChant();
      return false;
    } else {
      this.playChant(trackIdOrIndex);
      return true;
    }
  }

  public playNextChant(): void {
    this.currentChantIndex = (this.currentChantIndex + 1) % CHANT_TRACKS.length;
    this.playChant(this.currentChantIndex);
  }

  public getCurrentChant(): AudioTrack {
    return CHANT_TRACKS[this.currentChantIndex];
  }

  public getIsChantPlaying(): boolean {
    return this.isChantPlaying;
  }

  /**
   * Phát Nhạc Thiền tịnh tâm (Đàn Tranh, Núi Đá, Hoa Sen từ chuasen.com)
   */
  public playZenMusic(trackIdOrIndex?: string | number): void {
    this.ensureContext();
    if (trackIdOrIndex !== undefined) {
      if (typeof trackIdOrIndex === "number") {
        this.currentMusicIndex =
          (trackIdOrIndex + ZEN_MUSIC_TRACKS.length) % ZEN_MUSIC_TRACKS.length;
      } else {
        const found = ZEN_MUSIC_TRACKS.findIndex(
          (t) => t.id === trackIdOrIndex,
        );
        if (found !== -1) this.currentMusicIndex = found;
      }
    }

    const track = ZEN_MUSIC_TRACKS[this.currentMusicIndex];
    if (!this.musicAudio) {
      this.musicAudio = new Audio();
      this.musicAudio.crossOrigin = "anonymous";
      this.musicAudio.loop = true;

      try {
        if (this.ctx && this.musicGain) {
          this.musicSourceNode = this.ctx.createMediaElementSource(
            this.musicAudio,
          );
          this.musicSourceNode.connect(this.musicGain);
        }
      } catch {
        // Fallback
      }

      this.musicAudio.addEventListener("ended", () => {
        this.nextZenMusic();
      });
    }

    this.musicAudio.src = track.src;
    this.musicAudio
      .play()
      .then(() => {
        this.isMusicPlaying = true;
        this.onStateChange?.();
      })
      .catch((err) => {
        console.warn("Không thể tự động phát nhạc thiền:", err);
      });
  }

  public stopZenMusic(): void {
    if (this.musicAudio) {
      this.musicAudio.pause();
    }
    this.isMusicPlaying = false;
    this.onStateChange?.();
  }

  public toggleZenMusic(): boolean {
    if (this.isMusicPlaying) {
      this.stopZenMusic();
      return false;
    } else {
      this.playZenMusic();
      return true;
    }
  }

  public nextZenMusic(): void {
    this.currentMusicIndex =
      (this.currentMusicIndex + 1) % ZEN_MUSIC_TRACKS.length;
    this.playZenMusic(this.currentMusicIndex);
  }

  public getCurrentMusic(): AudioTrack {
    return ZEN_MUSIC_TRACKS[this.currentMusicIndex];
  }

  public getIsMusicPlaying(): boolean {
    return this.isMusicPlaying;
  }

  /**
   * Bật nhạc thiền Ambient tĩnh tâm thủ tục (Solfeggio 432Hz Zen Drone)
   */
  public startZenAmbientDrone(): void {
    if (this.isAmbientPlaying || !this.ctx || !this.bgGain) return;
    this.isAmbientPlaying = true;

    const baseFreqs = [108, 216, 432, 528]; // Tần số thiền định thanh lọc tâm thức
    const now = this.ctx.currentTime;

    baseFreqs.forEach((freq, i) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = i % 2 === 0 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(freq, now);

      filter.type = "lowpass";
      filter.frequency.setValueAtTime(freq * 1.5, now);

      const amp = 0.05 / (i + 1);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(amp, now + 4.0);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.bgGain!);

      osc.start(now);
      this.ambientOscillators.push(osc);
    });
  }

  public stopZenAmbientDrone(): void {
    for (const osc of this.ambientOscillators) {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // Bỏ qua nếu đã ngắt
      }
    }
    this.ambientOscillators = [];
    this.isAmbientPlaying = false;
  }

  /**
   * 3. Đánh Đại Hồng Chung (Âm thanh chuông đồng chùa cổ ngân vang 6-8 giây)
   */
  public playBell(useSpatial = true): void {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    triggerHaptic("bell");

    // Tự động ducking âm nền khi tiếng chuông cất lên
    this.updateAudioLevels(true, false);
    setTimeout(() => this.updateAudioLevels(false, false), 5000);

    const now = ctx.currentTime;
    const baseFreq = 216; // Tần số A3 trầm mặc
    const harmonics = [1.0, 1.414, 2.0, 2.76, 3.42, 4.18];

    const bellOutput =
      useSpatial && this.bellPanner ? this.bellPanner : this.sfxGain!;

    harmonics.forEach((ratio, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = i === 0 ? "sine" : "triangle";
      osc.frequency.setValueAtTime(baseFreq * ratio, now);

      filter.type = "bandpass";
      filter.frequency.setValueAtTime(baseFreq * ratio, now);
      filter.Q.setValueAtTime(12, now);

      const initAmp = 0.35 / Math.sqrt(i + 1);
      gain.gain.setValueAtTime(initAmp, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 6.5);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(bellOutput);

      osc.start(now);
      osc.stop(now + 7.0);
    });
  }

  /**
   * 3. Gõ Mõ Tụng Kinh (Âm thanh mõ gỗ mít rỗng, dứt khoát và đanh)
   */
  public playMo(useSpatial = true): void {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    triggerHaptic("mo");

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    osc.type = "sine";
    osc.frequency.setValueAtTime(640, now);
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.08);

    filter.type = "bandpass";
    filter.frequency.setValueAtTime(420, now);
    filter.Q.setValueAtTime(8, now);

    gain.gain.setValueAtTime(0.7, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

    const moOutput =
      useSpatial && this.moPanner ? this.moPanner : this.sfxGain!;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(moOutput);

    osc.start(now);
    osc.stop(now + 0.13);
  }

  /**
   * 3. Lần chuỗi hạt Bồ đề / Gõ Khánh Đồng (Âm thanh khánh trong vắt)
   */
  public playChime(): void {
    if (this.isMuted) return;
    const ctx = this.ensureContext();
    triggerHaptic("bead");

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(1480, now);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);

    osc.connect(gain);
    gain.connect(this.sfxGain!);

    osc.start(now);
    osc.stop(now + 1.9);
  }

  /**
   * Điều chỉnh âm lượng các kênh
   */
  public setMasterVolume(vol: number): void {
    if (!this.masterGain || !this.ctx) return;
    const clamped = Math.max(0, Math.min(1, vol));
    this.masterGain.gain.setValueAtTime(
      this.isMuted ? 0 : clamped,
      this.ctx.currentTime,
    );
  }

  public setMusicVolume(vol: number): void {
    if (!this.musicGain || !this.ctx) return;
    const clamped = Math.max(0, Math.min(1, vol));
    this.musicGain.gain.setValueAtTime(clamped, this.ctx.currentTime);
  }

  public setSfxVolume(vol: number): void {
    if (!this.sfxGain || !this.ctx) return;
    const clamped = Math.max(0, Math.min(1, vol));
    this.sfxGain.gain.setValueAtTime(clamped, this.ctx.currentTime);
  }

  public setChantVolume(vol: number): void {
    if (!this.chantGain || !this.ctx) return;
    const clamped = Math.max(0, Math.min(1, vol));
    this.chantGain.gain.setValueAtTime(clamped, this.ctx.currentTime);
  }

  /**
   * Bật / Tắt toàn bộ âm thanh
   */
  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(
        this.isMuted ? 0 : 0.85,
        this.ctx.currentTime,
      );
    }
    if (this.isMuted) {
      if (this.chantAudio) this.chantAudio.muted = true;
      if (this.musicAudio) this.musicAudio.muted = true;
    } else {
      if (this.chantAudio) this.chantAudio.muted = false;
      if (this.musicAudio) this.musicAudio.muted = false;
    }
    this.onStateChange?.();
    return this.isMuted;
  }
}
