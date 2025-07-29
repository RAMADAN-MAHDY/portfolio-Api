import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import FileModel from '../schema/FileSchema.js';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "./uploads";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });
const router = express.Router();

// Endpoint to upload PDF file
router.post("/upload-pdf", upload.single("pdfFile"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "يرجى رفع ملف PDF." });
    }

    const filePath = req.file.path;
    const userId = req.session?.userId;
    const fileId = Date.now().toString(36) + Math.random().toString(36).substring(2, 10);

    // حفظ البيانات في MongoDB
    const fileDoc = await FileModel.create({
      fileId,
      userId,
      filePath,
      uploadedAt: new Date(),
      donePages: [],
    });

    res.status(200).json({
      message: "✅ تم رفع الملف بنجاح.",
      filePath,
      fileId,
    });
  } catch (error) {
    console.error("❌ خطأ أثناء رفع الملف:", error);
    res.status(500).json({ error: "حدث خطأ أثناء رفع الملف." });
  }
});

export default router;
