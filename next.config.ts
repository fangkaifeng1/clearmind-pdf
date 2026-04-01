import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true
  },
  trailingSlash: true, // 静态导出需要
}

export default nextConfig
