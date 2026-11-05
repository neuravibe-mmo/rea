import * as THREE from "three";
import { GeometryBuilder } from "../geometryBuilder.ts";
import { PALETTE } from "../palette.ts";
import type { Campus } from "../campus.ts";

/**
 * 9. Khu Vườn Tượng Phật Bà Quán Thế Âm Bồ Tát tại (x: -28, z: -18.5)
 */
export function buildQuanAmGarden(campus: Campus): void {
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

  campus.colliders.push({
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
    campus.root.add(mesh);
  }
}

