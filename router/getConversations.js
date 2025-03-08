import express from "express";
import Conversation_Schema from "../schema/Conversation.js";

const getConversations = express.Router();

getConversations.get("/:adminId", async (req, res) => {
  try {
    const { adminId } = req.params;

    // البحث عن جميع المحادثات التي يكون الإدمن طرفًا فيها
    const conversations = await Conversation_Schema.find({
      participants: { $in: [adminId] }
    }).populate("participants", "full_name email") // إحضار بيانات المستخدمين المشاركين
    .sort({ createdAt: -1 });
    res.status(200).json({ conversations });
  } catch (error) {
    console.error("خطأ أثناء جلب المحادثات:", error);
    res.status(500).json({ error: "حدث خطأ أثناء جلب المحادثات" });
  }
});

export default getConversations;
