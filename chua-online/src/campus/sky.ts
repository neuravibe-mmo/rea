/**
 * Giai đoạn 7: Chu kỳ Thời gian Ngày/Đêm (Day/Night Procedural Sky)
 *
 * - Dựa vào giờ địa phương Việt Nam (UTC+7):
 *   - 5h45 - 7h30: Bình minh rạng đông (Dawn)
 *   - 7h30 - 16h30: Ban ngày nắng ấm thanh tịnh (Day)
 *   - 16h30 - 19h00: Hoàng hôn ráng chiều đỏ vàng sau chánh điện (Dusk)
 *   - 19h00 - 5h45: Đêm trăng sao thanh vắng, đèn lồng sân chùa rực sáng (Night)
 * - Tự động nội suy (Lerp) màu nền, sương mù (Fog), DirectionalLight (Mặt trời/Mặt trăng),
 *   HemisphereLight, vòm trời Shader 3D (Sky Dome) và dàn đèn lồng đá sân chùa.
 */

import * as THREE from "three";

export interface SkyPreset {
  skyTop: THREE.Color;
  skyUpper: THREE.Color;
  skyMid: THREE.Color;
  skyHorizon: THREE.Color;
  glow: THREE.Color;
  glowAmount: number;
  sunColor: THREE.Color;
  sunDir: THREE.Vector3;
  sunAmount: number;
  moonAmount: number;
  moonDir: THREE.Vector3;
  stars: number;
  cloudLit: THREE.Color;
  cloudShade: THREE.Color;
  cloudCover: number;
  fogColor: THREE.Color;
  fogNear: number;
  fogFar: number;
  sunLightColor: THREE.Color;
  sunLightIntensity: number;
  hemiSky: THREE.Color;
  hemiGround: THREE.Color;
  hemiIntensity: number;
  lanternIntensity: number;
  isNight: boolean;
}

function dirFromAngles(azimuthDeg: number, altitudeDeg: number): THREE.Vector3 {
  const az = (azimuthDeg * Math.PI) / 180;
  const alt = (altitudeDeg * Math.PI) / 180;
  return new THREE.Vector3(
    Math.sin(az) * Math.cos(alt),
    Math.sin(alt),
    -Math.cos(az) * Math.cos(alt),
  ).normalize();
}

