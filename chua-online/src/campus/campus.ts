import * as THREE from "three";
import { CampusCollider, CushionSeat } from "./types.ts";
import { PALETTE } from "./palette.ts";
import {
  buildCourtyards,
  buildEnclosureWalls,
  buildTamQuanGate,
  buildMainHall,
  buildIncenseBurner,
  buildLotusPondAndBridge,
  buildBodhiTree,
  buildBellTower,
  buildQuanAmGarden,
  buildPureBasin,
  buildStoneLanterns,
} from "./models/index.ts";

export type { CampusCollider, CushionSeat };
export { PALETTE };

/**
 * Tính toán cao độ thực tế của mặt sàn / gạch lát / thềm tam cấp tại tọa độ (x, z)
 */
export function getGroundHeight(x: number, z: number): number {
  // 1. Chánh điện và bậc tam cấp
  if (x >= -10.6 && x <= 10.6 && z >= -23.4 && z <= -8.2) {
    return 0.8;
  }
  if (Math.abs(x) <= 3.6 && z >= -8.2 && z <= -6.8) {
    if (Math.abs(x) <= 3.2 && z <= -7.4) return 0.55;
    return 0.3;
  }
  // 2. Cầu gỗ qua hồ sen
  if (Math.abs(x) <= 1.8 && z >= 28.5 && z <= 47.5) {
    return 0.35;
  }
  // 3. Tháp chuông (Chòi Chuông Chùa cổ truyền)
  if (Math.abs(x - 15.5) <= 2.85 && Math.abs(z - 4.0) <= 2.85) {
    return 0.65;
  }
  if (Math.abs(x - 15.5) <= 0.85 && z >= 6.8 && z <= 7.8) {
    return 0.35;
  }
  // 3. Sân chùa lát đá phiến trung tâm (-19.3..19.3, -24.3..24.8) -> mặt gạch y = 0.08m
  if (x >= -19.3 && x <= 19.3 && z >= -24.3 && z <= 24.8) {
    return 0.08;
  }
  // 4. Sân cỏ khuôn viên chùa
  return 0.0;
}

export class Campus {
  public root: THREE.Group = new THREE.Group();
  public colliders: CampusCollider[] = [];
  public seats: CushionSeat[] = [];

  public roofMat: THREE.MeshStandardMaterial;
  public woodMat: THREE.MeshStandardMaterial;
  public stoneMat: THREE.MeshStandardMaterial;
  public goldMat: THREE.MeshStandardMaterial;
  public leafMat: THREE.MeshStandardMaterial;
  public glowMat: THREE.ShaderMaterial;

  public glowMesh: THREE.Mesh | null = null;
  public leavesMesh: THREE.Mesh | null = null;

