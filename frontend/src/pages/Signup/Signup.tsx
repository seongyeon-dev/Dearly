import { useState, type SyntheticEvent } from "react";
import { LockKeyhole, Mail, UserRound } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

import { signup } from "../../api/authApi";
import "./Signup.css";

function Signup() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");

    if (password !== passwordConfirm) {
      setError("비밀번호가 일치하지 않습니다.");
      return;
    }

    const passwordPattern = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/;

    if (!passwordPattern.test(password)) {
      setError(
        "비밀번호는 영문, 숫자, 특수문자를 포함해 8자 이상이어야 합니다.",
      );
      return;
    }

    const trimmedNickname = nickname.trim();

    if (trimmedNickname.length < 2 || trimmedNickname.length > 10) {
      setError("닉네임은 2자 이상 10자 이하로 입력해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      await signup({
        email: email.trim(),
        password,
        nickname: trimmedNickname,
      });

      navigate("/login", { replace: true });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(
          typeof error.response?.data?.message === "string"
            ? error.response.data.message
            : "회원가입에 실패했습니다.",
        );
      } else {
        setError("회원가입 중 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="signup">
      <div className="signup-card">
        <div className="signup-logo">
          <h1>Dearly</h1>
          <p>Wishlist & Budget</p>
        </div>

        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="signup-field">
            <label htmlFor="email">이메일</label>

            <div className="signup-input-wrapper">
              <Mail className="signup-input-icon" size={20} />

              <input
                id="email"
                type="email"
                value={email}
                placeholder="이메일을 입력해주세요."
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <span className="signup-helper">이메일 형식으로 입력해주세요.</span>
          </div>

          <div className="signup-field">
            <label htmlFor="password">비밀번호</label>

            <div className="signup-input-wrapper">
              <LockKeyhole className="signup-input-icon" size={20} />

              <input
                id="password"
                type="password"
                value={password}
                placeholder="비밀번호를 입력해주세요."
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>

            <span className="signup-helper">
              영문, 숫자, 특수문자 포함 8자 이상
            </span>
          </div>

          <div className="signup-field">
            <label htmlFor="passwordConfirm">비밀번호 확인</label>

            <div className="signup-input-wrapper">
              <LockKeyhole className="signup-input-icon" size={20} />

              <input
                id="passwordConfirm"
                type="password"
                value={passwordConfirm}
                placeholder="비밀번호를 다시 입력해주세요."
                onChange={(event) => setPasswordConfirm(event.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          <div className="signup-field">
            <label htmlFor="nickname">닉네임</label>

            <div className="signup-input-wrapper">
              <UserRound className="signup-input-icon" size={20} />

              <input
                id="nickname"
                type="text"
                value={nickname}
                placeholder="닉네임을 입력해주세요."
                minLength={2}
                maxLength={10}
                onChange={(event) => setNickname(event.target.value)}
                required
              />
            </div>

            <span className="signup-helper">2자 이상 10자 이하</span>
          </div>

          {error && (
            <p className="signup-error" role="alert">
              {error}
            </p>
          )}

          <button type="submit" className="signup-button" disabled={isLoading}>
            {isLoading ? "가입 중..." : "회원가입"}
          </button>
        </form>

        <div className="signup-divider">
          <span />
          <p>또는</p>
          <span />
        </div>

        <div className="signup-login">
          <span>이미 계정이 있으신가요?</span>
          <Link to="/login">로그인하기 ›</Link>
        </div>
      </div>
    </main>
  );
}

export default Signup;
