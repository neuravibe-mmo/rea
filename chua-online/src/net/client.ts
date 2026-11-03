import { BinaryProtocol, OPCODES, RemotePlayerState } from "./protocol.ts";

export type OnPlayersUpdate = (players: RemotePlayerState[]) => void;
export type OnRitualReceived = (ritualId: number, senderId: number) => void;
export type OnLanternReceived = (lantern: {
  id: number;
  x: number;
  z: number;
}) => void;
export type OnRoomInfoUpdate = (info: {
  room: string;
  label: string;
  online: number;
}) => void;
export type OnConnectionChange = (connected: boolean) => void;

export class NetworkClient {
  private ws: WebSocket | null = null;
  public isConnected = false;
  public myPlayerId: number | null = null;
  public currentRoomLabel = "Phòng Chánh Điện";
  private serverUrl: string;

  public onPlayersUpdate: OnPlayersUpdate | null = null;
  public onRitualReceived: OnRitualReceived | null = null;
  public onLanternReceived: OnLanternReceived | null = null;
  public onRoomInfoUpdate: OnRoomInfoUpdate | null = null;
  public onConnectionChange: OnConnectionChange | null = null;

  constructor(serverUrl?: string) {
    // Tự động nhận diện host hiện tại (hỗ trợ cả localhost và truy cập qua mạng LAN điện thoại)
    const host = window.location.hostname || "localhost";
    const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
    this.serverUrl = serverUrl || `${proto}//${host}:8080`;
  }

  /**
   * Kết nối đến Sảnh Chùa Sen (Lobby & WebSocket)
   */
  public async connect(): Promise<void> {
    try {
      // 1. Thử gọi HTTP Lobby API để lấy phòng khả dụng
      const httpHost = this.serverUrl
        .replace(/^ws:\/\//, "http://")
        .replace(/^wss:\/\//, "https://");
      try {
        const res = await fetch(`${httpHost}/lobby`, { cache: "no-store" });
        if (res.ok) {
          const lobbyData = await res.json();
          if (lobbyData.ws) {
            this.serverUrl = lobbyData.ws;
            this.currentRoomLabel = lobbyData.label;
            this.onRoomInfoUpdate?.({
              room: lobbyData.room,
              label: lobbyData.label,
              online: lobbyData.online,
            });
          }
        }
      } catch {
        // Fallback kết nối trực tiếp WebSocket
      }

      // 2. Mở kết nối WebSocket Nhị phân
      this.ws = new WebSocket(this.serverUrl);
      this.ws.binaryType = "arraybuffer";

      this.ws.onopen = () => {
        this.isConnected = true;
        this.onConnectionChange?.(true);
        console.log("[Net] Đã kết nối sảnh Chùa Sen Online:", this.serverUrl);
      };

      this.ws.onmessage = (event) => {
        if (!(event.data instanceof ArrayBuffer)) return;
        const view = new DataView(event.data);
        const bytes = new Uint8Array(event.data);
        const opcode = bytes[0];

        // Opcode 16: Batch Snapshot người chơi khác
        if (opcode === OPCODES.SERVER_BATCH_SNAPSHOT) {
          const allPlayers = BinaryProtocol.unpackBatchSnapshot(event.data);
          // Lọc bỏ chính mình để không tạo nhân vật trùng lặp lên người mình
          const otherPlayers = this.myPlayerId
            ? allPlayers.filter((p) => p.id !== this.myPlayerId)
            : allPlayers;
          this.onPlayersUpdate?.(otherPlayers);
        }
        // Opcode 19: Nghi thức phát sóng (Chuông, Mõ, Hương)
        else if (
          opcode === OPCODES.SERVER_RITUAL_BROADCAST &&
          bytes.length >= 2
        ) {
          const ritualId = bytes[1];
          const senderId = bytes.length >= 4 ? view.getUint16(2, false) : 0;
          this.onRitualReceived?.(ritualId, senderId);
        }
        // Opcode 20: Thả hoa đăng phát sóng
        else if (
          opcode === OPCODES.SERVER_LANTERN_BROADCAST &&
          bytes.length >= 7
        ) {
          const id = view.getUint16(1, true);
          const x = view.getInt16(3, true) / 100;
          const z = view.getInt16(5, true) / 100;
          this.onLanternReceived?.({ id, x, z });
        }
        // Opcode 22: Thông tin phòng & ID chính mình (Welcome Handshake)
        else if (opcode === OPCODES.SERVER_ROOM_INFO) {
          try {
            const jsonStr = new TextDecoder().decode(bytes.slice(1));
            const info = JSON.parse(jsonStr);
            this.myPlayerId = info.id;
            this.currentRoomLabel = info.label;
            console.log(
              `[Net] Chào mừng Phật tử #${this.myPlayerId} vào ${info.label}`,
            );
            this.onRoomInfoUpdate?.({
              room: info.room,
              label: `${info.label} (${info.online})`,
              online: info.online,
            });
          } catch {
            // Không parse được
          }
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.onConnectionChange?.(false);
        console.warn(
          "[Net] Mất kết nối WebSocket, đang thử kết nối lại sau 3.5s...",
        );
        setTimeout(() => this.connect(), 3500);
      };

      this.ws.onerror = () => {
        this.ws?.close();
      };
    } catch {
      this.isConnected = false;
      this.onConnectionChange?.(false);
      console.warn("[Net] Không thể mở kết nối WebSocket (chế độ offline)");
    }
  }

  public sendMovement(
    x: number,
    z: number,
    facing: number,
    anim: number,
    seat: number,
  ): void {
    if (!this.isConnected || !this.ws || this.ws.readyState !== WebSocket.OPEN)
      return;
    const packet = BinaryProtocol.packMove(x, z, facing, anim, seat);
    this.ws.send(packet);
  }

  public sendRitual(ritualId: number): void {
    if (!this.isConnected || !this.ws || this.ws.readyState !== WebSocket.OPEN)
      return;
    const packet = BinaryProtocol.packRitual(ritualId);
    this.ws.send(packet);
  }

  public sendEmote(emoteId: number): void {
    if (!this.isConnected || !this.ws || this.ws.readyState !== WebSocket.OPEN)
      return;
    const packet = BinaryProtocol.packEmote(emoteId);
    this.ws.send(packet);
  }

  public claimSeat(seatId: number): void {
    if (!this.isConnected || !this.ws || this.ws.readyState !== WebSocket.OPEN)
      return;
    const packet = BinaryProtocol.packClaimSeat(seatId);
    this.ws.send(packet);
  }

  public releaseSeat(): void {
    if (!this.isConnected || !this.ws || this.ws.readyState !== WebSocket.OPEN)
      return;
    const packet = BinaryProtocol.packReleaseSeat();
    this.ws.send(packet);
  }

  public sendLantern(): void {
    if (!this.isConnected || !this.ws || this.ws.readyState !== WebSocket.OPEN)
      return;
    const packet = BinaryProtocol.packSendLantern();
    this.ws.send(packet);
  }
}