const PRESETS: Record<"dawn" | "day" | "dusk" | "night", SkyPreset> = {
  // 1. Bình minh (Dawn)
  dawn: {
    skyTop: new THREE.Color(0x6a86bd),
    skyUpper: new THREE.Color(0xbb9f86),
    skyMid: new THREE.Color(0xf0b384),
    skyHorizon: new THREE.Color(0xfb7a70),
    glow: new THREE.Color(0xffa830),
    glowAmount: 1.0,
    sunColor: new THREE.Color(0xffbe70),
    sunDir: dirFromAngles(130, 14),
    sunAmount: 0.9,
    moonAmount: 0.2,
    moonDir: dirFromAngles(-40, 20),
    stars: 0.1,
    cloudLit: new THREE.Color(0xfff0db),
    cloudShade: new THREE.Color(0xc88373),
    cloudCover: 0.48,
    fogColor: new THREE.Color(0xbaa08e),
    fogNear: 20,
    fogFar: 110,
    sunLightColor: new THREE.Color(0xffdfaa),
    sunLightIntensity: 0.9,
    hemiSky: new THREE.Color(0xffd5a0),
    hemiGround: new THREE.Color(0x553e2e),
    hemiIntensity: 0.65,
    lanternIntensity: 0.4,
    isNight: false,
  },

  // 2. Ban ngày (Day)
  day: {
    skyTop: new THREE.Color(0x3b7dbf),
    skyUpper: new THREE.Color(0x6baec4),
    skyMid: new THREE.Color(0xa4d2ce),
    skyHorizon: new THREE.Color(0xe0f0f0),
    glow: new THREE.Color(0xfffaea),
    glowAmount: 0.35,
    sunColor: new THREE.Color(0xfffaeb),
    sunDir: dirFromAngles(-160, 55),
    sunAmount: 1.0,
    moonAmount: 0.0,
    moonDir: dirFromAngles(0, -30),
    stars: 0.0,
    cloudLit: new THREE.Color(0xffffff),
    cloudShade: new THREE.Color(0x9fb3c4),
    cloudCover: 0.52,
    fogColor: new THREE.Color(0xb5cfd8),
    fogNear: 35,
    fogFar: 130,
    sunLightColor: new THREE.Color(0xfffaed),
    sunLightIntensity: 1.35,
    hemiSky: new THREE.Color(0xffeedd),
    hemiGround: new THREE.Color(0x443322),
    hemiIntensity: 0.8,
    lanternIntensity: 0.0,
    isNight: false,
  },

  // 3. Hoàng hôn ráng chiều (Dusk)
  dusk: {
    skyTop: new THREE.Color(0x55677a),
    skyUpper: new THREE.Color(0xb188a8),
    skyMid: new THREE.Color(0xe59a80),
    skyHorizon: new THREE.Color(0xf6674c),
    glow: new THREE.Color(0xff7722),
    glowAmount: 1.2,
    sunColor: new THREE.Color(0xff9944),
    sunDir: dirFromAngles(-132, 12),
    sunAmount: 0.95,
    moonAmount: 0.25,
    moonDir: dirFromAngles(-24, 26),
    stars: 0.05,
    cloudLit: new THREE.Color(0xffd4b2),
    cloudShade: new THREE.Color(0xa55263),
    cloudCover: 0.5,
    fogColor: new THREE.Color(0x946560),
    fogNear: 25,
    fogFar: 110,
    sunLightColor: new THREE.Color(0xff8844),
    sunLightIntensity: 0.95,
    hemiSky: new THREE.Color(0xffaa77),
    hemiGround: new THREE.Color(0x3e221d),
    hemiIntensity: 0.7,
    lanternIntensity: 0.6,
    isNight: false,
  },

  // 4. Ban đêm tĩnh mịch (Night)
  night: {
    skyTop: new THREE.Color(0x070b1f),
    skyUpper: new THREE.Color(0x111a36),
    skyMid: new THREE.Color(0x1e2b52),
    skyHorizon: new THREE.Color(0x344164),
    glow: new THREE.Color(0x131a38),
    glowAmount: 0.2,
    sunColor: new THREE.Color(0x445577),
    sunDir: dirFromAngles(180, -20),
    sunAmount: 0.0,
    moonAmount: 1.0,
    moonDir: dirFromAngles(-24, 42),
    stars: 1.0,
    cloudLit: new THREE.Color(0x4b587a),
    cloudShade: new THREE.Color(0x161a29),
    cloudCover: 0.45,
    fogColor: new THREE.Color(0x0e1324),
    fogNear: 18,
    fogFar: 95,
    sunLightColor: new THREE.Color(0x8ba4cc), // Ánh trăng bàng bạc
    sunLightIntensity: 0.32,
    hemiSky: new THREE.Color(0x273656),
    hemiGround: new THREE.Color(0x0d1424),
    hemiIntensity: 0.42,
    lanternIntensity: 1.3,
    isNight: true,
  },
};

const SKY_VERTEX_SHADER = `
varying vec3 vDir;
void main() {
  vDir = normalize(position);
  gl_Position = (projectionMatrix * modelViewMatrix * vec4(position, 1.0)).xyww;
}
`;

