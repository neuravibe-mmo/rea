import * as THREE from "three";
import { GeometryBuilder } from "../geometryBuilder.ts";
import { PALETTE } from "../palette.ts";
import type { Campus } from "../campus.ts";

export interface ImperialDragonOptions {
  position?: THREE.Vector3;
  rotation?: THREE.Euler;
  scale?: number;
  mirrored?: boolean; // Lật gương đối xứng cho lan can trái / phải
  includeStairs?: boolean; // Bao gồm bậc thang và lan can đá
  stepCount?: number; // Số bậc thang (mặc định 8 bậc như hình mẫu)
  stepWidth?: number;
  stepRise?: number;
  stepRun?: number;
}

/**
 * Tạo mô hình 3D Rồng Đá Cẩm Thạch Lan Can Bậc Tam Cấp (Vietnamese Imperial White Marble Dragon Balustrade)
 * Phục dựng tỉ mỉ 100% từ ảnh tư liệu:
 * 1. Bệ đôn hoa sen 2 tầng chạm trổ hoa văn thếp vàng (Dual-tiered lotus petal pedestal)
 * 2. Cầu thang & lan can dốc đá cẩm thạch ngọc trắng (Marble staircase & balustrade ramp)
 * 3. Thân rồng uốn lượn 2 nhịp hình sin uốn khúc uyển chuyển (Sinuous undulating dragon body)
 * 4. Đầu rồng thời Lê/Nguyễn với mũi mây cuộn, râu xoáy, sừng nhung viền vàng ngậm Ngọc Minh Châu phát sáng
 * 5. Dãy vây lưng lửa (dorsal flame crest) và vảy rồng chạm nổi
 * 6. Tứ chi vạm vỡ với móng vuốt nhọn thếp vàng bám chắc vào lan can
 * 7. Đuôi rồng xoáy cuộn thành chùm ngọn lửa vút cao ở đỉnh bậc thang
 */
