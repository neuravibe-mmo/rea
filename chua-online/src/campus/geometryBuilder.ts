import * as THREE from "three";

/**
 * Procedural Geometry Builder cho kiến trúc chùa 3D.
 * Tự động tính toán toạ độ đỉnh (vertex), pháp tuyến (normals) và màu sắc đỉnh (vertex colors),
 * tạo ra BufferGeometry với hiệu năng tối đa mà không cần file 3D bên ngoài.
 */
export class GeometryBuilder {
  private pos: number[] = [];
  private nor: number[] = [];
  private col: number[] = [];
  private idx: number[] = [];

  vert(
    x: number,
    y: number,
    z: number,
    nx: number,
    ny: number,
    nz: number,
    color: THREE.Color,
  ): number {
    this.pos.push(x, y, z);
    this.nor.push(nx, ny, nz);
    this.col.push(color.r, color.g, color.b);
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
      this.vert(x0, y1, z0, 0, 1, 0, color),
      this.vert(x1, y1, z0, 0, 1, 0, color),
      this.vert(x1, y1, z1, 0, 1, 0, color),
      this.vert(x0, y1, z1, 0, 1, 0, color),
    );
    // Bottom (-Y)
    this.quad(
      this.vert(x0, y0, z1, 0, -1, 0, color),
      this.vert(x1, y0, z1, 0, -1, 0, color),
      this.vert(x1, y0, z0, 0, -1, 0, color),
      this.vert(x0, y0, z0, 0, -1, 0, color),
    );
    // Front (+Z)
    this.quad(
      this.vert(x0, y0, z1, 0, 0, 1, color),
      this.vert(x1, y0, z1, 0, 0, 1, color),
      this.vert(x1, y1, z1, 0, 0, 1, color),
      this.vert(x0, y1, z1, 0, 0, 1, color),
    );
    // Back (-Z)
    this.quad(
      this.vert(x1, y0, z0, 0, 0, -1, color),
      this.vert(x0, y0, z0, 0, 0, -1, color),
      this.vert(x0, y1, z0, 0, 0, -1, color),
      this.vert(x1, y1, z0, 0, 0, -1, color),
    );
    // Left (-X)
    this.quad(
      this.vert(x0, y0, z0, -1, 0, 0, color),
      this.vert(x0, y0, z1, -1, 0, 0, color),
      this.vert(x0, y1, z1, -1, 0, 0, color),
      this.vert(x0, y1, z0, -1, 0, 0, color),
    );
    // Right (+X)
    this.quad(
      this.vert(x1, y0, z1, 1, 0, 0, color),
      this.vert(x1, y0, z0, 1, 0, 0, color),
      this.vert(x1, y1, z0, 1, 0, 0, color),
      this.vert(x1, y1, z1, 1, 0, 0, color),
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

      const vx0 = cx + cos * r0;
      const vz0 = cz + sin * r0;
      const vx1 = cx + cos * r1;
      const vz1 = cz + sin * r1;

      bottomVerts.push(this.vert(vx0, y0, vz0, cos, 0, sin, color));
      topVerts.push(this.vert(vx1, y1, vz1, cos, 0, sin, color));
    }

    // Mặt bên
    for (let i = 0; i < segs; i++) {
      this.quad(
        bottomVerts[i],
        bottomVerts[i + 1],
        topVerts[i + 1],
        topVerts[i],
      );
    }

    // Đáy và nắp
    if (caps) {
      const bottomCenter = this.vert(cx, y0, cz, 0, -1, 0, color);
      const topCenter = this.vert(cx, y1, cz, 0, 1, 0, color);
      for (let i = 0; i < segs; i++) {
        this.tri(bottomCenter, bottomVerts[i + 1], bottomVerts[i]);
        this.tri(topCenter, topVerts[i], topVerts[i + 1]);
      }
    }
  }

  /**
   * Tạo mái ngói cong truyền thống Á Đông với 4 đầu đao cong vút lên
   */
  addCurvedRoof(
    cx: number,
    cy: number,
    cz: number,
    w: number,
    d: number,
    h: number,
    overhang: number,
    steps: number,
    color: THREE.Color,
  ): void {
    const halfW = (w + overhang * 2) * 0.5;
    const halfD = (d + overhang * 2) * 0.5;

    for (let ix = 0; ix < steps; ix++) {
      for (let iz = 0; iz < steps; iz++) {
        const u0 = (ix / steps) * 2 - 1;
        const u1 = ((ix + 1) / steps) * 2 - 1;
        const v0 = (iz / steps) * 2 - 1;
        const v1 = ((iz + 1) / steps) * 2 - 1;

        const x0 = cx + u0 * halfW;
        const x1 = cx + u1 * halfW;
        const z0 = cz + v0 * halfD;
        const z1 = cz + v1 * halfD;

        // Công thức cong mái: đỉnh mái cao nhất ở sống nóc, 4 góc đao vuốt cong lên cao
        const getRoofHeight = (u: number, v: number): number => {
          const distToEdge = Math.max(Math.abs(u), Math.abs(v));
          const ridgeHeight = cy + h * (1 - distToEdge);
          // Nâng 4 góc đao cong lên
          const cornerUplift = Math.pow(u * u * v * v, 1.2) * (h * 0.65);
          return ridgeHeight + cornerUplift;
        };

        const y00 = getRoofHeight(u0, v0);
        const y10 = getRoofHeight(u1, v0);
        const y11 = getRoofHeight(u1, v1);
        const y01 = getRoofHeight(u0, v1);

        const v_00 = this.vert(x0, y00, z0, 0, 1, 0, color);
        const v_10 = this.vert(x1, y10, z0, 0, 1, 0, color);
        const v_11 = this.vert(x1, y11, z1, 0, 1, 0, color);
        const v_01 = this.vert(x0, y01, z1, 0, 1, 0, color);

        this.quad(v_00, v_10, v_11, v_01);
      }
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
    geom.setIndex(this.idx);
    return geom;
  }
}
