import mongoose from 'mongoose';

const AiSessionSchema = new mongoose.Schema({
    userId: { type: String, default: null }, // يدعم ObjectId أو الـ random string من الجلسة
    title: { type: String, default: "New Conversation" },
    summary: { type: String, default: "" }, // التلخيص للذكاء الاصطناعي لتوفير الموارد
    isArchived: { type: Boolean, default: false },
    lastMessageAt: { type: Date, default: Date.now },
    metadata: {
        language: { type: String, default: 'ar' },
        device: { type: String },
        platform: { type: String }
    }
}, { timestamps: true });

// فهارس لتحسين الأداء
AiSessionSchema.index({ userId: 1, lastMessageAt: -1 });
AiSessionSchema.index({ isArchived: 1 });

const AiSession = mongoose.model("AiSession", AiSessionSchema);
export default AiSession;
