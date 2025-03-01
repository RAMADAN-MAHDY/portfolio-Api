import pusher from "./Pusher.js";
import Message_Schema from "../schema/message.js";

// إرسال رسالة جديدة
const sendMessage = async (senderId, messageText, conversationId ,adminId) => {
  try {
    if (!senderId || !messageText) {
      throw new Error("جميع البيانات مطلوبة: senderId, messageText");
    }

    // إنشاء رسالة جديدة
    const message = new Message_Schema({
      conversationId,
      sender: senderId, 
      text: messageText,
    });

    await message.save();

    // إرسال الرسالة إلى Pusher
    pusher.trigger(`chat-${conversationId}`, "new-message", message);
    pusher.trigger(`admin-chat-${adminId}`, "new-message", message);

    return message;
  } catch (error) {
    console.error("خطأ أثناء إرسال الرسالة:", error);
    throw error;
  }
};

export default sendMessage;
