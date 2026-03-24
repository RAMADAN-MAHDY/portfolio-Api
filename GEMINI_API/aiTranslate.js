import express from "express";
import  fs from "fs";
import path from "path";
import { GoogleGenAI } from "@google/genai";
import extractPagesFromPDF from './extractTexetfromPdf.js';
import dotenv from "dotenv";
import multer from "multer";
import { Document, Packer, Paragraph, TextRun } from "docx";
import FileModel from '../schema/FileSchema.js';
import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';

dotenv.config();

const uploadDir = process.env.NODE_ENV === 'production' ? '/tmp' : './uploads';
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

const router = express.Router();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY, apiVersion: "v1" });

const systemPrompt = `
أنت مترجم محترف. ترجم فقط النص من اللغة الإنجليزية إلى اللغة العربية بدقة وبدون أي تعليقات أو إضافات. لا تفسر، لا توضح، فقط ترجم كما هو.
`;

const runAiTranslation = async (text) => {
    const result = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
            { role: "user", parts: [{ text: systemPrompt + '\n' + text }] }
        ],
        generationConfig: { maxOutputTokens: 1000 }
    });

    return result.candidates?.[0]?.content?.parts?.[0]?.text.trim() || '';
};

const tmpDir = process.env.NODE_ENV === 'production' ? '/tmp' : './tmp';

router.post("/translate", async (req, res) => {
    try {
        const { fileId } = req.body;
        if (!fileId) {
            return res.status(400).json({ error: "يجب إرسال fileId مع الطلب." });
        }
        // جلب بيانات الملف من MongoDB
        const userFile = await FileModel.findOne({ fileId });
        if (!userFile) {
            return res.status(404).json({ error: "لا يوجد ملف بهذا المعرف. إذا رفعت ملف جديد، تأكد أن المتصفح لم يمسح بياناته أو أعد رفع الملف." });
        }
        // استرجاع ملف PDF من GridFS إلى /tmp
        const conn = mongoose.connection;
        const bucket = new GridFSBucket(conn.db, { bucketName: 'pdfs' });
        const gridfsId = new mongoose.Types.ObjectId(userFile.filePath);
        const tempPdfPath = path.join(tmpDir, `${fileId}.pdf`);
        await new Promise((resolve, reject) => {
          const downloadStream = bucket.openDownloadStream(gridfsId);
          const writeStream = fs.createWriteStream(tempPdfPath);
          downloadStream.pipe(writeStream)
            .on('error', reject)
            .on('finish', resolve);
            
        });
        // أكمل الترجمة من الملف المؤقت
        const pages = await extractPagesFromPDF(tempPdfPath);
        const outputFilePath = path.join(tmpDir, `translated_output_${fileId}.txt`);
        // ✅ إيجاد أول صفحتين غير مترجمين لهذا الملف
        let startIndex = null;
        let pageRange = "";
        const donePages = userFile.donePages || [];
        for (let i = 0; i < pages.length; i += 2) {
            const currentRange = `${i + 1}-${i + (pages[i + 1] ? 2 : 1)}`;
            if (!donePages.includes(currentRange)) {
                startIndex = i;
                pageRange = currentRange;
                break;
            }
        }
        if (startIndex === null) {
            return res.json({ message: "✅ جميع الصفحات تم ترجمتها بالفعل.", donePages });
        }
        const page1 = pages[startIndex];
        const page2 = pages[startIndex + 1] || '';
        const combinedText = page1 + '\n' + page2;
        console.log(`⏳ ترجمة الصفحات: ${pageRange}`);
        const translated = await runAiTranslation(combinedText);
        const outputEntry = `--- الصفحات ${pageRange} ---\n${translated}\n\n`;
        fs.appendFileSync(outputFilePath, outputEntry);
        // تحديث donePages لهذا الملف فقط في MongoDB
        userFile.donePages = [...donePages, pageRange];
        await userFile.save();
        // حذف الملف المؤقت بعد الترجمة
        fs.unlinkSync(tempPdfPath);
        res.json({
            message: `✅ تم ترجمة الصفحات ${pageRange}.`,
            translatedPages: pageRange,
            downloadUrl: `/ai/translate/download?fileId=${fileId}`,
            downloadUrlword: `/ai/translate/download-word?fileId=${fileId}`,
        });
    } catch (err) {
        console.error("❌ خطأ أثناء الترجمة:", err, req.body);
        res.status(500).json({ error: "حدث خطأ أثناء الترجمة.", details: err.message });
    }
});

// 🎯 endpoint لتحميل الترجمة
router.get("/translate/download", (req, res) => {
    const { fileId } = req.query;
    if (!fileId) return res.status(400).send("يجب إرسال fileId.");
    const filePath = path.join(tmpDir, `translated_output_${fileId}.txt`);
    if (!fs.existsSync(filePath)) {
        return res.status(404).send("⚠️ ملف الترجمة غير موجود بعد.");
    }
    res.download(filePath, `translated_output_${fileId}.txt`);
});


router.get("/translate/download-word", (req, res) => {
  const { fileId } = req.query;
  if (!fileId) return res.status(400).send("يجب إرسال fileId.");
  const filePath = path.join(tmpDir, `translated_output_${fileId}.docx`);
  if (!fs.existsSync(filePath)) return res.status(404).send("⚠️ ملف وورد غير موجود.");
  res.download(filePath, `translated_output_${fileId}.docx`);
});

// Endpoint لإنشاء ملف Word من الترجمة النصية
router.post("/translate/generate-word", async (req, res) => {
  try {
    const { fileId } = req.body;
    if (!fileId) return res.status(400).json({ error: "يجب إرسال fileId." });
    const textPath = path.join(tmpDir, `translated_output_${fileId}.txt`);
    const wordPath = path.join(tmpDir, `translated_output_${fileId}.docx`);
    if (!fs.existsSync(textPath)) {
      return res.status(404).json({ error: "⚠️ ملف الترجمة النصية غير موجود." });
    }
    const translatedText = fs.readFileSync(textPath, "utf-8");
    const doc = new Document({
      sections: [{
        properties: {},
        children: translatedText
          .split('\n')
          .map(line => new Paragraph({ children: [new TextRun(line)] }))
      }]
    });
    const buffer = await Packer.toBuffer(doc);
    fs.writeFileSync(wordPath, buffer);
    return res.json({
      message: "✅ تم توليد ملف Word بنجاح.",
      downloadUrl: `/ai/translate/download-word?fileId=${fileId}`
    });
  } catch (err) {
    console.error("❌ خطأ أثناء توليد ملف Word:", err);
    return res.status(500).json({ error: "حدث خطأ أثناء توليد الملف." });
  }
});

export default router;
