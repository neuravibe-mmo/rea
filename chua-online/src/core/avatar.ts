import * as THREE from "three";

export type RobeColorType = "lam" | "nau" | "xam" | "vang";
export type GenderType = "nam" | "nu";
export type FaceStyleType = "zen" | "happy" | "sparkle";

export interface AvatarOptions {
  robeColor?: RobeColorType | number;
  gender?: GenderType;
  hasHat?: boolean;
  faceStyle?: FaceStyleType;
  name?: string;
  level?: string;
  isSelf?: boolean;
}

export interface ChibiAvatarInstance {
  root: THREE.Group;
  rig: THREE.Group;
  hips: THREE.Group;
  spine: THREE.Group;
  headPivot: THREE.Group;
  headMesh: THREE.Mesh;
  torso: THREE.Mesh;
  skirt: THREE.Mesh;
  shoulders: [THREE.Group, THREE.Group];
  elbows: [THREE.Group, THREE.Group];
  legs: [THREE.Group, THREE.Group];
  knees: [THREE.Group, THREE.Group];
  shinMeshes: [THREE.Group, THREE.Group];
  hatMesh?: THREE.Mesh;
  plate?: THREE.Sprite;
  bodyGroup: THREE.Object3D; // Tương thích ngược
  headGroup: THREE.Group;
  armsGroup: THREE.Group;
  leftLegGroup: THREE.Group;
  rightLegGroup: THREE.Group;
  skirtMesh: THREE.Mesh;
  updateAnimation: (anim: number, timer: number, bowProgress?: number) => void;
  fitPlate?: (camera: THREE.Camera) => void;
  setCarry?: (item: "broom" | null) => void;
  setSubtitle?: (sub: string) => void;
  showChatBubble?: (text: string, durationMs?: number) => void;
}

// Bảng màu trang phục Phật tử chuẩn Chùa Sen (chuasen.com - var yo)
export const ROBE_PALETTES: Record<RobeColorType, { base: number; dark: number; trim: number }> = {
  lam: {
    base: 0x5a8ac4, // 5933764 - Áo lam pastel truyền thống Chùa Sen
    dark: 0x3d6494, // Đai lưng & viền tà áo sẫm
    trim: 0xf3ead6, // 15985366 (ns) - Viền cổ áo trong trắng ngà
  },
  nau: {
    base: 0x94643a, // 9724986 - Áo nâu sồng mộc mạc
    dark: 0x613d20,
    trim: 0xf3ead6,
  },
  xam: {
    base: 0xa2a198, // 10658200 - Áo xám tro thiền định
    dark: 0x6e6e66,
    trim: 0xf3ead6,
  },
  vang: {
    base: 0xe0aa2e, // 14723886 - Áo hoàng y / vàng nghệ
    dark: 0xa47718,
    trim: 0xfdedc8,
  },
};

// Các hằng số hình học và tỷ lệ cơ thể chuẩn Chùa Sen (chuasen.com)
const No = 0.36;   // Chiều cao hông (hips Y)
const Po = 0.07;   // Độ lệch khoảng cách hai chân (leg X offset: ±0.07m)
const Fo = 0.145;  // Độ lệch vai (shoulder X offset: ±0.145m)
const Io = 0.215;  // Cao độ vai trên spine (shoulder Y offset)
const Ro = 0.275;  // Khớp cổ trên spine (headPivot Y offset)
const zo = 0.205;  // Cao độ đầu trên headPivot (headMesh Y offset)
const Bo = [0.225, 0.205, 0.21] as const; // Bán kính đầu Chibi (Rx, Ry, Rz)
const Go = 1.12;   // Cao độ bảng tên lơ lửng trên đỉnh đầu (nameplate Y)

// Màu sắc phụ kiện & da chuẩn Chùa Sen
const SKIN_COLOR = 0xfce4d4;       // qo = 15382932 - Da chibi tươi tắn
const PANTS_COLOR = 0xe6dfce;      // ts = 15129798 - Quần Phật tử trắng ngà
const SHOE_COLOR = 0x4b3327;       // es = 4928551 - Giày vải sẫm màu
const SHOE_SOLE_COLOR = 0xf5efe6;  // Đế giày trắng
const HAIR_COLOR = 0x33221a;       // Yo = 3351066 - Tóc đen tuyền
const LOTUS_PINK = 0xf5b8c8;       // as = 16103624 - Cánh sen cài tóc hồng
const LOTUS_YELLOW = 0xf7d57d;     // os = 16242045 - Nhụy sen vàng
const WARM_EMISSIVE_INTENSITY = 0.07; // uc = 0.07 - Shader avatar-warm

/**
 * Tạo vật liệu Three.js tích hợp shader avatar-warm độc quyền của Chùa Sen
 * Giúp bề mặt nhân vật luôn tỏa ánh sáng hổ phách ấm áp dịu nhẹ, da sáng mịn như sứ
 */
function createWarmMaterial(parameters: THREE.MeshStandardMaterialParameters): THREE.MeshStandardMaterial {
  const mat = new THREE.MeshStandardMaterial(parameters);
  mat.onBeforeCompile = (shader) => {
    shader.fragmentShader = shader.fragmentShader.replace(
      `#include <emissivemap_fragment>`,
      `#include <emissivemap_fragment>
       totalEmissiveRadiance += diffuseColor.rgb * vec3( 1.0, 0.8, 0.62 ) * ${WARM_EMISSIVE_INTENSITY.toFixed(3)};`
    );
  };
  mat.customProgramCacheKey = () => `avatar-warm`;
  return mat;
}

/**
 * Dựng hình học xoay tròn LatheGeometry từ mảng điểm đường cong B-spline
 */
function createLatheFromProfile(points: [number, number][], segments = 20): THREE.BufferGeometry {
  const vPoints = points.map(([x, y]) => new THREE.Vector2(x, y));
  const spline = new THREE.SplineCurve(vPoints);
  const samplePoints = spline.getPoints(Math.max(6, points.length * 2));
  return new THREE.LatheGeometry(samplePoints, segments);
}

/**
 * Tạo Texture khuôn mặt Chibi cực dễ thương chuẩn Chùa Sen (chuasen.com)
 */
