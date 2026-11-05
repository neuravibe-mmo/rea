import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { Campus } from '../campus.ts';

/**
 * ============================================================================
 * STAIR DRAGON (RỒNG ĐÁ BẬC TAM CẤP THÁP CHUÔNG)
 * ============================================================================
 * Nạp mô hình 3D dragon.glb từ /models/dragon.glb và phủ chất liệu ĐÁ CẨM THẠCH
 * nguyên khối (Opaque Stone Marble) không trong suốt, tạo vẻ uy nghi cổ kính.
 * - Đầu rồng vươn cao ở chân bậc thềm, hướng thẳng ra ngoài sân chùa (+Z).
 * - Đuôi rồng uốn lượn ở đỉnh bậc thềm (-Z).
 * - Cặp rồng đối xứng gương hoàn hảo qua trục giữa cầu thang.
 */

export function buildStairDragons(campus: Campus): void {
  const bx = 15.5;
  const bz = 4.0;

  const loader = new GLTFLoader();
  loader.load(
    '/models/dragon.glb',
    (gltf) => {
      const originalModel = gltf.scene;

      // Tính toán Bounding Box để căn chuẩn tâm và đáy mô hình
      const box = new THREE.Box3().setFromObject(originalModel);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());

      // Kích thước chuẩn cho thành dốc tam cấp tháp chuông:
      // Chiều dài dốc ~ 1.20m, độ nâng dốc ~ 19 độ
      const targetLength = 1.18;
      const dragonScale = targetLength / Math.max(size.x, 0.001);

      // Căn giữa mô hình gốc quanh trục cục bộ
      originalModel.position.set(-center.x, -box.min.y, -center.z);

      // 1. VẬT LIỆU ĐÁ CẨM THẠCH NGUYÊN KHỐI (Không trong suốt)
      // Màu đá trắng ngà xám tự nhiên như tượng Phật đá và lan can chùa cổ
      const stoneMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0xe3ddd3), // Đá cẩm thạch tự nhiên
        roughness: 0.48,                 // Độ nhám bề mặt đá đục đẽo
        metalness: 0.02,                 // Phi kim loại đặc
      });

      // Thay thế toàn bộ vật liệu trong suốt cũ bằng vật liệu đá đặc
      originalModel.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          mesh.material = stoneMat;
          mesh.castShadow = true;
          mesh.receiveShadow = true;
        }
      });

      // Vị trí trung tâm thành lan can dốc:
      // zBot = bz + 3.86 (7.86 - chân bậc), zTop = bz + 2.65 (6.65 - sàn đỉnh)
      const zMid = bz + 3.25; // 7.25
      const yMid = 0.40;      // Nằm chuẩn trên mặt đá lan can
      const slopeAngle = 0.24; // Nghiêng đầu thấp xuống chân bậc, đuôi vểnh lên sàn tháp chuông

      // 1. RỒNG BÊN TRÁI (LEFT BALUSTRADE DRAGON)
      // Đầu hướng ra sân chùa (+Z), đuôi ở đỉnh bậc (-Z)
      const leftHolder = new THREE.Group();
      leftHolder.name = 'BellTower_StairDragon_Left';
      const leftDragon = originalModel.clone(true);
      leftHolder.add(leftDragon);

      leftHolder.scale.set(dragonScale, dragonScale, dragonScale);
      leftHolder.rotation.set(slopeAngle, Math.PI / 2, 0);
      leftHolder.position.set(bx - 0.98, yMid, zMid);
      campus.root.add(leftHolder);

      // 2. RỒNG BÊN PHẢI (RIGHT BALUSTRADE DRAGON - ĐỐI XỨNG GƯƠNG)
      // Lật đối xứng sườn qua scale.z âm để 2 con rồng chầu hướng vào lòng cầu thang
      const rightHolder = new THREE.Group();
      rightHolder.name = 'BellTower_StairDragon_Right';
      const rightDragon = originalModel.clone(true);
      rightHolder.add(rightDragon);

      rightHolder.scale.set(dragonScale, dragonScale, -dragonScale);
      rightHolder.rotation.set(slopeAngle, Math.PI / 2, 0);
      rightHolder.position.set(bx + 0.98, yMid, zMid);
      campus.root.add(rightHolder);
    },
    undefined,
    (err) => {
      console.error('Không thể load mô hình dragon.glb vào Tháp Chuông:', err);
    }
  );
}
