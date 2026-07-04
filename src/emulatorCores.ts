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
const BADGES: Record<string, { short: string; color: string }> = {
  nes: { short: 'NES', color: '#e4572e' },
  snes: { short: 'SNES', color: '#7c3aed' },
  n64: { short: 'N64', color: '#2563eb' },
  gb: { short: 'GB', color: '#65a30d' },
  gba: { short: 'GBA', color: '#7c3aed' },
  nds: { short: 'NDS', color: '#0891b2' },
  vb: { short: 'VB', color: '#dc2626' },
  coleco: { short: 'COL', color: '#9333ea' },
  segaMS: { short: 'SMS', color: '#0284c7' },
  segaMD: { short: 'GEN', color: '#0284c7' },
  segaGG: { short: 'GG', color: '#0284c7' },
  segaCD: { short: 'SCD', color: '#0284c7' },
  sega32x: { short: '32X', color: '#0284c7' },
  segaSaturn: { short: 'SAT', color: '#0284c7' },
  psx: { short: 'PSX', color: '#334155' },
  psp: { short: 'PSP', color: '#334155' },
  atari2600: { short: '2600', color: '#d97706' },
  atari5200: { short: '5200', color: '#d97706' },
  atari7800: { short: '7800', color: '#d97706' },
  lynx: { short: 'LYNX', color: '#d97706' },
  jaguar: { short: 'JAG', color: '#d97706' },
  pce: { short: 'PCE', color: '#be123c' },
  pcfx: { short: 'PCFX', color: '#be123c' },
  ngp: { short: 'NGP', color: '#475569' },
  ws: { short: 'WS', color: '#475569' },
  '3do': { short: '3DO', color: '#475569' },
  amiga: { short: 'AMI', color: '#78716c' },
  c64: { short: 'C64', color: '#78716c' },
  c128: { short: 'C128', color: '#78716c' },
  pet: { short: 'PET', color: '#78716c' },
  plus4: { short: 'P4', color: '#78716c' },
  vic20: { short: 'VIC', color: '#78716c' },
  dos: { short: 'DOS', color: '#57534e' },
  intv: { short: 'INTV', color: '#57534e' },
  arcade: { short: 'ARC', color: '#db2777' },
  mame: { short: 'ARC', color: '#db2777' },
}

export function systemBadge(core: string): { short: string; color: string } {
  return BADGES[core] ?? { short: core.slice(0, 4).toUpperCase(), color: '#475569' }
}
