import pusher from "./Pusher.js";
import Message_Schema from "../schema/message.js";
import sendNotificationToAll from "../webpush/sendNotificationToAll.js";

// إرسال رسالة جديدة للأدمن
const notifyAdmin = async (adminId, messageText , conversationId) => {
  try {
    if (!adminId || !messageText) {
      throw new Error("جميع البيانات مطلوبة: adminId, message");
    }

// إنشاء رسالة جديدة
const message = new Message_Schema({
    conversationId,
    sender: adminId, // تحديد المرسل تلقائيًا
    text: messageText,
  });

await message.save();

    const messages = await Message_Schema.find({ conversationId }).sort({ timestamp: 1 });
    const userId = messages[0].sender.toString()
    // إرسال الرسالة إلى Pusher للأدمن
    pusher.trigger(`admin-chat-${adminId}`, "new-message", message);
    pusher.trigger(`chat-${conversationId}`, "new-message", message);
    sendNotificationToAll(userId);
    // console.log("adminId");
    // console.log(adminId);
    return  message ;
  } catch (error) {
    console.error("خطأ أثناء إرسال الرسالة للأدمن:", error);
    throw error;
  }
};

export default notifyAdmin;
