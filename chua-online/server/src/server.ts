import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";

const PORT = Number(process.env.PORT) || 8080;

interface PlayerSession {
  id: number;
  ws: WebSocket;
  roomName: string;
  x: number;
  z: number;
  facing: number;
  anim: number;
  activity: number;
  seat: number;
  name: string;
  robe: string;
  lastPacketTime: number;
  packetCount: number;
}

interface Room {
  name: string;
  label: string;
  capacity: number;
  players: Map<WebSocket, PlayerSession>;
  occupiedSeats: Map<number, number>; // seatId -> playerId
  lanterns: { id: number; x: number; z: number; createdAt: number }[];
}

let nextPlayerId = 1;
let nextLanternId = 1;

// Khởi tạo danh sách các phòng
const rooms = new Map<string, Room>();

function getOrCreateRoom(roomName: string): Room {
  let room = rooms.get(roomName);
  if (!room) {
    const label =
      roomName === "main" ? "Phòng Chánh Điện" : `Phòng Chùa Sen (${roomName})`;
    room = {
      name: roomName,
      label,
      capacity: 100,
      players: new Map(),
      occupiedSeats: new Map(),
      lanterns: [],
    };
    rooms.set(roomName, room);
  }
  return room;
}

// Mặc định tạo phòng Chánh Điện chính
getOrCreateRoom("main");

// 1. Tạo HTTP Server phục vụ Lobby API
const httpServer = createServer((req, res) => {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url || "/", `http://${req.headers.host}`);

  // Endpoint /lobby: Phục vụ chọn phòng & phân phối tải
  if (url.pathname === "/lobby") {
    let targetRoom = getOrCreateRoom("main");

    // Nếu phòng chính đầy (>90 người), tìm hoặc mở phòng mới
    if (targetRoom.players.size >= targetRoom.capacity) {
      let roomIndex = 2;
      while (true) {
        const candidate = getOrCreateRoom(`phong-${roomIndex}`);
        if (candidate.players.size < candidate.capacity) {
          targetRoom = candidate;
          break;
        }
        roomIndex++;
      }
    }

    const payload = {
      kind: "ok",
      room: targetRoom.name,
      label: `${targetRoom.label} (${targetRoom.players.size})`,
      ws: `ws://${req.headers.host || "localhost:8080"}?room=${targetRoom.name}`,
      capacity: targetRoom.capacity,
      online: targetRoom.players.size,
    };

    res.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
    res.end(JSON.stringify(payload));
    return;
  }

  // Endpoint kiểm tra sức khỏe server (Health Check)
  if (url.pathname === "/health") {
    let totalOnline = 0;
    for (const r of rooms.values()) totalOnline += r.players.size;
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({ status: "ok", totalOnline, totalRooms: rooms.size }),
    );
    return;
  }

  res.writeHead(404);
  res.end("Not Found");
});

// 2. Tạo WebSocket Server
const wss = new WebSocketServer({ server: httpServer });

