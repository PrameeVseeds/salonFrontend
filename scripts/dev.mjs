import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import net from "node:net";
import path from "node:path";

const projectDirectory = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const backendDirectory = path.resolve(projectDirectory, "../salonBackend");
const npmCli = process.env.npm_execpath;

if (!npmCli) throw new Error("This development launcher must be started with npm run dev.");

const isPortOpen = (port) => new Promise((resolve) => {
  const socket = net.createConnection({ host: "127.0.0.1", port });
  socket.setTimeout(500);
  socket.once("connect", () => {
    socket.destroy();
    resolve(true);
  });
  socket.once("error", () => resolve(false));
  socket.once("timeout", () => {
    socket.destroy();
    resolve(false);
  });
});

const runNpmScript = (script, cwd) => spawn(process.execPath, [npmCli, "run", script], {
  cwd,
  stdio: "inherit",
});

const backendAlreadyRunning = await isPortOpen(5000);
const backend = backendAlreadyRunning ? null : runNpmScript("dev", backendDirectory);
if (backendAlreadyRunning) console.log("Backend already running on port 5000.");
const frontend = runNpmScript("dev:frontend", projectDirectory);

let stopping = false;
const stop = (exitCode = 0) => {
  if (stopping) return;
  stopping = true;
  if (backend && !backend.killed) backend.kill();
  if (!frontend.killed) frontend.kill();
  process.exitCode = exitCode;
};

backend?.on("error", (error) => {
  console.error("Unable to start the backend:", error.message);
  stop(1);
});
frontend.on("error", (error) => {
  console.error("Unable to start the frontend:", error.message);
  stop(1);
});
backend?.on("exit", (code) => stop(code ?? 1));
frontend.on("exit", (code) => stop(code ?? 0));
process.on("SIGINT", () => stop());
process.on("SIGTERM", () => stop());