export function createImperialDragonModel(
  options: ImperialDragonOptions = {},
): THREE.Group {
  const group = new THREE.Group();
  group.name = "ImperialDragonBalustrade";

  const {
    position = new THREE.Vector3(0, 0, 0),
    rotation = new THREE.Euler(0, 0, 0),
    scale = 1.0,
    mirrored = false,
    includeStairs = true,
    stepCount = 8,
    stepWidth = 2.4,
    stepRise = 0.22,
    stepRun = 0.42,
  } = options;

  const marbleB = new GeometryBuilder();
  const goldB = new GeometryBuilder();

  // Bảng màu đá cẩm thạch trắng ngà & vàng kim hoàng gia
  const marbleCol = new THREE.Color(0xf4f1eb); // Bạch ngọc cẩm thạch
  const marbleDark = new THREE.Color(0xdad4c8); // Đổ bóng đá chạm khắc
  const goldCol = PALETTE.gold; // Vàng kim thếp
  const goldBright = PALETTE.goldLight; // Vàng kim sáng

  const mirrorX = mirrored ? -1 : 1;

  // =========================================================================
  // 1. CẦU THANG & LAN CAN DỐC ĐÁ CẨM THẠCH (Staircase & Balustrade Ramp)
  // =========================================================================
  const totalLength = stepCount * stepRun;
  const totalHeight = stepCount * stepRise;
  const balustradeThickness = 0.45;
  const balustradeHeight = 0.65;
  const balustradeX = (stepWidth * 0.5 - balustradeThickness * 0.5) * mirrorX;

  if (includeStairs) {
    // Các bậc đá cẩm thạch
    for (let i = 0; i < stepCount; i++) {
      const z0 = i * stepRun;
      const z1 = (i + 1) * stepRun + 0.04;
      const y0 = 0;
      const y1 = (i + 1) * stepRise;

      marbleB.addBox(
        -stepWidth * 0.5,
        y0,
        z0,
        stepWidth * 0.5,
        y1,
        z1,
        marbleCol,
      );

      // Gờ mũi bậc thang (Tread nosing) chạm chỉ viền
      marbleB.addBox(
        -stepWidth * 0.5 - 0.02,
        y1 - 0.04,
        z1 - 0.04,
        stepWidth * 0.5 + 0.02,
        y1,
        z1 + 0.03,
        marbleDark,
      );
    }

    // Tường bao hông thang bậc
    marbleB.addBox(
      balustradeX - balustradeThickness * 0.55 * mirrorX,
      0,
      -0.2,
      balustradeX + balustradeThickness * 0.55 * mirrorX,
      totalHeight + 0.1,
      totalLength + 0.2,
      marbleCol,
    );

    // Bề mặt dốc của lan can (Sloping Balustrade Ramp) đỡ thân rồng
    const rampSegments = 16;
    for (let i = 0; i < rampSegments; i++) {
      const t0 = i / rampSegments;
      const t1 = (i + 1) / rampSegments;
      const z0 = t0 * totalLength;
      const z1 = t1 * totalLength;
      const y0 = t0 * totalHeight + balustradeHeight;
      const y1 = t1 * totalHeight + balustradeHeight;

      // Mặt mặt trượt dốc của lan can
      marbleB.addBox(
        balustradeX - balustradeThickness * 0.5,
        y0 - 0.08,
        z0,
        balustradeX + balustradeThickness * 0.5,
        y1,
        z1,
        marbleDark,
      );

      // Gờ viền chỉ đôi lan can (Molding chamfers)
      marbleB.addBox(
        balustradeX - (balustradeThickness * 0.5 + 0.03),
        y1 - 0.03,
        z0,
        balustradeX - balustradeThickness * 0.5,
        y1 + 0.03,
        z1,
        marbleCol,
      );
      marbleB.addBox(
        balustradeX + balustradeThickness * 0.5,
        y1 - 0.03,
        z0,
        balustradeX + (balustradeThickness * 0.5 + 0.03),
        y1 + 0.03,
        z1,
        marbleCol,
      );
    }
  }

  // =========================================================================
  // 2. BỆ ĐÔN ĐÁ HOA SEN CHÂN THANG (Dual-Tiered Lotus Petal Pedestal)
  // =========================================================================
  const pedZ = -0.45;
  const pedX = balustradeX;
  const pedY = 0;
  const pedR = 0.58;

  // Đế tròn chân tảng
  marbleB.addCylinder(pedX, pedZ, pedY, pedY + 0.12, pedR + 0.08, pedR + 0.06, 24, marbleCol);
  goldB.addCylinder(pedX, pedZ, pedY + 0.11, pedY + 0.13, pedR + 0.085, pedR + 0.085, 24, goldCol);

  // Tầng sen hạ (cánh sen chúc xuống / úp)
  const lowerPetalCount = 14;
  for (let i = 0; i < lowerPetalCount; i++) {
    const angle = (i / lowerPetalCount) * Math.PI * 2;
    marbleB.addPetal(
      pedX + Math.cos(angle) * (pedR * 0.75),
      pedY + 0.14,
      pedZ + Math.sin(angle) * (pedR * 0.75),
      angle,
      -0.45,
      0.24,
      0.18,
      0.035,
      marbleCol,
    );
    // Viền vàng đầu cánh sen
    goldB.addPetal(
      pedX + Math.cos(angle) * (pedR * 0.85),
      pedY + 0.12,
      pedZ + Math.sin(angle) * (pedR * 0.85),
      angle,
      -0.45,
      0.08,
      0.08,
      0.02,
      goldBright,
    );
  }

  // Thắt đáy lưng ong (Cổ đôn đá chạm văn hoa mây)
  marbleB.addCylinder(pedX, pedZ, pedY + 0.22, pedY + 0.35, pedR * 0.78, pedR * 0.82, 20, marbleDark);
  goldB.addCylinder(pedX, pedZ, pedY + 0.27, pedY + 0.29, pedR * 0.84, pedR * 0.84, 20, goldCol);

  // Tầng sen thượng (cánh sen ngửa lên nâng đỡ thân rồng)
  const upperPetalCount = 14;
  for (let i = 0; i < upperPetalCount; i++) {
    const angle = (i / upperPetalCount) * Math.PI * 2 + 0.2;
    marbleB.addPetal(
      pedX + Math.cos(angle) * (pedR * 0.72),
      pedY + 0.35,
      pedZ + Math.sin(angle) * (pedR * 0.72),
      angle,
      0.55,
      0.26,
      0.2,
      0.04,
      marbleCol,
    );
    // Viền vàng đầu cánh sen thượng
    goldB.addPetal(
      pedX + Math.cos(angle) * (pedR * 0.82),
      pedY + 0.44,
      pedZ + Math.sin(angle) * (pedR * 0.82),
      angle,
      0.55,
      0.09,
      0.08,
      0.02,
      goldCol,
    );
  }

  // Mặt trên đôn sen đỡ móng vuốt và ức rồng
  marbleB.addCylinder(pedX, pedZ, pedY + 0.48, pedY + 0.56, pedR * 0.88, pedR * 0.9, 24, marbleCol);
  goldB.addCylinder(pedX, pedZ, pedY + 0.55, pedY + 0.57, pedR * 0.92, pedR * 0.92, 24, goldCol);

  // =========================================================================
  // 3. THÂN RỒNG UỐN LƯỢN DỌC THEO LAN CAN (Sinuous Undulating Dragon Spine)
  // =========================================================================
  // Đường cong cột sống spline 3D qua 9 điểm kiểm soát chính xác theo bức ảnh
  const curvePoints: THREE.Vector3[] = [
    // 0: Điểm neo ức rồng trên đôn sen
    new THREE.Vector3(pedX, pedY + 0.62, pedZ),
    // 1: Cổ rồng vươn cao
    new THREE.Vector3(pedX, pedY + 1.25, pedZ + 0.15),
    // 2: Khúc lượn ngực thứ nhất (Crest 1 - nhô cao uy nghi)
    new THREE.Vector3(balustradeX, balustradeHeight + 1.15, 0.45),
    // 3: Đáy võng thứ nhất chạm nhẹ lan can dốc
    new THREE.Vector3(balustradeX, balustradeHeight + 0.42 + 0.28 * (1.2 / totalLength) * totalHeight, 1.25),
    // 4: Khúc lượn lưng thứ hai (Crest 2 - đỉnh lượn giữa thang)
    new THREE.Vector3(balustradeX, balustradeHeight + 0.98 + (2.0 / totalLength) * totalHeight, 2.05),
    // 5: Đáy võng thứ hai
    new THREE.Vector3(balustradeX, balustradeHeight + 0.38 + (2.65 / totalLength) * totalHeight, 2.7),
    // 6: Khúc lượn hông đuôi
    new THREE.Vector3(balustradeX, balustradeHeight + 0.68 + (3.1 / totalLength) * totalHeight, 3.15),
    // 7: Đuôi rồng thon dần lên đỉnh bậc thang
    new THREE.Vector3(balustradeX, totalHeight + balustradeHeight + 0.35, totalLength - 0.1),
    // 8: Chót đuôi uốn vút lên trời
    new THREE.Vector3(balustradeX, totalHeight + balustradeHeight + 0.95, totalLength + 0.05),
  ];

  const dragonSpline = new THREE.CatmullRomCurve3(curvePoints, false, "centripetal", 0.5);
  const spineSteps = 38;
  const spinePoints: THREE.Vector3[] = dragonSpline.getPoints(spineSteps);

  // Loft thân rồng dạng ống lượn thuôn dần từ ức (r=0.28) về đuôi (r=0.06)
  for (let i = 0; i < spineSteps; i++) {
    const p0 = spinePoints[i];
    const p1 = spinePoints[i + 1];
    const t0 = i / spineSteps;
    const t1 = (i + 1) / spineSteps;

    // Bán kính thân rồng: phình ở ức ngực, thon mềm về đuôi
    const r0 = THREE.MathUtils.lerp(0.28, 0.05, Math.pow(t0, 0.85)) * (1.0 + Math.sin(t0 * Math.PI) * 0.15);
    const r1 = THREE.MathUtils.lerp(0.28, 0.05, Math.pow(t1, 0.85)) * (1.0 + Math.sin(t1 * Math.PI) * 0.15);

    // Đoạn thân chính bằng đá cẩm thạch
    marbleB.addLimb(p0, p1, r0, r1, 10, marbleCol, false);

    // Bụng rồng (Vân bụng vàng ngà nhạt chạm rãnh ngang)
    const bellyDir = new THREE.Vector3(0, -1, 0.15).normalize();
    const bellyP0 = p0.clone().addScaledVector(bellyDir, r0 * 0.88);
    const bellyP1 = p1.clone().addScaledVector(bellyDir, r1 * 0.88);
    marbleB.addLimb(bellyP0, bellyP1, r0 * 0.55, r1 * 0.55, 6, marbleDark, false);

    // =======================================================================
    // DÃY VÂY LƯNG NGỌN LỬA DỌC SỐNG LƯNG RỒNG (Dorsal Flame Crest)
    // =======================================================================
    if (i >= 2 && i < spineSteps - 2) {
      const segDir = new THREE.Vector3().subVectors(p1, p0).normalize();
      const dorsalNormal = new THREE.Vector3().crossVectors(segDir, new THREE.Vector3(1, 0, 0)).normalize();
      if (dorsalNormal.y < 0) dorsalNormal.negate();

      const finBase = p0.clone().addScaledVector(dorsalNormal, r0 * 0.95);
      const finHeight = Math.max(0.12, 0.38 * (1.0 - t0 * 0.55));
      const finTip = finBase.clone().addScaledVector(dorsalNormal, finHeight).addScaledVector(segDir, -0.06);

      // Thân vây lửa đá cẩm thạch
      marbleB.addLimb(finBase, finTip, 0.045 * (1.0 - t0 * 0.4), 0.008, 4, marbleCol, true);

      // Ngọn lửa uốn vút thếp vàng ở chóp vây
      const goldFlameTip = finTip.clone().addScaledVector(dorsalNormal, 0.07).addScaledVector(segDir, -0.04);
      goldB.addLimb(finTip, goldFlameTip, 0.018, 0.003, 4, goldCol, true);

      // Vảy rồng nổi khối hai bên mạn sườn
      if (i % 2 === 0) {
        const flankLeft = p0.clone().add(new THREE.Vector3(-r0 * 0.85, 0, 0));
        const flankRight = p0.clone().add(new THREE.Vector3(r0 * 0.85, 0, 0));
        marbleB.addLimb(flankLeft, flankLeft.clone().addScaledVector(segDir, 0.06), 0.035, 0.015, 4, marbleDark, true);
        marbleB.addLimb(flankRight, flankRight.clone().addScaledVector(segDir, 0.06), 0.035, 0.015, 4, marbleDark, true);
      }
    }
  }

  // =========================================================================
  // 4. ĐẦU RỒNG THỜI NGUYỄN / LÊ HOÀNG GIA (Sculpted Imperial Dragon Head)
  // =========================================================================
  const headPos = new THREE.Vector3(pedX, pedY + 1.48, pedZ - 0.28);
  const headForward = new THREE.Vector3(0, -0.15, -1).normalize();
  const headUp = new THREE.Vector3(0, 1, -0.15).normalize();
  const headRight = new THREE.Vector3(1, 0, 0);

  // Khối sọ rồng (Cranium)
  marbleB.addDeformedSphere(headPos, 0.24, 0.2, 0.28, 0.05, marbleDark, marbleCol, 10, 8);

  // Mõm rồng & Hàm trên (Upper Snout & Cloud Muzzle)
  const snoutBase = headPos.clone().addScaledVector(headForward, 0.18);
  const snoutTip = snoutBase.clone().addScaledVector(headForward, 0.32).addScaledVector(headUp, 0.08);
  marbleB.addLimb(snoutBase, snoutTip, 0.16, 0.12, 8, marbleCol, true);

  // Mũi mây cuộn sóng đặc trưng rồng Việt (Upturned S-cloud snout apex)
  const cloudNoseApex = snoutTip.clone().addScaledVector(headUp, 0.14).addScaledVector(headForward, -0.05);
  marbleB.addLimb(snoutTip, cloudNoseApex, 0.09, 0.04, 6, marbleCol, true);
  goldB.addLimb(cloudNoseApex, cloudNoseApex.clone().addScaledVector(headUp, 0.05), 0.04, 0.01, 4, goldCol, true);

  // Hàm dưới mở rộng đỡ viên ngọc (Lower Jaw)
  const jawBase = headPos.clone().addScaledVector(headUp, -0.12).addScaledVector(headForward, 0.08);
  const jawTip = jawBase.clone().addScaledVector(headForward, 0.34).addScaledVector(headUp, -0.08);
  marbleB.addLimb(jawBase, jawTip, 0.14, 0.09, 6, marbleCol, true);

  // Răng nanh sắc nhọn (Sharp Fangs)
  const fangL_base = snoutTip.clone().addScaledVector(headRight, -0.09).addScaledVector(headUp, -0.03);
  const fangL_tip = fangL_base.clone().addScaledVector(headUp, -0.13).addScaledVector(headForward, -0.02);
  const fangR_base = snoutTip.clone().addScaledVector(headRight, 0.09).addScaledVector(headUp, -0.03);
  const fangR_tip = fangR_base.clone().addScaledVector(headUp, -0.13).addScaledVector(headForward, -0.02);
  marbleB.addLimb(fangL_base, fangL_tip, 0.024, 0.005, 4, marbleCol, true);
  marbleB.addLimb(fangR_base, fangR_tip, 0.024, 0.005, 4, marbleCol, true);

  // Cặp mắt rồng uy nghi lồi nhẹ với tròng mắt mạ vàng (Dragon Eyes & Brows)
  const eyeL = headPos.clone().addScaledVector(headForward, 0.12).addScaledVector(headRight, -0.15).addScaledVector(headUp, 0.08);
  const eyeR = headPos.clone().addScaledVector(headForward, 0.12).addScaledVector(headRight, 0.15).addScaledVector(headUp, 0.08);
  marbleB.addDeformedSphere(eyeL, 0.065, 0.05, 0.065, 0.02, marbleDark, marbleCol, 6, 5);
  marbleB.addDeformedSphere(eyeR, 0.065, 0.05, 0.065, 0.02, marbleDark, marbleCol, 6, 5);
  goldB.addLimb(eyeL, eyeL.clone().addScaledVector(headRight, -0.02), 0.035, 0.035, 6, goldCol, true);
  goldB.addLimb(eyeR, eyeR.clone().addScaledVector(headRight, 0.02), 0.035, 0.035, 6, goldCol, true);

  // Cặp sừng rồng nhiều nhánh vút cong về sau viền vàng hoàng gia (Sweeping Antlers)
  const antlerOffsets = [-0.11, 0.11];
  for (const xOff of antlerOffsets) {
    const root = headPos.clone().addScaledVector(headRight, xOff).addScaledVector(headUp, 0.16);
    const midHorn = root.clone().add(new THREE.Vector3(xOff * 0.9, 0.28, 0.22));
    const tipHorn = midHorn.clone().add(new THREE.Vector3(xOff * 1.2, 0.32, 0.38));
    marbleB.addLimb(root, midHorn, 0.065, 0.042, 6, marbleCol, false);
    marbleB.addLimb(midHorn, tipHorn, 0.042, 0.015, 6, marbleCol, true);
    // Đầu sừng bịt vàng
    goldB.addLimb(tipHorn, tipHorn.clone().add(new THREE.Vector3(xOff * 0.2, 0.08, 0.1)), 0.018, 0.003, 4, goldBright, true);

    // Nhánh phụ của sừng chĩa ngang
    const subBranch = midHorn.clone().add(new THREE.Vector3(xOff * 0.35, 0.14, -0.05));
    marbleB.addLimb(midHorn, subBranch, 0.03, 0.01, 4, marbleCol, true);
    goldB.addLimb(subBranch, subBranch.clone().add(new THREE.Vector3(xOff * 0.1, 0.05, -0.02)), 0.012, 0.002, 4, goldCol, true);
  }

  // Đôi râu rồng mềm mại uốn lượn (Flowing Whiskers)
  const whiskerRoots = [
    { base: snoutTip.clone().add(new THREE.Vector3(-0.11, -0.02, 0)), sign: -1 },
    { base: snoutTip.clone().add(new THREE.Vector3(0.11, -0.02, 0)), sign: 1 },
  ];
  for (const w of whiskerRoots) {
    const p0 = w.base;
    const p1 = p0.clone().add(new THREE.Vector3(w.sign * 0.18, 0.08, -0.15));
    const p2 = p1.clone().add(new THREE.Vector3(w.sign * 0.22, -0.12, 0.1));
    const p3 = p2.clone().add(new THREE.Vector3(w.sign * 0.15, -0.22, 0.28));
    marbleB.addLimb(p0, p1, 0.032, 0.022, 4, marbleCol, false);
    marbleB.addLimb(p1, p2, 0.022, 0.014, 4, marbleCol, false);
    marbleB.addLimb(p2, p3, 0.014, 0.004, 4, marbleCol, true);
    // Gốc râu thếp vàng
    goldB.addLimb(p0, p0.clone().addScaledVector(headRight, w.sign * 0.03), 0.035, 0.03, 4, goldCol, true);
  }

  // Bờm lửa xếp tầng sau gáy (Flame Mane Crests)
  for (let m = 0; m < 5; m++) {
    const mAngle = (m - 2) * 0.28;
    const maneBase = headPos.clone().add(new THREE.Vector3(Math.sin(mAngle) * 0.18, 0.12, 0.15));
    const maneTip = maneBase.clone().add(new THREE.Vector3(Math.sin(mAngle) * 0.35, 0.22, 0.42));
    marbleB.addLimb(maneBase, maneTip, 0.055, 0.01, 4, marbleCol, true);
    goldB.addLimb(maneTip, maneTip.clone().add(new THREE.Vector3(Math.sin(mAngle) * 0.08, 0.05, 0.1)), 0.012, 0.002, 4, goldBright, true);
  }

  // =========================================================================
  // 5. VIÊN NGỌC MINH CHÂU PHÁT SÁNG (Radiant Flaming Dragon Pearl)
  // =========================================================================
  const pearlPos = jawBase.clone().addScaledVector(headForward, 0.26).addScaledVector(headUp, 0.04);
  const pearlRadius = 0.14;

  const pearlGeom = new THREE.SphereGeometry(pearlRadius, 20, 16);
  const pearlMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0xff8c00), // Cam lửa hổ phách
    emissive: new THREE.Color(0xffbb33), // Vàng cam phát quang
    emissiveIntensity: 1.4,
    roughness: 0.1,
    metalness: 0.3,
  });
  const pearlMesh = new THREE.Mesh(pearlGeom, pearlMat);
  pearlMesh.position.copy(pearlPos);
  group.add(pearlMesh);

  // Lửa thiêng cuộn quanh viên ngọc (Flame tongues cupping the pearl)
  const flameCount = 5;
  for (let f = 0; f < flameCount; f++) {
    const fAngle = (f / flameCount) * Math.PI * 2;
    const fBase = pearlPos.clone().add(new THREE.Vector3(Math.cos(fAngle) * 0.12, -0.08, Math.sin(fAngle) * 0.12));
    const fTip = fBase.clone().add(new THREE.Vector3(Math.cos(fAngle) * 0.06, 0.16, Math.sin(fAngle) * 0.06));
    goldB.addLimb(fBase, fTip, 0.035, 0.005, 4, goldBright, true);
  }

  // Nguồn sáng ấm tỏa ra từ viên ngọc minh châu
  const pearlLight = new THREE.PointLight(0xffaa22, 1.8, 4.0, 1.2);
  pearlLight.position.copy(pearlPos);
  group.add(pearlLight);

  // =========================================================================
  // 6. TỨ CHI VÀ MÓNG VUỐT THẾP VÀNG BÁM CHẮC (Muscular Limbs & Gold Talons)
  // =========================================================================
  // Hàm tạo chân rồng cơ bắp có khuỷu lửa và 4 móng vuốt nhọn thếp vàng
  const addDragonLeg = (
    hip: THREE.Vector3,
    knee: THREE.Vector3,
    ankle: THREE.Vector3,
    footCenter: THREE.Vector3,
    gripNormal: THREE.Vector3,
    legScale = 1.0,
  ) => {
    // Đùi trên & Cẳng chân
    marbleB.addLimb(hip, knee, 0.13 * legScale, 0.095 * legScale, 6, marbleCol, false);
    marbleB.addLimb(knee, ankle, 0.095 * legScale, 0.07 * legScale, 6, marbleCol, false);
    marbleB.addLimb(ankle, footCenter, 0.07 * legScale, 0.085 * legScale, 6, marbleCol, true);

    // Đám mây lửa ở đầu gối / khuỷu chân (Flame fin on joint)
    const flameDir = new THREE.Vector3().subVectors(knee, hip).normalize().reflect(gripNormal).normalize();
    const flameKneeTip = knee.clone().addScaledVector(flameDir, 0.28 * legScale);
    marbleB.addLimb(knee, flameKneeTip, 0.05 * legScale, 0.008, 4, marbleCol, true);
    goldB.addLimb(flameKneeTip, flameKneeTip.clone().addScaledVector(flameDir, 0.07), 0.012, 0.002, 4, goldBright, true);

    // 4 Móng vuốt rồng hoàng gia nhọn hoắt thếp vàng (4 Sharp Imperial Gold Talons)
    const clawAngles = [-0.65, -0.2, 0.25, 0.7];
    const forwardVec = new THREE.Vector3().crossVectors(gripNormal, headRight).normalize();
    for (const ca of clawAngles) {
      const clawDir = forwardVec.clone().applyAxisAngle(gripNormal, ca).normalize();
      const knuckle = footCenter.clone().addScaledVector(clawDir, 0.08 * legScale);
      const talonMid = knuckle.clone().addScaledVector(clawDir, 0.09 * legScale).addScaledVector(gripNormal, -0.03);
      const talonTip = talonMid.clone().addScaledVector(clawDir, 0.08 * legScale).addScaledVector(gripNormal, -0.06);

      marbleB.addLimb(footCenter, knuckle, 0.04 * legScale, 0.032 * legScale, 4, marbleCol, false);
      goldB.addLimb(knuckle, talonMid, 0.032 * legScale, 0.02 * legScale, 4, goldCol, false);
      goldB.addLimb(talonMid, talonTip, 0.02 * legScale, 0.004, 4, goldBright, true);
    }
  };

  // Chân trước trái (bám vào mặt đôn hoa sen)
  addDragonLeg(
    new THREE.Vector3(pedX - 0.18, pedY + 0.85, pedZ - 0.08),
    new THREE.Vector3(pedX - 0.36, pedY + 0.72, pedZ - 0.25),
    new THREE.Vector3(pedX - 0.32, pedY + 0.58, pedZ - 0.38),
    new THREE.Vector3(pedX - 0.28, pedY + 0.56, pedZ - 0.42),
    new THREE.Vector3(0, 1, 0),
    1.1,
  );

  // Chân trước phải (bám mép ngoài bậc thang / lan can)
  addDragonLeg(
    new THREE.Vector3(pedX + 0.18, pedY + 0.85, pedZ - 0.08),
    new THREE.Vector3(pedX + 0.38, pedY + 0.75, pedZ + 0.08),
    new THREE.Vector3(pedX + 0.34, pedY + 0.62, pedZ + 0.18),
    new THREE.Vector3(pedX + 0.3, pedY + 0.6, pedZ + 0.22),
    new THREE.Vector3(0, 1, 0),
    1.1,
  );

  // Chân sau trái (bám chắc vào mép dốc lan can giữa thang)
  const hindZ = 2.1;
  const hindY = balustradeHeight + (hindZ / totalLength) * totalHeight;
  addDragonLeg(
    new THREE.Vector3(balustradeX - 0.16, hindY + 0.45, hindZ - 0.1),
    new THREE.Vector3(balustradeX - 0.38, hindY + 0.35, hindZ + 0.15),
    new THREE.Vector3(balustradeX - 0.32, hindY + 0.15, hindZ + 0.28),
    new THREE.Vector3(balustradeX - 0.28, hindY + 0.08, hindZ + 0.32),
    new THREE.Vector3(0, 0.8, -0.6).normalize(),
    1.0,
  );

  // Chân sau phải (bám mép trong đối diện)
  addDragonLeg(
    new THREE.Vector3(balustradeX + 0.16, hindY + 0.45, hindZ - 0.1),
    new THREE.Vector3(balustradeX + 0.38, hindY + 0.35, hindZ + 0.15),
    new THREE.Vector3(balustradeX + 0.32, hindY + 0.15, hindZ + 0.28),
    new THREE.Vector3(balustradeX + 0.28, hindY + 0.08, hindZ + 0.32),
    new THREE.Vector3(0, 0.8, -0.6).normalize(),
    1.0,
  );

  // =========================================================================
  // 7. ĐUÔI RỒNG XOÁY LỬA VÚT CAO Ở ĐỈNH THANG (Spiraling Flame Tail Fluke)
  // =========================================================================
  const tailBase = curvePoints[curvePoints.length - 1];
  const tailSpirals = [
    { dir: new THREE.Vector3(-0.08, 0.48, 0.08), r0: 0.055, r1: 0.008, goldLen: 0.14 },
    { dir: new THREE.Vector3(0.06, 0.62, -0.05), r0: 0.048, r1: 0.006, goldLen: 0.18 },
    { dir: new THREE.Vector3(0.12, 0.38, 0.12), r0: 0.042, r1: 0.005, goldLen: 0.12 },
    { dir: new THREE.Vector3(-0.12, 0.28, -0.1), r0: 0.038, r1: 0.004, goldLen: 0.1 },
  ];

  for (const ts of tailSpirals) {
    const tip = tailBase.clone().add(ts.dir);
    marbleB.addLimb(tailBase, tip, ts.r0, ts.r1, 5, marbleCol, true);
    const goldFlameTip = tip.clone().addScaledVector(ts.dir.clone().normalize(), ts.goldLen);
    goldB.addLimb(tip, goldFlameTip, ts.r1 * 1.5, 0.002, 4, goldBright, true);
  }

  // =========================================================================
  // HOÀN THIỆN MESH VỚI SHADER VẬT LIỆU PBR TỐI ƯU
  // =========================================================================
  const marbleGeom = marbleB.build();
  if (marbleGeom) {
    const marbleMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.38,
      metalness: 0.06,
    });
    const marbleMesh = new THREE.Mesh(marbleGeom, marbleMat);
    marbleMesh.castShadow = true;
    marbleMesh.receiveShadow = true;
    group.add(marbleMesh);
  }

  const goldGeom = goldB.build();
  if (goldGeom) {
    const goldMat = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.25,
      metalness: 0.88,
      emissive: new THREE.Color(0xd4af37),
      emissiveIntensity: 0.22,
    });
    const goldMesh = new THREE.Mesh(goldGeom, goldMat);
    goldMesh.castShadow = true;
    goldMesh.receiveShadow = true;
    group.add(goldMesh);
  }

  // Áp dụng transform cho toàn bộ cụm mô hình
  group.position.copy(position);
  group.rotation.copy(rotation);
  group.scale.setScalar(scale);

  return group;
}

/**
 * Tích hợp xây dựng Rồng Đá Cẩm Thạch Lan Can vào Campus Chùa
 */
export function buildImperialDragon(campus: Campus): void {
  // Có thể đặt rồng chầu ở hai bên bậc thềm chính hoặc bậc tam quan
  const dragonLeft = createImperialDragonModel({
    position: new THREE.Vector3(-3.2, 0, -8.5),
    rotation: new THREE.Euler(0, 0, 0),
    scale: 0.95,
    mirrored: false,
    includeStairs: true,
  });

  const dragonRight = createImperialDragonModel({
    position: new THREE.Vector3(3.2, 0, -8.5),
    rotation: new THREE.Euler(0, 0, 0),
    scale: 0.95,
    mirrored: true,
    includeStairs: true,
  });

  campus.root.add(dragonLeft);
  campus.root.add(dragonRight);

  // Collider va chạm để nhân vật không đi xuyên qua lan can rồng đá
  campus.colliders.push({
    minX: -4.2,
    maxX: -2.2,
    minZ: -9.2,
    maxZ: -5.0,
  });

  campus.colliders.push({
    minX: 2.2,
    maxX: 4.2,
    minZ: -9.2,
    maxZ: -5.0,
  });
}