  constructor() {
    const loader = new THREE.TextureLoader();

    // 1. Texture ngói đất nung / ngói rêu phong chính thức chuẩn Chùa Sen
    const roofColor = loader.load("./textures/v1/roof_tiles/color.webp");
    roofColor.wrapS = THREE.RepeatWrapping;
    roofColor.wrapT = THREE.RepeatWrapping;
    roofColor.repeat.set(1, 1);

    const roofNormal = loader.load("./textures/v1/roof_tiles/normal.webp");
    roofNormal.wrapS = THREE.RepeatWrapping;
    roofNormal.wrapT = THREE.RepeatWrapping;
    roofNormal.repeat.set(1, 1);

    const roofRoughness = loader.load(
      "./textures/v1/roof_tiles/roughness-512.webp",
    );
    roofRoughness.wrapS = THREE.RepeatWrapping;
    roofRoughness.wrapT = THREE.RepeatWrapping;
    roofRoughness.repeat.set(1, 1);

    this.roofMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      map: roofColor,
      normalMap: roofNormal,
      roughnessMap: roofRoughness,
      roughness: 0.88,
      metalness: 0.12,
    });

    // 2. Texture gỗ sẫm cột kèo chùa chính thức chuẩn Chùa Sen
    const woodColor = loader.load("./textures/v1/wood_floor/color.webp");
    woodColor.wrapS = THREE.RepeatWrapping;
    woodColor.wrapT = THREE.RepeatWrapping;
    woodColor.repeat.set(1, 3);

    const woodNormal = loader.load("./textures/v1/wood_floor/normal.webp");
    woodNormal.wrapS = THREE.RepeatWrapping;
    woodNormal.wrapT = THREE.RepeatWrapping;
    woodNormal.repeat.set(1, 3);

    this.woodMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      map: woodColor,
      normalMap: woodNormal,
      roughness: 0.65,
      metalness: 0.1,
    });

    // 3. Vật liệu đá phiến / thềm tam cấp / chân tảng chuẩn Chùa Sen
    const stoneColor = loader.load("./textures/v1/stone_pavers/color.webp");
    stoneColor.wrapS = THREE.RepeatWrapping;
    stoneColor.wrapT = THREE.RepeatWrapping;
    stoneColor.repeat.set(2, 2);

    const stoneNormal = loader.load("./textures/v1/stone_pavers/normal.webp");
    stoneNormal.wrapS = THREE.RepeatWrapping;
    stoneNormal.wrapT = THREE.RepeatWrapping;
    stoneNormal.repeat.set(2, 2);

    this.stoneMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      map: stoneColor,
      normalMap: stoneNormal,
      roughness: 0.85,
      metalness: 0.05,
    });

    // 4. Vật liệu mạ vàng tượng Phật Tam Bảo / Chuông đồng / Lưỡng Long Chầu Nguyệt (Chùa Sen)
    this.goldMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      color: new THREE.Color(0xffe277),
      roughness: 0.25,
      metalness: 0.85,
      emissive: new THREE.Color(0xd98218),
      emissiveIntensity: 0.42,
    });

    // 5. Vật liệu tán lá Bồ đề và cây cối sân chùa
    this.leafMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.72,
      metalness: 0.04,
      side: THREE.DoubleSide,
    });

    // 6. Shader buồng đèn lồng đá sân chùa (tự phát sáng bập bùng & đồng bộ Ngày/Đêm)
    this.glowMat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uLanternNight: { value: 0.5 },
        uLanternWarm: { value: new THREE.Color(0xff9922) },
        uLanternHot: { value: new THREE.Color(0xffdf66) },
      },
      vertexShader: `
        uniform float uTime;
        varying vec3 vNormal;
        varying float vFlicker;

        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec4 worldPos = modelMatrix * vec4(position, 1.0);

          // Dao động ngọn nến bập bùng nhẹ trên GPU
          float flicker = sin(uTime * 11.0 + position.x * 6.0 + position.z * 4.0) * 0.12
                        + cos(uTime * 23.0 + position.y * 13.0) * 0.08;
          vFlicker = flicker;

          gl_Position = projectionMatrix * viewMatrix * worldPos;
        }
      `,
      fragmentShader: `
        uniform float uLanternNight;
        uniform vec3 uLanternWarm;
        uniform vec3 uLanternHot;
        varying vec3 vNormal;
        varying float vFlicker;

        void main() {
          float intensity = (0.35 + uLanternNight * 0.95) * (1.0 + vFlicker);
          vec3 col = mix(uLanternWarm, uLanternHot, clamp(0.5 + vFlicker * 2.5, 0.0, 1.0));
          gl_FragColor = vec4(col * intensity, 1.0);
        }
      `,
    });

    // Xây dựng các mô hình 3D trong khuôn viên chùa
    buildCourtyards(this);
    buildEnclosureWalls(this);
    buildTamQuanGate(this);
    buildMainHall(this);
    buildIncenseBurner(this);
    buildLotusPondAndBridge(this);
    buildBodhiTree(this);
    buildBellTower(this);
    buildQuanAmGarden(this);
    buildPureBasin(this);
    buildStoneLanterns(this);
  }

  /**
   * Cập nhật shader buồng đèn lồng đá theo thời gian thực và chu kỳ Ngày/Đêm
   */
  public update(deltaSec: number, lanternIntensity = 1.0): void {
    if (this.glowMat) {
      this.glowMat.uniforms.uTime.value += deltaSec;
      this.glowMat.uniforms.uLanternNight.value = THREE.MathUtils.lerp(
        this.glowMat.uniforms.uLanternNight.value,
        lanternIntensity,
        0.05,
      );
    }
  }
}
