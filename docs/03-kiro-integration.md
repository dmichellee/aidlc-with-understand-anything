# 3. Kiro가 Knowledge Graph를 활용하게 하기

> ⏱️ 예상 시간: 40분

## 🎯 학습 목표

- 그래프를 검색하는 커스텀 스킬 `kg-search`를 만든다
- 특정 컴포넌트를 심층 해설하는 `kg-explain`을 만든다
- Kiro가 "코드 파악 시 그래프를 먼저 검색"하도록 steering 규칙을 만든다
- 두 스킬의 목적이 혼동되지 않도록 라우팅을 설계한다
- 커스텀 에이전트에 스킬·steering을 연결한다

## 📖 개념 — 왜 스킬을 따로 만드는가

2장에서 설치한 `/understand-chat`은 훌륭하지만 두 가지 한계가 있습니다.

1. **단일 프로젝트 루트 기준** — 리포 루트 한 곳의 `.ua/`만 봅니다. 우리처럼 **모듈별 그래프**가 흩어져 있으면 어느 모듈을 볼지 고르지 못합니다.
2. **생성 vs 검색 혼동** — `/understand`는 생성 전용인데, 코드 파악 작업에서 잘못 호출될 수 있습니다.

그래서 프로젝트 로컬에 **모듈 선택 로직을 가진 검색 스킬**을 직접 만듭니다.

> 📌 **스킬은 어떻게 호출되나?** Kiro는 스킬의 `description`을 보고 현재 작업에 맞는 스킬을 온디맨드로 부릅니다. 따라서 `description`을 정확히 쓰는 것이 곧 "라우팅 설계"입니다.

## 두 가지 방법 — 프롬프트로 생성(A) vs 준비된 파일 사용(B)

이 장의 스킬·steering은 두 가지 방법으로 만들 수 있습니다. 편한 쪽을 고르세요.

| | 옵션 A — 프롬프트로 생성 | 옵션 B — 준비된 파일 사용 |
| --- | --- | --- |
| 방법 | Kiro에게 요구사항을 설명해 파일을 생성 | 워크샵이 제공하는 템플릿을 복사해 수정 |
| 장점 | 생성 과정을 이해하며 학습 | 빠르고 일관됨. 실습 시간 절약 |
| 적합 | 스킬 작성 원리를 익히고 싶을 때 | 곧바로 동작하는 결과가 필요할 때 |

> 아래 **실습 1~3은 옵션 A**입니다. 옵션 B로 바로 가려면 이 섹션 끝의 **"⌨️ 옵션 B — 준비된 파일로 한 번에 설치"** 로 건너뛰세요. 어느 쪽이든 이후 **실습 4(에이전트 연결)** 는 동일하게 필요합니다.

### ⌨️ 옵션 B — 준비된 파일로 한 번에 설치

워크샵에 완성된 템플릿이 `templates/.kiro/` 아래에 들어 있습니다.

```
templates/.kiro/
├── skills/kg-search/SKILL.md
├── skills/kg-explain/SKILL.md
└── steering/kg-search-rules.md
```

프로젝트 루트에서 복사합니다.

```bash
cp -R /path/to/workshop/templates/.kiro/. ./.kiro/
```

복사 후 **반드시** 다음을 하세요.

1. `kg-search/SKILL.md`와 `kg-search-rules.md`의 `<module-a>`, `<module-b>` … 자리표시자를 **여러분 리포의 실제 모듈명**으로 교체
2. 도메인 용어에 맞게 키워드 확장 목록(인증→auth 등) 보강
3. 실습 4로 넘어가 에이전트에 연결

> 💡 자세한 사용법은 `templates/README.md`를 참고하세요. 옵션 B를 골랐다면 실습 1~3은 건너뛰고 **실습 4**로 가세요.

---

## ⌨️ 실습 1 — `kg-search` 스킬 만들기 (옵션 A)

`.kiro/skills/kg-search/SKILL.md`를 만듭니다. 스킬 파일은 반드시 YAML frontmatter(`name`, `description`)로 시작해야 합니다.

