/**
 * Giao thức Nhị phân (Binary Protocol) cho Chùa Sen Online.
 * Được thiết kế theo chuẩn DataView nhị phân nhằm tối ưu hóa 85% băng thông,
 * cho phép một máy chủ nhỏ chịu tải hàng ngàn kết nối đồng thời.
 */

export const OPCODES = {
  // Client -> Server
  CLIENT_MOVE: 1,
  CLIENT_EMOTE: 2,
  CLIENT_RITUAL: 3,
  CLIENT_ACTIVITY: 4,
  CLIENT_CLAIM_SEAT: 5,
  CLIENT_RELEASE_SEAT: 6,
  CLIENT_LANTERN: 7,
  CLIENT_PROFILE: 8,

  // Server -> Client
  SERVER_BATCH_SNAPSHOT: 16,
  SERVER_PLAYER_JOIN: 17,
  SERVER_PLAYER_LEAVE: 18,
  SERVER_RITUAL_BROADCAST: 19,
  SERVER_LANTERN_BROADCAST: 20,
  SERVER_SEAT_UPDATE: 21,
  SERVER_ROOM_INFO: 22,
} as const;

export const ANIM_TYPES = {
  IDLE: 0,
  WALK: 1,
  SIT: 2,
  BOW: 3,
} as const;

export const RITUAL_TYPES = {
  BELL: 1, // Đánh chuông
  CHANT: 2, // Gõ mõ tụng kinh
  INCENSE: 3, // Thắp hương
  FLOWERS: 4, // Dâng hoa
  CANDLE: 5, // Đốt nến
} as const;

export const EMOTE_TYPES = {
  CHAP_TAY: 1,
  A_DI_DA_PHAT: 2,
  TUY_HY: 3,
  CHUC_BINH_AN: 4,
} as const;

export interface PlayerProfile {
  name: string;
  gender: "nam" | "nu";
  robe: "lam" | "nau" | "xam" | "vang";
}

export interface RemotePlayerState {
  id: number;
  x: number;
  z: number;
  facing: number;
  anim: number;
  activity: number;
  seat: number;
  profile?: PlayerProfile;
}

export interface LanternItem {
  id: number;
  x: number;
  z: number;
  ageSec: number;
}

export class BinaryProtocol {
  /**
   * Đóng gói tọa độ & trạng thái di chuyển của người chơi (8 bytes)
   */
  static packMove(
    x: number,
    z: number,
    facing: number,
    anim: number,
    seat: number,
  ): Uint8Array {
    const buffer = new Uint8Array(8);
    const view = new DataView(buffer.buffer);

    buffer[0] = OPCODES.CLIENT_MOVE;
    // Tọa độ X, Z nhân 100 để lưu dưới dạng Int16 với độ chính xác đến từng centimet
    view.setInt16(1, Math.round(x * 100), true);
    view.setInt16(3, Math.round(z * 100), true);
    // Góc quay facing (0..2π) ánh xạ vào 1 byte Uint8 (0..255)
    buffer[5] =
      Math.round(
        ((((facing % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) /
          (Math.PI * 2)) *
          255,
      ) & 0xff;
    buffer[6] = anim & 0xff;
    buffer[7] = seat & 0xff;

    return buffer;
  }

  /**
   * Đóng gói hành động nghi lễ (chuông, mõ, hương, nến) (2 bytes)
   */
  static packRitual(ritualId: number): Uint8Array {
    return new Uint8Array([OPCODES.CLIENT_RITUAL, ritualId & 0xff]);
  }

  /**
   * Đóng gói biểu cảm (chắp tay, niệm phật, chúc bình an) (2 bytes)
   */
  static packEmote(emoteId: number): Uint8Array {
    return new Uint8Array([OPCODES.CLIENT_EMOTE, emoteId & 0xff]);
  }

  /**
   * Đóng gói giữ chỗ bồ đoàn (2 bytes)
   */
  static packClaimSeat(seatId: number): Uint8Array {
    return new Uint8Array([OPCODES.CLIENT_CLAIM_SEAT, seatId & 0xff]);
  }

  /**
   * Đóng gói rời chỗ bồ đoàn (1 byte)
   */
  static packReleaseSeat(): Uint8Array {
    return new Uint8Array([OPCODES.CLIENT_RELEASE_SEAT]);
  }

  /**
   * Đóng gói thả đèn hoa đăng (1 byte)
   */
  static packSendLantern(): Uint8Array {
    return new Uint8Array([OPCODES.CLIENT_LANTERN]);
  }

  /**
   * Giải mã Batch Snapshot người chơi từ máy chủ
   */
  static unpackBatchSnapshot(data: ArrayBuffer): RemotePlayerState[] {
    const view = new DataView(data);
    const count = view.getUint8(1);
    const players: RemotePlayerState[] = [];
    const stride = 10; // id(2), x(2), z(2), facing(1), anim(1), act(1), seat(1)

    for (let i = 0; i < count; i++) {
      const offset = 2 + i * stride;
      if (offset + stride > data.byteLength) break;

      const id = view.getUint16(offset, true);
      const x = view.getInt16(offset + 2, true) / 100;
      const z = view.getInt16(offset + 4, true) / 100;
      const facing = (view.getUint8(offset + 6) / 255) * Math.PI * 2;
      const anim = view.getUint8(offset + 7);
      const activity = view.getUint8(offset + 8);
      const seat = view.getUint8(offset + 9);

      players.push({ id, x, z, facing, anim, activity, seat });
    }

    return players;
  }
}
