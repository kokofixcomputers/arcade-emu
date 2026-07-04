# ArcadeEmu

A browser-based emulator front-end built with React, TypeScript, and [EmulatorJS](https://emulatorjs.org). Drag and drop a ROM file to play it, with a local library of previously-played games and a controller-navigable "Couch Mode" for TV/big-screen use.

## Disclaimer

**This project does not host, distribute, bundle, or link to any ROM files.** No copyrighted game data is included in this repository or downloaded by it — only the open-source EmulatorJS emulator runtime itself.

ROMs are provided entirely by the user, loaded locally in the browser via drag-and-drop. You are responsible for only using ROM files you legally own and are legally entitled to use (e.g. dumped from cartridges/discs you own, where permitted in your jurisdiction).

This project is intended for **educational purposes only** — to demonstrate browser-based emulation, drag-and-drop file handling, and EmulatorJS integration. It is not intended to facilitate piracy or unauthorized distribution of copyrighted software.

## Features

- Drag-and-drop (or file picker) ROM loading, with automatic system/core detection by file extension
- Local library of previously-played games (stored in the browser's IndexedDB — nothing leaves your machine)
- "Couch Mode": a fullscreen, controller-navigable big-picture screen for browsing and launching games with a gamepad
- EmulatorJS runtime and RetroArch cores vendored locally — no calls to any external CDN at runtime

## Getting started

```bash
pnpm install
pnpm run vendor:emulatorjs   # vendors the EmulatorJS runtime + cores into public/data
pnpm run dev
```

`vendor:emulatorjs` clones the matching EmulatorJS release tag and RetroArch cores and only needs to be re-run when upgrading the pinned `EJS_VERSION` in `scripts/vendor-emulatorjs.mjs`.

## Tech stack

- React + TypeScript + Vite
- [EmulatorJS](https://emulatorjs.org) ([GPL-3.0](https://github.com/EmulatorJS/EmulatorJS/blob/main/LICENSE)), vendored locally
- IndexedDB for local-only game library storage
