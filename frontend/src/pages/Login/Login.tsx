import { useState, type SyntheticEvent } from "react";
import { Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import { login } from "../../api/authApi";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepLogin, setKeepLogin] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setIsLoading(true);

    try {
      await login(email.trim(), password);

      navigate("/", { replace: true });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(
          typeof error.response?.data?.message === "string"
            ? error.response.data.message
            : "로그인에 실패했습니다. 이메일과 비밀번호를 확인해주세요.",
        );
      } else {
        setError("로그인 중 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="login">
      <div className="login-card">
        <div className="login-logo">
          <h1>Dearly</h1>
          <p>Wishlist & Budget</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label htmlFor="login-email">이메일</label>

            <div className="login-input-wrapper">
              <Mail className="login-input-icon" size={20} />

              <input
                id="login-email"
                type="email"
                value={email}
                placeholder="이메일을 입력해주세요."
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="login-field">
            <label htmlFor="login-password">비밀번호</label>

            <div className="login-input-wrapper">
              <LockKeyhole className="login-input-icon" size={20} />

              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                value={password}
                placeholder="비밀번호를 입력해주세요."
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />

              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="login-options">
            <label className="login-keep">
              <input
                type="checkbox"
                checked={keepLogin}
                onChange={(event) => setKeepLogin(event.target.checked)}
              />

              <span className="login-checkbox" />

              <span>로그인 상태 유지</span>
            </label>

            <button type="button" className="login-find-password">
              비밀번호를 잊으셨나요?
            </button>
          </div>

          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="login-submit-button"
            disabled={isLoading}
          >
            {isLoading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <div className="login-divider">
          <span />
          <p>또는</p>
          <span />
        </div>

        <div className="login-signup">
          <span>아직 계정이 없으신가요?</span>

          <Link to="/signup">회원가입하기 ›</Link>
        </div>
      </div>
    </main>
  );
}

export default Login;
