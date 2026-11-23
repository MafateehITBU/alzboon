import nextConfig from 'eslint-config-next'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  ...nextConfig,
  globalIgnores(['dist']),
  {
    rules: {
      '@next/next/no-img-element': 'off',
    },
  },
])
