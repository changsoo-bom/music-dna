# 번들 폰트

## Pretendard

- 저작자: 길형진 (orioncactus)
- 원본: https://github.com/orioncactus/pretendard
- 라이선스: **SIL Open Font License 1.1** — 임베딩·재배포 가능, 폰트 파일 판매 금지,
  배포 시 라이선스 고지 필요 (이 문서가 그 고지다)

정적 웨이트 3종만 둔다. 각각이 담당하는 자리는 `docs/design-reference.md` 의 타이포 표에 있다.

| 파일 | weight | 쓰이는 곳 |
|---|---|---|
| `Pretendard-Regular.woff2` | 400 | 본문 (CSS 450 이 여기로 떨어진다) |
| `Pretendard-Medium.woff2` | 500 | 헤드라인, 버튼, 네비 |
| `Pretendard-Bold.woff2` | 700 | 아이브로우, 푸터 컬럼 헤더 |

`.woff` 는 가져오지 않았다. 이 프로젝트가 지원하는 브라우저는 전부 woff2 를 읽는다.

## 알려진 한계

한글 전각이 다 들어 있어 파일당 약 800KB, 합계 2.4MB 다.
`preload: false` 로 초기 렌더는 막지 않지만 한글이 처음 그려질 때 받아온다.
줄이려면 `pyftsubset` 으로 KS X 1001 상용 2,350자 + 라틴만 남기는 서브셋을 만든다
(대략 1/5 로 준다). 지금은 하지 않았다.
