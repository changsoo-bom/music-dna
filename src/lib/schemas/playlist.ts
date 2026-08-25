import { z } from "zod";

import type { Playlist } from "@/types/music";

/**
 * 저장된 리스트 목록을 읽는다. **Local Storage 는 신뢰 경계 밖이다.**
 *
 * 곡은 여기서도 id 로만 갖는다 → `parseRawIds`. 다만 카탈로그로 거르지
 * 않는다 — 리스트가 몇 곡을 담고 있는지는 저장된 사실이고, 그중 지금
 * 그릴 수 있는 곡이 몇인지는 여는 화면이 정할 일이다.
 *
 * 형식이 깨졌으면 빈 목록이다. 던지면 `getSnapshot` 안에서 렌더 도중에 죽는다.
 */
const storedSchema = z.array(
  z.object({
    id: z.string(),
    name: z.string(),
    createdAt: z.string(),
    trackIds: z.array(z.string()),
  }),
);

export function parsePlaylists(raw: string | null): Playlist[] {
  if (!raw) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return [];
  }

  const lists = storedSchema.safeParse(parsed);
  if (!lists.success) return [];

  // **같은 곡이 두 번 들어 있으면 한 줄로 접는다.** 쓰기 경로는 담긴 것을
  // 다시 담지 않지만(`togglePlaylistTrack`) 저장소는 사람이 고칠 수 있고,
  // 겹친 채로 나가면 목록에 같은 곡이 두 줄 생기면서 React 의 key 가 겹친다
  return lists.data.map((list) => ({ ...list, trackIds: [...new Set(list.trackIds)] }));
}
