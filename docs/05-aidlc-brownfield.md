# 5. AI-DLC Brownfield 워크플로우 실행하기

> 예상 시간: 40분 (메인 실습)

## 학습 목표

- AI-DLC(AI-Driven Development Lifecycle)의 단계 구조를 이해한다
- Knowledge Graph를 근거로 Reverse Engineering을 실행한다
- Requirements → Design → Code까지 한 사이클을 진행한다
- 각 단계에서 사용자 승인(approval) 게이트의 역할을 안다

## 개념 — AI-DLC란

AI-DLC는 소프트웨어 개발 라이프사이클을 AI가 주도하되, **단계마다 사람이 승인**하며 진행하는 적응형 워크플로우입니다. 3단계 페이즈로 구성됩니다.

| 페이즈 | 목적 | 주요 단계 |
| --- | --- | --- |
| **INCEPTION** | 무엇을·왜 만드나 | Workspace Detection → **Reverse Engineering(브라운필드)** → Requirements → User Stories → Workflow Planning → Application Design → Units Generation |
| **CONSTRUCTION** | 어떻게 만드나 | (유닛별) Functional Design → NFR → Code Generation → Build & Test |
| **OPERATIONS** | 어떻게 배포·운영하나 | (향후 확장 placeholder) |

> **적응형 원칙**: 모든 단계를 항상 실행하는 게 아니라, 요청의 명확성·기존 코드 상태·복잡도·리스크에 따라 **필요한 단계만** 지능적으로 선택합니다.

### 브라운필드의 핵심 — Reverse Engineering

Greenfield(신규)와 달리 브라운필드는 **기존 코드가 진실의 원천**입니다. 그래서 INCEPTION 초반에 Reverse Engineering 단계가 추가됩니다. 이때 **우리가 만든 Knowledge Graph가 결정적으로 쓰입니다** — AI가 코드를 무작정 읽는 대신, 그래프로 구조를 조망하고 근거를 특정합니다.

## 실습 0 — AI-DLC 에이전트 준비

3장에서 만든 에이전트(`aidlc-main`)가 워크플로우 규칙(steering)과 그래프 스킬을 모두 갖고 있어야 합니다.

```json
{
 "name": "aidlc-main",
 "prompt": "file://./prompts/aidlc-main.md",
 "resources": [
 "file://.kiro/steering/aws-aidlc-rules/core-workflow.md",
 "file://.kiro/steering/kg-search-rules.md",
 "skill://.kiro/skills/*/SKILL.md"
 ]
}
```

- `core-workflow.md` — AI-DLC 단계·승인 게이트를 정의하는 워크플로우 규칙
- `kg-search-rules.md` — "코드 파악 시 그래프 먼저" 규칙 (2·3장 결과물)
- 스킬 글롭 — `kg-search`/`kg-explain` 자동 포함

> 에이전트 프롬프트(`aidlc-main.md`)에 "기존 코드 파악 시 모듈 그래프를 먼저 검색하라"를 명시해 두면, Reverse Engineering이 그래프 기반으로 흐릅니다.

## 실습 1 — 워크플로우 시작 & Reverse Engineering

에이전트로 세션을 열고 개발 의도를 말합니다.

> **Kiro에게 시킬 프롬프트**
> ```
> 이 레거시 시스템에 "가입 해지 시 위약금 자동 계산" 기능을 추가하고 싶어.
> docs/ 폴더에 기존 개발 및 운영 관련 문서를 넣어두었으니 reverse engineering 시 참고해.
> AI-DLC 워크플로우로 진행해줘.
> ```

기대 흐름:
1. **Workspace Detection** — 기존 코드를 스캔해 브라운필드로 판정
2. **Reverse Engineering** — 필요 시 관련 모듈의 그래프를 검색(`kg-search`)해 다음을 산출
 - 비즈니스 개요 (해당 도메인이 하는 일)
 - 아키텍처·컴포넌트 인벤토리
 - 관련 컴포넌트 간 상호작용 다이어그램
 - 기술 스택·의존성

> **승인 게이트**: Reverse Engineering 산출물을 제시한 뒤 **사용자 확인 전까지 다음으로 넘어가지 않습니다.** 산출물이 실제 코드와 맞는지 검토하세요.

> **스크린샷 자리** — Reverse Engineering 산출물 + 승인 게이트 메시지
> <!-- ![Reverse Engineering 산출물](../assets/05-reverse-engineering.png) -->

## 실습 2 — Requirements & Workflow Planning

승인하면 요구사항 분석으로 넘어갑니다.

