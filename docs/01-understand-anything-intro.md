# 1. Understand Anything 소개 및 설치

![Understand Anything](../assets/hero.png)

> 예상 시간: 15분

## 학습 목표

- Understand Anything이 무엇을 하는 도구인지 이해한다
- 생성되는 Knowledge Graph의 구조(nodes/edges/layers/tour)를 파악한다
- 그래프가 "왜 grep보다 나은 지도"인지 설명할 수 있다

## 개념

[Understand Anything](https://github.com/Egonex-AI/Understand-Anything)은 코드베이스를 분석해 **interactive knowledge graph**를 생성하는 도구입니다. LLM 기반 분석 파이프라인이 프로젝트를 스캔하고, 파일·함수·클래스와 그 관계를 추출해 하나의 JSON 그래프로 만듭니다.

결과물은 프로젝트 데이터 디렉토리에 저장됩니다.

```
<project>/.ua/knowledge-graph.json ← 그래프 본체
<project>/.ua/meta.json ← 커밋 해시·분석 시각 등 메타데이터
```

> `.understand-anything/` 디렉토리가 이미 있으면 경로로 그걸 쓰고, 없으면 새 경로 `.ua/`를 씁니다.

### 그래프의 구성 요소

| 요소 | 설명 |
| --- | --- |
| **nodes** | 파일·함수·클래스·설정·문서·테이블·엔드포인트 등 (13개 타입) |
| **edges** | 노드 간 관계 — `imports`, `calls`, `contains`, `depends_on`, `configures` 등 (26개 타입) |
| **layers** | 아키텍처 계층 (예: Controller / Service / Domain) — 노드를 계층으로 묶음 |
| **tour** | 신규 합류자를 위한 가이드 투어 (읽어야 할 순서) |

### 노드 구조 예시

각 노드는 이런 형태입니다.

```json
{
 "id": "class:src/main/java/com/example/auth/JwtAuthenticationProvider.java:JwtAuthenticationProvider",
 "type": "class",
 "name": "JwtAuthenticationProvider",
 "filePath": "src/main/java/com/example/auth/JwtAuthenticationProvider.java",
 "summary": "Spring Security AuthenticationProvider that verifies JWT ...",
 "tags": ["security", "authentication", "spring"],
 "complexity": "moderate"
}
```

- `id`의 접두어가 곧 타입입니다: `file:경로`, `function:경로:이름`, `class:경로:이름`, `endpoint:경로:이름`
- `name`(코드 식별자)과 `summary`(의미 요약)가 검색에 가장 유용한 필드입니다.

### 엣지 구조 예시

```json
{ "source": "file:A.java", "target": "file:B.java", "type": "imports", "direction": "outgoing", "weight": 0.7 }
```

`source`가 `target`을 `imports` 한다는 뜻입니다. 이 엣지들을 따라가면 **호출 체인**과 **의존 관계**를 추적할 수 있습니다.

## 그래프 추출 구조 — Tree-sitter + LLM 하이브리드

Understand Anything의 그래프 추출은 순수 LLM이 아닙니다. **정적 분석(Tree-sitter)이 구조적 뼈대를 만들고, LLM이 의미를 채우는** 하이브리드 구조입니다.

### 1) Tree-sitter — 결정론적 파싱 (구조 추출)

소스코드를 concrete syntax tree로 파싱해 **구조적 사실(fact)**을 추출합니다. ([Tree-sitter](https://tree-sitter.github.io/tree-sitter/)는 다양한 언어를 지원하는 범용 파서 프레임워크입니다.)

- import/export 관계, 함수·클래스 정의, 호출 지점(call site), 상속 관계
- scan 단계에서 `importMap`을 미리 구성 → 이후 분석기가 import를 중복 파싱하지 않음
- **같은 입력 → 항상 같은 출력** (재현 가능)
- 증분 업데이트를 위한 fingerprint 기반 변경 감지도 Tree-sitter가 담당

> 즉, 그래프의 **노드**(파일/함수/클래스)와 **엣지**(호출·import·상속 관계)는 LLM이 아니라 Tree-sitter 파서가 뽑아냅니다.

### 2) LLM — 의미 부여 (설명·분류)

Tree-sitter가 뽑은 구조 + 원본 소스코드를 읽고, 파서가 생성할 수 없는 것들을 만듭니다:

- 평이한 자연어 요약 (`summary`)
- 태그·키워드
- 아키텍처 레이어 분류
- 비즈니스 도메인 매핑
- 가이드 투어
- 복잡도 평가

### 왜 이렇게 분리했나

| 관점 | Tree-sitter (구조) | LLM (의미) |
| --- | --- | --- |
| 재현성 | 같은 코드 → 항상 같은 그래프 | 프롬프트·모델에 따라 달라질 수 있음 |
| 비용 | 무료 (로컬 파싱) | 토큰 비용 발생 |
| 정확도 의존 | 파서 정확도 | 모델 능력 |
| 역할 | 뼈대 (무엇이 있고 뭘 호출하는가) | 살 (왜 존재하고 뭘 위한 건가) |

> 대규모 리포에서도 그래프 구조의 정확도는 Tree-sitter 파싱 정확도에 의존하고, LLM 비용은 요약·분류에만 드는 구조입니다.

### 파이프라인 (에이전트 구성)

Understand Anything 실행 시 내부적으로 다음 에이전트들이 순차/병렬로 동작합니다.

| 에이전트 | 역할 |
| --- | --- |
| **project-scanner** | 파일 탐색, 언어·프레임워크 감지 |
| **file-analyzer** | 함수/클래스/import 추출 → 노드·엣지 생성 (Tree-sitter) + 요약 생성 (LLM) |
| **architecture-analyzer** | 아키텍처 레이어 식별·분류 |
| **tour-builder** | 신규 합류자용 가이드 투어 생성 |
| **graph-reviewer** | 그래프 완전성·참조 무결성 검증 (`--review`로 풀 LLM 리뷰) |
| **domain-analyzer** | 비즈니스 도메인·플로우 추출 (`/understand-domain`용) |

- `file-analyzer`는 **병렬 실행** (최대 5개 동시, 배치당 20~30파일)
- 변경된 파일만 재분석하는 **incremental** 방식 지원 (fingerprint 기반)

## 그래프 vs grep — 왜 지도가 필요한가

코드에서 "인증이 어디서 처리되지?"를 찾는다고 합시다.

- **grep만 쓰면**: `grep -r "auth" .` → 수천 줄. 어디부터 봐야 할지 모름.
- **그래프를 쓰면**: 그래프에서 `auth|authentication|jwt` 로 노드를 좁힘 → `JwtAuthenticationProvider` 같은 핵심 클래스 노드 특정 → 그 노드의 엣지로 "무엇이 이걸 호출하는지" 파악 → 지목된 `filePath`만 열어 확증.

> 그래프는 **지도**, 소스코드는 **최종 근거**입니다. 이 워크샵 내내 반복되는 원칙입니다.

> **스크린샷 자리** — 대시보드에서 노드·엣지가 보이는 전체 그래프 (그래프 구조 감 잡기용)
> <!-- ![Knowledge Graph 전체 구조](../assets/01-graph-structure.png) -->

## 실습 — 설치 및 사전 요구사항 확인

Understand Anything은 내부적으로 Node 스크립트를 실행하므로 런타임이 필요합니다.

```bash
# 사전 요구사항 확인
node -v # v18 이상
```

Node.js가 설치되어 있지 않다면 [공식 다운로드 페이지](https://nodejs.org/ko/download)에서 설치하세요.

### Kiro CLI에 Understand Anything 설치하기

Understand Anything은 여러 플랫폼을 지원하며, Kiro는 **원라인 설치 스크립트**로 설치합니다. 터미널에서 다음을 실행하세요.

**macOS / Linux**

```bash
curl -fsSL https://raw.githubusercontent.com/Egonex-AI/Understand-Anything/main/install.sh | bash -s kiro
```

**Windows (PowerShell)** — WSL 사용을 권장하지만, 네이티브로 설치하려면:

```powershell
iwr -useb https://raw.githubusercontent.com/Egonex-AI/Understand-Anything/main/install.ps1 | iex
```

이 스크립트는 저장소를 `~/.understand-anything/repo`에 클론하고, Kiro용 심링크를 만듭니다. 구체적으로:

- 스킬을 `~/.kiro/skills/`에 심링크 (understand, understand-chat, understand-dashboard, understand-explain 등)
- `understand` 에이전트를 `~/.kiro/agents/understand.json`에 생성

> 설치 후 **Kiro CLI(또는 IDE)를 재시작**해야 스킬·에이전트가 로드됩니다.

설치가 끝나면 스킬이 등록됐는지 확인합니다.

```bash
ls ~/.kiro/skills/ | grep understand
```

기대 출력:

```
understand
understand-chat
understand-dashboard
understand-explain
...
```

에이전트가 생성됐는지도 확인:

```bash
ls ~/.kiro/agents/ | grep understand # understand.json
```

> Understand Anything은 전용 `understand` 에이전트도 함께 설치합니다. 그래프 생성만 빠르게 하려면 이 에이전트로 바로 실행할 수 있습니다:
> ```bash
> kiro-cli chat --agent understand "Analyze this project"
> ```
> 단, 이 워크샵은 그래프를 **생성**한 뒤 3장에서 만드는 `graph-aidlc-agent` 에이전트로 **활용**하는 흐름입니다.

### 참고: 업데이트 및 제거

```bash
# 최신 버전으로 업데이트
~/.understand-anything/repo/install.sh --update

# 제거
~/.understand-anything/repo/install.sh --uninstall kiro
```

## 체크포인트

- [ ] Understand Anything의 결과물이 `.ua/knowledge-graph.json`이라는 것을 안다
- [ ] nodes / edges / layers / tour의 역할을 설명할 수 있다
- [ ] "그래프로 좁히고 소스로 확증한다"는 원칙을 이해했다
- [ ] `~/.kiro/skills/`에 understand 계열 스킬이 설치됐다

## 트러블슈팅

| 증상 | 해결 |
| --- | --- |
| `node -v`가 18 미만 | [Node.js 다운로드](https://nodejs.org/ko/download)에서 최신 LTS 설치 |
| `kiro-cli chat`에서 스킬을 인식 못함 | `~/.kiro/agents/understand.json` 존재 여부 확인. 없으면 재설치 |
