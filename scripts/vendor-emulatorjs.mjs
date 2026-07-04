// Vendors EmulatorJS's runtime + every RetroArch core into public/data/, so
// the app serves EmulatorJS from itself instead of cdn.emulatorjs.org.
//
// The runtime (loader.js, data/src/*.js, emulator.css, localization) comes
// straight from the tagged git release, NOT the npm package — the npm
// package and the `main` branch have drifted out of sync with each other in
// the past (different loader.js load strategy, different data/src layout),
// and mixing files from both caused subtle, hard-to-diagnose bugs. Cloning a
// single tag guarantees every file we vendor comes from one consistent
// snapshot.
//
// data/src/*.js at this tag are plain classic scripts (no import/export) —
// loader.js loads them as separate <script> tags, in the order listed below,
// when it can't find emulator.min.js. So "minifying" here just means
// concatenating them in that same order and running the result through
// terser — no bundler needed (and no bundler-shaped bugs from tree-shaking
// or ES-module `this` semantics breaking the vendored UMD libraries).
//
// RetroArch cores aren't published to git (only npm/CDN), so those still
// come from @emulatorjs/cores via pnpm.
//
// Re-run after bumping EJS_VERSION below to pick up a newer EmulatorJS
// release: `node scripts/vendor-emulatorjs.mjs`
import { existsSync, mkdirSync, readdirSync, rmSync, statSync, cpSync, readFileSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execFileSync } from 'node:child_process'
import { tmpdir } from 'node:os'
import { minify } from 'terser'
import { minify as minifyCss } from '@node-minify/core'
import { cleanCss } from '@node-minify/clean-css'

const EJS_VERSION = '4.2.3'

// Must match the order loader.js's own classic-script fallback list uses.
const CLASSIC_SCRIPTS = [
  'emulator.js',
  'nipplejs.js',
  'shaders.js',
  'storage.js',
  'gamepad.js',
  'GameManager.js',
  'socket.io.min.js',
  'compression.js',
]

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)))
const pnpmDir = join(rootDir, 'node_modules', '.pnpm')
const publicData = join(rootDir, 'public', 'data')
const cloneDir = join(tmpdir(), `emulatorjs-v${EJS_VERSION}-${Date.now()}`)

console.log(`==> Cloning EmulatorJS v${EJS_VERSION}`)
execFileSync('git', [
  'clone', '--depth', '1', '--branch', `v${EJS_VERSION}`,
  'https://github.com/EmulatorJS/EmulatorJS.git', cloneDir,
], { stdio: 'inherit' })

console.log('==> Vendoring EmulatorJS runtime')
rmSync(publicData, { recursive: true, force: true })
cpSync(join(cloneDir, 'data'), publicData, { recursive: true })
rmSync(join(publicData, 'cores'), { recursive: true, force: true })
mkdirSync(join(publicData, 'cores', 'reports'), { recursive: true })
rmSync(cloneDir, { recursive: true, force: true })

const coreDirs = readdirSync(pnpmDir).filter((entry) => entry.startsWith('@emulatorjs+core-'))
console.log(`==> Vendoring ${coreDirs.length} RetroArch cores`)

for (const entry of coreDirs) {
  const pkgName = entry.split('@emulatorjs+')[1].split('@')[0]
  const dir = join(pnpmDir, entry, 'node_modules', '@emulatorjs', pkgName)
  if (!existsSync(dir)) continue

  for (const file of readdirSync(dir)) {
    const filePath = join(dir, file)
    if (file.endsWith('.data') && statSync(filePath).isFile()) {
      cpSync(filePath, join(publicData, 'cores', file))
    }
  }

  const reportsDir = join(dir, 'reports')
  if (existsSync(reportsDir)) {
    for (const file of readdirSync(reportsDir)) {
      cpSync(join(reportsDir, file), join(publicData, 'cores', 'reports', file))
    }
  }
}

console.log('==> Concatenating + minifying emulator runtime scripts (terser)')
const concatenated = CLASSIC_SCRIPTS
  .map((file) => readFileSync(join(publicData, 'src', file), 'utf8'))
  .join('\n;\n')
const { code } = await minify(concatenated, {
  sourceMap: false,
  module: false,
})
writeFileSync(join(publicData, 'emulator.min.js'), code)

console.log('==> Minifying emulator.css (clean-css)')
await minifyCss({
  compressor: cleanCss,
  input: join(publicData, 'emulator.css'),
  output: join(publicData, 'emulator.min.css'),
})

console.log(`==> Done. Vendored EmulatorJS data at ${publicData}`)
