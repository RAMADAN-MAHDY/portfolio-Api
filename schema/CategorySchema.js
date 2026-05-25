import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'اسم الفئة مطلوب.'],
    trim: true,
    unique: true,
    minlength: [3, 'يجب أن لا يقل اسم الفئة عن 3 أحرف.'],
    maxlength: [50, 'يجب أن لا يزيد اسم الفئة عن 50 حرفًا.']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'يجب أن لا يزيد الوصف عن 200 حرفًا.']
  }
}, {
  timestamps: true
});

// إضافة فهرس لتحسين أداء الاستعلامات على اسم الفئة
// categorySchema.index({ name: 1 });


const Category = mongoose.model('Category', categorySchema);

export default Category;
