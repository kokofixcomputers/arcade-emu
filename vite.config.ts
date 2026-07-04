import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages project sites are served from /<repo-name>/, not the domain
// root. GITHUB_REPOSITORY (owner/repo) is set automatically in Actions.
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1]

// The Tauri CLI sets this for every build it triggers (including in CI, via
// the release workflow's `tauri-action`). Tauri's production webview serves
// the app from its own custom protocol root, so it always needs base "/" —
// without this check, a Tauri build running inside the GitHub Actions release
// workflow would inherit the GH-Pages "/<repo-name>/" base below (since
// GITHUB_ACTIONS is also set there) and 404 every asset, producing a blank
// white window with no visible error.
const isTauriBuild = !!process.env.TAURI_ENV_PLATFORM

export default defineConfig({
  plugins: [react()],
  base: isTauriBuild ? '/' : process.env.GITHUB_ACTIONS && repoName ? `/${repoName}/` : '/',
})
