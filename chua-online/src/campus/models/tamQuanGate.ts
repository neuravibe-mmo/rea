import * as THREE from "three";
import { GeometryBuilder } from "../geometryBuilder.ts";
import { PALETTE } from "../palette.ts";
import type { Campus } from "../campus.ts";

/**
 * 3. Cổng Tam Quan (Tam Quan Gate) cổ kính
 */
export function buildTamQuanGate(campus: Campus): void {
  const stoneB = new GeometryBuilder();
  const woodB = new GeometryBuilder();
  const roofB = new GeometryBuilder();
  const gz = 52.5;

  // 4 trụ cổng tam quan bằng đá
  const gatePillars = [-5.2, -1.8, 1.8, 5.2];
  for (const px of gatePillars) {
    stoneB.addBox(
      px - 0.45,
      0,
      gz - 0.45,
      px + 0.45,
      5.2,
      gz + 0.45,
      PALETTE.stone,
    );
    campus.colliders.push({
      minX: px - 0.6,
      maxX: px + 0.6,
      minZ: gz - 0.6,
      maxZ: gz + 0.6,
    });
  }

  // Xà ngang nối các trụ
  woodB.addBox(-5.5, 4.6, gz - 0.5, 5.5, 5.2, gz + 0.5, PALETTE.woodDark);

  // Mái ngói Cổng Tam Quan chuẩn thuật toán Chùa Sen
  // Tầng 1: Mái hạ
  roofB.addCurvedRoofTier({
    cx: 0,
    cz: gz,
    baseY: 4.8,
    A: 7.6,
    B: 2.7,
    Rx: 3.9,
    Rz: 1.2,
    H: 1.3,
    power: 1.6,
    curl: 0.6,
    flare: 0.6,
    tileColor: new THREE.Color(0x6a5a45),
    mossAmount: 0.9,
  });

  // Tầng 2: Mái thượng cổ kính
  roofB.addCurvedRoofTier({
    cx: 0,
    cz: gz,
    baseY: 7.6,
    A: 5.6,
    B: 2.5,
    Rx: 2.8,
    Rz: 0.0,
    H: 1.5,
    power: 1.7,
    curl: 0.7,
    flare: 0.7,
    tileColor: new THREE.Color(0x8a6b4b),
    mossAmount: 0.8,
  });

  const sGeom = stoneB.build();
  if (sGeom) {
    const mesh = new THREE.Mesh(sGeom, campus.stoneMat);
    mesh.castShadow = true;
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
}

