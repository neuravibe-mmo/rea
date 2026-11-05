import * as THREE from 'three';
import { GeometryBuilder } from '../geometryBuilder.ts';
import { PALETTE } from '../palette.ts';
import type { Campus } from '../campus.ts';

/**
 * 7. Cây Bồ Đề Đại Thụ và Hoa Viên Cây Xanh Khuôn Viên Chùa
 */
export function buildBodhiTree(campus: Campus): void {
    const woodB = new GeometryBuilder();
    const leavesB = new GeometryBuilder();
    const stoneB = new GeometryBuilder();

    // Danh sách các cây Bồ đề cổ thụ và cây hoa viên trong khuôn viên
    const trees: { x: number; z: number; scale: number; hasBench: boolean }[] =
      [
        { x: -15.6, z: 7.0, scale: 1.25, hasBench: true }, // Cây Bồ Đề Đại Thụ chính
        { x: -26.0, z: -8.0, scale: 1.05, hasBench: false }, // Cây vườn Quan Âm
        { x: 21.5, z: 24.0, scale: 0.95, hasBench: false }, // Cây cạnh hồ sen
        { x: 21.0, z: -10.0, scale: 1.0, hasBench: false }, // Cây sau tháp chuông
      ];

    // Cấu hình 9 cụm đám mây tán lá (Canopy clusters)
    const cloudClusters: [number, number, number, number][] = [
      [0, 6.2, 0, 2.6],
      [2.6, 5.4, 0.9, 2.1],
      [-2.4, 5.3, -1.6, 2.2],
      [-0.8, 5.8, 2.6, 2.0],
      [1.4, 7.2, -1.1, 1.8],
      [-2.1, 6.8, 0.8, 1.7],
      [3.2, 6.2, -1.4, 1.6],
      [0.6, 4.8, -2.8, 1.7],
      [-3.2, 4.8, 1.7, 1.6],
    ];

    // Cấu hình các cành nhánh chính
    const branchConfigs: [number, number, number, number, number][] = [
      [2.7, 5.2, 1.0, 0.28, 0.12],
      [-2.3, 5.0, -1.7, 0.26, 0.11],
      [-0.9, 5.5, 2.4, 0.25, 0.1],
      [1.5, 6.2, -1.4, 0.22, 0.09],
    ];

    // Cấu hình rễ phụ buông rủ
    const tendrilConfigs: [number, number, number, number][] = [
      [1.8, 4.8, 0.8, 3.2],
      [-1.6, 4.6, -1.2, 3.0],
      [0.7, 5.2, -2.0, 3.5],
      [-1.2, 5.0, 1.9, 3.1],
    ];

    for (const tree of trees) {
      const tx = tree.x;
      const tz = tree.z;
      const r = tree.scale;

      // 1. Thân cây cổ thụ thuôn dần lên trên
      woodB.addCylinder(
        tx,
        tz,
        0.08,
        3.5 * r,
        0.72 * r,
        0.44 * r,
        10,
        PALETTE.woodDark,
      );

      // 2. Hệ bạnh rễ cổ thụ (Buttress roots) tỏa tròn cắm xuống đất
      const rootAngles = [0.15, 1.15, 2.1, 3.25, 4.35, 5.35];
      for (const a of rootAngles) {
        const rx = Math.cos(a);
        const rz = Math.sin(a);
        woodB.addLimb(
          new THREE.Vector3(tx + rx * 0.44 * r, 1.0 * r, tz + rz * 0.44 * r),
          new THREE.Vector3(tx + rx * 1.65 * r, 0.08, tz + rz * 1.65 * r),
          0.22 * r,
          0.07 * r,
          6,
          PALETTE.woodDark,
        );
      }

      // 3. Các cành lớn phân nhánh
      for (const [bx, by, bz, r0, r1] of branchConfigs) {
        woodB.addLimb(
          new THREE.Vector3(tx, 3.1 * r, tz),
          new THREE.Vector3(tx + bx * r, by * r, tz + bz * r),
          r0 * r,
          r1 * r,
          6,
          PALETTE.woodDark,
        );
      }

      // 4. Các đám mây tán lá mây hữu cơ và phiến lá Bồ Đề hình tim
      for (const [cx, cy, cz, cr] of cloudClusters) {
        const center = new THREE.Vector3(tx + cx * r, cy * r, tz + cz * r);

        leavesB.addDeformedSphere(
          center,
          cr * r,
          cr * r * 0.78,
          cr * r,
          0.24,
          new THREE.Color(0x355e2b), // Base màu xanh sẫm
          new THREE.Color(0x60993e), // Crown màu xanh tươi
          10,
          8,
        );

        // Phiến lá bồ đề nhọn đuôi rải rác trên tán lá
        for (let li = 0; li < 6; li++) {
          const theta = (li / 6) * Math.PI * 2 + cx;
          const phi = (li % 3) * 0.4 + 0.6;
          const normal = new THREE.Vector3(
            Math.cos(theta) * Math.sin(phi),
            Math.cos(phi),
            Math.sin(theta) * Math.sin(phi),
          ).normalize();
          const leafPos = center.clone().addScaledVector(normal, cr * r * 0.92);
          leavesB.addBodhiLeaf(
            leafPos,
            normal,
            0.32 * r,
            new THREE.Color(0x72ad48),
          );
        }
      }

      // 5. Rễ phụ buông rủ từ cành cao
      for (const [tx_off, ty_start, tz_off, len] of tendrilConfigs) {
        woodB.addLimb(
          new THREE.Vector3(tx + tx_off * r, ty_start * r, tz + tz_off * r),
          new THREE.Vector3(
            tx + tx_off * r + 0.1,
            (ty_start - len) * r,
            tz + tz_off * r - 0.1,
          ),
          0.035 * r,
          0.015 * r,
          4,
          PALETTE.woodDark,
        );
      }

      // 6. Băng ghế đá tròn thiền tọa (nếu có)
      if (tree.hasBench) {
        const benchR = 2.4;
        stoneB.addCylinder(
          tx,
          tz,
          0.08,
          0.52,
          benchR + 0.48,
          benchR,
          18,
          PALETTE.stoneLight,
        );
        campus.colliders.push({
          cx: tx,
          cz: tz,
          radius: benchR + 0.48,
        });
      } else {
        campus.colliders.push({
          cx: tx,
          cz: tz,
          radius: 1.1 * r,
        });
      }
    }

    // Dựng Mesh gỗ (Thân, cành, rễ)
    const woodGeom = woodB.build();
    if (woodGeom) {
      const woodMesh = new THREE.Mesh(woodGeom, campus.woodMat);
      woodMesh.castShadow = true;
      woodMesh.receiveShadow = true;
      woodMesh.matrixAutoUpdate = false;
      campus.root.add(woodMesh);
    }

    // Dựng Mesh tán lá (Toàn bộ lá cây sân chùa gom vào 1 Mesh duy nhất)
    const leavesGeom = leavesB.build();
    if (leavesGeom) {
      campus.leavesMesh = new THREE.Mesh(leavesGeom, campus.leafMat);
      campus.leavesMesh.castShadow = true;
      campus.leavesMesh.receiveShadow = true;
      campus.leavesMesh.matrixAutoUpdate = false;
      campus.root.add(campus.leavesMesh);
    }

    // Dựng Mesh ghế đá
    const stoneGeom = stoneB.build();
    if (stoneGeom) {
      const stoneMesh = new THREE.Mesh(stoneGeom, campus.stoneMat);
      stoneMesh.castShadow = true;
      stoneMesh.receiveShadow = true;
      stoneMesh.matrixAutoUpdate = false;
      campus.root.add(stoneMesh);
    }
  }

  /**
   * 8. CHÒI CHUÔNG CHÙA (BELL TOWER / PHƯƠNG ĐÌNH 2 TẦNG 8 MÁI CHỒNG DIÊM)
   * Tọa độ trung tâm: (x: 15.5, z: 4.0)
   * Thiết kế chuẩn xác 100% theo bản phối cảnh 3D kiến trúc cổ truyền Việt Nam:
   * - Bệ móng ốp gạch thẻ, sàn đá hoa cương nhẵn bóng, bậc tam cấp & đôi Rồng đá thời Lê/Lý
   * - Hệ lan can đá chạm trổ bao quanh với 20 trụ đá đỉnh búp sen nở
   * - 4 Chân tảng đá hoa sen chạm nổi 16 cánh sen ngửa và 4 cột gỗ lim đồ sộ tầng 1
   * - Quả Đại Hồng Chung đúc bằng đồng nguyên khối treo ở tâm tầng 1 với quai rồng Bồ Lao & 2 xích sắt
   * - Chày kình (dùi gỗ gõ chuông) treo nằm ngang bên cạnh bằng 2 sợi xích sắt song song
   * - Hệ vì kèo, kẻ góc, bẩy xà nách gỗ lim uốn lượn đỡ lấy 4 góc mái hạ
   * - Tầng cổ diêm (Tầng 2) với lan can gỗ chấn song thông thoáng và 4 cột gỗ thanh thoát
   * - 8 Đầu đao vân mây cuộn bằng đá xám trắng (4 tầng hạ + 4 tầng thượng) vút cao ngạo nghễ
   * - Đỉnh chóp nóc ngự Bình Hồ Lô phong thủy dát vàng và Cây Kim Thu Lôi vút thẳng lên trời
   */