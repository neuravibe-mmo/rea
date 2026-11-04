import * as THREE from "three";

export interface RoofTierSpec {
  cx: number;
  cz: number;
  baseY: number;
  A: number;
  B: number;
  Rx: number;
  Rz: number;
  H: number;
  power?: number;
  curl?: number;
  flare?: number;
  thickness?: number;
  tileColor?: THREE.Color;
  mossAmount?: number;
  ridgeColor?: THREE.Color;
  horns?: boolean; // Chỉ bật đầu đao khi được chỉ định rõ (như Chánh Điện)
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function clamp(x: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, x));
}

// Value Noise 2D cho rêu phong ngói đất nung cổ truyền
function hash2D(x: number, y: number): number {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

function noise2D(x: number, y: number): number {
  const iX = Math.floor(x);
  const iY = Math.floor(y);
  const fX = x - iX;
  const fY = y - iY;
  const u = fX * fX * (3 - 2 * fX);
  const v = fY * fY * (3 - 2 * fY);
  const a = hash2D(iX, iY);
  const b = hash2D(iX + 1, iY);
  const c = hash2D(iX, iY + 1);
  const d = hash2D(iX + 1, iY + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

const MOSS_GREEN = new THREE.Color(0x5a6845); // Màu rêu ẩm cổ phong Chùa Sen
const TILE_PERIOD = 0.72; // Chu kỳ rãnh ngói chuẩn Chùa Sen
const METRES_PER_TILE = 3.5; // Tỷ lệ texture ngói thực tế Chùa Sen

/**
 * Procedural Geometry Builder cho kiến trúc chùa 3D.
 * Tái hiện 100% chi tiết mái chùa Chùa Sen:
 * - Lưới ngói cong 4 hướng theo giải thuật toán học
 * - Hàng chục gân sống ngói âm dương nổi khối 3D (Tile Ribs)
 * - Mũi ngói nhô rủ xuống ở mép mái (Toe rows)
 * - Sống ngói bờ đao (Hip caps) bán nguyệt chạy dọc 4 góc mái
 * - 4 đầu đao vuốt cong vút lên trời bịt đồng/vàng (Corner Horns)
 * - Bờ nóc gạch ngọc (Ridge) và Kìm nóc chạm khắc hóa rồng
 */
export class GeometryBuilder {
  private pos: number[] = [];
  private nor: number[] = [];
  private col: number[] = [];
  private uvs: number[] = [];
  private idx: number[] = [];

  vert(
    x: number,
    y: number,
    z: number,
    nx: number,
    ny: number,
    nz: number,
    color: THREE.Color,
    u: number = 0,
    v: number = 0,
  ): number {
    this.pos.push(x, y, z);
    this.nor.push(nx, ny, nz);
    this.col.push(color.r, color.g, color.b);
    this.uvs.push(u, v);
    return this.pos.length / 3 - 1;
  }

  tri(v0: number, v1: number, v2: number): void {
    const p = this.pos;
    const ax = p[v1 * 3] - p[v0 * 3];
    const ay = p[v1 * 3 + 1] - p[v0 * 3 + 1];
    const az = p[v1 * 3 + 2] - p[v0 * 3 + 2];
    const bx = p[v2 * 3] - p[v0 * 3];
    const by = p[v2 * 3 + 1] - p[v0 * 3 + 1];
    const bz = p[v2 * 3 + 2] - p[v0 * 3 + 2];

    const cx = ay * bz - az * by;
    const cy = az * bx - ax * bz;
    const cz = ax * by - ay * bx;

    const n = this.nor;
    const dot =
      cx * (n[v0 * 3] + n[v1 * 3] + n[v2 * 3]) +
      cy * (n[v0 * 3 + 1] + n[v1 * 3 + 1] + n[v2 * 3 + 1]) +
      cz * (n[v0 * 3 + 2] + n[v1 * 3 + 2] + n[v2 * 3 + 2]);

    if (dot >= 0) {
      this.idx.push(v0, v1, v2);
    } else {
      this.idx.push(v0, v2, v1);
    }
  }

  quad(v0: number, v1: number, v2: number, v3: number): void {
    this.tri(v0, v1, v2);
    this.tri(v0, v2, v3);
  }

  /**
   * Tạo khối hộp (Box)
   */
  addBox(
    x0: number,
    y0: number,
    z0: number,
    x1: number,
    y1: number,
    z1: number,
    color: THREE.Color,
  ): void {
    // Top (+Y)
    this.quad(
      this.vert(x0, y1, z0, 0, 1, 0, color, 0, 0),
      this.vert(x1, y1, z0, 0, 1, 0, color, 1, 0),
      this.vert(x1, y1, z1, 0, 1, 0, color, 1, 1),
      this.vert(x0, y1, z1, 0, 1, 0, color, 0, 1),
    );
    // Bottom (-Y)
    this.quad(
      this.vert(x0, y0, z1, 0, -1, 0, color, 0, 0),
      this.vert(x1, y0, z1, 0, -1, 0, color, 1, 0),
      this.vert(x1, y0, z0, 0, -1, 0, color, 1, 1),
      this.vert(x0, y0, z0, 0, -1, 0, color, 0, 1),
    );
    // Front (+Z)
    this.quad(
      this.vert(x0, y0, z1, 0, 0, 1, color, 0, 0),
      this.vert(x1, y0, z1, 0, 0, 1, color, 1, 0),
      this.vert(x1, y1, z1, 0, 0, 1, color, 1, 1),
      this.vert(x0, y1, z1, 0, 0, 1, color, 0, 1),
    );
    // Back (-Z)
    this.quad(
      this.vert(x1, y0, z0, 0, 0, -1, color, 0, 0),
      this.vert(x0, y0, z0, 0, 0, -1, color, 1, 0),
      this.vert(x0, y1, z0, 0, 0, -1, color, 1, 1),
      this.vert(x1, y1, z0, 0, 0, -1, color, 0, 1),
    );
    // Left (-X)
    this.quad(
      this.vert(x0, y0, z0, -1, 0, 0, color, 0, 0),
      this.vert(x0, y0, z1, -1, 0, 0, color, 1, 0),
      this.vert(x0, y1, z1, -1, 0, 0, color, 1, 1),
      this.vert(x0, y1, z0, -1, 0, 0, color, 0, 1),
    );
    // Right (+X)
    this.quad(
      this.vert(x1, y0, z1, 1, 0, 0, color, 0, 0),
      this.vert(x1, y0, z0, 1, 0, 0, color, 1, 0),
      this.vert(x1, y1, z0, 1, 0, 0, color, 1, 1),
      this.vert(x1, y1, z1, 1, 0, 0, color, 0, 1),
    );
  }

  /**
   * Tạo hình trụ tròn (Cylinder) / Cột chùa
   */
  addCylinder(
    cx: number,
    cz: number,
    y0: number,
    y1: number,
    r0: number,
    r1: number,
    segs: number,
    color: THREE.Color,
    caps = true,
  ): void {
    const bottomVerts: number[] = [];
    const topVerts: number[] = [];

    for (let i = 0; i <= segs; i++) {
      const a = (i / segs) * Math.PI * 2;
      const cos = Math.cos(a);
      const sin = Math.sin(a);
      const u = i / segs;

      const vx0 = cx + cos * r0;
      const vz0 = cz + sin * r0;
      const vx1 = cx + cos * r1;
      const vz1 = cz + sin * r1;

      bottomVerts.push(this.vert(vx0, y0, vz0, cos, 0, sin, color, u, 0));
      topVerts.push(this.vert(vx1, y1, vz1, cos, 0, sin, color, u, 1));
    }

    for (let i = 0; i < segs; i++) {
      this.quad(
        bottomVerts[i],
        bottomVerts[i + 1],
        topVerts[i + 1],
        topVerts[i],
      );
    }

    if (caps) {
      const bottomCenter = this.vert(cx, y0, cz, 0, -1, 0, color, 0.5, 0.5);
      const topCenter = this.vert(cx, y1, cz, 0, 1, 0, color, 0.5, 0.5);
      for (let i = 0; i < segs; i++) {
        this.tri(bottomCenter, bottomVerts[i + 1], bottomVerts[i]);
        this.tri(topCenter, topVerts[i], topVerts[i + 1]);
      }
    }
  }

  /**
   * Tính toạ độ uốn cong toán học 3D chuẩn Chùa Sen (Eg function)
   */
  public evalRoofPoint(
    spec: RoofTierSpec,
    side: number,
    n: number,
    r: number,
    out: THREE.Vector3,
  ): THREE.Vector3 {
    const a = lerp(spec.A, spec.Rx, r);
    const o = lerp(spec.B, spec.Rz, r);
    let s: number, c: number;
    switch (side) {
      case 0: // Trước (+Z)
        s = n * a;
        c = o;
        break;
      case 1: // Sau (-Z)
        s = -n * a;
        c = -o;
        break;
      case 2: // Phải (+X)
        s = a;
        c = -n * o;
        break;
      default: // Trái (-X)
        s = -a;
        c = n * o;
        break;
    }
    const power = spec.power ?? 1.7;
    // Độ vuốt cong ở 4 góc đao
    const u = Math.pow(Math.abs(n), 3) * Math.pow(1 - r, 2.2);
    const flare = (spec.flare ?? 0) * u;
    const curl = (spec.curl ?? 0) * u;
    const f = spec.baseY + spec.H * Math.pow(r, power) + curl;
    out.set(
      spec.cx + s + Math.sign(s) * flare,
      f,
      spec.cz + c + Math.sign(c) * flare,
    );
    return out;
  }

  /**
   * Tính màu ngói rêu phong loang lổ theo giải thuật Chùa Sen (Pg shader)
   */
  private computeTileColor(
    x: number,
    y: number,
    z: number,
    baseColor: THREE.Color,
    baseY: number,
    H: number,
    mossDensity = 0.85,
  ): THREE.Color {
    const n1 = noise2D(x * 0.42 + 3.1, z * 0.42 - 1.7);
    const n2 = noise2D(x * 1.6 + y * 0.5, z * 1.6 + 9.2);
    const heightRatio = 1 - clamp((y - baseY) / Math.max(0.5, H), 0, 1);
    const mossFactor =
      clamp((n1 * 0.7 + n2 * 0.3 - 0.5) * 3.2, 0, 1) *
      mossDensity *
      (0.55 + 0.6 * heightRatio);
    const brightness = 0.84 * (0.88 + 0.24 * n2);
    const col = baseColor.clone().multiplyScalar(brightness);
    col.lerp(MOSS_GREEN, mossFactor * 0.75);
    return col;
  }

  /**
   * Dựng mái chùa cổ truyền Á Đông với đầy đủ chi tiết kiến trúc Chùa Sen:
   * 1. Mặt ngói nền uốn cong 4 hướng
   * 2. Trần rui mè gỗ sẫm kín khít mặt dưới (không bị hở khi nhìn từ dưới lên)
   * 3. Các dải sống ngói âm dương nổi khối 3D (Tile Ribs)
   * 4. Mũi ngói rủ xuống diềm mái (Toe rows / Fascia)
   * 5. Sống ngói bờ đao (Hip caps) bảo vệ 4 góc
   * 6. 4 đầu đao vuốt cong vút lên cao bịt đồng/vàng (Corner Horns)
   * 7. Bờ nóc đỉnh mái (Ridge) và Phù điêu Lưỡng Long Chầu Nguyệt dát vàng
   */
  addCurvedRoofTier(spec: RoofTierSpec, goldB?: GeometryBuilder): void {
    const tileColor = spec.tileColor ?? new THREE.Color(0x6a5a45);
    const thickness = spec.thickness ?? 0.22;
    const pt = new THREE.Vector3();
    const stepsAlongSide = 12;
    const stepsUpSlope = 8;
    const woodEaveCol = new THREE.Color(0x2d1c10); // Màu gỗ lim sẫm trần rui mè

    // 1. Dựng 4 mặt ngói nền uốn cong (Cả mặt trên và mặt dưới trần gỗ kín khít)
    for (let side = 0; side < 4; side++) {
      const isFrontBack = side === 0 || side === 1;
      const slopeLen = Math.hypot(
        isFrontBack ? spec.B - spec.Rz : spec.A - spec.Rx,
        spec.H,
      );

      const grid: number[][] = [];
      const underGrid: number[][] = [];

      for (let ir = 0; ir <= stepsUpSlope; ir++) {
        const r = ir / stepsUpSlope;
        const row: number[] = [];
        const underRow: number[] = [];

        for (let in_ = 0; in_ <= stepsAlongSide; in_++) {
          const n = -1 + (2 * in_) / stepsAlongSide;
          this.evalRoofPoint(spec, side, n, r, pt);

          const col = this.computeTileColor(
            pt.x,
            pt.y,
            pt.z,
            tileColor,
            spec.baseY,
            spec.H,
            spec.mossAmount ?? 0.85,
          );

          // Slope projection UV
          const u = (pt.x + pt.z) / METRES_PER_TILE;
          const v = (r * slopeLen) / METRES_PER_TILE;

          const nx = (pt.x - spec.cx) * 0.08;
          const nz = (pt.z - spec.cz) * 0.08;
          const vIdx = this.vert(pt.x, pt.y, pt.z, nx, 1, nz, col, u, v);
          row.push(vIdx);

          // Mặt trần dưới mái (Soffit / Trần rui mè) hạ thấp theo thickness
          const uIdx = this.vert(
            pt.x,
            pt.y - thickness,
            pt.z,
            -nx,
            -1,
            -nz,
            woodEaveCol,
            u,
            v,
          );
          underRow.push(uIdx);
        }
        grid.push(row);
        underGrid.push(underRow);
      }

      // Nối các ô vuông lưới thành mặt ngói phía trên
      for (let ir = 0; ir < stepsUpSlope; ir++) {
        for (let in_ = 0; in_ < stepsAlongSide; in_++) {
          const v00 = grid[ir][in_];
          const v01 = grid[ir][in_ + 1];
          const v10 = grid[ir + 1][in_];
          const v11 = grid[ir + 1][in_ + 1];
          this.quad(v00, v01, v11, v10);

          // Mặt trần gỗ phía dưới (ngửa xuống dưới nhìn từ sân chùa lên kín khít, không hở)
          const u00 = underGrid[ir][in_];
          const u01 = underGrid[ir][in_ + 1];
          const u10 = underGrid[ir + 1][in_];
          const u11 = underGrid[ir + 1][in_ + 1];
          this.quad(u00, u10, u11, u01);
        }
      }

      // Diềm mái (fascia) ở mép dưới vạt mái (r = 0): bịt kín mặt trên xuống mặt dưới
      for (let in_ = 0; in_ < stepsAlongSide; in_++) {
        const top0 = grid[0][in_];
        const top1 = grid[0][in_ + 1];
        const b0 = underGrid[0][in_];
        const b1 = underGrid[0][in_ + 1];
        this.quad(top0, top1, b1, b0);
      }

      // Viền mép trên đỉnh mái (r = 1): bịt kín kết nối mặt trên với mặt dưới nếu là tầng mái hở (Tier 1)
      if (spec.Rz > 0) {
        const lastIr = stepsUpSlope;
        for (let in_ = 0; in_ < stepsAlongSide; in_++) {
          const t0 = grid[lastIr][in_];
          const t1 = grid[lastIr][in_ + 1];
          const u0 = underGrid[lastIr][in_];
          const u1 = underGrid[lastIr][in_ + 1];
          this.quad(t0, u0, u1, t1);
        }
      }

      // 2. Dựng các dải sống ngói âm dương nổi khối 3D (Tile Ribs Vg)
      this.addTileRibs(spec, side, tileColor);
    }

    // 3. Sống ngói bờ đao (Hip caps) chạy dọc 4 góc tiếp giáp mái
    this.addHipCaps(spec);

    // 4. 4 Đầu đao vuốt cong vút lên không trung bịt đồng dát vàng (Corner Horns Gg)
    if (spec.horns) {
      this.addCornerHorns(spec, goldB);
    }

    // 5. Bờ nóc mái ngọc / gạch nung đỉnh nóc (Ridge) và Phù điêu Lưỡng Long Chầu Nguyệt
    this.addRidgeAndBeasts(spec, goldB);
  }

  /**
   * Tạo các gân sống ngói âm dương 3D nổi hẳn lên trên mặt mái (Tile Ribs)
   */
  private addTileRibs(
    spec: RoofTierSpec,
    side: number,
    tileColor: THREE.Color,
  ): void {
    const isFrontBack = side === 0 || side === 1;
    const baseW = isFrontBack ? spec.A : spec.B;
    const topW = isFrontBack ? spec.Rx : spec.Rz;

    const ribW = 0.16;
    const ribH = 0.05; // Độ nổi 5cm của sống ngói
    const numRibs = Math.max(3, Math.floor((baseW * 2) / TILE_PERIOD));
    const h = new THREE.Vector3();
    const g = new THREE.Vector3();
    const _ = new THREE.Vector3();
    const v = new THREE.Vector3();
    const b = new THREE.Vector3();
    const y = new THREE.Vector3();

    for (let i = 0; i < numRibs; i++) {
      const relPos = -1 + (2 * (i + 0.5)) / numRibs; // -1 .. 1
      const distFromCenter = Math.abs(relPos) * baseW;
      if (distFromCenter > baseW * 0.95) continue; // Tránh mép góc đao

      const steps = 6;
      let prevLeft = -1,
        prevTop = -1,
        prevRight = -1;

      for (let s = 0; s <= steps; s++) {
        const r = s / steps;
        const currentW = lerp(baseW, topW, r);
        if (distFromCenter > currentW * 0.96) break;

        const n = (relPos * baseW) / currentW;
        if (Math.abs(n) > 0.97) break;

        this.evalRoofPoint(spec, side, n, r, h);
        this.evalRoofPoint(spec, side, Math.min(1, n + 0.01), r, g);
        this.evalRoofPoint(spec, side, Math.max(-1, n - 0.01), r, _);
        v.subVectors(g, _).normalize();

        this.evalRoofPoint(spec, side, n, Math.min(1, r + 0.01), g);
        this.evalRoofPoint(spec, side, n, Math.max(0, r - 0.01), _);
        b.subVectors(g, _).normalize();

        y.crossVectors(v, b).normalize();
        if (y.y < 0) y.negate();

        const col = this.computeTileColor(
          h.x,
          h.y,
          h.z,
          tileColor,
          spec.baseY,
          spec.H,
          spec.mossAmount ?? 0.85,
        );

        // 3 đỉnh tiết diện tam giác lồi của sống ngói
        const lx = h.x - v.x * (ribW * 0.5);
        const ly = h.y - v.y * (ribW * 0.5);
        const lz = h.z - v.z * (ribW * 0.5);

        const tx = h.x + y.x * ribH;
        const ty = h.y + y.y * ribH;
        const tz = h.z + y.z * ribH;

        const rx = h.x + v.x * (ribW * 0.5);
        const ry = h.y + v.y * (ribW * 0.5);
        const rz = h.z + v.z * (ribW * 0.5);

        const uVal = (h.x + h.z) / METRES_PER_TILE;
        const vVal = (r * spec.H) / METRES_PER_TILE;

        const curLeft = this.vert(lx, ly, lz, y.x, y.y, y.z, col, uVal, vVal);
        const curTop = this.vert(tx, ty, tz, y.x, y.y, y.z, col, uVal, vVal);
        const curRight = this.vert(rx, ry, rz, y.x, y.y, y.z, col, uVal, vVal);

        if (s > 0 && prevLeft !== -1) {
          // Mặt dốc trái sống ngói
          this.quad(prevLeft, prevTop, curTop, curLeft);
          // Mặt dốc phải sống ngói
          this.quad(prevTop, prevRight, curRight, curTop);
        }

        prevLeft = curLeft;
        prevTop = curTop;
        prevRight = curRight;
      }
    }
  }

  /**
   * Tạo dải ngói bò (Hip Caps) hình ống bán nguyệt chạy dọc 4 đường sống mái
   */
  private addHipCaps(spec: RoofTierSpec): void {
    const ridgeCol = new THREE.Color(0x4a3424);
    const corners: [number, number][] = [
      [1, 1],
      [-1, 1],
      [1, -1],
      [-1, -1],
    ];
    const steps = 8;
    const pt = new THREE.Vector3();

    for (const [signX, signZ] of corners) {
      let prevV0 = -1,
        prevV1 = -1,
        prevV2 = -1;

      for (let s = 0; s <= steps; s++) {
        const r = s / steps;
        // Điểm trên đường giao tuyến 45 độ giữa 2 mặt mái
        const curX = spec.cx + signX * lerp(spec.A, spec.Rx, r);
        const curZ = spec.cz + signZ * lerp(spec.B, spec.Rz, r);
        const u = Math.pow(1 - r, 2.2);
        const curl = (spec.curl ?? 0) * u;
        const flare = (spec.flare ?? 0) * u;
        const curY =
          spec.baseY + spec.H * Math.pow(r, spec.power ?? 1.7) + curl + 0.06; // Nổi trên mặt mái

        pt.set(
          curX + Math.sign(signX) * flare,
          curY,
          curZ + Math.sign(signZ) * flare,
        );

        // Bán kính dải ngói bò dày 12cm
        const capR = 0.12;
        const v0 = this.vert(
          pt.x - 0.08 * signX,
          pt.y,
          pt.z - 0.08 * signZ,
          0,
          1,
          0,
          ridgeCol,
        );
        const v1 = this.vert(pt.x, pt.y + capR, pt.z, 0, 1, 0, ridgeCol);
        const v2 = this.vert(
          pt.x + 0.08 * signZ,
          pt.y,
          pt.z - 0.08 * signX,
          0,
          1,
          0,
          ridgeCol,
        );

        if (s > 0 && prevV0 !== -1) {
          this.quad(prevV0, prevV1, v1, v0);
          this.quad(prevV1, prevV2, v2, v1);
        }

        prevV0 = v0;
        prevV1 = v1;
        prevV2 = v2;
      }
    }
  }

  /**
   * Tạo 4 đầu đao vuốt cong vút lên không trung chuẩn 100% thuật toán Chùa Sen (Ug spline & Gg horns)
   * Gắn chặt khít vào đúng 4 góc mái r = 0, tuyệt đối không bị lệch hay bay lơ lửng.
   */
  private addCornerHorns(spec: RoofTierSpec, goldB?: GeometryBuilder): void {
    const woodHornCol = new THREE.Color(0x3a2617);
    const goldCol = new THREE.Color(0xffd700);
    const ugSpline: [number, number][] = [
      [0, -0.04],
      [0.22, 0.03],
      [0.48, 0.17],
      [0.72, 0.44],
      [0.86, 0.82],
      [0.9, 1.05],
    ];
    const sInv = Math.SQRT1_2; // 1 / sqrt(2)
    const scale = clamp(0.35 + 0.12 * Math.min(spec.A, spec.B), 0.6, 1.6);
    const baseR = 0.08 + 0.06 * scale;

    const cornerConfigs: { side: number; n: number; sx: number; sz: number }[] =
      [
        { side: 0, n: 1, sx: 1, sz: 1 }, // Trước phải
        { side: 0, n: -1, sx: -1, sz: 1 }, // Trước trái
        { side: 1, n: -1, sx: 1, sz: -1 }, // Sau phải
        { side: 1, n: 1, sx: -1, sz: -1 }, // Sau trái
      ];

    const cornerPt = new THREE.Vector3();

    for (const { side, n, sx, sz } of cornerConfigs) {
      // 1. Tọa độ chính xác tại đỉnh góc mái vạt r = 0
      this.evalRoofPoint(spec, side, n, 0, cornerPt);

      // 2. Tạo đường spline uốn vút lên trời chuẩn Chùa Sen
      const splinePts: THREE.Vector3[] = ugSpline.map(([e, t]) => {
        return new THREE.Vector3(
          cornerPt.x + sx * sInv * e * scale,
          cornerPt.y + t * scale,
          cornerPt.z + sz * sInv * e * scale,
        );
      });

      // 3. Dựng thân ống đao vuốt nhọn chạy dọc spline
      let prevRing: number[] = [];
      const ringSegs = 6;
      for (let step = 0; step < splinePts.length; step++) {
        const pt = splinePts[step];
        const t = step / (splinePts.length - 1);
        const radius = baseR * lerp(1.0, 0.28, t);

        const ringVerts: number[] = [];
        for (let i = 0; i < ringSegs; i++) {
          const ang = (i / ringSegs) * Math.PI * 2;
          const rx = pt.x + Math.cos(ang) * radius;
          const rz = pt.z + Math.sin(ang) * radius;
          const ry = pt.y + Math.sin(ang) * (radius * 0.5);
          ringVerts.push(this.vert(rx, ry, rz, 0, 1, 0, woodHornCol));
        }

        if (step > 0 && prevRing.length > 0) {
          for (let i = 0; i < ringSegs; i++) {
            const nextI = (i + 1) % ringSegs;
            this.quad(
              prevRing[i],
              prevRing[nextI],
              ringVerts[nextI],
              ringVerts[i],
            );
          }
        }
        prevRing = ringVerts;
      }

      // 4. Nếu có goldB, bịt chóp đao bằng ngọn đồng dát vàng kim
      if (goldB && splinePts.length >= 2) {
        const lastPt = splinePts[splinePts.length - 1];
        const secondLastPt = splinePts[splinePts.length - 2];
        const dir = new THREE.Vector3()
          .subVectors(lastPt, secondLastPt)
          .normalize();
        const tipStart = lastPt.clone().addScaledVector(dir, -0.15 * scale);
        const tipEnd = lastPt.clone().addScaledVector(dir, 0.22 * scale);
        goldB.addLimb(tipStart, tipEnd, baseR * 0.35, 0.01, 5, goldCol);
      }
    }
  }

  /**
   * Tạo bờ nóc gạch ngọc (Ridge) và Phù điêu Lưỡng Long Chầu Nguyệt dát vàng (chuasen.com)
   * Toàn bộ phần Rồng và Mặt Nguyệt dát vàng được đưa vào goldB để hiển thị sắc vàng kim óng ả!
   */
  private addRidgeAndBeasts(spec: RoofTierSpec, goldB?: GeometryBuilder): void {
    const targetGold = goldB ?? this;
    const ridgeCol = spec.ridgeColor ?? new THREE.Color(0x4a2818);
    const goldCol = new THREE.Color(0xffe066);
    const goldDeep = new THREE.Color(0xd98218);
    const ridgeY = spec.baseY + spec.H;
    const ridgeHalfX = Math.max(spec.Rx + 0.45, 0.6);
    const ridgeHalfZ = Math.max(spec.Rz + 0.45, 0.45);

    if (spec.Rz === 0) {
      // 1. Đỉnh nóc thẳng chạy dọc trục X (nóc Chánh Điện) bằng ngói gạch sẫm màu
      this.addBox(
        spec.cx - ridgeHalfX,
        ridgeY - 0.05,
        spec.cz - 0.32,
        spec.cx + ridgeHalfX,
        ridgeY + 0.42,
        spec.cz + 0.32,
        ridgeCol,
      );

      // Kìm nóc / Thao thiết hóa rồng 2 đầu bờ nóc
      for (const sign of [-1, 1]) {
        const kx = spec.cx + sign * ridgeHalfX;
        // Thân kìm nóc
        this.addBox(
          kx - 0.22,
          ridgeY + 0.1,
          spec.cz - 0.28,
          kx + 0.22,
          ridgeY + 0.95,
          spec.cz + 0.28,
          ridgeCol,
        );
        // Đuôi kìm nóc dát vàng uốn lượn ngược lên trời
        targetGold.addBox(
          kx + sign * 0.08,
          ridgeY + 0.75,
          spec.cz - 0.18,
          kx + sign * 0.42,
          ridgeY + 1.35,
          spec.cz + 0.18,
          goldCol,
        );
      }

      // =========================================================================
      // PHÙ ĐIÊU LƯỠNG LONG CHẦU NGUYỆT DÁT VÀNG TRÊN ĐỈNH NÓC CHÁNH ĐIỆN (chuasen.com)
      // Toàn bộ chi tiết vàng này dựng vào targetGold để hiển thị vàng kim óng ả!
      // =========================================================================
      const sunCenterY = ridgeY + 1.25;

      // 1. Tòa sen chân đế & Mặt Nguyệt / Bánh xe Pháp Luân ở trung tâm (x = 0)
      targetGold.addCylinder(
        spec.cx,
        spec.cz,
        ridgeY + 0.42,
        ridgeY + 0.62,
        0.45,
        0.32,
        14,
        goldDeep,
      );
      // 8 Cánh sen dát vàng xòe quanh chân đế mặt nguyệt
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        targetGold.addPetal(
          spec.cx,
          ridgeY + 0.58,
          spec.cz,
          a,
          0.45,
          0.28,
          0.16,
          0.04,
          goldCol,
        );
      }

      // Đĩa Mặt Nguyệt tròn dát vàng trung tâm
      targetGold.addBox(
        spec.cx - 0.45,
        sunCenterY - 0.45,
        spec.cz - 0.08,
        spec.cx + 0.45,
        sunCenterY + 0.45,
        spec.cz + 0.08,
        goldCol,
      );

      // Vành tròn kim quang viền ngoài
      targetGold.addCylinder(
        spec.cx,
        spec.cz,
        sunCenterY - 0.52,
        sunCenterY + 0.52,
        0.58,
        0.58,
        18,
        goldDeep,
      );

      // 16 Tia hào quang mặt trời tỏa sáng rực rỡ xung quanh
      for (let i = 0; i < 16; i++) {
        const ang = (i / 16) * Math.PI * 2;
        const inR = 0.62;
        const outR = i % 2 === 0 ? 1.05 : 0.85;
        const p0 = new THREE.Vector3(
          spec.cx + Math.cos(ang) * inR,
          sunCenterY + Math.sin(ang) * inR,
          spec.cz,
        );
        const p1 = new THREE.Vector3(
          spec.cx + Math.cos(ang) * outR,
          sunCenterY + Math.sin(ang) * outR,
          spec.cz,
        );
        targetGold.addLimb(p0, p1, 0.048, 0.008, 4, goldCol);
      }

      // Trụ đỡ mặt nguyệt nối xuống chân đế
      targetGold.addLimb(
        new THREE.Vector3(spec.cx, ridgeY + 0.62, spec.cz),
        new THREE.Vector3(spec.cx, sunCenterY - 0.45, spec.cz),
        0.08,
        0.08,
        6,
        goldDeep,
      );

      // 2. Đôi Rồng Vàng uốn lượn đối xứng 2 bên (Two Symmetrical Golden Dragons)
      // Tọa độ các điểm uốn thân rồng (đã nâng cao hoàn toàn trên bờ nóc ridgeY + 0.42)
      const dragonCtrl: [number, number][] = [
        [1.35, 1.25], // Đầu rồng chầu sát Mặt Nguyệt
        [1.85, 1.55], // Cổ rồng vươn cao
        [2.45, 0.95], // Nhịp uốn 1 (bụng rồng lượn trên bờ nóc)
        [3.25, 1.45], // Nhịp vồng 2 (lưng rồng uốn cao)
        [4.05, 0.85], // Nhịp uốn 2 (bụng rồng nhịp 2)
        [4.65, 1.15], // Đuôi rồng bắt đầu vút lên
        [5.05, 1.65], // Đuôi rồng cuộn vút cao ở đầu hồi thành ngọn lửa vàng
      ];

      for (const sign of [-1, 1]) {
        // Dựng các đốt thân rồng nối nhau bằng addLimb
        for (let i = 0; i < dragonCtrl.length - 1; i++) {
          const [x0, y0] = dragonCtrl[i];
          const [x1, y1] = dragonCtrl[i + 1];
          const p0 = new THREE.Vector3(
            spec.cx + sign * x0,
            ridgeY + y0,
            spec.cz,
          );
          const p1 = new THREE.Vector3(
            spec.cx + sign * x1,
            ridgeY + y1,
            spec.cz,
          );

          // Bán kính thân rồng thuôn dần từ cổ (0.16m) về đuôi (0.05m)
          const r0 = lerp(0.16, 0.05, i / (dragonCtrl.length - 1));
          const r1 = lerp(0.16, 0.05, (i + 1) / (dragonCtrl.length - 1));
          targetGold.addLimb(p0, p1, r0, r1, 7, goldCol);

          // Dãy vây vi cá nhọn nhô lên dọc sống lưng rồng
          const finP = new THREE.Vector3().lerpVectors(p0, p1, 0.5);
          const finTip = finP
            .clone()
            .add(
              new THREE.Vector3(
                0,
                0.22 * (1 - (i / dragonCtrl.length) * 0.35),
                0,
              ),
            );
          targetGold.addLimb(finP, finTip, 0.045, 0.006, 4, goldDeep);
        }

        // Móng vuốt rồng (Claws) bám trên bờ nóc
        const frontClawBase = new THREE.Vector3(
          spec.cx + sign * 2.35,
          ridgeY + 0.95,
          spec.cz,
        );
        const frontClawFoot = new THREE.Vector3(
          spec.cx + sign * 2.25,
          ridgeY + 0.44,
          spec.cz + 0.12,
        );
        targetGold.addLimb(
          frontClawBase,
          frontClawFoot,
          0.06,
          0.035,
          5,
          goldDeep,
        );

        const rearClawBase = new THREE.Vector3(
          spec.cx + sign * 3.95,
          ridgeY + 0.85,
          spec.cz,
        );
        const rearClawFoot = new THREE.Vector3(
          spec.cx + sign * 3.85,
          ridgeY + 0.44,
          spec.cz + 0.12,
        );
        targetGold.addLimb(
          rearClawBase,
          rearClawFoot,
          0.055,
          0.03,
          5,
          goldDeep,
        );

        // Chi tiết Đầu Rồng (Head, Snout, Horns, Whiskers)
        const headPos = new THREE.Vector3(
          spec.cx + sign * 1.35,
          ridgeY + 1.25,
          spec.cz,
        );
        // Mõm rồng há ngậm ngọc hướng vào Mặt Nguyệt
        const snoutPos = new THREE.Vector3(
          spec.cx + sign * 0.92,
          ridgeY + 1.22,
          spec.cz,
        );
        targetGold.addLimb(headPos, snoutPos, 0.13, 0.075, 6, goldCol);

        // Viên ngọc Minh Châu ngậm ở khóe miệng
        targetGold.addCylinder(
          spec.cx + sign * 0.82,
          spec.cz,
          ridgeY + 1.15,
          ridgeY + 1.29,
          0.065,
          0.065,
          8,
          new THREE.Color(0xffffff),
        );

        // Sừng rồng (Dragon Horns) vươn cao uy nghi
        const hornTip = headPos
          .clone()
          .add(new THREE.Vector3(sign * 0.28, 0.45, 0));
        targetGold.addLimb(headPos, hornTip, 0.045, 0.008, 5, goldCol);

        // Râu rồng (Whiskers) uốn cong mềm mại bay về phía trước
        const beardTip = snoutPos
          .clone()
          .add(new THREE.Vector3(-sign * 0.24, -0.22, 0.1));
        targetGold.addLimb(snoutPos, beardTip, 0.028, 0.006, 4, goldCol);
      }
    } else {
      // Đỉnh nóc hình hộp vuông (cổ lầu / tháp chuông)
      this.addBox(
        spec.cx - ridgeHalfX,
        ridgeY - 0.05,
        spec.cz - ridgeHalfZ,
        spec.cx + ridgeHalfX,
        ridgeY + 0.32,
        spec.cz + ridgeHalfZ,
        ridgeCol,
      );
    }
  }

  /**
   * Tạo đoạn cành / rễ cong giữa 2 điểm trong không gian 3D (Limb)
   */
  addLimb(
    p0: THREE.Vector3,
    p1: THREE.Vector3,
    r0: number,
    r1: number,
    segs = 6,
    color: THREE.Color = new THREE.Color(0x5c3317),
    caps = false,
  ): void {
    const dir = new THREE.Vector3().subVectors(p1, p0);
    const len = dir.length();
    if (len < 0.0001) return;
    dir.normalize();

    const arbitrary =
      Math.abs(dir.y) < 0.95
        ? new THREE.Vector3(0, 1, 0)
        : new THREE.Vector3(1, 0, 0);
    const side = new THREE.Vector3().crossVectors(dir, arbitrary).normalize();
    const up = new THREE.Vector3().crossVectors(side, dir).normalize();

    const bottomVerts: number[] = [];
    const topVerts: number[] = [];

    for (let i = 0; i <= segs; i++) {
      const a = (i / segs) * Math.PI * 2;
      const cos = Math.cos(a);
      const sin = Math.sin(a);
      const radial = new THREE.Vector3()
        .addScaledVector(side, cos)
        .addScaledVector(up, sin);

      const v0 = new THREE.Vector3().copy(p0).addScaledVector(radial, r0);
      const v1 = new THREE.Vector3().copy(p1).addScaledVector(radial, r1);

      bottomVerts.push(
        this.vert(
          v0.x,
          v0.y,
          v0.z,
          radial.x,
          radial.y,
          radial.z,
          color,
          i / segs,
          0,
        ),
      );
      topVerts.push(
        this.vert(
          v1.x,
          v1.y,
          v1.z,
          radial.x,
          radial.y,
          radial.z,
          color,
          i / segs,
          1,
        ),
      );
    }

    for (let i = 0; i < segs; i++) {
      this.quad(
        bottomVerts[i],
        bottomVerts[i + 1],
        topVerts[i + 1],
        topVerts[i],
      );
    }

    if (caps) {
      const bc = this.vert(
        p0.x,
        p0.y,
        p0.z,
        -dir.x,
        -dir.y,
        -dir.z,
        color,
        0.5,
        0.5,
      );
      const tc = this.vert(
        p1.x,
        p1.y,
        p1.z,
        dir.x,
        dir.y,
        dir.z,
        color,
        0.5,
        0.5,
      );
      for (let i = 0; i < segs; i++) {
        this.tri(bc, bottomVerts[i + 1], bottomVerts[i]);
        this.tri(tc, topVerts[i], topVerts[i + 1]);
      }
    }
  }

  /**
   * Tạo cụm tán lá mây đa diện biến dạng (Deformed Icosphere/Canopy Cloud)
   */
  addDeformedSphere(
    center: THREE.Vector3,
    rx: number,
    ry: number,
    rz: number,
    bump: number,
    baseColor: THREE.Color,
    crownColor: THREE.Color,
    uSteps = 10,
    vSteps = 8,
  ): void {
    const grid: number[][] = [];

    for (let iv = 0; iv <= vSteps; iv++) {
      const v = iv / vSteps;
      const theta = v * Math.PI; // 0 (top) to PI (bottom)
      const sinT = Math.sin(theta);
      const cosT = Math.cos(theta);
      const row: number[] = [];

      // Color lerp từ ngọn (crown) xuống đáy (base)
      const color = new THREE.Color().copy(crownColor).lerp(baseColor, v);

      for (let iu = 0; iu <= uSteps; iu++) {
        const u = iu / uSteps;
        const phi = u * Math.PI * 2;
        const sinP = Math.sin(phi);
        const cosP = Math.cos(phi);

        const nx = sinT * cosP;
        const ny = cosT;
        const nz = sinT * sinP;

        // Biến dạng lồi lõm tự nhiên của khối tán lá
        const noiseVal =
          (noise2D(center.x + nx * 2.5, center.z + nz * 2.5) - 0.5) * bump;
        const scale = 1 + noiseVal;

        const px = center.x + nx * rx * scale;
        const py = center.y + ny * ry * scale;
        const pz = center.z + nz * rz * scale;

        const vIdx = this.vert(px, py, pz, nx, ny, nz, color, u, v);
        row.push(vIdx);
      }
      grid.push(row);
    }

    for (let iv = 0; iv < vSteps; iv++) {
      for (let iu = 0; iu < uSteps; iu++) {
        const v00 = grid[iv][iu];
        const v01 = grid[iv][iu + 1];
        const v10 = grid[iv + 1][iu];
        const v11 = grid[iv + 1][iu + 1];
        if (iv === 0) {
          this.tri(v00, v10, v11);
        } else if (iv === vSteps - 1) {
          this.tri(v00, v10, v01);
        } else {
          this.quad(v00, v10, v11, v01);
        }
      }
    }
  }

  /**
   * Tạo cánh sen nổi 3D (3D Lotus Petal) vát cong ôm theo hướng tâm
   */
  addPetal(
    baseX: number,
    baseY: number,
    baseZ: number,
    angle: number,
    tilt: number,
    length: number,
    width: number,
    thickness: number,
    color: THREE.Color,
  ): void {
    const dirX = Math.cos(angle);
    const dirZ = Math.sin(angle);
    const sideX = -Math.sin(angle);
    const sideZ = Math.cos(angle);

    const cosT = Math.cos(tilt);
    const sinT = Math.sin(tilt);

    // Điểm gốc (Base)
    const bx = baseX;
    const by = baseY;
    const bz = baseZ;

    // Điểm phình to ở giữa (Mid)
    const midLen = length * 0.55;
    const midX = bx + dirX * midLen * cosT;
    const midY = by + midLen * sinT;
    const midZ = bz + dirZ * midLen * cosT;

    const midL_x = midX + sideX * (width * 0.5);
    const midL_z = midZ + sideZ * (width * 0.5);
    const midR_x = midX - sideX * (width * 0.5);
    const midR_z = midZ - sideZ * (width * 0.5);

    // Đầu mũi cánh sen (Tip) uốn cong nhẹ
    const tipLen = length;
    const tipX = bx + dirX * tipLen * cosT * 0.95;
    const tipY = by + tipLen * (sinT + 0.12);
    const tipZ = bz + dirZ * tipLen * cosT * 0.95;

    // Mặt trên cánh sen
    const tBase = this.vert(bx, by, bz, 0, 1, 0, color, 0.5, 0);
    const tMidL = this.vert(
      midL_x,
      midY,
      midL_z,
      -sideX,
      1,
      -sideZ,
      color,
      0,
      0.5,
    );
    const tMidR = this.vert(
      midR_x,
      midY,
      midR_z,
      sideX,
      1,
      sideZ,
      color,
      1,
      0.5,
    );
    const tTip = this.vert(tipX, tipY, tipZ, dirX, 1, dirZ, color, 0.5, 1);

    this.tri(tBase, tMidL, tTip);
    this.tri(tBase, tTip, tMidR);

    // Mặt dưới cánh sen (cách một khoảng thickness)
    const bBase = this.vert(bx, by - thickness, bz, 0, -1, 0, color, 0.5, 0);
    const bMidL = this.vert(
      midL_x,
      midY - thickness,
      midL_z,
      -sideX,
      -1,
      -sideZ,
      color,
      0,
      0.5,
    );
    const bMidR = this.vert(
      midR_x,
      midY - thickness,
      midR_z,
      sideX,
      -1,
      sideZ,
      color,
      1,
      0.5,
    );
    const bTip = this.vert(
      tipX,
      tipY - thickness,
      tipZ,
      dirX,
      -1,
      dirZ,
      color,
      0.5,
      1,
    );

    this.tri(bBase, bTip, bMidL);
    this.tri(bBase, bMidR, bTip);

    // Mép cạnh cánh sen
    this.quad(tBase, tMidL, bMidL, bBase);
    this.quad(tMidL, tTip, bTip, bMidL);
    this.quad(tTip, tMidR, bMidR, bTip);
    this.quad(tMidR, tBase, bBase, bMidR);
  }

  /**
   * Tạo phiến lá Bồ Đề hình trái tim có đuôi nhọn (Bodhi Leaf Polygon)
   */
  addBodhiLeaf(
    pos: THREE.Vector3,
    normal: THREE.Vector3,
    scale: number,
    color: THREE.Color,
  ): void {
    const leafPolygon: [number, number][] = [
      [0, 0.95], // Đuôi nhọn của lá bồ đề
      [0.4, 0.25],
      [0.54, -0.15],
      [0.3, -0.45],
      [0, -0.28], // Vết khuyết cuống lá hình tim
      [-0.3, -0.45],
      [-0.54, -0.15],
      [-0.4, 0.25],
    ];

    const up =
      Math.abs(normal.y) < 0.95
        ? new THREE.Vector3(0, 1, 0)
        : new THREE.Vector3(1, 0, 0);
    const side = new THREE.Vector3().crossVectors(normal, up).normalize();
    const bitangent = new THREE.Vector3()
      .crossVectors(side, normal)
      .normalize();

    // Điểm tâm cuống lá
    const cIdx = this.vert(
      pos.x + bitangent.x * 0.05 * scale,
      pos.y + bitangent.y * 0.05 * scale,
      pos.z + bitangent.z * 0.05 * scale,
      normal.x,
      normal.y,
      normal.z,
      color,
      0.5,
      0.5,
    );

    const polyVerts: number[] = [];
    for (const [lx, ly] of leafPolygon) {
      const vx = pos.x + (side.x * lx + bitangent.x * ly) * scale;
      const vy = pos.y + (side.y * lx + bitangent.y * ly) * scale;
      const vz = pos.z + (side.z * lx + bitangent.z * ly) * scale;
      polyVerts.push(
        this.vert(vx, vy, vz, normal.x, normal.y, normal.z, color, lx, ly),
      );
    }

    // Nối tam giác cánh hoa hình tim
    for (let i = 0; i < polyVerts.length; i++) {
      const next = (i + 1) % polyVerts.length;
      this.tri(cIdx, polyVerts[i], polyVerts[next]);
    }
  }

  build(): THREE.BufferGeometry | null {
    if (this.idx.length === 0) return null;
    const geom = new THREE.BufferGeometry();
    geom.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(this.pos, 3),
    );
    geom.setAttribute("normal", new THREE.Float32BufferAttribute(this.nor, 3));
    geom.setAttribute("color", new THREE.Float32BufferAttribute(this.col, 3));
    geom.setAttribute("uv", new THREE.Float32BufferAttribute(this.uvs, 2));
    geom.setIndex(this.idx);
    return geom;
  }
}
