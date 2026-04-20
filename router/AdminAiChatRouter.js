import express from "express";
import AiSession from "../schema/AiSession.js";
import AiMessage from "../schema/AiMessage.js";
import { decrypt } from "../GEMINI_API/securityUtils.js";
import "dotenv/config";

const AdminAiChatRouter = express.Router();

/**
 * Middleware للتحقق من كلمة مرور الأدمن لضمان الأمان.
 * يتم التحقق من كلمة المرور من خلال الـ Headers باسم 'x-admin-password' أو الـ query params 'pass'.
 */
const adminAuth = (req, res, next) => {
    const providedPassword = req.headers['x-admin-password'] || req.query.pass;
    const SECRET_ADMIN_PASS = process.env.ADMIN_AI_PASS;

    if (providedPassword === SECRET_ADMIN_PASS) {
        next();
    } else {
        return res.status(401).json({ 
            success: false, 
            message: "Authentication failed. Invalid admin password." 
        });
    }
};

/**
 * @route   GET /admin/ai-chat/sessions
 * @desc    جلب قائمة بجميع جلسات الـ AI مع نظام ترقيم صفحات (Pagination) لأداء عالي.
 */
AdminAiChatRouter.get("/sessions", adminAuth, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        // جلب الجلسات مع ترتيب تنازلي حسب آخر رسالة لضمان ظهور أحدث المحادثات أولاً.
        const sessions = await AiSession.find()
            .sort({ lastMessageAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean(); // استخدام lean لتقليل استهلاك الذاكرة وزيادة السرعة بشكل كبير في الطلبات الكبيرة.

        const total = await AiSession.countDocuments();

        res.json({
            success: true,
            data: {
                sessions,
                pagination: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (error) {
        console.error("Error fetching AI sessions for admin:", error);
        res.status(500).json({ success: false, message: "حدث خطأ أثناء جلب الجلسات." });
    }
});

/**
 * @route   GET /admin/ai-chat/sessions/:sessionId/messages
 * @desc    جلب جميع الرسائل داخل جلسة معينة مع فك التشفير التلقائي لكل رسالة.
 */
AdminAiChatRouter.get("/sessions/:sessionId/messages", adminAuth, async (req, res) => {
    try {
        const { sessionId } = req.params;

        // التحقق من وجود الجلسة لضمان صحة البيانات المطلوبة.
        const session = await AiSession.findById(sessionId).lean();
        if (!session) {
            return res.status(404).json({ success: false, message: "الجلسة غير موجودة." });
        }

        // جلب جميع الرسائل الخاصة بالجلسة مرتبة زمنياً من الأقدم للأحدث.
        const messages = await AiMessage.find({ sessionId })
            .sort({ timestamp: 1 })
            .lean();

        // فك تشفير المحتوى قبل إرسال البيانات للأدمن لضمان الخصوصية وسهولة القراءة.
        const decryptedMessages = messages.map(msg => ({
            ...msg,
            content: decrypt(msg.content)
        }));

        res.json({
            success: true,
            data: {
                session,
                messages: decryptedMessages
            }
        });
    } catch (error) {
        console.error("Error fetching AI messages for admin:", error);
        res.status(500).json({ success: false, message: "حدث خطأ أثناء جلب الرسائل." });
    }
});

/**
 * @route   DELETE /admin/ai-chat/sessions/:sessionId
 * @desc    حذف جلسة كاملة مع جميع رسائلها نهائياً (مخصص للأدمن فقط).
 */
AdminAiChatRouter.delete("/sessions/:sessionId", adminAuth, async (req, res) => {
    try {
        const { sessionId } = req.params;

        // حذف الجلسة والرسائل المرتبطة بها دفعة واحدة.
        await AiSession.findByIdAndDelete(sessionId);
        await AiMessage.deleteMany({ sessionId });

        res.json({
            success: true,
            message: "تم حذف المحادثة وجميع الرسائل المرتبطة بها بنجاح."
        });
    } catch (error) {
        console.error("Error deleting AI session:", error);
        res.status(500).json({ success: false, message: "حدث خطأ أثناء حذف المحادثة." });
    }
});

export default AdminAiChatRouter;
