import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const uploadDirectory = path.resolve(process.cwd(), "uploads", "wishes");

fs.mkdirSync(uploadDirectory, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    const filename = `${crypto.randomUUID()}${extension}`;

    cb(null, filename);
  },
});

const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];

const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
  },

  fileFilter: (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (
      allowedTypes.includes(file.mimetype) &&
      allowedExtensions.includes(extension)
    ) {
      cb(null, true);
      return;
    }

    cb(new Error("JPG, PNG, WEBP, GIF 이미지만 업로드할 수 있습니다."));
  },
});

export default upload;
