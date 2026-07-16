# 준비된 파일 템플릿 (Option B)

3장의 스킬·steering을 **프롬프트로 생성하지 않고** 이 템플릿을 그대로 복사해 쓰는 방법입니다.

## 포함된 파일

```
templates/.kiro/
├── skills/
│   ├── kg-search/SKILL.md      # 그래프 검색 스킬
│   └── kg-explain/SKILL.md     # 컴포넌트 심층 해설 스킬
└── steering/
    └── kg-search-rules.md      # "그래프 먼저" + 라우팅 규칙
```

## 사용법

프로젝트 루트에서 다음을 실행해 `.kiro/`로 복사합니다.

```bash
# 워크샵 templates/.kiro 내용을 프로젝트 .kiro 로 복사
cp -R /path/to/workshop/templates/.kiro/. ./.kiro/
```

또는 파일별로 직접 만들고 내용을 붙여넣어도 됩니다.

## 복사 후 반드시 할 일

1. **모듈 매핑 수정** — `kg-search/SKILL.md`와 `kg-search-rules.md`의
   `<module-a>`, `<module-b>` … 자리표시자를 여러분 리포의 실제 모듈명으로 바꾸세요.
2. **에이전트 연결** — 에이전트의 `resources`에 아래를 추가 (3장 실습 4 참고):
   ```json
   "resources": [
     "file://.kiro/steering/kg-search-rules.md",
     "skill://.kiro/skills/*/SKILL.md"
   ]
   ```
3. **검증** — `kiro-cli agent validate --path .kiro/agents/<agent>.json`

> 💡 언어 확장 키워드(인증→auth 등)도 여러분 도메인 용어에 맞게 보강하면 검색 적중률이 오릅니다.
