import mongoose from 'mongoose';

const AiMessageSchema = new mongoose.Schema({
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "AiSession", required: true },
    role: { type: String, enum: ['user', 'model'], required: true },
    content: { type: String, required: true }, // سيتم تشفيرها في مرحلة لاحقة لو كانت حساسة
    audioUrl: { type: String, default: null }, // للرسائل الصوتية
    isCompressed: { type: Boolean, default: false }, // هل تم ضغطها في الملخص أم لا
    timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

// فهارس لتحسين الأداء
AiMessageSchema.index({ sessionId: 1, timestamp: 1 });

const AiMessage = mongoose.model("AiMessage", AiMessageSchema);
export default AiMessage;
