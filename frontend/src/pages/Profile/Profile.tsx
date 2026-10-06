import { useState, type FormEvent } from "react";

import ProfileImage from "./ProfileImage/ProfileImage";

import "./Profile.css";

function Profile() {
  const [nickname, setNickname] = useState("성연");
  const [introduction, setIntroduction] =
    useState("나의 취향을 기록하는 공간");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    console.log({
      nickname,
      introduction,
    });
  };

  return (
    <main className="profile">
      <div className="profile-container">
        <div className="profile-header">
          <h1>프로필 수정</h1>
          <p>닉네임과 프로필 사진을 수정할 수 있어요.</p>
        </div>

        <form className="profile-form" onSubmit={handleSubmit}>
          <ProfileImage />

          <div className="profile-field">
            <label htmlFor="nickname">닉네임</label>

            <input
              id="nickname"
              type="text"
              value={nickname}
              maxLength={20}
              onChange={(event) => setNickname(event.target.value)}
            />
          </div>

          <div className="profile-field">
            <label htmlFor="introduction">소개</label>

            <div className="profile-introduction">
              <textarea
                id="introduction"
                value={introduction}
                maxLength={50}
                onChange={(event) => setIntroduction(event.target.value)}
              />

              <span className="profile-character-count">
                {introduction.length}/50
              </span>
            </div>
          </div>

          <button type="submit" className="profile-submit-button">
            수정하기
          </button>
        </form>
      </div>
    </main>
  );
}

export default Profile;
