# Code Knowledge Graph로 Brownfield를 AI-DLC로 개발하기

레거시 시스템(Brownfield)을 **Code Knowledge Graph**로 지도화하고, 그 지도를 **Kiro**에 물려 **AI-DLC(AI-Driven Development Lifecycle)** 워크플로우로 안전하게 변경·확장하는 핸즈온 워크샵입니다.

> "코드는 있는데 오너십은 없다." 외주로 개발·운영되어 내부 지식이 유실된 시스템을, AI가 스스로 탐색하고 이해하게 만들어 다시 우리 손으로 개발하는 여정입니다.

## 무엇을 배우나요

- **Understand Anything** — 코드베이스를 분석해 노드·엣지·레이어로 이루어진 interactive knowledge graph를 생성하기
- **Kiro 연동** — Agent · Skill · Steering을 설정해 Kiro가 그래프를 "먼저 검색"하고 근거 기반으로 답하게 만들기
- **문서 통합** — 운영 문서·개발 정책서를 그래프·컨텍스트에 추가해 코드 밖 지식까지 활용하기
- **AI-DLC Brownfield** — Reverse Engineering → Requirements → Design → Code까지 적응형 워크플로우 실행하기

## 다루는 결과물

이 워크샵은 실제 레거시 리포(예: 다중 모듈 Spring/JSP 시스템)를 소재로 합니다. 끝내면 다음을 갖추게 됩니다.

- 모듈별 `.ua/knowledge-graph.json` (Code Knowledge Graph)
- 그래프를 검색/해설하는 커스텀 스킬 (`kg-search`, `kg-explain`)
- 그래프를 우선 참조하도록 유도하는 steering 규칙
- AI-DLC 워크플로우를 실행하는 커스텀 에이전트 (`aidlc-main`)

## 대상 / 사전 준비

- **대상**: 레거시/브라운필드 시스템을 맡았거나, AI 에이전트로 대규모 코드베이스를 이해·개발하려는 개발자
- **사전 준비물**
 - 터미널 (macOS / Linux / Windows Terminal·WSL)
 - **Kiro CLI** 설치 + 로그인
 - **Node.js ≥ 22, pnpm ≥ 10** (Understand Anything 실행에 필요)
 - 분석 대상 코드베이스 (git 저장소 권장)
- **소요 시간**: 약 2.5시간

## 진행 방법

좌측 사이드바를 따라 **0장부터 순서대로** 진행하세요. 각 실습 챕터는 다음 구조를 따릅니다.

> 학습 목표 → 개념 → 단계별 실습 → 체크포인트 → 트러블슈팅

## 목차

**본 과정**

0. [워크샵 소개](docs/00-intro.md)
1. [Understand Anything 소개](docs/01-understand-anything-intro.md)
2. [Interactive Knowledge Graph 만들기 (설치 포함)](docs/02-build-knowledge-graph.md)
3. [Kiro가 Knowledge Graph를 활용하게 하기](docs/03-kiro-integration.md)
4. [운영·정책 문서 추가하기](docs/04-add-docs.md)
5. [AI-DLC Brownfield 워크플로우 실행하기](docs/05-aidlc-brownfield.md)

**마무리**

6. [베스트 프랙티스 · 트러블슈팅 · Q&A](docs/06-wrap-up.md)

> **Note**
> 명령어/설정은 [Kiro 공식 문서](https://kiro.dev/docs/)와 [Understand Anything](https://github.com/Egonex-AI/Understand-Anything)을 기준으로 합니다. 버전에 따라 일부 명령이 다를 수 있습니다.
