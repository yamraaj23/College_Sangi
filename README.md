Campus Connect — Local server mode

This repo contains a single-file frontend (`index.html`) and a minimal Express server `server.js` that provides simple file-based storage for development.

Setup

1. Install dependencies:

```bash
npm install
```

2. Start the server (serves `index.html` and exposes API):

```bash
npm start
```

3. Open http://localhost:3000 in your browser.

Notes

- Data is stored in `server_data/` as JSON files.
- This is a minimal development server. For production, replace with a proper database and authentication.

LAN Access

- The server binds to all interfaces so other devices on your local network can reach it. After starting the server you'll see lines like:

```
Accessible: http://192.168.1.42:3000
```

- To open the site from another device on the same LAN, use the printed IP and port (for example `http://192.168.1.42:3000`).
- On Windows, you may need to allow `node.exe` through the firewall or open port `3000` in Windows Firewall.
- For best results, ensure both devices are on the same Wi‑Fi or LAN subnet.
 
Encrypted local store

- The server now uses an AES-256-GCM encrypted JSON store (`campus_hub.enc`).
- Provide a secret via the `DB_KEY` environment variable before starting the server. Example:

```bash
export DB_KEY="your_strong_secret_here"
npm start
```

On Windows PowerShell:

```powershell
$env:DB_KEY = "your_strong_secret_here"
npm start
```

- `campus_hub.enc` is ignored by git (see `.gitignore`). Keep your `DB_KEY` secret — do not commit it or store it in source control.
