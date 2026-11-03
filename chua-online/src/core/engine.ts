import * as THREE from "three";
import { Campus } from "../campus/campus.ts";
import { SkyManager } from "../campus/sky.ts";
import { PlayerController } from "./controls.ts";
import { CameraController } from "./camera.ts";
import { RemotePlayerState } from "../net/protocol.ts";

interface RemotePlayerEntity {
  id: number;
  mesh: THREE.Group;
  bodyMesh: THREE.Mesh;
  headMesh: THREE.Mesh;
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
   * Tạo hình nhân vật người chơi khác kèm bảng tên trên đầu (Billboard Tag)
   */
  private createRemotePlayerEntity(id: number): RemotePlayerEntity {
    const group = new THREE.Group();

    // Thân áo (màu áo nâu sồng hoặc áo lam dịu)
    const robeColors = [0x8b5a2b, 0x5b7083, 0x6e6e6e, 0xb8860b];
    const robeColor = robeColors[id % robeColors.length];
    const robeMat = new THREE.MeshStandardMaterial({
      color: robeColor,
      roughness: 0.8,
    });
    const bodyGeom = new THREE.CylinderGeometry(0.24, 0.36, 1.1, 14);
    const bodyMesh = new THREE.Mesh(bodyGeom, robeMat);
    bodyMesh.position.y = 0.55;
    bodyMesh.castShadow = true;
    group.add(bodyMesh);

    // Đầu
    const headMat = new THREE.MeshStandardMaterial({
      color: 0xdfb18e,
      roughness: 0.6,
    });
    const headGeom = new THREE.SphereGeometry(0.18, 14, 14);
    const headMesh = new THREE.Mesh(headGeom, headMat);
    headMesh.position.y = 1.25;
    headMesh.castShadow = true;
    group.add(headMesh);

    // Nón lá
    const hatMat = new THREE.MeshStandardMaterial({
      color: 0xd4a373,
      roughness: 0.9,
    });
    const hatGeom = new THREE.ConeGeometry(0.42, 0.2, 16);
    const hat = new THREE.Mesh(hatGeom, hatMat);
    hat.position.y = 1.44;
    hat.castShadow = true;
    group.add(hat);

    // Bảng tên hiển thị trên đầu (Billboard Canvas Texture)
    const nameSprite = this.createNameSprite(`Phật tử #${id}`);
    nameSprite.position.set(0, 1.85, 0);
    group.add(nameSprite);

    return {
      id,
      mesh: group,
      bodyMesh,
      headMesh,
      targetPos: new THREE.Vector3(0, 0, 0),
      targetFacing: 0,
      currentFacing: 0,
      anim: 0,
      walkTimer: 0,
    };
  }

  private createNameSprite(text: string): THREE.Sprite {
    const canvas = document.createElement("canvas");
    canvas.width = 256;
    canvas.height = 64;
    const ctx = canvas.getContext("2d")!;

    ctx.fillStyle = "rgba(20, 13, 8, 0.75)";
    if (typeof ctx.roundRect === "function") {
      ctx.beginPath();
      ctx.roundRect(16, 8, 224, 48, 24);
      ctx.fill();
      ctx.strokeStyle = "rgba(245, 197, 99, 0.5)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(16, 8, 224, 48, 24);
      ctx.stroke();
    } else {
      ctx.fillRect(16, 8, 224, 48);
      ctx.strokeStyle = "rgba(245, 197, 99, 0.5)";
      ctx.lineWidth = 2;
      ctx.strokeRect(16, 8, 224, 48);
    }

    ctx.fillStyle = "#fdfaf4";
    ctx.font = "bold 22px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 128, 32);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
    });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(1.4, 0.35, 1);
    return sprite;
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

      // Callback cập nhật bổ sung (như Spatial Audio Listener)
      if (this.onUpdate) {
        this.onUpdate(this.player, deltaSec);
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

        // Hoạt họa nhấp nhô
        if (entity.anim === 1) {
          entity.walkTimer += deltaSec * 11;
          const bob = Math.sin(entity.walkTimer) * 0.04;
          entity.bodyMesh.position.y = 0.55 + bob;
          entity.headMesh.position.y = 1.25 + bob;
        } else if (entity.anim === 3) {
          entity.bodyMesh.rotation.x = 0.45;
        } else {
          entity.bodyMesh.position.y = 0.55;
          entity.headMesh.position.y = 1.25;
          entity.bodyMesh.rotation.x = 0;
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

      this.renderer.render(this.scene, this.camera);
    };
    loop();
  }
}
