/**
 * 검사 결과를 쿠키에도 둔다. **서버가 첫 HTML 에 결과를 그리게 하려는 것뿐이다.**
 *
 * 서버는 Local Storage 를 못 본다. 그래서 홈은 늘 "결과 없음" 으로 그려졌다가
 * 하이드레이션 직후 결과로 바뀌었고, 그 사이 **빈 화면이 번쩍였다.** 그 구간의
 * 길이는 JS 번들을 받아서 실행하는 시간이라 클라이언트에서는 줄일 방법이 없다.
 * 서버가 값을 볼 수 있어야 사라진다.
 *
 * **쿠키는 매 요청에 실려 간다.** 브라우저 밖으로 안 나간다는 말은 이제 사실이
 * 아니고, 푸터 문구도 그에 맞게 고쳤다("서버로 보내지 않습니다" →
 * "서버에 저장하지 않습니다"). 값을 읽어서 화면을 그릴 뿐 어디에도 안 남긴다.
 *
 * `HttpOnly` 를 못 쓴다 — 쓰는 쪽이 브라우저 JS 다. 담기는 것은 문항 번호와
 * 검사 시각뿐이라 훔쳐도 쓸 데가 없고, 이 앱에는 세션도 권한도 없다.
 *
 * **Local Storage 가 여전히 정본이다.** 쿠키는 첫 페인트용 사본이고, 둘이
 * 어긋나면(사용자가 한쪽만 지우면) 정본을 따르고 사본을 버린다.
 * → `clearPreferenceCookie`
 */
const PREFERENCE_COOKIE = "musicdna_pref_v1";

/** 1년. 검사 결과는 오래 남아야 한다 — 재검사 전까지가 유효기간이다 */
const MAX_AGE = 60 * 60 * 24 * 365;

export { PREFERENCE_COOKIE };

/**
 * 서버가 받은 쿠키 값을 Local Storage 에 있던 문자열과 같은 모양으로 되돌린다.
 *
 * 쓸 때 `encodeURIComponent` 를 거친다 — JSON 의 `{`, `"`, `,` 는 쿠키
 * 헤더에서 구분자로 읽힐 수 있다. 런타임이 이미 디코드해서 줬을 수도 있는데,
 * 그때 한 번 더 돌려도 안전하다(담기는 값에 `%` 가 없다). 그래도 깨진 입력이
 * 오면 `decodeURIComponent` 는 던지므로 감싼다 — 쿠키는 사용자가 직접
 * 고칠 수 있는 값이다.
 */
export function decodePreferenceCookie(value: string | undefined): string | null {
  if (!value) return null;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/**
 * 로컬에 성공적으로 저장한 **직후에만** 부른다. 둘이 같은 값을 들고 있어야 한다.
 *
 * 실패를 삼킨다. `document.cookie` 는 sandbox iframe 이나 쿠키 차단에서 던지는데,
 * **쿠키가 없어도 앱은 돈다** — 첫 페인트가 한 번 깜빡일 뿐이다.
 * `writeStoredValue` 가 `setItem` 실패를 삼키는 것과 같은 판단이다.
 */
export function writePreferenceCookie(raw: string) {
  try {
    const secure = window.location.protocol === "https:" ? "; secure" : "";
    document.cookie = `${PREFERENCE_COOKIE}=${encodeURIComponent(raw)}; path=/; max-age=${MAX_AGE}; samesite=lax${secure}`;
  } catch {
    return;
  }
}

/**
 * 사본을 버린다. Local Storage 가 비었는데 쿠키만 남아 있으면 서버는 결과를
 * 그리고 클라이언트는 안내로 되돌리는 — 고치려던 것과 정확히 반대인 깜빡임이
 * 생긴다. 그 상황을 발견한 자리에서 바로 지운다.
 */
export function clearPreferenceCookie() {
  try {
    document.cookie = `${PREFERENCE_COOKIE}=; path=/; max-age=0; samesite=lax`;
  } catch {
    return;
  }
}