> 💬 **Kiro에게 시킬 프롬프트**
> ```
> .kiro/skills/kg-search/SKILL.md 스킬을 만들어줘. 목적은:
> - 기존 코드 파악 시 <module>/.ua/knowledge-graph.json 을 먼저 grep으로 검색
> - $ARGUMENTS 에서 모듈을 파싱하거나 질의로 모듈을 추론
> - 그래프의 name/summary/tags는 영어이므로, 한국어 질의를 영어 키워드로 확장해 검색
> - 매칭 노드 → edges 1-hop 추적 → layers 확인 → 지목된 filePath만 read
> - description 끝에 "특정 파일/함수 하나를 심층 해설하는 것이라면 kg-explain을 써라"를 명시
> ```

핵심 frontmatter 예시:

```markdown
---
name: kg-search
description: Use when you need to inspect or understand existing module source code.
  Searches the per-module knowledge graph (<module>/.ua/knowledge-graph.json) BEFORE
  reading raw files. Trigger for "기존 코드", "어디서 처리", "호출 관계", "이 기능 구현 찾아줘".
  대상(파일/함수)이 이미 특정되어 심층 해설하는 것이라면 kg-explain을 써라.
---
```

스킬 본문의 핵심 절차(요약):

1. **모듈 결정** — `$ARGUMENTS` 파싱 또는 질의로 추론
2. **그래프 존재 확인** — 없으면 grep/read로 fallback
3. **project 메타데이터만 읽기** — 전체를 읽지 않음
4. **질의어 준비 (한국어 → 영어 확장)** — 예: 인증 → `auth|authentication|login|token|jwt|sso`
5. **노드 검색** — `grep -i -E "..." <module>/.ua/knowledge-graph.json`
6. **엣지 1-hop 추적** — 매칭 노드 id를 edges에서 grep (상류/하류)
7. **레이어 확인** → 8. **실제 파일 read** → 9. **답변**

> 💡 4번이 핵심입니다. 그래프가 영어라 "인증 모듈 설명"을 그대로 grep하면 0건입니다. 개념어를 영어·동의어로 확장해야 합니다.

## ⌨️ 실습 2 — `kg-explain` 스킬 만들기 (옵션 A)

`kg-search`가 "찾기/개괄"이라면 `kg-explain`은 "**찾은 것 하나를 끝까지 해설**"입니다.

> 💬 **Kiro에게 시킬 프롬프트**
> ```
> .kiro/skills/kg-explain/SKILL.md 를 만들어줘. 목적은:
> - 대상(파일 경로 또는 경로:함수명)이 이미 특정된 상태에서 그 컴포넌트 하나를 심층 해설
> - 역할/내부구조(contains)/외부연결(imports·calls)/데이터흐름/패턴을 설명
> - 반드시 대상 소스 파일을 read 해서 근거로 삼음
> - description 끝에 "아직 어디에 있는지 탐색하는 단계면 kg-search를 써라"를 명시
> - 모듈 매핑·그래프 구조·효율적 읽기 원칙은 kg-search/steering을 참조 (중복 최소화)
> ```

## ⌨️ 실습 3 — steering 라우팅 규칙 만들기 (옵션 A)

두 스킬의 목적이 섞이지 않도록, **판단 기준을 한 곳(steering)에** 못박습니다.

> 💬 **Kiro에게 시킬 프롬프트**
> ```
> .kiro/steering/kg-search-rules.md 를 만들어줘. 내용:
> - 기존 코드 파악 시 무작정 grep/read 하지 말고 해당 모듈 그래프를 먼저 검색
> - 모듈 → 역할 매핑 (예: 백엔드 API → module-a, 비즈니스 로직 → module-b)
> - kg-search vs kg-explain 라우팅: "대상이 이미 특정돼 있는가?" 한 질문으로 결정
>   - 아니오(무엇을/어디를 찾는 중) → kg-search
>   - 예(특정 파일/함수 심층) → kg-explain
> - understand(생성용)는 코드 검색에 쓰지 않음
> ```

혼동 방지는 **세 겹**으로 설계합니다.

| 방어선 | 방법 |
| --- | --- |
| 1. description | 두 스킬 모두 "이 경우엔 다른 스킬을 써라"를 명시 (스킬 라우팅의 1차 기준) |
| 2. 스킬 본문 게이트 | 실행 전 "대상이 특정됐나?" 스스로 판단하는 문구 |
| 3. steering 단일 규칙 | 판단 기준의 single source of truth |

