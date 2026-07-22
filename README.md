ArcadeEmu — a browser-based arcade/console emulator front-end using EmulatorJS.

What it is: React + TypeScript UI with a vendored EmulatorJS runtime. Drag ROMs, maintain a local IndexedDB library, and navigate with a gamepad in Couch Mode. Desktop app via Tauri.

Getting started (web)
- pnpm install
- pnpm run vendor:emulatorjs
- pnpm run dev

Open http://localhost:5173 in your browser.

Build (production)
- pnpm run build

Vendor/Upgrade EmulatorJS
- Edit scripts/vendor-emulatorjs.mjs and set EJS_VERSION to the desired tag, then run pnpm run vendor:emulatorjs

Desktop (Tauri)
- pnpm run tauri:dev
- pnpm run tauri:build

Notes
- No ROMs included. ROMs are provided by the user (drag-and-drop or folder import in the desktop app).

Tech stack
- React + TypeScript + Vite
- EmulatorJS runtime + RetroArch cores
- IndexedDB for local ROM library
- Tauri for desktop packaging

License
- EmulatorJS and some cores are GPL-3.0. See upstream licenses.