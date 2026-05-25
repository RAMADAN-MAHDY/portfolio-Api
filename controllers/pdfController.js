import File from '../schema/FileSchema.js';
import Category from '../schema/CategorySchema.js';
import { uploadFile, deleteFile } from '../services/r2Service.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// إضافة ملف PDF جديد
export const addPdf = async (req, res) => {
  try {
    if (!req.files?.pdfFile) {
      return res.status(400).json({ message: 'لم يتم رفع أي ملف PDF. يرجى التأكد من اختيار ملف PDF.' });
    }

    const { fileName, description, category, author, isPublished } = req.body;

    const existingCategory = await Category.findById(category);
    if (!existingCategory) {
      return res.status(404).json({ message: 'الفئة المحددة غير موجودة.' });
    }

    const pdfFile = req.files.pdfFile[0];
    const pdfUniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}-${pdfFile.originalname}`;
    const fileKey = await uploadFile(pdfFile.buffer, pdfUniqueName, pdfFile.mimetype, 'pdfs');

    let coverImageKey = '';
    if (req.files?.coverImage) {
      const coverFile = req.files.coverImage[0];
      const coverUniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}-${coverFile.originalname}`;
      coverImageKey = await uploadFile(coverFile.buffer, coverUniqueName, coverFile.mimetype, 'covers');
    }

    const newFile = new File({
      fileName,
      description,
      fileKey,
      fileSize: pdfFile.size,
      category,
      author,
      isPublished: isPublished === 'true',
      coverImageKey
    });

    await newFile.save();

    res.status(201).json({ message: 'تمت إضافة ملف PDF بنجاح.', file: newFile });
  } catch (error) {
    console.error('Error adding PDF:', error);
    if (error instanceof mongoose.Error.ValidationError) {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'خطأ في التحقق من الصحة:', errors });
    }
    res.status(500).json({ message: error.message || 'فشل إضافة ملف PDF.' });
  }
};

// تعديل بيانات ملف PDF موجود
export const updatePdf = async (req, res) => {
  try {
    const { id } = req.params;
    const { fileName, description, category, author, isPublished } = req.body;

    const existingFile = await File.findById(id);
    if (!existingFile) {
      return res.status(404).json({ message: 'ملف PDF غير موجود.' });
    }

    if (category && category !== existingFile.category.toString()) {
      const existingCategory = await Category.findById(category);
      if (!existingCategory) {
        return res.status(404).json({ message: 'الفئة المحددة غير موجودة.' });
      }
    }

    const updateData = { fileName, description, category, author, isPublished };

    if (req.files?.coverImage) {
      if (existingFile.coverImageKey) {
        await deleteFile(existingFile.coverImageKey);
      }

      const coverFile = req.files.coverImage[0];
      const coverUniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}-${coverFile.originalname}`;
      updateData.coverImageKey = await uploadFile(coverFile.buffer, coverUniqueName, coverFile.mimetype, 'covers');
    }

    const updatedFile = await File.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({ message: 'تم تحديث بيانات ملف PDF بنجاح.', file: updatedFile });
  } catch (error) {
    console.error('Error updating PDF:', error);
    if (error instanceof mongoose.Error.ValidationError) {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ message: 'خطأ في التحقق من الصحة:', errors });
    }
    res.status(500).json({ message: error.message || 'فشل تحديث ملف PDF.' });
  }
};

// حذف ملف PDF من R2 وسجلاته من MongoDB
export const deletePdf = async (req, res) => {
  try {
    const { id } = req.params;

    const existingFile = await File.findById(id);
    if (!existingFile) {
      return res.status(404).json({ message: 'ملف PDF غير موجود.' });
    }

    await deleteFile(existingFile.fileKey);

    if (existingFile.coverImageKey) {
      await deleteFile(existingFile.coverImageKey);
    }

    await File.findByIdAndDelete(id);

    res.status(200).json({ message: 'تم حذف ملف PDF بنجاح.' });
  } catch (error) {
    console.error('Error deleting PDF:', error);
    res.status(500).json({ message: error.message || 'فشل حذف ملف PDF.' });
  }
};

// جلب تفاصيل كتاب PDF
export const getPdfDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const file = await File.findById(id).populate('category');

    if (!file) {
      return res.status(404).json({ message: 'ملف PDF غير موجود.' });
    }

    res.status(200).json( file);
  } catch (error) {
    console.error('Error getting PDF details:', error);
    res.status(500).json({ message: error.message || 'فشل جلب تفاصيل ملف PDF.' });
  }
};

// جلب جميع ملفات PDF مع دعم البحث والتصفية والتقسيم
export const getAllPdfs = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const query = {};

    if (search) {
      query.$or = [
        { fileName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } }
      ];
    }

    if (category) {
      const categoryDoc = await Category.findOne({ $or: [{ _id: category }, { name: category }] });
      if (categoryDoc) {
        query.category = categoryDoc._id;
      } else {
        return res.status(404).json({ message: 'الفئة المحددة غير موجودة.' });
      }
    }

    const files = await File.find(query)
      .populate('category')
      .sort({ uploadDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalFiles = await File.countDocuments(query);

    res.status(200).json({
      files,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalFiles / parseInt(limit)),
      totalFiles
    });
  } catch (error) {
    console.error('Error getting all PDFs:', error);
    res.status(500).json({ message: error.message || 'فشل جلب ملفات PDF.' });
  }
};

// جلب ملفات PDF حسب الفئة
export const getPdfsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const existingCategory = await Category.findById(categoryId);
    if (!existingCategory) {
      return res.status(404).json({ message: 'الفئة المحددة غير موجودة.' });
    }

    const files = await File.find({ category: categoryId })
      .populate('category')
      .sort({ uploadDate: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalFiles = await File.countDocuments({ category: categoryId });

    res.status(200).json({
      files,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalFiles / parseInt(limit)),
      totalFiles
    });
  } catch (error) {
    console.error('Error getting PDFs by category:', error);
    res.status(500).json({ message: error.message || 'فشل جلب ملفات PDF حسب الفئة.' });
  }
};

// تحميل ملف PDF (تدفق آمن)
export const downloadPdf = async (req, res) => {
  try {
    const { id } = req.params;
    const file = await File.findById(id);

    if (!file) {
      return res.status(404).json({ message: 'ملف PDF غير موجود.' });
    }

    const fileUrl = `${process.env.R2_PUBLIC_URL}/${file.fileKey}`;
    res.redirect(fileUrl);
  } catch (error) {
    console.error('Error downloading PDF:', error);
    res.status(500).json({ message: error.message || 'فشل تحميل ملف PDF.' });
  }
};
