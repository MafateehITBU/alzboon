/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  allowedDevOrigins: ['127.0.0.1'],
  agentRules: false,
  experimental: {
    serverActions: {
      bodySizeLimit: '12mb',
    },
  },
}

export default nextConfig
