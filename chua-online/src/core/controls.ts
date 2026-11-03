import * as THREE from "three";
import { CampusCollider, getGroundHeight } from "../campus/campus.ts";
import {
  buildChibiAvatar,
  ChibiAvatarInstance,
  AvatarOptions,
} from "./avatar.ts";

export class PlayerController {
  public position: THREE.Vector3 = new THREE.Vector3(0, 0, 16);
  public facing: number = 0; // Hướng mặt nhân vật (radian)
  public anim: number = 0; // 0: idle, 1: walk, 2: sit, 3: bow
  public mesh: THREE.Group;

  // Điều khiển bàn phím & Joystick
  private keys: Record<string, boolean> = {};
  private joystickDelta = { x: 0, y: 0 };
  private colliders: CampusCollider[] = [];

  // Vận tốc chuyển động thực tế (Physics Velocity)
  private vx = 0;
  private vz = 0;

  // Hệ số vật lý chuyển động chuẩn Chùa Sen (chuasen.com: Sm = 2.6, jm = 12, Mm = 16)
  private readonly MAX_SPEED = 3.0; // mét / giây
  private readonly ACCEL_RATE = 14.0; // Gia tốc tăng tốc mượt mà
  private readonly DECEL_RATE = 16.0; // Giảm tốc phanh êm ái
  private readonly ROT_RATE = 14.0; // Tốc độ quay mặt tự nhiên theo hướng đi

  // Hệ thống Click-to-Move (Đi bộ đến điểm nhấp chuột chuẩn Chùa Sen)
  public walkTarget: THREE.Vector3 | null = null;
  public onArriveCallback: (() => void) | null = null;

  // Đối tượng Avatar Chibi chuẩn Chùa Sen
  public avatar!: ChibiAvatarInstance;
  public bodyMesh!: THREE.Mesh; // Giữ để tương thích ngược code cũ
  public headMesh!: THREE.Mesh;
  public armsGroup!: THREE.Group;

  private walkTime: number = 0;
  private bowProgress: number = 0;
  private bowTimer: number = 0;
  private readonly BOW_DURATION: number = 2.6; // Chu kỳ lạy Phật 2.6s chuẩn Chùa Sen
  private bowCallback: (() => void) | null = null;
  private currentOptions: AvatarOptions = {
    robeColor: 0x5a8ac4,
    gender: "nam",
    name: "Tâm Nguyện",
    level: "Cấp 1",
    hasHat: false,
    faceStyle: "zen",
    isSelf: true,
  };

  constructor(colliders: CampusCollider[]) {
    this.colliders = colliders;
    // Điểm xuất phát phân tán nhẹ trong sân chùa để không đứng chồng lên nhau
    const spawnX = (Math.random() - 0.5) * 3;
    const spawnZ = 15 + Math.random() * 2;
    const spawnY = getGroundHeight(spawnX, spawnZ);
    this.position.set(spawnX, spawnY, spawnZ);

    this.mesh = new THREE.Group();
    this.buildAvatar(this.currentOptions);
    this.mesh.position.copy(this.position);

    this.initKeyboard();
    this.initTouchJoystick();
  }

  /**
   * Tạo dựng mô hình nhân vật Chibi Phật tử dễ thương chuẩn Chùa Sen
   */
  public buildAvatar(options: AvatarOptions): void {
    this.currentOptions = { ...this.currentOptions, ...options };

    // Dọn dẹp avatar cũ nếu đã tồn tại
    while (this.mesh.children.length > 0) {
      const child = this.mesh.children[0];
      this.mesh.remove(child);
    }

    this.avatar = buildChibiAvatar(this.currentOptions);
    this.mesh.add(this.avatar.root);

    // Gán các thuộc tính tương thích ngược cho hệ thống cũ
    this.bodyMesh = this.avatar.skirtMesh;
    this.headMesh = this.avatar.headMesh;
    this.armsGroup = this.avatar.armsGroup;
  }

  /**
   * Cập nhật thông tin Phật tử (tên, giới tính, màu áo) từ giao diện Onboarding / Tùy chỉnh
   */
  public setProfile(profile: {
    name?: string;
    gender?: "nam" | "nu";
    color?: string;
    level?: string;
  }): void {
    const opts: AvatarOptions = { isSelf: true };
    if (profile.name) opts.name = profile.name;
    if (profile.gender) opts.gender = profile.gender;
    if (profile.level) opts.level = profile.level;
    if (profile.color) {
      opts.robeColor = new THREE.Color(profile.color).getHex();
    }
    this.buildAvatar(opts);
  }

