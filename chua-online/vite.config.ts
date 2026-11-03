import { defineConfig } from "vite";
import { spawn, ChildProcess } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let wsServerProc: ChildProcess | null = null;

function autoStartWebSocketPlugin() {
  return {
    name: "auto-start-websocket",
    configureServer() {
      if (!wsServerProc) {
        const serverScript = path.resolve(__dirname, "server/dist/server.js");
        console.log(
          "\n[Chùa Sen] Đang tự động khởi động Multiplayer Server (port 8080)...",
        );
        wsServerProc = spawn("node", [serverScript], {
          stdio: "inherit",
          detached: false,
        });

        process.on("exit", () => {
          wsServerProc?.kill();
        });
      }
    },
  };
}

export default defineConfig({
  root: ".",
  publicDir: "public",
  plugins: [autoStartWebSocketPlugin()],
  server: {
    port: 3000,
    host: true,
  },
  build: {
    outDir: "dist",
    target: "es2022",
    rollupOptions: {
      output: {
        manualChunks: {
          three: ["three"],
        },
      },
    },
  },
});
