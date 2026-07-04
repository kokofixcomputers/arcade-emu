import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages project sites are served from /<repo-name>/, not the domain
// root. GITHUB_REPOSITORY (owner/repo) is set automatically in Actions.
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1]

export default defineConfig({
  plugins: [react()],
  base: process.env.GITHUB_ACTIONS && repoName ? `/${repoName}/` : '/',
})
