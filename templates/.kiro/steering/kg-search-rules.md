# 기존 코드 파악 규칙 (Knowledge Graph 우선)

각 모듈 폴더 하위에는 Understand Anything이 생성한 knowledge graph가
`<module>/.ua/knowledge-graph.json` 에 있다. 기존 모듈 소스코드를 이해·탐색하는
작업에서는 다음을 지킨다.

## 규칙

1. 기존 코드를 봐야 하는 작업("기존 코드", "이 모듈이 어떻게 동작", "어디서 처리",
   "호출 관계", "이 기능 구현 찾기" 등)이면, 무작정 grep/read로 파일을 뒤지기 전에
   **먼저 해당 모듈의 knowledge graph를 검색**한다. `kg-search` 스킬 절차를 따른다.

2. 대상 모듈은 작업 내용으로 판단한다. (프로젝트에 맞게 매핑을 수정하세요)
   - 백엔드 API / Controller / 엔드포인트 → `<module-a>`
   - 비즈니스 로직 / Service / 도메인 → `<module-b>`
   - 인증 / 암호화 / 메시징 / 공통 → `<module-c>`
   - 프론트 / 화면 → `<module-d>`

3. 그래프 검색 시 파일 전체를 컨텍스트에 올리지 말고, `grep`으로 노드의
   `name`/`summary`/`tags`와 `edges` 관계를 좁혀 찾은 뒤, 지목된 `filePath`의 실제
   소스만 read 한다. 그래프는 지도, 소스가 최종 근거다.

4. 그래프의 name/summary/tags는 **영어**로 생성돼 있다. 한국어 자연어를 그대로 grep하지
   말고, 개념어를 영어·동의어로 확장해 검색한다(예: 인증 → `auth|authentication|jwt|login|token`).

5. 해당 모듈의 `.ua/knowledge-graph.json` 이 아직 없으면 그 사실을 알리고 grep/read
   직접 탐색으로 fallback 한다.

6. 전역 `understand` 스킬은 그래프를 **생성**하는 용도이므로 코드 검색에는 쓰지 않는다.
   검색/이해는 아래 라우팅 규칙에 따라 `kg-search` 또는 `kg-explain`을 쓴다.

## kg-search vs kg-explain 라우팅 (단일 기준)

> **대상(파일/함수)이 이미 특정돼 있는가?**

- **아니오 — 아직 "무엇을/어디를" 찾는 중** → **`kg-search`** (찾기/개괄).
- **예 — 특정 파일/함수 하나를 깊게 봐야 함** → **`kg-explain`** (심층 해설).

일반 흐름: 먼저 `kg-search`로 대상을 특정 → 깊게 파야 하면 `kg-explain`으로 이어간다.
