import * as THREE from "three";
import { GeometryBuilder } from "../geometryBuilder.ts";
import { PALETTE } from "../palette.ts";
import type { Campus } from "../campus.ts";

/**
 * 5. Đỉnh Lư Hương Đồng lớn đặt trước sân chùa (x: 0, z: -2.5)
 */
export function buildIncenseBurner(campus: Campus): void {
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

  campus.colliders.push({
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
    campus.root.add(mesh);
  }
}

