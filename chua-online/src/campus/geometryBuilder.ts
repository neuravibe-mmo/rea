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

const MOSS_GREEN = new THREE.Color(0x5d6b48); // Màu rêu ẩm cổ phong Chùa Sen

/**
 * Procedural Geometry Builder cho kiến trúc chùa 3D.
 * Tự động tính toán toạ độ đỉnh (vertex), pháp tuyến (normals), UV mapping ngói và rêu phong,
 * tạo ra BufferGeometry với hiệu năng tối đa mà không cần file 3D bên ngoài.
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
  private evalRoofPoint(
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
    // Độ cong ở 4 góc đao
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
   * Tính màu ngói rêu phong loang lổ theo thuật toán Chùa Sen (Pg shader)
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
   * Dựng mái chùa cong cổ truyền Á Đông 4 hướng theo đúng giải thuật procedural của Chùa Sen:
   * 4 mặt mái cong uốn lượn, 4 đầu đao cong vút lên trời, diềm mái gỗ và bờ nóc uy nghiêm.
   */
  addCurvedRoofTier(
    spec: RoofTierSpec,
    stepsAlongSide = 10,
    stepsUpSlope = 8,
  ): void {
    const tileColor = spec.tileColor ?? new THREE.Color(0x6a5a45);
    const thickness = spec.thickness ?? 0.22;
    const tg = 0.72; // Chu kỳ rãnh ngói chuẩn Chùa Sen
    const pt = new THREE.Vector3();

    // 4 mặt mái: 0: trước, 1: sau, 2: phải, 3: trái
    for (let side = 0; side < 4; side++) {
      const isFrontBack = side === 0 || side === 1;
      const slopeLen = Math.hypot(
        isFrontBack ? spec.B - spec.Rz : spec.A - spec.Rx,
        spec.H,
      );

      const grid: number[][] = [];

      for (let ir = 0; ir <= stepsUpSlope; ir++) {
        const r = ir / stepsUpSlope;
        const row: number[] = [];

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

          const sideWidth = isFrontBack
            ? n * lerp(spec.A, spec.Rx, r)
            : n * lerp(spec.B, spec.Rz, r);
          const u = sideWidth / tg;
          const v = (r * slopeLen) / tg;

          // Pháp tuyến ước lượng hướng lên và chếch ra ngoài
          const nx = (pt.x - spec.cx) * 0.05;
          const nz = (pt.z - spec.cz) * 0.05;
          const vIdx = this.vert(pt.x, pt.y, pt.z, nx, 1, nz, col, u, v);
          row.push(vIdx);
        }
        grid.push(row);
      }

      // Nối các ô vuông lưới thành 2 tam giác
      for (let ir = 0; ir < stepsUpSlope; ir++) {
        for (let in_ = 0; in_ < stepsAlongSide; in_++) {
          const v00 = grid[ir][in_];
          const v01 = grid[ir][in_ + 1];
          const v10 = grid[ir + 1][in_];
          const v11 = grid[ir + 1][in_ + 1];
          this.quad(v00, v01, v11, v10);
        }
      }

      // Diềm mái (fascia) ở mép dưới vạt mái (r = 0)
      const fasciaCol = new THREE.Color(0x3d220f);
      for (let in_ = 0; in_ < stepsAlongSide; in_++) {
        const top0 = grid[0][in_];
        const top1 = grid[0][in_ + 1];

        const x0 = this.pos[top0 * 3];
        const y0 = this.pos[top0 * 3 + 1];
        const z0 = this.pos[top0 * 3 + 2];

        const x1 = this.pos[top1 * 3];
        const y1 = this.pos[top1 * 3 + 1];
        const z1 = this.pos[top1 * 3 + 2];

        const b0 = this.vert(x0, y0 - thickness, z0, 0, -1, 0, fasciaCol, 0, 0);
        const b1 = this.vert(x1, y1 - thickness, z1, 0, -1, 0, fasciaCol, 1, 0);

        this.quad(top0, top1, b1, b0);
      }
    }

    // Bờ nóc mái ngọc / gạch nung đỉnh nóc (Ridge)
    const ridgeCol = spec.ridgeColor ?? new THREE.Color(0x5a2d1d);
    const ridgeY = spec.baseY + spec.H;
    const ridgeHalfX = Math.max(spec.Rx + 0.45, 0.6);
    const ridgeHalfZ = Math.max(spec.Rz + 0.45, 0.45);

    if (spec.Rz === 0) {
      // Đỉnh nóc thẳng chạy dọc trục X
      this.addBox(
        spec.cx - ridgeHalfX,
        ridgeY - 0.05,
        spec.cz - 0.28,
        spec.cx + ridgeHalfX,
        ridgeY + 0.35,
        spec.cz + 0.28,
        ridgeCol,
      );
      // Kìm nóc / Thao thiết hóa rồng 2 đầu bờ nóc
      const goldCol = new THREE.Color(0xd4af37);
      this.addBox(
        spec.cx - ridgeHalfX - 0.25,
        ridgeY,
        spec.cz - 0.35,
        spec.cx - ridgeHalfX + 0.1,
        ridgeY + 0.65,
        spec.cz + 0.35,
        goldCol,
      );
      this.addBox(
        spec.cx + ridgeHalfX - 0.1,
        ridgeY,
        spec.cz - 0.35,
        spec.cx + ridgeHalfX + 0.25,
        ridgeY + 0.65,
        spec.cz + 0.35,
        goldCol,
      );
    } else {
      // Đỉnh nóc hình hộp vuông (cổ lầu / tháp chuông)
      this.addBox(
        spec.cx - ridgeHalfX,
        ridgeY - 0.05,
        spec.cz - ridgeHalfZ,
        spec.cx + ridgeHalfX,
        ridgeY + 0.3,
        spec.cz + ridgeHalfZ,
        ridgeCol,
      );
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
