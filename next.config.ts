import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    /**
     * 프로토타입 단계의 커버 이미지는 picsum 시드로 받는다.
     * Spotify 연동이 들어오면 앨범 아트 호스트(`i.scdn.co`)를 여기에 추가한다.
     */
    remotePatterns: [{ protocol: "https", hostname: "picsum.photos" }],
  },
};

export default nextConfig;
