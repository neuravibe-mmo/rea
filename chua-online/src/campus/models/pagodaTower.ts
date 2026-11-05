import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { GeometryBuilder } from '../geometryBuilder.ts';
import { PALETTE } from '../palette.ts';
import type { Campus } from '../campus.ts';

/**
 * ============================================================================
 * 12. THÁP BÚT / TÒA BẢO THÁP 7 TẦNG (PAGODA TOWER)
 * ============================================================================
 * Nạp mô hình 3D pagoda.glb từ /models/pagoda.glb với đầy đủ 7 tầng mái ngói
 * xanh ngọc bích, các đầu đao cong vút và đỉnh bút tháp búp sen.
 * Đặt trang nghiêm tại hoa viên bên cạnh Hồ Sen và Tháp Chuông (x: 23.5, z: 14.5).
 */

// Tái sử dụng hình học và vật liệu cho 20 đèn lồng treo nhỏ gọn, sát giá treo mái tháp
const chainGeo = new THREE.CylinderGeometry(0.0005, 0.0005, 0.0035, 4);
const capGeo = new THREE.ConeGeometry(0.0036, 0.0022, 8);
const lanternGeo = new THREE.SphereGeometry(0.0042, 10, 8);
lanternGeo.scale(1.0, 1.2, 1.0);
const ringGeo = new THREE.TorusGeometry(0.0044, 0.0006, 6, 12);
ringGeo.rotateX(Math.PI / 2);
const tasselGeo = new THREE.ConeGeometry(0.0012, 0.0055, 6);

const bronzeMat = new THREE.MeshStandardMaterial({
  color: new THREE.Color(0x3a2d22),
  roughness: 0.5,
  metalness: 0.8,
});

const goldMat = new THREE.MeshStandardMaterial({
  color: new THREE.Color(0xdca83a),
  roughness: 0.28,
  metalness: 0.85,
});

const redLanternMat = new THREE.MeshStandardMaterial({
  color: new THREE.Color(0xee2c1b),
  emissive: new THREE.Color(0xff4411),
  emissiveIntensity: 2.6,
  roughness: 0.35,
  metalness: 0.0,
});

const tasselMat = new THREE.MeshStandardMaterial({
  color: new THREE.Color(0xaa180a),
  roughness: 0.7,
});

function createHangingLantern(): THREE.Group {
  const g = new THREE.Group();

  // Dây treo xích ngắn sát giá móc
  const chain = new THREE.Mesh(chainGeo, bronzeMat);
  chain.position.y = -0.0018;
  g.add(chain);

  // Nắp chụp nón vàng đồng nhỏ
  const cap = new THREE.Mesh(capGeo, goldMat);
  cap.position.y = -0.004;
  g.add(cap);

  // Khối đèn lồng đỏ son nhỏ gọn phát quang ấm áp
  const lantern = new THREE.Mesh(lanternGeo, redLanternMat);
  lantern.position.y = -0.0085;
  g.add(lantern);

  // Vành nẹp vàng ở bụng đèn
  const ring = new THREE.Mesh(ringGeo, goldMat);
  ring.position.y = -0.0085;
  g.add(ring);

  // Chốt đáy đèn
  const bottomCap = new THREE.Mesh(capGeo, goldMat);
  bottomCap.rotation.x = Math.PI;
  bottomCap.position.y = -0.013;
  g.add(bottomCap);

  // Tua rua đỏ rủ bên dưới thanh mảnh
  const tassel = new THREE.Mesh(tasselGeo, tasselMat);
  tassel.position.y = -0.0165;
  g.add(tassel);

  return g;
}

