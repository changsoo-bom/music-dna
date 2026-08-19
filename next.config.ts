import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    /**
     * 유튜브 썸네일. URL 은 저장하지 않고 `youtubeId` 에서 규칙으로 만든다 —
     * `https://i.ytimg.com/vi/{id}/hqdefault.jpg`. 중복 저장할 이유가 없다.
     */
    remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com" }],
  },
};

export default nextConfig;
