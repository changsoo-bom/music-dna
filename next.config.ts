import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    /**
     * 유튜브 썸네일. URL 은 저장하지 않고 `youtubeId` 에서 규칙으로 만든다 —
     * `https://i.ytimg.com/vi/{id}/hqdefault.jpg`. 중복 저장할 이유가 없다.
     */
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com" },
      /**
       * 채널(가수) 썸네일. 이쪽은 규칙으로 못 만들고 `channels.list` 가 준
       * URL 을 그대로 쓴다 → `lib/youtube/search.ts`. 호스트가 둘인 것은
       * 구글이 둘 다 쓰기 때문이고, 어느 쪽이 오는지는 계정마다 다르다.
       */
      { protocol: "https", hostname: "yt3.ggpht.com" },
      { protocol: "https", hostname: "yt3.googleusercontent.com" },
    ],
  },
};

export default nextConfig;
