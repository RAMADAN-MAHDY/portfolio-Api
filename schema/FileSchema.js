import mongoose from 'mongoose';

const FileSchema = new mongoose.Schema({
  fileId: { type: String, required: true, unique: true },
  userId: { type: String },
  filePath: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  donePages: { type: [String], default: [] },
});

export default mongoose.model('File', FileSchema);
