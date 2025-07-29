import express from 'express';
import cors from 'cors';
import connectDB from './db.js';
import ContactRouter from './router/ContactRouter.js';
import ContactRouterAdmin from './router/ContactRouterAdmin.js';
import getMessage from './router/getMessage.js'; 
import getConversations from './router/getConversations.js';
import cookieParser from "cookie-parser";
import Dotenv from 'dotenv';
import chatRouter from './router/chat.js';
import getMessageAdmin from './router/getMessageToAdmin.js';
import subscription from './router/save-subscription.js';
import unsubscription from './router/unsubscribe.js';
import sendNotificationToAll from './webpush/sendNotificationToAll.js';
import { getIronSession } from "iron-session";
import AiAsestant from './GEMINI_API/aiChat.js';
import aiTranslate from './GEMINI_API/aiTranslate.js';
import generateWordRouter from './GEMINI_API/generateWordFromText.js';
import uploadRouter from './GEMINI_API/uploadRouter.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

Dotenv.config();

const app = express();
const port = 4000;

//Purpose: To allow the frontend to access the backend
const corsOptions = {
    origin: ['https://ramadan-three.vercel.app' , 'http://localhost:3000', 'https://ramadan-468ptjpbw-ramadans-projects-777f5ec4.vercel.app'],
    optionsSuccessStatus: 200,
    credentials: true
  }
  //corsOptions
  app.use(cors(corsOptions));
connectDB();

app.use(express.json());
app.use(cookieParser());


// إعداد الـ session middleware
app.use(async (req, res, next) => {
    req.session = await getIronSession(req, res, {
        cookieName: "session",
        password: process.env.session_secret_key,
        cookieOptions: {
            secure:false,  // خليها false أثناء التطوير
            httpOnly: true,
            sameSite: "None", // تأكد إنها "lax" وليس "strict"
            maxAge: 60 * 60 * 24 * 30,
        },
    });
    // توليد userId عشوائي إذا لم يوجد
    if (!req.session.userId) {
        req.session.userId = Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
        await req.session.save();
    }
      // تحقق إذا كان هناك تغيير في بيانات الجلسة
      const previousViews = req.session.views || 0; // القيمة السابقة
      req.session.views = previousViews + 1; // تحديث عدد الزيارات
  
      if (req.session.views !== previousViews) {
          // احفظ الجلسة فقط إذا كانت هناك تغييرات فعلية
          await req.session.save();
      }
    
    next();
});
 
  // "production"

// Purpose: To handle the routes for the contact form
app.use('/contact', ContactRouter);
app.use('/admin-reply', ContactRouterAdmin);
app.use('/message', getMessage);
app.use('/getMessageAdmin', getMessageAdmin);
app.use("/conversations", getConversations);
app.use('/chat', chatRouter);
app.use('/unsubscription', unsubscription);
app.use('/subscription', subscription);
app.use('/sendNotificationToAll', sendNotificationToAll);
app.use('/ai', AiAsestant);
app.use('/ai', aiTranslate);
app.use('/ai', generateWordRouter);
app.use('/upload', uploadRouter);

// إعداد محرك القوالب EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Route لعرض صفحة رفع الملفات
app.get('/upload-view', (req, res) => {
  res.render('upload');
});

app.get('/', async (req, res) => {


    if (!req.session.views) {
        req.session.views = 1;
      } else {
        req.session.views++;
      }
      await req.session.save();
      res.send(`عدد زياراتك: ${req.session.views}`);
})

app.get('/dashboard', (req, res) => {
  res.render('dashboard');
});

app.get('/whoami', (req, res) => {
  res.json({ userId: req.session.userId });
});

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`)
})
