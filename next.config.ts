import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // 原生模块不能被打包进 bundle
  serverExternalPackages: ['@node-rs/argon2'],
  // 父目录存在其它 lockfile，显式锁定项目根避免打包器向上越界
  turbopack: { root: process.cwd() },
}

export default nextConfig