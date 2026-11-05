import * as THREE from "three";
import { GeometryBuilder } from "../geometryBuilder.ts";
import { PALETTE } from "../palette.ts";
import type { Campus } from "../campus.ts";

/**
 * 2. Tường bao đá rêu phong xung quanh chùa (Enclosure Walls)
 */
export function buildEnclosureWalls(campus: Campus): void {
  const b = new GeometryBuilder();
  const wallH = 2.4;
  const wallThick = 0.6;

  // Tường sau (Back: Z = -27)
  b.addBox(-36, 0, -27, 36, wallH, -27 + wallThick, PALETTE.stoneDark);
  campus.colliders.push({ minX: -36, maxX: 36, minZ: -27.5, maxZ: -26.4 });

  // Tường trái (West: X = -36)
  b.addBox(-36, 0, -27, -36 + wallThick, wallH, 54, PALETTE.stoneDark);
  campus.colliders.push({ minX: -36.5, maxX: -35.4, minZ: -27, maxZ: 54 });

  // Tường phải (East: X = 36)
  b.addBox(36 - wallThick, 0, -27, 36, wallH, 54, PALETTE.stoneDark);
  campus.colliders.push({ minX: 35.4, maxX: 36.5, minZ: -27, maxZ: 54 });

  // Tường trước (Front: Z = 54) chừa cổng ở giữa
  b.addBox(-36, 0, 54 - wallThick, -6, wallH, 54, PALETTE.stoneDark);
  b.addBox(6, 0, 54 - wallThick, 36, wallH, 54, PALETTE.stoneDark);
  campus.colliders.push({ minX: -36, maxX: -6, minZ: 53.4, maxZ: 54.5 });
  campus.colliders.push({ minX: 6, maxX: 36, minZ: 53.4, maxZ: 54.5 });

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
    campus.root.add(mesh);
  }
}