export function createChibiFaceTexture(style: FaceStyleType = "zen"): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext("2d")!;

  // 1. Nền da ấm mịn màng
  const bgGrad = ctx.createRadialGradient(256, 256, 50, 256, 256, 256);
  bgGrad.addColorStop(0, "#fff5ee");
  bgGrad.addColorStop(0.65, "#fce4d4");
  bgGrad.addColorStop(1, "#f3ceb8");
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, 512, 512);

  // 2. Hai gò má hồng phớt đào tròn trịa (Rosy cheeks)
  const drawCheek = (cx: number, cy: number) => {
    const cheekGrad = ctx.createRadialGradient(cx, cy, 4, cx, cy, 46);
    cheekGrad.addColorStop(0, "rgba(255, 115, 140, 0.62)");
    cheekGrad.addColorStop(0.55, "rgba(255, 140, 162, 0.32)");
    cheekGrad.addColorStop(1, "rgba(255, 165, 180, 0)");
    ctx.fillStyle = cheekGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, 46, 0, Math.PI * 2);
    ctx.fill();
  };
  drawCheek(146, 304);
  drawCheek(366, 304);

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (style === "zen" || style === "happy") {
    // 3A. MẮT CƯỜI HÌNH TRĂNG KHUYẾT AN NHIÊN (Serene Smiling Crescent Eyes)
    ctx.strokeStyle = "#321d14";
    ctx.lineWidth = 8;

    // Mắt trái
    ctx.beginPath();
    ctx.arc(174, 258, 34, 1.16 * Math.PI, 1.84 * Math.PI, false);
    ctx.stroke();

    // Mắt phải
    ctx.beginPath();
    ctx.arc(338, 258, 34, 1.16 * Math.PI, 1.84 * Math.PI, false);
    ctx.stroke();

    // Đuôi mắt cong nhẹ
    ctx.lineWidth = 4.5;
    ctx.beginPath();
    ctx.moveTo(142, 271);
    ctx.lineTo(128, 269);
    ctx.moveTo(370, 271);
    ctx.lineTo(384, 269);
    ctx.stroke();
  } else {
    // 3B. MẮT ANIME TO TRÒN LONG LANH (Sparkly Chibi Eyes)
    const drawEye = (cx: number, cy: number) => {
      ctx.fillStyle = "#22130e";
      ctx.beginPath();
      ctx.ellipse(cx, cy, 32, 40, 0, 0, Math.PI * 2);
      ctx.fill();

      // Đốm sáng phản chiếu lớn
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(cx - 9, cy - 13, 11, 0, Math.PI * 2);
      ctx.fill();

      // Đốm sáng nhỏ
      ctx.beginPath();
      ctx.arc(cx + 11, cy + 11, 5.5, 0, Math.PI * 2);
      ctx.fill();
    };
    drawEye(174, 258);
    drawEye(338, 258);
  }

  // 4. Lông mày thanh tú dịu dàng
  ctx.strokeStyle = "#563828";
  ctx.lineWidth = 5.5;
  ctx.beginPath();
  ctx.arc(174, 236, 38, 1.28 * Math.PI, 1.72 * Math.PI, false);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(338, 236, 38, 1.28 * Math.PI, 1.72 * Math.PI, false);
  ctx.stroke();

  // 5. Mũi nhỏ xinh (Button nose)
  ctx.fillStyle = "#cf8f70";
  ctx.beginPath();
  ctx.arc(256, 288, 4, 0, Math.PI * 2);
  ctx.fill();

  // 6. Nụ cười mỉm từ bi hiền hậu
  ctx.strokeStyle = "#5a2d21";
  ctx.lineWidth = 5.5;
  ctx.beginPath();
  ctx.arc(256, 324, 24, 0.2 * Math.PI, 0.8 * Math.PI, false);
  ctx.stroke();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

/**
 * Tạo mô hình chổi tre quét lá đa chuẩn Chùa Sen (chuasen.com - Ex)
 */
export function createBroomMesh(): THREE.Group {
  const broom = new THREE.Group();
  broom.name = "broom";

  // Cán chổi tre vàng nâu nhạt (Bamboo handle)
  const handleGeom = new THREE.CylinderGeometry(0.012, 0.014, 0.88, 8);
  const handleMat = new THREE.MeshStandardMaterial({
    color: 0xc49c5e,
    roughness: 0.8,
  });
  const handle = new THREE.Mesh(handleGeom, handleMat);
  handle.position.set(0, 0, 0);
  broom.add(handle);

  // Đầu chổi rơm quét lá đa (Straw bristle head)
  const headGeom = new THREE.ConeGeometry(0.12, 0.32, 10);
  const headMat = new THREE.MeshStandardMaterial({
    color: 0x9e7b46,
    roughness: 0.9,
  });
  const head = new THREE.Mesh(headGeom, headMat);
  head.position.set(0, -0.42, 0);
  head.rotation.x = Math.PI; // Ngọn chổi chúc xuống đất
  broom.add(head);

  // Dây lạt buộc đầu chổi
  const twineGeom = new THREE.TorusGeometry(0.036, 0.009, 6, 12);
  const twineMat = new THREE.MeshStandardMaterial({ color: 0x5a3d1c });
  const twine = new THREE.Mesh(twineGeom, twineMat);
  twine.position.set(0, -0.28, 0);
  twine.rotation.x = Math.PI / 2;
  broom.add(twine);

  broom.position.set(0.04, 0.08, 0.22);
  broom.rotation.set(0.35, 0.2, -0.25);
  return broom;
}

/**
 * Tạo bong bóng câu nói / biểu cảm nổi trên đầu nhân vật (Chat / Emote Bubble)
 */
export function createChatBubbleSprite(text: string): { sprite: THREE.Sprite; aspect: number } {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  ctx.font = "bold 20px system-ui, -apple-system, sans-serif";
  const textW = Math.ceil(ctx.measureText(text).width);
  const canvasW = Math.max(120, textW + 36);
  const canvasH = 58;

  canvas.width = canvasW;
  canvas.height = canvasH;

  ctx.clearRect(0, 0, canvasW, canvasH);

  const x = 3, y = 3, w = canvasW - 6, h = 42, r = 21;
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.rect(x, y, w, h);
  }
  ctx.fillStyle = "rgba(255, 252, 246, 0.96)";
  ctx.fill();
  ctx.strokeStyle = "rgba(224, 178, 92, 0.9)";
  ctx.lineWidth = 2.0;
  ctx.stroke();

  // Đuôi nhọn chỉ xuống đầu nhân vật
  ctx.beginPath();
  ctx.moveTo(canvasW / 2 - 8, y + h);
  ctx.lineTo(canvasW / 2, y + h + 8);
  ctx.lineTo(canvasW / 2 + 8, y + h);
  ctx.fillStyle = "rgba(255, 252, 246, 0.96)";
  ctx.fill();

  ctx.fillStyle = "#2c1c11";
  ctx.font = "bold 18px system-ui, -apple-system, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvasW / 2, y + h / 2 + 1);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;

  const mat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
  });

  const sprite = new THREE.Sprite(mat);
  sprite.renderOrder = 1000;
  const aspect = canvasW / canvasH;
  sprite.scale.set(0.22 * aspect, 0.22, 1);
  return { sprite, aspect };
}

