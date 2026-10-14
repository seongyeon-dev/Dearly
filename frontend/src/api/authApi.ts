
import axios from "axios";

const API_BASE_URL = import.meta.env.PROD
  ? ""
  : import.meta.env.VITE_API_URL || "http://localhost:3000";

const API_URL = `${API_BASE_URL}/api/auth`;

export interface LoginResponse {
  user: {
    user_id: number;
    email: string;
    nickname: string;
  };
}

export interface SignupRequest {
  email: string;
  password: string;
  nickname: string;
}

export interface SignupResponse {
  message: string;
  user: {
    user_id: number;
    email: string;
    nickname: string;
  };
}

export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  const response = await axios.post<LoginResponse>(
    `${API_URL}/login`,
    {
      email,
      password,
    },
    {
      withCredentials: true,
    },
  );

  return response.data;
}

export async function signup(data: SignupRequest): Promise<SignupResponse> {
  const response = await axios.post<SignupResponse>(
    `${API_URL}/signup`,
    data,
    {
      withCredentials: true,
    },
  );

  return response.data;
}
