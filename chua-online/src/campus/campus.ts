import * as THREE from "three";
import { GeometryBuilder } from "./geometryBuilder.ts";

export interface CampusCollider {
  minX?: number;
  maxX?: number;
  minZ?: number;
  maxZ?: number;
  cx?: number;
  cz?: number;
  radius?: number;
}

export interface CushionSeat {
  id: number;
  x: number;
  z: number;
  occupied: boolean;
}

// Bảng màu chuẩn kiến trúc chùa cổ truyền thống
const PALETTE = {
  stone: new THREE.Color(0x9a9384),
  stoneDark: new THREE.Color(0x6f6a5e),
  stoneLight: new THREE.Color(0xb8b1a1),
  wood: new THREE.Color(0x5c3317),
  woodDark: new THREE.Color(0x3d220f),
  tileWarm: new THREE.Color(0x8a6b4b),
  tileDark: new THREE.Color(0x6e2c1d),
  gold: new THREE.Color(0xd4af37),
  goldLight: new THREE.Color(0xf5d77f),
  bronze: new THREE.Color(0x84613a),
  water: new THREE.Color(0x2f6f73),
  leaf: new THREE.Color(0x4a7a3c),
  whiteMarble: new THREE.Color(0xededed),
  cushion: new THREE.Color(0xa8422b),
  bamboo: new THREE.Color(0x558b2f),
};

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
      emissiveIntensity: 0.42, // Luôn tỏa ánh vàng kim rực rỡ cả ngày lẫn đêm
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

    this.buildCourtyards();
    this.buildEnclosureWalls();
    this.buildTamQuanGate();
    this.buildMainHall();
    this.buildIncenseBurner();
    this.buildLotusPondAndBridge();
    this.buildBodhiTree();
    this.buildBellTower();
    this.buildQuanAmGarden();
    this.buildPureBasin();
    this.buildStoneLanterns();
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

  /**
   * 1. Sân chùa chính và đường Thần đạo lát đá (Courtyard & Paths)
   */
  private buildCourtyards(): void {
    const b = new GeometryBuilder();

    // Sân cỏ tổng thể khuôn viên (từ -36 đến 36, -27 đến 56)
    b.addBox(-36, -0.05, -27, 36, 0.0, 56, new THREE.Color(0x3e5f2d));

    // Sân chùa lát đá phiến trung tâm (-19.3..19.3, -24.3..24.8)
    const step = 2.4;
    for (let x = -19.2; x < 19.2; x += step) {
      for (let z = -24; z < 24; z += step) {
        const isPath = Math.abs(x) < 3.6 && z > -8.2 && z < 24;
        const col = isPath
          ? PALETTE.stoneLight
          : Math.abs(Math.sin(x * 3.7 + z * 5.9)) > 0.45
            ? PALETTE.stone
            : PALETTE.stoneDark;
        b.addBox(
          x + 0.05,
          0.0,
          z + 0.05,
          x + step - 0.05,
          0.08,
          z + step - 0.05,
          col,
        );
      }
    }

    const geom = b.build();
    if (geom) {
      const mat = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.85,
        metalness: 0.1,
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.receiveShadow = true;
      mesh.matrixAutoUpdate = false;
      this.root.add(mesh);
    }
  }

  /**
   * 2. Tường bao đá rêu phong xung quanh chùa (Enclosure Walls)
   */
  private buildEnclosureWalls(): void {
    const b = new GeometryBuilder();
    const wallH = 2.4;
    const wallThick = 0.6;

    // Tường sau (Back: Z = -27)
    b.addBox(-36, 0, -27, 36, wallH, -27 + wallThick, PALETTE.stoneDark);
    this.colliders.push({ minX: -36, maxX: 36, minZ: -27.5, maxZ: -26.4 });

    // Tường trái (West: X = -36)
    b.addBox(-36, 0, -27, -36 + wallThick, wallH, 54, PALETTE.stoneDark);
    this.colliders.push({ minX: -36.5, maxX: -35.4, minZ: -27, maxZ: 54 });

    // Tường phải (East: X = 36)
    b.addBox(36 - wallThick, 0, -27, 36, wallH, 54, PALETTE.stoneDark);
    this.colliders.push({ minX: 35.4, maxX: 36.5, minZ: -27, maxZ: 54 });

    // Tường trước (Front: Z = 54) chừa cổng ở giữa
    b.addBox(-36, 0, 54 - wallThick, -6, wallH, 54, PALETTE.stoneDark);
    b.addBox(6, 0, 54 - wallThick, 36, wallH, 54, PALETTE.stoneDark);
    this.colliders.push({ minX: -36, maxX: -6, minZ: 53.4, maxZ: 54.5 });
    this.colliders.push({ minX: 6, maxX: 36, minZ: 53.4, maxZ: 54.5 });

    const geom = b.build();
    if (geom) {
      const mat = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.9,
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.matrixAutoUpdate = false;
      this.root.add(mesh);
    }
  }

  /**
   * 3. Cổng Tam Quan (Tam Quan Gate) cổ kính
   */
  private buildTamQuanGate(): void {
    const stoneB = new GeometryBuilder();
    const woodB = new GeometryBuilder();
    const roofB = new GeometryBuilder();
    const gz = 52.5;

    // 4 trụ cổng tam quan bằng đá
    const gatePillars = [-5.2, -1.8, 1.8, 5.2];
    for (const px of gatePillars) {
      stoneB.addBox(
        px - 0.45,
        0,
        gz - 0.45,
        px + 0.45,
        5.2,
        gz + 0.45,
        PALETTE.stone,
      );
      this.colliders.push({
        minX: px - 0.6,
        maxX: px + 0.6,
        minZ: gz - 0.6,
        maxZ: gz + 0.6,
      });
    }

    // Xà ngang nối các trụ
    woodB.addBox(-5.5, 4.6, gz - 0.5, 5.5, 5.2, gz + 0.5, PALETTE.woodDark);

    // Mái ngói Cổng Tam Quan chuẩn thuật toán Chùa Sen
    // Tầng 1: Mái hạ
    roofB.addCurvedRoofTier({
      cx: 0,
      cz: gz,
      baseY: 4.8,
      A: 7.6,
      B: 2.7,
      Rx: 3.9,
      Rz: 1.2,
      H: 1.3,
      power: 1.6,
      curl: 0.6,
      flare: 0.6,
      tileColor: new THREE.Color(0x6a5a45),
      mossAmount: 0.9,
    });

    // Tầng 2: Mái thượng cổ kính
    roofB.addCurvedRoofTier({
      cx: 0,
      cz: gz,
      baseY: 7.6,
      A: 5.6,
      B: 2.5,
      Rx: 2.8,
      Rz: 0.0,
      H: 1.5,
      power: 1.7,
      curl: 0.7,
      flare: 0.7,
      tileColor: new THREE.Color(0x8a6b4b),
      mossAmount: 0.8,
    });

    const sGeom = stoneB.build();
    if (sGeom) {
      const mesh = new THREE.Mesh(sGeom, this.stoneMat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.matrixAutoUpdate = false;
      this.root.add(mesh);
    }

    const wGeom = woodB.build();
    if (wGeom) {
      const mesh = new THREE.Mesh(wGeom, this.woodMat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.matrixAutoUpdate = false;
      this.root.add(mesh);
    }

    const rGeom = roofB.build();
    if (rGeom) {
      const mesh = new THREE.Mesh(rGeom, this.roofMat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.matrixAutoUpdate = false;
      this.root.add(mesh);
    }
  }

  /**
   * 4. Chánh Điện Toà Đại Bi (Main Hall - Kiến trúc Chồng Diêm 2 Tầng Mái Ngói Mũi Hài)
   */
  private buildMainHall(): void {
    const stoneB = new GeometryBuilder();
    const woodB = new GeometryBuilder();
    const roofB = new GeometryBuilder();
    const goldB = new GeometryBuilder();

    const bx0 = -10.6,
      bx1 = 10.6,
      bz0 = -23.4,
      bz1 = -8.2,
      by = 0.8;

    // Bệ đá tam cấp chánh điện cao 0.8m
    stoneB.addBox(bx0, 0, bz0, bx1, by, bz1, PALETTE.stoneDark);
    // Bậc tam cấp trước cửa chánh điện
    stoneB.addBox(-3.6, 0, -8.2, 3.6, 0.3, -6.8, PALETTE.stone);
    stoneB.addBox(-3.2, 0.3, -8.2, 3.2, 0.55, -7.4, PALETTE.stoneLight);

    // Hệ thống 22 Cột Gỗ Chịu Lực theo ma trận h()
    const pillarPositions: [number, number][] = [
      [-9.6, -9.6],
      [-6.4, -9.6],
      [-3.2, -9.6],
      [3.2, -9.6],
      [6.4, -9.6],
      [9.6, -9.6],
      [-9.6, -12.8],
      [-9.6, -16.0],
      [-9.6, -19.2],
      [-9.6, -22.4],
      [9.6, -12.8],
      [9.6, -16.0],
      [9.6, -19.2],
      [9.6, -22.4],
      [-6.4, -22.4],
      [-3.2, -22.4],
      [0, -22.4],
      [3.2, -22.4],
      [6.4, -22.4],
      [-6.4, -12.8],
      [6.4, -12.8],
      [-6.4, -16.0],
      [6.4, -16.0],
    ];

    const pillarTop = 6.6;
    for (const [px, pz] of pillarPositions) {
      // Chân tảng đá kê chân cột
      stoneB.addCylinder(
        px,
        pz,
        by,
        by + 0.3,
        0.58,
        0.48,
        12,
        PALETTE.stoneLight,
      );
      // Thân cột gỗ tròn thuôn
      woodB.addCylinder(
        px,
        pz,
        by + 0.3,
        by + pillarTop - 0.4,
        0.4,
        0.35,
        12,
        PALETTE.wood,
      );
      // Đầu cột / Đấu củng đỡ xà
      woodB.addCylinder(
        px,
        pz,
        by + pillarTop - 0.4,
        by + pillarTop,
        0.38,
        0.52,
        12,
        PALETTE.woodDark,
      );
      this.colliders.push({
        minX: px - 0.5,
        maxX: px + 0.5,
        minZ: pz - 0.5,
        maxZ: pz + 0.5,
      });
    }

    // Xà gồ & Rường cột liên kết
    woodB.addBox(
      -9.8,
      by + pillarTop,
      -22.6,
      9.8,
      by + pillarTop + 0.5,
      -9.4,
      PALETTE.woodDark,
    );

    // Tường hậu và 2 bên chánh điện
    woodB.addBox(-9.6, by, -22.6, 9.6, by + 5.5, -22.0, PALETTE.woodDark); // Tường hậu
    woodB.addBox(-9.8, by, -22.6, -9.2, by + 5.5, -9.6, PALETTE.woodDark); // Tường tây
    woodB.addBox(9.2, by, -22.6, 9.8, by + 5.5, -9.6, PALETTE.woodDark); // Tường đông
    this.colliders.push({ minX: -10.2, maxX: 10.2, minZ: -23.0, maxZ: -21.8 });
    this.colliders.push({ minX: -10.2, maxX: -8.8, minZ: -22.6, maxZ: -9.4 });
    this.colliders.push({ minX: 8.8, maxX: 10.2, minZ: -22.6, maxZ: -9.4 });

    // Trần gỗ lim đỡ mái hạ và che kín toàn bộ lòng Chánh điện (bịt kín không gian tầng 1)
    woodB.addBox(-9.8, by + 5.5, -22.6, 9.8, by + 5.85, -9.4, PALETTE.woodDark);

    // Tường bao chịu lực lõi giữa tầng 1 và tầng 2 (bịt kín khoảng không gian bên trong mái hạ)
    woodB.addBox(-7.6, by + 5.8, -19.6, 7.6, by + 9.6, -12.4, PALETTE.woodDark);

    // Khối tường gỗ sẫm cổ diêm thông sáng giữa 2 tầng mái (bịt kín từ by + 9.5 lên by + 12.6)
    woodB.addBox(
      -7.6,
      by + 9.5,
      -19.6,
      7.6,
      by + 12.6,
      -12.4,
      PALETTE.woodDark,
    );

    // Tường lõi cổ diêm ăn sâu lên mái thượng (bảo đảm khi góc mái cong vút lên không bao giờ bị hở xuyên thấu)
    woodB.addBox(
      -7.2,
      by + 12.4,
      -19.2,
      7.2,
      by + 13.9,
      -12.8,
      PALETTE.woodDark,
    );

    // Khung xà gồ viền quanh cổ diêm (Xà hạ & Xà thượng cổ diêm)
    woodB.addBox(
      -7.75,
      by + 9.55,
      -12.65,
      7.75,
      by + 9.9,
      -12.25,
      PALETTE.woodDark,
    );
    woodB.addBox(
      -7.75,
      by + 12.15,
      -12.65,
      7.75,
      by + 12.6,
      -12.25,
      PALETTE.woodDark,
    );

    // 4 Cột góc cổ diêm
    for (const sx of [-7.6, 7.6]) {
      for (const sz of [-19.5, -12.5]) {
        woodB.addBox(
          sx - 0.22,
          by + 9.5,
          sz - 0.22,
          sx + 0.22,
          by + 12.6,
          sz + 0.22,
          PALETTE.woodDark,
        );
      }
    }

    // Hàng chấn song gỗ lim mặt trước cổ diêm (khít chặt giữa xà hạ và xà thượng)
    for (let x = -7.2; x <= 7.2; x += 0.35) {
      if (Math.abs(x) < 1.45) continue; // Chừa ô cửa sổ thông sáng ở giữa
      woodB.addBox(
        x - 0.05,
        by + 9.9,
        -12.4,
        x + 0.05,
        by + 12.15,
        -12.28,
        new THREE.Color(0xb58038),
      );
    }

    // Khung cửa sổ cổ diêm chính giữa sơn son viền vàng
    woodB.addBox(
      -1.4,
      by + 10.2,
      -12.46,
      1.4,
      by + 11.85,
      -12.34,
      new THREE.Color(0x6e1f18),
    );
    goldB.addBox(
      -1.46,
      by + 10.14,
      -12.48,
      1.46,
      by + 11.91,
      -12.42,
      PALETTE.gold,
    );

    // Chấn song gỗ 2 bên hông cổ diêm (mặt đông & tây) tạo vẻ đẹp kiến trúc hoàn chỉnh từ mọi góc nhìn
    for (const sx of [-7.6, 7.6]) {
      for (let z = -19.0; z <= -13.0; z += 0.65) {
        woodB.addBox(
          sx - 0.06,
          by + 10.1,
          z - 0.06,
          sx + 0.06,
          by + 11.9,
          z + 0.06,
          new THREE.Color(0xb58038),
        );
      }
    }

    // Dải phướn lụa vàng rủ hai bên tiền sảnh
    for (const px of [-7.6, 7.6]) {
      woodB.addBox(
        px - 0.35,
        by + 2.2,
        -9.3,
        px + 0.35,
        by + 6.0,
        -9.26,
        new THREE.Color(0xd9a826),
      );
      woodB.addBox(
        px - 0.38,
        by + 2.1,
        -9.32,
        px + 0.38,
        by + 2.2,
        -9.24,
        PALETTE.woodDark,
      );
    }

    // Đôi Hạc đồng cưỡi Rùa đứng chầu hai bên sảnh Chánh Điện (x = ±4.6, z = -7.8)
    for (const sign of [-1, 1]) {
      const hx = sign * 4.6;
      const hz = -7.8;
      // Mai rùa
      stoneB.addBox(
        hx - 0.38,
        by,
        hz - 0.48,
        hx + 0.38,
        by + 0.28,
        hz + 0.48,
        PALETTE.bronze,
      );
      // Chân hạc
      goldB.addCylinder(
        hx - 0.06,
        hz,
        by + 0.28,
        by + 1.25,
        0.02,
        0.02,
        6,
        PALETTE.gold,
      );
      goldB.addCylinder(
        hx + 0.06,
        hz,
        by + 0.28,
        by + 1.25,
        0.02,
        0.02,
        6,
        PALETTE.gold,
      );
      // Thân chim hạc
      goldB.addCylinder(
        hx,
        hz,
        by + 1.25,
        by + 1.75,
        0.18,
        0.12,
        8,
        PALETTE.gold,
      );
      // Cổ hạc vươn cao uốn cong thanh thoát
      goldB.addLimb(
        new THREE.Vector3(hx, by + 1.7, hz + 0.05),
        new THREE.Vector3(hx, by + 2.45, hz - 0.08),
        0.045,
        0.025,
        5,
        PALETTE.gold,
      );
      // Đầu hạc và mỏ ngậm cành sen
      goldB.addLimb(
        new THREE.Vector3(hx, by + 2.45, hz - 0.08),
        new THREE.Vector3(hx - sign * 0.12, by + 2.48, hz - 0.25),
        0.03,
        0.008,
        4,
        PALETTE.gold,
      );
    }

    // DỰNG 2 TẦNG MÁI CHÙA CHÁNH ĐIỆN THEO ĐÚNG HỆ THÔNG SỐ CHÙA SEN
    // Tầng Mái 1 (Mái hạ xòe rộng 4 hướng che hiên và hàng cột, trần rui mè kín khít)
    roofB.addCurvedRoofTier(
      {
        cx: 0,
        cz: -16.0,
        baseY: by + 6.15,
        A: 11.4,
        B: 8.2,
        Rx: 7.2,
        Rz: 3.0,
        H: 3.5,
        power: 1.7,
        curl: 1.0,
        flare: 0.85,
        tileColor: new THREE.Color(0x6a5a45),
        mossAmount: 0.95,
        horns: true,
        hasDragons: true,
      },
      goldB,
    );

    // Tầng Mái 2 (Mái thượng đỉnh nóc uy nghiêm với bờ nóc ngói ngọc và Phù điêu Lưỡng Long Chầu Nguyệt dát vàng)
    roofB.addCurvedRoofTier(
      {
        cx: 0,
        cz: -16.0,
        baseY: by + 11.9,
        A: 9.0,
        B: 4.6,
        Rx: 5.2,
        Rz: 0.0,
        H: 3.2,
        power: 1.7,
        curl: 1.05,
        flare: 0.9,
        tileColor: new THREE.Color(0x8a6b4b),
        mossAmount: 0.75,
        horns: true,
        hasDragons: true,
      },
      goldB,
    );

    // 5. Nội điện: Tượng Đức Phật Thích Ca Mâu Ni & 2 Tôn Giả
    this.buildBuddhaAltar(goldB, 0, by, -20.3);

    // 6. Đại Hồng Chung (Chuông) và Trống/Mõ lớn tại (5.25, -18)
    this.buildHallBellAndMo(goldB, 5.25, by, -18.0);

    // 7. Hàng bồ đoàn thiền tọa
    this.buildCushionRows();

    const sGeom = stoneB.build();
    if (sGeom) {
      const mesh = new THREE.Mesh(sGeom, this.stoneMat);
      mesh.receiveShadow = true;
      mesh.matrixAutoUpdate = false;
      this.root.add(mesh);
    }

    const wGeom = woodB.build();
    if (wGeom) {
      const mesh = new THREE.Mesh(wGeom, this.woodMat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.matrixAutoUpdate = false;
      this.root.add(mesh);
    }

    const rGeom = roofB.build();
    if (rGeom) {
      const mesh = new THREE.Mesh(rGeom, this.roofMat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.matrixAutoUpdate = false;
      this.root.add(mesh);
    }

    const gGeom = goldB.build();
    if (gGeom) {
      const mesh = new THREE.Mesh(gGeom, this.goldMat);
      mesh.castShadow = true;
      mesh.matrixAutoUpdate = false;
      this.root.add(mesh);
    }

    // Bức Hoành Phi "TỪ BI HỶ XẢ" sơn son thiếp vàng treo chính giữa tiền sảnh
    const hoanhPhi = this.createHoanhPhiMesh(0, by + 5.75, -9.18);
    this.root.add(hoanhPhi);
  }

  /**
   * Tạo Hoành Phi chữ Hán/Quốc ngữ "TỪ BI HỶ XẢ" sơn son thiếp vàng
   */
  private createHoanhPhiMesh(x: number, y: number, z: number): THREE.Mesh {
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext("2d")!;

    // Nền đỏ son sẫm truyền thống
    ctx.fillStyle = "#8a1c18";
    ctx.fillRect(0, 0, 512, 128);

    // Viền kép thếp vàng
    ctx.strokeStyle = "#ffd700";
    ctx.lineWidth = 10;
    ctx.strokeRect(6, 6, 500, 116);
    ctx.lineWidth = 3;
    ctx.strokeRect(16, 16, 480, 96);

    // Chữ TỪ BI HỶ XẢ vàng kim rực rỡ
    ctx.fillStyle = "#ffe680";
    ctx.font = "bold 56px serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("✦ TỪ BI HỶ XẢ ✦", 256, 64);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.MeshStandardMaterial({
      map: tex,
      roughness: 0.35,
      metalness: 0.25,
    });
    const geom = new THREE.PlaneGeometry(3.6, 0.9);
    const mesh = new THREE.Mesh(geom, mat);
    mesh.position.set(x, y, z);
    mesh.matrixAutoUpdate = false;
    mesh.updateMatrix();
    return mesh;
  }

  /**
   * Tòa Tam Bảo: Tượng Đức Phật Thích Ca Mâu Ni & 2 Tôn giả A Nan, Ca Diếp
   */
  private buildBuddhaAltar(
    b: GeometryBuilder,
    cx: number,
    by: number,
    cz: number,
  ): void {
    // Bàn thờ Tam Bảo đá đỏ son
    b.addBox(
      cx - 3.8,
      by,
      cz - 1.6,
      cx + 3.8,
      by + 1.1,
      cz + 1.2,
      new THREE.Color(0x6b2416),
    );

    // Đài sen mạ vàng nhiều lớp
    b.addCylinder(cx, cz, by + 1.1, by + 1.5, 1.6, 1.8, 16, PALETTE.gold);
    b.addCylinder(cx, cz, by + 1.5, by + 1.8, 1.7, 1.4, 16, PALETTE.goldLight);

    // Thân Tượng Đức Phật Thích Ca Mâu Ni ngồi kiết già
    b.addCylinder(cx, cz, by + 1.8, by + 3.4, 1.1, 0.7, 16, PALETTE.gold);
    // Đầu tượng Phật & Nhục kế (Ushnisha)
    b.addCylinder(cx, cz, by + 3.4, by + 4.2, 0.45, 0.4, 12, PALETTE.goldLight);
    b.addCylinder(cx, cz, by + 4.2, by + 4.5, 0.22, 0.05, 10, PALETTE.gold);

    // Hào quang vàng rực rỡ sau lưng Phật
    b.addCylinder(
      cx,
      cz - 0.4,
      by + 3.2,
      by + 3.3,
      1.6,
      1.6,
      20,
      PALETTE.goldLight,
    );

    // Tôn giả A Nan bên tả (x = -2.25)
    b.addCylinder(
      cx - 2.25,
      cz,
      by + 1.1,
      by + 2.9,
      0.4,
      0.3,
      10,
      PALETTE.gold,
    );
    b.addCylinder(
      cx - 2.25,
      cz,
      by + 2.9,
      by + 3.5,
      0.22,
      0.2,
      10,
      PALETTE.stoneLight,
    );

    // Tôn giả Ca Diếp bên hữu (x = 2.25)
    b.addCylinder(
      cx + 2.25,
      cz,
      by + 1.1,
      by + 2.9,
      0.4,
      0.3,
      10,
      PALETTE.gold,
    );
    b.addCylinder(
      cx + 2.25,
      cz,
      by + 2.9,
      by + 3.5,
      0.22,
      0.2,
      10,
      PALETTE.stoneLight,
    );

    this.colliders.push({
      minX: cx - 4.0,
      maxX: cx + 4.0,
      minZ: cz - 1.8,
      maxZ: cz + 1.4,
    });
  }

  /**
   * Chuông đồng và Giá Mõ bên trong Chánh điện
   */
  private buildHallBellAndMo(
    b: GeometryBuilder,
    x: number,
    by: number,
    z: number,
  ): void {
    // Giá treo chuông gỗ
    b.addBox(
      x - 0.8,
      by,
      z - 0.1,
      x + 0.8,
      by + 2.8,
      z + 0.1,
      PALETTE.woodDark,
    );
    b.addBox(
      x - 0.7,
      by + 2.6,
      z - 0.4,
      x + 0.7,
      by + 2.8,
      z + 0.4,
      PALETTE.wood,
    );

    // Chuông đồng thau
    b.addCylinder(x, z, by + 1.4, by + 2.4, 0.45, 0.3, 14, PALETTE.bronze);

    // Giá để Mõ gỗ tụng kinh
    b.addBox(x - 0.4, by, z + 1.2, x + 0.4, by + 0.7, z + 1.8, PALETTE.wood);
    b.addCylinder(
      x,
      z + 1.5,
      by + 0.7,
      by + 1.1,
      0.32,
      0.25,
      12,
      new THREE.Color(0x8a4513),
    );

    this.colliders.push({
      minX: x - 1.0,
      maxX: x + 1.0,
      minZ: z - 0.5,
      maxZ: z + 2.0,
    });
  }

  /**
   * Bồ đoàn nhung đỏ xếp ngay ngắn cho Phật tử ngồi thiền
   */
  private buildCushionRows(): void {
    const b = new GeometryBuilder();
    let seatId = 0;

    // 4 hàng bồ đoàn, mỗi hàng 6 chiếc
    for (let row = 0; row < 4; row++) {
      for (let col = -3; col <= 3; col++) {
        if (col === 0 && row < 2) continue; // Chừa lối đi chính đạo
        const sx = col * 2.1;
        const sz = -11.0 - row * 2.2;
        b.addCylinder(sx, sz, 0.8, 0.94, 0.42, 0.4, 12, PALETTE.cushion);
        this.seats.push({ id: seatId++, x: sx, z: sz, occupied: false });
      }
    }

    const geom = b.build();
    if (geom) {
      const mat = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.9,
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.matrixAutoUpdate = false;
      this.root.add(mesh);
    }
  }

  /**
   * 5. Đỉnh Lư Hương Đồng lớn đặt trước sân chùa (x: 0, z: -2.5)
   */
  private buildIncenseBurner(): void {
    const b = new GeometryBuilder();
    const ix = 0,
      iz = -2.5;

    // Bệ đá kê lư hương
    b.addBox(
      ix - 1.4,
      0.08,
      iz - 1.4,
      ix + 1.4,
      0.35,
      iz + 1.4,
      PALETTE.stoneLight,
    );

    // Ba chân đỉnh đồng
    b.addCylinder(ix - 0.6, iz - 0.4, 0.35, 0.8, 0.15, 0.12, 8, PALETTE.bronze);
    b.addCylinder(ix + 0.6, iz - 0.4, 0.35, 0.8, 0.15, 0.12, 8, PALETTE.bronze);
    b.addCylinder(ix, iz + 0.6, 0.35, 0.8, 0.15, 0.12, 8, PALETTE.bronze);

    // Thân lư hương tròn nở rộng
    b.addCylinder(ix, iz, 0.8, 1.4, 0.85, 1.0, 16, PALETTE.bronze);
    b.addCylinder(ix, iz, 1.4, 1.7, 1.0, 0.88, 16, PALETTE.bronze);

    // Cổ và nắp lư hương có nghê đồng ngự đỉnh
    b.addCylinder(ix, iz, 1.7, 2.1, 0.6, 0.2, 12, PALETTE.bronze);
    b.addBox(ix - 0.2, 2.1, iz - 0.2, ix + 0.2, 2.45, iz + 0.2, PALETTE.gold);

    this.colliders.push({
      minX: ix - 1.5,
      maxX: ix + 1.5,
      minZ: iz - 1.5,
      maxZ: iz + 1.5,
    });

    const geom = b.build();
    if (geom) {
      const mat = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.4,
        metalness: 0.7,
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.matrixAutoUpdate = false;
      this.root.add(mesh);
    }
  }

  /**
   * 6. Hồ Sen & Cầu Kiều Gỗ (Lotus Pond & Wooden Bridge) tại (x: 0, z: 38, r: 9)
   */
  private buildLotusPondAndBridge(): void {
    const b = new GeometryBuilder();
    const px = 0,
      pz = 38,
      pr = 9.2;

    // Lòng hồ và bờ đá kè hồ sen
    const segs = 32;
    for (let i = 0; i < segs; i++) {
      const a0 = (i / segs) * Math.PI * 2;
      const a1 = ((i + 1) / segs) * Math.PI * 2;
      const cos0 = Math.cos(a0),
        sin0 = Math.sin(a0);
      const cos1 = Math.cos(a1),
        sin1 = Math.sin(a1);

      // Mặt nước hồ sen (Y = -0.1)
      const c = b.vert(px, -0.1, pz, 0, 1, 0, PALETTE.water);
      const v0 = b.vert(
        px + cos0 * pr,
        -0.1,
        pz + sin0 * pr,
        0,
        1,
        0,
        PALETTE.water,
      );
      const v1 = b.vert(
        px + cos1 * pr,
        -0.1,
        pz + sin1 * pr,
        0,
        1,
        0,
        PALETTE.water,
      );
      b.tri(c, v0, v1);

      // Bờ kè đá quanh mép hồ
      b.quad(
        b.vert(
          px + cos0 * pr,
          -0.1,
          pz + sin0 * pr,
          -cos0,
          0,
          -sin0,
          PALETTE.stoneDark,
        ),
        b.vert(
          px + cos1 * pr,
          -0.1,
          pz + sin1 * pr,
          -cos1,
          0,
          -sin1,
          PALETTE.stoneDark,
        ),
        b.vert(
          px + cos1 * (pr + 0.6),
          0.15,
          pz + sin1 * (pr + 0.6),
          cos1,
          1,
          sin1,
          PALETTE.stone,
        ),
        b.vert(
          px + cos0 * (pr + 0.6),
          0.15,
          pz + sin0 * (pr + 0.6),
          cos0,
          1,
          sin0,
          PALETTE.stone,
        ),
      );
    }

    // Cây Cầu Kiều gỗ cong bắc qua hồ sen (từ z: 28 đến 48, rộng 3.2m)
    const bridgeSteps = 16;
    const bz0 = 28.5,
      bz1 = 47.5,
      bw = 3.2;
    for (let i = 0; i < bridgeSteps; i++) {
      const t0 = i / bridgeSteps;
      const t1 = (i + 1) / bridgeSteps;
      const z0 = bz0 + (bz1 - bz0) * t0;
      const z1 = bz0 + (bz1 - bz0) * t1;

      // Độ vồng cong của nhịp cầu
      const archY0 = 0.1 + Math.sin(t0 * Math.PI) * 1.4;
      const archY1 = 0.1 + Math.sin(t1 * Math.PI) * 1.4;

      // Mặt ván cầu gỗ
      b.quad(
        b.vert(-bw * 0.5, archY0, z0, 0, 1, 0, PALETTE.woodDark),
        b.vert(bw * 0.5, archY0, z0, 0, 1, 0, PALETTE.woodDark),
        b.vert(bw * 0.5, archY1, z1, 0, 1, 0, PALETTE.woodDark),
        b.vert(-bw * 0.5, archY1, z1, 0, 1, 0, PALETTE.woodDark),
      );

      // Lan can cầu bên trái & bên phải
      b.addBox(
        -bw * 0.5 - 0.1,
        archY0,
        z0,
        -bw * 0.5,
        archY0 + 0.9,
        z1,
        PALETTE.wood,
      );
      b.addBox(
        bw * 0.5,
        archY0,
        z0,
        bw * 0.5 + 0.1,
        archY0 + 0.9,
        z1,
        PALETTE.wood,
      );
    }

    // Các cụm lá sen và hoa sen nổi
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2 + 0.2;
      const dist = 2.2 + (i % 6) * 1.1;
      const lx = px + Math.cos(angle) * dist;
      const lz = pz + Math.sin(angle) * dist;
      if (Math.abs(lx) < 2.0) continue; // Tránh vướng gầm cầu

      // Lá sen tròn
      b.addCylinder(lx, lz, -0.08, -0.02, 0.65, 0.6, 10, PALETTE.leaf);
      // Nụ hoa sen hồng
      if (i % 3 === 0) {
        b.addCylinder(
          lx,
          lz,
          -0.02,
          0.25,
          0.12,
          0.02,
          6,
          new THREE.Color(0xf08080),
        );
      }
    }

    // Chặn va chạm để không lọt xuống hồ sen (chỉ được đi trên cầu kiều)
    this.colliders.push({
      minX: -pr - 0.5,
      maxX: -1.7,
      minZ: pz - pr,
      maxZ: pz + pr,
    });
    this.colliders.push({
      minX: 1.7,
      maxX: pr + 0.5,
      minZ: pz - pr,
      maxZ: pz + pr,
    });

    const geom = b.build();
    if (geom) {
      const mat = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.3,
        metalness: 0.4,
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.receiveShadow = true;
      mesh.matrixAutoUpdate = false;
      this.root.add(mesh);
    }
  }

  /**
   * 7. Cây Bồ Đề Đại Thụ và Hoa Viên Cây Xanh Khuôn Viên Chùa
   * Tái tạo chuẩn kiến trúc cây cổ thụ Chùa Sen:
   * - Thân cây hình nón cụt thuôn từ gốc lên ngọn
   * - Hệ bạnh rễ cổ thụ (Buttress roots) tỏa tròn cắm xuống đất
   * - Chạc ba và các cành lớn phân nhánh (Limb branches)
   * - 9 Cụm tán lá mây đa diện hữu cơ (Organic Canopy Clouds) biến dạng dẹp Y (squash) và gồ ghề (bump)
   * - Phiến lá Bồ Đề hình trái tim có đuôi nhọn (Bodhi leaf polygon)
   * - Rễ phụ buông rủ thanh tịnh (Aerial root tendrils)
   * - Băng ghế đá tròn bao quanh gốc cây phục vụ Phật tử thiền tọa
   */
  private buildBodhiTree(): void {
    const woodB = new GeometryBuilder();
    const leavesB = new GeometryBuilder();
    const stoneB = new GeometryBuilder();

    // Danh sách các cây Bồ đề cổ thụ và cây hoa viên trong khuôn viên
    const trees: { x: number; z: number; scale: number; hasBench: boolean }[] =
      [
        { x: -15.6, z: 7.0, scale: 1.25, hasBench: true }, // Cây Bồ Đề Đại Thụ chính
        { x: -26.0, z: -8.0, scale: 1.05, hasBench: false }, // Cây vườn Quan Âm
        { x: 21.5, z: 24.0, scale: 0.95, hasBench: false }, // Cây cạnh hồ sen
        { x: 21.0, z: -10.0, scale: 1.0, hasBench: false }, // Cây sau tháp chuông
      ];

    // Cấu hình 9 cụm đám mây tán lá (Canopy clusters)
    const cloudClusters: [number, number, number, number][] = [
      [0, 6.2, 0, 2.6],
      [2.6, 5.4, 0.9, 2.1],
      [-2.4, 5.3, -1.6, 2.2],
      [-0.8, 5.8, 2.6, 2.0],
      [1.4, 7.2, -1.1, 1.8],
      [-2.1, 6.8, 0.8, 1.7],
      [3.2, 6.2, -1.4, 1.6],
      [0.6, 4.8, -2.8, 1.7],
      [-3.2, 4.8, 1.7, 1.6],
    ];

    // Cấu hình các cành nhánh chính
    const branchConfigs: [number, number, number, number, number][] = [
      [2.7, 5.2, 1.0, 0.28, 0.12],
      [-2.3, 5.0, -1.7, 0.26, 0.11],
      [-0.9, 5.5, 2.4, 0.25, 0.1],
      [1.5, 6.2, -1.4, 0.22, 0.09],
    ];

    // Cấu hình rễ phụ buông rủ
    const tendrilConfigs: [number, number, number, number][] = [
      [1.8, 4.8, 0.8, 3.2],
      [-1.6, 4.6, -1.2, 3.0],
      [0.7, 5.2, -2.0, 3.5],
      [-1.2, 5.0, 1.9, 3.1],
    ];

    for (const tree of trees) {
      const tx = tree.x;
      const tz = tree.z;
      const r = tree.scale;

      // 1. Thân cây cổ thụ thuôn dần lên trên
      woodB.addCylinder(
        tx,
        tz,
        0.08,
        3.5 * r,
        0.72 * r,
        0.44 * r,
        10,
        PALETTE.woodDark,
      );

      // 2. Hệ bạnh rễ cổ thụ (Buttress roots) tỏa tròn cắm xuống đất
      const rootAngles = [0.15, 1.15, 2.1, 3.25, 4.35, 5.35];
      for (const a of rootAngles) {
        const rx = Math.cos(a);
        const rz = Math.sin(a);
        woodB.addLimb(
          new THREE.Vector3(tx + rx * 0.44 * r, 1.0 * r, tz + rz * 0.44 * r),
          new THREE.Vector3(tx + rx * 1.65 * r, 0.08, tz + rz * 1.65 * r),
          0.22 * r,
          0.07 * r,
          6,
          PALETTE.woodDark,
        );
      }

      // 3. Các cành lớn phân nhánh
      for (const [bx, by, bz, r0, r1] of branchConfigs) {
        woodB.addLimb(
          new THREE.Vector3(tx, 3.1 * r, tz),
          new THREE.Vector3(tx + bx * r, by * r, tz + bz * r),
          r0 * r,
          r1 * r,
          6,
          PALETTE.woodDark,
        );
      }

      // 4. Các đám mây tán lá mây hữu cơ và phiến lá Bồ Đề hình tim
      for (const [cx, cy, cz, cr] of cloudClusters) {
        const center = new THREE.Vector3(tx + cx * r, cy * r, tz + cz * r);

        leavesB.addDeformedSphere(
          center,
          cr * r,
          cr * r * 0.78,
          cr * r,
          0.24,
          new THREE.Color(0x355e2b), // Base màu xanh sẫm
          new THREE.Color(0x60993e), // Crown màu xanh tươi
          10,
          8,
        );

        // Phiến lá bồ đề nhọn đuôi rải rác trên tán lá
        for (let li = 0; li < 6; li++) {
          const theta = (li / 6) * Math.PI * 2 + cx;
          const phi = (li % 3) * 0.4 + 0.6;
          const normal = new THREE.Vector3(
            Math.cos(theta) * Math.sin(phi),
            Math.cos(phi),
            Math.sin(theta) * Math.sin(phi),
          ).normalize();
          const leafPos = center.clone().addScaledVector(normal, cr * r * 0.92);
          leavesB.addBodhiLeaf(
            leafPos,
            normal,
            0.32 * r,
            new THREE.Color(0x72ad48),
          );
        }
      }

      // 5. Rễ phụ buông rủ từ cành cao
      for (const [tx_off, ty_start, tz_off, len] of tendrilConfigs) {
        woodB.addLimb(
          new THREE.Vector3(tx + tx_off * r, ty_start * r, tz + tz_off * r),
          new THREE.Vector3(
            tx + tx_off * r + 0.1,
            (ty_start - len) * r,
            tz + tz_off * r - 0.1,
          ),
          0.035 * r,
          0.015 * r,
          4,
          PALETTE.woodDark,
        );
      }

      // 6. Băng ghế đá tròn thiền tọa (nếu có)
      if (tree.hasBench) {
        const benchR = 2.4;
        stoneB.addCylinder(
          tx,
          tz,
          0.08,
          0.52,
          benchR + 0.48,
          benchR,
          18,
          PALETTE.stoneLight,
        );
        this.colliders.push({
          cx: tx,
          cz: tz,
          radius: benchR + 0.48,
        });
      } else {
        this.colliders.push({
          cx: tx,
          cz: tz,
          radius: 1.1 * r,
        });
      }
    }

    // Dựng Mesh gỗ (Thân, cành, rễ)
    const woodGeom = woodB.build();
    if (woodGeom) {
      const woodMesh = new THREE.Mesh(woodGeom, this.woodMat);
      woodMesh.castShadow = true;
      woodMesh.receiveShadow = true;
      woodMesh.matrixAutoUpdate = false;
      this.root.add(woodMesh);
    }

    // Dựng Mesh tán lá (Toàn bộ lá cây sân chùa gom vào 1 Mesh duy nhất)
    const leavesGeom = leavesB.build();
    if (leavesGeom) {
      this.leavesMesh = new THREE.Mesh(leavesGeom, this.leafMat);
      this.leavesMesh.castShadow = true;
      this.leavesMesh.receiveShadow = true;
      this.leavesMesh.matrixAutoUpdate = false;
      this.root.add(this.leavesMesh);
    }

    // Dựng Mesh ghế đá
    const stoneGeom = stoneB.build();
    if (stoneGeom) {
      const stoneMesh = new THREE.Mesh(stoneGeom, this.stoneMat);
      stoneMesh.castShadow = true;
      stoneMesh.receiveShadow = true;
      stoneMesh.matrixAutoUpdate = false;
      this.root.add(stoneMesh);
    }
  }

  /**
   * 8. CHÒI CHUÔNG CHÙA (BELL TOWER / PHƯƠNG ĐÌNH 2 TẦNG 8 MÁI CHỒNG DIÊM)
   * Tọa độ trung tâm: (x: 15.5, z: 4.0)
   * Thiết kế chuẩn xác 100% theo bản phối cảnh 3D kiến trúc cổ truyền Việt Nam:
   * - Bệ móng ốp gạch thẻ, sàn đá hoa cương nhẵn bóng, bậc tam cấp & đôi Rồng đá thời Lê/Lý
   * - Hệ lan can đá chạm trổ bao quanh với 20 trụ đá đỉnh búp sen nở
   * - 4 Chân tảng đá hoa sen chạm nổi 16 cánh sen ngửa và 4 cột gỗ lim đồ sộ tầng 1
   * - Quả Đại Hồng Chung đúc bằng đồng nguyên khối treo ở tâm tầng 1 với quai rồng Bồ Lao & 2 xích sắt
   * - Chày kình (dùi gỗ gõ chuông) treo nằm ngang bên cạnh bằng 2 sợi xích sắt song song
   * - Hệ vì kèo, kẻ góc, bẩy xà nách gỗ lim uốn lượn đỡ lấy 4 góc mái hạ
   * - Tầng cổ diêm (Tầng 2) với lan can gỗ chấn song thông thoáng và 4 cột gỗ thanh thoát
   * - 8 Đầu đao vân mây cuộn bằng đá xám trắng (4 tầng hạ + 4 tầng thượng) vút cao ngạo nghễ
   * - Đỉnh chóp nóc ngự Bình Hồ Lô phong thủy dát vàng và Cây Kim Thu Lôi vút thẳng lên trời
   */
  private buildBellTower(): void {
    const stoneB = new GeometryBuilder();
    const woodB = new GeometryBuilder();
    const goldB = new GeometryBuilder();
    const roofB = new GeometryBuilder();
    const bronzeB = new GeometryBuilder();

    const bx = 15.5,
      bz = 4.0;

    // Gam màu gỗ lim ấm sáng, bóng bẩy tự nhiên (không bị tối đen)
    const woodLim = new THREE.Color(0x945831);
    const woodLimDark = new THREE.Color(0x693b1d);
    const woodLimLight = new THREE.Color(0xb26f3f);

    // Gam màu đồng cổ truyền Đại Hồng Chung (đồng thanh ánh vàng cổ kính)
    const bronzeCol = new THREE.Color(0x96764d); // Đồng thanh đúc cổ ánh đồng ấm
    const bronzeHighlight = new THREE.Color(0xdfb768); // Gờ nổi kinh văn và nhũ chuông mạ vàng
    const ironChain = new THREE.Color(0x383533); // Xích sắt rèn thủ công

    // =========================================================================
    // PHẦN 1: BỆ NỀN TAM CẤP, HỆ LAN CAN TRỤ BÚP SEN & ĐÔI RỒNG ĐÁ TAY VỊN
    // =========================================================================

    // 1.1 Khối bệ móng (Podium 5.6m x 5.6m)
    // Chân móng gạch thẻ cổ (Brick base)
    stoneB.addBox(
      bx - 2.82,
      -0.05,
      bz - 2.82,
      bx + 2.82,
      0.58,
      bz + 2.82,
      new THREE.Color(0x564438),
    );
    // Các mạch vữa chỉ gạch thẻ nung cổ truyền
    stoneB.addBox(
      bx - 2.83,
      0.18,
      bz - 2.83,
      bx + 2.83,
      0.2,
      bz + 2.83,
      new THREE.Color(0x382c23),
    );
    stoneB.addBox(
      bx - 2.83,
      0.38,
      bz - 2.83,
      bx + 2.83,
      0.4,
      bz + 2.83,
      new THREE.Color(0x382c23),
    );

    // Biển đá chữ nổi "Chòi Chuông Chùa" ở mặt tiền bệ móng
    stoneB.addBox(
      bx - 0.8,
      0.16,
      bz + 2.81,
      bx + 0.8,
      0.44,
      bz + 2.86,
      new THREE.Color(0x352b23),
    );

    // Gờ đá xám bo viền đỉnh bệ móng (Coping lip)
    stoneB.addBox(
      bx - 2.86,
      0.58,
      bz - 2.86,
      bx + 2.86,
      0.64,
      bz + 2.86,
      PALETTE.stone,
    );

    // Mặt sàn lát đá hoa cương xám nhẵn (Floor slab cao 0.64m)
    stoneB.addBox(
      bx - 2.8,
      0.62,
      bz - 2.8,
      bx + 2.8,
      0.65,
      bz + 2.8,
      PALETTE.stoneLight,
    );

    // 1.2 Bậc tam cấp phía trước (4 bậc rộng 1.6m)
    const stairMinX = bx - 0.8;
    const stairMaxX = bx + 0.8;
    // Bậc 1
    stoneB.addBox(
      stairMinX,
      0.0,
      bz + 2.82,
      stairMaxX,
      0.16,
      bz + 3.82,
      PALETTE.stone,
    );
    // Bậc 2
    stoneB.addBox(
      stairMinX,
      0.16,
      bz + 2.82,
      stairMaxX,
      0.32,
      bz + 3.52,
      PALETTE.stoneLight,
    );
    // Bậc 3
    stoneB.addBox(
      stairMinX,
      0.32,
      bz + 2.82,
      stairMaxX,
      0.48,
      bz + 3.22,
      PALETTE.stone,
    );
    // Bậc 4 (nối sàn)
    stoneB.addBox(
      stairMinX,
      0.48,
      bz + 2.82,
      stairMaxX,
      0.65,
      bz + 2.92,
      PALETTE.stoneLight,
    );

    // 1.3 Đôi Rồng đá tay vịn trườn chúc đầu xuống 2 bên bậc tam cấp
    for (const signX of [-1, 1]) {
      const rx = bx + signX * 0.94;
      // Dải bệ dốc đá đỡ thân rồng
      stoneB.addLimb(
        new THREE.Vector3(rx, 0.72, bz + 2.78),
        new THREE.Vector3(rx, 0.15, bz + 3.85),
        0.14,
        0.14,
        4,
        PALETTE.stoneDark,
      );

      // Thân Rồng đá chạm nổi uốn lượn 4 khúc
      // Khúc 1: Đuôi rồng cuộn xoắn ốc trên mặt sàn
      stoneB.addLimb(
        new THREE.Vector3(rx, 0.88, bz + 2.76),
        new THREE.Vector3(rx, 0.74, bz + 2.98),
        0.09,
        0.12,
        6,
        PALETTE.whiteMarble,
      );
      // Khúc 2: Lưng uốn vồng lên có vây lưng
      stoneB.addLimb(
        new THREE.Vector3(rx, 0.74, bz + 2.98),
        new THREE.Vector3(rx, 0.54, bz + 3.38),
        0.12,
        0.13,
        6,
        PALETTE.whiteMarble,
      );
      // Khúc 3: Thân trườn xuống bậc
      stoneB.addLimb(
        new THREE.Vector3(rx, 0.54, bz + 3.38),
        new THREE.Vector3(rx, 0.28, bz + 3.78),
        0.13,
        0.14,
        6,
        PALETTE.whiteMarble,
      );
      // Vây lưng rồng đá (Dorsal spines)
      for (let step = 0; step < 4; step++) {
        const t = step / 3;
        const fy = THREE.MathUtils.lerp(0.78, 0.35, t);
        const fz = THREE.MathUtils.lerp(bz + 2.92, bz + 3.65, t);
        stoneB.addLimb(
          new THREE.Vector3(rx, fy, fz),
          new THREE.Vector3(rx, fy + 0.12, fz - 0.05),
          0.04,
          0.008,
          4,
          PALETTE.whiteMarble,
        );
      }

      // Đầu Rồng đá chạm trổ uy nghi ở chân bậc thang
      stoneB.addBox(
        rx - 0.11,
        0.15,
        bz + 3.72,
        rx + 0.11,
        0.48,
        bz + 4.05,
        PALETTE.whiteMarble,
      );
      // Mõm và hàm rồng há ngậm ngọc
      stoneB.addCylinder(
        rx,
        bz + 4.08,
        0.22,
        0.34,
        0.09,
        0.05,
        8,
        PALETTE.whiteMarble,
      );
      // Ngọc minh châu mạ vàng trong miệng rồng
      goldB.addCylinder(rx, bz + 4.06, 0.24, 0.32, 0.05, 0.05, 8, PALETTE.gold);
      // Cặp sừng rồng vuốt ngược ra sau
      stoneB.addLimb(
        new THREE.Vector3(rx - 0.06, 0.46, bz + 3.92),
        new THREE.Vector3(rx - 0.06, 0.6, bz + 3.62),
        0.035,
        0.012,
        4,
        PALETTE.whiteMarble,
      );
      stoneB.addLimb(
        new THREE.Vector3(rx + 0.06, 0.46, bz + 3.92),
        new THREE.Vector3(rx + 0.06, 0.6, bz + 3.62),
        0.035,
        0.012,
        4,
        PALETTE.whiteMarble,
      );
    }

    // 1.4 Hệ Lan can đá & Trụ đá đỉnh Búp Sen nở
    const lotusPosts: [number, number][] = [
      // 4 góc bệ nền
      [bx - 2.65, bz - 2.65],
      [bx + 2.65, bz - 2.65],
      [bx - 2.65, bz + 2.65],
      [bx + 2.65, bz + 2.65],
      // Cạnh sau
      [bx - 1.76, bz - 2.65],
      [bx - 0.88, bz - 2.65],
      [bx, bz - 2.65],
      [bx + 0.88, bz - 2.65],
      [bx + 1.76, bz - 2.65],
      // Cạnh trái
      [bx - 2.65, bz - 1.76],
      [bx - 2.65, bz - 0.88],
      [bx - 2.65, bz],
      [bx - 2.65, bz + 0.88],
      [bx - 2.65, bz + 1.76],
      // Cạnh phải
      [bx + 2.65, bz - 1.76],
      [bx + 2.65, bz - 0.88],
      [bx + 2.65, bz],
      [bx + 2.65, bz + 0.88],
      [bx + 2.65, bz + 1.76],
      // Cạnh trước (chừa lối vào thang giữa)
      [bx - 1.82, bz + 2.65],
      [bx - 1.05, bz + 2.65],
      [bx + 1.05, bz + 2.65],
      [bx + 1.82, bz + 2.65],
    ];

    // Vẽ từng trụ đá đỉnh búp sen nở
    for (const [px, pz] of lotusPosts) {
      // Thân trụ vuông đá
      stoneB.addBox(
        px - 0.12,
        0.64,
        pz - 0.12,
        px + 0.12,
        1.12,
        pz + 0.12,
        PALETTE.stoneDark,
      );
      // Gờ phào đệm đỉnh trụ
      stoneB.addBox(
        px - 0.14,
        1.12,
        pz - 0.14,
        px + 0.14,
        1.16,
        pz + 0.14,
        PALETTE.stoneLight,
      );
      // Đĩa đài sen
      stoneB.addCylinder(px, pz, 1.16, 1.22, 0.11, 0.13, 8, PALETTE.stoneLight);
      // Búp sen đá cẩm thạch trắng
      stoneB.addCylinder(
        px,
        pz,
        1.22,
        1.32,
        0.13,
        0.09,
        8,
        PALETTE.whiteMarble,
      );
      stoneB.addCylinder(
        px,
        pz,
        1.32,
        1.44,
        0.09,
        0.015,
        8,
        PALETTE.whiteMarble,
      );
    }

    // Các dải gờ chân, tay vịn và con tiện đá giữa các trụ
    // Cạnh sau
    stoneB.addBox(
      bx - 2.65,
      0.64,
      bz - 2.7,
      bx + 2.65,
      0.71,
      bz - 2.6,
      PALETTE.stoneDark,
    );
    stoneB.addBox(
      bx - 2.65,
      1.03,
      bz - 2.7,
      bx + 2.65,
      1.1,
      bz - 2.6,
      PALETTE.stone,
    );
    for (let x = bx - 2.5; x <= bx + 2.5; x += 0.22) {
      stoneB.addCylinder(
        x,
        bz - 2.65,
        0.71,
        1.03,
        0.035,
        0.035,
        6,
        PALETTE.stoneLight,
      );
    }
    // Cạnh trái
    stoneB.addBox(
      bx - 2.7,
      0.64,
      bz - 2.65,
      bx - 2.6,
      0.71,
      bz + 2.65,
      PALETTE.stoneDark,
    );
    stoneB.addBox(
      bx - 2.7,
      1.03,
      bz - 2.65,
      bx - 2.6,
      1.1,
      bz + 2.65,
      PALETTE.stone,
    );
    for (let z = bz - 2.5; z <= bz + 2.5; z += 0.22) {
      stoneB.addCylinder(
        bx - 2.65,
        z,
        0.71,
        1.03,
        0.035,
        0.035,
        6,
        PALETTE.stoneLight,
      );
    }
    // Cạnh phải
    stoneB.addBox(
      bx + 2.6,
      0.64,
      bz - 2.65,
      bx + 2.7,
      0.71,
      bz + 2.65,
      PALETTE.stoneDark,
    );
    stoneB.addBox(
      bx + 2.6,
      1.03,
      bz - 2.65,
      bx + 2.7,
      1.1,
      bz + 2.65,
      PALETTE.stone,
    );
    for (let z = bz - 2.5; z <= bz + 2.5; z += 0.22) {
      stoneB.addCylinder(
        bx + 2.65,
        z,
        0.71,
        1.03,
        0.035,
        0.035,
        6,
        PALETTE.stoneLight,
      );
    }
    // Cạnh trước trái
    stoneB.addBox(
      bx - 2.65,
      0.64,
      bz + 2.6,
      bx - 1.05,
      0.71,
      bz + 2.7,
      PALETTE.stoneDark,
    );
    stoneB.addBox(
      bx - 2.65,
      1.03,
      bz + 2.6,
      bx - 1.05,
      1.1,
      bz + 2.7,
      PALETTE.stone,
    );
    for (let x = bx - 2.5; x <= bx - 1.15; x += 0.22) {
      stoneB.addCylinder(
        x,
        bz + 2.65,
        0.71,
        1.03,
        0.035,
        0.035,
        6,
        PALETTE.stoneLight,
      );
    }
    // Cạnh trước phải
    stoneB.addBox(
      bx + 1.05,
      0.64,
      bz + 2.6,
      bx + 2.65,
      0.71,
      bz + 2.7,
      PALETTE.stoneDark,
    );
    stoneB.addBox(
      bx + 1.05,
      1.03,
      bz + 2.6,
      bx + 2.65,
      1.1,
      bz + 2.7,
      PALETTE.stone,
    );
    for (let x = bx + 1.15; x <= bx + 2.5; x += 0.22) {
      stoneB.addCylinder(
        x,
        bz + 2.65,
        0.71,
        1.03,
        0.035,
        0.035,
        6,
        PALETTE.stoneLight,
      );
    }

    // =========================================================================
    // PHẦN 2: 4 CHÂN TẢNG ĐÁ HOA SEN & 4 CỘT GỖ LIM ĐỒ SỘ TẦNG 1
    // =========================================================================
    for (const t of [-1, 1]) {
      for (const n of [-1, 1]) {
        const px = bx + t * 1.6;
        const pz = bz + n * 1.6;

        // 1. Đế vuông chân tảng đá
        stoneB.addBox(
          px - 0.36,
          0.64,
          pz - 0.36,
          px + 0.36,
          0.74,
          pz + 0.36,
          PALETTE.stoneDark,
        );
        // 2. Thân đài sen chạm nổi 16 cánh sen ngửa nở rộ (bằng đá cẩm thạch trắng)
        stoneB.addCylinder(
          px,
          pz,
          0.74,
          0.86,
          0.34,
          0.28,
          16,
          PALETTE.whiteMarble,
        );
        // Cánh sen lật chạm nổi
        for (let a = 0; a < 8; a++) {
          const ang = (a / 8) * Math.PI * 2;
          const petalX = px + Math.cos(ang) * 0.3;
          const petalZ = pz + Math.sin(ang) * 0.3;
          stoneB.addCylinder(
            petalX,
            petalZ,
            0.75,
            0.85,
            0.06,
            0.02,
            6,
            PALETTE.whiteMarble,
          );
        }
        // 3. Cổ tảng tròn nơi chân cột gỗ cắm vào
        stoneB.addCylinder(
          px,
          pz,
          0.86,
          0.94,
          0.23,
          0.21,
          12,
          PALETTE.stoneLight,
        );

        // 4. Thân cột gỗ lim tròn vững chãi
        woodB.addCylinder(px, pz, 0.94, 4.05, 0.19, 0.17, 12, woodLim);
      }
    }

    // =========================================================================
    // PHẦN 3: HỆ VÌ KÈO, KẺ GÓC, BẨY & XÀ GỖ LIM ĐỠ MÁI HẠ (CHUẨN ẢNH 3D)
    // =========================================================================
    // 3.1 Hệ xà cái (Tie beams) liên kết 4 đỉnh cột tầng 1 (y: 3.75m đến 3.98m)
    // Có đầu xà lồi (đầu dư) vươn ra khỏi cột 35cm
    woodB.addBox(
      bx - 2.05,
      3.75,
      bz - 1.75,
      bx + 2.05,
      3.98,
      bz - 1.45,
      woodLimDark,
    );
    woodB.addBox(
      bx - 2.05,
      3.75,
      bz + 1.45,
      bx + 2.05,
      3.98,
      bz + 1.75,
      woodLimDark,
    );
    woodB.addBox(
      bx - 1.75,
      3.75,
      bz - 2.05,
      bx - 1.45,
      3.98,
      bz + 2.05,
      woodLimDark,
    );
    woodB.addBox(
      bx + 1.45,
      3.75,
      bz - 2.05,
      bx + 1.75,
      3.98,
      bz + 2.05,
      woodLimDark,
    );

    // Xà gồ đỡ xích treo chuông ở tâm trần tầng 1
    woodB.addBox(
      bx - 1.6,
      3.82,
      bz - 0.14,
      bx + 1.6,
      4.02,
      bz + 0.14,
      woodLimDark,
    );
    woodB.addBox(
      bx - 0.14,
      3.82,
      bz - 1.6,
      bx + 0.14,
      4.02,
      bz + 1.6,
      woodLimDark,
    );

    // 3.2 4 Kẻ góc (Diagonal cantilever rafters): Dầm gỗ cong vươn từ đầu 4 cột ra 4 góc mái hạ
    for (const t of [-1, 1]) {
      for (const n of [-1, 1]) {
        const colHead = new THREE.Vector3(bx + t * 1.55, 3.75, bz + n * 1.55);
        const midRafter = new THREE.Vector3(bx + t * 2.35, 3.52, bz + n * 2.35);
        const eaveTip = new THREE.Vector3(bx + t * 3.08, 3.48, bz + n * 3.08);

        // Đoạn trong dốc thoải
        woodB.addLimb(colHead, midRafter, 0.16, 0.12, 6, woodLimLight);
        // Đoạn ngoài vuốt vươn đỡ góc đao
        woodB.addLimb(midRafter, eaveTip, 0.12, 0.09, 6, woodLimLight);

        // Mũi ngàm kẻ góc đỡ mép tàu mái
        woodB.addCylinder(
          eaveTip.x,
          eaveTip.z,
          eaveTip.y - 0.08,
          eaveTip.y + 0.05,
          0.1,
          0.1,
          8,
          woodLimLight,
        );
      }
    }

    // 3.3 4 Bẩy giữa vươn từ xà ra giữa 4 cạnh vạt mái
    woodB.addLimb(
      new THREE.Vector3(bx, 3.75, bz - 1.6),
      new THREE.Vector3(bx, 3.52, bz - 2.85),
      0.12,
      0.08,
      6,
      woodLimLight,
    );
    woodB.addLimb(
      new THREE.Vector3(bx, 3.75, bz + 1.6),
      new THREE.Vector3(bx, 3.52, bz + 2.85),
      0.12,
      0.08,
      6,
      woodLimLight,
    );
    woodB.addLimb(
      new THREE.Vector3(bx - 1.6, 3.75, bz),
      new THREE.Vector3(bx - 2.85, 3.52, bz),
      0.12,
      0.08,
      6,
      woodLimLight,
    );
    woodB.addLimb(
      new THREE.Vector3(bx + 1.6, 3.75, bz),
      new THREE.Vector3(bx + 2.85, 3.52, bz),
      0.12,
      0.08,
      6,
      woodLimLight,
    );

    // 3.4 Khung đòn tay viền quanh mép mái dưới (Fascia beam rim) và hàng rui mè gỗ
    const rimY = 3.5;
    woodB.addBox(
      bx - 2.95,
      rimY,
      bz - 2.95,
      bx + 2.95,
      rimY + 0.08,
      bz - 2.85,
      woodLimDark,
    );
    woodB.addBox(
      bx - 2.95,
      rimY,
      bz + 2.85,
      bx + 2.95,
      rimY + 0.08,
      bz + 2.95,
      woodLimDark,
    );
    woodB.addBox(
      bx - 2.95,
      rimY,
      bz - 2.95,
      bx - 2.85,
      rimY + 0.08,
      bz + 2.95,
      woodLimDark,
    );
    woodB.addBox(
      bx + 2.85,
      rimY,
      bz - 2.95,
      bx + 2.95,
      rimY + 0.08,
      bz + 2.95,
      woodLimDark,
    );

    // Hàng rui mè gỗ exposed nhô ra dưới diềm mái
    for (let p = -2.7; p <= 2.7; p += 0.28) {
      woodB.addBox(
        bx + p - 0.03,
        rimY - 0.04,
        bz - 2.92,
        bx + p + 0.03,
        rimY,
        bz - 2.75,
        woodLimLight,
      );
      woodB.addBox(
        bx + p - 0.03,
        rimY - 0.04,
        bz + 2.75,
        bx + p + 0.03,
        rimY,
        bz + 2.92,
        woodLimLight,
      );
      woodB.addBox(
        bx - 2.92,
        rimY - 0.04,
        bz + p - 0.03,
        bx - 2.75,
        rimY,
        bz + p + 0.03,
        woodLimLight,
      );
      woodB.addBox(
        bx + 2.75,
        rimY - 0.04,
        bz + p - 0.03,
        bx + 2.92,
        rimY,
        bz + p + 0.03,
        woodLimLight,
      );
    }

    // =========================================================================
    // PHẦN 4: QUẢ ĐẠI HỒNG CHUNG BẰNG ĐỒNG CỔ & CHÀY KÌNH (TẠI TÂM TẦNG 1)
    // =========================================================================
    // 4.1 Quai chuông hình Rồng Bồ Lao (Dragon crown loop)
    bronzeB.addCylinder(bx, bz, 3.18, 3.46, 0.22, 0.16, 12, bronzeCol);
    // 2 Quai vòm rồng uốn cong
    bronzeB.addLimb(
      new THREE.Vector3(bx - 0.15, 3.22, bz),
      new THREE.Vector3(bx, 3.52, bz),
      0.065,
      0.05,
      6,
      bronzeHighlight,
    );
    bronzeB.addLimb(
      new THREE.Vector3(bx + 0.15, 3.22, bz),
      new THREE.Vector3(bx, 3.52, bz),
      0.065,
      0.05,
      6,
      bronzeHighlight,
    );

    // 4.2 Hai sợi xích sắt song song treo quả chuông lên xà mái trần
    bronzeB.addCylinder(bx - 0.08, bz, 3.48, 3.84, 0.025, 0.025, 6, ironChain);
    bronzeB.addCylinder(bx + 0.08, bz, 3.48, 3.84, 0.025, 0.025, 6, ironChain);

    // 4.3 Thân Đại Hồng Chung (Từ y: 1.35m đến 3.18m)
    // Vai chuông cong vòm với băng cánh sen úp
    bronzeB.addCylinder(bx, bz, 2.92, 3.18, 0.44, 0.28, 18, bronzeCol);
    bronzeB.addCylinder(bx, bz, 2.96, 3.02, 0.46, 0.46, 18, bronzeHighlight);

    // Thân trên có 4 ô minh văn khắc chữ Hán/Kinh Phật
    bronzeB.addCylinder(bx, bz, 2.25, 2.92, 0.52, 0.44, 18, bronzeCol);
    // Băng gờ phân cách các ô minh văn
    bronzeB.addCylinder(bx, bz, 2.56, 2.62, 0.5, 0.5, 18, bronzeHighlight);

    // Thân giữa với 4 núm gõ chuông (Bell strike bosses)
    bronzeB.addCylinder(bx, bz, 1.85, 2.25, 0.58, 0.52, 18, bronzeCol);
    for (const [nx, nz] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ]) {
      const bossX = bx + nx * 0.55;
      const bossZ = bz + nz * 0.55;
      bronzeB.addCylinder(
        bossX,
        bossZ,
        2.0,
        2.1,
        0.08,
        0.04,
        8,
        bronzeHighlight,
      );
    }

    // Miệng chuông loe rộng cánh sen rủ (Flared mouth rim)
    bronzeB.addCylinder(bx, bz, 1.48, 1.85, 0.65, 0.58, 18, bronzeCol);
    bronzeB.addCylinder(bx, bz, 1.35, 1.48, 0.68, 0.65, 18, bronzeHighlight);

    // 4.4 CHÀY KÌNH (DÙI GỖ ĐẤM CHUÔNG) TREO NẰM NGANG BẰNG 2 SỢI XÍCH SẮT
    const strikerX = bx + 0.88;
    const strikerY = 2.05;
    // Thân khúc gỗ tròn nằm ngang
    woodB.addLimb(
      new THREE.Vector3(strikerX, strikerY, bz - 0.45),
      new THREE.Vector3(strikerX, strikerY, bz + 0.45),
      0.085,
      0.085,
      8,
      woodLimDark,
    );
    // Hai chỏm bo tròn 2 đầu chày
    woodB.addCylinder(
      strikerX,
      bz - 0.45,
      strikerY - 0.08,
      strikerY + 0.08,
      0.085,
      0.03,
      8,
      woodLimLight,
    );
    woodB.addCylinder(
      strikerX,
      bz + 0.45,
      strikerY - 0.08,
      strikerY + 0.08,
      0.085,
      0.03,
      8,
      woodLimLight,
    );

    // 2 Đai đồng bọc cố định dùi gắn khoen xích
    bronzeB.addCylinder(
      strikerX,
      bz - 0.28,
      strikerY - 0.09,
      strikerY + 0.09,
      0.092,
      0.092,
      8,
      bronzeHighlight,
    );
    bronzeB.addCylinder(
      strikerX,
      bz + 0.28,
      strikerY - 0.09,
      strikerY + 0.09,
      0.092,
      0.092,
      8,
      bronzeHighlight,
    );

    // 2 Sợi xích sắt song song treo dùi từ xà trần (y: 3.82) xuống khoen chày (y: 2.05)
    bronzeB.addCylinder(
      strikerX,
      bz - 0.28,
      strikerY,
      3.82,
      0.014,
      0.014,
      4,
      ironChain,
    );
    bronzeB.addCylinder(
      strikerX,
      bz + 0.28,
      strikerY,
      3.82,
      0.014,
      0.014,
      4,
      ironChain,
    );

    // =========================================================================
    // PHẦN 5: TẦNG MÁI HẠ (TẦNG 1) VỚI 4 ĐẦU ĐAO VÂN MÂY ĐÁ XÁM TRẮNG
    // =========================================================================
    roofB.addCurvedRoofTier(
      {
        cx: bx,
        cz: bz,
        baseY: 3.55,
        A: 3.25,
        B: 3.25,
        Rx: 1.48,
        Rz: 1.48,
        H: 0.88,
        power: 1.45,
        curl: 0.22,
        flare: 0.18,
        sag: 0.05,
        thickness: 0.18,
        tileColor: new THREE.Color(0xa25238), // Ngói nung terracotta ấm áp
        ridgeColor: new THREE.Color(0xdad5cb), // Sống ngói đắp vữa đá xám trắng
        mossAmount: 0.7,
        horns: false,
        hasDragons: false,
        cloudFinials: true, // 4 Đầu đao vân mây xám trắng tầng 1
        stoneFinialsBuilder: stoneB,
      },
      goldB,
    );

    // =========================================================================
    // PHẦN 6: TẦNG CỔ DIÊM (TẦNG 2) & HỆ LAN CAN GỖ CHẤN SONG
    // =========================================================================
    // Sàn gỗ cổ lầu tầng 2 (y: 4.40m đến 4.52m)
    woodB.addBox(
      bx - 1.48,
      4.4,
      bz - 1.48,
      bx + 1.48,
      4.52,
      bz + 1.48,
      woodLimDark,
    );

    // Lan can tay vịn gỗ lim tầng 2
    const baseRailY = 4.54;
    const railY = 4.96;
    // Gờ tay vịn 4 cạnh
    woodB.addBox(
      bx - 1.44,
      railY,
      bz - 1.44,
      bx + 1.44,
      railY + 0.05,
      bz - 1.38,
      woodLimDark,
    );
    woodB.addBox(
      bx - 1.44,
      railY,
      bz + 1.38,
      bx + 1.44,
      railY + 0.05,
      bz + 1.44,
      woodLimDark,
    );
    woodB.addBox(
      bx - 1.44,
      railY,
      bz - 1.44,
      bx - 1.38,
      railY + 0.05,
      bz + 1.44,
      woodLimDark,
    );
    woodB.addBox(
      bx + 1.38,
      railY,
      bz - 1.44,
      bx + 1.44,
      railY + 0.05,
      bz + 1.44,
      woodLimDark,
    );

    // Gờ chân lan can
    woodB.addBox(
      bx - 1.44,
      baseRailY,
      bz - 1.44,
      bx + 1.44,
      baseRailY + 0.04,
      bz - 1.38,
      woodLimDark,
    );
    woodB.addBox(
      bx - 1.44,
      baseRailY,
      bz + 1.38,
      bx + 1.44,
      baseRailY + 0.04,
      bz + 1.44,
      woodLimDark,
    );
    woodB.addBox(
      bx - 1.44,
      baseRailY,
      bz - 1.44,
      bx - 1.38,
      baseRailY + 0.04,
      bz + 1.44,
      woodLimDark,
    );
    woodB.addBox(
      bx + 1.38,
      baseRailY,
      bz - 1.44,
      bx + 1.44,
      baseRailY + 0.04,
      bz + 1.44,
      woodLimDark,
    );

    // Hàng con tiện gỗ tiện tròn
    for (let pos = -1.3; pos <= 1.3; pos += 0.26) {
      woodB.addCylinder(
        bx + pos,
        bz - 1.41,
        baseRailY + 0.04,
        railY,
        0.022,
        0.022,
        6,
        woodLim,
      );
      woodB.addCylinder(
        bx + pos,
        bz + 1.41,
        baseRailY + 0.04,
        railY,
        0.022,
        0.022,
        6,
        woodLim,
      );
      woodB.addCylinder(
        bx - 1.41,
        bz + pos,
        baseRailY + 0.04,
        railY,
        0.022,
        0.022,
        6,
        woodLim,
      );
      woodB.addCylinder(
        bx + 1.41,
        bz + pos,
        baseRailY + 0.04,
        railY,
        0.022,
        0.022,
        6,
        woodLim,
      );
    }

    // 4 Cột gỗ lim tầng 2 đỡ mái thượng (y: 4.52m đến 5.75m)
    for (const e of [-1, 1]) {
      for (const t of [-1, 1]) {
        const cx = bx + e * 1.08;
        const cz = bz + t * 1.08;
        woodB.addCylinder(cx, cz, 4.52, 5.75, 0.13, 0.11, 10, woodLim);

        // Kẻ góc tầng 2 vươn ra đỡ 4 góc mái thượng
        woodB.addLimb(
          new THREE.Vector3(cx, 5.62, cz),
          new THREE.Vector3(cx + e * 0.75, 5.82, cz + t * 0.75),
          0.09,
          0.05,
          5,
          woodLim,
        );
      }
    }

    // Xà giằng trên đầu 4 cột tầng 2 (y: 5.58m đến 5.75m)
    woodB.addBox(
      bx - 1.25,
      5.58,
      bz - 1.15,
      bx + 1.25,
      5.75,
      bz - 1.02,
      woodLimDark,
    );
    woodB.addBox(
      bx - 1.25,
      5.58,
      bz + 1.02,
      bx + 1.25,
      5.75,
      bz + 1.25,
      woodLimDark,
    );
    woodB.addBox(
      bx - 1.15,
      5.58,
      bz - 1.25,
      bx - 1.02,
      5.75,
      bz + 1.25,
      woodLimDark,
    );
    woodB.addBox(
      bx + 1.02,
      5.58,
      bz - 1.25,
      bx + 1.25,
      5.75,
      bz + 1.25,
      woodLimDark,
    );

    // =========================================================================
    // PHẦN 7: TẦNG MÁI THƯỢNG (TẦNG 2) VỚI 4 ĐẦU ĐAO VÂN MÂY & BÌNH HỒ LÔ KIM THU LÔI
    // =========================================================================
    roofB.addCurvedRoofTier(
      {
        cx: bx,
        cz: bz,
        baseY: 5.75,
        A: 2.5,
        B: 2.5,
        Rx: 0.0,
        Rz: 0.0,
        H: 1.35,
        power: 1.48,
        curl: 0.24,
        flare: 0.18,
        sag: 0.04,
        thickness: 0.16,
        tileColor: new THREE.Color(0xa8563c),
        ridgeColor: new THREE.Color(0xdad5cb),
        mossAmount: 0.6,
        horns: false,
        hasDragons: false,
        cloudFinials: true, // 4 Đầu đao vân mây xám trắng tầng 2
        stoneFinialsBuilder: stoneB,
      },
      goldB,
    );

    this.colliders.push({
      minX: bx - 2.5,
      maxX: bx + 2.5,
      minZ: bz - 2.5,
      maxZ: bz + 2.5,
    });

    const sGeom = stoneB.build();
    if (sGeom) {
      const mesh = new THREE.Mesh(sGeom, this.stoneMat);
      mesh.receiveShadow = true;
      mesh.matrixAutoUpdate = false;
      this.root.add(mesh);
    }

    const wGeom = woodB.build();
    if (wGeom) {
      const mesh = new THREE.Mesh(wGeom, this.woodMat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.matrixAutoUpdate = false;
      this.root.add(mesh);
    }

    const gGeom = goldB.build();
    if (gGeom) {
      const mesh = new THREE.Mesh(gGeom, this.goldMat);
      mesh.castShadow = true;
      mesh.matrixAutoUpdate = false;
      this.root.add(mesh);
    }

    // Mesh Đại Hồng Chung bằng đồng thanh đúc cổ (không bị neon chói)
    const bGeom = bronzeB.build();
    if (bGeom) {
      const bronzeMat = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.42,
        metalness: 0.78,
      });
      const mesh = new THREE.Mesh(bGeom, bronzeMat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.matrixAutoUpdate = false;
      this.root.add(mesh);
    }

    const rGeom = roofB.build();
    if (rGeom) {
      const mesh = new THREE.Mesh(rGeom, this.roofMat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.matrixAutoUpdate = false;
      this.root.add(mesh);
    }
  }

  /**
   * 9. Khu Vườn Tượng Phật Bà Quán Thế Âm Bồ Tát tại (x: -28, z: -18.5)
   */
  private buildQuanAmGarden(): void {
    const b = new GeometryBuilder();
    const sx = -28.0,
      sz = -18.5;

    // Bệ hoa sen đá trắng
    b.addCylinder(sx, sz, 0.0, 0.8, 2.2, 1.8, 16, PALETTE.stoneLight);
    b.addCylinder(sx, sz, 0.8, 1.3, 1.9, 1.5, 16, PALETTE.whiteMarble);

    // Tượng Quán Thế Âm Bồ Tát bằng đá trắng thanh khiết
    b.addCylinder(sx, sz, 1.3, 3.6, 0.7, 0.45, 12, PALETTE.whiteMarble); // Thân áo trắng
    b.addCylinder(sx, sz, 3.6, 4.3, 0.28, 0.24, 10, PALETTE.whiteMarble); // Đầu & Khăn phủ
    b.addCylinder(
      sx + 0.35,
      sz + 0.3,
      2.2,
      2.8,
      0.08,
      0.04,
      6,
      PALETTE.whiteMarble,
    ); // Bình cam lộ

    // Khóm trúc xanh quanh vườn tượng
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const bx = sx + Math.cos(a) * 3.4;
      const bz = sz + Math.sin(a) * 3.4;
      b.addCylinder(bx, bz, 0, 4.2, 0.08, 0.06, 6, PALETTE.bamboo);
    }

    this.colliders.push({
      minX: sx - 3.6,
      maxX: sx + 3.6,
      minZ: sz - 3.6,
      maxZ: sz + 3.6,
    });

    const geom = b.build();
    if (geom) {
      const mat = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.4,
        metalness: 0.1,
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.matrixAutoUpdate = false;
      this.root.add(mesh);
    }
  }

  /**
   * 10. Bể Nước Thanh Tịnh / Giếng Chùa tại (x: 29, z: -10)
   */
  private buildPureBasin(): void {
    const b = new GeometryBuilder();
    const bx = 29.0,
      bz = -10.0;

    // Bể đá tròn
    b.addCylinder(bx, bz, 0, 0.9, 1.8, 1.7, 16, PALETTE.stone);
    // Lòng nước trong veo
    b.addCylinder(bx, bz, 0.7, 0.85, 1.45, 1.45, 16, PALETTE.water);

    this.colliders.push({
      minX: bx - 2.0,
      maxX: bx + 2.0,
      minZ: bz - 2.0,
      maxZ: bz + 2.0,
    });

    const geom = b.build();
    if (geom) {
      const mat = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.4,
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.castShadow = true;
      mesh.matrixAutoUpdate = false;
      this.root.add(mesh);
    }
  }

  /**
   * 11. Đèn Đá Hoa Sen Sân Chùa (Procedural Lotus Stone Lanterns)
   * Tái tạo chuẩn kiến trúc đèn lồng đá hoa sen Việt Nam:
   * - Chân đế giật cấp 2 tầng bát giác
   * - Vòng 8 cánh sen 3D nở ôm lấy chân đế
   * - Trụ đá thon ở giữa có gờ đai
   * - Bát sen trên với 6 cánh xòe ra đỡ buồng đèn
   * - Buồng sáng phát quang tự động đồng bộ shader ngày/đêm
   * - Mái đá nón bát giác uốn cong xòe rộng và đỉnh búp sen
   */
  private buildStoneLanterns(): void {
    const b = new GeometryBuilder();
    const glowBuilder = new GeometryBuilder();

    const lanternCoords: [number, number][] = [
      [-4.5, 6],
      [4.5, 6],
      [-4.5, 14],
      [4.5, 14],
      [-4.5, 22],
      [4.5, 22],
      [-6.5, -4],
      [6.5, -4],
      [-10.5, 2],
      [10.5, 2],
      [-14.5, 8],
      [21.5, 8.5],
    ];

    for (const [lx, lz] of lanternCoords) {
      // 1. Đế đá 2 tầng giật cấp bát giác
      b.addCylinder(lx, lz, 0.08, 0.22, 0.44, 0.42, 8, PALETTE.stoneDark);
      b.addCylinder(lx, lz, 0.22, 0.35, 0.36, 0.32, 8, PALETTE.stone);

      // 2. Vòng 8 cánh sen nổi 3D ôm quanh chân đế
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        b.addPetal(
          lx,
          0.33,
          lz,
          angle,
          0.26,
          0.26,
          0.16,
          0.035,
          PALETTE.stoneLight,
        );
      }

      // 3. Thân trụ đá thon ở giữa
      b.addCylinder(lx, lz, 0.35, 1.18, 0.17, 0.14, 8, PALETTE.stone);
      // Gờ đai đá thắt ngang thân trụ
      b.addCylinder(lx, lz, 0.72, 0.78, 0.185, 0.185, 8, PALETTE.stoneDark);

      // 4. Bát sen trên đỡ buồng đèn
      b.addCylinder(lx, lz, 1.18, 1.26, 0.16, 0.28, 8, PALETTE.stone);
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        b.addPetal(
          lx,
          1.25,
          lz,
          angle,
          0.42,
          0.22,
          0.14,
          0.03,
          PALETTE.stoneLight,
        );
      }

      // 5. Buồng đèn đá: Nan chắn bảo vệ 4 góc
      const postRadius = 0.22;
      const postThick = 0.035;
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
        const px = lx + Math.cos(a) * postRadius;
        const pz = lz + Math.sin(a) * postRadius;
        b.addBox(
          px - postThick,
          1.26,
          pz - postThick,
          px + postThick,
          1.74,
          pz + postThick,
          PALETTE.stoneDark,
        );
      }

      // 6. Buồng phát sáng ngọn đèn ấm (Glow Chamber)
      glowBuilder.addCylinder(
        lx,
        lz,
        1.28,
        1.72,
        0.16,
        0.16,
        8,
        new THREE.Color(0xffdf77),
      );

      // 7. Mái che đèn đá nón bát giác xòe rộng
      b.addCylinder(lx, lz, 1.74, 1.94, 0.45, 0.18, 8, PALETTE.stone);
      // Đỉnh búp sen đá trên nóc đèn
      b.addCylinder(lx, lz, 1.94, 2.14, 0.09, 0.015, 8, PALETTE.stoneLight);

      // Va chạm hình trụ tròn êm ái
      this.colliders.push({
        cx: lx,
        cz: lz,
        radius: 0.46,
      });
    }

    // Dựng Mesh đá
    const stoneGeom = b.build();
    if (stoneGeom) {
      const stoneMesh = new THREE.Mesh(stoneGeom, this.stoneMat);
      stoneMesh.castShadow = true;
      stoneMesh.receiveShadow = true;
      stoneMesh.matrixAutoUpdate = false;
      this.root.add(stoneMesh);
    }

    // Dựng Mesh buồng sáng phát quang (Glow Mesh)
    const glowGeom = glowBuilder.build();
    if (glowGeom) {
      this.glowMesh = new THREE.Mesh(glowGeom, this.glowMat);
      this.glowMesh.matrixAutoUpdate = false;
      this.glowMesh.frustumCulled = false;
      this.root.add(this.glowMesh);
    }
  }
}
