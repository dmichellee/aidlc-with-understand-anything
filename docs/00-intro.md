# 0. 워크샵 소개

> 예상 시간: 5분

## 이 워크샵에서 하는 일

기존 시스템을 넘겨받았는데 문서도, 원 개발자도 없다면? 코드는 남아 있지만 **"왜 이렇게 짜였는지"에 대한 지식(오너십)은 유실**된 상태입니다. 이런 시스템을 **Brownfield(브라운필드)** 라고 부릅니다.

이 워크샵은 브라운필드를 다루는 현실적인 전략을 실습합니다.

1. **지도를 만든다** — Understand Anything으로 코드베이스를 분석해 Code Knowledge Graph를 생성
2. **AI가 지도를 읽게 한다** — Kiro에 Agent·Skill·Steering을 붙여, 무작정 파일을 뒤지는 대신 그래프를 먼저 검색하게 함
3. **코드 밖 지식을 더한다** — 운영 문서·정책서를 컨텍스트로 통합
4. **안전하게 개발한다** — AI-DLC 워크플로우로 Reverse Engineering부터 코드 생성까지 단계적으로 진행

> 핵심 철학: **"grep으로 헤매지 말고, 지도(그래프)로 좁힌 뒤 소스로 확증한다."** AI가 코드베이스를 이해하는 속도와 정확도를 동시에 끌어올리는 것이 목표입니다.

## 왜 Knowledge Graph인가

대규모 코드 베이스에 AI 에이전트를 그냥 붙이면 두 가지 문제가 생깁니다.

| 문제 | Knowledge Graph가 해결하는 방식 |
| --- | --- |
| 컨텍스트 폭발 — 파일이 수천 개라 전부 못 읽음 | 노드·엣지로 압축된 "지도"에서 관련 부분만 grep으로 좁힘 |
| 환각 — 없는 함수/관계를 지어냄 | 노드의 `filePath`를 근거로 실제 소스를 열어 확증 |
| 관계 파악 실패 — 호출 체인을 놓침 | `imports`/`calls`/`depends_on` 엣지를 따라 1-hop 추적 |

## 학습 목표

- Code Knowledge Graph의 구조(nodes/edges/layers/tour)를 이해한다
- 코드베이스에서 실제 그래프를 생성한다
- Kiro가 그래프를 우선 활용하도록 Skill·Steering·Agent를 구성한다
- AI-DLC 브라운필드 워크플로우를 한 사이클 실행한다

## 워크샵 흐름 (Agenda)

| 챕터 | 내용 | 시간 |
| --- | --- | --- |
| 1 | Understand Anything 소개 및 설치 | 15분 |
| 2 | Interactive Knowledge Graph 만들기 | 30분 |
| 3 | Kiro가 Knowledge Graph를 활용하게 하기 | 40분 |
| 4 | 운영·정책 문서 추가하기 | 20분 |
| 5 | **AI-DLC Brownfield 워크플로우 실행 (메인 실습)** | 40분 |
| 6 | 마무리 · 베스트 프랙티스 · Q&A | 10분 |

## 사전 준비 체크리스트

- [ ] **터미널** — macOS/Linux 기본 터미널, Windows는 Windows Terminal 또는 WSL(Ubuntu)
- [ ] **Kiro CLI** — 설치 완료 후 `kiro-cli chat`로 로그인까지 확인
- [ ] **Node.js ≥ 18** — `node -v`로 확인 (Understand Anything 실행에 필요)
- [ ] **분석 대상 코드베이스** — git 저장소 형태 권장 (없으면 진행자가 제공하는 샘플 리포 사용)
- [ ] **인터넷 연결** — 설치·로그인·AI 응답에 필요

> 이 워크샵의 예제는 다중 모듈로 구성된 코드 리포(Spring 백엔드 + JSP 프론트 등)를 가정합니다. 여러분의 실제 프로젝트로 진행해도 무방합니다.

## 용어 미리보기

| 용어 | 뜻 |
| --- | --- |
| **Brownfield** | 이미 존재하는 코드/시스템 위에서 하는 개발 (반대말: Greenfield) |
| **Knowledge Graph** | 코드의 파일·함수·클래스를 노드로, 관계를 엣지로 표현한 지도 |
| **Understand Anything** | 코드베이스를 분석해 위 그래프를 생성하는 도구 |
| **Skill / Steering / Agent** | Kiro의 확장 요소 — 각각 온디맨드 절차 / 상시 규칙 / 전용 실행자 |
| **AI-DLC** | AI가 주도하는 개발 라이프사이클 (Inception → Construction → Operations) |
