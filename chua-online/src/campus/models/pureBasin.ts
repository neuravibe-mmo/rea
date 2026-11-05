import * as THREE from "three";
import { GeometryBuilder } from "../geometryBuilder.ts";
import { PALETTE } from "../palette.ts";
import type { Campus } from "../campus.ts";

/**
 * 10. Bể Nước Thanh Tịnh / Giếng Chùa tại (x: 29, z: -10)
 */
export function buildPureBasin(campus: Campus): void {
  const b = new GeometryBuilder();
  const bx = 29.0,
    bz = -10.0;

  // Bể đá tròn
  b.addCylinder(bx, bz, 0, 0.9, 1.8, 1.7, 16, PALETTE.stone);
  // Lòng nước trong veo
  b.addCylinder(bx, bz, 0.7, 0.85, 1.45, 1.45, 16, PALETTE.water);

  campus.colliders.push({
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
    campus.root.add(mesh);
  }
}

