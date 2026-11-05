import * as THREE from "three";
import { GeometryBuilder } from "../geometryBuilder.ts";
import { PALETTE } from "../palette.ts";
import type { Campus } from "../campus.ts";

/**
 * 1. Sân chùa chính và đường Thần đạo lát đá (Courtyard & Paths)
 */
export function buildCourtyards(campus: Campus): void {
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
    campus.root.add(mesh);
  }
}

