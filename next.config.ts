import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    /** YouTube 썸네일. `youtubeId` 에서 URL 을 규칙으로 만들어 쓴다. */
    remotePatterns: [{ protocol: "https", hostname: "i.ytimg.com" }],
  },
};

export default nextConfig;
