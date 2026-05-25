import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const fileSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: [true, 'اسم الملف مطلوب.'],
    trim: true,
    minlength: [3, 'يجب أن لا يقل اسم الملف عن 3 أحرف.'],
    maxlength: [255, 'يجب أن لا يزيد اسم الملف عن 255 حرفًا.']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [3000, 'يجب أن لا يزيد الوصف عن 3000 حرف.'],
    default: ''
  },
  fileKey: {
    type: String,
    required: [true, 'مفتاح الملف مطلوب.'],
    unique: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  },
  fileSize: {
    type: Number,
    required: [true, 'حجم الملف مطلوب.'],
    min: [0, 'يجب أن يكون حجم الملف قيمة موجبة.']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'تصنيف الكتاب مطلوب.']
  },
  author: {
    type: String,
    required: [true, 'اسم المؤلف مطلوب.'],
    trim: true,
    minlength: [3, 'يجب أن لا يقل اسم المؤلف عن 3 أحرف.'],
    maxlength: [100, 'يجب أن لا يزيد اسم المؤلف عن 100 حرف.']
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  coverImageKey: {
    type: String,
    default: ''
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

fileSchema.virtual('fileUrl').get(function() {
  return `${process.env.R2_PUBLIC_URL}/${this.fileKey}`;
});

fileSchema.virtual('coverImageUrl').get(function() {
  if (!this.coverImageKey) return '';
  return `${process.env.R2_PUBLIC_URL}/${this.coverImageKey}`;
});

// إضافة فهارس لتحسين أداء الاستعلامات
fileSchema.index({ fileName: 1 });
fileSchema.index({ category: 1 });
fileSchema.index({ author: 1 });
fileSchema.index({ uploadDate: -1 }); // للترتيب حسب تاريخ الرفع تنازليًا

const File = mongoose.model('File', fileSchema);

export default File;
