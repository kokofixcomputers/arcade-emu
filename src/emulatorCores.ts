// System identifiers as defined by EmulatorJS (data/src/consts.js `cores` map).
// These are the exact strings EmulatorJS expects for `EJS_core`.
export interface SystemOption {
  value: string
  label: string
}

export const SYSTEMS: SystemOption[] = [
  { value: 'nes', label: 'Nintendo (NES/Famicom)' },
  { value: 'snes', label: 'Super Nintendo (SNES)' },
  { value: 'n64', label: 'Nintendo 64' },
  { value: 'gb', label: 'Game Boy / Game Boy Color' },
  { value: 'gba', label: 'Game Boy Advance' },
  { value: 'nds', label: 'Nintendo DS' },
  { value: 'vb', label: 'Virtual Boy' },
  { value: 'coleco', label: 'ColecoVision' },
  { value: 'segaMS', label: 'Sega Master System' },
  { value: 'segaMD', label: 'Sega Genesis / Mega Drive' },
  { value: 'segaGG', label: 'Sega Game Gear' },
  { value: 'segaCD', label: 'Sega CD' },
  { value: 'sega32x', label: 'Sega 32X' },
  { value: 'segaSaturn', label: 'Sega Saturn' },
  { value: 'psx', label: 'Sony PlayStation' },
  { value: 'psp', label: 'Sony PSP' },
  { value: 'atari2600', label: 'Atari 2600' },
  { value: 'atari5200', label: 'Atari 5200' },
  { value: 'atari7800', label: 'Atari 7800' },
  { value: 'lynx', label: 'Atari Lynx' },
  { value: 'jaguar', label: 'Atari Jaguar' },
  { value: 'pce', label: 'PC Engine / TurboGrafx-16' },
  { value: 'pcfx', label: 'PC-FX' },
  { value: 'ngp', label: 'Neo Geo Pocket' },
  { value: 'ws', label: 'WonderSwan' },
  { value: '3do', label: '3DO' },
  { value: 'amiga', label: 'Commodore Amiga' },
  { value: 'c64', label: 'Commodore 64' },
  { value: 'c128', label: 'Commodore 128' },
  { value: 'pet', label: 'Commodore PET' },
  { value: 'plus4', label: 'Commodore Plus/4' },
  { value: 'vic20', label: 'Commodore VIC-20' },
  { value: 'dos', label: 'MS-DOS' },
  { value: 'intv', label: 'Intellivision' },
  { value: 'arcade', label: 'Arcade (FBNeo)' },
  { value: 'mame', label: 'Arcade (MAME)' },
]

// Best-effort extension -> system guess. Several extensions are ambiguous
// (.bin, .iso, .cue, .zip are reused across systems), so the UI always lets
// the user override the guess before booting.
const EXTENSION_MAP: Record<string, string> = {
  nes: 'nes',
  fds: 'nes',
  smc: 'snes',
  sfc: 'snes',
  fig: 'snes',
  n64: 'n64',
  z64: 'n64',
  v64: 'n64',
  gb: 'gb',
  gbc: 'gb',
  gba: 'gba',
  nds: 'nds',
  vb: 'vb',
  col: 'coleco',
  sms: 'segaMS',
  gg: 'segaGG',
  md: 'segaMD',
  gen: 'segaMD',
  smd: 'segaMD',
  '32x': 'sega32x',
  ws: 'ws',
  wsc: 'ws',
  ngp: 'ngp',
  ngc: 'ngp',
  pce: 'pce',
  pcfx: 'pcfx',
  a26: 'atari2600',
  a52: 'atari5200',
  a78: 'atari7800',
  lnx: 'lynx',
  j64: 'jaguar',
  jag: 'jaguar',
  d64: 'c64',
  adf: 'amiga',
  iso: 'psx',
  cue: 'psx',
  chd: 'psx',
  pbp: 'psx',
  bin: 'psx',
  zip: 'arcade',
}

export function guessSystem(fileName: string): string | null {
  const ext = fileName.split('.').pop()?.toLowerCase()
  if (!ext) return null
  return EXTENSION_MAP[ext] ?? null
}

export function systemLabel(core: string): string {
  return SYSTEMS.find((system) => system.value === core)?.label ?? core
}

// Short badge text + accent color per manufacturer, used on library cards.
// Kept within one warm/cool dusty family (instead of a saturated rainbow of
// unrelated hues) so the grid reads as one considered palette rather than a
// different accent color slapped on per card.
const BADGES: Record<string, { short: string; color: string }> = {
  nes: { short: 'NES', color: '#b5502f' },
  snes: { short: 'SNES', color: '#8a6a3f' },
  n64: { short: 'N64', color: '#3d6b78' },
  gb: { short: 'GB', color: '#5c7a4f' },
  gba: { short: 'GBA', color: '#6a5c8a' },
  nds: { short: 'NDS', color: '#3d6b78' },
  vb: { short: 'VB', color: '#a83f3f' },
  coleco: { short: 'COL', color: '#6a5c8a' },
  segaMS: { short: 'SMS', color: '#3d6b8c' },
  segaMD: { short: 'GEN', color: '#3d6b8c' },
  segaGG: { short: 'GG', color: '#3d6b8c' },
  segaCD: { short: 'SCD', color: '#3d6b8c' },
  sega32x: { short: '32X', color: '#3d6b8c' },
  segaSaturn: { short: 'SAT', color: '#3d6b8c' },
  psx: { short: 'PSX', color: '#4a5560' },
  psp: { short: 'PSP', color: '#4a5560' },
  atari2600: { short: '2600', color: '#a8722e' },
  atari5200: { short: '5200', color: '#a8722e' },
  atari7800: { short: '7800', color: '#a8722e' },
  lynx: { short: 'LYNX', color: '#a8722e' },
  jaguar: { short: 'JAG', color: '#a8722e' },
  pce: { short: 'PCE', color: '#8c3f52' },
  pcfx: { short: 'PCFX', color: '#8c3f52' },
  ngp: { short: 'NGP', color: '#5c5650' },
  ws: { short: 'WS', color: '#5c5650' },
  '3do': { short: '3DO', color: '#5c5650' },
  amiga: { short: 'AMI', color: '#6b6355' },
  c64: { short: 'C64', color: '#6b6355' },
  c128: { short: 'C128', color: '#6b6355' },
  pet: { short: 'PET', color: '#6b6355' },
  plus4: { short: 'P4', color: '#6b6355' },
  vic20: { short: 'VIC', color: '#6b6355' },
  dos: { short: 'DOS', color: '#57534e' },
  intv: { short: 'INTV', color: '#57534e' },
  arcade: { short: 'ARC', color: '#a8452e' },
  mame: { short: 'ARC', color: '#a8452e' },
}

export function systemBadge(core: string): { short: string; color: string } {
  return BADGES[core] ?? { short: core.slice(0, 4).toUpperCase(), color: '#57534e' }
}