  /**
   * Đi đến tọa độ đích (Click / Tap to Move)
   */
  public walkTo(x: number, z: number, onArrive?: () => void): void {
    // Đang ngồi hoặc lạy thì tự động đứng dậy xả thiền
    if (this.anim === 2 || this.anim === 3) {
      this.anim = 0;
    }
    this.walkTarget = new THREE.Vector3(x, 0, z);
    this.onArriveCallback = onArrive || null;
  }

  public clearWalkTarget(): void {
    this.walkTarget = null;
    this.onArriveCallback = null;
  }

  /**
   * Cầm nắm vật phẩm (chổi quét lá...)
   */
  public setCarry(item: "broom" | null): void {
    this.avatar?.setCarry?.(item);
  }

  /**
   * Cập nhật dòng trạng thái nhỏ dưới bảng tên (đang thiền, đang niệm Phật, đang tụng kinh...)
   */
  public setSubtitle(sub: string): void {
    this.avatar?.setSubtitle?.(sub);
  }

  /**
   * Hiện bong bóng câu thoại / biểu cảm trên đỉnh đầu
   */
  public showChatBubble(text: string, durationMs?: number): void {
    this.avatar?.showChatBubble?.(text, durationMs);
  }

  /**
   * Thực hiện động tác Đại Lễ Phật (lạy phủ phục 8 keyframe trong 2.6s)
   */
  public bow(onComplete?: () => void): void {
    this.anim = 3;
    this.bowTimer = 0;
    this.bowProgress = 0;
    this.bowCallback = onComplete || null;
    this.clearWalkTarget();
    this.vx = 0;
    this.vz = 0;
  }

  /**
   * Ngồi thiền tĩnh tọa bắt ấn Tam Muội
   */
  public sit(toggle?: boolean): void {
    if (toggle === undefined) {
      this.anim = this.anim === 2 ? 0 : 2;
    } else {
      this.anim = toggle ? 2 : 0;
    }
    this.clearWalkTarget();
    this.vx = 0;
    this.vz = 0;
  }

  /**
   * Bắt phím điều khiển hỗ trợ cả physical e.code (miễn nhiễm gõ tiếng Việt Telex/VNI)
   * và e.key thông thường.
   */
  private initKeyboard(): void {
    const CODE_MAP: Record<string, "up" | "down" | "left" | "right"> = {
      KeyW: "up",
      ArrowUp: "up",
      KeyS: "down",
      ArrowDown: "down",
      KeyA: "left",
      ArrowLeft: "left",
      KeyD: "right",
      ArrowRight: "right",
    };

    const KEY_MAP: Record<string, "up" | "down" | "left" | "right"> = {
      w: "up",
      s: "down",
      a: "left",
      d: "right",
      arrowup: "up",
      arrowdown: "down",
      arrowleft: "left",
      arrowright: "right",
    };

    window.addEventListener("keydown", (e) => {
      // Bỏ qua nếu đang gõ chữ trong ô nhập liệu
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      const dir = CODE_MAP[e.code] || KEY_MAP[e.key.toLowerCase()];
      if (dir) {
        this.keys[dir] = true;
        this.clearWalkTarget(); // Hủy tự động đi khi dùng phím điều khiển
        if (
          ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(
            e.key,
          )
        ) {
          e.preventDefault();
        }
      }
    });

    window.addEventListener("keyup", (e) => {
      const dir = CODE_MAP[e.code] || KEY_MAP[e.key.toLowerCase()];
      if (dir) {
        this.keys[dir] = false;
      }
    });
  }

