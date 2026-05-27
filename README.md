# LiveMap 🗺️

Real-time interactive map for live presentations. Audience members tap their location on their phones; it appears instantly on the projector screen.

## Stack

- **Server:** Node.js + Express + Socket.io
- **Frontend:** Leaflet.js (no framework, no bundler)
- **Tiles:** CartoDB Dark Matter (projector) + OpenStreetMap (mobile)

## Project Structure

```
livemap/
├── public/
│   ├── projector.html   ← Full-screen dark map for the big screen
│   └── mobile.html      ← Tap-to-pin view for audience phones
├── server.js
├── package.json
├── .gitignore
└── README.md
```

## Running Locally

```bash
# 1. Install dependencies
npm install

# 2. Start the server
npm start          # production
npm run dev        # development (nodemon auto-reload)

# 3. Open the views
# Projector → http://localhost:3000/projector.html
# Mobile    → http://localhost:3000/mobile.html
```

To test on your phone while developing, find your machine's local IP address
(`ipconfig` on Windows, `ifconfig`/`ip a` on Mac/Linux) and open:

```
http://192.168.x.x:3000/mobile.html
```

Make sure your phone and laptop are on the same Wi-Fi network.

## Deploying to Render

1. Push this repo to GitHub.
2. Go to [render.com](https://render.com) → **New → Web Service**.
3. Connect your GitHub repo.
4. Set these values:

| Field | Value |
|---|---|
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Environment** | `Node` |

5. Click **Create Web Service**. Render sets `PORT` automatically.
6. Share the public URL with your audience:
   - Projector: `https://your-app.onrender.com/projector.html`
   - Mobile:    `https://your-app.onrender.com/mobile.html`

## Deploying to Railway

1. Push this repo to GitHub.
2. Go to [railway.app](https://railway.app) → **New Project → Deploy from GitHub repo**.
3. Select the repo. Railway auto-detects Node.js and sets `PORT`.
4. Your app is live in ~60 seconds.

## Health Check

```
GET /health
→ { "status": "ok", "pins": 42 }
```

Render and Railway can use `/health` as the health-check endpoint.

## How It Works

```
Phone tap
  → socket.emit('add-pin', { lat, lng })
      → server validates & stores pin
          → io.emit('new-pin', { lat, lng })
              → projector adds glowing marker
```

Late-joining projectors receive all existing pins via the `existing-pins` event on connect.

## Customisation Tips

| What | Where |
|---|---|
| Pin colour | `.glow-pin` CSS in `projector.html` |
| Map starting position | `center` / `zoom` in both HTML files |
| Tile layer | `L.tileLayer(...)` calls |
| Allow users to move their pin | Currently supported — each tap replaces the local marker and emits a new event |