## ⌨️ 실습 4 — 커스텀 에이전트에 연결하기

이제 스킬·steering을 에이전트가 실제로 로드하게 합니다. `.kiro/agents/aidlc-main.json` (또는 원하는 에이전트)의 `resources`에 추가합니다.

```json
{
  "name": "aidlc-main",
  "resources": [
    "file://.kiro/steering/kg-search-rules.md",
    "skill://.kiro/skills/*/SKILL.md"
  ]
}
```

- `skill://.kiro/skills/*/SKILL.md` — **와일드카드 글롭**이라 `kg-search`, `kg-explain` 등 새 스킬이 자동 포함됩니다. 스킬을 추가할 때마다 등록할 필요 없습니다.
- **steering은 다릅니다** — 커스텀 에이전트는 steering을 자동 로드하지 않으므로, `kg-search-rules.md`는 `file://`로 **명시적으로** 넣어야 합니다.

> ⚠️ **주의**: 기본적으로 커스텀 에이전트는 default resource(전역/워크스페이스 steering·skill)를 상속받습니다. 하지만 `chat.disableInheritingDefaultResources`가 `true`면 상속이 꺼지므로, 필요한 리소스는 명시적으로 선언하는 것이 안전합니다.

설정 검증:

```bash
kiro-cli agent validate --path .kiro/agents/aidlc-main.json
```

> 📸 **스크린샷 자리** — `kiro-cli agent validate` 통과 결과 (선택)
> <!-- ![agent validate 결과](../assets/03-agent-validate.png) -->

## ⌨️ 실습 5 — 동작 확인

에이전트로 세션을 열고 자연어로 물어봅니다.

> 💬 **Kiro에게 시킬 프롬프트**
> ```
> 인증은 어느 모듈에서 어떻게 처리돼? 관련 코드를 찾아줘.
> ```

기대 동작:
1. steering 규칙에 따라 `kg-search` 스킬이 호출됨
2. "인증" → `auth|authentication|jwt|login|token` 로 확장해 해당 모듈 그래프를 grep
3. 매칭 노드의 엣지를 추적하고 지목된 소스 파일을 열어 근거 제시

> 📸 **스크린샷 자리** — Kiro가 kg-search로 그래프를 grep하고 근거를 제시하는 대화 **(필수)**
> <!-- ![kg-search 동작](../assets/03-kg-search-in-action.png) -->

이어서 특정 대상을 지정하면 `kg-explain`으로 넘어갑니다.

> 💬 **Kiro에게 시킬 프롬프트**
> ```
> 방금 찾은 JwtAuthenticationProvider 클래스를 뜯어서 설명해줘.
> ```

## ✅ 체크포인트

- [ ] `.kiro/skills/kg-search/SKILL.md`가 생성됐고 frontmatter가 올바르다
- [ ] `.kiro/skills/kg-explain/SKILL.md`가 생성됐다
- [ ] `.kiro/steering/kg-search-rules.md`에 라우팅 규칙이 있다
- [ ] 에이전트 `resources`에 steering(명시) + 스킬 글롭이 있다
- [ ] `agent validate`가 통과한다
- [ ] 자연어 질의 시 그래프를 먼저 검색하고 소스로 확증한다

## 🔧 트러블슈팅

| 증상 | 해결 |
| --- | --- |
| 스킬이 호출 안 됨 | `description`이 작업과 매칭되는지 확인. frontmatter 누락 시 스킬로 인식 안 됨 |
| steering 규칙이 반영 안 됨 | 커스텀 에이전트는 steering 자동 로드 안 함 → `resources`에 `file://` 명시 |
| kg-search와 kg-explain이 헷갈려 호출됨 | 두 description의 상호배타 문구 확인, steering 라우팅 규칙 강화 |
| 한국어 질의에 0건 | 그래프가 영어. 스킬 4단계(키워드 확장)가 있는지 확인 |
| 새 스킬이 안 잡힘 | `resources` 글롭이 `skill://.kiro/skills/*/SKILL.md` 형태인지 확인 |
| 그래프 없는 모듈 질의 | fallback 규칙대로 grep/read로 진행됨. 2장에서 해당 모듈 그래프 생성 |