> **Kiro에게 시킬 프롬프트 (승인 예시)**
> ```
> 리버스 엔지니어링 결과 확인했어. 정확해. 요구사항 분석으로 진행해줘.
> ```

AI는 요청의 복잡도에 따라 요구사항 깊이(minimal/standard/comprehensive)를 정하고, 필요하면 명확화 질문을 합니다. 이어서 **Workflow Planning**에서 앞으로 어떤 단계를 실행할지 계획을 제시합니다.

> 이 단계에서 4장의 **정책 문서(knowledge)** 가 위력을 발휘합니다. "위약금 계산 규칙"을 정책서에서 확인해 요구사항의 근거로 삼게 하세요.
>
> ```
> 위약금 계산 규칙은 lep-policies 지식베이스의 해지 정책을 근거로 해줘.
> ```

## 실습 3 — Application Design

새 컴포넌트·메서드가 필요하면 설계 단계가 실행됩니다. 여기서도 그래프가 쓰입니다 — 기존 서비스의 인터페이스·의존 관계를 `kg-explain`으로 확인해, 신규 코드가 기존 패턴과 일관되게 설계되도록 합니다.

> **Kiro에게 시킬 프롬프트**
> ```
> 기존 해지 처리 서비스의 구조를 kg-explain으로 확인하고,
> 위약금 계산 로직을 어디에 어떻게 붙일지 설계해줘.
> ```

## 실습 4 — Code Generation & Build/Test

CONSTRUCTION 페이즈에서 유닛별로 코드를 생성합니다. Code Generation은 두 파트로 진행됩니다.

1. **Planning** — 상세 생성 계획(체크박스)을 제시하고 승인받음
2. **Generation** — 승인된 계획대로 코드·테스트 생성

> **Kiro에게 시킬 프롬프트**
> ```
> 설계 승인할게. 코드 생성 계획을 먼저 보여주고, 승인하면 구현해줘.
> ```

각 단계 완료 시 **"변경 요청 / 다음 단계 진행"** 2지선다 승인 메시지가 뜹니다. 모든 유닛이 끝나면 Build & Test 지침이 생성됩니다.

> **원칙**: 애플리케이션 코드는 워크스페이스 루트에, 문서 산출물은 `aidlc-docs/`에 저장됩니다. 모든 사용자 입력과 승인은 `aidlc-docs/audit.md`에 기록됩니다.

## 전체 흐름 요약

```
[의도 입력]
 ↓
 Workspace Detection ──→ 브라운필드 판정
 ↓
 Reverse Engineering ──→ [kg-search로 그래프 조망] ──→ 승인
 ↓
 Requirements ──→ [knowledge로 정책 근거] ──→ 승인
 ↓
 Workflow Planning ──→ 승인
 ↓
 Application Design ──→ [kg-explain으로 기존 구조 확인] ──→ 승인
 ↓
 Code Generation (계획→생성) ──→ 승인
 ↓
 Build & Test
```

## 체크포인트

- [ ] AI-DLC 에이전트가 core-workflow + kg 스킬을 모두 로드한다
- [ ] Reverse Engineering이 그래프(`kg-search`)를 근거로 실행됐다
- [ ] 각 단계에서 승인 게이트가 동작했다 (자동으로 넘어가지 않음)
- [ ] 정책 문서(knowledge)를 요구사항 근거로 사용했다
- [ ] Application Design에서 `kg-explain`으로 기존 구조를 확인했다
- [ ] 코드가 생성되고 `aidlc-docs/`에 산출물·audit이 기록됐다

## 트러블슈팅

| 증상 | 해결 |
| --- | --- |
| 워크플로우 규칙이 무시됨 | `core-workflow.md`가 에이전트 `resources`에 `file://`로 있는지 확인 |
| Reverse Engineering이 그래프를 안 씀 | `kg-search-rules.md` steering + 프롬프트의 "그래프 먼저" 지시 확인 |
| 승인 없이 단계가 진행됨 | 승인 게이트 규칙 강조. 프롬프트에 "각 단계 승인 후 진행" 재확인 |
| 그래프 산출물이 실제 코드와 다름 | 그래프가 오래됨. 2장의 `--full`로 재생성 후 다시 실행 |
| 코드가 aidlc-docs/에 생성됨 | 규칙 위반. 애플리케이션 코드는 워크스페이스 루트, 문서만 aidlc-docs/ |
| 대상 모듈 그래프 없음 | Reverse Engineering 전에 해당 모듈 `/understand` 실행 |
