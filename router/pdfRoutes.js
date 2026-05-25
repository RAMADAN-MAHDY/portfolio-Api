import express from 'express';
import { addPdf, updatePdf, deletePdf, getPdfDetails, getAllPdfs, getPdfsByCategory, downloadPdf } from '../controllers/pdfController.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

// إضافة ملف PDF جديد (يتطلب رفع ملف PDF، وصورة غلاف اختيارية)
router.post('/', upload.fields([{ name: 'pdfFile', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }]), addPdf);

// تعديل بيانات ملف PDF موجود (يمكن رفع صورة غلاف جديدة)
router.put('/:id', upload.fields([{ name: 'coverImage', maxCount: 1 }]), updatePdf);

// حذف ملف PDF
router.delete('/:id', deletePdf);

// جلب تفاصيل ملف PDF
router.get('/:id', getPdfDetails);

// جلب جميع ملفات PDF مع دعم البحث والتصفية والتقسيم
router.get('/', getAllPdfs);

// جلب ملفات PDF حسب الفئة
router.get('/category/:categoryId', getPdfsByCategory);

// تحميل ملف PDF (تدفق آمن)
router.get('/download/:id', downloadPdf);

export default router;
