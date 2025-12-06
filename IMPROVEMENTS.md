# 프로젝트 개선 분석 리포트

## 🔴 긴급 개선 사항 (Critical)

### 1. 중복 파일 제거
- **문제**: `app/constants.ts`와 `app/constants.tsx`가 동시에 존재
- **영향**: 혼란 및 빌드 오류 가능성
- **해결**: `constants.ts` 삭제 (`.tsx`만 사용)

### 2. 에러 처리 부재
- **문제**: localStorage 접근 및 JSON 파싱 시 try-catch 없음
- **위치**: `app/page.tsx` (31-45줄)
- **영향**: localStorage 비활성화 시 앱 크래시
- **해결**: try-catch 블록 추가

### 3. 타입 안정성 문제
- **문제**: `Window.data`가 `any` 타입
- **위치**: `app/types.ts` (40줄)
- **영향**: 타입 안정성 저하, 런타임 오류 가능성
- **해결**: 제네릭 타입 또는 유니온 타입으로 개선

## 🟡 중요 개선 사항 (High Priority)

### 4. 성능 최적화
- **문제**: 불필요한 리렌더링 발생 가능
- **세부사항**:
  - `page.tsx`의 함수들이 매 렌더마다 재생성
  - `WindowFrame`의 position 상태가 window prop과 중복
  - `Explorer`의 필터링 로직이 매 렌더마다 실행
- **해결**:
  - `useCallback`으로 함수 메모이제이션
  - `useMemo`로 계산된 값 메모이제이션
  - `React.memo`로 컴포넌트 최적화

### 5. 코드 구조 개선
- **문제**: `page.tsx`가 307줄로 과도하게 큼
- **해결**:
  - 커스텀 훅으로 상태 관리 로직 분리 (`useWindowManager`, `useFileSystem`)
  - 컨텍스트 API로 전역 상태 관리 고려
  - 비즈니스 로직을 별도 파일로 분리

### 6. WindowFrame 위치 동기화 문제
- **문제**: 내부 position 상태와 window prop이 불일치
- **위치**: `app/components/WindowFrame.tsx` (26-37줄)
- **영향**: 드래그 후 위치가 원래대로 돌아갈 수 있음
- **해결**: 단일 소스로 통일하거나 명확한 동기화 로직

## 🟢 개선 권장 사항 (Medium Priority)

### 7. 기능 완성도
- **문제**: 일부 기능이 미완성
- **세부사항**:
  - 파일 이름 변경: F2 키 지원 없음
  - 선택 박스: 선택한 파일에 대한 액션 없음
  - 윈도우 리사이즈 기능 없음
  - Explorer에서 파일 삭제 기능 없음
  - 컨텍스트 메뉴의 Properties가 alert만 표시

### 8. 접근성 (A11y)
- **문제**: 키보드 네비게이션 및 스크린 리더 지원 부족
- **해결**:
  - ARIA 속성 추가
  - 키보드 단축키 문서화
  - 포커스 관리 개선

### 9. 사용자 경험
- **문제**: 일부 UX 개선 여지
- **세부사항**:
  - Notepad: initialContent 변경 시 content 업데이트 안됨
  - Browser: 뒤로가기 버튼 기능 없음
  - Explorer: 파일 이름 변경 시 초기값 설정 안됨
  - 로딩 상태 피드백 부족

### 10. 코드 품질
- **문제**: 일부 deprecated API 사용
- **세부사항**:
  - `generateId`에서 `substr` 사용 (deprecated) → `substring` 또는 `slice` 사용
  - 하드코딩된 값들 (윈도우 크기, z-index 등)

### 11. 타입 정의 개선
- **문제**: 일부 타입이 느슨함
- **세부사항**:
  - `createNewFile`의 type 파라미터가 string → 리터럴 타입으로 제한
  - 파일 타입 확장 시 타입 안정성 보장 필요

## 📋 상세 개선 계획

### Phase 1: 긴급 수정 (즉시)
1. ✅ `constants.ts` 삭제
2. ✅ localStorage 에러 처리 추가
3. ✅ Window.data 타입 개선

### Phase 2: 성능 최적화 (1주)
1. useCallback/useMemo 적용
2. React.memo로 컴포넌트 최적화
3. 불필요한 리렌더링 제거

### Phase 3: 코드 리팩토링 (2주)
1. 커스텀 훅 분리
2. 비즈니스 로직 분리
3. 컴포넌트 구조 개선

### Phase 4: 기능 완성 (2주)
1. 파일 이름 변경 (F2 키)
2. 선택 박스 기능 완성
3. 윈도우 리사이즈
4. Explorer 컨텍스트 메뉴 개선

### Phase 5: UX/접근성 개선 (1주)
1. 키보드 단축키 추가
2. ARIA 속성 추가
3. 로딩 상태 개선
4. 에러 메시지 개선

## 🔧 구체적인 코드 개선 예시

### 1. 에러 처리 개선
```typescript
// Before
const [files, setFiles] = useState<File[]>(() => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('os_files_v2');
    return saved ? JSON.parse(saved) : INITIAL_FILES;
  }
  return INITIAL_FILES;
});

// After
const [files, setFiles] = useState<File[]>(() => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('os_files_v2');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load files from localStorage:', error);
    }
  }
  return INITIAL_FILES;
});
```

### 2. 타입 안정성 개선
```typescript
// Before
data?: any;

// After
data?: {
  id?: string;
  name?: string;
  content?: string;
  src?: string;
  url?: string;
  initialPath?: string;
  initialUrl?: string;
};
```

### 3. 성능 최적화
```typescript
// Before
const openFile = (file: File) => { ... };

// After
const openFile = useCallback((file: File) => {
  if (file.type === 'folder') {
    openApp('explorer', { initialPath: file.id, name: file.name });
  } else if (file.type === 'image') {
    openApp('photos', file);
  } else if (file.type === 'web') {
    openApp('edge', { initialUrl: file.url, name: 'Edge' });
  } else {
    openApp('notepad', file);
  }
}, [openApp]);
```

### 4. 커스텀 훅 분리
```typescript
// hooks/useWindowManager.ts
export const useWindowManager = () => {
  const [windows, setWindows] = useState<Window[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  // ... window management logic
  return { windows, activeWindowId, openApp, closeWindow, ... };
};
```

## 📊 우선순위 매트릭스

| 우선순위 | 개선 항목 | 예상 시간 | 영향도 |
|---------|----------|----------|--------|
| 🔴 Critical | 중복 파일 제거 | 5분 | 높음 |
| 🔴 Critical | 에러 처리 | 30분 | 높음 |
| 🔴 Critical | 타입 안정성 | 1시간 | 높음 |
| 🟡 High | 성능 최적화 | 4시간 | 중간 |
| 🟡 High | 코드 구조 | 8시간 | 중간 |
| 🟢 Medium | 기능 완성 | 16시간 | 중간 |
| 🟢 Medium | 접근성 | 8시간 | 낮음 |

## 🎯 결론

전반적으로 잘 구조화된 프로젝트이지만, 다음 영역에서 개선이 필요합니다:
1. **안정성**: 에러 처리 및 타입 안정성 강화
2. **성능**: 불필요한 리렌더링 최소화
3. **유지보수성**: 코드 구조 개선 및 분리
4. **완성도**: 미완성 기능 완료

긴급 사항부터 순차적으로 개선하면 프로덕션 준비가 가능한 수준의 코드가 될 것입니다.

