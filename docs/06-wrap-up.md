# 6. 베스트 프랙티스 · 트러블슈팅 · Q&A

> 예상 시간: 15분

## 정리 — 우리가 만든 것

이 워크샵을 마치면 브라운필드를 다루는 완결된 파이프라인을 갖추게 됩니다.

```
코드베이스
 │ /understand
 ▼
Code Knowledge Graph (.ua/knowledge-graph.json) ← 2장
 │ kg-search / kg-explain / kg-search-rules
 ▼
Kiro가 그래프를 우선 검색하고 소스로 확증 ← 3장
 │ + 운영·정책 문서 (file:// / knowledge)
 ▼
코드 + 문서를 함께 근거로 ← 4장
 │ graph-aidlc-agent 에이전트 + core-workflow
 ▼
AI-DLC로 안전하게 변경·확장 ← 5장
```

## 베스트 프랙티스

### 그래프

- **모듈별로 나눠 생성한다** — 검색 정확도↑, 증분 업데이트↑
- **언어를 고정한다** — 영어 그래프 + 검색 시 키워드 확장, 또는 `--language ko` 일관 사용. 섞지 않기
- **주기적으로 재생성한다** — 코드가 바뀌면 그래프도 낡음. 큰 변경 후 `--full`
- **그래프는 지도, 소스가 근거** — 그래프 요약만 믿지 말고 항상 `filePath`로 확증

### 스킬 / Steering

- **description = 라우팅** — "언제 쓰고, 언제 다른 스킬을 쓸지"를 명확히
- **판단 기준은 한 곳(steering)에** — 중복 규칙은 서로 어긋나기 쉬움
- **커스텀 에이전트는 steering 자동 로드 안 함** — `file://`로 명시
- **스킬은 글롭으로** — `skill://.kiro/skills/*/SKILL.md` 하나로 신규 스킬 자동 포함

### 문서 / 컨텍스트

- **핵심만 `file://`, 대량은 `knowledge`** — 컨텍스트 예산 관리
- **코드와 문서의 차이를 기록** — 코드는 현행, 문서는 의도. 그 gap이 곧 인사이트

### AI-DLC

- **승인 게이트를 건너뛰지 말 것** — 각 단계 산출물을 실제 코드와 대조
- **정책을 근거로** — 요구사항·설계 결정에 문서 근거를 붙이면 환각이 준다
- **작게 반복** — 한 기능을 한 사이클로. 거대한 요청은 쪼개기

## 통합 트러블슈팅

| 영역 | 증상 | 해결 |
| --- | --- | --- |
| 그래프 | 한국어 질의 0건 | 그래프가 영어 → 키워드 영어 확장 (`인증→auth\|jwt\|login`) |
| 그래프 | 관계가 안 나옴 | 엣지 부족 → `--full` 재생성 |
| 스킬 | 안 불림 | frontmatter 확인, description 매칭 확인 |
| 스킬 | 두 스킬 혼동 | 상호배타 description + steering 라우팅 규칙 |
| Steering | 규칙 무시 | 에이전트 `resources`에 `file://` 명시 |
| 문서 | 컨텍스트 폭발 | `file://` → `knowledge`로 이전 |
| AI-DLC | 단계 자동 진행 | 승인 게이트 규칙 재확인 |
| AI-DLC | 그래프 미사용 | `kg-search-rules` + 프롬프트 지시 확인 |

## 자주 묻는 질문 (Q&A)

**Q. grep 기반 검색인데 자연어 질의가 되나요?**
A. 됩니다. 단 스킬이 자연어에서 개념어를 뽑아 **영어 키워드로 확장**한 뒤 grep합니다. 문장을 그대로 grep하지 않습니다.

**Q. `knowledge`(임베딩)와 `kg-search`(grep)는 뭐가 다른가요?**
A. `knowledge`는 의미 검색(개념 매칭), `kg-search`는 코드 구조·관계 검색(정확한 위치·호출 체인). 경쟁이 아니라 상호보완이며, "의미로 후보 좁히기 → 그래프로 구조 파악"으로 함께 씁니다.

**Q. `/understand`와 `kg-search`의 차이는?**
A. `/understand`는 그래프를 **생성**하고, `kg-search`는 생성된 그래프를 **검색**합니다. 코드 파악에는 절대 `/understand`를 쓰지 마세요.

**Q. 그래프가 없는 모듈은요?**
A. 스킬이 자동으로 grep/read 직접 탐색으로 fallback합니다. 다만 정확도를 위해 `/understand`로 미리 생성하는 것이 좋습니다.

**Q. AI-DLC에서 코드가 이상한 곳에 생겨요.**
A. 애플리케이션 코드는 워크스페이스 루트, 문서 산출물만 `aidlc-docs/`입니다. 규칙(core-workflow) 로드 여부를 확인하세요.

## 다음 단계

- 남은 모듈 전체에 그래프 생성 → 리포 전역 검색 커버리지 확보
- 자주 하는 조사 패턴을 스킬로 추가 (예: `kg-callchain` — N-hop 호출 체인 추적)
- 정책서 전체를 `knowledge`로 색인해 요구사항 근거 자동화
- CI에 그래프 증분 업데이트 훅 연결 (커밋 시 자동 갱신)

## 참고 자료

- [Kiro 공식 문서](https://kiro.dev/docs/)
- [Understand Anything](https://github.com/Egonex-AI/Understand-Anything)
- 이 워크샵에서 만든 산출물: `.kiro/skills/kg-search`, `.kiro/skills/kg-explain`, `.kiro/steering/kg-search-rules.md`, `.kiro/agents/graph-aidlc-agent.json`

> 수고하셨습니다! 이제 대규모 코드를 "지도 없이 헤매는 곳"이 아니라 "AI가 근거를 짚어 개발하는 곳"으로 바꿀 수 있습니다.
