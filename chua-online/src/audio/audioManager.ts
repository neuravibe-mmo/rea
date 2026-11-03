/**
 * Giai đoạn 5: Hệ thống Âm thanh (Audio Engine) & Xúc giác (Haptics)
 *
 * 1. Web Audio API & Spatial Sound:
 *    - Sử dụng AudioContext kết hợp PannerNode HRTF để khi người chơi đi lại gần
 *      Tháp Chuông hay Chánh Điện, âm thanh sẽ to dần và định vị theo tai trái/tai phải.
 * 2. Cơ chế Giảm Âm Nền Tự Động (Audio Ducking):
 *    - updateAudioLevels(isChanting, isMeditating, bgGainNode)
 *    - Giảm nhạc nền xuống 25% khi tụng kinh/gõ mõ; giảm sâu xuống 12% khi ngồi thiền.
 * 3. Mô phỏng Gõ Chuông, Mõ & Lần Chuỗi (Haptic Feedback):
 *    - triggerHaptic('bell' | 'bead' | 'mo')
 *    - Sử dụng Navigator Vibration API với các xung nhịp đặc trưng.
 */

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
    globalAudioCtx.resume();
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
 * Quản lý toàn diện Audio Engine & Spatial Panner cho Chùa Sen
 */
export class AudioManager {
  public ctx: AudioContext | null = null;
  public masterGain: GainNode | null = null;
  public bgGain: GainNode | null = null;
  public sfxGain: GainNode | null = null;
  public isMuted: boolean = false;
  private isAmbientPlaying: boolean = false;

  private ambientOscillators: OscillatorNode[] = [];

  // Vị trí Panner 3D cho các công trình trong chùa
  public bellPanner: PannerNode | null = null; // Tháp Chuông (15.5, 3.5, 4.0)
  public moPanner: PannerNode | null = null; // Gian Mõ Chánh Điện (5.25, 1.5, -18.0)

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

      // Kênh Nhạc Nền (Ambient Music Gain)
      this.bgGain = this.ctx.createGain();
      this.bgGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      this.bgGain.connect(this.masterGain);

      // Kênh Hiệu Ứng (SFX Gain)
      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      // 1. Web Audio API & Spatial Sound: Tháp Chuông (x: 15.5, y: 3.5, z: 4.0)
      this.bellPanner = this.createSpatialPanner(15.5, 3.5, 4.0);

      // 1. Web Audio API & Spatial Sound: Gian Mõ Chánh Điện (x: 5.25, y: 1.5, z: -18.0)
      this.moPanner = this.createSpatialPanner(5.25, 1.5, -18.0);

      // Bật nhạc thiền ambient tĩnh tâm tự động
      const navConn = (
        navigator as unknown as { connection?: { saveData?: boolean } }
      ).connection;
      if (!navConn || navConn.saveData !== true) {
        this.startZenAmbientDrone();
      }
    }

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
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
    updateAudioLevels(isChanting, isMeditating, this.bgGain);
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

      // Thêm rung nhẹ (LFO filter) tạo độ sâu không gian
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(freq * 1.5, now);

      const amp = 0.06 / (i + 1);
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
      // Ngân vang sâu lắng suy hao chậm theo hàm mũ
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
    // Mõ gỗ tụt tần số nhanh từ 640Hz xuống 140Hz tạo tiếng "cốc" đanh
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
    return this.isMuted;
  }
}
