import type { Request, Response } from "express";
import fs from "fs/promises";
import path from "path";

import {
  getWishImages,
  createWishImage,
  deleteWishImage,
} from "../services/wishImageService";

const MAX_IMAGES = 5;

const parsePositiveId = (value: unknown): number | null => {
  if (typeof value !== "string" || !/^[1-9]\d*$/.test(value)) {
    return null;
  }

  const id = Number(value);

  return Number.isSafeInteger(id) ? id : null;
};

const removeUploadedFile = async (filename: string): Promise<void> => {
  const filePath = path.resolve(process.cwd(), "uploads", "wishes", filename);

  try {
    await fs.unlink(filePath);
  } catch (error) {
    console.error("업로드 파일 정리 실패:", error);
  }
};

export const getWishImagesController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const wishId = parsePositiveId(req.params.wishId);

    if (wishId === null) {
      res.status(400).json({
        message: "올바른 상품 ID를 입력해주세요.",
      });
      return;
    }

    const images = await getWishImages(wishId);

    res.status(200).json({ images });
  } catch (error) {
    console.error("상품 이미지 조회 실패:", error);

    res.status(500).json({
      message: "상품 이미지를 불러오지 못했습니다.",
    });
  }
};

export const createWishImageController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  const uploadedFile = req.file;

  try {
    const wishId = parsePositiveId(req.params.wishId);
    const sortOrder = Number(req.body?.sort_order);

    if (wishId === null) {
      if (uploadedFile) {
        await removeUploadedFile(uploadedFile.filename);
      }

      res.status(400).json({
        message: "올바른 상품 ID를 입력해주세요.",
      });
      return;
    }

    if (!uploadedFile) {
      res.status(400).json({
        message: "업로드할 이미지 파일을 선택해주세요.",
      });
      return;
    }

    if (
      req.body?.sort_order === undefined ||
      req.body?.sort_order === "" ||
      !Number.isInteger(sortOrder) ||
      sortOrder < 1 ||
      sortOrder > MAX_IMAGES
    ) {
      await removeUploadedFile(uploadedFile.filename);

      res.status(400).json({
        message: "이미지 순서는 1부터 5까지 입력해주세요.",
      });
      return;
    }

    const existingImages = await getWishImages(wishId);

    if (existingImages.length >= MAX_IMAGES) {
      await removeUploadedFile(uploadedFile.filename);

      res.status(400).json({
        message: "상품 이미지는 최대 5장까지 등록할 수 있습니다.",
      });
      return;
    }

    if (existingImages.some((image) => image.sort_order === sortOrder)) {
      await removeUploadedFile(uploadedFile.filename);

      res.status(409).json({
        message: "이미 사용 중인 이미지 순서입니다.",
      });
      return;
    }

    const imageUrl = `/uploads/wishes/${uploadedFile.filename}`;

    const imageId = await createWishImage(wishId, imageUrl, sortOrder);

    res.status(201).json({
      message: "상품 이미지가 등록되었습니다.",
      image_id: imageId,
      image_url: imageUrl,
      sort_order: sortOrder,
    });
  } catch (error) {
    if (uploadedFile) {
      await removeUploadedFile(uploadedFile.filename);
    }

    console.error("상품 이미지 등록 실패:", error);

    res.status(500).json({
      message: "상품 이미지를 등록하지 못했습니다.",
    });
  }
};

export const deleteWishImageController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const wishId = parsePositiveId(req.params.wishId);
    const imageId = parsePositiveId(req.params.imageId);

    if (wishId === null || imageId === null) {
      res.status(400).json({
        message: "올바른 상품 ID와 이미지 ID를 입력해주세요.",
      });
      return;
    }

    const images = await getWishImages(wishId);
    const targetImage = images.find((image) => image.image_id === imageId);

    if (!targetImage) {
      res.status(404).json({
        message: "삭제할 상품 이미지를 찾을 수 없습니다.",
      });
      return;
    }

    const deleted = await deleteWishImage(imageId, wishId);

    if (!deleted) {
      res.status(404).json({
        message: "삭제할 상품 이미지를 찾을 수 없습니다.",
      });
      return;
    }

    const prefix = "/uploads/wishes/";

    if (targetImage.image_url.startsWith(prefix)) {
      const filename = targetImage.image_url.slice(prefix.length);

      if (filename && path.basename(filename) === filename) {
        await removeUploadedFile(filename);
      }
    }

    res.status(200).json({
      message: "상품 이미지가 삭제되었습니다.",
    });
  } catch (error) {
    console.error("상품 이미지 삭제 실패:", error);

    res.status(500).json({
      message: "상품 이미지를 삭제하지 못했습니다.",
    });
  }
};
