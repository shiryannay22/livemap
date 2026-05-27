import { createServer } from "http";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import express from "express";
import { Server } from "socket.io";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Serve static files from the public directory
app.use(express.static(join(__dirname, "public")));

// Keep an in-memory list of pins so late-joining projectors get existing pins
const pins = [];

io.on("connection", (socket) => {
  console.log(`[+] Client connected   id=${socket.id}`);

  // Send all existing pins to the newly connected client
  if (pins.length > 0) {
    socket.emit("existing-pins", pins);
  }

  socket.on("add-pin", (data) => {
    const { lat, lng } = data ?? {};

    // Basic validation — reject obviously bad coordinates
    if (
      typeof lat !== "number" ||
      typeof lng !== "number" ||
      lat < -90 || lat > 90 ||
      lng < -180 || lng > 180
    ) {
      console.warn(`[!] Invalid pin rejected from ${socket.id}:`, data);
      return;
    }

    const pin = { lat, lng, ts: Date.now(), id: socket.id };

    // Replace existing pin from same user, or add new
    const existing = pins.findIndex(p => p.id === socket.id);
    if (existing !== -1) pins[existing] = pin;
    else pins.push(pin);

    console.log(`[pin] lat=${lat.toFixed(4)} lng=${lng.toFixed(4)}  total=${pins.length}`);

    // Broadcast to every connected client (including sender)
    io.emit("new-pin", pin);
  });

  socket.on("disconnect", () => {
    console.log(`[-] Client disconnected id=${socket.id}`);
  });
});

// Health-check endpoint for Render / Railway
app.get("/health", (_req, res) => res.json({ status: "ok", pins: pins.length }));

const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
  console.log(`
  ┌─────────────────────────────────────────┐
  │  LiveMap server running                 │
  │  Local:   http://localhost:${PORT}          │
  │                                         │
  │  Projector → /projector.html            │
  │  Mobile   → /mobile.html               │
  └─────────────────────────────────────────┘
  `);
});