const SKY_FRAGMENT_SHADER = `
uniform vec3 uTop;
uniform vec3 uUpper;
uniform vec3 uMid;
uniform vec3 uHorizon;
uniform vec3 uGlow;
uniform float uGlowAmt;
uniform vec3 uSunDir;
uniform vec3 uSunColor;
uniform float uSunAmt;
uniform vec3 uMoonDir;
uniform float uMoonAmt;
uniform float uStars;
uniform vec3 uCloudLit;
uniform vec3 uCloudShade;
uniform float uCloudCover;
uniform float uTime;

varying vec3 vDir;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x),
    mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

float fbm(vec2 p) {
  float a = 0.5;
  float s = 0.0;
  for (int i = 0; i < 4; i++) {
    s += a * vnoise(p);
    p = p * 2.04 + vec2(15.1, 8.7);
    a *= 0.5;
  }
  return s;
}

void main() {
  vec3 d = normalize(vDir);
  float h = max(d.y, 0.0);

  // 1. Dải màu chân trời 4 tầng
  vec3 col = mix(uHorizon, uMid, smoothstep(0.0, 0.16, h));
  col = mix(col, uUpper, smoothstep(0.1, 0.42, h));
  col = mix(col, uTop, smoothstep(0.34, 0.95, h));

  // 2. Ráng chiều / bình minh
  float g = max(dot(d, uSunDir), 0.0);
  float low = 1.0 - smoothstep(0.0, 0.5, h);
  col += uGlow * uGlowAmt * (pow(g, 2.5) * 0.3 * low + pow(g, 10.0) * 0.3);

  // 3. Đĩa mặt trời
  col += uSunColor * uSunAmt * (pow(g, 5.0) * 0.25 + pow(g, 64.0) * 0.75 + smoothstep(0.9990, 0.9997, g) * 1.5);

  // 4. Bầu trời đêm: Trăng rằm & Sao lung linh
  if (uStars > 0.01 && h > 0.02) {
    vec2 starUv = d.xz / (h + 0.1) * 35.0;
    float r = hash21(floor(starUv));
    float starBright = step(0.92, r) * (0.6 + 0.4 * sin(uTime * 2.5 + r * 62.0)) * smoothstep(0.02, 0.15, h) * uStars;
    col += vec3(0.9, 0.95, 1.0) * starBright * 1.4;
  }

  if (uMoonAmt > 0.01) {
    float md = dot(d, uMoonDir);
    col += vec3(0.7, 0.8, 1.0) * uMoonAmt * (pow(max(md, 0.0), 30.0) * 0.15 + pow(max(md, 0.0), 200.0) * 0.4);
    if (md > 0.9982) {
      col = mix(col, vec3(1.0, 0.98, 0.92) * 1.2, uMoonAmt);
    }
  }

  // 5. Mây trôi bồng bềnh
  if (h > 0.02) {
    vec2 cloudUv = d.xz / (h + 0.3) * vec2(2.6, 2.0) + vec2(uTime * 0.012, uTime * 0.005);
    float n = fbm(cloudUv);
    float cover = smoothstep(uCloudCover, uCloudCover + 0.18, n);
    float fade = smoothstep(0.0, 0.22, h);
    if (cover * fade > 0.005) {
      vec3 cloud = mix(uCloudShade, uCloudLit, clamp(n * 1.2, 0.0, 1.0));
      cloud += uGlow * uGlowAmt * pow(g, 3.0) * 0.4;
      col = mix(col, cloud, cover * fade * 0.88);
    }
  }

  gl_FragColor = vec4(col, 1.0);
}
`;

export class SkyManager {
  private scene: THREE.Scene;
  private dirLight: THREE.DirectionalLight;
  private hemiLight: THREE.HemisphereLight;
  private skyMesh: THREE.Mesh | null = null;
  private skyMaterial: THREE.ShaderMaterial | null = null;

  // Đèn lồng sân chùa & nến bàn thờ
  private lanternLights: THREE.PointLight[] = [];

  // Trạng thái bầu trời hiện tại
  private currentHour = 10;
  private timeElapsed = 0;
  private isNight = false;

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    // 1. Ánh sáng Bán Cầu (HemisphereLight)
    this.hemiLight = new THREE.HemisphereLight(0xffeedd, 0x443322, 0.8);
    this.scene.add(this.hemiLight);

    // 2. Ánh sáng Mặt trời / Mặt trăng (DirectionalLight)
    this.dirLight = new THREE.DirectionalLight(0xfffaed, 1.3);
    this.dirLight.position.set(20, 45, 20);
    this.dirLight.castShadow = true;
    this.dirLight.shadow.mapSize.width = 1024;
    this.dirLight.shadow.mapSize.height = 1024;
    this.dirLight.shadow.camera.near = 5;
    this.dirLight.shadow.camera.far = 110;
    this.dirLight.shadow.camera.left = -32;
    this.dirLight.shadow.camera.right = 32;
    this.dirLight.shadow.camera.top = 32;
    this.dirLight.shadow.camera.bottom = -32;
    this.dirLight.shadow.bias = -0.0006;
    this.scene.add(this.dirLight);

    // 3. Khởi tạo Vòm Trời Thủ Tục (Procedural Sky Dome)
    this.initSkyDome();

    // 4. Khởi tạo Dàn Đèn Lồng Sân Chùa (Night Lanterns)
    this.initLanternLights();

