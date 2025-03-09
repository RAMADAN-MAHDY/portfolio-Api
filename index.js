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
Dotenv.config();

const app = express();
const port = 4000;

//Purpose: To allow the frontend to access the backend
const corsOptions = {
    origin: ['https://ramadan-three.vercel.app' , 'https://ramadan-468ptjpbw-ramadans-projects-777f5ec4.vercel.app'],
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
            secure: process.env.NODE_ENV === "production",  // خليها false أثناء التطوير
            httpOnly: true,
            sameSite: "lax", // تأكد إنها "lax" وليس "strict"
            maxAge: 60 * 60 * 24 * 30,
        },
    });
    await req.session.save(); 
    
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



app.get('/', async (req, res) => {
    if (!req.session.views) {
        req.session.views = 1;
      } else {
        req.session.views++;
      }
      await req.session.save();
      res.send(`عدد زياراتك: ${req.session.views}`);
})

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`)
})
