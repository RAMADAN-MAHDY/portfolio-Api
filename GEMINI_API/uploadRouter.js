import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";

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
router.post("/upload-pdf", upload.single("pdfFile"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "يرجى رفع ملف PDF." });
    }

    const filePath = req.file.path;
    const userId = req.session?.userId; // ربط الملف بالمستخدم

    // توليد fileId فريد لكل ملف PDF
    const fileId = Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
    const metadata = {
      fileId,
      userId,
      filePath,
      uploadedAt: new Date(),
      donePages: [], // خاصية تتبع الصفحات المترجمة لهذا الملف
    };

    // Example: Save metadata to a JSON file (replace with DB logic if needed)
    const metadataFile = path.resolve("./uploads/metadata.json");
    const existingMetadata = fs.existsSync(metadataFile)
      ? JSON.parse(fs.readFileSync(metadataFile))
      : [];
    existingMetadata.push(metadata);
    fs.writeFileSync(metadataFile, JSON.stringify(existingMetadata, null, 2));

    res.status(200).json({
      message: "✅ تم رفع الملف بنجاح.",
      filePath,
      fileId, // إرجاع fileId للفرونت
    });
  } catch (error) {
    console.error("❌ خطأ أثناء رفع الملف:", error);
    res.status(500).json({ error: "حدث خطأ أثناء رفع الملف." });
  }
});

export default router;
