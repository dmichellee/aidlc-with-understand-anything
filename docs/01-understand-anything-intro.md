# 1. Understand Anything 소개

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

> `.understand-anything/` 디렉토리가 이미 있으면 레거시 경로로 그걸 쓰고, 없으면 새 경로 `.ua/`를 씁니다.

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

## 그래프 vs grep — 왜 지도가 필요한가

레거시에서 "인증이 어디서 처리되지?"를 찾는다고 합시다.

- **grep만 쓰면**: `grep -r "auth" .` → 수천 줄. 어디부터 봐야 할지 모름.
- **그래프를 쓰면**: 그래프에서 `auth|authentication|jwt` 로 노드를 좁힘 → `JwtAuthenticationProvider` 같은 핵심 클래스 노드 특정 → 그 노드의 엣지로 "무엇이 이걸 호출하는지" 파악 → 지목된 `filePath`만 열어 확증.

> 그래프는 **지도**, 소스코드는 **최종 근거**입니다. 이 워크샵 내내 반복되는 원칙입니다.

> **스크린샷 자리** — 대시보드에서 노드·엣지가 보이는 전체 그래프 (그래프 구조 감 잡기용)
> <!-- ![Knowledge Graph 전체 구조](../assets/01-graph-structure.png) -->

## 실습 — 그래프 구조 눈으로 확인하기

아직 그래프를 생성하지 않았다면 이 실습은 2장 이후 다시 봐도 됩니다. 이미 `.ua/knowledge-graph.json`이 있는 모듈이 있다면, 전체를 열지 말고 **구조만** 확인해 봅니다.

```bash
# 그래프에 어떤 노드 타입이 몇 개씩 있는지 (파일을 통째로 읽지 않고 집계)
grep -o '"type": *"[a-z_]*"' <module>/.ua/knowledge-graph.json | sort | uniq -c | sort -rn
```

예시 출력:

```
 499 "type": "contains"
 365 "type": "function"
 221 "type": "exports"
 155 "type": "file"
 133 "type": "class"
 122 "type": "imports"
 14 "type": "calls"
```

> 이렇게 "지도에 무엇이 얼마나 있는지"를 먼저 파악하면, 이후 검색 전략을 세우기 쉽습니다.

## 체크포인트

- [ ] Understand Anything의 결과물이 `.ua/knowledge-graph.json`이라는 것을 안다
- [ ] nodes / edges / layers / tour의 역할을 설명할 수 있다
- [ ] "그래프로 좁히고 소스로 확증한다"는 원칙을 이해했다

## 트러블슈팅

| 증상 | 해결 |
| --- | --- |
| `.ua/` 폴더가 없음 | 아직 그래프를 생성하지 않은 것. 2장에서 생성한다 |
| 노드는 있는데 엣지가 거의 없음 | 분석이 부분적으로 실패했을 수 있음. 2장의 `--full` 재생성 참고 |
| 그래프가 영어로 되어 있음 | 기본 생성 언어가 영어. 검색 시 한국어 → 영어 키워드 변환 필요 (3장에서 다룸) |
