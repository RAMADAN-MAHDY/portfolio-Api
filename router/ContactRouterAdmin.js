import express from "express";
import notifyAdmin from "../pusher/adminNotification.js";
import Conversation_Schema from '../schema/Conversation.js'
const ContactRouterAdmin = express.Router();

ContactRouterAdmin.post("/", async (req, res) => {
    try {
      const { adminId, userId, messageText } = req.body;
  
      if (!adminId || !userId || !messageText) {
        return res.status(400).json({ error: "جميع الحقول مطلوبة!" });
      }
  
      let conversation = await Conversation_Schema.findOne({ 
          participants: { $all: [adminId, userId] }
      });
  // تعديل وقت انشاء المحادثه   الهدف معرفةاحدث دردشه داخل المحادثه 
      conversation.createdAt = Date.now();
      await conversation.save();

      if (!conversation) {
        return res.status(404).json({ error: "لا توجد محادثة مع هذا المستخدم" });
      }
  
      // إرسال الرسالة عبر Pusher
    
        // إرسال البيانات عبر Pusher
    
      const message = await notifyAdmin(adminId, messageText, conversation._id);
  
      res.status(200).json({ message: "تم بنجاح", data: message });
    } catch (error) {
      console.error("خطأ أثناء إرسال رد الإدمن:", error);
      res.status(500).json({ error: "حدث خطأ أثناء إرسال الرد", details: error.message });
    }
  });
export default ContactRouterAdmin;