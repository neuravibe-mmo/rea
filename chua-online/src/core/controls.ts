import * as THREE from "three";
import { CampusCollider } from "../campus/campus.ts";

export class PlayerController {
  public position: THREE.Vector3 = new THREE.Vector3(0, 0, 16);
  public facing: number = 0; // Hướng mặt nhân vật (radian)
  public anim: number = 0; // 0: idle, 1: walk, 2: sit, 3: bow
  public mesh: THREE.Group;

  private keys: Record<string, boolean> = {};
  private joystickDelta = { x: 0, y: 0 };
  private moveSpeed = 4.2; // mét / giây
  private colliders: CampusCollider[] = [];

  // Các bộ phận nhân vật để tạo hoạt họa
  private bodyMesh!: THREE.Mesh;
  private headMesh!: THREE.Mesh;
  private armsGroup!: THREE.Group;
  private walkTime: number = 0;
  private bowProgress: number = 0;

  constructor(colliders: CampusCollider[]) {
    this.colliders = colliders;
    // Điểm xuất phát phân tán nhẹ trong sân chùa để không đứng chồng lên nhau
    const spawnX = (Math.random() - 0.5) * 4;
    const spawnZ = 15 + Math.random() * 2.5;
    this.position.set(spawnX, 0, spawnZ);

    this.mesh = this.createAvatarMesh();
    this.mesh.position.copy(this.position);

    this.initKeyboard();
    this.initTouchJoystick();
  }

  /**
   * Tạo hình nhân vật Phật tử mặc áo lam truyền thống với tay áo và chi tiết
   */
  private createAvatarMesh(): THREE.Group {
    const group = new THREE.Group();

    // Thân áo lam truyền thống
    const robeMat = new THREE.MeshStandardMaterial({
      color: 0x5b7083,
      roughness: 0.8,
    });
    const bodyGeom = new THREE.CylinderGeometry(0.24, 0.36, 1.1, 14);
    this.bodyMesh = new THREE.Mesh(bodyGeom, robeMat);
    this.bodyMesh.position.y = 0.55;
    this.bodyMesh.castShadow = true;
    group.add(this.bodyMesh);

    // Đầu (màu da ấm thanh thoát)
    const headMat = new THREE.MeshStandardMaterial({
      color: 0xdfb18e,
      roughness: 0.6,
    });
    const headGeom = new THREE.SphereGeometry(0.18, 14, 14);
    this.headMesh = new THREE.Mesh(headGeom, headMat);
    this.headMesh.position.y = 1.25;
    this.headMesh.castShadow = true;
    group.add(this.headMesh);

    // Nón lá thanh tịnh
    const hatMat = new THREE.MeshStandardMaterial({
      color: 0xd4a373,
      roughness: 0.9,
    });
    const hatGeom = new THREE.ConeGeometry(0.42, 0.2, 16);
    const hat = new THREE.Mesh(hatGeom, hatMat);
    hat.position.y = 1.44;
    hat.castShadow = true;
    group.add(hat);

    // Hai cánh tay chắp trước ngực (tư thế chắp tay hoa sen thanh tịnh)
    this.armsGroup = new THREE.Group();
    const armGeom = new THREE.CylinderGeometry(0.06, 0.08, 0.45, 8);

    const leftArm = new THREE.Mesh(armGeom, robeMat);
    leftArm.position.set(-0.2, 0.75, 0.16);
    leftArm.rotation.set(0.6, 0, -0.4);
    this.armsGroup.add(leftArm);

    const rightArm = new THREE.Mesh(armGeom, robeMat);
    rightArm.position.set(0.2, 0.75, 0.16);
    rightArm.rotation.set(0.6, 0, 0.4);
    this.armsGroup.add(rightArm);

    // Hai bàn tay chắp trước ngực
    const handMat = new THREE.MeshStandardMaterial({ color: 0xdfb18e });
    const handGeom = new THREE.BoxGeometry(0.08, 0.14, 0.05);
    const hands = new THREE.Mesh(handGeom, handMat);
    hands.position.set(0, 0.88, 0.28);
    this.armsGroup.add(hands);

    group.add(this.armsGroup);

    return group;
  }