export function buildPagodaTower(campus: Campus): void {
  const px = 23.5;
  const pz = 14.5;
  const targetHeight = 12.5; // Chiều cao tháp 7 tầng ~12.5m

  // 1. DỰNG BỆ MÓNG ĐÁ TAM CẤP BÁT GIÁC ĐỠ THÁP (Stone Podium)
  const stoneB = new GeometryBuilder();
  const podiumH = 0.64; // Cao độ chuẩn xác của mặt sàn bệ tháp

  // Bệ móng tầng 1 (Đá sẫm bo viền bát giác)
  stoneB.addCylinder(px, pz, 0.0, 0.32, 3.25, 3.05, 8, PALETTE.stoneDark);
  // Bệ móng tầng 2 (Đá hoa cương xám nhẵn cao 0.64m)
  stoneB.addCylinder(px, pz, 0.32, podiumH, 2.8, 2.7, 8, PALETTE.stoneLight);

  // 4 Bậc tam cấp dẫn lên tháp ở mặt tiền (Hướng Nam +Z nhìn thẳng ra Hồ Sen & Cổng Tam Quan)
  // Mỗi bậc cao đúng 0.16m, bậc 4 đạt cao độ 0.64m nối liền phẳng tuyệt đối với bệ tháp
  const stairHalfW = 1.1; // Bậc rộng 2.2m
  const innerZ = pz + 2.2; // Ăn sâu vào khối bệ móng bát giác để liền khối, không có khe hở

  const stepDepths = [3.85, 3.50, 3.15, 2.75];
  for (let i = 0; i < 4; i++) {
    const stepMaxY = (i + 1) * 0.16;
    const stepMaxZ = pz + stepDepths[i];
    stoneB.addBox(
      px - stairHalfW,
      0.0,
      innerZ,
      px + stairHalfW,
      stepMaxY,
      stepMaxZ,
      i % 2 === 0 ? PALETTE.stone : PALETTE.stoneLight
    );
  }

  // Hai thành bệ đá bo viền hai bên bậc tam cấp
  for (const signX of [-1, 1]) {
    const sx = px + signX * (stairHalfW + 0.09);
    stoneB.addBox(
      sx - 0.09,
      0.0,
      innerZ,
      sx + 0.09,
      podiumH + 0.06,
      pz + 3.95,
      PALETTE.stoneDark
    );
  }

  // 4 Trụ đèn lồng đá hoa sen hoàn thiện tại 4 góc hoa viên tháp
  const glowB = new GeometryBuilder();
  const lanternOffsets = [
    [-3.5, -3.5],
    [3.5, -3.5],
    [3.5, 3.5],
    [-3.5, 3.5],
  ];
  for (const [lx, lz] of lanternOffsets) {
    const gx = px + lx;
    const gz = pz + lz;

    // 1. Chân đế 2 tầng giật cấp bát giác
    stoneB.addCylinder(gx, gz, 0.0, 0.18, 0.44, 0.42, 8, PALETTE.stoneDark);
    stoneB.addCylinder(gx, gz, 0.18, 0.32, 0.36, 0.32, 8, PALETTE.stone);

    // 2. Vòng 8 cánh sen nổi 3D ôm quanh chân đế
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      stoneB.addPetal(
        gx,
        0.30,
        gz,
        angle,
        0.26,
        0.26,
        0.16,
        0.035,
        PALETTE.stoneLight
      );
    }

    // 3. Thân trụ đá thon ở giữa có gờ đai
    stoneB.addCylinder(gx, gz, 0.32, 1.15, 0.17, 0.14, 8, PALETTE.stone);
    stoneB.addCylinder(gx, gz, 0.70, 0.76, 0.185, 0.185, 8, PALETTE.stoneDark);

    // 4. Bát sen trên xòe 6 cánh đỡ buồng đèn
    stoneB.addCylinder(gx, gz, 1.15, 1.25, 0.16, 0.28, 8, PALETTE.stone);
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      stoneB.addPetal(
        gx,
        1.24,
        gz,
        angle,
        0.42,
        0.22,
        0.14,
        0.03,
        PALETTE.stoneLight
      );
    }

    // 5. Buồng đèn đá: 4 nan cột góc bảo vệ
    const postRadius = 0.22;
    const postThick = 0.035;
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const bx = gx + Math.cos(a) * postRadius;
      const bz = gz + Math.sin(a) * postRadius;
      stoneB.addBox(
        bx - postThick,
        1.25,
        bz - postThick,
        bx + postThick,
        1.72,
        bz + postThick,
        PALETTE.stoneDark
      );
    }

    // 6. Buồng phát sáng ngọn nến ấm (tự động đồng bộ shader nhấp nhô & ngày/đêm)
    glowB.addCylinder(
      gx,
      gz,
      1.27,
      1.70,
      0.16,
      0.16,
      8,
      new THREE.Color(0xffdf77)
    );

    // 7. Mái che nón bát giác uốn cong xòe rộng
    stoneB.addCylinder(gx, gz, 1.72, 1.94, 0.45, 0.18, 8, PALETTE.stone);
    // Đỉnh búp sen đá trên nóc đèn
    stoneB.addCylinder(gx, gz, 1.94, 2.14, 0.09, 0.015, 8, PALETTE.stoneLight);

    // Nguồn sáng ấm tỏa ra từ mỗi cột đèn
    const lanternLight = new THREE.PointLight(0xffb844, 0.85, 5.0);
    lanternLight.position.set(gx, 1.5, gz);
    campus.root.add(lanternLight);

    // Collider chống đi xuyên qua cột đèn
    campus.colliders.push({
      cx: gx,
      cz: gz,
      radius: 0.46,
    });
  }

  // Thêm Mesh bệ móng vào Campus
  const podiumGeo = stoneB.build();
  if (podiumGeo) {
    const podiumMesh = new THREE.Mesh(podiumGeo, campus.stoneMat);
    podiumMesh.castShadow = true;
    podiumMesh.receiveShadow = true;
    campus.root.add(podiumMesh);
  }

  // Thêm Mesh buồng đèn phát sáng bập bùng tự động
  const glowGeo = glowB.build();
  if (glowGeo) {
    const towerGlowMesh = new THREE.Mesh(glowGeo, campus.glowMat);
    towerGlowMesh.matrixAutoUpdate = false;
    towerGlowMesh.frustumCulled = false;
    campus.root.add(towerGlowMesh);
  }

  // Collider chống người chơi đi xuyên qua tháp
  campus.colliders.push({
    minX: px - 2.5,
    maxX: px + 2.5,
    minZ: pz - 2.5,
    maxZ: pz + 2.5,
  });

  // 2. NẠP MÔ HÌNH 3D CHÍNH XÁC CỦA THÁP BÚT (pagoda.glb)
  const loader = new GLTFLoader();
  loader.load(
    '/models/pagoda.glb',
    (gltf) => {
      const pagodaModel = gltf.scene;

      // Tính Bounding Box thực tế
      const box = new THREE.Box3().setFromObject(pagodaModel);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      // Tỷ lệ scale để đạt chiều cao chuẩn 12.5m
      const scaleFactor = targetHeight / Math.max(size.y, 0.001);

      // Căn giữa chân tháp
      pagodaModel.position.set(-center.x, -box.min.y, -center.z);

      // Bật đổ bóng cho toàn bộ các tầng mái và chi tiết
      pagodaModel.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
        }
      });

      const pagodaHolder = new THREE.Group();
      pagodaHolder.name = 'Campus_PagodaTower';
      pagodaHolder.add(pagodaModel);

      pagodaHolder.scale.set(scaleFactor, scaleFactor, scaleFactor);
      pagodaHolder.position.set(px, podiumH, pz);
      // Xoay mặt tiền tháp hướng về phía Nam cùng chiều với bậc tam cấp
      pagodaHolder.rotation.y = 0;

      // 3. TREO 20 ĐÈN LỒNG NHỎ TẠI 4 GÓC CỦA 5 TẦNG MÁI
      // Tọa độ đã được khớp chính xác tuyệt đối từ các móc giá treo góc mái của pagoda.glb
      const lanternTiers = [
        { y: 0.1585, r: 0.1494 }, // Mái tầng 1
        { y: 0.2734, r: 0.1379 }, // Mái tầng 2
        { y: 0.3884, r: 0.1264 }, // Mái tầng 3
        { y: 0.5033, r: 0.1149 }, // Mái tầng 4
        { y: 0.6182, r: 0.1034 }, // Mái tầng 5
      ];

      const cornerSigns = [
        [-1, -1],
        [1, -1],
        [1, 1],
        [-1, 1],
      ];

      for (let tierIdx = 0; tierIdx < lanternTiers.length; tierIdx++) {
        const { y, r } = lanternTiers[tierIdx];

        for (const [sx, sz] of cornerSigns) {
          const l = createHangingLantern();
          l.position.set(sx * r, y, sz * r);
          pagodaHolder.add(l);
        }

        // Nguồn sáng ấm tỏa ra từ mỗi tầng mái hắt sáng lên thân tháp và 4 góc đèn
        const tierGlow = new THREE.PointLight(0xff9933, 0.7, 5.0);
        tierGlow.position.set(px, podiumH + y * scaleFactor, pz);
        campus.root.add(tierGlow);
      }

      campus.root.add(pagodaHolder);

      // Thêm nguồn sáng ấm tôn vinh kiến trúc Tháp Bút về đêm
      const towerLight = new THREE.PointLight(0xffdf88, 1.2, 16);
      towerLight.position.set(px, podiumH + 3.0, pz);
      campus.root.add(towerLight);

      const topBeacon = new THREE.PointLight(0xffeedd, 0.8, 12);
      topBeacon.position.set(px, podiumH + targetHeight, pz);
      campus.root.add(topBeacon);
    },
    undefined,
    (err) => {
      console.error('Lỗi khi tải mô hình pagoda.glb:', err);
    }
  );
}

