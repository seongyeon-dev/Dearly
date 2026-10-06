import { Camera } from "lucide-react";
import { useState, type ChangeEvent } from "react";

import "./ProfileImage.css";

function ProfileImage() {
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setProfileImage(imageUrl);
  };

  return (
    <div className="profile-edit-image-section">
      <div className="profile-edit-image-wrapper">
        {profileImage ? (
          <img
            src={profileImage}
            alt="프로필 이미지"
            className="profile-edit-image"
          />
        ) : (
          <div className="profile-edit-image-placeholder">🎀</div>
        )}

        <label htmlFor="profile-image" className="profile-edit-image-button">
          <Camera size={18} />

          <input
            id="profile-image"
            type="file"
            accept="image/*"
            className="profile-edit-image-input"
            onChange={handleImageChange}
          />
        </label>
      </div>
    </div>
  );
}

export default ProfileImage;
