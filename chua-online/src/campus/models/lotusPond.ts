import * as THREE from 'three';
import { GeometryBuilder } from '../geometryBuilder.ts';
import { PALETTE } from '../palette.ts';
import type { Campus } from '../campus.ts';

/**
 * 6. Hồ Sen & Cầu Kiều Gỗ (Lotus Pond & Wooden Bridge)
 */
export function buildLotusPondAndBridge(campus: Campus): void {
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
    campus.colliders.push({
      minX: -pr - 0.5,
      maxX: -1.7,
      minZ: pz - pr,
      maxZ: pz + pr,
    });
    campus.colliders.push({
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
      campus.root.add(mesh);
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