import * as THREE from 'three';
import { GeometryBuilder } from '../geometryBuilder.ts';
import { PALETTE } from '../palette.ts';
import type { Campus } from '../campus.ts';

/**
 * 8. CHÒI CHUÔNG CHÙA (BELL TOWER / PHƯƠNG ĐÌNH 2 TẦNG 8 MÁI CHỒNG DIÊM)
 */
export function buildBellTower(campus: Campus): void {
    const stoneB = new GeometryBuilder();
    const woodB = new GeometryBuilder();
    const goldB = new GeometryBuilder();
    const roofB = new GeometryBuilder();
    const bronzeB = new GeometryBuilder();
    const glowB = new GeometryBuilder();

    const bx = 15.5,
      bz = 4.0;

    // Gam màu gỗ lim ấm sáng, bóng bẩy tự nhiên (không bị tối đen)
    const woodLim = new THREE.Color(0x945831);
    const woodLimDark = new THREE.Color(0x693b1d);
    const woodLimLight = new THREE.Color(0xb26f3f);

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

    // 1.3 Lan can đá dốc phẳng hai bên bậc tam cấp (Gọn gàng, sạch sẽ, thanh tịnh)
    for (const signX of [-1, 1]) {
      const rx = bx + signX * 0.95;
      const wHalf = 0.08;
      const zTop = bz + 2.65;
      const zBot = bz + 3.86;

      // Thành bệ dốc lan can đá
      const p0 = stoneB.vert(rx + signX * wHalf, 0.0, zTop, signX, 0, 0, PALETTE.stone);
      const p1 = stoneB.vert(rx + signX * wHalf, 0.64, zTop, signX, 0, 0, PALETTE.stone);
      const p2 = stoneB.vert(rx + signX * wHalf, 0.22, zBot, signX, 0, 0, PALETTE.stone);
      const p3 = stoneB.vert(rx + signX * wHalf, 0.0, zBot, signX, 0, 0, PALETTE.stone);
      if (signX > 0) stoneB.quad(p0, p1, p2, p3);
      else stoneB.quad(p0, p3, p2, p1);

      const q0 = stoneB.vert(rx - signX * wHalf, 0.0, zTop, -signX, 0, 0, PALETTE.stone);
      const q1 = stoneB.vert(rx - signX * wHalf, 0.64, zTop, -signX, 0, 0, PALETTE.stone);
      const q2 = stoneB.vert(rx - signX * wHalf, 0.22, zBot, -signX, 0, 0, PALETTE.stone);
      const q3 = stoneB.vert(rx - signX * wHalf, 0.0, zBot, -signX, 0, 0, PALETTE.stone);
      if (signX > 0) stoneB.quad(q0, q3, q2, q1);
      else stoneB.quad(q0, q1, q2, q3);

      // Mặt dốc tay vịn đỉnh lan can
      stoneB.quad(q1, p1, p2, q2);
      // Mặt đứng đầu thềm
      stoneB.quad(q2, p2, p3, q3);

      // Trụ đá búp sen ở chân bậc thềm
      stoneB.addBox(rx - 0.1, 0.0, zBot - 0.02, rx + 0.1, 0.36, zBot + 0.18, PALETTE.stoneDark);
      stoneB.addBox(rx - 0.12, 0.36, zBot - 0.04, rx + 0.12, 0.40, zBot + 0.20, PALETTE.stoneLight);
      stoneB.addCylinder(rx, zBot + 0.08, 0.40, 0.48, 0.08, 0.04, 8, PALETTE.whiteMarble);
    }

    // =========================================================================
    // 1.4 HỆ LAN CAN ĐÁ THÔNG THOÁNG & 4 ĐÈN CHIẾU SÁNG TẠI 4 GÓC THÁP CHUÔNG
    // =========================================================================

    // A. 4 Đèn Lồng Đá Chiếu Sáng Tại 4 Góc Lan Can
    const cornerLanterns: [number, number][] = [
      [bx - 2.65, bz - 2.65],
      [bx + 2.65, bz - 2.65],
      [bx - 2.65, bz + 2.65],
      [bx + 2.65, bz + 2.65],
    ];

    for (const [px, pz] of cornerLanterns) {
      // 1. Bệ trụ đá góc lan can (0.32m x 0.32m, vững chắc bề thế)
      stoneB.addBox(
        px - 0.16,
        0.64,
        pz - 0.16,
        px + 0.16,
        1.12,
        pz + 0.16,
        PALETTE.stoneDark,
      );
      // Gờ phào đệm đỉnh bệ giật cấp
      stoneB.addBox(
        px - 0.18,
        1.12,
        pz - 0.18,
        px + 0.18,
        1.16,
        pz + 0.18,
        PALETTE.stoneLight,
      );

      // 2. Đài sen hứng đỡ buồng đèn đá
      stoneB.addCylinder(px, pz, 1.16, 1.25, 0.16, 0.26, 8, PALETTE.stone);
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        stoneB.addPetal(
          px,
          1.24,
          pz,
          angle,
          0.36,
          0.2,
          0.12,
          0.03,
          PALETTE.stoneLight,
        );
      }

      // 3. Buồng đèn đá: Khung bệ đáy, nan chắn 4 góc và gờ nóc
      stoneB.addBox(
        px - 0.16,
        1.25,
        pz - 0.16,
        px + 0.16,
        1.28,
        pz + 0.16,
        PALETTE.stoneDark,
      );
      stoneB.addBox(
        px - 0.16,
        1.62,
        pz - 0.16,
        px + 0.16,
        1.65,
        pz + 0.16,
        PALETTE.stoneDark,
      );
      for (const sx of [-1, 1]) {
        for (const sz of [-1, 1]) {
          stoneB.addBox(
            px + sx * 0.13 - 0.022,
            1.28,
            pz + sz * 0.13 - 0.022,
            px + sx * 0.13 + 0.022,
            1.62,
            pz + sz * 0.13 + 0.022,
            PALETTE.stoneDark,
          );
        }
      }

      // 4. Lõi nến phát quang ấm áp (Glow chamber)
      glowB.addCylinder(
        px,
        pz,
        1.28,
        1.62,
        0.1,
        0.1,
        8,
        new THREE.Color(0xffe077),
      );
      glowB.addCylinder(
        px,
        pz,
        1.3,
        1.58,
        0.045,
        0.04,
        6,
        new THREE.Color(0xffa526),
      );

      // 5. Mái đá uốn cong 4 góc xòe rộng thanh nhã
      stoneB.addCylinder(px, pz, 1.65, 1.77, 0.36, 0.15, 8, PALETTE.stone);
      stoneB.addCylinder(px, pz, 1.64, 1.67, 0.38, 0.35, 8, PALETTE.stoneDark);

      // 6. Đỉnh búp sen ngọc & chóp kim đồng phong thuỷ
      stoneB.addCylinder(px, pz, 1.77, 1.83, 0.08, 0.04, 8, PALETTE.stoneLight);
      stoneB.addCylinder(
        px,
        pz,
        1.83,
        1.93,
        0.05,
        0.015,
        8,
        PALETTE.whiteMarble,
      );
      goldB.addCylinder(px, pz, 1.93, 1.98, 0.015, 0.005, 6, PALETTE.gold);
    }

    // B. 8 Cột Trụ Phụ Búp Sen Lan Can (Giảm triệt để số cột, thoáng đãng nhã nhặn)
    const intermediatePosts: [number, number][] = [
      // 2 trụ cạnh sau
      [bx - 0.88, bz - 2.65],
      [bx + 0.88, bz - 2.65],
      // 2 trụ cạnh trái
      [bx - 2.65, bz - 0.88],
      [bx - 2.65, bz + 0.88],
      // 2 trụ cạnh phải
      [bx + 2.65, bz - 0.88],
      [bx + 2.65, bz + 0.88],
      // 2 trụ gối đầu bậc thang mặt trước
      [bx - 1.05, bz + 2.65],
      [bx + 1.05, bz + 2.65],
    ];

    for (const [px, pz] of intermediatePosts) {
      // Thân trụ đá vuông thon gọn
      stoneB.addBox(
        px - 0.1,
        0.64,
        pz - 0.1,
        px + 0.1,
        1.05,
        pz + 0.1,
        PALETTE.stoneDark,
      );
      // Gờ đệm đỉnh trụ
      stoneB.addBox(
        px - 0.12,
        1.05,
        pz - 0.12,
        px + 0.12,
        1.09,
        pz + 0.12,
        PALETTE.stoneLight,
      );
      // Đĩa sen đỡ búp sen
      stoneB.addCylinder(px, pz, 1.09, 1.14, 0.08, 0.1, 8, PALETTE.stoneLight);
      // Búp sen cẩm thạch trắng mềm mại (dáng tròn trịa thanh tao, không nhọn hoắt)
      stoneB.addCylinder(
        px,
        pz,
        1.14,
        1.22,
        0.1,
        0.065,
        8,
        PALETTE.whiteMarble,
      );
      stoneB.addCylinder(
        px,
        pz,
        1.22,
        1.29,
        0.065,
        0.02,
        8,
        PALETTE.whiteMarble,
      );
    }

    // C. Con tiện lục bình đá thon thả, thoáng đãng
    const addVaseBaluster = (x: number, z: number) => {
      // Chân đế vuông nhỏ
      stoneB.addCylinder(x, z, 0.72, 0.76, 0.038, 0.038, 8, PALETTE.stoneDark);
      // Thân bầu tròn dưới
      stoneB.addCylinder(x, z, 0.76, 0.87, 0.038, 0.046, 8, PALETTE.stoneLight);
      // Cổ thắt thon
      stoneB.addCylinder(x, z, 0.87, 0.94, 0.046, 0.03, 8, PALETTE.stone);
      // Cổ nở đỡ tay vịn
      stoneB.addCylinder(x, z, 0.94, 0.98, 0.03, 0.038, 8, PALETTE.stoneLight);
    };

    // D. Dải gờ chân, bưng và tay vịn lan can
    // 1. Cạnh sau
    stoneB.addBox(
      bx - 2.65,
      0.64,
      bz - 2.72,
      bx + 2.65,
      0.72,
      bz - 2.58,
      PALETTE.stoneDark,
    );
    stoneB.addBox(
      bx - 2.65,
      0.72,
      bz - 2.69,
      bx + 2.65,
      0.76,
      bz - 2.61,
      PALETTE.stone,
    );
    stoneB.addBox(
      bx - 2.65,
      0.98,
      bz - 2.71,
      bx + 2.65,
      1.05,
      bz - 2.59,
      PALETTE.stone,
    );
    for (const ox of [-2.2, -1.76, -1.32, -0.44, 0, 0.44, 1.32, 1.76, 2.2]) {
      addVaseBaluster(bx + ox, bz - 2.65);
    }

    // 2. Cạnh trái
    stoneB.addBox(
      bx - 2.72,
      0.64,
      bz - 2.65,
      bx - 2.58,
      0.72,
      bz + 2.65,
      PALETTE.stoneDark,
    );
    stoneB.addBox(
      bx - 2.69,
      0.72,
      bz - 2.65,
      bx - 2.61,
      0.76,
      bz + 2.65,
      PALETTE.stone,
    );
    stoneB.addBox(
      bx - 2.71,
      0.98,
      bz - 2.65,
      bx - 2.59,
      1.05,
      bz + 2.65,
      PALETTE.stone,
    );
    for (const oz of [-2.2, -1.76, -1.32, -0.44, 0, 0.44, 1.32, 1.76, 2.2]) {
      addVaseBaluster(bx - 2.65, bz + oz);
    }

    // 3. Cạnh phải
    stoneB.addBox(
      bx + 2.58,
      0.64,
      bz - 2.65,
      bx + 2.72,
      0.72,
      bz + 2.65,
      PALETTE.stoneDark,
    );
    stoneB.addBox(
      bx + 2.61,
      0.72,
      bz - 2.65,
      bx + 2.69,
      0.76,
      bz + 2.65,
      PALETTE.stone,
    );
    stoneB.addBox(
      bx + 2.59,
      0.98,
      bz - 2.65,
      bx + 2.71,
      1.05,
      bz + 2.65,
      PALETTE.stone,
    );
    for (const oz of [-2.2, -1.76, -1.32, -0.44, 0, 0.44, 1.32, 1.76, 2.2]) {
      addVaseBaluster(bx + 2.65, bz + oz);
    }

    // 4. Cạnh trước (chừa lối cầu thang ở giữa thông thoáng)
    // Cạnh trước bên trái
    stoneB.addBox(
      bx - 2.65,
      0.64,
      bz + 2.58,
      bx - 1.05,
      0.72,
      bz + 2.72,
      PALETTE.stoneDark,
    );
    stoneB.addBox(
      bx - 2.65,
      0.72,
      bz + 2.61,
      bx - 1.05,
      0.76,
      bz + 2.69,
      PALETTE.stone,
    );
    stoneB.addBox(
      bx - 2.65,
      0.98,
      bz + 2.59,
      bx - 1.05,
      1.05,
      bz + 2.71,
      PALETTE.stone,
    );
    for (const ox of [-2.25, -1.85, -1.45]) {
      addVaseBaluster(bx + ox, bz + 2.65);
    }

    // Cạnh trước bên phải
    stoneB.addBox(
      bx + 1.05,
      0.64,
      bz + 2.58,
      bx + 2.65,
      0.72,
      bz + 2.72,
      PALETTE.stoneDark,
    );
    stoneB.addBox(
      bx + 1.05,
      0.72,
      bz + 2.61,
      bx + 2.65,
      0.76,
      bz + 2.69,
      PALETTE.stone,
    );
    stoneB.addBox(
      bx + 1.05,
      0.98,
      bz + 2.59,
      bx + 2.65,
      1.05,
      bz + 2.71,
      PALETTE.stone,
    );
    for (const ox of [1.45, 1.85, 2.25]) {
      addVaseBaluster(bx + ox, bz + 2.65);
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
    // PHẦN 4: QUẢ ĐẠI HỒNG CHUNG BẰNG ĐỒNG CỔ ÁNH KIM & CHÀY KÌNH (TẠI TÂM TẦNG 1)
    // =========================================================================
    buildGreatBell(bronzeB, woodB, goldB, bx, bz);

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
    // PHẦN 6: TẦNG CỔ DIÊM (TẦNG 2) & HỆ LAN CAN GỖ CHẤN SONG THÔNG THOÁNG
    // =========================================================================
    // Sàn gỗ cổ lầu tầng 2 thu gọn tinh tế, vừa khít cổ ngói tầng 1 (y: 4.40m đến 4.48m)
    const floorR = 1.24;
    woodB.addBox(
      bx - floorR,
      4.4,
      bz - floorR,
      bx + floorR,
      4.48,
      bz + floorR,
      woodLimDark,
    );

    // Lan can tay vịn gỗ lim tầng 2 (thông thoáng, nhìn xuyên thấu bầu trời và chuông)
    const baseRailY = 4.48;
    const railY = 4.86;
    const railR = 1.18;
    // Gờ tay vịn 4 cạnh
    woodB.addBox(
      bx - railR,
      railY,
      bz - railR,
      bx + railR,
      railY + 0.045,
      bz - railR + 0.06,
      woodLimDark,
    );
    woodB.addBox(
      bx - railR,
      railY,
      bz + railR - 0.06,
      bx + railR,
      railY + 0.045,
      bz + railR,
      woodLimDark,
    );
    woodB.addBox(
      bx - railR,
      railY,
      bz - railR,
      bx - railR + 0.06,
      railY + 0.045,
      bz + railR,
      woodLimDark,
    );
    woodB.addBox(
      bx + railR - 0.06,
      railY,
      bz - railR,
      bx + railR,
      railY + 0.045,
      bz + railR,
      woodLimDark,
    );

    // Gờ chân lan can
    woodB.addBox(
      bx - railR,
      baseRailY,
      bz - railR,
      bx + railR,
      baseRailY + 0.035,
      bz - railR + 0.06,
      woodLimDark,
    );
    woodB.addBox(
      bx - railR,
      baseRailY,
      bz + railR - 0.06,
      bx + railR,
      baseRailY + 0.035,
      bz + railR,
      woodLimDark,
    );
    woodB.addBox(
      bx - railR,
      baseRailY,
      bz - railR,
      bx - railR + 0.06,
      baseRailY + 0.035,
      bz + railR,
      woodLimDark,
    );
    woodB.addBox(
      bx + railR - 0.06,
      baseRailY,
      bz - railR,
      bx + railR,
      baseRailY + 0.035,
      bz + railR,
      woodLimDark,
    );

    // Hàng con tiện gỗ thanh mảnh tạo độ thông thoáng tuyệt đối
    for (let pos = -1.02; pos <= 1.02; pos += 0.22) {
      woodB.addCylinder(
        bx + pos,
        bz - railR + 0.03,
        baseRailY + 0.035,
        railY,
        0.016,
        0.016,
        6,
        woodLim,
      );
      woodB.addCylinder(
        bx + pos,
        bz + railR - 0.03,
        baseRailY + 0.035,
        railY,
        0.016,
        0.016,
        6,
        woodLim,
      );
      woodB.addCylinder(
        bx - railR + 0.03,
        bz + pos,
        baseRailY + 0.035,
        railY,
        0.016,
        0.016,
        6,
        woodLim,
      );
      woodB.addCylinder(
        bx + railR - 0.03,
        bz + pos,
        baseRailY + 0.035,
        railY,
        0.016,
        0.016,
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

    campus.colliders.push({
      minX: bx - 2.5,
      maxX: bx + 2.5,
      minZ: bz - 2.5,
      maxZ: bz + 2.5,
    });

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

    const gGeom = goldB.build();
    if (gGeom) {
      const mesh = new THREE.Mesh(gGeom, campus.goldMat);
      mesh.castShadow = true;
      mesh.matrixAutoUpdate = false;
      campus.root.add(mesh);
    }

    // Mesh Đại Hồng Chung bằng đồng thanh đúc cổ ánh kim
    const bGeom = bronzeB.build();
    if (bGeom) {
      const bronzeMat = new THREE.MeshStandardMaterial({
        vertexColors: true,
        roughness: 0.36,
        metalness: 0.42,
        emissive: new THREE.Color(0x5a3e18),
        emissiveIntensity: 0.35,
      });
      const mesh = new THREE.Mesh(bGeom, bronzeMat);
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

    // Mesh buồng phát sáng 4 đèn lồng đá góc Tháp Chuông
    const glGeom = glowB.build();
    if (glGeom) {
      const glowMesh = new THREE.Mesh(glGeom, campus.glowMat);
      glowMesh.matrixAutoUpdate = false;
      glowMesh.frustumCulled = false;
      campus.root.add(glowMesh);
    }
  }

  /**
   * Tạo Đại Hồng Chung bằng đồng thanh cổ ánh kim và Chày Kình chuẩn 100% bản vẽ phối cảnh 3D
   * Gồm:
   * 1. Độ cao treo chuông thanh thoát, miệng chuông cách sàn 1.07m tạo tầm nhìn thông thoáng
   * 2. Miệng chuông loe rộng lượn sóng viền cánh sen nổi và gờ chỉ đồng vàng
   * 3. Thân chuông thon thả chuẩn tỉ lệ cổ truyền với 4 núm gõ chuông (Nguyệt chuông) hình hoa sen bát giác
   * 4. Thân trên chia 4 ô Minh Văn viền vàng chạm nổi các dòng kinh kệ Phật pháp
   * 5. Vai chuông uốn cong mềm mại phủ lớp cánh sen úp 16 cánh
   * 6. Quai chuông hình Linh thú Rồng Bồ Lao 2 đầu uốn cong uy nghiêm, sừng và vây lửa dát vàng
   * 7. Xích sắt rèn đôi treo vững chãi từ trần xà mái xuống quai chuông
   * 8. Chày Kình (dùi gỗ lim đấm chuông) dáng trụ tiện tròn, 2 đai đồng vàng, treo ngang bằng 2 sợi xích sắt đối diện núm chuông
   */
  function buildGreatBell(
    bronzeB: GeometryBuilder,
    woodB: GeometryBuilder,
    goldB: GeometryBuilder,
    bx: number,
    bz: number,
  ): void {
    // Bảng màu đồng cổ ánh kim, hoa văn dát vàng & sắt rèn
    const bronzeBody = new THREE.Color(0xbba068); // Đồng thanh cổ ánh sáng ấm
    const bronzeDark = new THREE.Color(0x755d32); // Rãnh hoa văn chìm / lòng chuông
    const goldRelief = new THREE.Color(0xf6d672); // Hoa văn, núm gõ, minh văn dát vàng
    const ironChain = new THREE.Color(0x36383c); // Sắt rèn cổ đen xám
    const ironRing = new THREE.Color(0x52555c); // Khoen sắt rèn
    const woodStriker = new THREE.Color(0x562b14); // Gỗ lim nâu đậm nguyên khối
    const woodCap = new THREE.Color(0x7c4222); // Đầu tiện gỗ tròn
    const bronzeFitting = new THREE.Color(0xdcae4e); // Đai đồng bọc dùi chuông

    // -------------------------------------------------------------------------
    // 1. MIỆNG CHUÔNG (Vành loe sóng sen, y: 1.72m -> 1.88m, r: 0.64m -> 0.57m)
    // -------------------------------------------------------------------------
    // Vành môi chuông dát vàng (Flared lip rim)
    goldB.addCylinder(bx, bz, 1.72, 1.78, 0.64, 0.61, 24, goldRelief);
    bronzeB.addCylinder(bx, bz, 1.78, 1.88, 0.61, 0.57, 24, bronzeBody);

    // 24 Cánh sen nhô viền quanh mép miệng chuông (Scalloped lotus petal rim)
    const rimCount = 24;
    for (let i = 0; i < rimCount; i++) {
      const a = (i / rimCount) * Math.PI * 2;
      const cos = Math.cos(a);
      const sin = Math.sin(a);
      const px = bx + cos * 0.625;
      const pz = bz + sin * 0.625;
      goldB.addLimb(
        new THREE.Vector3(px, 1.71, pz),
        new THREE.Vector3(bx + cos * 0.59, 1.76, bz + sin * 0.59),
        0.025,
        0.015,
        4,
        goldRelief,
      );
    }
    // Gờ đai chỉ nổi chân miệng chuông
    goldB.addCylinder(bx, bz, 1.86, 1.9, 0.58, 0.58, 24, goldRelief);

    // -------------------------------------------------------------------------
    // 2. THÂN DƯỚI & 4 NÚM GÕ CHUÔNG (Hạ chuông, y: 1.88m -> 2.44m)
    // -------------------------------------------------------------------------
    // Phần eo thon thu vào rồi loe nhẹ
    bronzeB.addCylinder(bx, bz, 1.88, 2.12, 0.57, 0.51, 24, bronzeBody);
    bronzeB.addCylinder(bx, bz, 2.12, 2.44, 0.51, 0.525, 24, bronzeBody);

    // 4 Núm chuông (Nguyệt chuông) tại 4 phương Đông - Tây - Nam - Bắc (y = 2.22m)
    const bossDirections = [
      { dx: 1, dz: 0 },
      { dx: -1, dz: 0 },
      { dx: 0, dz: 1 },
      { dx: 0, dz: -1 },
    ];
    for (const dir of bossDirections) {
      const bossRadius = 0.518;
      const cx = bx + dir.dx * bossRadius;
      const cz = bz + dir.dz * bossRadius;
      const by = 2.22;

      // Đĩa nguyệt chuông viền nổi dát vàng
      goldB.addLimb(
        new THREE.Vector3(cx - dir.dx * 0.02, by, cz - dir.dz * 0.02),
        new THREE.Vector3(cx + dir.dx * 0.04, by, cz + dir.dz * 0.04),
        0.09,
        0.08,
        8,
        goldRelief,
      );
      // Núm tròn gõ chuông nhô ra phía ngoài
      goldB.addLimb(
        new THREE.Vector3(cx + dir.dx * 0.03, by, cz + dir.dz * 0.03),
        new THREE.Vector3(cx + dir.dx * 0.075, by, cz + dir.dz * 0.075),
        0.055,
        0.04,
        8,
        goldRelief,
      );

      // 8 Cánh sen hoa văn tỏa tròn quanh đĩa nguyệt
      const tanX = -dir.dz;
      const tanZ = dir.dx;
      for (let p = 0; p < 8; p++) {
        const pa = (p / 8) * Math.PI * 2;
        const pr = 0.115;
        const petX = cx + tanX * Math.cos(pa) * pr;
        const petY = by + Math.sin(pa) * pr;
        const petZ = cz + tanZ * Math.cos(pa) * pr;
        goldB.addLimb(
          new THREE.Vector3(cx, by, cz),
          new THREE.Vector3(petX, petY, petZ),
          0.02,
          0.008,
          4,
          goldRelief,
        );
      }
    }

    // Đai gờ phân cách Thân dưới và Thân trên
    goldB.addCylinder(bx, bz, 2.44, 2.48, 0.53, 0.53, 24, goldRelief);
    bronzeB.addCylinder(bx, bz, 2.45, 2.47, 0.536, 0.536, 24, bronzeDark);

    // -------------------------------------------------------------------------
    // 3. THÂN TRÊN & 4 Ô MINH VĂN KHẮC KINH PHẬT (y: 2.48m -> 2.92m, r: 0.525m -> 0.46m)
    // -------------------------------------------------------------------------
    bronzeB.addCylinder(bx, bz, 2.48, 2.92, 0.525, 0.46, 24, bronzeBody);

    // 4 Cột gờ nổi ngăn cách 4 ô Minh Văn ở 4 góc chéo (45°, 135°, 225°, 315°)
    const ribAngles = [
      Math.PI / 4,
      (3 * Math.PI) / 4,
      (5 * Math.PI) / 4,
      (7 * Math.PI) / 4,
    ];
    for (const ra of ribAngles) {
      const cos = Math.cos(ra);
      const sin = Math.sin(ra);
      goldB.addLimb(
        new THREE.Vector3(bx + cos * 0.53, 2.47, bz + sin * 0.53),
        new THREE.Vector3(bx + cos * 0.465, 2.93, bz + sin * 0.465),
        0.02,
        0.016,
        4,
        goldRelief,
      );
    }

    // Các dòng Minh Văn chữ Phạn / Hán Nôm đắp nổi dát vàng trong từng ô
    const textRows = [2.56, 2.66, 2.76, 2.84];
    for (const ty of textRows) {
      const tr = 0.525 - ((ty - 2.48) / (2.92 - 2.48)) * (0.525 - 0.46);
      for (const dir of bossDirections) {
        const panelCos = dir.dx;
        const panelSin = dir.dz;
        const tanX = -panelSin;
        const tanZ = panelCos;
        // Dải kinh văn chạm nổi
        goldB.addLimb(
          new THREE.Vector3(
            bx + panelCos * tr - tanX * 0.16,
            ty,
            bz + panelSin * tr - tanZ * 0.16,
          ),
          new THREE.Vector3(
            bx + panelCos * tr + tanX * 0.16,
            ty,
            bz + panelSin * tr + tanZ * 0.16,
          ),
          0.012,
          0.012,
          4,
          goldRelief,
        );
      }
    }

    // Đai gờ vai chuông dát vàng
    goldB.addCylinder(bx, bz, 2.9, 2.94, 0.468, 0.468, 24, goldRelief);

    // -------------------------------------------------------------------------
    // 4. VAI CHUÔNG & BĂNG CÁNH SEN ÚP (y: 2.94m -> 3.28m, r: 0.46m -> 0.23m)
    // -------------------------------------------------------------------------
    bronzeB.addCylinder(bx, bz, 2.94, 3.12, 0.46, 0.38, 24, bronzeBody);
    bronzeB.addCylinder(bx, bz, 3.12, 3.28, 0.38, 0.23, 24, bronzeBody);

    // 16 Cánh sen úp phủ từ đỉnh vòm vai chuông rủ xuống (Downward drooping lotus petals)
    const shoulderPetalCount = 16;
    for (let i = 0; i < shoulderPetalCount; i++) {
      const pa = (i / shoulderPetalCount) * Math.PI * 2;
      const cos = Math.cos(pa);
      const sin = Math.sin(pa);
      // Gân cánh sen dát vàng uốn lượn cong theo vai chuông
      goldB.addLimb(
        new THREE.Vector3(bx + cos * 0.24, 3.26, bz + sin * 0.24),
        new THREE.Vector3(bx + cos * 0.39, 3.11, bz + sin * 0.39),
        0.022,
        0.018,
        4,
        goldRelief,
      );
      goldB.addLimb(
        new THREE.Vector3(bx + cos * 0.39, 3.11, bz + sin * 0.39),
        new THREE.Vector3(bx + cos * 0.455, 2.95, bz + sin * 0.455),
        0.018,
        0.012,
        4,
        goldRelief,
      );
    }

    // Cổ ngai đỉnh chuông (Crown collar)
    goldB.addCylinder(bx, bz, 3.28, 3.36, 0.235, 0.21, 16, goldRelief);
    bronzeB.addCylinder(bx, bz, 3.32, 3.35, 0.242, 0.242, 16, bronzeDark);

    // -------------------------------------------------------------------------
    // 5. QUAI RỒNG BỒ LAO (Linh thú Bồ Lao 2 đầu uốn cong vòm, y: 3.34m -> 3.66m)
    // -------------------------------------------------------------------------
    // Thân rồng uốn vòm cầu nối đỉnh quả chuông dọc theo trục Z
    const archPts = [
      new THREE.Vector3(bx, 3.34, bz - 0.22),
      new THREE.Vector3(bx, 3.48, bz - 0.16),
      new THREE.Vector3(bx, 3.61, bz - 0.08),
      new THREE.Vector3(bx, 3.66, bz),
      new THREE.Vector3(bx, 3.61, bz + 0.08),
      new THREE.Vector3(bx, 3.48, bz + 0.16),
      new THREE.Vector3(bx, 3.34, bz + 0.22),
    ];
    for (let k = 0; k < archPts.length - 1; k++) {
      bronzeB.addLimb(
        archPts[k],
        archPts[k + 1],
        0.065 - Math.abs(k - 3) * 0.005,
        0.065 - Math.abs(k + 1 - 3) * 0.005,
        8,
        bronzeBody,
      );
      // Gân sống lưng rồng dát vàng
      goldB.addLimb(
        new THREE.Vector3(archPts[k].x, archPts[k].y + 0.04, archPts[k].z),
        new THREE.Vector3(
          archPts[k + 1].x,
          archPts[k + 1].y + 0.04,
          archPts[k + 1].z,
        ),
        0.02,
        0.02,
        4,
        goldRelief,
      );
    }

    // Vi cá / vây lửa rồng nhọn hoắt trên đỉnh quai
    for (const [fx, fy, fz] of [
      [bx, 3.68, bz - 0.06],
      [bx, 3.71, bz],
      [bx, 3.68, bz + 0.06],
    ]) {
      goldB.addLimb(
        new THREE.Vector3(fx, fy - 0.05, fz),
        new THREE.Vector3(fx, fy + 0.05, fz),
        0.022,
        0.004,
        4,
        goldRelief,
      );
    }

    // 2 Đầu Rồng Bồ Lao ngoảnh ra 2 phía (+Z và -Z)
    for (const headSign of [-1, 1]) {
      const hz = bz + headSign * 0.22;
      // Hộp sọ & mõm rồng hướng ra ngoài
      goldB.addLimb(
        new THREE.Vector3(bx, 3.38, hz),
        new THREE.Vector3(bx, 3.36, hz + headSign * 0.09),
        0.06,
        0.042,
        6,
        goldRelief,
      );
      // Hàm dưới cắn vào cổ ngai chuông
      bronzeB.addLimb(
        new THREE.Vector3(bx, 3.32, hz),
        new THREE.Vector3(bx, 3.33, hz + headSign * 0.07),
        0.038,
        0.025,
        4,
        bronzeDark,
      );
      // Cặp sừng rồng vút ngược lên trời
      goldB.addLimb(
        new THREE.Vector3(bx - 0.035, 3.42, hz),
        new THREE.Vector3(bx - 0.05, 3.53, hz - headSign * 0.04),
        0.022,
        0.008,
        4,
        goldRelief,
      );
      goldB.addLimb(
        new THREE.Vector3(bx + 0.035, 3.42, hz),
        new THREE.Vector3(bx + 0.05, 3.53, hz - headSign * 0.04),
        0.022,
        0.008,
        4,
        goldRelief,
      );
    }

    // -------------------------------------------------------------------------
    // 6. XÍCH TREO CHUÔNG BẰNG SẮT RÈN ĐÔI (y: 3.64m -> 3.82m)
    // -------------------------------------------------------------------------
    // Khoen xích tròn luồn qua bụng quai Rồng Bồ Lao
    bronzeB.addLimb(
      new THREE.Vector3(bx - 0.07, 3.62, bz),
      new THREE.Vector3(bx + 0.07, 3.62, bz),
      0.025,
      0.025,
      6,
      ironRing,
    );
    // 2 Sợi xích sắt song song treo từ xà mái trần (y: 3.82m) xuống quai chuông
    for (const chainOffset of [-0.055, 0.055]) {
      const cx = bx + chainOffset;
      // Trụ xích rèn nhiều mắt
      for (let cy = 3.64; cy < 3.82; cy += 0.036) {
        bronzeB.addCylinder(cx, bz, cy, cy + 0.032, 0.022, 0.022, 6, ironChain);
      }
    }

    // -------------------------------------------------------------------------
    // 7. CHÀY KÌNH (DÙI GỖ ĐẤM CHUÔNG TREO NGANG DỌI VÀO NÚM CHUÔNG) TẠI TẦNG 1
    // -------------------------------------------------------------------------
    // Đầu của chày kình dọi thẳng tâm vào núm chuông (Nguyệt chuông) phía Đông
    // Núm chuông tại: (bx + 0.593m, y: 2.22m, z: bz)
    // Chày kình nằm ngang dọc theo trục X (z = bz), đầu chày hướng về tâm chuông (-X)
    const strikerY = 2.22;
    const strikerHeadX = bx + 0.63; // Đầu dọi cách núm chuông 3.7cm
    const strikerTailX = bx + 1.52; // Đuôi chày kình vươn về phía ngoài (+X)

    // Đầu chày kình tiện bo tròn vòm cầu dọi thẳng vào núm chuông
    woodB.addLimb(
      new THREE.Vector3(strikerHeadX, strikerY, bz),
      new THREE.Vector3(strikerHeadX + 0.05, strikerY, bz),
      0.065,
      0.095,
      12,
      woodCap,
    );
    // Vòng đồng viền bọc đầu chày kình gia cố lực va đập
    goldB.addLimb(
      new THREE.Vector3(strikerHeadX + 0.035, strikerY, bz),
      new THREE.Vector3(strikerHeadX + 0.065, strikerY, bz),
      0.098,
      0.098,
      12,
      goldRelief,
    );

    // Thân chày kình bằng gỗ lim nguyên khối tiện tròn nhẵn bóng (dài 0.8m, bán kính 9.5cm)
    woodB.addLimb(
      new THREE.Vector3(strikerHeadX + 0.05, strikerY, bz),
      new THREE.Vector3(strikerTailX - 0.05, strikerY, bz),
      0.095,
      0.095,
      14,
      woodStriker,
    );

    // Đuôi chày kình tiện vát tròn thon dần
    woodB.addLimb(
      new THREE.Vector3(strikerTailX - 0.05, strikerY, bz),
      new THREE.Vector3(strikerTailX, strikerY, bz),
      0.095,
      0.055,
      12,
      woodCap,
    );

    // 2 Vòng đai đồng vàng bọc thân dùi có khoen treo dọc theo trục X
    const collarXPositions = [bx + 0.88, bx + 1.30];
    for (const cx of collarXPositions) {
      // Đai đồng ôm chặt thân gỗ lim
      bronzeB.addLimb(
        new THREE.Vector3(cx - 0.03, strikerY, bz),
        new THREE.Vector3(cx + 0.03, strikerY, bz),
        0.103,
        0.103,
        12,
        bronzeFitting,
      );
      // Chỉ viền đai dát vàng
      goldB.addLimb(
        new THREE.Vector3(cx - 0.035, strikerY, bz),
        new THREE.Vector3(cx + 0.035, strikerY, bz),
        0.106,
        0.106,
        12,
        goldRelief,
      );
      // Tai khoen sắt phía trên để xỏ xích treo
      bronzeB.addLimb(
        new THREE.Vector3(cx, strikerY + 0.09, bz),
        new THREE.Vector3(cx, strikerY + 0.13, bz),
        0.02,
        0.02,
        6,
        ironRing,
      );

      // Sợi xích sắt rèn treo thẳng đứng từ xà trần (y: 3.82m) xuống tai dùi (y: 2.34m)
      for (let cy = strikerY + 0.12; cy < 3.82; cy += 0.036) {
        bronzeB.addCylinder(
          cx,
          bz,
          cy,
          cy + 0.032,
          0.016,
          0.016,
          6,
          ironChain,
        );
      }
    }

    // Dây thừng đỏ buông từ đuôi chày kình để kéo chuông (Chuẩn Đại Hồng Chung cổ truyền)
    const ropeColor = new THREE.Color(0xb22222);
    // Khoen đồng đuôi chày
    goldB.addLimb(
      new THREE.Vector3(strikerTailX, strikerY, bz),
      new THREE.Vector3(strikerTailX + 0.03, strikerY, bz),
      0.025,
      0.025,
      6,
      goldRelief,
    );
    // Dây thừng đỏ bện chắc buông xuống tầm tay với (y: 1.15m)
    bronzeB.addCylinder(
      strikerTailX + 0.02,
      bz,
      1.18,
      strikerY,
      0.012,
      0.012,
      6,
      ropeColor,
    );
    // Nút thắt hoa sen / quả cầu vàng gút đuôi dây thừng
    goldB.addCylinder(
      strikerTailX + 0.02,
      bz,
      1.12,
      1.18,
      0.028,
      0.016,
      8,
      goldRelief,
    );
    // Tua rua lụa đỏ phong thủy buông thõng
    bronzeB.addCylinder(
      strikerTailX + 0.02,
      bz,
      0.96,
      1.12,
      0.024,
      0.008,
      8,
      ropeColor,
    );
  }
