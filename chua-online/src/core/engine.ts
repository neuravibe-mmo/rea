import * as THREE from "three";
import { Campus, getGroundHeight } from "../campus/campus.ts";
import { SkyManager } from "../campus/sky.ts";
import { PlayerController } from "./controls.ts";
import { CameraController } from "./camera.ts";
import { RemotePlayerState } from "../net/protocol.ts";
import {
  buildChibiAvatar,
  ChibiAvatarInstance,
  RobeColorType,
  GenderType,
  FaceStyleType,
} from "./avatar.ts";

/**
 * Tạo Texture vòng hào quang hoa sen vàng lan tỏa chuẩn Chùa Sen (chuasen.com - HE)
 */
function createRippleTexture(size = 128): THREE.DataTexture {
  const data = new Uint8Array(size * size * 4);
  const half = size / 2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const a = Math.hypot((x + 0.5 - half) / half, (y + 0.5 - half) / half);
      if (a > 1.0) continue;
      // Vành sóng chính
      const ring = Math.exp(-Math.pow((a - 0.78) / 0.075, 2));
      // Vành hào quang phụ lan tỏa
      const ringGlow = 0.35 * Math.exp(-Math.pow((a - 0.78) / 0.22, 2));
      // Đĩa sáng mờ bên trong
      const innerDisk = 0.16 * Math.max(0, 1 - a / 0.78);
      // Chấm nhụy sen trung tâm
      const centerDot = 0.65 * Math.exp(-Math.pow(a / 0.08, 2));
      // Viền mờ rìa ngoài
      const edgeFade = a > 0.85 ? Math.max(0, 1 - (a - 0.85) / 0.15) : 1;
      const alpha = Math.min(1, ring + ringGlow + innerDisk + centerDot) * edgeFade;

      const idx = (y * size + x) * 4;
      data[idx] = 255;      // R: Sắc vàng hổ phách Chùa Sen
      data[idx + 1] = 236;  // G
      data[idx + 2] = 175;  // B
      data[idx + 3] = Math.round(alpha * 255);
    }
  }
  const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.generateMipmaps = true;
  tex.needsUpdate = true;
  return tex;
}

interface RemotePlayerEntity {
  id: number;
  mesh: THREE.Group;
  avatar: ChibiAvatarInstance;
  targetPos: THREE.Vector3;
  targetFacing: number;
  currentFacing: number;
  anim: number;
  walkTimer: number;
}

interface ActiveLantern {
  id: number;
  mesh: THREE.Group;
  birthTime: number;
  driftSpeedX: number;
  driftSpeedZ: number;
}

export class Engine {
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;
  public renderer: THREE.WebGLRenderer;
  public campus: Campus;
  public sky: SkyManager;
  public player: PlayerController;
  public cameraCtrl: CameraController;
  public onUpdate?: (player: PlayerController, deltaSec: number) => void;

  private clock = new THREE.Clock();
  private remoteEntities = new Map<number, RemotePlayerEntity>();
  private activeLanterns: ActiveLantern[] = [];

  // Vòng sóng hoa sen khi nhấp chuột di chuyển (Click-to-Move Ripple)
  private activeRipples: { mesh: THREE.Mesh; startTime: number; duration: number }[] = [];
  private rippleGeom = new THREE.PlaneGeometry(1.25, 1.25);
  private rippleMat = new THREE.MeshBasicMaterial({
    map: createRippleTexture(128),
    transparent: true,
    opacity: 0.95,
    side: THREE.DoubleSide,
    depthWrite: false,
    depthTest: true,
    polygonOffset: true,
    polygonOffsetFactor: -4,
    polygonOffsetUnits: -4,
    toneMapped: false,
  });

  constructor(canvas: HTMLCanvasElement) {
    // 1. Scene & Camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      50,
      window.innerWidth / window.innerHeight,
      0.2,
      120,
    );

    // 2. Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "high-performance",
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.18;

    // 3. Khởi tạo Thế giới Chùa
    this.campus = new Campus();
    this.scene.add(this.campus.root);

    // 4. Bầu trời & Ánh sáng
    this.sky = new SkyManager(this.scene);

