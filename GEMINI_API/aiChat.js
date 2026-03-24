import express from "express";
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";
import AiSession from "../schema/AiSession.js";
import AiMessage from "../schema/AiMessage.js";
import { encrypt, decrypt } from "./securityUtils.js";

const router = express.Router();
const ai = new GoogleGenAI(process.env.GEMINI_API_KEY);

const systemBasePrompt = `
أنت مساعد رمضان (Ramadan) الذكي. رمضان مطور ويب خبير في MERN Stack و Next.js.
مهمتك الرد على أسئلة العملاء والزوار بناءً على سياق المحادثة المتاح.
كن محترفاً، ودوداً، واستخدم الإيموجي المناسبة 🚀.
إذا سألك عن شيء لا تعرفه، قل "المعلومة دي مش عندي حالياً لكن ممكن تتوصل مع رمضان مباشرة".
رد دائماً باللغة التي يتحدث بها العميل (عربي/إنجليزي).
`;

// جلب جميع جلسات المستخدم
router.get("/sessions", async (req, res) => {
    try {
        const userId = req.session.userId;
        const sessions = await AiSession.find({ userId, isArchived: false }).sort({ lastMessageAt: -1 });
        res.json(sessions);
    } catch (err) {
        res.status(500).json({ error: "خطأ في جلب الجلسات" });
    }
});

// جلب رسائل جلسة معينة
router.get("/sessions/:sessionId/messages", async (req, res) => {
    try {
        const { sessionId } = req.params;
        const messages = await AiMessage.find({ sessionId }).sort({ timestamp: 1 });
        
        // فك تشفير الرسائل قبل إرسالها للفرونت
        const decryptedMessages = messages.map(msg => ({
            ...msg._doc,
            content: decrypt(msg.content)
        }));
        
        res.json(decryptedMessages);
    } catch (err) {
        res.status(500).json({ error: "خطأ في جلب الرسائل" });
    }
});

// حذف جلسة (أرشفة)
router.delete("/sessions/:sessionId", async (req, res) => {
    try {
        const { sessionId } = req.params;
        await AiSession.findByIdAndUpdate(sessionId, { isArchived: true });
        res.json({ message: "تم حذف الجلسة بنجاح" });
    } catch (err) {
        res.status(500).json({ error: "خطأ في حذف الجلسة" });
    }
});

// السؤال الأساسي
router.post("/ask", async (req, res) => {
    const { question, sessionId: existingSessionId, metadata } = req.body;
    const userId = req.session.userId;

    if (!question) return res.status(400).json({ error: "السؤال مطلوب" });

    try {
        let session;
        if (existingSessionId) {
            session = await AiSession.findById(existingSessionId);
        }

        if (!session) {
            session = await AiSession.create({
                userId,
                title: question.substring(0, 30) + "...",
                metadata: metadata || {}
            });
        }

        // حفظ رسالة المستخدم (مشفرة)
        await AiMessage.create({
            sessionId: session._id,
            role: "user",
            content: encrypt(question)
        });

        // جلب سياق المحادثة (آخر 10 رسائل)
        const history = await AiMessage.find({ sessionId: session._id })
            .sort({ timestamp: -1 })
            .limit(10);
        
        const contextMessages = history.reverse().map(msg => ({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: decrypt(msg.content) }]
        }));

        // إضافة الملخص التاريخي إذا وجد
        const fullPrompt = session.summary ? 
            `سياق قديم ملخص: ${session.summary}\n\n${systemBasePrompt}` : 
            systemBasePrompt;

        // استخدام موديل Gemini عبر مكتبة genai الخاصة بالمستخدم
        const result = await ai.models.generateContent({
            model: "gemini-1.5-flash",
            contents: [
                { role: "user", parts: [{ text: fullPrompt }] },
                ...contextMessages
            ],
            generationConfig: { maxOutputTokens: 1000 },
        });

        const responseText = result.candidates?.[0]?.content?.parts?.[0]?.text.trim() || t("Error", "خطأ");

        // حفظ رد الذكاء الاصطناعي (مشفر)
        await AiMessage.create({
            sessionId: session._id,
            role: "model",
            content: encrypt(responseText)
        });

        // تحديث وقت آخر رسالة وعنوان الجلسة لو كانت أول رسالة
        session.lastMessageAt = Date.now();
        await session.save();

        // آلية الضغط والأرشفة (تلقائية لو زادت الرسائل عن 20)
        const messageCount = await AiMessage.countDocuments({ sessionId: session._id });
        if (messageCount > 20 && !session.summary) {
            // طلب تلخيص من الذكاء الاصطناعي لتوفير الموارد مستقبلاً
            const summaryResult = await ai.models.generateContent({
                model: "gemini-1.5-flash",
                contents: [{ role: "user", parts: [{ text: `لخص هذه المحادثة باختصار شديد جداً لاستخدامها كأرشيف سياقي مستقبلي: ${question}\n\n${responseText}` }] }]
            });
            session.summary = summaryResult.candidates?.[0]?.content?.parts?.[0]?.text.trim() || "";
            await session.save();
        }

        res.json({ 
            answer: responseText, 
            sessionId: session._id,
            title: session.title
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "حدث خطأ أثناء التواصل مع الذكاء الاصطناعي." });
    }
});

export default router;