/**
 * Xây dựng hoàn chỉnh mô hình nhân vật Chibi Phật tử 1:1 theo chuẩn Chùa Sen (chuasen.com)
 */
export function buildChibiAvatar(options: AvatarOptions = {}): ChibiAvatarInstance {
  const root = new THREE.Group();
  root.name = "avatar";

  // Xác định màu sắc trang phục
  let baseColor = ROBE_PALETTES.lam.base;
  let darkColor = ROBE_PALETTES.lam.dark;
  let trimColor = ROBE_PALETTES.lam.trim;

  if (typeof options.robeColor === "string" && ROBE_PALETTES[options.robeColor]) {
    const pal = ROBE_PALETTES[options.robeColor];
    baseColor = pal.base;
    darkColor = pal.dark;
    trimColor = pal.trim;
  } else if (typeof options.robeColor === "number") {
    baseColor = options.robeColor;
    const c = new THREE.Color(baseColor);
    darkColor = c.clone().multiplyScalar(0.7).getHex();
    trimColor = ROBE_PALETTES.lam.trim;
  }

  const gender = options.gender ?? "nam";
  const hasHat = options.hasHat ?? false;
  const faceStyle = options.faceStyle ?? "zen";

  // Khởi tạo các vật liệu chuẩn Chùa Sen với shader avatar-warm
  const robeMat = createWarmMaterial({
    color: baseColor,
    roughness: 0.72,
    metalness: 0.04,
  });

  const darkRobeMat = createWarmMaterial({
    color: darkColor,
    roughness: 0.75,
    metalness: 0.04,
  });

  const trimMat = createWarmMaterial({
    color: trimColor,
    roughness: 0.65,
    metalness: 0.04,
  });

  const skinMat = createWarmMaterial({
    color: SKIN_COLOR,
    roughness: 0.55,
    metalness: 0.02,
  });

  const pantsMat = createWarmMaterial({
    color: PANTS_COLOR,
    roughness: 0.78,
  });

  const shoeMat = createWarmMaterial({
    color: SHOE_COLOR,
    roughness: 0.68,
  });

  const soleMat = createWarmMaterial({
    color: SHOE_SOLE_COLOR,
    roughness: 0.85,
  });

  // =========================================================================
  // HỆ THỐNG XƯƠNG PHÂN CẤP CHUẨN CHÙA SEN (RIG HIERARCHY)
  // root -> rig -> hips -> spine -> shoulders, elbows, headPivot
  // =========================================================================
  const rig = new THREE.Group();
  rig.name = "rig";
  root.add(rig);

  const hips = new THREE.Group();
  hips.name = "hips";
  hips.position.set(0, No, 0); // y = 0.36m
  rig.add(hips);

  const spine = new THREE.Group();
  spine.name = "spine";
  hips.add(spine);

  // =========================================================================
  // 1. TÀ ÁO PHẬT TỬ XÒE MỀM (SKIRT - Mặt cắt chuẩn zs Chùa Sen)
  // zs = [[-0.2, 0.222], [-0.16, 0.212], [-0.1, 0.192], [-0.04, 0.168], [0.02, 0.15], [0.05, 0.145]]
  // =========================================================================
  const skirtProfile: [number, number][] = [
    [0.222, -0.2],
    [0.212, -0.16],
    [0.192, -0.1],
    [0.168, -0.04],
    [0.15, 0.02],
    [0.145, 0.05],
  ];
  const skirtGeom = createLatheFromProfile(skirtProfile, 22);
  skirtGeom.scale(1.0, 1.0, 0.88); // Dẹt nhẹ theo trục Z tạo dáng người tự nhiên
  const skirt = new THREE.Mesh(skirtGeom, robeMat);
  skirt.name = "skirt";
  skirt.castShadow = true;
  skirt.receiveShadow = true;
  hips.add(skirt);

  // Viền gấu tà áo bo tròn mềm mại
  const hemGeom = new THREE.TorusGeometry(0.22, 0.012, 8, 22);
  hemGeom.rotateX(Math.PI / 2);
  hemGeom.scale(1.0, 0.88, 1.0);
  const hemMesh = new THREE.Mesh(hemGeom, darkRobeMat);
  hemMesh.position.set(0, -0.2, 0);
  hips.add(hemMesh);

  // =========================================================================
  // 2. THÂN ÁO TRÊN (TORSO - Mặt cắt chuẩn Ms Chùa Sen)
  // Ms = [[0.15, -0.05], [0.153, 0.02], [0.16, 0.1], [0.158, 0.16], [0.146, 0.215], [0.118, 0.25], [0.088, 0.268], [0.064, 0.277], [0, 0.282]]
  // =========================================================================
  const torsoProfile: [number, number][] = [
    [0.15, -0.05],
    [0.153, 0.02],
    [0.16, 0.1],
    [0.158, 0.16],
    [0.146, 0.215],
    [0.118, 0.25],
    [0.088, 0.268],
    [0.064, 0.277],
    [0, 0.282],
  ];
  const torsoGeom = createLatheFromProfile(torsoProfile, 22);
  torsoGeom.scale(1.0, 1.0, 0.84);
  const torso = new THREE.Mesh(torsoGeom, robeMat);
  torso.name = "torso";
  torso.castShadow = true;
  torso.receiveShadow = true;
  spine.add(torso);

  // Đai lưng Phật tử (Waist Belt) tại y = 0.052m
  const beltGeom = new THREE.TorusGeometry(0.157, 0.012, 8, 24);
  beltGeom.rotateX(Math.PI / 2);
  beltGeom.scale(1.0, 0.84, 1.0);
  const beltMesh = new THREE.Mesh(beltGeom, darkRobeMat);
  beltMesh.position.set(0, 0.052, 0);
  spine.add(beltMesh);

  // Vòng cổ áo ngoài (Outer collar) tại y = 0.274m
  const outerCollarGeom = new THREE.TorusGeometry(0.07, 0.013, 8, 20);
  outerCollarGeom.rotateX(Math.PI / 2.2);
  outerCollarGeom.scale(1.0, 0.92, 1.0);
  const outerCollar = new THREE.Mesh(outerCollarGeom, darkRobeMat);
  outerCollar.position.set(0, 0.274, 0);
  spine.add(outerCollar);

  // Viền cổ áo trong trắng ngà (Inner collar trim ns) tại y = 0.282m
  const innerCollarGeom = new THREE.TorusGeometry(0.062, 0.0095, 8, 20);
  innerCollarGeom.rotateX(Math.PI / 2.2);
  innerCollarGeom.scale(1.0, 0.92, 1.0);
  const innerCollar = new THREE.Mesh(innerCollarGeom, trimMat);
  innerCollar.position.set(0, 0.282, 0);
  spine.add(innerCollar);

  // Vạt chéo áo tràng bên phải chạy từ vai trái qua ngực xuống eo
  const lapelGeom = new THREE.BoxGeometry(0.018, 0.20, 0.012);
  lapelGeom.rotateZ(-0.5);
  const lapelMesh = new THREE.Mesh(lapelGeom, darkRobeMat);
  lapelMesh.position.set(0.042, 0.17, 0.138);
  spine.add(lapelMesh);

  // =========================================================================
  // 3. ĐẦU CHIBI TRÒN XOE (HEAD - Bo = [0.225, 0.205, 0.21] Chùa Sen)
  // =========================================================================
  const headPivot = new THREE.Group();
  headPivot.name = "headPivot";
  headPivot.position.set(0, Ro, 0); // y = 0.275m trên spine
  spine.add(headPivot);

  // Cổ nhân vật
  const neckGeom = new THREE.CylinderGeometry(0.058, 0.066, 0.09, 14);
  const neckMesh = new THREE.Mesh(neckGeom, skinMat);
  neckMesh.position.set(0, 0.04, 0.004);
  headPivot.add(neckMesh);

  // Quả cầu đầu chibi
  const faceTex = createChibiFaceTexture(faceStyle);
  const headMat = createWarmMaterial({
    color: 0xffffff,
    map: faceTex,
    roughness: 0.55,
    metalness: 0.02,
  });

  const headGeom = new THREE.SphereGeometry(1, 26, 22);
  headGeom.scale(Bo[0], Bo[1], Bo[2]); // [0.225, 0.205, 0.21]
  const headMesh = new THREE.Mesh(headGeom, headMat);
  headMesh.name = "headMesh";
  headMesh.position.set(0, zo, 0); // y = 0.205m trên headPivot
  headMesh.rotation.y = -Math.PI / 2; // Xoay mặt về phía trước (+Z)
  headMesh.castShadow = true;
  headPivot.add(headMesh);

  // Hai tai tròn nhỏ xinh xắn 2 bên
  const earGeom = new THREE.SphereGeometry(1, 12, 10);
  earGeom.scale(0.022, 0.048, 0.034);

  const leftEar = new THREE.Mesh(earGeom, skinMat);
  leftEar.position.set(-(Bo[0] - 0.004), zo - 0.018, 0.012);
  headPivot.add(leftEar);

  const rightEar = new THREE.Mesh(earGeom, skinMat);
  rightEar.position.set(Bo[0] - 0.004, zo - 0.018, 0.012);
  headPivot.add(rightEar);

  // Nữ: Mái tóc búi cài bông hoa sen hồng 6 cánh
  if (gender === "nu") {
    const hairMat = createWarmMaterial({
      color: HAIR_COLOR,
      roughness: 0.65,
    });

    // Mũ tóc ôm nửa sau đầu
    const hairCapGeom = new THREE.SphereGeometry(1, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.58);
    hairCapGeom.scale(Bo[0] * 1.04, Bo[1] * 1.04, Bo[2] * 1.04);
    hairCapGeom.rotateX(0.38);
    const hairCap = new THREE.Mesh(hairCapGeom, hairMat);
    hairCap.position.set(0, zo + 0.02, -0.02);
    headPivot.add(hairCap);

    // Búi tóc tròn phía sau
    const bunGeom = new THREE.SphereGeometry(1, 16, 14);
    bunGeom.scale(0.088, 0.078, 0.082);
    const bunMesh = new THREE.Mesh(bunGeom, hairMat);
    bunMesh.position.set(0, zo - 0.07, -(Bo[2] * 1.04 + 0.03));
    headPivot.add(bunMesh);

    // Bông hoa sen hồng 6 cánh cài búi tóc
    const petalMat = createWarmMaterial({
      color: LOTUS_PINK,
      roughness: 0.45,
    });
    const yellowMat = createWarmMaterial({
      color: LOTUS_YELLOW,
      roughness: 0.35,
    });

    const flowerGroup = new THREE.Group();
    flowerGroup.position.set(0.058, zo - 0.052, -(Bo[2] * 1.04 + 0.08));
    flowerGroup.rotation.set(-0.3, 0.45, 0);

    const numPetals = 6;
    for (let i = 0; i < numPetals; i++) {
      const ang = (i / numPetals) * Math.PI * 2;
      const petalGeom = new THREE.ConeGeometry(0.018, 0.046, 6);
      petalGeom.rotateZ(Math.PI / 2);
      petalGeom.scale(1, 0.45, 1);
      const petal = new THREE.Mesh(petalGeom, petalMat);
      petal.position.set(Math.cos(ang) * 0.024, Math.sin(ang) * 0.024, 0);
      petal.rotation.z = ang;
      flowerGroup.add(petal);
    }
    const centerGeom = new THREE.SphereGeometry(0.014, 10, 8);
    const centerMesh = new THREE.Mesh(centerGeom, yellowMat);
    centerMesh.position.z = 0.01;
    flowerGroup.add(centerMesh);

    headPivot.add(flowerGroup);
  }

  // Nón lá thanh tịnh (nếu bật tùy chọn hasHat)
  let hatMesh: THREE.Mesh | undefined;
  if (hasHat) {
    const hatMat = createWarmMaterial({
      color: 0xd8a46b,
      roughness: 0.85,
    });
    const hatGeom = new THREE.ConeGeometry(0.42, 0.17, 22);
    hatMesh = new THREE.Mesh(hatGeom, hatMat);
    hatMesh.position.set(0, zo + 0.19, 0);
    hatMesh.rotation.x = -0.06;
    hatMesh.castShadow = true;
    headPivot.add(hatMesh);
  }

  // =========================================================================
  // 4. CÁNH TAY & ỐNG TAY THỤNG CHUẨN CHÙA SEN (Gs, Qs)
  // Vai x = ±0.145m, khuỷu y = -0.11m, cẳng tay uốn chắp sen trước ngực
  // =========================================================================
  const shoulders: [THREE.Group, THREE.Group] = [new THREE.Group(), new THREE.Group()];
  const elbows: [THREE.Group, THREE.Group] = [new THREE.Group(), new THREE.Group()];
  const armsGroup = new THREE.Group();

  // Khởi tạo 2 cánh tay trái & phải
  for (let e = 0; e < 2; e++) {
    const sign = e === 0 ? 1 : -1;
    const name = e === 0 ? "R" : "L";
    const shoulder = shoulders[e];
    const elbow = elbows[e];

    shoulder.name = `shoulder.${name}`;
    elbow.name = `elbow.${name}`;

    // Khớp vai trên spine tại (sign * Fo, Io, 0) -> (±0.145, 0.215, 0)
    shoulder.position.set(sign * Fo, Io, 0);
    // Khớp khuỷu trên shoulder tại (0, -0.11, 0)
    elbow.position.set(0, -0.11, 0);

    // Bắp tay áo lam (Upper Arm Gs): Buông xuôi dọc thân người
    const upperArmGeom = new THREE.CylinderGeometry(0.056, 0.06, 0.11, 14);
    upperArmGeom.translate(0, -0.055, 0);
    const upperMesh = new THREE.Mesh(upperArmGeom, robeMat);
    upperMesh.name = `upper.${name}`;
    shoulder.add(upperMesh);
    shoulder.add(elbow);

    // Cẳng tay áo lam thụng rộng (Forearm Qs): Profile loe rộng về cổ tay
    const foreArmProfile: [number, number][] = [
      [0.055, 0.01],
      [0.059, -0.022],
      [0.068, -0.062],
      [0.074, -0.1],
      [0.07, -0.118],
    ];
    const foreArmGeom = createLatheFromProfile(foreArmProfile, 16);
    const foreMesh = new THREE.Mesh(foreArmGeom, robeMat);
    foreMesh.name = `fore.${name}`;
    elbow.add(foreMesh);

    // Viền cổ tay áo bo gấu sẫm màu
    const cuffGeom = new THREE.TorusGeometry(0.0755, 0.012, 8, 16);
    cuffGeom.rotateX(Math.PI / 2);
    const cuffMesh = new THREE.Mesh(cuffGeom, darkRobeMat);
    cuffMesh.position.set(0, -0.112, 0);
    elbow.add(cuffMesh);

    // Bàn tay Chùa Sen (qo): [0.032, 0.036, 0.033] tại [0, -0.14, 0]
    const handGeom = new THREE.SphereGeometry(1, 10, 8);
    handGeom.scale(0.032, 0.036, 0.033);
    const handMesh = new THREE.Mesh(handGeom, skinMat);
    handMesh.position.set(0, -0.14, 0);
    elbow.add(handMesh);

    spine.add(shoulder);
    armsGroup.add(shoulder);
  }

  // Hai bàn tay chắp hình búp sen thanh tịnh (Anjali Mudra) ở trung tâm
  const centerPrayerHands = new THREE.Group();
  centerPrayerHands.position.set(0, 0.11, 0.18);
  centerPrayerHands.rotation.x = -0.35; // Nghiêng 30 độ hướng lên trời

  const leftPalm = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.068, 0.016), skinMat);
  leftPalm.position.set(-0.011, 0, 0);
  leftPalm.rotation.z = -0.08;
  centerPrayerHands.add(leftPalm);

  const rightPalm = new THREE.Mesh(new THREE.BoxGeometry(0.022, 0.068, 0.016), skinMat);
  rightPalm.position.set(0.011, 0, 0);
  rightPalm.rotation.z = 0.08;
  centerPrayerHands.add(rightPalm);

  const fingertip = new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.038, 8), skinMat);
  fingertip.position.set(0, 0.042, 0);
  fingertip.scale.set(0.85, 1.0, 0.45);
  centerPrayerHands.add(fingertip);

  spine.add(centerPrayerHands);

  // =========================================================================
  // 5. CHÂN, QUẦN TRẮNG & GIÀY VẢI ĐI CHÙA ($s)
  // Hai chân x = ±Po (±0.07m), khớp gối y = -0.16m
  // =========================================================================
  const legs: [THREE.Group, THREE.Group] = [new THREE.Group(), new THREE.Group()];
  const knees: [THREE.Group, THREE.Group] = [new THREE.Group(), new THREE.Group()];
  const shinMeshes: [THREE.Group, THREE.Group] = [new THREE.Group(), new THREE.Group()];

  for (let e = 0; e < 2; e++) {
    const sign = e === 0 ? 1 : -1;
    const name = e === 0 ? "R" : "L";
    const leg = legs[e];
    const knee = knees[e];
    const shin = shinMeshes[e];

    leg.name = `leg.${name}`;
    knee.name = `knee.${name}`;
    shin.name = `shin.${name}`;

    // Khớp háng trên hips tại (sign * Po, 0, 0) -> (±0.07, 0, 0)
    leg.position.set(sign * Po, 0, 0);
    // Khớp gối trên leg tại (0, -0.16, 0)
    knee.position.set(0, -0.16, 0);

    // Ống quần Phật tử trắng ngà ($s): Profile chuẩn Chùa Sen
    const shinProfile: [number, number][] = [
      [0.055, 0.02],
      [0.06, -0.02],
      [0.067, -0.07],
      [0.073, -0.13],
      [0.07, -0.15],
      [0, -0.15],
    ];
    const shinGeom = createLatheFromProfile(shinProfile, 16);
    const shinMesh = new THREE.Mesh(shinGeom, pantsMat);
    shin.add(shinMesh);

    // Đôi giày vải đi chùa Chùa Sen (es = #4B3327): [0.062, 0.042, 0.098] tại [0, -0.17, -0.034]
    const shoeGroup = new THREE.Group();
    shoeGroup.position.set(0, -0.165, 0.02);

    const shoeGeom = new THREE.SphereGeometry(1, 14, 10);
    shoeGeom.scale(0.048, 0.034, 0.075);
    const shoeMesh = new THREE.Mesh(shoeGeom, shoeMat);
    shoeGroup.add(shoeMesh);

    // Viền đế giày vải trắng nổi bật
    const soleGeom = new THREE.BoxGeometry(0.078, 0.012, 0.145);
    const soleMesh = new THREE.Mesh(soleGeom, soleMat);
    soleMesh.position.set(0, -0.026, 0);
    shoeGroup.add(soleMesh);

    shin.add(shoeGroup);
    knee.add(shin);
    leg.add(knee);
    hips.add(leg);
  }

  // =========================================================================
  // 6. BẢNG TÊN DANH HIỆU LƠ LỬNG TRÊN ĐẦU (BILLBOARD NAME TAG)
  // Cao độ Go = 1.12m trên đầu
  // =========================================================================
  let nameSprite: THREE.Sprite | undefined;
  let plateAspect = 3.6;
  let currentSubtitle = "";

  if (options.name) {
    const plateData = createNameTagSprite(
      options.name,
      options.level ?? "Cấp 1",
      options.isSelf ?? false,
      currentSubtitle
    );
    nameSprite = plateData.sprite;
    plateAspect = plateData.aspect;
    nameSprite.position.set(0, Go + 0.06, 0);
    root.add(nameSprite);
  }

  // Cầm nắm vật phẩm & biểu cảm
  let currentCarry: THREE.Group | null = null;
  let currentCarryType: "broom" | null = null;
  let sweepPhase = 0;
  let chatBubbleSprite: THREE.Sprite | null = null;
  let chatBubbleTimeout: number | null = null;

  const setCarry = (type: "broom" | null) => {
    if (currentCarry) {
      spine.remove(currentCarry);
      currentCarry = null;
    }
    currentCarryType = type;
    if (type === "broom") {
      currentCarry = createBroomMesh();
      spine.add(currentCarry);
    }
  };

  const setSubtitle = (sub: string) => {
    if (!options.name || !nameSprite) return;
    currentSubtitle = sub;
    const plateData = createNameTagSprite(
      options.name,
      options.level ?? "Cấp 1",
      options.isSelf ?? false,
      currentSubtitle
    );
    nameSprite.material.map = plateData.texture;
    nameSprite.material.needsUpdate = true;
    plateAspect = plateData.aspect;
  };

  const showChatBubble = (text: string, durationMs = 3200) => {
    if (chatBubbleSprite) {
      root.remove(chatBubbleSprite);
      chatBubbleSprite = null;
    }
    if (chatBubbleTimeout) {
      window.clearTimeout(chatBubbleTimeout);
      chatBubbleTimeout = null;
    }

    const bubbleData = createChatBubbleSprite(text);
    chatBubbleSprite = bubbleData.sprite;
    chatBubbleSprite.position.set(0, Go + 0.38, 0);
    root.add(chatBubbleSprite);

    chatBubbleTimeout = window.setTimeout(() => {
      if (chatBubbleSprite) {
        root.remove(chatBubbleSprite);
        chatBubbleSprite = null;
      }
    }, durationMs);
  };

  // =========================================================================
  // 7. MÁY TRẠNG THÁI HOẠT HỌA CHUẨN CHÙA SEN (ANIMATION SYSTEM)
  // Định nghĩa các pose chuẩn: vc (idle/chắp tay), yc (walk), Ac (bow), bc (sit)
  // =========================================================================
  const updateAnimation = (anim: number, timer: number, bowProgress = 0) => {
    // 1. ĐI BỘ (Walking): Nhịp bước walkPhase, chân luân phiên bước trước/sau
    if (anim === 1) {
      const walkBob = Math.sin(timer) * 0.024;
      const stepAngle = Math.sin(timer) * 0.44;

      // Hông nhấp nhô nhẹ theo nhịp bước
      rig.position.y = walkBob;
      hips.rotation.y = Math.sin(timer) * 0.08;
      spine.rotation.x = 0.05; // Hơi rướn người về phía trước
      spine.rotation.z = Math.cos(timer) * 0.035;

      // Hai chân luân phiên bước trước / bước sau
      legs[0].rotation.x = stepAngle;
      legs[1].rotation.x = -stepAngle;
      knees[0].rotation.x = -0.35 * Math.max(0, Math.cos(timer));
      knees[1].rotation.x = -0.35 * Math.max(0, -Math.cos(timer));

      if (currentCarryType === "broom") {
        // Quét lá khi đang bước đi
        sweepPhase = (sweepPhase + 0.1) % (Math.PI * 2);
        const sweepAngle = Math.sin(sweepPhase) * 0.28;
        shoulders[0].rotation.set(0.95, 0.25 + sweepAngle * 0.2, 0.05);
        shoulders[1].rotation.set(0.95, -0.25 + sweepAngle * 0.2, -0.05);
        elbows[0].rotation.set(1.0, 0, 0);
        elbows[1].rotation.set(1.0, 0, 0);
        spine.rotation.y = sweepAngle * 0.22;
        if (currentCarry) {
          currentCarry.rotation.set(0.35, 0.2 + sweepAngle * 0.35, -0.25 + sweepAngle * 0.15);
        }
        centerPrayerHands.visible = false;
      } else {
        // Tay áo thụng đung đưa nhẹ nhàng
        shoulders[0].rotation.x = 0.81 - stepAngle * 0.25;
        shoulders[1].rotation.x = 0.81 + stepAngle * 0.25;
        centerPrayerHands.visible = true;
      }
    }
    // 2. ĐẠI LỄ LẠY PHẬT 3 BƯỚC CHUẨN CHÙA SEN (Ac Bowing 2.6s Timeline)
    else if (anim === 3) {
      const p = Math.min(1.0, Math.max(0, bowProgress));
      let rigY = 0;
      let spineX = 0;
      let headX = 0;
      let armX = 1.14;
      let thighX = 0;
      let kneeX = 0;

      // Chu kỳ lạy 8 keyframe chuẩn chuasen.com:
      // Đứng chắp tay -> Quỳ gối -> Phủ phục trán chạm đất nâng Phật -> Ngồi dậy -> Đứng thẳng
      if (p < 0.15) {
        armX = 1.14;
      } else if (p < 0.34) {
        // Quỳ gối xuống sàn (Cc pose)
        const f = (p - 0.15) / (0.34 - 0.15);
        rigY = -0.16 * f;
        thighX = 0.59 * f;
        kneeX = -2.15 * f;
        spineX = 0.25 * f;
        armX = 1.14 + 0.2 * f;
      } else if (p < 0.62) {
        // Phủ phục sát đất, trán chạm sàn, hai tay nâng Phật (wc pose)
        const f = (p - 0.34) / (0.62 - 0.34);
        const wave = Math.sin(f * Math.PI);
        rigY = -0.16 - 0.10 * wave;
        thighX = 0.59 + 0.62 * wave;
        kneeX = -2.15 - 0.63 * wave;
        spineX = 0.25 + 0.85 * wave;
        headX = 0.55 * wave;
        armX = 1.34 + 0.78 * wave;
      } else if (p < 0.84) {
        // Đỡ người ngồi dậy trên gối (Cc pose)
        const f = 1 - (p - 0.62) / (0.84 - 0.62);
        rigY = -0.16 * f;
        thighX = 0.59 * f;
        kneeX = -2.15 * f;
        spineX = 0.25 * f;
        armX = 1.14 + 0.2 * f;
      } else {
        // Đứng thẳng dậy chắp tay trang nghiêm (xc pose)
        armX = 1.14;
      }

      rig.position.y = rigY;
      spine.rotation.x = spineX;
      headPivot.rotation.x = headX;

      legs[0].rotation.set(thighX, 0, 0.02);
      legs[1].rotation.set(thighX, 0, -0.02);
      knees[0].rotation.x = kneeX;
      knees[1].rotation.x = kneeX;

      shoulders[0].rotation.x = armX;
      shoulders[1].rotation.x = armX;
      centerPrayerHands.visible = true;
    }
    // 3. NGỒI THIỀN (Meditating - bc pose)
    else if (anim === 2) {
      const meditateBreathe = Math.sin(timer * 1.2) * 0.008;
      rig.position.y = -0.18 + meditateBreathe; // Hạ thấp trọng tâm xuống bồ đoàn
      spine.rotation.set(0.02 * meditateBreathe, 0, 0);
      headPivot.rotation.x = 0.04;

      // Hai chân xếp bằng hoa sen
      legs[0].rotation.set(1.25, 0, 0.6);
      legs[1].rotation.set(1.25, 0, -0.6);
      knees[0].rotation.x = -2.5;
      knees[1].rotation.x = -2.5;

      // Hai tay buông tĩnh tọa bắt ấn Tam Muội
      shoulders[0].rotation.set(0.77, 1.54, 0.1);
      shoulders[1].rotation.set(0.77, -1.54, -0.1);
      elbows[0].rotation.set(0.95, Math.PI / 2, 0);
      elbows[1].rotation.set(0.95, -Math.PI / 2, 0);
      centerPrayerHands.visible = false;
    }
    // 4. ĐỨNG YÊN TĨNH TÂM (Idle / Breathing vc pose)
    else {
      const breathe = Math.sin(timer * 1.7) * 0.012;

      rig.position.y = breathe * 0.4;
      hips.rotation.set(0, 0, 0);
      spine.rotation.set(0.012 * breathe, 0, 0);
      headPivot.rotation.x = -0.012 * breathe;

      // Đứng thẳng trang nghiêm
      legs[0].rotation.set(0, 0, 0.02);
      legs[1].rotation.set(0, 0, -0.02);
      knees[0].rotation.x = 0;
      knees[1].rotation.x = 0;

      if (currentCarryType === "broom") {
        // Đang cầm chổi đứng yên quét lá
        sweepPhase = (sweepPhase + 0.05) % (Math.PI * 2);
        const sweepAngle = Math.sin(sweepPhase) * 0.32;
        shoulders[0].rotation.set(0.95, 0.25 + sweepAngle * 0.2, 0.05);
        shoulders[1].rotation.set(0.95, -0.25 + sweepAngle * 0.2, -0.05);
        elbows[0].rotation.set(1.0, 0, 0);
        elbows[1].rotation.set(1.0, 0, 0);
        spine.rotation.y = sweepAngle * 0.22;
        spine.rotation.x = 0.08;
        if (currentCarry) {
          currentCarry.rotation.set(0.35, 0.2 + sweepAngle * 0.35, -0.25 + sweepAngle * 0.15);
        }
        centerPrayerHands.visible = false;
      } else {
        // Pose vc chuẩn Chùa Sen: Vai và khuỷu tay gập vào giữa ngực chắp sen
        shoulders[0].rotation.set(0.81, 1.2, 0.1);
        shoulders[1].rotation.set(0.81, -1.2, -0.1);
        elbows[0].rotation.set(1.14, 0, 0);
        elbows[1].rotation.set(1.14, 0, 0);
        centerPrayerHands.visible = true;
      }
    }
  };

  // Hàm co giãn bảng tên theo khoảng cách Camera chuẩn Chùa Sen (chuasen.com - fitPlate)
  const fitPlate = (camera: THREE.Camera) => {
    if (!nameSprite) return;
    const dist = camera.position.distanceTo(root.position);
    const fov = (camera as THREE.PerspectiveCamera).fov ?? 55;
    const baseWorldH = computePlateWorldHeight(dist, fov);
    const worldH = currentSubtitle ? baseWorldH * (94 / 56) : baseWorldH;
    nameSprite.scale.set(worldH * plateAspect, worldH, 1);
  };

  return {
    root,
    rig,
    hips,
    spine,
    headPivot,
    headMesh,
    torso,
    skirt,
    shoulders,
    elbows,
    legs,
    knees,
    shinMeshes,
    hatMesh,
    plate: nameSprite,
    // Thuộc tính tương thích ngược cho hệ thống hiện hữu
    bodyGroup: torso,
    headGroup: headPivot,
    armsGroup,
    leftLegGroup: legs[0],
    rightLegGroup: legs[1],
    skirtMesh: skirt,
    updateAnimation,
    fitPlate,
    setCarry,
    setSubtitle,
    showChatBubble,
  };
}

