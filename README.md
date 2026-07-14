# Tree guide for AKU-ACER

A shared plant/tree catalog dashboard with a small Node.js server that stores
data in a JSON file, so everyone using the site sees the same data.

## Run it on your computer

You need [Node.js](https://nodejs.org) installed (download the "LTS" version
if you don't have it — the installer also adds the `node` and `npm` commands
to your command prompt).

1. Open your command prompt / terminal.
2. Navigate into this folder, e.g.:
   ```
   cd path\to\tree-guide-dashboard
   ```
3. Install the one dependency:
   ```
   npm install
   ```
4. Start the server:
   ```
   npm start
   ```
5. Open your browser to **http://localhost:3000** — you'll see the dashboard.

While this is running, anyone on the same Wi-Fi network can also reach it
using your computer's local IP address instead of `localhost` (e.g.
`http://192.168.1.23:3000`) — find your IP with `ipconfig` (Windows) or
`ifconfig` / `ipconfig getifaddr en0` (Mac).

## Make it a public website (free)

Running it on your own computer only works while your computer is on and
connected. To get a real public link that works for anyone, anytime, deploy
this same folder to a free hosting service such as:

- **[Render](https://render.com)** — free tier, connects to a GitHub repo,
  runs `npm install` then `npm start` automatically.
- **[Railway](https://railway.app)** — similar free-tier flow.
- **[Replit](https://replit.com)** — import the folder, click Run, and it
  gives you a public URL immediately (good for quick sharing/testing).

Each of these needs a free account, but no payment — you just upload/connect
this project folder, and it runs the same `npm start` command for you and
gives you a public URL to share.

## How data works

- All plant data lives in `data/plants.json` on the server.
- The file is created automatically from `data/seed.json` the first time you
  run the server.
- "Reset to default catalog" restores the original sample plants at any time.
- There's no login — anyone with the link can add, edit, or delete entries,
  so only share the link with people you trust to edit responsibly.
