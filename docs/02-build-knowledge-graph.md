# 2. Interactive Knowledge Graph 만들기

> 예상 시간: 30분

## 학습 목표

- `/understand`로 대상 코드베이스의 Knowledge Graph를 생성한다
- 대시보드로 그래프를 시각적으로 탐색한다
- 다중 모듈 리포에서 모듈별로 그래프를 만드는 전략을 이해한다

## 개념

Understand Anything은 Kiro의 **스킬(skill)** 형태로 동작합니다. 설치하면 `/understand`, `/understand-chat`, `/understand-explain`, `/understand-dashboard` 등의 스킬이 `~/.kiro/skills/`에 등록됩니다.

- `/understand` — 그래프를 **생성**한다 (7단계 파이프라인)
- `/understand-dashboard` — 생성된 그래프를 웹 대시보드로 시각화한다
- `/understand-chat`, `/understand-explain` — 그래프에 질문/심층 해설 (단일 프로젝트 루트 기준)

> `/understand`는 **생성 전용**입니다. 코드 검색·이해는 3장에서 만들 `kg-search`/`kg-explain`으로 합니다.

## 사전 확인

> Understand Anything 설치는 [1장 — Understand Anything 소개 및 설치](01-understand-anything-intro.md)에서 완료합니다. 아직 설치하지 않았다면 1장을 먼저 진행하세요.

## 실습 1 — 그래프 생성하기

분석할 코드베이스(또는 특정 모듈) 디렉토리에서 Kiro 세션을 열고 `/understand`를 실행합니다.

> **Kiro에게 시킬 프롬프트**
> ```
> /understand
> ```

특정 디렉토리를 지정하거나 옵션을 줄 수도 있습니다.

> **특정 디렉토리를 지정해 분석**
> ```
> /understand ./module-a
> ```

> **한국어로 그래프를 생성하려면**
> ```
> /understand --language ko
> ```

주요 옵션:

| 옵션 | 설명 |
| --- | --- |
| (없음) | 현재 디렉토리 분석. 기존 그래프가 있으면 변경분만 증분 업데이트 |
| `<경로>` | 지정한 디렉토리를 분석 |
| `--full` | 기존 그래프 무시하고 전체 재생성 |
| `--language ko` | 요약·설명을 한국어로 생성 (기본은 영어) |
| `--review` | LLM 그래프 리뷰어로 품질 검증 |

`/understand`는 7단계(스캔 → 배치 → 분석 → 조립 → 아키텍처 → 투어 → 저장)로 진행되며, 진행 상황을 `[Phase N/7]`로 보고합니다.

> **스크린샷 자리** — `/understand` 실행 중 `[Phase N/7]` 진행 로그 화면
> <!-- ![understand 진행 로그](../assets/02-understand-progress.png) -->

> **언어 선택 팁**: 기본 영어 그래프는 검색 시 한국어→영어 변환이 필요하지만 코드 식별자와 잘 맞습니다. `--language ko`로 만들면 한국어 질의가 자연스럽지만, 재생성 시 일관성을 위해 언어를 고정하는 것이 좋습니다. 이 워크샵은 **영어 그래프 + 검색 시 키워드 변환** 방식을 기준으로 진행합니다.

## 실습 2 — 대시보드로 탐색하기

생성이 끝나면 대시보드로 그래프를 눈으로 봅니다.

> **Kiro에게 시킬 프롬프트**
> ```
> /understand-dashboard
> ```

브라우저에서 노드(파일/함수/클래스)와 엣지(관계), 레이어, 투어를 인터랙티브하게 탐색할 수 있습니다. 코드의 전체 구조를 처음 조망하기에 가장 좋은 출발점입니다.

> **스크린샷 자리** — `/understand-dashboard`로 열린 인터랙티브 그래프 전경 **(필수)**
> <!-- ![대시보드 전경](../assets/02-dashboard-overview.png) -->

> **스크린샷 자리** — 레이어(계층)별 색상 구분이 보이는 대시보드 (선택)
> <!-- ![레이어 시각화](../assets/02-dashboard-layers.png) -->

## 실습 3 — 다중 모듈 전략

대규모 코드는 보통 여러 모듈로 쪼개져 있습니다(예: 백엔드 API, 비즈니스 로직, 프론트 등). 이럴 때는 **모듈별로 그래프를 생성**합니다.

```
repo-root/
├── module-a/.ua/knowledge-graph.json
├── module-b/.ua/knowledge-graph.json
└── module-c/.ua/knowledge-graph.json
```

각 모듈 디렉토리에서 `/understand`를 실행하면 됩니다. 모듈이 많다면 하나씩 순차로 진행하세요.

> **모듈 하나를 지정해 생성**
> ```
> /understand ./module-a
> ```

생성된 그래프들을 확인:

