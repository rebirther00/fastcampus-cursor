import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // TypeScript 설정
  typescript: {
    // 빌드 시 타입 체크 무시하지 않음
    ignoreBuildErrors: false,
  },
  // ESLint 설정
  eslint: {
    // 빌드 시 ESLint 체크 무시하지 않음
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
