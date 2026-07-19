# test0719 채널 API 연동 설정

## 접속

- 연동센터: `/channel-connect.html?tenant=test0719`
- 대시보드: `/demo-dashboard.html?tenant=test0719&tier=enterprise`
- 연동센터에서 토큰 인증 후 같은 탭에서 대시보드를 열면 실수집 데이터가 적용됩니다.

## 필수 Vercel 환경변수

```text
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
CHANNEL_CREDENTIALS_KEY=32자 이상의 별도 랜덤 비밀값
TEST0719_CONNECT_TOKEN=test0719 전용 연동 관리 토큰
PUBLIC_BASE_URL=https://운영-도메인
CRON_SECRET=Vercel Cron 호출 검증용 랜덤 비밀값
CHANNEL_SYNC_BATCH_SIZE=20
```

`CHANNEL_CREDENTIALS_KEY`를 잃으면 기존 자격증명을 복호화할 수 없습니다. 운영 중 값을 변경하려면 별도 키 마이그레이션이 필요합니다.

## 구현 범위

| 채널 | 인증 | 연결 테스트 | 수집 |
|---|---|---|---|
| Cafe24 | OAuth 2.0 | 토큰 scope 조회 | 주문 |
| 네이버 스마트스토어 | Client Credentials + bcrypt 전자서명 | 토큰 발급 | 변경 주문 |
| 쿠팡 Wing | HMAC-SHA256 | 반품지 조회 | 주문서 |
| 에이블리 | 파트너 Bearer Token | 계약 문서의 테스트 경로 | 계약 문서의 주문 경로 |
| 사방넷 풀필먼트 2.0 | HMAC-SHA256 | 재고 조회 | 재고 |

에이블리는 공개 REST API 명세가 없으므로 셀러 Token만으로는 직접 연동할 수 없습니다. 계약 후 제공받은 Base URL, 연결 확인 경로, 주문 조회 경로를 연동센터에 입력해야 합니다.

사방넷은 일반 사방넷과 **사방넷 풀필먼트 API 2.0**을 구분해야 합니다. 현재 커넥터는 공식 공개 명세가 확인되는 풀필먼트 API 2.0(`napi.sbfulfillment.co.kr`) 기준입니다.

## 외부 콘솔 선행 작업

1. Cafe24 앱에 `https://운영-도메인/api/channel-oauth-callback` Redirect URI와 주문·상품·상점 읽기 scope를 등록합니다.
2. 네이버 커머스 API 앱을 승인받고, 대행사 방식이면 판매자가 API 대행사를 선택한 뒤 `account_id`를 전달해야 합니다.
3. 쿠팡 Wing OpenAPI 발급 화면에 실제 호출 서버의 고정 IP를 등록합니다.
4. 사방넷 풀필먼트 API 키 화면에 실제 호출 서버의 고정 IP를 등록합니다.
5. Vercel 기본 Serverless outbound IP는 고정되지 않을 수 있으므로 IP 제한 채널은 Static IP/NAT가 있는 실행 환경이 필요합니다.

## 저장 구조

- `channel_connections`: AES-256-GCM 암호화 자격증명과 연결 상태
- `normalized_orders`: 채널 공통 주문 스키마
- `normalized_inventory`: 채널 공통 재고 스키마

브라우저와 상태 조회 응답에는 저장된 Secret/Token 원문을 다시 반환하지 않습니다.

공개 `GET /api/tenants?id=`는 대시보드용 allowlist 필드만 반환하며 `intakeToken`·연락처·세금정보는 제외합니다. 공개 `GET /api/intake?token=`도 API 시크릿을 마스킹합니다.

## 동기화

- 연동센터의 `저장값 즉시 동기화`
- Vercel Cron `/api/channel-sync-cron`: 매일 00:00 UTC

운영 트래픽에 따라 Cron 주기와 `CHANNEL_SYNC_BATCH_SIZE`를 조정하십시오. 채널별 호출 제한을 피하기 위해 무제한 병렬 호출은 사용하지 않습니다.
