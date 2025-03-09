import express from "express";
import sendMessage from "../pusher/sendMessageUser.js";
import Conversation_Schema from '../schema/Conversation.js'
import Dotenv from 'dotenv';


Dotenv.config();



const chatRouter = express.Router();

chatRouter.post("/", async (req, res) => {
    try {
      const conversationId = await req.session.conversationId;
      const userId = await req.session.senderId;
    //   console.log(userId)   
      const { messageText } = req.body;
  
      if (!conversationId) {
        return res.status(400).json({ error: " المحادثه ليست موجوده!" });
      }
  
    let adminId = process.env.adminId;
    // تعديل وقت انشاء المحادثه   الهدف معرفةاحدث دردشه داخل المحادثه
    let conversation = await Conversation_Schema.findOne({
        participants: { $all: [userId, adminId] }
      });

      conversation.createdAt = Date.now();
      
      // إرسال الرسالة عبر Pusher
      const message = await sendMessage(userId, messageText, conversationId , adminId);
      await req.session.save();
      res.status(200).json({ message: "تم إرسال رد  بنجاح", data: message });
    } catch (error) {
      console.error("خطأ أثناء إرسال رد الإدمن:", error);
      res.status(500).json({ error: "حدث خطأ أثناء إرسال الرد", details: error.message });
    }
    
  });
export default chatRouter;