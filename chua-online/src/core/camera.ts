import * as THREE from "three";
import { CampusCollider } from "../campus/campus.ts";

/**
 * Trình điều khiển Camera Góc Nhìn Thứ 3 (Third-Person Orbit Camera).
 * Hỗ trợ xoay tự do (Pitch/Yaw), Zoom in/out, kiểm tra va chạm tường (Camera Collision)
 * và điều khiển linh hoạt trên cả Máy tính lẫn Cảm ứng Điện thoại.
 */
export class CameraController {
  public camera: THREE.PerspectiveCamera;
  public yaw: number = 0; // Góc xoay ngang quanh nhân vật (radian)
  public pitch: number = 0.32; // Góc ngẩng/cúi (radian)
  public distance: number = 6.2; // Khoảng cách từ camera đến nhân vật
  public minDistance: number = 2.5;
  public maxDistance: number = 14.0;

  private targetPosition = new THREE.Vector3();
  private currentCameraPos = new THREE.Vector3();
  private colliders: CampusCollider[];

  // Điều khiển chuột & chạm xoay camera
  private isPointerDown = false;
  private lastPointerX = 0;
  private lastPointerY = 0;
  private touchId: number | null = null;
  private initialPinchDist: number | null = null;

  constructor(
    camera: THREE.PerspectiveCamera,
    colliders: CampusCollider[] = [],
  ) {
    this.camera = camera;
    this.colliders = colliders;

    this.initMouseControls();
    this.initTouchControls();
  }

  private initMouseControls(): void {
    window.addEventListener("mousedown", (e) => {
      // Chỉ kích hoạt khi click chuột trái hoặc phải ngoài các nút HUD
      const target = e.target as HTMLElement;
      if (target.closest("button") || target.closest(".modal-card")) return;

      this.isPointerDown = true;
      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;
    });

    window.addEventListener("mousemove", (e) => {
      if (!this.isPointerDown) return;
      const dx = e.clientX - this.lastPointerX;
      const dy = e.clientY - this.lastPointerY;
      this.lastPointerX = e.clientX;
      this.lastPointerY = e.clientY;

      this.rotate(dx * 0.005, -dy * 0.004);
    });

    window.addEventListener("mouseup", () => {
      this.isPointerDown = false;
    });

    window.addEventListener(
      "wheel",
      (e) => {
        // Zoom in / out bằng con lăn chuột
        this.zoom(e.deltaY * 0.005);
      },
      { passive: true },
    );
  }

  private initTouchControls(): void {
    window.addEventListener(
      "touchstart",
      (e) => {
        // Tìm ngón tay chạm ở nửa bên phải màn hình (Right Half) để xoay camera
        for (let i = 0; i < e.changedTouches.length; i++) {
          const touch = e.changedTouches[i];
          const target = e.target as HTMLElement;
          if (
            target.closest("button") ||
            target.closest("#joystick-zone") ||
            target.closest(".modal-card")
          ) {
            continue;
          }

          // Nếu chạm 2 ngón tay -> bắt đầu Pinch Zoom
          if (e.touches.length === 2) {
            const dx = e.touches[0].clientX - e.touches[1].clientX;
            const dy = e.touches[0].clientY - e.touches[1].clientY;
            this.initialPinchDist = Math.hypot(dx, dy);
            return;
          }

          if (
            this.touchId === null &&
            touch.clientX > window.innerWidth * 0.35
          ) {
            this.touchId = touch.identifier;
            this.lastPointerX = touch.clientX;
            this.lastPointerY = touch.clientY;
          }
        }
      },
      { passive: true },
    );

    window.addEventListener(
      "touchmove",
      (e) => {
        // Xử lý Pinch Zoom 2 ngón tay
        if (e.touches.length === 2 && this.initialPinchDist !== null) {
          const dx = e.touches[0].clientX - e.touches[1].clientX;
          const dy = e.touches[0].clientY - e.touches[1].clientY;
          const currentDist = Math.hypot(dx, dy);
          const delta = (this.initialPinchDist - currentDist) * 0.02;
          this.zoom(delta);
          this.initialPinchDist = currentDist;
          return;
        }

        // Xử lý xoay 1 ngón tay
        for (let i = 0; i < e.changedTouches.length; i++) {
          const touch = e.changedTouches[i];
          if (touch.identifier === this.touchId) {
            const dx = touch.clientX - this.lastPointerX;
            const dy = touch.clientY - this.lastPointerY;
            this.lastPointerX = touch.clientX;
            this.lastPointerY = touch.clientY;

            this.rotate(dx * 0.007, -dy * 0.005);
            break;
          }
        }
      },
      { passive: true },
    );

    const handleTouchEnd = (e: TouchEvent) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === this.touchId) {
          this.touchId = null;
        }
      }
      if (e.touches.length < 2) {
        this.initialPinchDist = null;
      }
    };

    window.addEventListener("touchend", handleTouchEnd, { passive: true });
    window.addEventListener("touchcancel", handleTouchEnd, { passive: true });
  }

  public rotate(deltaYaw: number, deltaPitch: number): void {
    this.yaw -= deltaYaw;
    this.pitch = Math.max(-0.08, Math.min(1.15, this.pitch + deltaPitch));
  }

  public zoom(delta: number): void {
    this.distance = Math.max(
      this.minDistance,
      Math.min(this.maxDistance, this.distance + delta),
    );
  }

  /**
   * Cập nhật vị trí camera theo sau nhân vật mượt mà (Smooth Follow & Wall Clipping Prevention)
   */
  public update(playerPos: THREE.Vector3): void {
    // Điểm tâm nhìn của camera (ngực nhân vật cao 1.3m)
    this.targetPosition.set(playerPos.x, playerPos.y + 1.3, playerPos.z);

    // Tính toán vị trí mong muốn theo hình cầu quỹ đạo (Spherical coordinates)
    const cosPitch = Math.cos(this.pitch);
    const sinPitch = Math.sin(this.pitch);
    const sinYaw = Math.sin(this.yaw);
    const cosYaw = Math.cos(this.yaw);

    let effectiveDist = this.distance;

    // Kiểm tra va chạm camera với tường/vật cản (Camera Occlusion)
    // Nếu điểm đặt camera bị kẹt trong tường, thu ngắn khoảng cách lại
    const testX = this.targetPosition.x + sinYaw * cosPitch * effectiveDist;
    const testZ = this.targetPosition.z + cosYaw * cosPitch * effectiveDist;

    for (const c of this.colliders) {
      if (
        testX > c.minX &&
        testX < c.maxX &&
        testZ > c.minZ &&
        testZ < c.maxZ
      ) {
        // Thu ngắn camera về gần người chơi để không nhìn xuyên tường
        effectiveDist = Math.max(this.minDistance, effectiveDist * 0.55);
        break;
      }
    }

    const camX = this.targetPosition.x + sinYaw * cosPitch * effectiveDist;
    const camY = Math.max(
      0.6,
      this.targetPosition.y + sinPitch * effectiveDist,
    );
    const camZ = this.targetPosition.z + cosYaw * cosPitch * effectiveDist;

    const desiredCameraPos = new THREE.Vector3(camX, camY, camZ);

    // Dịch chuyển mượt mà (Lerp)
    this.currentCameraPos.lerp(desiredCameraPos, 0.12);
    this.camera.position.copy(this.currentCameraPos);
    this.camera.lookAt(this.targetPosition);
  }
}
