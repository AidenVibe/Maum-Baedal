import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false, // TypeScript 에러는 여전히 확인
  },
  turbopack: {
    // experimental.turbo에서 turbopack으로 변경
  },
};

export default nextConfig;
