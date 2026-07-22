# ArcadeEmu

A browser-first emulator front-end built with React + TypeScript and a vendored EmulatorJS runtime. Use it in the browser or as a native desktop app (Tauri). Drag-and-drop ROMs to play, maintain a local library (IndexedDB), and use "Couch Mode" for controller / big-screen navigation.


Badges

- Builds: N/A
- License: See LICENSE / downstream components


Table of contents

- About
- Disclaimer
- Features
- Tech stack
- Prerequisites
- Getting started (web)
- Vendoring EmulatorJS & cores
- Desktop (Tauri) build
- Project structure
- Development notes
- Updating EmulatorJS / cores
- Contributing
- License & credits
- Troubleshooting


About

This repository is an open-source example front-end that integrates EmulatorJS to run many classic console and arcade cores entirely in the browser. It provides a simple, local-only library of ROMs the user supplies and a fullscreen "Couch Mode" UI navigable with a gamepad.


Disclaimer

This project does not host, distribute, bundle, or otherwise provide any ROM files. No copyrighted ROMs are included. The application loads ROM files locally from your machine (drag-and-drop or, in the desktop app, from a chosen folder). You are responsible for only using ROMs you legally own and are permitted to use.

This project is intended for educational/demonstration purposes only.


Features

- Drag-and-drop (or file picker) ROM loading with an editable system/core selector
- Automatic best-effort system guess from filename extension
- Local library of previously-played games stored in IndexedDB
- Couch Mode: fullscreen, controller-navigable grid UI for Big Picture style browsing
- EmulatorJS runtime and RetroArch cores vendored into public/data so the app does not rely on a CDN at runtime
- Desktop application powered by Tauri: can point at a local ROMs folder and auto-import files


Tech stack

- React + TypeScript + Vite
- Tauri (desktop packaging)
- EmulatorJS (vendored runtime) + @emulatorjs/cores (RetroArch cores)
- IndexedDB for persistent local ROM library


Prerequisites

- Node.js (recommend current LTS) and pnpm (this repo uses pnpm as package manager)
- For desktop builds: Rust toolchain (stable) + system-specific Tauri prerequisites per https://tauri.app/


Quick start (web)

1. Install dependencies

   pnpm install

2. Vendor emulator runtime + cores (only needed when you first set up the project, or when bumping the pinned EmulatorJS version):

   pnpm run vendor:emulatorjs

   This script clones the matching EmulatorJS git tag and copies / minifies the runtime into public/data/, and copies cores from @emulatorjs/cores in node_modules into public/data/cores.

3. Run the dev server

   pnpm run dev

Open http://localhost:5173 (or the port Vite reports) and try dragging a ROM into the library.


Build (production web bundle)

pnpm run build

This runs TypeScript build (tsc -b) and builds the Vite production bundle.


Vendoring EmulatorJS & cores

- The vendoring script is scripts/vendor-emulatorjs.mjs.
- It currently pins EmulatorJS via the EJS_VERSION constant inside that file.
- To upgrade EmulatorJS:
  1. Update EJS_VERSION in scripts/vendor-emulatorjs.mjs to the desired tag (e.g. '4.2.4').
  2. Run pnpm run vendor:emulatorjs.
- The script concatenates the classic emulator data scripts (the same order the upstream loader expects) and minifies them into public/data/emulator.min.js, and also minifies emulator.css -> emulator.min.css.
- RetroArch cores are copied from the installed @emulatorjs/cores packages in node_modules (pnpm keeps them under node_modules/.pnpm/@emulatorjs+core-...)


Desktop app (Tauri)

1. Make sure you have the Rust toolchain installed (rustup) and any OS-specific build requirements from the Tauri docs.
2. Start the app in dev mode

   pnpm run tauri:dev

3. Build a distributable

   pnpm run tauri:build

Notes on the desktop experience

- The Tauri build exposes a "Set ROMs Folder" control in the library. Choose a folder and the app will recursively scan and import recognized ROMs (it stores the absolute source path on imported records to avoid re-importing duplicates on subsequent rescans).
- The Tauri integration uses @tauri-apps/plugin-dialog and @tauri-apps/plugin-fs and corresponding async helpers in src/tauriRoms.ts.


Project structure

- public/ — static assets and the vendored EmulatorJS runtime (public/data) after running vendor script
- src/
  - App.tsx — top-level app wiring and view switching
  - db.ts — IndexedDB helper and ROM record model
  - emulatorCores.ts — system definitions, extension mapping, and helper labels/badges
  - tauriRoms.ts — Tauri-specific scanning and file reading helpers (desktop only)
  - useGamepadNav.ts — gamepad + keyboard navigation utility for Couch Mode
  - components/
    - Library.tsx — main library UI
    - DropZone.tsx — drag/drop + file picker UI for adding ROMs
    - EmulatorFrame.tsx — iframe launcher that posts an ejs-boot message to the vendored emulator.html
    - CouchMode.tsx — fullscreen controller-navigable grid UI
    - RomsFolderControl.tsx — UI for choosing & rescanning a desktop ROMs folder (Tauri)
