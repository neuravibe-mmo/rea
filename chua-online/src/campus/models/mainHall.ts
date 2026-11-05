import * as THREE from 'three';
import { GeometryBuilder } from '../geometryBuilder.ts';
import { PALETTE } from '../palette.ts';
import type { Campus } from '../campus.ts';

/**
 * 4. Chánh Điện Toà Đại Bi (Main Hall)
 */
export function buildMainHall(campus: Campus): void {
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
      campus.colliders.push({
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
    campus.colliders.push({ minX: -10.2, maxX: 10.2, minZ: -23.0, maxZ: -21.8 });
    campus.colliders.push({ minX: -10.2, maxX: -8.8, minZ: -22.6, maxZ: -9.4 });
    campus.colliders.push({ minX: 8.8, maxX: 10.2, minZ: -22.6, maxZ: -9.4 });

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
    buildBuddhaAltar(campus, goldB, 0, by, -20.3);

    // 6. Đại Hồng Chung (Chuông) và Trống/Mõ lớn tại (5.25, -18)
    buildHallBellAndMo(campus, goldB, 5.25, by, -18.0);

    // 7. Hàng bồ đoàn thiền tọa
    buildCushionRows(campus);

    const sGeom = stoneB.build();
    if (sGeom) {
      const mesh = new THREE.Mesh(sGeom, campus.stoneMat);
      mesh.receiveShadow = true;
      mesh.matrixAutoUpdate = false;
      campus.root.add(mesh);
    }

    const wGeom = woodB.build();
    if (wGeom) {
      const mesh = new THREE.Mesh(wGeom, campus.woodMat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.matrixAutoUpdate = false;
      campus.root.add(mesh);
    }

    const rGeom = roofB.build();
    if (rGeom) {
      const mesh = new THREE.Mesh(rGeom, campus.roofMat);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      mesh.matrixAutoUpdate = false;
      campus.root.add(mesh);
    }

    const gGeom = goldB.build();
    if (gGeom) {
      const mesh = new THREE.Mesh(gGeom, campus.goldMat);
      mesh.castShadow = true;
      mesh.matrixAutoUpdate = false;
      campus.root.add(mesh);
    }

    // Bức Hoành Phi "TỪ BI HỶ XẢ" sơn son thiếp vàng treo chính giữa tiền sảnh
    const hoanhPhi = createHoanhPhiMesh(0, by + 5.75, -9.18);
    campus.root.add(hoanhPhi);
  }

  /**
   * Tạo Hoành Phi chữ Hán/Quốc ngữ "TỪ BI HỶ XẢ" sơn son thiếp vàng
   */
  function createHoanhPhiMesh(x: number, y: number, z: number): THREE.Mesh {
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
  function buildBuddhaAltar(campus: Campus, 
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

    campus.colliders.push({
      minX: cx - 4.0,
      maxX: cx + 4.0,
      minZ: cz - 1.8,
      maxZ: cz + 1.4,
    });
  }

  /**
   * Chuông đồng và Giá Mõ bên trong Chánh điện
   */
  function buildHallBellAndMo(campus: Campus, 
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

    campus.colliders.push({
      minX: x - 1.0,
      maxX: x + 1.0,
      minZ: z - 0.5,
      maxZ: z + 2.0,
    });
  }

  /**
   * Bồ đoàn nhung đỏ xếp ngay ngắn cho Phật tử ngồi thiền
   */
  function buildCushionRows(campus: Campus): void {
    const b = new GeometryBuilder();
    let seatId = 0;

    // 4 hàng bồ đoàn, mỗi hàng 6 chiếc
    for (let row = 0; row < 4; row++) {
      for (let col = -3; col <= 3; col++) {
        if (col === 0 && row < 2) continue; // Chừa lối đi chính đạo
        const sx = col * 2.1;
        const sz = -11.0 - row * 2.2;
        b.addCylinder(sx, sz, 0.8, 0.94, 0.42, 0.4, 12, PALETTE.cushion);
        campus.seats.push({ id: seatId++, x: sx, z: sz, occupied: false });
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
      campus.root.add(mesh);
    }
  }

  /**
   * 5. Đỉnh Lư Hương Đồng lớn đặt trước sân chùa (x: 0, z: -2.5)
   */