import * as THREE from "three";
import { GeometryBuilder } from "./geometryBuilder.ts";

export interface CampusCollider {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
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

export class Campus {
  public root: THREE.Group = new THREE.Group();
  public colliders: CampusCollider[] = [];
  public seats: CushionSeat[] = [];

  constructor() {
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
    const b = new GeometryBuilder();
    const gz = 52.5;

    // 4 trụ cổng tam quan
    const gatePillars = [-5.2, -1.8, 1.8, 5.2];
    for (const px of gatePillars) {
      b.addBox(
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
    b.addBox(-5.5, 4.6, gz - 0.5, 5.5, 5.2, gz + 0.5, PALETTE.woodDark);

    // Mái cổng chính và 2 mái phụ
    b.addCurvedRoof(0, 5.2, gz, 5.5, 3.2, 1.6, 0.8, 6, PALETTE.tileWarm);
    b.addCurvedRoof(-3.5, 4.2, gz, 3.2, 2.6, 1.2, 0.6, 5, PALETTE.tileDark);
    b.addCurvedRoof(3.5, 4.2, gz, 3.2, 2.6, 1.2, 0.6, 5, PALETTE.tileDark);

    const geom = b.build();
    if (geom) {
      const mat = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.7,
      });
      const mesh = new THREE.Mesh(geom, mat);
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
    const b = new GeometryBuilder();
    const bx0 = -10.6,
      bx1 = 10.6,
      bz0 = -23.4,
      bz1 = -8.2,
      by = 0.8;

    // Bệ đá tam cấp chánh điện cao 0.8m
    b.addBox(bx0, 0, bz0, bx1, by, bz1, PALETTE.stoneDark);
    // Bậc tam cấp trước cửa chánh điện
    b.addBox(-3.6, 0, -8.2, 3.6, 0.3, -6.8, PALETTE.stone);
    b.addBox(-3.2, 0.3, -8.2, 3.2, 0.55, -7.4, PALETTE.stoneLight);

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
      b.addCylinder(px, pz, by, by + 0.3, 0.58, 0.48, 12, PALETTE.stoneLight);
      // Thân cột gỗ tròn thuôn
      b.addCylinder(
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
      b.addCylinder(
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
    b.addBox(
      -9.8,
      by + pillarTop,
      -22.6,
      9.8,
      by + pillarTop + 0.5,
      -9.4,
      PALETTE.woodDark,
    );

    // Tường hậu và 2 bên chánh điện
    b.addBox(-9.6, by, -22.6, 9.6, by + 5.5, -22.0, PALETTE.woodDark); // Tường hậu
    b.addBox(-9.8, by, -22.6, -9.2, by + 5.5, -9.6, PALETTE.woodDark); // Tường tây
    b.addBox(9.2, by, -22.6, 9.8, by + 5.5, -9.6, PALETTE.woodDark); // Tường đông
    this.colliders.push({ minX: -10.2, maxX: 10.2, minZ: -23.0, maxZ: -21.8 });
    this.colliders.push({ minX: -10.2, maxX: -8.8, minZ: -22.6, maxZ: -9.4 });
    this.colliders.push({ minX: 8.8, maxX: 10.2, minZ: -22.6, maxZ: -9.4 });

    // Tầng Mái 1 (Mái hạ xòe rộng 4 hướng)
    const roof1Y = by + 6.75;
    b.addCurvedRoof(
      0,
      roof1Y,
      -16.0,
      22.0,
      16.0,
      3.6,
      2.2,
      10,
      PALETTE.tileWarm,
    );

    // Cổ diêm thông sáng giữa 2 tầng mái với chấn song gỗ
    b.addBox(
      -7.5,
      roof1Y + 2.8,
      -19.5,
      7.5,
      roof1Y + 5.4,
      -12.5,
      PALETTE.woodDark,
    );

    // Tầng Mái 2 (Mái thượng đỉnh nóc uy nghiêm)
    const roof2Y = roof1Y + 5.2;
    b.addCurvedRoof(
      0,
      roof2Y,
      -16.0,
      16.0,
      11.5,
      3.2,
      1.8,
      8,
      PALETTE.tileWarm,
    );

    // Bờ nóc & Kìm nóc đỉnh mái
    b.addBox(
      -7.0,
      roof2Y + 3.1,
      -16.2,
      7.0,
      roof2Y + 3.6,
      -15.8,
      PALETTE.tileDark,
    );

    // 5. Nội điện: Tượng Đức Phật Thích Ca Mâu Ni & 2 Tôn Giả
    this.buildBuddhaAltar(b, 0, by, -20.3);

    // 6. Đại Hồng Chung (Chuông) và Trống/Mõ lớn tại (5.25, -18)
    this.buildHallBellAndMo(b, 5.25, by, -18.0);

    // 7. Hàng bồ đoàn thiền tọa
    this.buildCushionRows();

    const geom = b.build();
    if (geom) {
      const mat = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.65,
        metalness: 0.15,
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.matrixAutoUpdate = false;
      this.root.add(mesh);
    }
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
   * 7. Cây Bồ Đề Đại Thụ và Chòi Tĩnh Tâm tại (x: -15.6, z: 7)
   */
  private buildBodhiTree(): void {
    const b = new GeometryBuilder();
    const tx = -15.6,
      tz = 7.0;

    // Gốc cây Bồ đề cổ thụ vững chãi
    b.addCylinder(tx, tz, 0.08, 3.8, 1.4, 0.9, 12, PALETTE.woodDark);

    // Tán lá Bồ đề xanh mướt nhiều tầng rợp mát
    b.addCylinder(tx, tz, 3.5, 6.2, 3.8, 2.6, 14, PALETTE.leaf);
    b.addCylinder(tx, tz, 5.8, 8.4, 2.8, 1.2, 12, PALETTE.leaf);

    // Băng ghế đá tròn quanh gốc cây để thiền tọa
    const benchR = 2.4;
    b.addCylinder(
      tx,
      tz,
      0.08,
      0.5,
      benchR + 0.5,
      benchR,
      16,
      PALETTE.stoneLight,
    );

    this.colliders.push({
      minX: tx - 2.8,
      maxX: tx + 2.8,
      minZ: tz - 2.8,
      maxZ: tz + 2.8,
    });

    const geom = b.build();
    if (geom) {
      const mat = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.8,
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.matrixAutoUpdate = false;
      this.root.add(mesh);
    }
  }

  /**
   * 8. Tháp Chuông Bát Giác Cổ Kính tại (x: 15.5, z: 4)
   */
  private buildBellTower(): void {
    const b = new GeometryBuilder();
    const bx = 15.5,
      bz = 4.0;

    // Bệ tháp chuông bát giác đá cao 0.6m
    b.addCylinder(bx, bz, 0.08, 0.68, 3.2, 3.0, 8, PALETTE.stone);

    // 8 cột gỗ lầu chuông
    const colR = 2.4;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const cx = bx + Math.cos(a) * colR;
      const cz = bz + Math.sin(a) * colR;
      b.addCylinder(cx, cz, 0.68, 5.2, 0.28, 0.22, 8, PALETTE.wood);
    }

    // Quả Đại Hồng Chung bằng đồng treo ở giữa lầu
    b.addCylinder(bx, bz, 2.8, 4.2, 0.65, 0.4, 12, PALETTE.bronze);

    // Mái ngói tháp chuông bát giác vuốt cong
    b.addCylinder(bx, bz, 5.2, 7.4, 4.2, 0.4, 8, PALETTE.tileDark);

    this.colliders.push({
      minX: bx - 3.2,
      maxX: bx + 3.2,
      minZ: bz - 3.2,
      maxZ: bz + 3.2,
    });

    const geom = b.build();
    if (geom) {
      const mat = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.6,
      });
      const mesh = new THREE.Mesh(geom, mat);
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
   * 11. Đèn Đá Sân Chùa (Stone Lanterns) dọc lối đi
   */
  private buildStoneLanterns(): void {
    const b = new GeometryBuilder();
    const lanternCoords: [number, number][] = [
      [-4.5, 6],
      [4.5, 6],
      [-4.5, 14],
      [4.5, 14],
      [-4.5, 22],
      [4.5, 22],
      [-6.5, -4],
      [6.5, -4],
    ];

    for (const [lx, lz] of lanternCoords) {
      // Chân đèn
      b.addBox(
        lx - 0.35,
        0.08,
        lz - 0.35,
        lx + 0.35,
        0.4,
        lz + 0.35,
        PALETTE.stoneDark,
      );
      // Thân đèn
      b.addCylinder(lx, lz, 0.4, 1.3, 0.16, 0.14, 8, PALETTE.stone);
      // Buồng thắp nến
      b.addBox(
        lx - 0.28,
        1.3,
        lz - 0.28,
        lx + 0.28,
        1.8,
        lz + 0.28,
        PALETTE.goldLight,
      );
      // Mái che đèn đá
      b.addCylinder(lx, lz, 1.8, 2.15, 0.45, 0.08, 6, PALETTE.stoneDark);

      this.colliders.push({
        minX: lx - 0.45,
        maxX: lx + 0.45,
        minZ: lz - 0.45,
        maxZ: lz + 0.45,
      });
    }

    const geom = b.build();
    if (geom) {
      const mat = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.8,
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.castShadow = true;
      mesh.matrixAutoUpdate = false;
      this.root.add(mesh);
    }
  }
}
