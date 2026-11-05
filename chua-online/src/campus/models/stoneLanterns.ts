import * as THREE from "three";
import { GeometryBuilder } from "../geometryBuilder.ts";
import { PALETTE } from "../palette.ts";
import type { Campus } from "../campus.ts";

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
export function buildStoneLanterns(campus: Campus): void {
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
    campus.colliders.push({
      cx: lx,
      cz: lz,
      radius: 0.46,
    });
  }

  // Dựng Mesh đá
  const stoneGeom = b.build();
  if (stoneGeom) {
    const stoneMesh = new THREE.Mesh(stoneGeom, campus.stoneMat);
    stoneMesh.castShadow = true;
    stoneMesh.receiveShadow = true;
    stoneMesh.matrixAutoUpdate = false;
    campus.root.add(stoneMesh);
  }

  // Dựng Mesh buồng sáng phát quang (Glow Mesh)
  const glowGeom = glowBuilder.build();
  if (glowGeom) {
    campus.glowMesh = new THREE.Mesh(glowGeom, campus.glowMat);
    campus.glowMesh.matrixAutoUpdate = false;
    campus.glowMesh.frustumCulled = false;
    campus.root.add(campus.glowMesh);
  }
}

