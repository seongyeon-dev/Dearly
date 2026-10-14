# Dearly

**나의 취향과 소비를 기록하는 Wishlist & Budget 웹 서비스**

## Project

Dearly는 사고 싶은 상품을 기록하고, 구매 내역과 월별 예산을 함께 관리할 수 있는 개인 소비 관리 웹 서비스입니다.

평소 사고 싶은 상품과 구매한 상품을 따로 관리하는 것이 번거롭다고 느껴, 위시리스트와 소비 기록을 한곳에서 확인할 수 있도록 기획했습니다.

상품을 `사고 싶어요 / 고민 중 / 샀어요` 상태로 관리할 수 있으며, 실제 구매 금액과 날짜를 기록하고 월별 소비 현황을 확인할 수 있도록 구현했습니다.

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- React Router DOM
- Axios
- CSS
- Lucide React

### Backend
- Node.js
- Express
- TypeScript
- REST API
- Express Session

### Database
- MySQL

## Main Features

### 1. 회원 관리
- 회원가입 및 로그인·로그아웃
- 세션 기반 로그인 유지
- 사용자별 데이터 관리
- 닉네임 및 프로필 수정

### 2. 위시리스트 관리
- 상품 등록·조회·수정·삭제 (CRUD)
- 상품 이미지 업로드
- 카테고리별 상품 관리
- 상품 상태 관리 (`사고 싶어요 / 고민 중 / 샀어요`)
- 관심 상품 등록 및 해제
- 상품 정렬 및 필터링

### 3. 구매 및 예산 관리
- 구매 금액 및 구매 날짜 기록
- 구매 내역 조회
- 월별 예산 설정 및 수정
- 예산 대비 소비 금액 확인

### 4. 소비 통계
- 월별 소비 내역 조회
- 카테고리별 소비 현황 확인
- 선택한 월에 등록한 위시 상품 조회

## Implementation

### REST API 및 MySQL 연동

React와 Express 서버를 REST API로 연결하고, MySQL을 사용하여 회원 정보와 위시리스트, 구매 기록, 예산 데이터를 저장하도록 구현했습니다.

### 관심 상품 데이터 관리 개선

기존에는 관심 상품 상태를 브라우저의 localStorage에 저장했지만, MySQL에 저장하도록 변경했습니다.

이를 통해 Home과 Wishlist에서 동일한 관심 상품 상태를 유지할 수 있도록 수정했습니다.

### 사용자별 데이터 관리

Express Session을 사용하여 로그인 상태를 유지하고, 로그인한 사용자 ID를 기준으로 데이터를 조회하도록 구현했습니다.

## Pages

- Home
- Wishlist
- Product Create
- Product Detail
- Purchase History
- Statistics
- Profile
- Login
- Signup

## Project Structure

```text
Dearly/
├── frontend/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── pages/
│       ├── routes/
│       ├── styles/
│       └── types/
└── backend/
    └── src/
        ├── config/
        ├── controllers/
        ├── routes/
        └── services/
```

## Development

React와 TypeScript를 사용하여 화면을 구현하고, Node.js와 Express로 REST API를 개발했습니다.

MySQL을 연동하여 상품과 구매 기록, 예산 데이터를 관리하도록 구현했으며, 기능별 테스트를 진행하면서 발생한 오류를 수정했습니다.

## Status

**주요 기능 구현 완료**

현재 최종 테스트 및 배포 준비 중입니다.