/**
 * Hàm tính toán chiều cao thực của bảng tên theo cự ly Camera chuẩn Chùa Sen (Xc & Yc)
 * Giữ bảng tên chiếm khoảng 2.8% chiều cao màn hình, không bao giờ bị phóng đại khổng lồ
 */
function smoothstep(min: number, max: number, value: number): number {
  const x = Math.min(1, Math.max(0, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
}

function computeScreenHeightFraction(dist: number): number {
  const Nc = 0.028; // Tỷ lệ chiếm màn hình chuẩn Chùa Sen
  const Pc = 0.9, Fc = 3.0, Ic = 0.62;
  const Lc = 8.0, Rc = 32.0;
  const t = Ic + 0.38 * smoothstep(Pc, Fc, dist);
  const n = 1 - 0.38 * smoothstep(Lc, Rc, dist);
  return Nc * t * n;
}

export function computePlateWorldHeight(dist: number, fov = 55): number {
  const d = Math.max(0, Number.isNaN(dist) ? 0 : dist);
  const clampedFov = Math.min(170, Math.max(5, fov));
  const frustumH = 2 * d * Math.tan((clampedFov * Math.PI) / 360);
  const targetWorldH = computeScreenHeightFraction(d) * frustumH;
  // Bị chặn nghiêm ngặt từ 0.13m (13cm) đến tối đa 0.36m (36cm)
  return Math.min(0.36, Math.max(0.13, targetWorldH));
}

/**
 * Tạo bảng tên danh hiệu Chùa Sen dạng viên thuốc bo tròn (Pill Tag)
 * Tinh tế, vừa vặn, chuẩn tỷ lệ Chùa Sen (chuasen.com)
 */
export function createNameTagSprite(
  name: string,
  level = "Cấp 1",
  isSelf = false,
  subtitle = ""
): { sprite: THREE.Sprite; aspect: number; texture: THREE.CanvasTexture } {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;

  // 1. Đo lường kích thước chữ chuẩn xác
  ctx.font = "bold 24px system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
  const nameWidth = Math.ceil(ctx.measureText(name).width);

  ctx.font = "600 18px system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
  const levelWidth = Math.ceil(ctx.measureText(level).width);

  const selfTagWidth = isSelf ? 46 : 0;
  const gap = 12;
  const levelBadgeW = levelWidth + 30;
  const padLeft = 14;
  const padRight = 12;

  const contentW = padLeft + (isSelf ? selfTagWidth + gap : 0) + nameWidth + gap + levelBadgeW + padRight;

  let subW = 0;
  if (subtitle) {
    ctx.font = "600 17px system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
    subW = Math.ceil(ctx.measureText(subtitle).width) + 32;
  }

  const canvasW = Math.max(160, Math.min(512, Math.max(contentW, subW)));
  const canvasH = subtitle ? 94 : 56;

  canvas.width = canvasW;
  canvas.height = canvasH;

  ctx.clearRect(0, 0, canvasW, canvasH);

  // 2. Khung nền kính tối bo tròn mờ cho hàng tên (Pill shape)
  const pillH = 50;
  const x = Math.round((canvasW - contentW) / 2);
  const y = 3;
  const w = contentW;
  const h = pillH;
  const r = h / 2;

  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(x, y, w, h, r);
  } else {
    ctx.rect(x, y, w, h);
  }

  if (isSelf) {
    ctx.fillStyle = "rgba(22, 16, 11, 0.78)";
    ctx.fill();
    ctx.strokeStyle = "rgba(242, 198, 98, 0.82)";
    ctx.lineWidth = 2.2;
    ctx.stroke();
  } else {
    ctx.fillStyle = "rgba(18, 12, 8, 0.65)";
    ctx.fill();
    ctx.strokeStyle = "rgba(220, 180, 95, 0.52)";
    ctx.lineWidth = 1.6;
    ctx.stroke();
  }

  let curX = x + padLeft;

  // 3. Tag [Tôi] màu xanh ngọc bích chuẩn Chùa Sen cho nhân vật chính
  if (isSelf) {
    const tagH = 26;
    const tagY = y + (h - tagH) / 2;
    ctx.beginPath();
    if (typeof ctx.roundRect === "function") {
      ctx.roundRect(curX, tagY, selfTagWidth, tagH, tagH / 2);
    } else {
      ctx.rect(curX, tagY, selfTagWidth, tagH);
    }
    ctx.fillStyle = "rgba(46, 125, 50, 0.9)";
    ctx.fill();
    ctx.strokeStyle = "rgba(129, 199, 132, 0.9)";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 15px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Tôi", curX + selfTagWidth / 2, tagY + tagH / 2 + 0.5);

    curX += selfTagWidth + gap;
  }

  // 4. Tên Phật tử màu trắng kem sáng rõ nét
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 22px system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";
  ctx.shadowColor = "rgba(0, 0, 0, 0.85)";
  ctx.shadowBlur = 4;
  ctx.shadowOffsetY = 1;
  ctx.fillText(name, curX, y + h / 2 + 1);
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  curX += nameWidth + gap;

  // 5. Huy hiệu cấp độ bên phải (Badge)
  const badgeH = 28;
  const badgeY = y + (h - badgeH) / 2;
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") {
    ctx.roundRect(curX, badgeY, levelBadgeW, badgeH, badgeH / 2);
  } else {
    ctx.rect(curX, badgeY, levelBadgeW, badgeH);
  }
  ctx.fillStyle = "rgba(245, 175, 55, 0.24)";
  ctx.fill();
  ctx.strokeStyle = "rgba(245, 185, 75, 0.78)";
  ctx.lineWidth = 1.4;
  ctx.stroke();

  // Chấm icon lá sen nhỏ màu vàng
  ctx.fillStyle = "#f6ca55";
  ctx.beginPath();
  ctx.arc(curX + 13, badgeY + badgeH / 2, 4.5, 0, Math.PI * 2);
  ctx.fill();

  // Tên cấp độ
  ctx.fillStyle = "#ffdf77";
  ctx.font = "600 17px system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(level, curX + 13 + (levelBadgeW - 13) / 2, badgeY + badgeH / 2 + 1);

  // 6. Subtitle trạng thái nếu có (đang thiền, đang niệm Phật, đang tụng kinh...)
  if (subtitle) {
    const subH = 32;
    const subY = 56;
    const subPillW = subW;
    const subX = Math.round((canvasW - subPillW) / 2);

    ctx.beginPath();
    if (typeof ctx.roundRect === "function") {
      ctx.roundRect(subX, subY, subPillW, subH, subH / 2);
    } else {
      ctx.rect(subX, subY, subPillW, subH);
    }
    ctx.fillStyle = "rgba(20, 13, 8, 0.65)";
    ctx.fill();
    ctx.strokeStyle = "rgba(232, 188, 104, 0.45)";
    ctx.lineWidth = 1.4;
    ctx.stroke();

    ctx.fillStyle = "#e8c98a";
    ctx.font = "600 17px system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(subtitle, canvasW / 2, subY + subH / 2 + 0.5);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;

  const spriteMat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: false,
    toneMapped: false,
  });

  const sprite = new THREE.Sprite(spriteMat);
  sprite.renderOrder = 999;
  const aspect = canvasW / canvasH;
  const baseH = subtitle ? 0.28 : 0.17;
  sprite.scale.set(baseH * aspect, baseH, 1);

  return { sprite, aspect, texture };
}
