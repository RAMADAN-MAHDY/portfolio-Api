import express from "express";
import Message_Schema from "../schema/message.js"
const getMessage = express.Router();

getMessage.get("/", async (req, res) => {
    try {
    //   const { conversationId } = req.params;
      const conversationId = req.session.conversationId;
      console.log(conversationId)
      const messages = await Message_Schema.find({ conversationId }).sort({ timestamp: 1 });
  
      res.status(200).json({ messages });
    } catch (error) {
      console.error("خطأ أثناء جلب الرسائل:", error);
      res.status(500).json({ error: "حدث خطأ أثناء جلب الرسائل" });
    }
  });
  
export default getMessage;