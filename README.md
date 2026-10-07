# Dearly

나의 취향과 소비를 기록하는 **Wishlist & Budget** 웹 서비스입니다.

## Project

사고 싶은 상품을 한곳에 모아 관리하고,
월별 예산과 실제 소비 내역을 함께 확인할 수 있는 개인 소비 관리 서비스입니다.

상품을 `사고 싶어요 / 고민 중 / 샀어요` 상태로 관리할 수 있으며,
구매한 상품의 실제 구매 금액과 구매 날짜를 기록하여
월별 소비 금액과 카테고리별 소비 현황을 확인할 수 있도록 구성했습니다.

현재 React + TypeScript를 기반으로 프론트엔드를 개발하고 있으며,
추후 Node.js + Express + TypeScript와 MySQL을 연동하여
실제 데이터를 저장하고 관리할 예정입니다.

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- React Router DOM
- Axios
- Lucide React

### Backend
- Node.js
- Express
- TypeScript

### Database
- MySQL

## Project Structure

Dearly/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── routes/
│   │   ├── styles/
│   │   ├── types/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
└── backend/
    └── 개발 예정

## Features

- 로그인 / 회원가입
- 위시리스트 상품 등록 및 관리
- 상품 카테고리 관리
- 상품 상태 관리
  - 사고 싶어요
  - 고민 중
  - 샀어요
- 상품 상세 조회
- 실제 구매 금액 및 구매 날짜 기록
- 월별 예산 관리
- 소비 기록 조회
- 월별 소비 통계
- 카테고리별 소비 통계
- 사용자 프로필 수정
- 프로필 이미지 미리보기

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

## Development

현재 프론트엔드 UI 구현을 완료하고 있으며,
백엔드와 데이터베이스 연동을 진행할 예정입니다.

### Next
- Node.js + Express 서버 구축
- MySQL 데이터베이스 설계 및 연결
- 회원가입 / 로그인 API 구현
- 위시리스트 CRUD API 구현
- 예산 및 소비 기록 API 구현
- React와 REST API 연동
- 배포

## Status

🚧 Development in progress