# 스크린샷 에셋 목록 (Screenshot Manifest)

이 폴더에 아래 파일명으로 스크린샷을 넣으면, 각 문서의 placeholder 주석(`<!-- ![...] -->`)만 풀어서 바로 표시할 수 있습니다.

문서에서 placeholder는 다음 형태로 들어가 있습니다.

```
> 📸 **스크린샷 자리** — (무엇을 담을지 설명)
> <!-- ![대체텍스트](../assets/파일명.png) -->
```

이미지를 이 폴더에 넣은 뒤, 해당 줄의 `<!-- ... -->` 주석 기호를 제거하면 렌더링됩니다.

## 필요한 스크린샷

| # | 파일명 | 넣을 문서 | 위치 / 담을 내용 | 우선순위 |
| --- | --- | --- | --- | --- |
| 1 | `01-graph-structure.png` | docs/01-understand-anything-intro.md | 대시보드에서 노드·엣지가 보이는 전체 그래프 (그래프 구조 설명용) | 선택 |
| 2 | `02-understand-progress.png` | docs/02-build-knowledge-graph.md | `/understand` 실행 중 `[Phase N/7]` 진행 로그 화면 | 권장 |
| 3 | `02-dashboard-overview.png` | docs/02-build-knowledge-graph.md | `/understand-dashboard`로 열린 인터랙티브 그래프 전경 | **필수** |
| 4 | `02-dashboard-layers.png` | docs/02-build-knowledge-graph.md | 레이어(계층)별 색상 구분이 보이는 대시보드 | 선택 |
| 5 | `03-agent-validate.png` | docs/03-kiro-integration.md | `kiro-cli agent validate` 통과 결과 | 선택 |
| 6 | `03-kg-search-in-action.png` | docs/03-kiro-integration.md | Kiro가 kg-search로 그래프를 grep하고 근거를 제시하는 대화 | **필수** |
| 7 | `04-knowledge-search.png` | docs/04-add-docs.md | `knowledge` 도구로 정책 문서를 의미 검색한 결과 | 선택 |
| 8 | `05-reverse-engineering.png` | docs/05-aidlc-brownfield.md | Reverse Engineering 산출물 + 승인 게이트 메시지 | 권장 |
| 9 | `05-approval-gate.png` | docs/05-aidlc-brownfield.md | 단계 완료 시 "변경 요청 / 다음 단계 진행" 2지선다 메시지 | 선택 |

## 이미지 가이드

- 포맷: PNG (권장), 가로 1200~1600px 정도면 GitBook에서 선명합니다.
- 민감정보(사내 경로·토큰·실제 고객 데이터)는 마스킹하세요.
- 터미널 캡처는 폰트가 읽히도록 충분히 확대해 캡처하세요.