- scripts/vendor-emulatorjs.mjs — script to vendor EmulatorJS runtime + cores into public/data
- package.json — npm scripts and dependencies
- src-tauri/ — Tauri config and Rust integration (when building desktop app)


Development notes / useful scripts

- pnpm run dev — start Vite dev server
- pnpm run build — build production bundle (also runs tsc -b first)
- pnpm run preview — preview the built bundle locally
- pnpm run vendor:emulatorjs — vendor the EmulatorJS runtime + cores into public/data
- pnpm run tauri:dev — run the Tauri desktop app in dev mode
- pnpm run tauri:build — produce a native installer / bundle

The emulator is loaded in an <iframe src="/emulator.html"> which receives an "ejs-boot" postMessage with: { type: 'ejs-boot', core, file, fileName, gameId, couchMode } . The vendored emulator page (emulator.html + data files) must exist under public/.


Updating EmulatorJS / cores

- To update the EmulatorJS runtime version, edit EJS_VERSION in scripts/vendor-emulatorjs.mjs and re-run pnpm run vendor:emulatorjs.
- To update the RetroArch cores, bump the versions of @emulatorjs/cores packages (package.json devDependencies) and run pnpm install, then vendor script again.


Contributing

Contributions are welcome. Suggested workflow:

1. Fork the repo and create a feature branch.
2. Keep changes small and focused (e.g. UI tweaks, additional systems, bug fixes).
3. Update or add tests where appropriate.
4. Open a pull request describing the change and rationale.

Please avoid adding or committing copyrighted ROMs. Keep the vendored emulator runtime and cores separated under public/data as the project currently does.


License & credits

- This project (the front-end code in this repo) can be licensed by you as desired, but be aware that EmulatorJS and some vendored cores are GPL-3.0 (see upstream EmulatorJS LICENSE). Check each upstream project's license before redistributing bundled binaries.
- Credits:
  - EmulatorJS — https://emulatorjs.org
  - @emulatorjs/cores — RetroArch cores used by EmulatorJS
  - React, Vite, Tauri, and many OSS libraries used here


Troubleshooting

- "Emulator doesn't load": ensure you ran pnpm run vendor:emulatorjs so public/data contains emulator assets. The dev server will serve these static files.
- "Gamepad not detected": some browsers need a button press to activate the Gamepad API. Try pressing a controller button.
- Tauri build failures: ensure Rust + cargo are installed and your OS meets Tauri's build requirements.


Contact / further help

Open an issue on the repository with reproduction steps and logs. If you want a change to this README or additional docs (developer setup, architecture diagrams, CI), tell me what you'd like and I can add it.


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
- Desktop app (Tauri): point at a folder on disk and it auto-imports every ROM found there into your library, and picks up new files on each rescan

## Getting started (web)

```bash
pnpm install
pnpm run vendor:emulatorjs   # vendors the EmulatorJS runtime + cores into public/data
pnpm run dev
```

`vendor:emulatorjs` clones the matching EmulatorJS release tag and RetroArch cores and only needs to be re-run when upgrading the pinned `EJS_VERSION` in `scripts/vendor-emulatorjs.mjs`.

## Desktop app (Tauri)

Prebuilt releases

If you prefer a ready-to-run native app instead of building from source, download a prebuilt release from:

https://github.com/kokofixcomputers/arcade-emu/releases

Select the asset that matches your platform (macOS, Windows, Linux). Prebuilt releases normally include the vendored EmulatorJS runtime and cores, so you do not need to run the vendoring script locally when using a release build.

Project site / web demo

The project also hosts a web demo and additional release info on GitHub Pages:

https://kokofixcomputers.github.io/arcade-emu

Note: the GitHub Pages site hosts the browser build (web demo). For native desktop installers and packaged releases, use the Releases page linked above.

Build from source

Requires the [Rust toolchain](https://www.rust-lang.org/tools/install) in addition to the web setup above.

```bash
pnpm run tauri:dev     # run the desktop app in dev mode
pnpm run tauri:build   # produce a native installer/bundle
```

In the desktop app, use **Set ROMs Folder** on the library screen to pick a directory — every recognized ROM file inside it (recursively) gets imported automatically, and the folder is remembered for next launch. **Rescan** picks up any files added since.

## Tech stack

- React + TypeScript + Vite
- [Tauri v2](https://v2.tauri.app) for the desktop build (folder picker + filesystem access via `@tauri-apps/plugin-dialog` / `@tauri-apps/plugin-fs`)
- [EmulatorJS](https://emulatorjs.org) ([GPL-3.0](https://github.com/EmulatorJS/EmulatorJS/blob/main/LICENSE)), vendored locally
- IndexedDB for local-only game library storage
