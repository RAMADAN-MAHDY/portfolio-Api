import express from "express";
import mongoose from "mongoose";
import ContactSchema from "../schema/contact.js";
import sendMessage from "../pusher/sendMessageUser.js";
import Conversation_Schema from "../schema/Conversation.js"; // تأكد من استيراد مخطط المحادثة

const ContactRouter = express.Router();

const adminId = new mongoose.Types.ObjectId("65a123456789abcd12345678");

ContactRouter.post("/", async (req, res) => {
  try {
    const { email, full_name, phone, messageText } = req.body;

    if (!email || !messageText) {
      return res.status(400).json({ error: "جميع الحقول مطلوبة!" });
    }

    // تحويل القيم إلى الأنواع المناسبة
    const emailStr = String(email);
    const fullNameStr = String(full_name);
    const phoneNum = Number(phone);
    const messageTextStr = String(messageText);

    // البحث عن المستخدم
    let findUser = await ContactSchema.findOne({ email: emailStr });

    if (!findUser) {
      findUser = new ContactSchema({ email: emailStr, full_name: fullNameStr, phone: phoneNum });
      await findUser.save();
    }

    const senderId = findUser._id; // الـ ObjectId الخاص بالمستخدم

    // البحث عن المحادثة بين المستخدم والإدمن أو إنشاؤها
    let conversation = await Conversation_Schema.findOne({
      participants: { $all: [senderId, adminId] }
    });
  // تعديل وقت انشاء المحادثه   الهدف معرفةاحدث دردشه داخل المحادثه

    if (!conversation) {
      conversation = new Conversation_Schema({ participants: [senderId, adminId] });
      await conversation.save();
    }
    conversation.createdAt = Date.now();
    await conversation.save();
    // إرسال الرسالة عبر Pusher
    const message = await sendMessage(senderId, messageTextStr, conversation._id ,adminId);

    req.session.conversationId = conversation._id;
    req.session.senderId = senderId;
    await conversation.save();
    res.status(200).json({ message: "تم إرسال الرسالة بنجاح", data: message , Success: true ,conversationId : conversation._id });
  } catch (error) {
    console.error("Error occurred:", error);
    res.status(500).json({ error: "حدث خطأ أثناء إرسال الرسالة", details: error.message });
  }
});

export default ContactRouter;