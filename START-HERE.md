# ABIB CALM WEEKEND — BX development

사용자가 수정한 단계별 흐름과 컴포넌트 구조를 기반으로, 무드보드의 대형 제품 컷·물과 유리 질감·포토 스트립을 반영한 버전입니다.

## 실행
Node.js 22.13 이상에서 실행하세요.

```bash
npm install -g pnpm
pnpm install --frozen-lockfile
pnpm dev
```

터미널에 표시되는 로컬 주소를 여세요.

## 주요 파일
- `components/screens/home.tsx`: 캠페인 홈
- `components/screens/label-studio.tsx`: 단계별 라벨 체험
- `components/screens/photo-booth.tsx`: 촬영·프레임·사진 저장
- `components/visuals.tsx`: 제품 입체 미리보기와 사진 인화 모션
- `components/common.tsx`: 공통 레이아웃, 버튼, 선택지, 다이얼로그
- `app/globals.css`: PC·태블릿·모바일 디자인
- `hooks/use-camera.ts`: 카메라 연결 및 해제
- `app/api/moments/route.ts`: Cloudflare R2 저장 API
- `public/images/`: 콘셉트 제품·인물 이미지

## 구현 범위
- 실제 웹캠 촬영, 사진 합성, 다운로드, 기기 공유, QR 저장 링크
- 제품 선택, 라벨 색상 및 문구, 디자인 저장
- 일반적인 루틴 안내
- 체험용 수령 선택이며 실제 제작·배송·문자 발송은 연결되지 않았습니다.
- 새 캠페인 컷과 인물 사진은 AI로 제작한 콘셉트 이미지입니다.
- 제품 입체감은 이미지에 원근과 기울임을 적용하는 방식이며 360도 3D 모델은 아닙니다.

## 실행 환경
카메라는 localhost 또는 HTTPS에서 권한을 허용해야 사용할 수 있습니다.
운영 저장에는 Cloudflare R2의 `BUCKET` 바인딩이 필요합니다.
링크 만료 검사는 24시간 후 접근을 막고 해당 접근 시 객체를 지웁니다. 실제 24시간 자동 삭제 운영에는 R2 lifecycle 설정이 별도로 필요합니다.
`.openai/hosting.json`의 프로젝트 식별자는 기존 사이트와 연결되어 있습니다.

## 확인 상태
TypeScript 검사 및 프로덕션 빌드 통과. 브라우저의 실제 촬영·기기 공유·QR 교차 기기 사용은 별도 확인이 필요합니다.
