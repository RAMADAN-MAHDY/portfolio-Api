import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // صاحب الرسالة
    text: { type: String, required: true }, // نص الرسالة
    timestamp: { type: Date, default: Date.now },
  });


 const message_Schema  = mongoose.model('Message', MessageSchema);

 export default message_Schema;