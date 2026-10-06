import { useState, type SyntheticEvent } from "react";
import { LockKeyhole, Mail, UserRound } from "lucide-react";
import { Link } from "react-router-dom";

import "./Signup.css";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [nickname, setNickname] = useState("");

  const handleSubmit = (event: SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    console.log({
      email,
      password,
      passwordConfirm,
      nickname,
    });
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

          <button type="submit" className="signup-button">
            회원가입
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
