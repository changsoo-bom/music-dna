/**
 * 오각형 차트의 좌표. 뷰박스는 정사각이고 중심은 그 한가운데다.
 *
 * `labelGap` 은 꼭짓점 바깥으로 라벨을 밀어내는 거리다. 라벨이 도형에 닿으면
 * 어느 축의 이름인지가 아니라 도형의 일부처럼 읽힌다.
 */
export const RADAR = { size: 220, center: 110, radius: 78, labelGap: 22 } as const;

/** 안쪽 격자 고리. 25% 간격이면 눈금 없이도 대략의 값이 읽힌다 */
export const RINGS = [0.25, 0.5, 0.75, 1] as const;

export type RadarAxis = { key: string; label: string; value: number };

/**
 * `index` 번째 축 위의 점. **12시에서 시작해 시계 방향으로 돈다.**
 *
 * 0도가 3시인 좌표계라 -90 을 더해 첫 꼭짓점을 위로 올린다. 정오각형의
 * 뾰족한 끝이 위를 향해야 오각형으로 보이고, 안 그러면 기울어진 도형이 된다.
 */
export function radarPoint(index: number, count: number, ratio: number) {
  const angle = ((-90 + (360 / count) * index) * Math.PI) / 180;
  const distance = RADAR.radius * ratio;
  return {
    x: RADAR.center + distance * Math.cos(angle),
    y: RADAR.center + distance * Math.sin(angle),
  };
}

/** `points` 속성에 그대로 넣을 문자열 */
export function radarPolygon(values: readonly number[], ratio = 1): string {
  return values
    .map((value, index) => {
      const point = radarPoint(index, values.length, (value / 100) * ratio);
      return `${point.x},${point.y}`;
    })
    .join(" ");
}

/**
 * 라벨 자리와 정렬. 축이 화면 어느 쪽으로 뻗었는지에 따라 기준점을 바꾼다.
 *
 * 전부 `middle` 로 두면 좌우 꼭짓점의 라벨이 도형 위로 절반씩 올라탄다.
 * 가운데(12시·6시)만 `middle` 이고 나머지는 바깥쪽으로 민다.
 */
export function radarLabel(index: number, count: number) {
  const { x, y } = radarPoint(index, count, (RADAR.radius + RADAR.labelGap) / RADAR.radius);
  const offset = x - RADAR.center;
  return {
    x,
    // 글자의 세로 중심을 점에 맞춘다. dominant-baseline 은 브라우저마다
    // 미세하게 달라서, 폰트 크기의 1/3 만큼 내리는 쪽이 더 안정적이다.
    y: y + 4,
    anchor: Math.abs(offset) < 1 ? "middle" : offset > 0 ? "start" : "end",
  } as const;
}