  private initKeyboard(): void {
    window.addEventListener("keydown", (e) => {
      this.keys[e.key.toLowerCase()] = true;
      if (
        ["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(
          e.key.toLowerCase(),
        )
      ) {
        e.preventDefault();
      }
    });
    window.addEventListener("keyup", (e) => {
      this.keys[e.key.toLowerCase()] = false;
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
   * Cập nhật di chuyển theo góc quay ngang của camera (cameraYaw)
   * và tính toán trượt tường mượt mà (Smooth Wall Sliding)
   */
  public update(deltaSec: number, cameraYaw: number): void {
    let rawInputX = 0;
    let rawInputZ = 0;

    // Bàn phím WASD / Mũi tên
    if (this.keys["w"] || this.keys["arrowup"]) rawInputZ -= 1;
    if (this.keys["s"] || this.keys["arrowdown"]) rawInputZ += 1;
    if (this.keys["a"] || this.keys["arrowleft"]) rawInputX -= 1;
    if (this.keys["d"] || this.keys["arrowright"]) rawInputX += 1;

    // Cần điều khiển cảm ứng
    if (
      Math.abs(this.joystickDelta.x) > 0.08 ||
      Math.abs(this.joystickDelta.y) > 0.08
    ) {
      rawInputX = this.joystickDelta.x;
      rawInputZ = this.joystickDelta.y;
    }

    const inputLen = Math.hypot(rawInputX, rawInputZ);

    if (inputLen > 0.05 && this.anim !== 2 && this.anim !== 3) {
      const normInputX = rawInputX / inputLen;
      const normInputZ = rawInputZ / inputLen;

      // Xoay vector di chuyển theo hướng camera đang nhìn
      // Camera nhìn về phía trước tương ứng với -cos(yaw), sin(yaw)
      const sinYaw = Math.sin(cameraYaw);
      const cosYaw = Math.cos(cameraYaw);

      const worldMoveX = normInputX * cosYaw + normInputZ * sinYaw;
      const worldMoveZ = -normInputX * sinYaw + normInputZ * cosYaw;

      const speed = this.moveSpeed * Math.min(inputLen, 1);
      const deltaX = worldMoveX * speed * deltaSec;
      const deltaZ = worldMoveZ * speed * deltaSec;

      // Xử lý va chạm trượt tường mượt mà (Smooth Wall Sliding):
      // Tách rời việc thử di chuyển trên trục X và Z
      const nextX = this.position.x + deltaX;
      const nextZ = this.position.z + deltaZ;

      if (!this.checkCollision(nextX, this.position.z)) {
        this.position.x = nextX;
      }
      if (!this.checkCollision(this.position.x, nextZ)) {
        this.position.z = nextZ;
      }

      // Quay mặt nhân vật mượt mà về hướng di chuyển (Angular Lerp)
      const targetFacing = Math.atan2(worldMoveX, worldMoveZ);
      this.facing = this.lerpAngle(this.facing, targetFacing, 0.22);
      this.mesh.rotation.y = this.facing;

      this.anim = 1; // Walk
      this.walkTime += deltaSec * 11;
    } else {
      if (this.anim === 1) this.anim = 0; // Idle
    }

    // Cập nhật hoạt họa chuyển động cơ thể (Animation Bobbing & Posture)
    this.updateAnimations(deltaSec);

    this.mesh.position.copy(this.position);
  }

  /**
   * Tính toán hoạt họa bước chân, nhấp nhô người, lạy Phật và ngồi thiền
   */
  private updateAnimations(deltaSec: number): void {
    if (this.anim === 1) {
      // Đi bộ: Nhấp nhô nhịp bước chân
      const bob = Math.sin(this.walkTime) * 0.04;
      this.bodyMesh.position.y = 0.55 + bob;
      this.headMesh.position.y = 1.25 + bob;
      this.armsGroup.position.y = bob;
      this.bodyMesh.rotation.x = 0.08; // Người hơi nghiêng về phía trước
    } else if (this.anim === 3) {
      // Lễ Phật: Cúi gập người thành kính
      this.bowProgress = Math.min(1.0, this.bowProgress + deltaSec * 3.5);
      const bowAngle = Math.sin(this.bowProgress * Math.PI) * 0.55;
      this.bodyMesh.rotation.x = bowAngle;
      this.headMesh.rotation.x = bowAngle * 0.8;
      this.bodyMesh.position.y = 0.55 - bowAngle * 0.15;
      this.headMesh.position.y = 1.25 - bowAngle * 0.25;
      this.armsGroup.position.y = -bowAngle * 0.2;
    } else if (this.anim === 2) {
      // Ngồi thiền: Hạ thấp độ cao xuống bồ đoàn
      this.bodyMesh.position.y = 0.35;
      this.headMesh.position.y = 0.95;
      this.armsGroup.position.y = -0.22;
      this.bodyMesh.rotation.x = 0;
    } else {
      // Idle: Trở về tư thế đứng trang nghiêm
      this.bodyMesh.position.y = 0.55;
      this.headMesh.position.y = 1.25;
      this.armsGroup.position.y = 0;
      this.bodyMesh.rotation.x = 0;
      this.headMesh.rotation.x = 0;
      this.bowProgress = 0;
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
    const radius = 0.38;
    for (const c of this.colliders) {
      if (
        x + radius > c.minX &&
        x - radius < c.maxX &&
        z + radius > c.minZ &&
        z - radius < c.maxZ
      ) {
        return true;
      }
    }
    // Giới hạn trong khuôn viên tường bao chùa (-35..35, -26..52.5)
    if (x < -35 || x > 35 || z < -26 || z > 52.5) return true;
    return false;
  }
}
