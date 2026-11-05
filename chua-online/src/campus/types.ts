export interface CampusCollider {
  minX?: number;
  maxX?: number;
  minZ?: number;
  maxZ?: number;
  cx?: number;
  cz?: number;
  radius?: number;
}

export interface CushionSeat {
  id: number;
  x: number;
  z: number;
  occupied: boolean;
}