    // 5. Nhân vật chính
    this.player = new PlayerController(this.campus.colliders);
    this.scene.add(this.player.mesh);

    // 6. Camera Controller Góc nhìn thứ 3
    this.cameraCtrl = new CameraController(this.camera, this.campus.colliders);

    // Xoay hình học vòng sóng hoa sen nằm phẳng trên mặt đất
    this.rippleGeom.rotateX(-Math.PI / 2);

    // Kích hoạt tính năng Đi bộ đến điểm nhấp chuột chuẩn Chùa Sen (Click-to-Move)
    this.initClickToMove();

    // Bắt sự kiện resize
    window.addEventListener("resize", this.onResize.bind(this));
  }

  private onResize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  /**
   * Cập nhật danh sách người chơi từ xa (Remote Players Interpolation)
   */
  public updateRemotePlayers(players: RemotePlayerState[]): void {
    const currentIds = new Set(players.map((p) => p.id));

    // Xóa các người chơi đã rời chùa
    for (const [id, entity] of this.remoteEntities.entries()) {
      if (!currentIds.has(id)) {
        this.scene.remove(entity.mesh);
        this.remoteEntities.delete(id);
      }
    }

    // Cập nhật vị trí mục tiêu cho người chơi đang có hoặc tạo mới
    for (const p of players) {
      let entity = this.remoteEntities.get(p.id);
      if (!entity) {
        entity = this.createRemotePlayerEntity(p.id);
        entity.mesh.position.set(p.x, 0, p.z);
        entity.mesh.rotation.y = p.facing;
        entity.currentFacing = p.facing;
        this.remoteEntities.set(p.id, entity);
        this.scene.add(entity.mesh);
      }

      entity.targetPos.set(p.x, 0, p.z);
      entity.targetFacing = p.facing;
      entity.anim = p.anim;
    }
  }

  /**
   * Tạo hình nhân vật người chơi khác chuẩn phong cách Chibi Chùa Sen
   */
  private createRemotePlayerEntity(id: number): RemotePlayerEntity {
    const robeColors: RobeColorType[] = ["lam", "nau", "xam", "vang"];
    const robeColor = robeColors[id % robeColors.length];
    const gender: GenderType = id % 3 === 0 ? "nu" : "nam";
    const faceStyle: FaceStyleType = id % 2 === 0 ? "zen" : "happy";
    const levelStr = `Cấp ${(id % 3) + 1}`;

    const DHARMA_NAMES = [
      "Tâm Nguyện",
      "Liên Tâm",
      "Viên Tín",
      "Tuệ Tri",
      "Như Đạo",
      "Minh An",
      "Thiện Hòa",
      "Diệu Âm",
      "Thanh Tịnh",
      "Phúc Lành",
    ];
    const remoteName = DHARMA_NAMES[id % DHARMA_NAMES.length];

    const avatar = buildChibiAvatar({
      robeColor,
      gender,
      faceStyle,
      name: remoteName,
      level: levelStr,
      hasHat: id % 4 === 0,
      isSelf: false,
    });

    return {
      id,
      mesh: avatar.root,
      avatar,
      targetPos: new THREE.Vector3(0, 0, 0),
      targetFacing: 0,
      currentFacing: 0,
      anim: 0,
      walkTimer: 0,
    };
  }

  /**
   * Thêm đèn hoa đăng nổi trôi trên mặt hồ sen
   */
  public addLantern(id: number, x: number, z: number): void {
    const group = new THREE.Group();

    // Búp hoa đăng hình bát giác vàng cam
    const lanternMat = new THREE.MeshStandardMaterial({
      color: 0xffaa33,
      emissive: 0xff6600,
      emissiveIntensity: 0.8,
      roughness: 0.3,
    });
    const lanternGeom = new THREE.CylinderGeometry(0.24, 0.16, 0.22, 8);
    const mesh = new THREE.Mesh(lanternGeom, lanternMat);
    mesh.position.y = 0.05;
    group.add(mesh);

    // Ngọn nến lung linh ở giữa
    const candleMat = new THREE.MeshBasicMaterial({ color: 0xfff3a8 });
    const candleGeom = new THREE.ConeGeometry(0.08, 0.2, 6);
    const candle = new THREE.Mesh(candleGeom, candleMat);
    candle.position.y = 0.22;
    group.add(candle);

    group.position.set(x, -0.05, z);
    this.scene.add(group);

    this.activeLanterns.push({
      id,
      mesh: group,
      birthTime: Date.now(),
      driftSpeedX: (Math.random() - 0.5) * 0.15,
      driftSpeedZ: (Math.random() - 0.5) * 0.15,
    });
  }

  public start(): void {
    const loop = () => {
      requestAnimationFrame(loop);
      const deltaSec = Math.min(this.clock.getDelta(), 0.1);

      // Cập nhật người chơi chính
      this.player.update(deltaSec, this.cameraCtrl.yaw);

      // Cập nhật góc nhìn camera
      this.cameraCtrl.update(this.player.position);

      // Cập nhật bầu trời (mây trôi, sao nhấp nháy)
      this.sky.update(deltaSec);

      // Cập nhật khuôn viên chùa (Shader đèn lồng đá tự động bập bùng & đồng bộ độ sáng ngày/đêm)
      const lanternInt = this.sky.getLanternIntensity();
      this.campus.update(deltaSec, lanternInt);

      // Callback cập nhật bổ sung (như Spatial Audio Listener)
      if (this.onUpdate) {
        this.onUpdate(this.player, deltaSec);
      }

      // Cập nhật tỷ lệ bảng tên nhân vật chính theo cự ly Camera
      if (this.player.avatar?.fitPlate) {
        this.player.avatar.fitPlate(this.camera);
      }

      // Nội suy chuyển động mượt mà cho tất cả người chơi khác (Interpolation Lerp)
      for (const entity of this.remoteEntities.values()) {
        entity.mesh.position.lerp(entity.targetPos, 0.18);

        // Nội suy góc xoay
        const diff =
          ((entity.targetFacing - entity.currentFacing + Math.PI * 3) %
            (Math.PI * 2)) -
          Math.PI;
        entity.currentFacing += diff * 0.2;
        entity.mesh.rotation.y = entity.currentFacing;

        // Hoạt họa nhấp nhô và bước chân mượt mà
        if (entity.anim === 1) {
          entity.walkTimer += deltaSec * 10;
        }
        entity.avatar.updateAnimation(entity.anim, entity.walkTimer);

        // Cập nhật tỷ lệ bảng tên người chơi khác theo cự ly Camera
        if (entity.avatar.fitPlate) {
          entity.avatar.fitPlate(this.camera);
        }
      }

      // Cập nhật đèn hoa đăng trôi bập bềnh trên mặt nước hồ sen
      const now = Date.now();
      for (const l of this.activeLanterns) {
        l.mesh.position.x += l.driftSpeedX * deltaSec;
        l.mesh.position.z += l.driftSpeedZ * deltaSec;
        // Hiệu ứng dập dềnh sóng nước
        l.mesh.position.y = -0.05 + Math.sin(now * 0.003 + l.id) * 0.02;
        l.mesh.rotation.y += deltaSec * 0.2;
      }

      // Cập nhật hiệu ứng vòng sóng hoa sen khi nhấp chuột (Click Ripple)
      const curTime = performance.now();
      for (let i = this.activeRipples.length - 1; i >= 0; i--) {
        const rip = this.activeRipples[i];
        const progress = (curTime - rip.startTime) / rip.duration;
        if (progress >= 1.0) {
          this.scene.remove(rip.mesh);
          (rip.mesh.material as THREE.Material).dispose();
          this.activeRipples.splice(i, 1);
        } else {
          // Nở sóng lan tỏa từ 0.45 lên 1.35 mượt mà (Ease Out Cubic)
          const easeProgress = 1.0 - Math.pow(1.0 - progress, 3);
          const s = 0.45 + easeProgress * 0.9;
          rip.mesh.scale.set(s, 1, s);
          (rip.mesh.material as THREE.MeshBasicMaterial).opacity =
            0.95 * (1.0 - progress * progress);
        }
      }

      this.renderer.render(this.scene, this.camera);
    };
    loop();
  }

  /**
   * Tạo vòng sóng hoa sen vàng lan tỏa khi nhấp chuột trên mặt sân chùa
   * Đặt độ cao nổi lên trên bề mặt viên gạch lát (viên gạch cao y = 0.08m)
   */
  public spawnRipple(x: number, z: number, groundY?: number): void {
    const y = groundY !== undefined ? groundY : getGroundHeight(x, z);
    const mesh = new THREE.Mesh(this.rippleGeom, this.rippleMat.clone());
    // Đặt cao độ cao hơn mặt viên gạch lát 1.2cm (y = groundY + 0.012)
    // kết hợp polygonOffset và renderOrder: 50 đảm bảo sóng luôn hiển thị rõ ràng trên mặt gạch
    mesh.position.set(x, y + 0.012, z);
    mesh.renderOrder = 50;
    this.scene.add(mesh);
    this.activeRipples.push({
      mesh,
      startTime: performance.now(),
      duration: 580,
    });
  }

  /**
   * Tính năng Nhấp chuột để di chuyển (Click / Tap to Move) chuẩn Chùa Sen
   */
  private initClickToMove(): void {
    const dom = this.renderer.domElement;
    let downX = 0;
    let downY = 0;
    let downTime = 0;
    const raycaster = new THREE.Raycaster();
    const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const planeIntersect = new THREE.Vector3();

    window.addEventListener("pointerdown", (e) => {
      // Chỉ nhận nút chuột trái hoặc chạm màn hình
      if (e.button !== 0 && e.pointerType === "mouse") return;
      const target = e.target as HTMLElement | null;
      if (
        target?.closest(".hud-bar") ||
        target?.closest(".hud-tools") ||
        target?.closest(".hud-room") ||
        target?.closest(".modal-backdrop") ||
        target?.closest("#joystick-zone") ||
        target?.closest(".onb")
      ) {
        return;
      }
      downX = e.clientX;
      downY = e.clientY;
      downTime = performance.now();
    });

    window.addEventListener("pointerup", (e) => {
      if (e.button !== 0 && e.pointerType === "mouse") return;
      const target = e.target as HTMLElement | null;
      if (
        target?.closest(".hud-bar") ||
        target?.closest(".hud-tools") ||
        target?.closest(".hud-room") ||
        target?.closest(".modal-backdrop") ||
        target?.closest("#joystick-zone") ||
        target?.closest(".onb")
      ) {
        return;
      }

      const moved = Math.hypot(e.clientX - downX, e.clientY - downY);
      const elapsed = performance.now() - downTime;

      // Nhấp nhanh (< 350ms và không kéo xoay camera quá 8px)
      if (moved < 8 && elapsed < 350) {
        const rect = dom.getBoundingClientRect();
        const mouse = new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          -((e.clientY - rect.top) / rect.height) * 2 + 1,
        );
        raycaster.setFromCamera(mouse, this.camera);

        // 1. Raycast tìm bề mặt sàn / gạch lát thực tế trong Scene
        const hits = raycaster.intersectObjects(this.campus.root.children, true);
        let targetX = 0;
        let targetZ = 0;
        let targetY = 0;
        let validHit = false;

        for (const hit of hits) {
          // Bỏ qua các bề mặt đứng của tường / cột (normal.y < 0.4) và mái nhà cao (y > 2.0)
          if (hit.face && hit.face.normal.y > 0.4 && hit.point.y < 2.0) {
            targetX = hit.point.x;
            targetZ = hit.point.z;
            targetY = hit.point.y;
            validHit = true;
            break;
          }
        }

        // 2. Dự phòng va chạm với mặt phẳng sân chùa nếu không chạm mesh
        if (!validHit) {
          if (raycaster.ray.intersectPlane(groundPlane, planeIntersect)) {
            targetX = planeIntersect.x;
            targetZ = planeIntersect.z;
            targetY = getGroundHeight(targetX, targetZ);
            validHit = true;
          }
        }

        // 3. Nếu điểm đến hợp lệ trong khuôn viên chùa (-34..34, -25..51)
        if (
          validHit &&
          targetX >= -34 &&
          targetX <= 34 &&
          targetZ >= -25 &&
          targetZ <= 51
        ) {
          this.spawnRipple(targetX, targetZ, targetY);
          this.player.walkTo(targetX, targetZ);
        }
      }
    });
  }
}
