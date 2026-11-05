import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GeometryBuilder } from '../geometryBuilder.ts';
import { PALETTE } from '../palette.ts';
import type { Campus } from '../campus.ts';

/**
 * ============================================================================
 * 13. CHÙA MỘT CỘT (DIÊN HỰU TỰ / LIÊN HOA ĐÀI)
 * ============================================================================
 * Nạp mô hình 3D chua_mot_cot.glb từ /models/chua_mot_cot.glb.
 * Đặt trang nghiêm tại hoa viên phía Tây (x: -23.5, z: 14.5), đối xứng hài hòa
 * với Tháp Bút phía Đông (x: 23.5, z: 14.5).
 * 
 * Mô hình bao gồm:
 * - Hồ Linh Chiểu vuông vắn kè đá với hoa sen
 * - Trụ đá vững chãi vươn lên giữa hồ nước
 * - Ngôi chùa gỗ Liên Hoa Đài mô phỏng đóa sen nở nghìn năm
 * - Lối cầu thang gạch đá dẫn từ mép sân chùa bước lên điện thờ
 */

export function buildChuaMotCot(campus: Campus): void {
  const px = -23.5;
  const pz = 14.5;
  const targetHeight = 5.6; // Chiều cao tổng thể từ mặt đất tới đỉnh mái ~5.6m

  // 1. TẠO VIỀN BỜ VÀ NỀN SỎI ĐÁ BAO QUANH HỒ LINH CHIỂU
  const stoneB = new GeometryBuilder();

  // Bờ bao đá mài chống tràn quanh mép cỏ
  const pondHalfW = 4.3;
  const pondHalfD = 4.7;

  // Lát gạch dẫn nối từ sân đá phiến (x: -19.3) sang cầu thang Chùa Một Cột
  stoneB.addBox(-19.3, 0.0, pz + 0.1, -19.0, 0.08, pz + 1.6, PALETTE.stoneLight);

  // 4 Trụ đèn lồng đá hoa sen hoàn thiện tại 4 góc bờ hồ Chùa Một Cột
  const glowB = new GeometryBuilder();
  const cornerLanterns = [
    [-pondHalfW - 0.25, -pondHalfD - 0.25],
    [pondHalfW + 0.25, -pondHalfD - 0.25],
    [pondHalfW + 0.25, pondHalfD + 0.25],
    [-pondHalfW - 0.25, pondHalfD + 0.25],
  ];

  for (const [lx, lz] of cornerLanterns) {
    const gx = px + lx;
    const gz = pz + lz;

    // Chân đế đá 2 tầng bát giác
    stoneB.addCylinder(gx, gz, 0.0, 0.16, 0.38, 0.34, 8, PALETTE.stoneDark);
    stoneB.addCylinder(gx, gz, 0.16, 0.28, 0.32, 0.28, 8, PALETTE.stone);

    // Cánh sen đỡ buồng đèn
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      stoneB.addPetal(gx, 0.28, gz, angle, 0.24, 0.18, 0.12, 0.025, PALETTE.stoneLight);
    }

    // Thân trụ đèn
    stoneB.addCylinder(gx, gz, 0.28, 0.85, 0.14, 0.12, 8, PALETTE.stone);

    // Bát sen trên
    stoneB.addCylinder(gx, gz, 0.85, 0.95, 0.13, 0.22, 8, PALETTE.stone);

    // Buồng phát sáng
    glowB.addCylinder(gx, gz, 0.96, 1.35, 0.13, 0.13, 8, new THREE.Color(0xffdf77));

    // Cột nan buồng đèn đá
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const bx = gx + Math.cos(a) * 0.18;
      const bz = gz + Math.sin(a) * 0.18;
      stoneB.addBox(bx - 0.025, 0.95, bz - 0.025, bx + 0.025, 1.36, bz + 0.025, PALETTE.stoneDark);
    }

    // Mái ngói nón bát giác
    stoneB.addCylinder(gx, gz, 1.36, 1.54, 0.36, 0.14, 8, PALETTE.stone);
    stoneB.addCylinder(gx, gz, 1.54, 1.70, 0.07, 0.015, 8, PALETTE.stoneLight);

    // Nguồn sáng ấm tỏa ra từ mỗi cột đèn lồng góc hồ
    const lanternLight = new THREE.PointLight(0xffb844, 0.75, 4.5);
    lanternLight.position.set(gx, 1.15, gz);
    campus.root.add(lanternLight);

    // Collider cột đèn góc
    campus.colliders.push({
      cx: gx,
      cz: gz,
      radius: 0.4,
    });
  }

  // Mesh viền đá và trụ đèn
  const stoneGeo = stoneB.build();
  if (stoneGeo) {
    const stoneMesh = new THREE.Mesh(stoneGeo, campus.stoneMat);
    stoneMesh.castShadow = true;
    stoneMesh.receiveShadow = true;
    campus.root.add(stoneMesh);
  }

  // Buồng đèn phát sáng
  const glowGeo = glowB.build();
  if (glowGeo) {
    const lanternGlowMesh = new THREE.Mesh(glowGeo, campus.glowMat);
    lanternGlowMesh.matrixAutoUpdate = false;
    lanternGlowMesh.frustumCulled = false;
    campus.root.add(lanternGlowMesh);
  }

  // 2. NẠP MÔ HÌNH 3D CHÙA MỘT CỘT (chua_mot_cot.glb)
  const loader = new GLTFLoader();
  loader.load(
    '/models/chua_mot_cot.glb',
    (gltf) => {
      const model = gltf.scene;

      // Tính Bounding Box thực tế
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());

      // Tỷ lệ scale để đạt chiều cao chuẩn 5.6m
      const scaleFactor = targetHeight / Math.max(size.y, 0.001);

      // Căn giữa mặt bằng hồ và đáy chạm mặt đất y = 0
      model.position.set(-center.x, -box.min.y, -center.z);

      // Cấu hình vật liệu và bóng đổ
      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;

          // Giữ sắc nét cho texture dạng palette voxel, tránh bị nhòe màu
          if (mesh.material) {
            const mat = mesh.material as THREE.MeshStandardMaterial;
            if (mat.map) {
              mat.map.magFilter = THREE.NearestFilter;
              mat.map.minFilter = THREE.NearestFilter;
              mat.map.needsUpdate = true;
            }
            mat.roughness = 0.78;
            mat.metalness = 0.08;
          }
        }
      });

      const holder = new THREE.Group();
      holder.name = 'Campus_ChuaMotCot';
      holder.add(model);

      holder.scale.set(scaleFactor, scaleFactor, scaleFactor);
      holder.position.set(px, 0.0, pz);

      // Xoay hướng mặt tiền cầu thang đón khách từ sân trung tâm
      holder.rotation.y = 0;

      campus.root.add(holder);

      // Nguồn sáng ấm hắt sáng lên mái Chùa Một Cột và trụ đá về đêm
      const ambientLight = new THREE.PointLight(0xffdf99, 1.1, 10.0);
      ambientLight.position.set(px - 1.2, 2.8, pz);
      campus.root.add(ambientLight);

      const topRoofLight = new THREE.PointLight(0xffeedd, 0.6, 8.0);
      topRoofLight.position.set(px - 1.2, targetHeight + 0.5, pz);
      campus.root.add(topRoofLight);

      // Ánh sáng huyền ảo phản chiếu trên mặt nước Hồ Linh Chiểu
      const waterLight = new THREE.PointLight(0x77bbdd, 0.5, 6.0);
      waterLight.position.set(px, 0.4, pz);
      campus.root.add(waterLight);
    },
    undefined,
    (err) => {
      console.error('Lỗi khi tải mô hình chua_mot_cot.glb:', err);
    }
  );

  // 3. COLLIDERS BẢO VỆ (Ngăn người chơi rơi xuống hồ hoặc đi xuyên tường)
  // Thành tường Bắc của hồ
  campus.colliders.push({
    minX: px - pondHalfW - 0.2,
    maxX: px + pondHalfW + 0.2,
    minZ: pz - pondHalfD - 0.2,
    maxZ: pz - pondHalfD + 0.4,
  });

  // Thành tường Nam của hồ
  campus.colliders.push({
    minX: px - pondHalfW - 0.2,
    maxX: px + pondHalfW + 0.2,
    minZ: pz + pondHalfD - 0.4,
    maxZ: pz + pondHalfD + 0.2,
  });

  // Thành tường Tây (phía sau) của hồ
  campus.colliders.push({
    minX: px - pondHalfW - 0.2,
    maxX: px - pondHalfW + 0.4,
    minZ: pz - pondHalfD,
    maxZ: pz + pondHalfD,
  });

  // Thành tường Đông (phía trước, hai bên lối lên cầu thang)
  // Phía bắc cầu thang (z < pz + 0.2)
  campus.colliders.push({
    minX: px + pondHalfW - 0.5,
    maxX: px + pondHalfW + 0.2,
    minZ: pz - pondHalfD,
    maxZ: pz + 0.2,
  });
  // Phía nam cầu thang (z > pz + 1.5)
  campus.colliders.push({
    minX: px + pondHalfW - 0.5,
    maxX: px + pondHalfW + 0.2,
    minZ: pz + 1.5,
    maxZ: pz + pondHalfD,
  });

  // Trụ đá và điện thờ (ngăn đi xuyên qua trụ đá giữa hồ)
  campus.colliders.push({
    cx: px - 1.3,
    cz: pz,
    radius: 0.9,
  });
}