```bash
find . -maxdepth 2 -path '*/.ua/knowledge-graph.json'
```

> 왜 모듈별인가? 모듈마다 그래프를 나누면 검색 시 대상 범위가 좁아져 정확도가 오르고, 모듈 단위로 증분 업데이트하기도 쉽습니다. 3장에서는 이 "모듈별 그래프"를 골라 검색하는 스킬을 만듭니다.

## 실습 4 — 코드가 바뀌면 그래프 업데이트하기

그래프는 생성 시점의 코드 스냅샷입니다. 코드를 수정하면 그래프도 갱신해야 "지도"가 현행 코드와 일치합니다. Understand Anything은 세 가지 갱신 방식을 제공합니다.

### 1) 증분 업데이트 (기본값)

`/understand`를 **다시 실행**하기만 하면 됩니다. 기존 그래프와 메타데이터(`.ua/meta.json`의 커밋 해시)를 비교해 **변경된 파일만** 재분석합니다.

> **Kiro에게 시킬 프롬프트**
> ```
> /understand
> ```

- 내부적으로 `git diff <lastCommitHash>..HEAD --name-only`로 바뀐 파일을 추립니다.
- 바뀐 파일의 노드·엣지만 다시 만들고 나머지는 재사용 → **토큰·시간 대폭 절약**.
- 변경이 없으면 "Graph is up to date"로 끝납니다.

> 최초 `/understand`는 전체 코드베이스를 분석해 토큰을 많이 쓰지만, 이후 재실행은 증분이라 훨씬 가볍습니다.

### 2) 전체 재생성 (`--full`)

구조가 크게 바뀌었거나 그래프가 꼬였을 때는 처음부터 다시 만듭니다.

> **Kiro에게 시킬 프롬프트**
> ```
> /understand --full
> ```

### 3) 커밋마다 자동 업데이트 (`--auto-update`)

post-commit 훅을 걸어, **커밋할 때마다 그래프가 자동으로 증분 갱신**되게 합니다. 코드와 그래프가 항상 동기화됩니다.

> **Kiro에게 시킬 프롬프트**
> ```
> /understand --auto-update
> ```

끄려면:

```
/understand --no-auto-update
```

### 다중 모듈에서의 갱신

모듈별 그래프이므로, **바뀐 모듈에서만** 다시 실행하면 됩니다.

```
# 예: module-a 코드만 수정했다면
/understand ./module-a
```

### 갱신 판단 기준

| 상황 | 권장 방식 |
| --- | --- |
| 일부 파일 수정 (일상적 개발) | 증분 (`/understand` 재실행) |
| 대규모 리팩터링·구조 변경 | 전체 재생성 (`--full`) |
| 팀 전체가 항상 최신 그래프 유지 | 자동 업데이트 (`--auto-update`) |
| 증분이 매번 전체로 튐 | `--full`로 fingerprint 베이스라인 초기화 후 다시 증분 |

> **팀 공유 팁**: 그래프는 그냥 JSON이라 **커밋해서 팀과 공유**할 수 있습니다. `.ua/`를 커밋하되 `intermediate/`와 `diff-overlay.json`은 로컬 스크래치이므로 `.gitignore`에 두세요. 커밋된 그래프가 있으면 팀원은 파이프라인을 다시 돌릴 필요 없이 바로 씁니다.

`.gitignore`에 추가할 내용:

```gitignore
# Understand Anything
.ua/.trash-*
.ua/intermediate
.ua/tmp
.ua/diff-overlay.json
.ua/tmp-*
```

## 체크포인트

- [ ] 대상 모듈에 `.ua/knowledge-graph.json`이 생성됐다
- [ ] `/understand-dashboard`로 그래프를 시각적으로 열어봤다
- [ ] (다중 모듈) 여러 모듈에 각각 그래프가 생겼다
- [ ] 코드 변경 후 `/understand` 재실행으로 증분 업데이트하는 법을 안다

## 트러블슈팅

| 증상 | 해결 |
| --- | --- |
| 설치 후 스킬이 안 보임 | Kiro CLI/IDE를 **재시작**. `ls ~/.kiro/skills/`로 심링크 확인 |
| `curl` 설치 스크립트가 사내 정책에 막힘 | 스크립트를 내려받아 내용 검토 후 실행하거나, 진행자에게 사전 설치 요청 |
| Node 버전이 낮음 | Node 18+ 설치 (nvm 사용 권장) |
| 그래프가 비어 있음/부분적 | `/understand --full`로 전체 재생성 |
| 증분 업데이트가 매번 전체 재분석됨 | fingerprint 베이스라인 문제일 수 있음. `--full`로 한 번 재생성해 초기화 |
| 대시보드가 안 열림 | 그래프 최종 검증 실패 시 자동 실행이 스킵됨. 로그의 경고 확인 후 재생성 |
