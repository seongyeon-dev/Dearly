export type User = {
  id: number;
  email: string;
  nickname: string;
  profileImageUrl: string | null;
  introduction: string;
};

export type SignupRequest = {
  email: string;
  password: string;
  nickname: string;
};

export type LoginRequest = {
  email: string;
  password: string;
};
