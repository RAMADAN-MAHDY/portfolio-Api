import express from "express";
import Message_Schema from "../schema/message.js"
const getMessageAdmin = express.Router();

getMessageAdmin.get("/:conversationId", async (req, res) => {
    try {
      const { conversationId } = req.params;
      const messages = await Message_Schema.find({ conversationId }).sort({ timestamp: 1 });
  
      res.status(200).json({ messages });
    } catch (error) {
      console.error("خطأ أثناء جلب الرسائل:", error);
      res.status(500).json({ error: "حدث خطأ أثناء جلب الرسائل" });
    }
  });
  
export default getMessageAdmin;