    // 5. Cập nhật theo giờ Việt Nam
    this.updateTimeOfDay();
  }

  private initSkyDome(): void {
    const uniforms = {
      uTop: { value: new THREE.Color() },
      uUpper: { value: new THREE.Color() },
      uMid: { value: new THREE.Color() },
      uHorizon: { value: new THREE.Color() },
      uGlow: { value: new THREE.Color() },
      uGlowAmt: { value: 1.0 },
      uSunDir: { value: new THREE.Vector3(0, 1, 0) },
      uSunColor: { value: new THREE.Color() },
      uSunAmt: { value: 1.0 },
      uMoonDir: { value: new THREE.Vector3(0, 1, 0) },
      uMoonAmt: { value: 0.0 },
      uStars: { value: 0.0 },
      uCloudLit: { value: new THREE.Color() },
      uCloudShade: { value: new THREE.Color() },
      uCloudCover: { value: 0.5 },
      uTime: { value: 0.0 },
    };

    this.skyMaterial = new THREE.ShaderMaterial({
      uniforms,
      vertexShader: SKY_VERTEX_SHADER,
      fragmentShader: SKY_FRAGMENT_SHADER,
      side: THREE.BackSide,
      depthWrite: false,
      depthTest: true,
      fog: false,
    });

    const geom = new THREE.SphereGeometry(300, 32, 16);
    this.skyMesh = new THREE.Mesh(geom, this.skyMaterial);
    this.skyMesh.renderOrder = 999;
    this.skyMesh.frustumCulled = false;
    this.scene.add(this.skyMesh);
  }

  private initLanternLights(): void {
    // Tọa độ 8 cây đèn lồng đá sân chùa + 1 đèn bàn thờ Tam Bảo
    const positions: [number, number, number][] = [
      [-4.5, 1.6, 6],
      [4.5, 1.6, 6],
      [-4.5, 1.6, 14],
      [4.5, 1.6, 14],
      [-4.5, 1.6, 22],
      [4.5, 1.6, 22],
      [-6.5, 1.6, -4],
      [6.5, 1.6, -4],
      [0, 2.2, -18.0], // Gian Chánh Điện
    ];

    for (const [x, y, z] of positions) {
      const pl = new THREE.PointLight(0xffaa33, 0, 7.5, 1.8);
      pl.position.set(x, y, z);
      this.scene.add(pl);
      this.lanternLights.push(pl);
    }
  }

  /**
   * Tính toán tỉ lệ pha bầu trời dựa trên giờ Việt Nam (UTC+7)
   */
  public getSkyBlend(hour: number): {
    from: SkyPreset;
    to: SkyPreset;
    t: number;
  } {
    // Schedule:
    // 4.5h -> night
    // 5.75h -> dawn (bình minh)
    // 7.5h -> day (ban ngày)
    // 16.5h -> day
    // 17.75h -> dusk (hoàng hôn)
    // 19.0h -> night (ban đêm)
    const h = ((hour % 24) + 24) % 24;

    if (h >= 19.0 || h < 4.5) {
      return { from: PRESETS.night, to: PRESETS.night, t: 0 };
    } else if (h >= 4.5 && h < 5.75) {
      const t = (h - 4.5) / (5.75 - 4.5);
      return { from: PRESETS.night, to: PRESETS.dawn, t };
    } else if (h >= 5.75 && h < 7.5) {
      const t = (h - 5.75) / (7.5 - 5.75);
      return { from: PRESETS.dawn, to: PRESETS.day, t };
    } else if (h >= 7.5 && h < 16.5) {
      return { from: PRESETS.day, to: PRESETS.day, t: 0 };
    } else if (h >= 16.5 && h < 17.75) {
      const t = (h - 16.5) / (17.75 - 16.5);
      return { from: PRESETS.day, to: PRESETS.dusk, t };
    } else {
      const t = (h - 17.75) / (19.0 - 17.75);
      return { from: PRESETS.dusk, to: PRESETS.night, t };
    }
  }

  /**
   * Cập nhật thời gian ngày đêm theo giờ thực tế Việt Nam
   */
  public updateTimeOfDay(forcedHour?: number): void {
    let vnHour: number;
    if (forcedHour !== undefined) {
      vnHour = forcedHour;
    } else {
      const now = new Date();
      const utcMs = now.getTime() + now.getTimezoneOffset() * 60000;
      const vnDate = new Date(utcMs + 3600000 * 7);
      vnHour =
        vnDate.getHours() +
        vnDate.getMinutes() / 60 +
        vnDate.getSeconds() / 3600;
    }

    this.currentHour = vnHour;
    const { from, to, t } = this.getSkyBlend(vnHour);

    // Nội suy ánh sáng & màu sắc
    const sunColor = from.sunLightColor.clone().lerp(to.sunLightColor, t);
    const sunIntensity =
      from.sunLightIntensity +
      (to.sunLightIntensity - from.sunLightIntensity) * t;
    this.dirLight.color.copy(sunColor);
    this.dirLight.intensity = sunIntensity;

    const hemiSky = from.hemiSky.clone().lerp(to.hemiSky, t);
    const hemiGround = from.hemiGround.clone().lerp(to.hemiGround, t);
    const hemiIntensity =
      from.hemiIntensity + (to.hemiIntensity - from.hemiIntensity) * t;
    this.hemiLight.color.copy(hemiSky);
    this.hemiLight.groundColor.copy(hemiGround);
    this.hemiLight.intensity = hemiIntensity;

    // Hướng nguồn sáng (mặt trời/mặt trăng)
    const lightDir = from.sunDir.clone().lerp(to.sunDir, t).normalize();
    this.dirLight.position.set(
      lightDir.x * 45,
      Math.max(lightDir.y * 50, 10),
      lightDir.z * 45,
    );

    // Sương mù & màu nền Scene
    const fogColor = from.fogColor.clone().lerp(to.fogColor, t);
    const fogNear = from.fogNear + (to.fogNear - from.fogNear) * t;
    const fogFar = from.fogFar + (to.fogFar - from.fogFar) * t;
    this.scene.background = fogColor;
    this.scene.fog = new THREE.Fog(fogColor, fogNear, fogFar);

    // Cập nhật đèn lồng đá sân chùa (bật sáng ấm áp khi hoàng hôn/đêm)
    const lanternInt =
      from.lanternIntensity + (to.lanternIntensity - from.lanternIntensity) * t;
    for (const pl of this.lanternLights) {
      pl.intensity = lanternInt;
    }

    // Cập nhật Uniforms Shader Vòm Trời
    if (this.skyMaterial) {
      const u = this.skyMaterial.uniforms;
      u.uTop.value.copy(from.skyTop).lerp(to.skyTop, t);
      u.uUpper.value.copy(from.skyUpper).lerp(to.skyUpper, t);
      u.uMid.value.copy(from.skyMid).lerp(to.skyMid, t);
      u.uHorizon.value.copy(from.skyHorizon).lerp(to.skyHorizon, t);

      u.uGlow.value.copy(from.glow).lerp(to.glow, t);
      u.uGlowAmt.value =
        from.glowAmount + (to.glowAmount - from.glowAmount) * t;

      u.uSunDir.value.copy(from.sunDir).lerp(to.sunDir, t).normalize();
      u.uSunColor.value.copy(from.sunColor).lerp(to.sunColor, t);
      u.uSunAmt.value = from.sunAmount + (to.sunAmount - from.sunAmount) * t;

      u.uMoonDir.value.copy(from.moonDir).lerp(to.moonDir, t).normalize();
      u.uMoonAmt.value =
        from.moonAmount + (to.moonAmount - from.moonAmount) * t;
      u.uStars.value = from.stars + (to.stars - from.stars) * t;

      u.uCloudLit.value.copy(from.cloudLit).lerp(to.cloudLit, t);
      u.uCloudShade.value.copy(from.cloudShade).lerp(to.cloudShade, t);
      u.uCloudCover.value =
        from.cloudCover + (to.cloudCover - from.cloudCover) * t;
    }

    this.isNight = vnHour >= 18.5 || vnHour < 5.5;
  }

  /**
   * Cập nhật chuyển động mây và sao trong vòng lặp Render
   */
  public update(deltaSec: number): void {
    this.timeElapsed += deltaSec;
    if (this.skyMaterial) {
      this.skyMaterial.uniforms.uTime.value = this.timeElapsed;
    }
  }

  public getHour(): number {
    return this.currentHour;
  }

  public getIsNight(): boolean {
    return this.isNight;
  }
}
