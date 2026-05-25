import Category from '../schema/CategorySchema.js';

// إضافة فئة جديدة
export const addCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    const newCategory = new Category({ name, description });
    await newCategory.save();

    res.status(201).json({ message: 'تمت إضافة الفئة بنجاح.', category: newCategory });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'اسم الفئة موجود بالفعل.' });
    }
    res.status(400).json({ message: error.message });
  }
};

// جلب جميع الفئات
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().lean();
    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// تعديل فئة
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { name, description },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedCategory) {
      return res.status(404).json({ message: 'الفئة غير موجودة.' });
    }

    res.status(200).json({ message: 'تم تحديث الفئة بنجاح.', category: updatedCategory });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'اسم الفئة موجود بالفعل.' });
    }
    res.status(400).json({ message: error.message });
  }
};

// حذف فئة
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedCategory = await Category.findByIdAndDelete(id).lean();

    if (!deletedCategory) {
      return res.status(404).json({ message: 'الفئة غير موجودة.' });
    }

    res.status(200).json({ message: 'تم حذف الفئة بنجاح.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