wss.on("connection", (ws, req) => {
  const url = new URL(req.url || "/", "http://localhost");
  const roomName = url.searchParams.get("room") || "main";
  const room = getOrCreateRoom(roomName);

  if (room.players.size >= room.capacity) {
    ws.close(4001, "Phòng đã đủ số lượng người");
    return;
  }

  const playerId = nextPlayerId++;
  const session: PlayerSession = {
    id: playerId,
    ws,
    roomName: room.name,
    x: 0,
    z: 16,
    facing: 0,
    anim: 0,
    activity: 0,
    seat: 255,
    name: `Phật tử #${playerId}`,
    robe: "lam",
    lastPacketTime: Date.now(),
    packetCount: 0,
  };

  room.players.set(ws, session);
  console.log(
    `[Chùa Sen] ${session.name} đã vào ${room.label}. Số người: ${room.players.size}`,
  );

  ws.binaryType = "arraybuffer";

  // Gửi thông tin phòng khi vừa kết nối (Opcode 22)
  const roomInfo = JSON.stringify({
    type: "welcome",
    id: playerId,
    room: room.name,
    label: room.label,
    online: room.players.size,
  });
  ws.send(Buffer.from([22, ...Buffer.from(roomInfo, "utf8")]));

  // Xử lý gói tin nhị phân từ Client
  ws.on("message", (data: ArrayBuffer) => {
    if (!(data instanceof ArrayBuffer) && !Buffer.isBuffer(data)) return;

    // Rate Limiting: Chống spam quá 30 gói tin / giây
    const now = Date.now();
    if (now - session.lastPacketTime < 1000) {
      session.packetCount++;
      if (session.packetCount > 30) return; // Bỏ qua gói tin spam
    } else {
      session.lastPacketTime = now;
      session.packetCount = 1;
    }

    const bytes = new Uint8Array(data);
    const opcode = bytes[0];

    // Opcode 1: Di chuyển (8 bytes)
    if (opcode === 1 && bytes.length >= 8) {
      const view = new DataView(
        bytes.buffer,
        bytes.byteOffset,
        bytes.byteLength,
      );
      const rawX = view.getInt16(1, true) / 100;
      const rawZ = view.getInt16(3, true) / 100;

      // Coordinate Clamping: Giới hạn an toàn trong sân chùa
      session.x = Math.max(-34.5, Math.min(34.5, rawX));
      session.z = Math.max(-25.5, Math.min(52.5, rawZ));
      session.facing = (bytes[5] / 255) * Math.PI * 2;
      session.anim = bytes[6];
      session.seat = bytes[7];
    }
    // Opcode 2: Biểu cảm (chắp tay, niệm phật)
    else if (opcode === 2 && bytes.length >= 2) {
      const emoteId = bytes[1];
      const broadcastPkt = new Uint8Array([
        2,
        emoteId,
        (playerId >> 8) & 0xff,
        playerId & 0xff,
      ]);
      broadcastToRoom(room, broadcastPkt, ws);
    }
    // Opcode 3: Nghi thức (chuông, mõ, thắp hương)
    else if (opcode === 3 && bytes.length >= 2) {
      const ritualId = bytes[1];
      const broadcastPkt = new Uint8Array([
        19,
        ritualId,
        (playerId >> 8) & 0xff,
        playerId & 0xff,
      ]);
      broadcastToRoom(room, broadcastPkt); // Phát cho cả người gõ cùng nghe
    }
    // Opcode 5: Giữ chỗ bồ đoàn
    else if (opcode === 5 && bytes.length >= 2) {
      const seatId = bytes[1];
      if (!room.occupiedSeats.has(seatId)) {
        room.occupiedSeats.set(seatId, playerId);
        session.seat = seatId;
        session.anim = 2; // Sit
        broadcastSeatStatus(room);
      }
    }
    // Opcode 6: Rời bồ đoàn
    else if (opcode === 6) {
      if (session.seat !== 255) {
        room.occupiedSeats.delete(session.seat);
        session.seat = 255;
        session.anim = 0; // Idle
        broadcastSeatStatus(room);
      }
    }
    // Opcode 7: Thả đèn hoa đăng trên hồ sen
    else if (opcode === 7) {
      const lanternId = nextLanternId++;
      // Vị trí thả ở đầu cầu kiều trên mặt nước hồ sen
      const lx = (Math.random() - 0.5) * 6;
      const lz = 32 + Math.random() * 8;
      room.lanterns.push({
        id: lanternId,
        x: lx,
        z: lz,
        createdAt: Date.now(),
      });

      const lanternPkt = new Uint8Array(9);
      const lView = new DataView(lanternPkt.buffer);
      lanternPkt[0] = 20; // Opcode 20: Server Lantern Broadcast
      lView.setUint16(1, lanternId, true);
      lView.setInt16(3, Math.round(lx * 100), true);
      lView.setInt16(5, Math.round(lz * 100), true);
      lView.setUint16(7, 0, true);
      broadcastToRoom(room, lanternPkt);
    }
  });

  ws.on("close", () => {
    if (session.seat !== 255) {
      room.occupiedSeats.delete(session.seat);
      broadcastSeatStatus(room);
    }
    room.players.delete(ws);
    console.log(
      `[Chùa Sen] ${session.name} đã rời chùa. Còn lại: ${room.players.size}`,
    );
  });

  ws.on("error", () => {
    ws.close();
  });
});

function broadcastToRoom(
  room: Room,
  data: Uint8Array,
  excludeWs?: WebSocket,
): void {
  for (const [ws] of room.players) {
    if (ws !== excludeWs && ws.readyState === WebSocket.OPEN) {
      ws.send(data);
    }
  }
}

function broadcastSeatStatus(room: Room): void {
  const seats = Array.from(room.occupiedSeats.entries());
  const pkt = new Uint8Array(2 + seats.length * 3);
  const view = new DataView(pkt.buffer);
  pkt[0] = 21; // Opcode 21: Server Seat Update
  pkt[1] = seats.length;

  seats.forEach(([seatId, pId], i) => {
    pkt[2 + i * 3] = seatId;
    view.setUint16(3 + i * 3, pId, true);
  });

  broadcastToRoom(room, pkt);
}

// 3. Vòng lặp Broadcast Batch Snapshot (15 lần / giây - mỗi 66ms)
setInterval(() => {
  for (const room of rooms.values()) {
    if (room.players.size === 0) continue;

    const count = Math.min(room.players.size, 100);
    const stride = 10;
    const buffer = new Uint8Array(2 + count * stride);
    const view = new DataView(buffer.buffer);

    buffer[0] = 16; // Opcode 16: Server Batch Snapshot
    buffer[1] = count;

    let i = 0;
    for (const session of room.players.values()) {
      if (i >= count) break;
      const offset = 2 + i * stride;
      view.setUint16(offset, session.id, true);
      view.setInt16(offset + 2, Math.round(session.x * 100), true);
      view.setInt16(offset + 4, Math.round(session.z * 100), true);
      buffer[offset + 6] =
        Math.round(
          ((((session.facing % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)) /
            (Math.PI * 2)) *
            255,
        ) & 0xff;
      buffer[offset + 7] = session.anim;
      buffer[offset + 8] = session.activity;
      buffer[offset + 9] = session.seat;
      i++;
    }

    broadcastToRoom(room, buffer);
  }
}, 66);

// Khởi chạy HTTP & WebSocket Server
httpServer.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`[Chùa Sen Multiplayer Server] Đang lắng nghe tại cổng ${PORT}`);
  console.log(`Lobby API:  http://localhost:${PORT}/lobby`);
  console.log(`Health:     http://localhost:${PORT}/health`);
  console.log(`WebSocket:  ws://localhost:${PORT}`);
  console.log(`=======================================================`);
});
