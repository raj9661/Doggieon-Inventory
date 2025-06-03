/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // App Router specific config
  experimental: {
    serverActions: true,
    appDir: true,
  },
  // Remove API config as it's for Pages Router
  // api: {
  //   bodyParser: {
  //     sizeLimit: '1mb',
  //   },
  //   responseLimit: '4mb',
  // },
}

export default nextConfig