  private initTouchJoystick(): void {
    const zone = document.getElementById("joystick-zone");
    const thumb = document.getElementById("joystick-thumb");
    if (!zone || !thumb) return;

    let activeTouchId: number | null = null;
    let startX = 0,
      startY = 0;
    const maxRadius = 38;

    const handleTouchStart = (e: TouchEvent) => {
      if (activeTouchId !== null) return;
      const touch = e.changedTouches[0];
      activeTouchId = touch.identifier;
      const rect = zone.getBoundingClientRect();
      startX = rect.left + rect.width / 2;
      startY = rect.top + rect.height / 2;
    };

    const handleTouchMove = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === activeTouchId) {
          const dx = touch.clientX - startX;
          const dy = touch.clientY - startY;
          const dist = Math.hypot(dx, dy);
          const angle = Math.atan2(dy, dx);

          const clampedDist = Math.min(dist, maxRadius);
          const moveX = Math.cos(angle) * clampedDist;
          const moveY = Math.sin(angle) * clampedDist;

          thumb.style.transform = `translate(${moveX}px, ${moveY}px)`;
          this.joystickDelta = {
            x: moveX / maxRadius,
            y: moveY / maxRadius,
          };
          this.clearWalkTarget();
          break;
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === activeTouchId) {
          activeTouchId = null;
          thumb.style.transform = `translate(0px, 0px)`;
          this.joystickDelta = { x: 0, y: 0 };
          break;
        }
      }
    };

    zone.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("touchcancel", handleTouchEnd, { passive: true });
  }

  /**
   * Cập nhật chuyển động với quán tính gia tốc / giảm tốc và trượt tường chuẩn Chùa Sen
   */
  public update(deltaSec: number, cameraYaw: number): void {
    let rawInputX = 0;
    let rawInputZ = 0;

    // Phím bấm WASD / Mũi tên
    if (this.keys["up"]) rawInputZ -= 1;
    if (this.keys["down"]) rawInputZ += 1;
    if (this.keys["left"]) rawInputX -= 1;
    if (this.keys["right"]) rawInputX += 1;

    // Cần điều khiển cảm ứng
    if (
      Math.abs(this.joystickDelta.x) > 0.08 ||
      Math.abs(this.joystickDelta.y) > 0.08
    ) {
      rawInputX = this.joystickDelta.x;
      rawInputZ = this.joystickDelta.y;
      this.clearWalkTarget();
    }

    let moveDirX = 0;
    let moveDirZ = 0;
    let targetSpeed = 0;
    const manualLen = Math.hypot(rawInputX, rawInputZ);

    // 1. Nếu có thao tác phím / joystick
    if (manualLen > 0.05 && this.anim !== 2 && this.anim !== 3) {
      this.clearWalkTarget();
      const normInputX = rawInputX / manualLen;
      const normInputZ = rawInputZ / manualLen;

      // Xoay vector di chuyển theo hướng camera đang nhìn
      const sinYaw = Math.sin(cameraYaw);
      const cosYaw = Math.cos(cameraYaw);

      moveDirX = normInputX * cosYaw + normInputZ * sinYaw;
      moveDirZ = -normInputX * sinYaw + normInputZ * cosYaw;
      targetSpeed = this.MAX_SPEED * Math.min(manualLen, 1);
    }
    // 2. Nếu đang tự động đi tới điểm nhấp chuột (Click / Tap to Move)
    else if (this.walkTarget && this.anim !== 2 && this.anim !== 3) {
      const toX = this.walkTarget.x - this.position.x;
      const toZ = this.walkTarget.z - this.position.z;
      const dist = Math.hypot(toX, toZ);
      const arriveRadius = 0.35;

      if (dist <= arriveRadius) {
        // Đã đến nơi
        const cb = this.onArriveCallback;
        this.clearWalkTarget();
        if (cb) cb();
      } else {
        moveDirX = toX / dist;
        moveDirZ = toZ / dist;
        // Giảm tốc mượt mà khi tiến sát đích đến
        const decelFactor = Math.min(1.0, Math.max(0.35, dist / 1.2));
        targetSpeed = this.MAX_SPEED * decelFactor;
      }
    }

    // 3. Nội suy vận tốc quán tính (Exponential Velocity Lerp)
    const hasMoveIntent = targetSpeed > 0;
    const targetVx = moveDirX * targetSpeed;
    const targetVz = moveDirZ * targetSpeed;

    const rate = hasMoveIntent ? this.ACCEL_RATE : this.DECEL_RATE;
    const blend = 1 - Math.exp(-rate * deltaSec);

    this.vx += (targetVx - this.vx) * blend;
    this.vz += (targetVz - this.vz) * blend;

    const currentSpeed = Math.hypot(this.vx, this.vz);
    if (!hasMoveIntent && currentSpeed < 0.05) {
      this.vx = 0;
      this.vz = 0;
    }

    // 4. Áp dụng chuyển động & Trượt tường mượt mà (Smooth Wall Sliding)
    if (currentSpeed > 0.02) {
      const deltaX = this.vx * deltaSec;
      const deltaZ = this.vz * deltaSec;

      const nextX = this.position.x + deltaX;
      const nextZ = this.position.z + deltaZ;

      if (!this.checkCollision(nextX, this.position.z)) {
        this.position.x = nextX;
      } else {
        this.vx = 0;
      }

      if (!this.checkCollision(this.position.x, nextZ)) {
        this.position.z = nextZ;
      } else {
        this.vz = 0;
      }

      // Xoay mặt nhân vật mượt mà theo hướng di chuyển (Angular Lerp)
      const targetFacing = Math.atan2(this.vx, this.vz);
      const rotBlend = 1 - Math.exp(-this.ROT_RATE * deltaSec);
      this.facing = this.lerpAngle(this.facing, targetFacing, rotBlend);
      this.mesh.rotation.y = this.facing;

      this.anim = 1; // Walk
      this.walkTime +=
        deltaSec * (7 + 5 * (currentSpeed / this.MAX_SPEED));
    } else {
      if (this.anim === 1) this.anim = 0; // Idle
    }

    // Cập nhật hoạt họa chuyển động cơ thể (Animation Bobbing & Posture)
    this.updateAnimations(deltaSec);

    // Cập nhật độ cao Y bám sát mặt gạch lát / sàn chùa mượt mà
    const targetY = getGroundHeight(this.position.x, this.position.z);
    this.position.y += (targetY - this.position.y) * Math.min(1, 14 * deltaSec);

    this.mesh.position.copy(this.position);
  }

  /**
   * Tính toán hoạt họa bước chân, nhấp nhô người, lạy Phật và ngồi thiền
   */
  private updateAnimations(deltaSec: number): void {
    if (this.anim === 3) {
      this.bowTimer += deltaSec;
      this.bowProgress = Math.min(1.0, this.bowTimer / this.BOW_DURATION);
      if (this.bowProgress >= 1.0) {
        this.anim = 0;
        this.bowProgress = 0;
        this.bowTimer = 0;
        const cb = this.bowCallback;
        this.bowCallback = null;
        if (cb) cb();
      }
    } else {
      this.bowProgress = 0;
      this.bowTimer = 0;
    }

    if (this.avatar) {
      this.avatar.updateAnimation(this.anim, this.walkTime, this.bowProgress);
    }
  }

  /**
   * Nội suy góc xoay ngắn nhất (Shortest Arc Angular Lerp)
   */
  private lerpAngle(from: number, to: number, t: number): number {
    const diff = (to - from) % (Math.PI * 2);
    const shortestDiff = ((diff + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    return from + shortestDiff * t;
  }

  /**
   * Kiểm tra va chạm với các chướng ngại vật trong khuôn viên
   */
  private checkCollision(x: number, z: number): boolean {
    const playerRadius = 0.32; // Bán kính chuẩn Chùa Sen wm = 0.3m
    for (const c of this.colliders) {
      // 1. Va chạm hình trụ tròn
      if (c.cx !== undefined && c.cz !== undefined && c.radius !== undefined) {
        const dx = x - c.cx;
        const dz = z - c.cz;
        const minDist = c.radius + playerRadius;
        if (dx * dx + dz * dz < minDist * minDist) {
          return true;
        }
      }
      // 2. Va chạm hình hộp
      else if (
        c.minX !== undefined &&
        c.maxX !== undefined &&
        c.minZ !== undefined &&
        c.maxZ !== undefined
      ) {
        if (
          x + playerRadius > c.minX &&
          x - playerRadius < c.maxX &&
          z + playerRadius > c.minZ &&
          z - playerRadius < c.maxZ
        ) {
          return true;
        }
      }
    }
    // Giới hạn trong khuôn viên tường bao chùa (-35..35, -26..52.5)
    if (x < -35 || x > 35 || z < -26 || z > 52.5) return true;
    return false;
  }
}
