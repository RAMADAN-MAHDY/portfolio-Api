import express from "express";
import { GoogleGenAI } from "@google/genai";
import "dotenv/config";

const router = express.Router();

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// بياناتك العامة
const aboutYou = `
أنا رمضان، مطور ويب  بخبرة قوية في MERN Stack وNext.js وTailwind. express.js وMongoDB.
أحب البرمجة وحل المشكلات، وأعمل على مشاريع متنوعة من مواقع تسويق إلكتروني إلى أنظمة إدارة المدارس.
بحب أدمج الذكاء الاصطناعي في المواقع، وبطور دايمًا في نفسي.
حايلا ابحث عن عمل  كـ مطور ويب  مستقل أو في شركة، وعايز أستخدم مهاراتي في مشاريع جديدة ومثيرة.  
.
`;

// بيانات المشاريع
const projects = [
  {
    id: "project_1",
    title: "موقع تسويق إلكتروني",
    content: "موقع أفيليت يعرض منتجات منزلية وملابس وأجهزة، مبني بـ Next.js، Tailwind، Redux، Express، MongoDB."
  },
  {
    id: "project_2",
    title: "نظام تتبع القصات",
    content: "نظام إدارة وتتبع القصات بمصانع الملابس الصغيرة والمتوسطة، مع لوحة مشرف وأدمن وبحث متقدم."
  },
  {
    id: "project_3",
    title: "سجل الحضور للمدارس",
    content: "نظام إدارة الحضور للمدارس الابتدائية، واجهة عربية، تقارير شهرية وسنوية، ترقية الطلاب تلقائيًا."
  },
  {
    id: "project_4",
    title: "متجر زيت الزيتون",
    content: "متجر إلكتروني لبيع زيت الزيتون مع لوحة تحكم، نظام تقييمات، حماية JWT، تصميم متجاوب."
  }
];

router.post("/ask", async (req, res) => {
  const { question } = req.body;

  if (!question) return res.status(400).json({ error: "السؤال مطلوب" });

  const systemPrompt = `
أنت مساعد رمضان اللي بيعمل بالذكاء الاصطناعي  مخصص للرد على أسئلة تتعلق برمضان ومشاريعه.
بيانات رمضان:
${aboutYou}

مشاريع رمضان:
${JSON.stringify(projects, null, 2)}

التزم بالرد بناءً على هذه البيانات فقط، ولا تضف معلومات من عندك.
لو اتسألت عن شيء غير مذكور، قول "المعلومة دي مش موجودة عندي".
ردودك لازم تكون بالعربية الفصحى البسيطة والمباشرة.
وكمان خليك محنك في الرد كانك بترد من عندك مش بيانات انت حافظها وكمان استخدم الايموجي في ردك خليك احترافي
`;

  try {
  const result = await ai.models.generateContent({
  model: "gemini-2.5-flash",
  contents: [
    { role: "user", parts: [{ text: systemPrompt + "\n\n" + question }] }
  ],
  generationConfig: { maxOutputTokens: 500 }
});

    const answer = result.candidates?.[0]?.content?.parts?.[0]?.text.trim();
    res.json({ answer: answer || "لم أتمكن من العثور على إجابة." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "حدث خطأ أثناء التواصل مع الذكاء الاصطناعي." });
  }
});

export default router;
